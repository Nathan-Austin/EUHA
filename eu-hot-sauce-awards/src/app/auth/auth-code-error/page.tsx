'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import HeatHeader from '@/components/HeatHeader';
import HeatFooter from '@/components/HeatFooter';

export default function AuthCodeError() {
  const router = useRouter();
  const [processing, setProcessing] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const hasAttemptedRef = useRef(false);

  useEffect(() => {
    if (hasAttemptedRef.current) return;
    hasAttemptedRef.current = true;

    const hash = window.location.hash.startsWith('#')
      ? window.location.hash.slice(1)
      : window.location.hash;

    if (!hash) {
      setProcessing(false);
      return;
    }

    const params = new URLSearchParams(hash);
    const accessToken = params.get('access_token');
    const refreshToken = params.get('refresh_token');
    const next = params.get('next') || '/dashboard';

    if (!accessToken || !refreshToken) {
      setProcessing(false);
      return;
    }

    const establishSession = async () => {
      const response = await fetch('/api/auth/set-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          access_token: accessToken,
          refresh_token: refreshToken,
        }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({ error: 'Unable to establish session.' }));
        throw new Error(payload?.error || 'Unable to establish session.');
      }
    };

    establishSession()
      .then(() => {
        window.location.hash = '';
        router.replace(next);
      })
      .catch((err: unknown) => {
        if (err instanceof Error) {
          setErrorMessage(err.message);
        } else {
          setErrorMessage('Unable to establish session.');
        }
        setProcessing(false);
      });
  }, [router]);

  return (
    <div className="min-h-screen bg-[#faf6ec] text-black">
      <HeatHeader />
      <section className="flex justify-center px-6 py-16">
        <div className="w-full max-w-md">
          <div className="border-[3px] border-black bg-white p-8 text-center space-y-6">
            {processing ? (
              <>
                <div className="flex justify-center">
                  <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-black"></div>
                </div>
                <h1 className="font-[family-name:var(--font-archivo-black)] text-xl uppercase">
                  Completing sign in…
                </h1>
                <p className="text-black/70">Please wait while we complete your authentication.</p>
                <p className="text-sm text-black/50">You&apos;ll be redirected to your dashboard shortly.</p>
              </>
            ) : (
              <>
                <p className="text-3xl">🌶️</p>
                <h1 className="font-[family-name:var(--font-archivo-black)] text-xl uppercase text-red-600">
                  Authentication error
                </h1>
                <p className="text-black/70">The login link is invalid or has expired.</p>
                <p className="text-black/60">
                  {errorMessage ? errorMessage : 'Please try signing in again or request a new link.'}
                </p>
                <div className="pt-2">
                  <Link
                    href="/login"
                    className="inline-block bg-black px-6 py-3 font-[family-name:var(--font-archivo-black)] text-sm uppercase tracking-[0.06em] text-[#F5C518] hover:bg-black/80"
                  >
                    Return to login
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </section>
      <HeatFooter />
    </div>
  );
}
