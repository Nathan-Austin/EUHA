'use client'

import { useState, useTransition } from 'react'
import { updateSauceStatus } from './actions'

type SauceStatus = 'registered' | 'arrived' | 'boxed' | 'judged';

interface SauceStatusUpdaterProps {
  sauceId: string;
  currentStatus: SauceStatus;
}

const statusOptions: SauceStatus[] = ['registered', 'arrived', 'boxed', 'judged'];

export default function SauceStatusUpdater({ sauceId, currentStatus }: SauceStatusUpdaterProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value as SauceStatus;
    setError(null);

    startTransition(async () => {
      const result = await updateSauceStatus(sauceId, newStatus);
      if (result?.error) {
        setError(result.error);
      }
    });
  };

  return (
    <div>
      <select
        value={currentStatus}
        onChange={handleStatusChange}
        disabled={isPending}
        className="p-1 text-sm border rounded-md bg-gray-50 disabled:opacity-50"
      >
        {statusOptions.map(status => (
          <option key={status} value={status}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </option>
        ))}
      </select>
      {isPending && <span className="ml-2 text-sm text-gray-500">Updating...</span>}
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  )
}
