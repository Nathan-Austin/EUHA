'use client'

import { useState, useTransition } from 'react'
import { bypassPayment } from '@/app/actions'

interface BypassPaymentButtonProps {
  sauceId: string;
  sauceName: string;
  brandName: string;
}

export default function BypassPaymentButton({
  sauceId,
  sauceName,
  brandName
}: BypassPaymentButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<{ success?: boolean; error?: string } | null>(null);

  const handleBypass = () => {
    if (!confirm(
      `Are you sure you want to bypass payment for "${sauceName}" by ${brandName}?\n\n` +
      `This will:\n` +
      `• Mark ALL their sauces as PAID\n` +
      `• Activate their judge profile\n` +
      `• Send them a magic link email\n\n` +
      `No payment will be collected.`
    )) {
      return;
    }

    setResult(null);
    startTransition(async () => {
      const response = await bypassPayment(sauceId);
      setResult(response);

      if (response.success) {
        setTimeout(() => setResult(null), 3000);
      }
    });
  };

  return (
    <div className="flex flex-col gap-1">
      <button
        onClick={handleBypass}
        disabled={isPending}
        className="px-3 py-1.5 text-xs font-medium border border-orange-300 rounded-md
                   bg-orange-50 text-orange-700 hover:bg-orange-100
                   disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isPending ? 'Processing...' : 'Bypass Payment'}
      </button>

      {result?.error && (
        <p className="text-xs text-red-600 mt-1">{result.error}</p>
      )}

      {result?.success && (
        <p className="text-xs text-green-600 mt-1">✓ Payment bypassed</p>
      )}
    </div>
  );
}
