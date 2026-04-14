import { NextResponse } from 'next/server';
import { createClient as createServiceClient } from '@supabase/supabase-js';
import { sendEmail, emailTemplates } from '@/lib/email';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SITE_URL = (() => {
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    'https://heatawards.eu';
  return raw.endsWith('/') ? raw.slice(0, -1) : raw;
})();

const LINK_EXPIRY_HOURS = 24;
const LINK_EXPIRY_SECONDS = LINK_EXPIRY_HOURS * 60 * 60;

export async function POST(request: Request) {
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    return NextResponse.json(
      { error: 'Registration service is not configured.' },
      { status: 500 },
    );
  }

  let body: { name?: string; email?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request payload.' }, { status: 400 });
  }

  const name = body.name?.trim();
  const email = body.email?.trim().toLowerCase();

  if (!name || !email) {
    return NextResponse.json({ error: 'Name and email are required.' }, { status: 400 });
  }

  const adminSupabase = createServiceClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });

  try {
    // Create or retrieve the auth user (email already confirmed)
    const { error: createError } = await adminSupabase.auth.admin.createUser({
      email,
      email_confirm: true,
    });

    // Ignore "already registered" errors — the judge may be re-registering
    if (createError && !createError.message.toLowerCase().includes('already registered')) {
      console.error('Failed to create auth user for event judge:', createError);
      return NextResponse.json({ error: createError.message }, { status: 400 });
    }

    // Upsert into judges table
    const { error: judgeError } = await adminSupabase
      .from('judges')
      .upsert(
        {
          email,
          name,
          type: 'event',
          open_judging: true,
          active: true,
        },
        { onConflict: 'email', ignoreDuplicates: false },
      );

    if (judgeError) {
      console.error('Failed to upsert event judge:', judgeError);
      return NextResponse.json({ error: judgeError.message }, { status: 500 });
    }

    // Generate OTP and send login code email
    const { data: linkData, error: linkError } =
      await adminSupabase.auth.admin.generateLink({
        type: 'magiclink',
        email,
        options: {
          redirectTo: `${SITE_URL}/auth/callback`,
          expiresIn: LINK_EXPIRY_SECONDS,
        },
      } as any);

    if (linkError || !linkData?.properties?.email_otp) {
      console.error('Failed to generate login link for event judge:', linkError);
      return NextResponse.json(
        { error: 'Registered successfully, but failed to send login code. Please use the login page to request a new code.' },
        { status: 207 },
      );
    }

    const otpCode = linkData.properties.email_otp;
    const template = emailTemplates.authOtpCode(name, otpCode, LINK_EXPIRY_HOURS);

    await sendEmail({ to: email, ...template });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Event judge registration error:', error);
    const message = error instanceof Error ? error.message : 'Registration failed.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
