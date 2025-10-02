import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'https://esm.sh/stripe@11.1.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
  httpClient: Stripe.createFetchHttpClient(),
  apiVersion: '2023-10-16',
});

const projectUrl = Deno.env.get('PROJECT_URL');
const serviceRoleKey = Deno.env.get('SERVICE_ROLE_KEY');

if (!projectUrl || !serviceRoleKey) {
  console.error('Missing Supabase credentials', {
    hasProjectUrl: !!projectUrl,
    hasServiceRoleKey: !!serviceRoleKey,
  });
}

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

      console.log('Processing checkout.session.completed', {
        sessionId: session.id,
        metadata,
        client_reference_id: session.client_reference_id,
      });

      if (metadata.type === 'judge') {
        const judgeId = metadata.judge_id ?? session.client_reference_id;

        if (!judgeId) {
          console.error('Missing judge identifier in checkout session');
          throw new Error('Missing judge identifier in checkout session');
        }

        console.log('Updating judge payment status', { judgeId });

        const { error } = await supabaseAdmin
          .from('judges')
          .update({
            stripe_payment_status: 'succeeded',
            active: true,
          })
          .eq('id', judgeId);

        if (error) {
          console.error('Failed to update judge', error);
          throw error;
        }

        console.log('Judge payment status updated successfully');
      } else if (metadata.type === 'supplier') {
        const paymentId = metadata.payment_id;

        if (!paymentId) {
          console.error('Missing supplier payment identifier in checkout session');
          throw new Error('Missing supplier payment identifier in checkout session');
        }

        console.log('Updating supplier payment status', { paymentId });

        const { error } = await supabaseAdmin
          .from('supplier_payments')
          .update({
            stripe_payment_status: 'succeeded',
          })
          .eq('id', paymentId);

        if (error) {
          console.error('Failed to update supplier payment', error);
          throw error;
        }

        console.log('Supplier payment status updated successfully');
      } else {
        // No metadata type - might be an old session or test payment
        console.warn('Webhook received payment without valid metadata.type', {
          sessionId: session.id,
          metadata,
        });

        // Still return 200 to acknowledge receipt, but log the issue
        return new Response(
          JSON.stringify({
            received: true,
            warning: 'Payment received but no valid metadata.type found'
          }),
          { status: 200 }
        );
      }
    }

    return new Response(JSON.stringify({ received: true }), { status: 200 });
  } catch (err) {
    console.error('Webhook error:', err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
});
