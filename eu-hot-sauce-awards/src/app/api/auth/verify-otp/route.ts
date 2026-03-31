import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';

interface RequestPayload {
  email?: string;
  token?: string;
}

export async function POST(request: Request) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  let body: RequestPayload;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request payload.' }, { status: 400 });
  }

  const email = body.email?.trim().toLowerCase();
  const token = body.token?.trim();

  if (!email || !token) {
    return NextResponse.json({ error: 'Email and code are required.' }, { status: 400 });
  }

  const { error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: 'magiclink',
  });

  if (error) {
    return NextResponse.json(
      { error: 'Invalid or expired code. Please request a new one.' },
      { status: 400 },
    );
  }

  return NextResponse.json({ success: true });
}
