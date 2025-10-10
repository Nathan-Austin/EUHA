import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

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
    const currentYear = new Date().getFullYear(); // 2026 for current year

    // Insert/update in main judges table
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
        active: false, // All new judges are inactive by default
      }, { onConflict: 'email' })
      .select('id')
      .single();

    if (error) throw error;

    // Also track in judge_participations for the current year
    const { error: participationError } = await supabaseAdmin
      .from('judge_participations')
      .upsert({
        email: payload.email,
        full_name: payload.name,
        year: currentYear,
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
      const emailApiUrl = Deno.env.get('EMAIL_API_URL') || 'https://awards.heatawards.eu';
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
