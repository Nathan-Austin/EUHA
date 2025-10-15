'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

interface PaymentQuote {
  id: string;
  entry_count: number;
  discount_percent: number;
  subtotal_cents: number;
  discount_cents: number;
  amount_due_cents: number;
  stripe_payment_status: string;
}

interface SupplierPaymentButtonProps {
  paymentQuote: PaymentQuote;
  userEmail: string;
}

const formatCurrency = (cents: number) =>
  new Intl.NumberFormat('en-IE', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
  }).format(cents / 100);

export default function SupplierPaymentButton({ paymentQuote, userEmail }: SupplierPaymentButtonProps) {
  const supabase = createClient();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCheckout = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: invokeError } = await supabase.functions.invoke('supplier-checkout', {
        body: {
          payment_id: paymentQuote.id,
          email: userEmail,
        },
      });

      if (invokeError) {
        throw new Error(invokeError.message);
      }

      if (data?.alreadyPaid) {
        setError('Payment already processed. Please refresh the page.');
      } else if (data?.url) {
        window.location.href = data.url as string;
      } else {
        setError('Unable to start checkout. Please contact support.');
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Unable to initialize payment. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4 rounded-lg border-2 border-orange-200 bg-orange-50 p-6">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-orange-900">Payment Required</h3>
          <p className="text-sm text-orange-700 mt-1">
            Complete your payment to confirm your {paymentQuote.entry_count} sauce {paymentQuote.entry_count > 1 ? 'entries' : 'entry'}
          </p>
        </div>
        <span className="px-3 py-1 bg-orange-200 text-orange-900 rounded-full text-xs font-semibold uppercase">
          Pending
        </span>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between text-gray-700">
          <span>Subtotal:</span>
          <span>{formatCurrency(paymentQuote.subtotal_cents)}</span>
        </div>
        <div className="flex justify-between text-gray-700">
          <span>Discount ({paymentQuote.discount_percent}%):</span>
          <span>-{formatCurrency(paymentQuote.discount_cents)}</span>
        </div>
        <div className="flex justify-between text-lg font-semibold text-gray-900 pt-2 border-t">
          <span>Total Due:</span>
          <span>{formatCurrency(paymentQuote.amount_due_cents)}</span>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">
          {error}
        </div>
      )}

      <button
        onClick={handleCheckout}
        disabled={isLoading}
        className="w-full px-4 py-3 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-700 disabled:bg-orange-400 transition-colors"
      >
        {isLoading ? 'Redirecting to payment...' : 'Complete Payment'}
      </button>

      <p className="text-xs text-gray-600 text-center">
        Secure payment processing via Stripe
      </p>
    </div>
  );
}
