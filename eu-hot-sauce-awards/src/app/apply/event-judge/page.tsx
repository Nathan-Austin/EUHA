'use client';

import { ChangeEvent, FormEvent, useState } from 'react';
import Link from 'next/link';

export default function EventJudgeRegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
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

      setIsComplete(true);
    } catch {
      setErrorMessage('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isComplete) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#08040e] px-4">
        <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md text-center space-y-4">
          <div className="text-5xl">🌶️</div>
          <h1 className="text-2xl font-bold text-gray-900">You're registered!</h1>
          <p className="text-gray-700">
            Check your email for a 6-digit login code, then use it on the login page to access your judging dashboard.
          </p>
          <Link
            href="/login"
            className="block w-full rounded-md bg-orange-600 px-4 py-3 text-center font-semibold text-white hover:bg-orange-700"
          >
            Go to Login Page
          </Link>
          <p className="text-xs text-gray-500">
            The code expires in 24 hours. If you don't see the email, check your spam folder.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#08040e] px-4">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md space-y-6">
        <div className="text-center space-y-2">
          <div className="text-4xl">🌶️</div>
          <h1 className="text-2xl font-bold text-gray-900">Event Judge Registration</h1>
          <p className="text-sm text-gray-600">
            Register to judge at today's EU Hot Sauce Awards event.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
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
            disabled={isSubmitting || !name.trim() || !email.trim()}
            className="w-full rounded-md bg-orange-600 px-4 py-3 font-semibold text-white hover:bg-orange-700 disabled:bg-orange-300 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Registering...' : 'Register & Get Login Code'}
          </button>
        </form>

        <p className="text-center text-xs text-gray-500">
          Already registered?{' '}
          <Link href="/login" className="text-orange-600 hover:underline">
            Go to login
          </Link>
        </p>
      </div>
    </div>
  );
}
