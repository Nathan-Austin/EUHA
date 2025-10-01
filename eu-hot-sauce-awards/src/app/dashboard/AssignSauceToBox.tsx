'use client'

import { useState, useEffect, useTransition } from 'react';
import { createClient } from '@/lib/supabase/client';
import { assignSaucesToBox } from './actions';

interface Sauce {
  id: string;
  name: string;
}

export default function AssignSauceToBox() {
  const [sauces, setSauces] = useState<Sauce[]>([]);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const fetchAvailableSauces = async () => {
      const { data, error } = await supabase
        .from('sauces')
        .select('id, name')
        .eq('status', 'arrived'); // Only show sauces that are ready to be boxed

      if (data) {
        setSauces(data);
      }
    };

    fetchAvailableSauces();
  }, [supabase]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setError(null);
    setSuccess(null);

    startTransition(async () => {
      const result = await assignSaucesToBox(formData);
      if (result?.error) {
        setError(result.error);
      } else {
        setSuccess('Sauces assigned to box successfully!');
        // Reset form or give other feedback
      }
    });
  };

  return (
    <div className="mt-6">
      <h3 className="text-lg font-medium mb-2">Assign Sauces to Box</h3>
      <form onSubmit={handleSubmit} className="p-4 border rounded-md bg-gray-50 space-y-4">
        <div>
          <label htmlFor="sauceIds" className="block text-sm font-medium text-gray-700">
            Select Sauces (must have 'Arrived' status)
          </label>
          <select
            id="sauceIds"
            name="sauceIds"
            multiple
            required
            className="mt-1 block w-full h-32 px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          >
            {sauces.map(sauce => (
              <option key={sauce.id} value={sauce.id}>{sauce.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="boxLabel" className="block text-sm font-medium text-gray-700">
            Box Label (New or Existing)
          </label>
          <input
            type="text"
            id="boxLabel"
            name="boxLabel"
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="e.g., Box A"
          />
        </div>
        <div>
          <button
            type="submit"
            disabled={isPending}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 disabled:bg-indigo-400"
          >
            {isPending ? 'Assigning...' : 'Assign Sauces'}
          </button>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        {success && <p className="text-sm text-green-600">{success}</p>}
      </form>
    </div>
  );
}
