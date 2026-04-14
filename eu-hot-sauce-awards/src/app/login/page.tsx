'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { validateEmail } from '@/lib/validation';

async function requestOtpCode(email: string) {
  const trimmedEmail = email.trim();
  if (!trimmedEmail) {
    throw new Error('Email is required.');
  }

  const validation = validateEmail(trimmedEmail);
  if (!validation.isValid) {
    throw new Error(validation.error);
  }

  const response = await fetch('/api/auth/email-link', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: trimmedEmail, reason: 'login' }),
  });

  let payload: { error?: string } = {};
  try {
    payload = await response.json();
  } catch {
    // ignore
  }

  if (!response.ok) {
    throw new Error(payload?.error || 'Unable to send code. Please try again.');
  }
}

async function verifyOtpCode(email: string, token: string) {
  const response = await fetch('/api/auth/verify-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: email.trim(), token: token.trim() }),
  });

  let payload: { error?: string } = {};
  try {
    payload = await response.json();
  } catch {
    // ignore
  }

  if (!response.ok) {
    throw new Error(payload?.error || 'Invalid or expired code. Please try again.');
  }
}

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<'email' | 'code'>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [emailError, setEmailError] = useState('');

  const handleEmailChange = (value: string) => {
    setEmail(value);
    setEmailError('');
  };

  const handleEmailBlur = () => {
    if (email.trim()) {
      const validation = validateEmail(email);
      if (!validation.isValid) {
        setEmailError(validation.error || 'Invalid email');
      }
    }
  };

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setEmailError('');

    try {
      await requestOtpCode(email);
      setStep('code');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to send code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await verifyOtpCode(email, code);
      router.replace('/dashboard');
      // Keep loading=true so the button stays disabled until navigation unmounts this page
    } catch (err) {
      setLoading(false);
      setError(err instanceof Error ? err.message : 'Invalid or expired code. Please try again.');
    }
  };

  const handleResend = async () => {
    setLoading(true);
    setError('');
    setCode('');
    try {
      await requestOtpCode(email);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to resend code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center text-gray-900">Login</h1>

        {step === 'email' ? (
          <>
            <p className="text-center text-gray-600">
              Enter your email and we&apos;ll send you a 6-digit code to sign in.
            </p>
            <form onSubmit={handleSendCode} className="space-y-6">
              <div>
                <label htmlFor="email" className="sr-only">
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => handleEmailChange(e.target.value)}
                  onBlur={handleEmailBlur}
                  className={`relative block w-full px-3 py-2 text-gray-900 placeholder-gray-500 border rounded-md appearance-none focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                    emailError ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Email address"
                />
                {emailError && (
                  <p className="mt-1 text-sm text-red-600">{emailError}</p>
                )}
              </div>
              <button
                type="submit"
                disabled={loading}
                className="relative flex justify-center w-full px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
              >
                {loading ? 'Sending...' : 'Send Login Code'}
              </button>
            </form>
          </>
        ) : (
          <>
            <p className="text-center text-gray-600">
              We sent a 6-digit code to <strong>{email}</strong>. Check your inbox and enter it below.
            </p>
            <form onSubmit={handleVerifyCode} className="space-y-6">
              <div>
                <label htmlFor="code" className="sr-only">
                  Login code
                </label>
                <input
                  id="code"
                  name="code"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  required
                  maxLength={6}
                  value={code}
                  onChange={(e) => {
                    setCode(e.target.value.replace(/\D/g, ''));
                    setError('');
                  }}
                  className="relative block w-full px-3 py-2 text-center text-2xl font-mono tracking-widest text-gray-900 placeholder-gray-400 border border-gray-300 rounded-md appearance-none focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="000000"
                  autoFocus
                />
              </div>
              <button
                type="submit"
                disabled={loading || code.length !== 6}
                className="relative flex justify-center w-full px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
              >
                {loading ? 'Verifying...' : 'Sign In'}
              </button>
            </form>
            <div className="space-y-2 border-t border-gray-200 pt-4">
              <p className="text-sm text-center text-gray-600">
                Didn&apos;t get the code?{' '}
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={loading}
                  className="text-indigo-600 hover:text-indigo-500 font-medium disabled:opacity-50"
                >
                  {loading ? 'Sending...' : 'Send a new one'}
                </button>
              </p>
            </div>
          </>
        )}

        {error && (
          <p className="mt-2 text-sm text-center text-red-600">{error}</p>
        )}
      </div>
    </div>
  );
}
