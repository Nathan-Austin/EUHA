'use client';

import { useState } from 'react';

const LINK_EXPIRY_HOURS = 24;

async function requestAuthLink(email: string, reason: 'login' | 'confirmation') {
  const trimmedEmail = email.trim();
  if (!trimmedEmail) {
    throw new Error('Email is required.');
  }

  const response = await fetch('/api/auth/email-link', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: trimmedEmail, reason }),
  });

  let payload: { error?: string } = {};
  try {
    payload = await response.json();
  } catch {
    // Swallow JSON parse errors for non-JSON responses
  }

  if (!response.ok) {
    throw new Error(payload?.error || 'Unable to send email link. Please try again.');
  }
}

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      await requestAuthLink(email, 'login');
      setMessage(`Check your email for the magic link. It stays active for the next ${LINK_EXPIRY_HOURS} hours.`);
    } catch (requestError) {
      if (requestError instanceof Error) {
        setError(requestError.message);
      } else {
        setError('Unable to send email link. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendConfirmation = async () => {
    if (!email) {
      setError('Enter your email first so we know where to send the link.');
      return;
    }

    setResendLoading(true);
    setMessage('');
    setError('');

    try {
      await requestAuthLink(email, 'confirmation');
      setMessage(`If your email still needs to be confirmed, we just sent a fresh link. It will work for the next ${LINK_EXPIRY_HOURS} hours.`);
    } catch (requestError) {
      if (requestError instanceof Error) {
        setError(requestError.message);
      } else {
        setError('Unable to resend the confirmation link. Please try again.');
      }
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center text-gray-900">
          Login
        </h1>
        <p className="text-center text-gray-600">
          Enter your email to receive a magic link. For suppliers, judges, and admins.
        </p>
        <form onSubmit={handleLogin} className="space-y-6">
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
              onChange={(e) => setEmail(e.target.value)}
              className="relative block w-full px-3 py-2 text-gray-900 placeholder-gray-500 border border-gray-300 rounded-md appearance-none focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
              placeholder="Email address"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="relative flex justify-center w-full px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md group hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
          >
            {loading ? 'Sending...' : 'Send Magic Link'}
          </button>
        </form>
        <div className="space-y-2 border-t border-gray-200 pt-4">
          <p className="text-sm text-gray-600">
            Need a new confirmation email? We can resend it to the same address.
          </p>
          <button
            type="button"
            onClick={handleResendConfirmation}
            disabled={resendLoading}
            className="relative flex justify-center w-full px-4 py-2 text-sm font-medium text-indigo-700 border border-indigo-600 rounded-md hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:text-indigo-400 disabled:border-indigo-300 disabled:bg-white"
          >
            {resendLoading ? 'Sending...' : 'Resend Confirmation Link'}
          </button>
          <p className="text-xs text-center text-gray-500">
            The new link stays valid for 24 hours. After confirming, you can always return here to request a fresh magic login link.
          </p>
        </div>
        {message && (
          <p className="mt-2 text-sm text-center text-green-600">
            {message}
          </p>
        )}
        {error && (
          <p className="mt-2 text-sm text-center text-red-600">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
