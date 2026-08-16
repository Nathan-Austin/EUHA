'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { validateEmail } from '@/lib/validation';
import { registerNewSupplier } from './actions';
import HeatHeader from '@/components/HeatHeader';
import HeatFooter from '@/components/HeatFooter';
import Breadcrumbs from '@/components/Breadcrumbs';
import { COMPETITION_YEAR } from '@/lib/config';
import { COUNTRIES, COUNTRY_REGIONS } from '@/lib/countries';

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

const inputClass =
  'block w-full border-2 border-black px-4 py-3 text-base text-black placeholder-black/40 outline-none focus:border-[#F5C518]';

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<'returning' | 'new'>('returning');
  const [step, setStep] = useState<'details' | 'code'>('details');
  const [email, setEmail] = useState('');
  const [brandName, setBrandName] = useState('');
  const [contactName, setContactName] = useState('');
  const [country, setCountry] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [emailError, setEmailError] = useState('');

  const handleEmailBlur = () => {
    if (email.trim()) {
      const validation = validateEmail(email);
      if (!validation.isValid) {
        setEmailError(validation.error || 'Invalid email');
      }
    }
  };

  const switchMode = (next: 'returning' | 'new') => {
    setMode(next);
    setStep('details');
    setError('');
    setEmailError('');
    setCode('');
  };

  const handleReturningSubmit = async (e: React.FormEvent) => {
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

  const handleNewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setEmailError('');

    try {
      const validation = validateEmail(email);
      if (!validation.isValid) {
        setEmailError(validation.error || 'Invalid email');
        setLoading(false);
        return;
      }

      const formData = new FormData();
      formData.set('brandName', brandName);
      formData.set('contactName', contactName);
      formData.set('email', email);
      formData.set('country', country);

      const result = await registerNewSupplier(formData);
      if (result.error) {
        setError(result.error);
        setLoading(false);
        return;
      }

      await requestOtpCode(email);
      setStep('code');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to complete registration. Please try again.');
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
    <div className="min-h-screen bg-[#faf6ec] text-black">
      <HeatHeader />
      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Login' }]} />

      <section className="flex justify-center px-6 py-16">
        <div className="w-full max-w-md">
          {step === 'details' && (
            <div className="mb-7 flex border-[3px] border-black">
              <button
                type="button"
                onClick={() => switchMode('returning')}
                className={`flex-1 py-3 font-[family-name:var(--font-archivo-black)] text-xs uppercase tracking-[0.06em] ${
                  mode === 'returning' ? 'bg-[#F5C518] text-black' : 'bg-white text-black/50'
                }`}
              >
                Returning
              </button>
              <button
                type="button"
                onClick={() => switchMode('new')}
                className={`flex-1 border-l-[3px] border-black py-3 font-[family-name:var(--font-archivo-black)] text-xs uppercase tracking-[0.06em] ${
                  mode === 'new' ? 'bg-[#F5C518] text-black' : 'bg-white text-black/50'
                }`}
              >
                New here
              </button>
            </div>
          )}

          <div className="border-[3px] border-black bg-white p-8">
            {step === 'details' && mode === 'returning' && (
              <>
                <h1 className="mb-3 font-[family-name:var(--font-archivo-black)] text-2xl uppercase leading-tight">
                  Welcome back to EHSA {COMPETITION_YEAR}.
                </h1>
                <p className="mb-6 text-sm leading-relaxed text-black/70">
                  If you entered before, use the same email address you used previously — all
                  your past entries will be ready to bring across to this year&rsquo;s awards if
                  you&rsquo;d like to re-enter them.
                </p>
                <form onSubmit={handleReturningSubmit} className="space-y-4">
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
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setEmailError('');
                      }}
                      onBlur={handleEmailBlur}
                      className={inputClass}
                      placeholder="Email address"
                    />
                    {emailError && <p className="mt-1.5 text-sm text-red-600">{emailError}</p>}
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-black py-3.5 font-[family-name:var(--font-archivo-black)] text-sm uppercase tracking-[0.06em] text-[#F5C518] hover:bg-black/80 disabled:opacity-50"
                  >
                    {loading ? 'Sending…' : 'Send login code'}
                  </button>
                </form>
              </>
            )}

            {step === 'details' && mode === 'new' && (
              <>
                <h1 className="mb-3 font-[family-name:var(--font-archivo-black)] text-2xl uppercase leading-tight">
                  New to EHSA?
                </h1>
                <p className="mb-6 text-sm leading-relaxed text-black/70">
                  Tell us a little about your business and we&rsquo;ll email you a code to set up
                  your dashboard, where you can enter your sauces for {COMPETITION_YEAR}.
                </p>
                <form onSubmit={handleNewSubmit} className="space-y-4">
                  <input
                    type="text"
                    required
                    value={brandName}
                    onChange={(e) => setBrandName(e.target.value)}
                    className={inputClass}
                    placeholder="Brand / business name"
                  />
                  <input
                    type="text"
                    required
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    className={inputClass}
                    placeholder="Contact name"
                  />
                  <div>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setEmailError('');
                      }}
                      onBlur={handleEmailBlur}
                      className={inputClass}
                      placeholder="Email address"
                    />
                    {emailError && <p className="mt-1.5 text-sm text-red-600">{emailError}</p>}
                  </div>
                  <select
                    required
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className={`${inputClass} ${country ? '' : 'text-black/40'}`}
                  >
                    <option value="" disabled>
                      Country
                    </option>
                    {COUNTRY_REGIONS.map((region) => (
                      <optgroup key={region} label={region}>
                        {COUNTRIES.filter((c) => c.region === region).map((c) => (
                          <option key={c.name} value={c.name}>
                            {c.name}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-black py-3.5 font-[family-name:var(--font-archivo-black)] text-sm uppercase tracking-[0.06em] text-[#F5C518] hover:bg-black/80 disabled:opacity-50"
                  >
                    {loading ? 'Creating account…' : 'Create account & send code'}
                  </button>
                </form>
              </>
            )}

            {step === 'code' && (
              <>
                <h1 className="mb-3 font-[family-name:var(--font-archivo-black)] text-2xl uppercase leading-tight">
                  Check your email.
                </h1>
                <p className="mb-6 text-sm leading-relaxed text-black/70">
                  We sent a 6-digit code to <strong className="text-black">{email}</strong>. Enter
                  it below to access your dashboard.
                </p>
                <form onSubmit={handleVerifyCode} className="space-y-4">
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
                    className={`${inputClass} text-center font-mono text-2xl tracking-[0.3em]`}
                    placeholder="000000"
                    autoFocus
                  />
                  <button
                    type="submit"
                    disabled={loading || code.length !== 6}
                    className="w-full bg-[#F5C518] py-3.5 font-[family-name:var(--font-archivo-black)] text-sm uppercase tracking-[0.06em] text-black hover:bg-[#e0a800] disabled:opacity-50"
                  >
                    {loading ? 'Verifying…' : 'Sign in'}
                  </button>
                </form>
                <p className="mt-5 border-t border-black/10 pt-4 text-center text-sm text-black/60">
                  Didn&rsquo;t get the code?{' '}
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={loading}
                    className="font-semibold text-black underline disabled:opacity-50"
                  >
                    {loading ? 'Sending…' : 'Send a new one'}
                  </button>
                </p>
              </>
            )}

            {error && <p className="mt-4 text-center text-sm text-red-600">{error}</p>}
          </div>
        </div>
      </section>

      <HeatFooter />
    </div>
  );
}
