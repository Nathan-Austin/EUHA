'use client';

import { useState, useTransition } from 'react';
import { sendShippingAddressRequests } from '@/app/actions';

export default function RequestShippingAddressButton({ missingCount }: { missingCount: number }) {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<{
    sent: number;
    failed: number;
    alreadyHave: number;
    errors: string[];
  } | null>(null);

  const handleSend = () => {
    if (!confirm(`Send shipping address request emails to ${missingCount} supplier${missingCount !== 1 ? 's' : ''} with missing addresses?`)) return;

    startTransition(async () => {
      const res = await sendShippingAddressRequests();
      setResult(res);
    });
  };

  return (
    <div className="rounded-xl border border-orange-200 bg-orange-50 p-5 space-y-3">
      <div>
        <h4 className="text-sm font-semibold text-orange-900">Supplier Addresses Missing</h4>
        <p className="mt-1 text-sm text-orange-800">
          <strong>{missingCount}</strong> supplier{missingCount !== 1 ? 's' : ''} haven't provided a shipping address yet.
          Send them an email with a direct login link to their dashboard.
        </p>
      </div>

      {result && (
        <div className={`rounded-lg px-4 py-3 text-sm ${result.failed === 0 ? 'bg-green-50 border border-green-200 text-green-800' : 'bg-yellow-50 border border-yellow-200 text-yellow-800'}`}>
          <p className="font-medium">
            ✓ {result.sent} email{result.sent !== 1 ? 's' : ''} sent
            {result.failed > 0 && ` · ${result.failed} failed`}
            {result.alreadyHave > 0 && ` · ${result.alreadyHave} already had addresses (skipped)`}
          </p>
          {result.errors.length > 0 && (
            <ul className="mt-2 space-y-1 text-xs">
              {result.errors.map((e, i) => <li key={i}>⚠ {e}</li>)}
            </ul>
          )}
        </div>
      )}

      <button
        onClick={handleSend}
        disabled={isPending || missingCount === 0}
        className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isPending ? 'Sending…' : `Send Address Request to ${missingCount} Supplier${missingCount !== 1 ? 's' : ''}`}
      </button>
    </div>
  );
}
