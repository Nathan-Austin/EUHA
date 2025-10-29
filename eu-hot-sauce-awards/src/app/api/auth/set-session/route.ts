import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';

interface SessionPayload {
  access_token?: string;
  refresh_token?: string;
}

export async function POST(request: Request) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  let body: SessionPayload;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON payload.' }, { status: 400 });
  }

  const accessToken = body.access_token?.trim();
  const refreshToken = body.refresh_token?.trim();

  if (!accessToken || !refreshToken) {
    return NextResponse.json({ error: 'Both access_token and refresh_token are required.' }, { status: 400 });
  }

  const { data, error } = await supabase.auth.setSession({
    access_token: accessToken,
    refresh_token: refreshToken,
  });

  if (error || !data?.session) {
    const message = error?.message ?? 'Unable to establish session.';
    return NextResponse.json({ error: message }, { status: 401 });
  }

  return NextResponse.json({ success: true });
}
