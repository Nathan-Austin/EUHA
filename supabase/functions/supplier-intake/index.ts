import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

// Define the expected payload structure
interface SaucePayload {
  name: string;
  ingredients: string;
  allergens: string;
  category: string;
  webshopLink?: string;
  imagePath?: string;
}

interface SupplierIntakePayload {
  brand: string;
  contactName?: string;
  address: string;
  email: string;
  sauces: SaucePayload[];
}

const BASE_PRICE_CENTS = 5000; // 50.00 EUR
const SAUCE_IMAGE_BUCKET = Deno.env.get('SAUCE_IMAGE_BUCKET') ?? 'sauce-media';

// Category code mappings from the image spreadsheet
const CATEGORY_CODES: Record<string, string> = {
  'Mild Chili Sauce': 'D',
  'Medium Chili Sauce': 'M',
  'Hot Chili Sauce': 'H',
  'Extra Hot Chili Sauce': 'X',
  'Extract Based Chili Sauce': 'E',
  'BBQ Chili Sauce': 'B',
  'Chili Ketchup': 'K',
  'Sweet': 'W',
  'Chili Honey': 'R',
  'Garlic Chili Sauce': 'G',
  'Sambal, Chutney & Pickles': 'C',
  'Chili Oil': 'T',
  'Freestyle': 'F',
  'Asian Style Chili Sauce': 'S',
  'Chili Paste': 'P',
  'Salt & Condiments': 'A',
};

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

  let currentStep = 'initial-request';
  try {
    currentStep = 'parse-payload';
    const payload: SupplierIntakePayload = await req.json();

    if (!payload.sauces || payload.sauces.length === 0) {
      throw new Error('At least one sauce entry is required.');
    }

    const trimmedEmail = payload.email.trim();
    const lookupEmail = trimmedEmail.toLowerCase();

    currentStep = 'init-supabase-client';
    // Initialize Supabase client with service role (bypasses RLS)
    const supabaseAdmin = createClient(
      Deno.env.get('PROJECT_URL') ?? '',
      Deno.env.get('SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // 1. Create or get auth user first (required for login)
    let authUserId: string;
    try {
      currentStep = 'lookup-auth-user';
      // Edge runtime currently lacks auth.admin.getUserByEmail; filter listUsers by email instead.
      const { data: existingUsers, error: listUsersError } = await supabaseAdmin.auth.admin.listUsers({
        page: 1,
        perPage: 1,
        email: lookupEmail,
      });

      if (listUsersError) {
        throw listUsersError;
      }

      const existingUser = existingUsers?.users?.find(
        (user) => user.email?.toLowerCase() === lookupEmail
      );

      if (existingUser) {
        authUserId = existingUser.id;
        console.log(`Auth user already exists: ${trimmedEmail} (ID: ${authUserId})`);
      } else {
        // User doesn't exist, create new auth user
        currentStep = 'create-auth-user';
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
          email: trimmedEmail,
          email_confirm: true, // Auto-confirm so they can log in immediately
          user_metadata: {
            full_name: payload.contactName || payload.brand,
            judge_type: 'supplier',
            brand_name: payload.brand,
            created_via: 'supplier-intake',
            created_at: new Date().toISOString()
          }
        });

        if (authError) {
          // Handle duplicate user error gracefully
          const errorMessage =
            authError instanceof Error
              ? authError.message
              : typeof authError === 'string'
                ? authError
                : JSON.stringify(authError);

          if (errorMessage.includes('User already registered')) {
            console.log('User exists but lookup failed, retrying admin.listUsers lookup...');
            const { data: retryData, error: retryError } = await supabaseAdmin.auth.admin.listUsers({
              page: 1,
              perPage: 1,
              email: lookupEmail,
            });

            if (retryError) {
              throw retryError;
            }

            const retryUser = retryData?.users?.find(
              (user) => user.email?.toLowerCase() === lookupEmail
            );

            if (retryUser) {
              authUserId = retryUser.id;
            } else {
              throw authError;
            }
          } else {
            throw authError;
          }
        } else {
          if (!authData.user) throw new Error('Failed to create auth user');
          authUserId = authData.user.id;
          console.log(`Created new auth user: ${trimmedEmail} (ID: ${authUserId})`);
        }
      }
    } catch (authError: any) {
      console.error('Auth user creation failed:', authError);
      const message =
        authError instanceof Error
          ? authError.message
          : typeof authError === 'string'
            ? authError
            : JSON.stringify(authError);
      throw new Error(`Failed at ${currentStep}: ${message}`);
    }

    // 2. Upsert supplier
    currentStep = 'upsert-supplier';
    const { data: supplier, error: supplierError } = await supabaseAdmin
      .from('suppliers')
      .upsert({
        email: trimmedEmail,
        brand_name: payload.brand,
        contact_name: payload.contactName,
        address: payload.address,
      }, { onConflict: 'email' })
      .select()
      .single();

    if (supplierError) throw supplierError;

    // 3. Upsert supplier AS A JUDGE
    currentStep = 'upsert-judge';
    const { error: judgeError } = await supabaseAdmin
      .from('judges')
      .upsert({
        email: trimmedEmail,
        type: 'supplier',
        active: true, // Suppliers are automatically active judges
        name: payload.contactName || payload.brand,
        stripe_payment_status: 'succeeded' // Suppliers don't pay judge fee
      }, { onConflict: 'email' });

    if (judgeError) throw judgeError;

    // 4. Track participation in current year
    const currentYear = 2026; // Competition year
    currentStep = 'track-judge-participation';
    const { error: participationError } = await supabaseAdmin
      .from('judge_participations')
      .upsert({
        email: trimmedEmail,
        full_name: payload.contactName || payload.brand,
        year: currentYear,
        application_date: new Date().toISOString(),
        judge_type: 'supplier',
        company_affiliation: payload.brand,
        accepted: true, // Suppliers are automatically accepted
        source_channel: 'wordpress'
      }, {
        onConflict: 'email,year'
      });

    if (participationError) {
      console.error('Failed to track judge participation:', participationError);
      // Don't throw - main registration succeeded
    }

    // 5. Track supplier participation
    const sauceCount = payload.sauces.length;
    currentStep = 'track-supplier-participation';
    const { error: supplierParticipationError } = await supabaseAdmin
      .from('supplier_participations')
      .upsert({
        email: trimmedEmail,
        company_name: payload.brand,
        year: currentYear,
        sauce_count: sauceCount,
        participated: true,
        source: 'wordpress'
      }, {
        onConflict: 'email,year'
      });

    if (supplierParticipationError) {
      console.error('Failed to track supplier participation:', supplierParticipationError);
      // Don't throw - main registration succeeded
    }

    // 6. Generate sauce codes and insert new sauces
    const saucesToCreate = [];

    // Track next number per category within this submission to avoid duplicates
    const categoryCounters: Record<string, number> = {};
    currentStep = 'prepare-sauces';

    for (const sauce of payload.sauces) {
      const categoryCode = CATEGORY_CODES[sauce.category];
      if (!categoryCode) {
        throw new Error(`Unknown category: ${sauce.category}`);
      }

      // Only query database once per category
      if (!(categoryCode in categoryCounters)) {
        // Get the highest existing code number for this category
        const { data: existingSauces, error: countError } = await supabaseAdmin
          .from('sauces')
          .select('sauce_code')
          .like('sauce_code', `${categoryCode}%`)
          .order('sauce_code', { ascending: false })
          .limit(1);

        if (countError) throw countError;

        let nextNumber = 1;
        if (existingSauces && existingSauces.length > 0) {
          const lastCode = existingSauces[0].sauce_code;
          const lastNumber = parseInt(lastCode.substring(1), 10);
          nextNumber = lastNumber + 1;
        }

        categoryCounters[categoryCode] = nextNumber;
      }

      const sauceCode = `${categoryCode}${String(categoryCounters[categoryCode]).padStart(3, '0')}`;
      categoryCounters[categoryCode]++;

      saucesToCreate.push({
        supplier_id: supplier.id,
        name: sauce.name,
        ingredients: sauce.ingredients,
        allergens: sauce.allergens,
        category: sauce.category,
        sauce_code: sauceCode,
        status: 'registered',
        webshop_link: sauce.webshopLink || null,
      });
    }

    currentStep = 'insert-sauces';
    const { data: sauces, error: sauceError } = await supabaseAdmin
      .from('sauces')
      .insert(saucesToCreate)
      .select('id, name, sauce_code');

    if (sauceError) throw sauceError;
    if (!sauces || sauces.length === 0) {
      throw new Error('No sauces were created for this submission.');
    }

    // Generate QR codes for each sauce
    const sauceIds = sauces.map((row) => row.id);

    currentStep = 'generate-qr-codes';
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

    currentStep = 'create-payment';
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

    currentStep = 'link-sauce-payment';
    const { error: saucePaymentLinkError } = await supabaseAdmin
      .from('sauces')
      .update({ payment_id: payment.id })
      .in('id', sauceIds);

    if (saucePaymentLinkError) throw saucePaymentLinkError;

    if (payload.sauces.length !== sauces.length) {
      throw new Error('Mismatch between submitted sauces and stored records.');
    }

    currentStep = 'assign-images';
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
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : typeof error === 'string'
          ? error
          : JSON.stringify(error);
    const responseMessage = message.startsWith('Failed at')
      ? message
      : `Failed at ${currentStep}: ${message}`;

    console.error('supplier-intake error', { step: currentStep, error });
    return new Response(JSON.stringify({ error: responseMessage }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
