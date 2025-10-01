import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

// Define the expected payload structure
interface SaucePayload {
  brand: string;
  name: string;
  ingredients: string;
  allergens: string;
  category: string;
  address: string;
  email: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const payload: SaucePayload = await req.json();

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
    const { data: sauce, error: sauceError } = await supabaseAdmin
      .from('sauces')
      .insert({
        supplier_id: supplier.id,
        name: payload.name,
        ingredients: payload.ingredients,
        allergens: payload.allergens,
        category: payload.category,
        status: 'registered',
      })
      .select('id')
      .single();

    if (sauceError) throw sauceError;

    // 3. Generate and update QR code URL
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${sauce.id}&size=200x200`;

    const { error: qrUpdateError } = await supabaseAdmin
      .from('sauces')
      .update({ qr_code_url: qrCodeUrl })
      .eq('id', sauce.id);

    if (qrUpdateError) throw qrUpdateError;


    return new Response(JSON.stringify({
      success: true,
      sauce_id: sauce.id,
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
