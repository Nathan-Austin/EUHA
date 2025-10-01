import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

// Define the expected payload structure
interface SaucePayload {
  name: string;
  ingredients: string;
  allergens: string;
  category: string;
  imagePath?: string;
}

interface SupplierIntakePayload {
  brand: string;
  contactName?: string;
  address: string;
  email: string;
  sauces: SaucePayload[];
}

const BASE_PRICE_CENTS = 50_00;
const SAUCE_IMAGE_BUCKET = Deno.env.get('SAUCE_IMAGE_BUCKET') ?? 'sauce-media';

const DISCOUNT_BANDS: { min: number; max: number; discount: number }[] = [
  { min: 1, max: 1, discount: 0 },
  { min: 2, max: 2, discount: 0.03 },
  { min: 3, max: 3, discount: 0.05 },
  { min: 4, max: 4, discount: 0.07 },
  { min: 5, max: 5, discount: 0.09 },
  { min: 6, max: 6, discount: 0.12 },
  { min: 7, max: 10, discount: 0.13 },
  { min: 11, max: 20, discount: 0.14 },
  { min: 21, max: 100, discount: 0.16 },
];

function resolveDiscount(entryCount: number) {
  const band = DISCOUNT_BANDS.find((tier) => entryCount >= tier.min && entryCount <= tier.max);
  return band ? band.discount : DISCOUNT_BANDS[DISCOUNT_BANDS.length - 1].discount;
}

Deno.serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const payload: SupplierIntakePayload = await req.json();

    if (!payload.sauces || payload.sauces.length === 0) {
      throw new Error('At least one sauce entry is required.');
    }

    // Initialize Supabase client
    const supabaseAdmin = createClient(
      Deno.env.get('PROJECT_URL') ?? '',
      Deno.env.get('SERVICE_ROLE_KEY') ?? ''
    );

    // 1. Upsert supplier
    const { data: supplier, error: supplierError } = await supabaseAdmin
      .from('suppliers')
      .upsert({
        email: payload.email,
        brand_name: payload.brand,
        contact_name: payload.contactName,
        address: payload.address,
      }, { onConflict: 'email' })
      .select()
      .single();

    if (supplierError) throw supplierError;

    // 2. Upsert supplier AS A JUDGE
    const { error: judgeError } = await supabaseAdmin
      .from('judges')
      .upsert({
        email: payload.email,
        type: 'supplier',
        active: true // Suppliers are automatically active judges
      }, { onConflict: 'email' });

    if (judgeError) throw judgeError;

    // 3. Insert new sauce
    const sauceRows = payload.sauces.map((sauce) => ({
      supplier_id: supplier.id,
      name: sauce.name,
      ingredients: sauce.ingredients,
      allergens: sauce.allergens,
      category: sauce.category,
      status: 'registered',
    }));

    const { data: sauces, error: sauceError } = await supabaseAdmin
      .from('sauces')
      .insert(sauceRows)
      .select('id, name');

    if (sauceError) throw sauceError;
    if (!sauces || sauces.length === 0) {
      throw new Error('No sauces were created for this submission.');
    }

    // Generate QR codes for each sauce
    const sauceIds = sauces.map((row) => row.id);

    const qrUpdates = await Promise.all(
      sauceIds.map((id) => {
        const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${id}&size=200x200`;
        return supabaseAdmin
          .from('sauces')
          .update({ qr_code_url: qrCodeUrl })
          .eq('id', id);
      })
    );

    const qrError = qrUpdates.find((result) => result.error);
    if (qrError?.error) throw qrError.error;

    const entryCount = sauceIds.length;
    const discountRate = resolveDiscount(entryCount);
    const subtotalCents = entryCount * BASE_PRICE_CENTS;
    const discountCents = Math.round(subtotalCents * discountRate);
    const amountDueCents = subtotalCents - discountCents;

    const { data: payment, error: paymentError } = await supabaseAdmin
      .from('supplier_payments')
      .insert({
        supplier_id: supplier.id,
        entry_count: entryCount,
        discount_percent: Number((discountRate * 100).toFixed(2)),
        subtotal_cents: subtotalCents,
        discount_cents: discountCents,
        amount_due_cents: amountDueCents,
      })
      .select('id, entry_count, discount_percent, subtotal_cents, discount_cents, amount_due_cents')
      .single();

    if (paymentError) throw paymentError;

    const { error: saucePaymentLinkError } = await supabaseAdmin
      .from('sauces')
      .update({ payment_id: payment.id })
      .in('id', sauceIds);

    if (saucePaymentLinkError) throw saucePaymentLinkError;

    if (payload.sauces.length !== sauces.length) {
      throw new Error('Mismatch between submitted sauces and stored records.');
    }

    const imageAssignments: Record<string, string> = {};

    for (let index = 0; index < payload.sauces.length; index += 1) {
      const pendingPath = payload.sauces[index]?.imagePath;
      const sauceId = sauces[index]?.id;
      if (!pendingPath || !sauceId) continue;

      const targetPath = `suppliers/${supplier.id}/${sauceId}.webp`;
      const moveResult = await supabaseAdmin.storage
        .from(SAUCE_IMAGE_BUCKET)
        .move(pendingPath, targetPath);

      if (moveResult.error) {
        throw moveResult.error;
      }

      const { error: updateError } = await supabaseAdmin
        .from('sauces')
        .update({ image_path: targetPath })
        .eq('id', sauceId);

      if (updateError) {
        throw updateError;
      }

      imageAssignments[sauceId] = targetPath;
    }

    const decoratedSauces = sauces.map((sauce) => ({
      ...sauce,
      image_path: imageAssignments[sauce.id] ?? null,
    }));


    return new Response(JSON.stringify({
      success: true,
      supplier_id: supplier.id,
      sauces: decoratedSauces,
      payment,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
