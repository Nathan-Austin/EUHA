import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

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

const emailApiUrl = Deno.env.get('EMAIL_API_URL') || 'https://heatawards.eu';
const serviceRoleKey = Deno.env.get('SERVICE_ROLE_KEY') ?? '';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Get all pending payments with supplier details
    const { data: pendingPayments, error: paymentsError } = await supabaseAdmin
      .from('supplier_payments')
      .select(`
        id,
        entry_count,
        amount_due_cents,
        created_at,
        stripe_session_id,
        supplier_id,
        suppliers!inner (
          email,
          brand_name
        )
      `)
      .eq('stripe_payment_status', 'pending')
      .order('created_at', { ascending: true });

    if (paymentsError) {
      throw paymentsError;
    }

    if (!pendingPayments || pendingPayments.length === 0) {
      return new Response(JSON.stringify({
        success: true,
        message: 'No pending payments found',
        remindersSent: 0
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    const remindersSent = [];
    const errors = [];

    for (const payment of pendingPayments) {
      try {
        const supplier = Array.isArray(payment.suppliers)
          ? payment.suppliers[0]
          : payment.suppliers;

        if (!supplier) {
          errors.push({ payment_id: payment.id, error: 'No supplier found' });
          continue;
        }

        // Calculate days since registration
        const daysSince = Math.floor(
          (new Date().getTime() - new Date(payment.created_at).getTime()) / (1000 * 60 * 60 * 24)
        );

        // Generate magic link so supplier can login to complete payment
        let magicLink = 'https://heatawards.eu/login';
        try {
          const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
            type: 'magiclink',
            email: supplier.email,
            options: {
              redirectTo: 'https://heatawards.eu/auth/callback',
            },
          });

          if (!linkError && linkData) {
            magicLink = linkData.properties.action_link;
          } else {
            console.error('Failed to generate magic link for:', supplier.email, linkError);
          }
        } catch (linkErr) {
          console.error('Error generating magic link:', linkErr);
        }

        // Send reminder email with magic link
        const emailResponse = await fetch(`${emailApiUrl}/api/send-email`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${serviceRoleKey}`,
          },
          body: JSON.stringify({
            type: 'payment_reminder',
            data: {
              email: supplier.email,
              brandName: supplier.brand_name,
              entryCount: payment.entry_count,
              amount: (payment.amount_due_cents / 100).toFixed(2),
              daysSinceRegistration: daysSince,
              paymentId: payment.id,
              magicLink: magicLink,
            },
          }),
        });

        if (!emailResponse.ok) {
          const errorText = await emailResponse.text();
          errors.push({
            payment_id: payment.id,
            email: supplier.email,
            error: `Email API error: ${errorText}`
          });
        } else {
          remindersSent.push({
            payment_id: payment.id,
            email: supplier.email,
            brand: supplier.brand_name,
            days_pending: daysSince,
          });
        }
      } catch (err) {
        errors.push({
          payment_id: payment.id,
          error: err instanceof Error ? err.message : String(err)
        });
      }
    }

    return new Response(JSON.stringify({
      success: true,
      remindersSent: remindersSent.length,
      totalPending: pendingPayments.length,
      details: remindersSent,
      errors: errors.length > 0 ? errors : undefined,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Error sending payment reminders:', error);
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : String(error)
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
