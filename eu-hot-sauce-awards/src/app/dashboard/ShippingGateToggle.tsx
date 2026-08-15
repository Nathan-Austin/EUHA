'use client'

import { useState, useTransition } from 'react'
import { updateCompetitionSetting } from '@/app/actions'

interface ShippingGateToggleProps {
  initialEnabled: boolean
  competitionYear: number
}

export default function ShippingGateToggle({ initialEnabled, competitionYear }: ShippingGateToggleProps) {
  const [enabled, setEnabled] = useState(initialEnabled)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const handleToggle = () => {
    const next = !enabled
    if (next === false && !confirm(
      `Close the shipping window for ${competitionYear}? Suppliers will stop seeing shipping instructions on their dashboard.`
    )) {
      return
    }
    setError(null)
    startTransition(async () => {
      const result = await updateCompetitionSetting('shipping_open', next)
      if ('error' in result) {
        setError(result.error)
      } else {
        setEnabled(next)
      }
    })
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-base font-semibold text-gray-900">Shipping window ({competitionYear})</h3>
          <p className="mt-1 text-sm text-gray-600">
            Controls whether the &quot;Ship your samples&quot; instructions show on the supplier dashboard. Keep this
            closed until payment and shipping logistics are ready — suppliers see a &quot;more info coming&quot;
            message instead.
          </p>
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        </div>
        <button
          onClick={handleToggle}
          disabled={isPending}
          role="switch"
          aria-checked={enabled}
          className={`relative inline-flex h-7 w-14 flex-shrink-0 items-center rounded-full transition-colors disabled:opacity-50 ${
            enabled ? 'bg-green-600' : 'bg-gray-300'
          }`}
        >
          <span
            className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
              enabled ? 'translate-x-8' : 'translate-x-1'
            }`}
          />
        </button>
      </div>
      <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
        Currently: <span className={enabled ? 'text-green-700' : 'text-gray-700'}>{enabled ? 'Open' : 'Closed'}</span>
      </p>
    </div>
  )
}
