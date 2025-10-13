import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'https://esm.sh/stripe@11.1.0';
import { corsHeaders } from '../_shared/cors.ts';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
  httpClient: Stripe.createFetchHttpClient(),
  apiVersion: '2023-10-16',
});

const projectUrl = Deno.env.get('PROJECT_URL');
const serviceRoleKey = Deno.env.get('SERVICE_ROLE_KEY');

const supabaseAdmin = createClient(
  projectUrl ?? '',
  serviceRoleKey ?? '',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

const successUrl = Deno.env.get('SUPPLIER_PAYMENT_SUCCESS_URL') ?? 'https://heatawards.eu/payment-success';
const cancelUrl = Deno.env.get('SUPPLIER_PAYMENT_CANCEL_URL') ?? 'https://heatawards.eu/payment-cancelled';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { payment_id, email } = await req.json();

    if (!payment_id || !email) {
      throw new Error('payment_id and email are required');
    }

    const { data: payment, error: paymentError } = await supabaseAdmin
      .from('supplier_payments')
      .select('id, amount_due_cents, entry_count, discount_percent, supplier_id, stripe_payment_status')
      .eq('id', payment_id)
      .single();

    if (paymentError) throw paymentError;
    if (!payment) throw new Error('Payment record not found');

    if (payment.stripe_payment_status === 'succeeded') {
      return new Response(JSON.stringify({ alreadyPaid: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    const { data: supplier, error: supplierError } = await supabaseAdmin
      .from('suppliers')
      .select('brand_name, email')
      .eq('id', payment.supplier_id)
      .single();

    if (supplierError) throw supplierError;
    if (!supplier) throw new Error('Supplier not found');

    const entryLabel = payment.entry_count > 1 ? 'entries' : 'entry';
    const description = `${payment.entry_count} sauce ${entryLabel} (${payment.discount_percent}% discount)`;

    const session = await stripe.checkout.sessions.create({
      customer_email: email,
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: 'EU Hot Sauce Awards Entry',
              description,
            },
            unit_amount: payment.amount_due_cents,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        type: 'supplier',
        payment_id: payment.id,
        supplier_email: supplier.email,
      },
    });

    await supabaseAdmin
      .from('supplier_payments')
      .update({ stripe_session_id: session.id })
      .eq('id', payment.id);

    return new Response(JSON.stringify({ sessionId: session.id, url: session.url }), {
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
