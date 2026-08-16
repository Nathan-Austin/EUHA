'use client';

import { ChangeEvent, FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import HeatHeader from '@/components/HeatHeader';
import HeatFooter from '@/components/HeatFooter';

const inputClass =
  'block w-full border-2 border-black px-4 py-3 text-base text-black placeholder-black/40 outline-none focus:border-[#F5C518] disabled:opacity-60';

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
    <div className="min-h-screen bg-[#faf6ec] text-black">
      <HeatHeader />
      <section className="flex justify-center px-6 py-16">
        <div className="w-full max-w-md">
          <div className="border-[3px] border-black bg-white p-8 space-y-6">
            <div className="text-center space-y-2">
              <div className="text-3xl">🌶️</div>
              <h1 className="font-[family-name:var(--font-archivo-black)] text-xl uppercase">
                Event judge registration
              </h1>
              {step === 'register' && (
                <p className="text-sm text-black/70">Register to judge at today&rsquo;s European Hot Sauce Awards event.</p>
              )}
              {step === 'code' && (
                <p className="text-sm text-black/70">
                  We sent a 6-digit code to <strong className="text-black">{email}</strong>. Enter it below to
                  access your dashboard.
                </p>
              )}
            </div>

            {step === 'register' && (
              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label htmlFor="name" className="sr-only">
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
                    className={inputClass}
                  />
                </div>

                <div>
                  <label htmlFor="email" className="sr-only">
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
                    className={inputClass}
                  />
                </div>

                {errorMessage && (
                  <p className="border-2 border-red-600 bg-red-50 p-3 text-sm text-red-700">{errorMessage}</p>
                )}

                <button
                  type="submit"
                  disabled={isLoading || !name.trim() || !email.trim()}
                  className="w-full bg-black py-3.5 font-[family-name:var(--font-archivo-black)] text-sm uppercase tracking-[0.06em] text-[#F5C518] hover:bg-black/80 disabled:opacity-50"
                >
                  {isLoading ? 'Registering…' : 'Register & Get Login Code'}
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
                  className={`${inputClass} text-center font-mono text-2xl tracking-[0.3em]`}
                  placeholder="000000"
                />

                {errorMessage && (
                  <p className="border-2 border-red-600 bg-red-50 p-3 text-sm text-red-700">{errorMessage}</p>
                )}

                <button
                  type="submit"
                  disabled={isLoading || code.length !== 6}
                  className="w-full bg-[#F5C518] py-3.5 font-[family-name:var(--font-archivo-black)] text-sm uppercase tracking-[0.06em] text-black hover:bg-[#e0a800] disabled:opacity-50"
                >
                  {isLoading ? 'Verifying…' : 'Enter Dashboard'}
                </button>

                <p className="text-center text-sm text-black/60">
                  Didn&rsquo;t get the code?{' '}
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={isLoading}
                    className="font-semibold text-black underline disabled:opacity-50"
                  >
                    Send a new one
                  </button>
                </p>
              </form>
            )}
          </div>
        </div>
      </section>
      <HeatFooter />
    </div>
  );
}
