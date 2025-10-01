'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

interface StripeCheckoutButtonProps {
  judgeId: string;
  email: string;
}

export default function StripeCheckoutButton({ judgeId, email }: StripeCheckoutButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const supabase = createClient();

  const handleCheckout = async () => {
    setLoading(true);
    setError('');

    const { data, error } = await supabase.functions.invoke('stripe-checkout', {
      body: { judge_id: judgeId, email },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    if (data.url) {
      window.location.href = data.url;
    } else {
      setError('Could not create a checkout session. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        onClick={handleCheckout}
        disabled={loading}
        className="w-full px-4 py-2 font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:bg-green-400"
      >
        {loading ? 'Redirecting...' : 'Pay €15 to Participate'}
      </button>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
