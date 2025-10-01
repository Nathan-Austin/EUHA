'use client'

import { useState, useTransition } from 'react';
import { exportResults } from './actions';

export default function ExportResultsButton() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleExport = () => {
    setError(null);
    startTransition(async () => {
      const result = await exportResults();
      if (result?.error) {
        setError(result.error);
      } else if (result?.csv) {
        // Trigger download
        const blob = new Blob([result.csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', 'judging-results.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    });
  };

  return (
    <div>
      <button
        onClick={handleExport}
        disabled={isPending}
        className="px-4 py-2 font-medium text-white bg-gray-600 rounded-md hover:bg-gray-700 disabled:bg-gray-400"
      >
        {isPending ? 'Exporting...' : 'Export All Results (CSV)'}
      </button>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
