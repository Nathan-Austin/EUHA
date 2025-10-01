import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'https://esm.sh/stripe@11.1.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
  httpClient: Stripe.createFetchHttpClient(),
  apiVersion: '2023-10-16',
});

const supabaseAdmin = createClient(
  Deno.env.get('PROJECT_URL') ?? '',
  Deno.env.get('SERVICE_ROLE_KEY') ?? ''
);

Deno.serve(async (req) => {
  const signature = req.headers.get('Stripe-Signature');
  const body = await req.text();
  let event: Stripe.Event;

  try {
    event = await stripe.webhooks.constructEventAsync(
      body,
      signature!,
      Deno.env.get('STRIPE_WEBHOOK_SIGNING_SECRET')!
    );
  } catch (err) {
    return new Response(err.message, { status: 400 });
  }

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const metadata = session.metadata ?? {};

      if (metadata.type === 'judge') {
        const judgeId = metadata.judge_id ?? session.client_reference_id;

        if (!judgeId) {
          throw new Error('Missing judge identifier in checkout session');
        }

        const { error } = await supabaseAdmin
          .from('judges')
          .update({
            stripe_payment_status: 'succeeded',
            active: true,
          })
          .eq('id', judgeId);

        if (error) {
          throw error;
        }
      } else if (metadata.type === 'supplier') {
        const paymentId = metadata.payment_id;

        if (!paymentId) {
          throw new Error('Missing supplier payment identifier in checkout session');
        }

        const { error } = await supabaseAdmin
          .from('supplier_payments')
          .update({
            stripe_payment_status: 'succeeded',
          })
          .eq('id', paymentId);

        if (error) {
          throw error;
        }
      }
    }

    return new Response(JSON.stringify({ received: true }), { status: 200 });
  } catch (err) {
    return new Response(err.message, { status: 500 });
  }
});
