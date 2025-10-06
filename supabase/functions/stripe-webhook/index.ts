import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'https://esm.sh/stripe@11.1.0';
import { corsHeaders } from '../_shared/cors.ts';

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
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const signature = req.headers.get('Stripe-Signature');
  const body = await req.text();
  let event: Stripe.Event;

  console.log('Webhook received', {
    hasSignature: !!signature,
    hasSecret: !!Deno.env.get('STRIPE_WEBHOOK_SIGNING_SECRET'),
  });

  try {
    // Manual signature verification using Deno's crypto API
    const secret = Deno.env.get('STRIPE_WEBHOOK_SIGNING_SECRET')!;

    if (!signature) {
      throw new Error('No signature provided');
    }

    const sigElements = signature.split(',');
    const timestampElement = sigElements.find((el) => el.startsWith('t='));
    const signatureElement = sigElements.find((el) => el.startsWith('v1='));

    if (!timestampElement || !signatureElement) {
      throw new Error('Invalid signature format');
    }

    const timestamp = timestampElement.split('=')[1];
    const providedSignature = signatureElement.split('=')[1];

    // Create the signed payload
    const payload = `${timestamp}.${body}`;

    // Compute expected signature using Deno's crypto
    const encoder = new TextEncoder();
    const keyData = encoder.encode(secret);
    const messageData = encoder.encode(payload);

    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );

    const signatureBuffer = await crypto.subtle.sign('HMAC', cryptoKey, messageData);
    const signatureArray = Array.from(new Uint8Array(signatureBuffer));
    const expectedSignature = signatureArray.map(b => b.toString(16).padStart(2, '0')).join('');

    // Compare signatures
    if (providedSignature !== expectedSignature) {
      throw new Error('Signature mismatch');
    }

    // Parse the event
    event = JSON.parse(body) as Stripe.Event;
    console.log('Signature verified successfully');
  } catch (err) {
    console.error('Signature verification failed:', err.message);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
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
        const supplierEmail = metadata.supplier_email;

        if (!paymentId) {
          console.error('Missing supplier payment identifier in checkout session');
          throw new Error('Missing supplier payment identifier in checkout session');
        }

        console.log('Updating supplier payment status', { paymentId });

        // Get supplier and payment details
        const { data: payment, error: paymentError } = await supabaseAdmin
          .from('supplier_payments')
          .select('supplier_id, entry_count, amount_due_cents')
          .eq('id', paymentId)
          .single();

        if (paymentError) {
          console.error('Failed to fetch payment details', paymentError);
          throw paymentError;
        }

        const { data: supplier, error: supplierError } = await supabaseAdmin
          .from('suppliers')
          .select('email, brand_name')
          .eq('id', payment.supplier_id)
          .single();

        if (supplierError) {
          console.error('Failed to fetch supplier', supplierError);
          throw supplierError;
        }

        // Update payment status
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

        // Create or update judge profile for supplier
        const { error: judgeError } = await supabaseAdmin
          .from('judges')
          .upsert({
            email: supplier.email,
            type: 'supplier',
            active: true,
          }, {
            onConflict: 'email',
            ignoreDuplicates: false,
          });

        if (judgeError) {
          console.error('Failed to create/update supplier judge', judgeError);
          // Don't throw - payment already succeeded, this is a secondary operation
        } else {
          console.log('Supplier judge profile created/updated');
        }

        // Send confirmation email via Next.js API route
        try {
          const emailApiUrl = Deno.env.get('EMAIL_API_URL') || 'https://awards.heatawards.eu';
          const emailResponse = await fetch(`${emailApiUrl}/api/send-email`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${serviceRoleKey}`,
            },
            body: JSON.stringify({
              type: 'payment_confirmation',
              data: {
                email: supplier.email,
                brandName: supplier.brand_name,
                entryCount: payment.entry_count,
                amount: (payment.amount_due_cents / 100).toFixed(2),
              },
            }),
          });

          if (!emailResponse.ok) {
            console.error('Email API returned error:', await emailResponse.text());
          } else {
            console.log('Payment confirmation email sent to:', supplier.email);
          }
        } catch (emailError) {
          console.error('Failed to send payment confirmation email:', emailError);
          // Don't throw - payment already succeeded, email is non-critical
        }

        console.log('Supplier payment confirmation complete');
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

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (err) {
    console.error('Webhook error:', err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
