'use client';

import { useState, useTransition } from 'react';
import { generateJudgeShippingLabel } from '@/app/actions';

interface JudgeShippingRow {
  id: string;
  name: string;
  email: string;
  type: string;
  address: string | null;
  address_line2: string | null;
  city: string | null;
  postal_code: string | null;
  country: string | null;
  dhl_tracking_number: string | null;
  dhl_label_url: string | null;
  label_generated_at: string | null;
  label_generation_error: string | null;
}

interface Props {
  judges: JudgeShippingRow[];
}

const TYPE_BADGE: Record<string, string> = {
  pro: 'bg-purple-100 text-purple-800',
  community: 'bg-blue-100 text-blue-800',
  supplier: 'bg-orange-100 text-orange-800',
};

function hasCompleteAddress(judge: JudgeShippingRow): boolean {
  return !!(judge.address && judge.city && judge.postal_code && judge.country);
}

export default function JudgeShippingManager({ judges }: Props) {
  const [results, setResults] = useState<Record<string, { error?: string; labelUrl?: string; trackingNumber?: string }>>({});
  const [pending, startTransition] = useTransition();
  const [activeJudgeId, setActiveJudgeId] = useState<string | null>(null);

  const handleGenerate = (judgeId: string) => {
    setActiveJudgeId(judgeId);
    startTransition(async () => {
      const result = await generateJudgeShippingLabel(judgeId);
      setResults((prev) => ({ ...prev, [judgeId]: result }));
      setActiveJudgeId(null);
    });
  };

  const labelled = judges.filter((j) => j.dhl_tracking_number);
  const ready = judges.filter((j) => !j.dhl_tracking_number && hasCompleteAddress(j));
  const incomplete = judges.filter((j) => !j.dhl_tracking_number && !hasCompleteAddress(j));

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3">
          <p className="text-xs font-medium uppercase tracking-wide text-green-700">Labels Generated</p>
          <p className="mt-1 text-2xl font-semibold text-green-900">{labelled.length}</p>
        </div>
        <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3">
          <p className="text-xs font-medium uppercase tracking-wide text-blue-700">Ready to Ship</p>
          <p className="mt-1 text-2xl font-semibold text-blue-900">{ready.length}</p>
        </div>
        <div className="rounded-xl border border-orange-200 bg-orange-50 px-4 py-3">
          <p className="text-xs font-medium uppercase tracking-wide text-orange-700">Missing Address</p>
          <p className="mt-1 text-2xl font-semibold text-orange-900">{incomplete.length}</p>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="px-4 py-3 text-left">Judge</th>
              <th className="px-4 py-3 text-left">Type</th>
              <th className="px-4 py-3 text-left">Address</th>
              <th className="px-4 py-3 text-left">DHL Status</th>
              <th className="px-4 py-3 text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {judges.map((judge) => {
              const addressOk = hasCompleteAddress(judge);
              const isGenerating = pending && activeJudgeId === judge.id;
              const localResult = results[judge.id];
              const tracking = localResult?.trackingNumber || judge.dhl_tracking_number;
              const labelUrl = localResult?.labelUrl || judge.dhl_label_url;
              const hasLabel = !!tracking;

              return (
                <tr key={judge.id} className="border-t text-sm">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{judge.name}</p>
                    <p className="text-xs text-gray-500">{judge.email}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-1 text-xs font-semibold ${TYPE_BADGE[judge.type] || 'bg-gray-100 text-gray-700'}`}>
                      {judge.type}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {addressOk ? (
                      <div className="text-xs text-gray-700 leading-relaxed">
                        {judge.address_line2 && <p className="text-gray-500">{judge.address_line2}</p>}
                        <p>{judge.address}</p>
                        <p>{judge.postal_code} {judge.city}</p>
                        <p>{judge.country}</p>
                      </div>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-2 py-1 text-xs font-medium text-orange-700">
                        ⚠ Missing address
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {hasLabel ? (
                      <div className="space-y-1">
                        <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-800">
                          ✓ Label ready
                        </span>
                        <p className="font-mono text-xs text-gray-600">{tracking}</p>
                        {labelUrl && (
                          <a
                            href={labelUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block text-xs text-blue-600 hover:underline"
                          >
                            Download label ↗
                          </a>
                        )}
                      </div>
                    ) : localResult?.error || judge.label_generation_error ? (
                      <div>
                        <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-1 text-xs font-semibold text-red-800">
                          ✗ Error
                        </span>
                        <p className="mt-1 text-xs text-red-600">{localResult?.error || judge.label_generation_error}</p>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400">Not generated</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {!hasLabel && (
                      <button
                        onClick={() => handleGenerate(judge.id)}
                        disabled={!addressOk || isGenerating || pending}
                        className="rounded-lg bg-gray-900 px-3 py-2 text-xs font-semibold text-white hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {isGenerating ? 'Generating…' : 'Generate Label'}
                      </button>
                    )}
                    {hasLabel && (
                      <button
                        onClick={() => handleGenerate(judge.id)}
                        disabled={isGenerating || pending}
                        className="rounded-lg border border-gray-300 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                      >
                        {isGenerating ? 'Regenerating…' : 'Regenerate'}
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
