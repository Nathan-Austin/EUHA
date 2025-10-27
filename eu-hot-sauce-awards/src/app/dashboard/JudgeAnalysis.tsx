'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Judge {
  email: string
  name: string | null
  type: 'supplier' | 'pro' | 'community' | 'admin'
  active: boolean
  stripe_payment_status: string | null
  created_at: string
  participation_accepted: boolean
}

interface JudgeStats {
  supplier: {
    active: Judge[]
    inactive: Judge[]
  }
  pro: {
    active: Judge[]
    inactive: Judge[]
  }
  community: {
    active: Judge[]
    activePaid: Judge[]
    activeGrandfathered: Judge[]
    inactive: Judge[]
  }
}

function JudgeCard({
  judge,
  showGrandfatheredTag = false,
}: {
  judge: Judge
  showGrandfatheredTag?: boolean
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
      <div className="flex-1">
        <p className="font-medium text-gray-900">{judge.name || 'No Name'}</p>
        <p className="text-sm text-gray-600">{judge.email}</p>
      </div>
      <div className="flex items-center gap-2">
        {showGrandfatheredTag && (
          <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-800">
            Grandfathered
          </span>
        )}
        {judge.stripe_payment_status === 'succeeded' && (
          <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-800">
            Paid
          </span>
        )}
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            judge.active
              ? 'bg-green-100 text-green-800'
              : 'bg-gray-200 text-gray-700'
          }`}
        >
          {judge.active ? 'Active' : 'Inactive'}
        </span>
      </div>
    </div>
  )
}

function JudgeSection({
  title,
  activeJudges,
  inactiveJudges,
  showGrandfathered = false,
  grandfatheredJudges = [],
}: {
  title: string
  activeJudges: Judge[]
  inactiveJudges: Judge[]
  showGrandfathered?: boolean
  grandfatheredJudges?: Judge[]
}) {
  const totalActive = activeJudges.length
  const totalInactive = inactiveJudges.length
  const totalGrandfathered = grandfatheredJudges.length

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
        <div className="flex gap-2">
          <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-800">
            {totalActive} Active
          </span>
          {totalInactive > 0 && (
            <span className="rounded-full bg-gray-200 px-3 py-1 text-sm font-semibold text-gray-700">
              {totalInactive} Inactive
            </span>
          )}
          {showGrandfathered && totalGrandfathered > 0 && (
            <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-800">
              {totalGrandfathered} Grandfathered
            </span>
          )}
        </div>
      </div>

      {/* Active Judges */}
      {totalActive > 0 && (
        <div className="mb-6">
          <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-600">
            Active ({totalActive})
          </h4>
          <div className="space-y-2">
            {activeJudges.map((judge) => (
              <JudgeCard
                key={judge.email}
                judge={judge}
                showGrandfatheredTag={showGrandfathered && grandfatheredJudges.includes(judge)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Inactive Judges */}
      {totalInactive > 0 && (
        <div>
          <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-600">
            Inactive / Awaiting Payment ({totalInactive})
          </h4>
          <div className="space-y-2">
            {inactiveJudges.map((judge) => (
              <JudgeCard key={judge.email} judge={judge} />
            ))}
          </div>
        </div>
      )}

      {totalActive === 0 && totalInactive === 0 && (
        <p className="text-center text-sm text-gray-500">No judges in this category</p>
      )}
    </div>
  )
}

export default function JudgeAnalysis() {
  const [judges, setJudges] = useState<JudgeStats>({
    supplier: { active: [], inactive: [] },
    pro: { active: [], inactive: [] },
    community: { active: [], activePaid: [], activeGrandfathered: [], inactive: [] },
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchJudges() {
      setLoading(true)
      setError(null)
      const supabase = createClient()

      try {
        // Fetch all judges with their participation data for 2026
        const { data, error: fetchError } = await supabase
          .from('judges')
          .select(
            `
            email,
            name,
            type,
            active,
            stripe_payment_status,
            created_at,
            judge_participations!inner (
              accepted
            )
          `
          )
          .eq('judge_participations.year', 2026)
          .order('name', { ascending: true })

        if (fetchError) {
          throw fetchError
        }

        if (!data) {
          throw new Error('No judges found')
        }

        // Transform data to include participation status
        const transformedJudges: Judge[] = data.map((judge: any) => ({
          email: judge.email,
          name: judge.name,
          type: judge.type,
          active: judge.active,
          stripe_payment_status: judge.stripe_payment_status,
          created_at: judge.created_at,
          participation_accepted: judge.judge_participations[0]?.accepted || false,
        }))

        // Group judges by type and active status
        const grouped: JudgeStats = {
          supplier: { active: [], inactive: [] },
          pro: { active: [], inactive: [] },
          community: { active: [], activePaid: [], activeGrandfathered: [], inactive: [] },
        }

        // Payment system migration date - set to Oct 11 to include full day of Oct 10
        const PAYMENT_MIGRATION_DATE = new Date('2025-10-11T00:00:00Z')

        transformedJudges.forEach((judge) => {
          if (judge.type === 'supplier') {
            if (judge.active && judge.participation_accepted) {
              grouped.supplier.active.push(judge)
            } else {
              grouped.supplier.inactive.push(judge)
            }
          } else if (judge.type === 'pro') {
            if (judge.active && judge.participation_accepted) {
              grouped.pro.active.push(judge)
            } else {
              grouped.pro.inactive.push(judge)
            }
          } else if (judge.type === 'community') {
            if (judge.active && judge.participation_accepted) {
              grouped.community.active.push(judge)
              // Check if grandfathered (created before payment system was implemented)
              const judgeCreatedDate = new Date(judge.created_at)
              if (judgeCreatedDate < PAYMENT_MIGRATION_DATE) {
                grouped.community.activeGrandfathered.push(judge)
              } else {
                grouped.community.activePaid.push(judge)
              }
            } else {
              grouped.community.inactive.push(judge)
            }
          }
        })

        setJudges(grouped)
      } catch (err: any) {
        console.error('Error fetching judges:', err)
        setError(err.message || 'Failed to load judges')
      } finally {
        setLoading(false)
      }
    }

    fetchJudges()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-gray-900"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 p-4 text-center">
        <p className="text-sm text-red-800">Error: {error}</p>
      </div>
    )
  }

  const totalJudges =
    judges.supplier.active.length +
    judges.supplier.inactive.length +
    judges.pro.active.length +
    judges.pro.inactive.length +
    judges.community.active.length +
    judges.community.inactive.length

  const totalActive =
    judges.supplier.active.length + judges.pro.active.length + judges.community.active.length

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="mb-2 text-2xl font-semibold text-gray-900">Judge Analysis</h2>
        <p className="text-sm text-gray-600">
          Track all judges across types, monitor payment status, and identify grandfathered accounts.
        </p>
        <div className="mt-4 flex gap-4">
          <div className="rounded-lg bg-gray-50 px-4 py-2">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Total Judges
            </p>
            <p className="mt-1 text-2xl font-semibold text-gray-900">{totalJudges}</p>
          </div>
          <div className="rounded-lg bg-green-50 px-4 py-2">
            <p className="text-xs font-medium uppercase tracking-wide text-green-600">
              Active Judges
            </p>
            <p className="mt-1 text-2xl font-semibold text-green-900">{totalActive}</p>
          </div>
          <div className="rounded-lg bg-blue-50 px-4 py-2">
            <p className="text-xs font-medium uppercase tracking-wide text-blue-600">
              Grandfathered
            </p>
            <p className="mt-1 text-2xl font-semibold text-blue-900">
              {judges.community.activeGrandfathered.length}
            </p>
          </div>
        </div>
      </div>

      <JudgeSection
        title="Community Judges"
        activeJudges={judges.community.active}
        inactiveJudges={judges.community.inactive}
        showGrandfathered={true}
        grandfatheredJudges={judges.community.activeGrandfathered}
      />

      <JudgeSection
        title="Pro Judges"
        activeJudges={judges.pro.active}
        inactiveJudges={judges.pro.inactive}
      />

      <JudgeSection
        title="Supplier Judges"
        activeJudges={judges.supplier.active}
        inactiveJudges={judges.supplier.inactive}
      />
    </div>
  )
}
