import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';
import { COMPETITION_YEAR } from '../_shared/config.ts';

interface JudgePayload {
  name: string;
  email: string;
  address: string;
  zip: string;
  city: string;
  country: string;
  experience: string;
  industryAffiliation?: boolean;
  affiliationDetails?: string;
}

function mapExperienceToType(experience: string): 'pro' | 'community' {
  switch (experience) {
    case 'Professional Chili Person':
    case 'Experienced Food / Chili Person':
      return 'pro';
    case 'Very Keen Amateur Food / Chili Person':
      return 'community';
    default:
      return 'community'; // Default to community for safety
  }
}

async function getAuthUserByEmail(supabaseAdmin: ReturnType<typeof createClient>, email: string) {
  if (typeof (supabaseAdmin as any)?.auth?.admin?.getUserByEmail === 'function') {
    return await supabaseAdmin.auth.admin.getUserByEmail(email);
  }

  // Fallback for older supabase-js versions without getUserByEmail
  const { data, error } = await supabaseAdmin.auth.admin.listUsers({
    page: 1,
    perPage: 1,
    email,
  });

  if (error) {
    throw error;
  }

  const user = data.users?.[0];

  return {
    data: { user },
    error: null,
  };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const payload: JudgePayload = await req.json();

    const supabaseAdmin = createClient(
      Deno.env.get('PROJECT_URL') ?? '',
      Deno.env.get('SERVICE_ROLE_KEY') ?? ''
    );

    const judgeType = mapExperienceToType(payload.experience);

    // 1. Create or get auth user first (required for login)
    let authUserId: string;
    try {
      // Use getUserByEmail (or listUsers fallback) to avoid pagination issues
      const { data: existingUserData, error: getUserError } = await getAuthUserByEmail(
        supabaseAdmin,
        payload.email
      );

      if (getUserError && !getUserError.message?.includes?.('User not found')) {
        throw getUserError;
      }

      if (existingUserData?.user) {
        authUserId = existingUserData.user.id;
        console.log(`Auth user already exists: ${payload.email} (ID: ${authUserId})`);
      } else {
        // User doesn't exist, create new auth user
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
          email: payload.email,
          email_confirm: true, // Auto-confirm so they can log in immediately
          user_metadata: {
            full_name: payload.name,
            judge_type: judgeType,
            created_via: 'judge-intake',
            created_at: new Date().toISOString()
          }
        });

        if (authError) {
          // Handle duplicate user error gracefully
          if (authError.message?.includes?.('User already registered')) {
            console.log('User exists but lookup failed, retrying getUserByEmail...');
            const { data: retryData } = await getAuthUserByEmail(supabaseAdmin, payload.email);
            if (retryData?.user) {
              authUserId = retryData.user.id;
            } else {
              throw authError;
            }
          } else {
            throw authError;
          }
        } else {
          if (!authData.user) throw new Error('Failed to create auth user');
          authUserId = authData.user.id;
          console.log(`Created new auth user: ${payload.email} (ID: ${authUserId})`);
        }
      }
    } catch (authError: any) {
      console.error('Auth user creation failed:', authError);
      throw new Error(`Failed to create auth account: ${authError.message}`);
    }

    // 2. Insert/update in main judges table
    // Check if judge already exists to preserve their active status
    const { data: existingJudge } = await supabaseAdmin
      .from('judges')
      .select('active, type, stripe_payment_status')
      .eq('email', payload.email)
      .single();

    // Determine if we should reset stripe_payment_status
    // Reset if: returning community judge registering for a new year
    const shouldResetPaymentStatus = existingJudge &&
                                      existingJudge.type === 'community' &&
                                      judgeType === 'community' &&
                                      existingJudge.stripe_payment_status === 'succeeded';

    const { data, error } = await supabaseAdmin
      .from('judges')
      .upsert({
        email: payload.email,
        name: payload.name,
        address: payload.address,
        city: payload.city,
        postal_code: payload.zip,
        country: payload.country,
        experience_level: payload.experience,
        type: judgeType,
        industry_affiliation: payload.industryAffiliation || false,
        affiliation_details: payload.affiliationDetails || null,
        // Preserve active status for existing judges, set false for new judges
        active: existingJudge?.active ?? false,
        // Reset payment status for returning community judges (they must pay for new year)
        stripe_payment_status: shouldResetPaymentStatus ? null : undefined,
      }, { onConflict: 'email' })
      .select('id')
      .single();

    if (error) throw error;

    // 3. Track in judge_participations for the current year
    const { error: participationError } = await supabaseAdmin
      .from('judge_participations')
      .upsert({
        email: payload.email,
        full_name: payload.name,
        year: COMPETITION_YEAR,
        application_date: new Date().toISOString(),
        judge_type: judgeType,
        experience_level: payload.experience,
        company_affiliation: payload.affiliationDetails || null,
        accepted: false, // Not yet accepted
        source_channel: 'wordpress'
      }, {
        onConflict: 'email,year'
      });

    if (participationError) {
      console.error('Failed to track judge participation:', participationError);
      // Don't throw - main registration succeeded
    }

    // Send registration confirmation email
    try {
      const emailApiUrl = Deno.env.get('EMAIL_API_URL') || 'https://heatawards.eu';
      const serviceRoleKey = Deno.env.get('SERVICE_ROLE_KEY');

      const emailResponse = await fetch(`${emailApiUrl}/api/send-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${serviceRoleKey}`,
        },
        body: JSON.stringify({
          type: 'judge_registration',
          data: {
            email: payload.email,
            name: payload.name,
            judgeType: judgeType,
          },
        }),
      });

      if (!emailResponse.ok) {
        console.error('Email API returned error:', await emailResponse.text());
      } else {
        console.log('Judge registration email sent to:', payload.email);
      }
    } catch (emailError) {
      console.error('Failed to send registration email:', emailError);
      // Don't throw - registration already succeeded, email is non-critical
    }

    return new Response(JSON.stringify({
      success: true,
      judge_id: data.id,
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
