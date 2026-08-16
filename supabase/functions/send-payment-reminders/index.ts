import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';
import { COMPETITION_YEAR } from '../_shared/config.ts';

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

interface SupplierRow {
  email: string;
  brand_name: string | null;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Under the deferred-payment model, a sauce only gets `payment_id` set
    // when the supplier explicitly clicks "Confirm Entries" (createPaymentBatch
    // in actions.ts) — nothing else ever writes it, and this function never
    // writes it either, it only reads. So `payment_id IS NULL` on an
    // otherwise-unpaid sauce means exactly one thing: this supplier has
    // entries that were never confirmed, whether because they registered and
    // never confirmed at all, or because they confirmed once and then added
    // more sauces afterward without re-confirming (insertSauceEntry
    // deliberately never auto-links a new sauce to an already-confirmed
    // 'deferred' batch — see the comment there). Suppliers who HAVE a
    // confirmed batch (payment_id set, stripe_payment_status = 'deferred')
    // are correctly not charged yet and get no reminder.
    const { data: unconfirmedSauces, error: saucesError } = await supabaseAdmin
      .from('sauces')
      .select(`
        id,
        created_at,
        supplier_id,
        suppliers!inner ( email, brand_name )
      `)
      .eq('competition_year', COMPETITION_YEAR)
      .eq('payment_status', 'pending_payment')
      .is('payment_id', null)
      .order('created_at', { ascending: true });

    if (saucesError) {
      throw saucesError;
    }

    if (!unconfirmedSauces || unconfirmedSauces.length === 0) {
      return new Response(JSON.stringify({
        success: true,
        message: 'No unconfirmed entries found',
        remindersSent: 0
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    // Group unconfirmed sauces by supplier — one reminder per supplier, not
    // per sauce.
    const bySupplier = new Map<string, { supplier: SupplierRow; entryCount: number; oldestCreatedAt: string }>();
    for (const sauce of unconfirmedSauces) {
      const supplier = (Array.isArray(sauce.suppliers) ? sauce.suppliers[0] : sauce.suppliers) as SupplierRow | null;
      if (!supplier) continue;

      const existing = bySupplier.get(sauce.supplier_id);
      if (existing) {
        existing.entryCount += 1;
      } else {
        bySupplier.set(sauce.supplier_id, {
          supplier,
          entryCount: 1,
          oldestCreatedAt: sauce.created_at,
        });
      }
    }

    const remindersSent = [];
    const errors = [];

    for (const [supplierId, { supplier, entryCount, oldestCreatedAt }] of bySupplier) {
      try {
        const daysSince = Math.floor(
          (new Date().getTime() - new Date(oldestCreatedAt).getTime()) / (1000 * 60 * 60 * 24)
        );

        // Generate magic link so supplier can login to confirm their entries
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

        const emailResponse = await fetch(`${emailApiUrl}/api/send-email`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${serviceRoleKey}`,
          },
          body: JSON.stringify({
            type: 'confirm_entries_reminder',
            data: {
              email: supplier.email,
              brandName: supplier.brand_name,
              entryCount,
              daysSinceRegistration: daysSince,
              magicLink,
            },
          }),
        });

        if (!emailResponse.ok) {
          const errorText = await emailResponse.text();
          errors.push({
            supplier_id: supplierId,
            email: supplier.email,
            error: `Email API error: ${errorText}`
          });
        } else {
          remindersSent.push({
            supplier_id: supplierId,
            email: supplier.email,
            brand: supplier.brand_name,
            entry_count: entryCount,
            days_pending: daysSince,
          });
        }
      } catch (err) {
        errors.push({
          supplier_id: supplierId,
          error: err instanceof Error ? err.message : String(err)
        });
      }
    }

    return new Response(JSON.stringify({
      success: true,
      remindersSent: remindersSent.length,
      totalPending: bySupplier.size,
      details: remindersSent,
      errors: errors.length > 0 ? errors : undefined,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Error sending confirm-entries reminders:', error);
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : String(error)
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
