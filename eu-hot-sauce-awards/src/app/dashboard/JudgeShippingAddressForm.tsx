'use client';

import { useState, useTransition } from 'react';
import { updateJudgeShippingAddress } from '@/app/actions';
import { AVAILABLE_SHIPPING_COUNTRIES } from '@/lib/dhl/countries';

interface Props {
  current: {
    address: string | null;
    address_line2: string | null;
    city: string | null;
    postal_code: string | null;
    country: string | null;
  };
}

export default function JudgeShippingAddressForm({ current }: Props) {
  const [address, setAddress] = useState(current.address || '');
  const [address_line2, setAddressLine2] = useState(current.address_line2 || '');
  const [city, setCity] = useState(current.city || '');
  const [postal_code, setPostalCode] = useState(current.postal_code || '');
  const [country, setCountry] = useState(current.country || 'Germany');
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    startTransition(async () => {
      const result = await updateJudgeShippingAddress({
        address,
        address_line2,
        city,
        postal_code,
        country,
      });

      if (result.error) {
        setError(result.error);
      } else {
        setSuccess(true);
      }
    });
  };

  const isComplete = address.trim() && city.trim() && postal_code.trim() && country;

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base font-semibold text-gray-900">Shipping Address for Judging Box</h3>
        <p className="mt-1 text-sm text-gray-600">
          We need your delivery address to ship your judging box. Please use the address where you
          can reliably receive a parcel.
        </p>
      </div>

      {!isComplete && (
        <div className="rounded-lg border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-orange-800">
          ⚠ Your shipping address is incomplete. Please fill in all required fields so we can send
          your judging box.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Street Address <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="e.g. Martin-Luther-Str. 14"
            required
            disabled={isPending}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
          />
          <p className="mt-1 text-xs text-gray-500">Include house number, e.g. "Hauptstraße 42"</p>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Address Line 2 <span className="text-gray-400">(optional)</span>
          </label>
          <input
            type="text"
            value={address_line2}
            onChange={(e) => setAddressLine2(e.target.value)}
            placeholder="e.g. c/o Smith, Apartment 3B"
            disabled={isPending}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Postal Code <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={postal_code}
              onChange={(e) => setPostalCode(e.target.value)}
              placeholder="e.g. 10777"
              required
              disabled={isPending}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              City <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="e.g. Berlin"
              required
              disabled={isPending}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Country <span className="text-red-500">*</span>
          </label>
          <select
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            required
            disabled={isPending}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
          >
            <option value="">Select country…</option>
            {AVAILABLE_SHIPPING_COUNTRIES.map((c) => (
              <option key={c.code} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}
        {success && (
          <p className="text-sm text-green-600">✓ Shipping address saved successfully.</p>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-700 disabled:opacity-50 sm:w-auto"
        >
          {isPending ? 'Saving…' : 'Save Shipping Address'}
        </button>
      </form>
    </div>
  );
}
