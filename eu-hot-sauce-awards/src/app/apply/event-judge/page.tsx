'use client';

import { ChangeEvent, FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';

async function verifyOtpCode(email: string, token: string) {
  const response = await fetch('/api/auth/verify-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: email.trim(), token: token.trim() }),
  });

  let payload: { error?: string } = {};
  try { payload = await response.json(); } catch { /* ignore */ }

  if (!response.ok) {
    throw new Error(payload?.error || 'Invalid or expired code. Please try again.');
  }
}

async function resendCode(email: string) {
  const response = await fetch('/api/auth/email-link', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: email.trim(), reason: 'login' }),
  });

  let payload: { error?: string } = {};
  try { payload = await response.json(); } catch { /* ignore */ }

  if (!response.ok) {
    throw new Error(payload?.error || 'Unable to resend code.');
  }
}

export default function EventJudgeRegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState<'register' | 'code'>('register');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleRegister = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/event-judge-register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), email: email.trim().toLowerCase() }),
      });

      const data = await response.json();

      if (!response.ok && response.status !== 207) {
        setErrorMessage(data.error || 'Registration failed. Please try again.');
        return;
      }

      setStep('code');
    } catch {
      setErrorMessage('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      await verifyOtpCode(email, code);
      router.replace('/dashboard');
      // Keep loading=true so button stays disabled during navigation
    } catch (err) {
      setIsLoading(false);
      setErrorMessage(err instanceof Error ? err.message : 'Invalid or expired code.');
    }
  };

  const handleResend = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    setCode('');
    try {
      await resendCode(email);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Unable to resend code.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#08040e] px-4">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md space-y-6">
        <div className="text-center space-y-2">
          <div className="text-4xl">🌶️</div>
          <h1 className="text-2xl font-bold text-gray-900">Event Judge Registration</h1>
          {step === 'register' && (
            <p className="text-sm text-gray-600">Register to judge at today's EU Hot Sauce Awards event.</p>
          )}
          {step === 'code' && (
            <p className="text-sm text-gray-600">
              We sent a 6-digit code to <strong>{email}</strong>. Enter it below to access your dashboard.
            </p>
          )}
        </div>

        {step === 'register' && (
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Your Name
              </label>
              <input
                id="name"
                type="text"
                required
                autoComplete="name"
                value={name}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                placeholder="Jane Smith"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                inputMode="email"
                value={email}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                placeholder="jane@example.com"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
              />
            </div>

            {errorMessage && (
              <p className="rounded-md bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
                {errorMessage}
              </p>
            )}

            <button
              type="submit"
              disabled={isLoading || !name.trim() || !email.trim()}
              className="w-full rounded-md bg-orange-600 px-4 py-3 font-semibold text-white hover:bg-orange-700 disabled:bg-orange-300 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Registering...' : 'Register & Get Login Code'}
            </button>
          </form>
        )}

        {step === 'code' && (
          <form onSubmit={handleVerify} className="space-y-4">
            <input
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              required
              maxLength={6}
              autoFocus
              value={code}
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                setCode(e.target.value.replace(/\D/g, ''));
                setErrorMessage(null);
              }}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-center text-2xl font-mono tracking-widest text-gray-900 placeholder-gray-400 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
              placeholder="000000"
            />

            {errorMessage && (
              <p className="rounded-md bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
                {errorMessage}
              </p>
            )}

            <button
              type="submit"
              disabled={isLoading || code.length !== 6}
              className="w-full rounded-md bg-orange-600 px-4 py-3 font-semibold text-white hover:bg-orange-700 disabled:bg-orange-300 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Verifying...' : 'Enter Dashboard'}
            </button>

            <p className="text-center text-sm text-gray-500">
              Didn't get the code?{' '}
              <button
                type="button"
                onClick={handleResend}
                disabled={isLoading}
                className="text-orange-600 hover:underline disabled:opacity-50"
              >
                Send a new one
              </button>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
