'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

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
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 text-center bg-white rounded-lg shadow-md">
        {processing ? (
          <>
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              Completing Sign In...
            </h1>
            <p className="text-gray-700">
              Please wait while we complete your authentication.
            </p>
            <p className="text-gray-600 text-sm">
              You&apos;ll be redirected to your dashboard shortly.
            </p>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-red-600">
              Authentication Error
            </h1>
            <p className="text-gray-700">
              The login link is invalid or has expired.
            </p>
            <p className="text-gray-600">
              {errorMessage
                ? errorMessage
                : 'Please try signing in again or request a new link.'}
            </p>
            <div className="pt-4">
              <Link
                href="/login"
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Return to Login
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
