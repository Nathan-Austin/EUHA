'use client';

import { useState } from 'react';
import { updateSupplierCountryRegion } from '@/app/actions';

interface Supplier {
  id: string;
  brand_name: string;
  country: string | null;
  region: string;
}

interface SupplierCountryManagerProps {
  suppliers: Supplier[];
}

export default function SupplierCountryManager({ suppliers }: SupplierCountryManagerProps) {
  const [rows, setRows] = useState<Supplier[]>(
    [...suppliers].sort((a, b) => a.brand_name.localeCompare(b.brand_name))
  );
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [saved, setSaved] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [filter, setFilter] = useState<'all' | 'missing'>('missing');

  const displayRows = filter === 'missing' ? rows.filter((r) => !r.country) : rows;

  async function handleSave(supplierId: string, country: string, region: string) {
    setSaving((s) => ({ ...s, [supplierId]: true }));
    setErrors((e) => ({ ...e, [supplierId]: '' }));
    const result = await updateSupplierCountryRegion(supplierId, country, region);
    setSaving((s) => ({ ...s, [supplierId]: false }));
    if ('error' in result) {
      setErrors((e) => ({ ...e, [supplierId]: result.error || 'Error' }));
    } else {
      setSaved((s) => ({ ...s, [supplierId]: true }));
      setTimeout(() => setSaved((s) => ({ ...s, [supplierId]: false })), 2000);
    }
  }

  function updateRow(id: string, field: 'country' | 'region', value: string) {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
    setSaved((s) => ({ ...s, [id]: false }));
  }

  const missingCount = rows.filter((r) => !r.country).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-gray-900">Supplier Country & Region</h3>
          <p className="text-sm text-gray-500 mt-0.5">
            Used to split European vs International in results.
            {missingCount > 0 && (
              <span className="ml-2 text-orange-600 font-medium">{missingCount} missing country</span>
            )}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('missing')}
            className={`px-3 py-1.5 text-sm rounded-md font-medium ${filter === 'missing' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            Missing ({missingCount})
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 text-sm rounded-md font-medium ${filter === 'all' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            All ({rows.length})
          </button>
        </div>
      </div>

      {displayRows.length === 0 && (
        <p className="py-6 text-center text-sm text-gray-400">All suppliers have a country set.</p>
      )}

      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100 text-gray-600">
            <tr>
              <th className="px-4 py-2 text-left">Brand</th>
              <th className="px-4 py-2 text-left">Country</th>
              <th className="px-4 py-2 text-left">Region</th>
              <th className="px-4 py-2 text-left"></th>
            </tr>
          </thead>
          <tbody>
            {displayRows.map((row) => (
              <tr key={row.id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-2 font-medium text-gray-900">{row.brand_name}</td>
                <td className="px-4 py-2">
                  <input
                    type="text"
                    value={row.country ?? ''}
                    onChange={(e) => updateRow(row.id, 'country', e.target.value)}
                    placeholder="e.g. Germany"
                    className="w-40 rounded border border-gray-300 px-2 py-1 text-sm focus:border-orange-400 focus:outline-none"
                  />
                </td>
                <td className="px-4 py-2">
                  <select
                    value={row.region}
                    onChange={(e) => updateRow(row.id, 'region', e.target.value)}
                    className="rounded border border-gray-300 px-2 py-1 text-sm focus:border-orange-400 focus:outline-none"
                  >
                    <option value="european">European</option>
                    <option value="international">International</option>
                  </select>
                </td>
                <td className="px-4 py-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleSave(row.id, row.country ?? '', row.region)}
                      disabled={saving[row.id]}
                      className="rounded bg-gray-800 px-3 py-1 text-xs font-medium text-white hover:bg-gray-900 disabled:opacity-50"
                    >
                      {saving[row.id] ? 'Saving…' : 'Save'}
                    </button>
                    {saved[row.id] && <span className="text-xs text-green-600">✓ Saved</span>}
                    {errors[row.id] && <span className="text-xs text-red-600">{errors[row.id]}</span>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
