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
