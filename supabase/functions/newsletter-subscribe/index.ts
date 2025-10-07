
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

interface SubscribePayload {
  email: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const payload: SubscribePayload = await req.json();
    const { email } = payload;

    if (!email || !email.includes('@')) {
      throw new Error('A valid email is required.');
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { error } = await supabaseAdmin
      .from('newsletter_subscribers')
      .insert({ email });

    if (error) {
      // Handle potential duplicate email error gracefully
      if (error.code === '23505') { // unique_violation
        return new Response(JSON.stringify({ success: true, message: 'Email is already subscribed.' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        });
      }
      throw error;
    }

    return new Response(JSON.stringify({
      success: true,
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
