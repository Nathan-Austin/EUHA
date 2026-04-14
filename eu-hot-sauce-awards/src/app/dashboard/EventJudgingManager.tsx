'use client';

import { useState, useTransition } from 'react';
import { closeEventJudging, openEventJudging } from '@/app/actions';

interface Props {
  eventOpenCount: number;
  totalSauceCount: number;
}

export default function EventJudgingManager({ eventOpenCount, totalSauceCount }: Props) {
  const [openCount, setOpenCount] = useState(eventOpenCount);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleClose = () => {
    setMessage(null);
    setError(null);
    startTransition(async () => {
      const result = await closeEventJudging();
      if ('error' in result) {
        setError(result.error ?? 'Unknown error');
      } else {
        setOpenCount(0);
        setMessage(`Event access closed. ${result.closedCount} sauce(s) reverted.`);
      }
    });
  };

  const handleOpen = () => {
    setMessage(null);
    setError(null);
    startTransition(async () => {
      const result = await openEventJudging();
      if ('error' in result) {
        setError(result.error ?? 'Unknown error');
      } else {
        setOpenCount(totalSauceCount);
        setMessage('Event access opened on all sauces.');
      }
    });
  };

  const isEventOpen = openCount > 0;

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">Event Judging Mode</h3>
        <p className="text-sm text-gray-600 mt-1">
          Controls whether sauces are open to event judges regardless of payment status.
          Use <strong>Close Event Access</strong> on Thursday to revert.
        </p>
      </div>

      <div className={`rounded-lg border px-4 py-3 ${isEventOpen ? 'border-green-300 bg-green-50' : 'border-gray-200 bg-gray-50'}`}>
        <p className="text-sm font-medium">
          Status:{' '}
          <span className={isEventOpen ? 'text-green-700 font-semibold' : 'text-gray-600'}>
            {isEventOpen ? `OPEN — ${openCount} of ${totalSauceCount} sauces event-accessible` : 'CLOSED — no sauces event-open'}
          </span>
        </p>
      </div>

      <div className="flex gap-3 flex-wrap">
        <button
          onClick={handleClose}
          disabled={isPending || !isEventOpen}
          className="px-4 py-2 rounded-md bg-red-600 text-white text-sm font-semibold hover:bg-red-700 disabled:bg-red-200 disabled:cursor-not-allowed"
        >
          {isPending ? 'Working...' : 'Close Event Access'}
        </button>
        <button
          onClick={handleOpen}
          disabled={isPending || isEventOpen}
          className="px-4 py-2 rounded-md bg-green-600 text-white text-sm font-semibold hover:bg-green-700 disabled:bg-green-200 disabled:cursor-not-allowed"
        >
          {isPending ? 'Working...' : 'Open Event Access'}
        </button>
      </div>

      {message && <p className="text-sm text-green-700">{message}</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
