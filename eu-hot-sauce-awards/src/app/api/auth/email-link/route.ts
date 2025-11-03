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

type RequestReason = 'login' | 'confirmation';

interface RequestPayload {
  email?: string;
  reason?: RequestReason;
}

function getDisplayNameCandidate(email: string) {
  const localPart = email.split('@')[0];
  return localPart.charAt(0).toUpperCase() + localPart.slice(1);
}

export async function POST(request: Request) {
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    return NextResponse.json(
      { error: 'Email link service is not configured.' },
      { status: 500 },
    );
  }

  let body: RequestPayload;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: 'Invalid request payload.' },
      { status: 400 },
    );
  }

  const email = body.email?.trim().toLowerCase();
  const reason: RequestReason = body.reason === 'confirmation' ? 'confirmation' : 'login';

  if (!email) {
    return NextResponse.json(
      { error: 'Email is required.' },
      { status: 400 },
    );
  }

  try {
    const adminSupabase = createServiceClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
      auth: { persistSession: false },
    });

    // Try to personalise the email if we already know the contact name.
    let displayName = getDisplayNameCandidate(email);
    try {
      const { data: judge } = await adminSupabase
        .from('judges')
        .select('name')
        .ilike('email', email)
        .maybeSingle();

      if (judge?.name) {
        displayName = judge.name;
      }
    } catch (nameLookupError) {
      console.warn('Name lookup for email link failed', nameLookupError);
    }

    // Magic links use hash-based tokens that need client-side handling
    // Redirect directly to the client-side auth handler instead of server callback
    const redirectTo = `${SITE_URL}/auth/auth-code-error`;
    const generateLinkPayload = {
      type: 'magiclink',
      email,
      options: {
        redirectTo,
        expiresIn: LINK_EXPIRY_SECONDS,
      },
    } as any;

    const { data: linkData, error: linkError } =
      await adminSupabase.auth.admin.generateLink(generateLinkPayload);

    if (linkError || !linkData?.properties?.action_link) {
      const message = linkError?.message ?? 'Unable to generate email link.';
      const status = message.toLowerCase().includes('not found') ? 404 : 400;
      return NextResponse.json({ error: message }, { status });
    }

    const magicLink = linkData.properties.action_link;
    const template =
      reason === 'confirmation'
        ? emailTemplates.authConfirmationLink(displayName, magicLink, LINK_EXPIRY_HOURS)
        : emailTemplates.authMagicLink(displayName, magicLink, LINK_EXPIRY_HOURS);

    await sendEmail({
      to: email,
      ...template,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to send auth email link', error);
    const message =
      error instanceof Error ? error.message : 'Failed to send email link.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
