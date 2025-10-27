import { createClient as createServiceClient } from '@supabase/supabase-js'
import CollapsibleSection from './CollapsibleSection'

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
  showEarlyEntryTag = false,
  showPaymentStatus = false,
}: {
  judge: Judge
  showEarlyEntryTag?: boolean
  showPaymentStatus?: boolean
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
      <div className="flex-1">
        <p className="font-medium text-gray-900">{judge.name || 'No Name'}</p>
        <p className="text-sm text-gray-600">{judge.email}</p>
      </div>
      <div className="flex items-center gap-2">
        {showEarlyEntryTag && (
          <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-800">
            Early Entry
          </span>
        )}
        {showPaymentStatus && judge.stripe_payment_status !== 'succeeded' && (
          <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-800">
            Payment Pending
          </span>
        )}
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            judge.participation_accepted
              ? 'bg-green-100 text-green-800'
              : 'bg-gray-200 text-gray-700'
          }`}
        >
          {judge.participation_accepted ? 'Active' : 'Inactive'}
        </span>
      </div>
    </div>
  )
}

function JudgeSection({
  title,
  activeJudges,
  inactiveJudges,
  showEarlyEntry = false,
  earlyEntryJudges = [],
  showPaymentStatus = false,
}: {
  title: string
  activeJudges: Judge[]
  inactiveJudges: Judge[]
  showEarlyEntry?: boolean
  earlyEntryJudges?: Judge[]
  showPaymentStatus?: boolean
}) {
  const totalActive = activeJudges.length
  const totalInactive = inactiveJudges.length
  const totalEarlyEntry = earlyEntryJudges.length

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
          {showEarlyEntry && totalEarlyEntry > 0 && (
            <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-800">
              {totalEarlyEntry} Early Entry
            </span>
          )}
        </div>
      </div>

      {/* Active Judges */}
      {totalActive > 0 && (
        <div className="mb-6">
          <CollapsibleSection
            title="Active"
            count={totalActive}
            defaultOpen={true}
          >
            <div className="space-y-2">
              {activeJudges.map((judge) => (
                <JudgeCard
                  key={judge.email}
                  judge={judge}
                  showEarlyEntryTag={showEarlyEntry && earlyEntryJudges.includes(judge)}
                  showPaymentStatus={showPaymentStatus}
                />
              ))}
            </div>
          </CollapsibleSection>
        </div>
      )}

      {/* Inactive Judges */}
      {totalInactive > 0 && (
        <div>
          <CollapsibleSection
            title={`Inactive${showPaymentStatus ? ' / Awaiting Payment' : ''}`}
            count={totalInactive}
            defaultOpen={false}
          >
            <div className="space-y-2">
              {inactiveJudges.map((judge) => (
                <JudgeCard key={judge.email} judge={judge} showPaymentStatus={showPaymentStatus} />
              ))}
            </div>
          </CollapsibleSection>
        </div>
      )}

      {totalActive === 0 && totalInactive === 0 && (
        <p className="text-center text-sm text-gray-500">No judges in this category</p>
      )}
    </div>
  )
}

function getServiceSupabase() {
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!SUPABASE_URL || !serviceRoleKey) {
    throw new Error('Service role key not configured.')
  }

  return createServiceClient(SUPABASE_URL, serviceRoleKey, {
    auth: { persistSession: false },
  })
}

export default async function JudgeAnalysis() {
  // Use service role for admin queries to bypass RLS
  const adminSupabase = getServiceSupabase()

  let judges: JudgeStats = {
    supplier: { active: [], inactive: [] },
    pro: { active: [], inactive: [] },
    community: { active: [], activePaid: [], activeGrandfathered: [], inactive: [] },
  }

  let error: string | null = null

  try {
    // Fetch judge participations for 2026 using service role to bypass RLS
    const { data: participations, error: participationsError } = await adminSupabase
      .from('judge_participations')
      .select('email, accepted')
      .eq('year', 2026)

    if (participationsError) {
      throw participationsError
    }

    // Create a map of email -> accepted status
    const participationMap = new Map(
      participations?.map((p) => [p.email, p.accepted]) || []
    )

    // If no participations found, return empty judges object
    if (participationMap.size === 0) {
      judges = {
        supplier: { active: [], inactive: [] },
        pro: { active: [], inactive: [] },
        community: { active: [], activePaid: [], activeGrandfathered: [], inactive: [] },
      }
      // Don't throw error, just show empty state
    } else {
      // Fetch all judges who have participation records for 2026 using service role to bypass RLS
      const { data: judgesData, error: judgesError } = await adminSupabase
        .from('judges')
        .select('email, name, type, active, stripe_payment_status, created_at')
        .in('email', Array.from(participationMap.keys()))
        .order('name', { ascending: true })

      if (judgesError) {
        throw judgesError
      }

      if (!judgesData || judgesData.length === 0) {
        // No judge records found for the participations
        judges = {
          supplier: { active: [], inactive: [] },
          pro: { active: [], inactive: [] },
          community: { active: [], activePaid: [], activeGrandfathered: [], inactive: [] },
        }
      } else {

        // Transform data to include participation status
        const transformedJudges: Judge[] = judgesData.map((judge: any) => ({
          email: judge.email,
          name: judge.name,
          type: judge.type,
          active: judge.active,
          stripe_payment_status: judge.stripe_payment_status,
          created_at: judge.created_at,
          participation_accepted: participationMap.get(judge.email) || false,
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
          // Use participation_accepted as the primary indicator for 2026 participation
          if (judge.type === 'supplier') {
            if (judge.participation_accepted) {
              grouped.supplier.active.push(judge)
            } else {
              grouped.supplier.inactive.push(judge)
            }
          } else if (judge.type === 'pro') {
            if (judge.participation_accepted) {
              grouped.pro.active.push(judge)
            } else {
              grouped.pro.inactive.push(judge)
            }
          } else if (judge.type === 'community') {
            // For community judges: payment = auto-acceptance
            // This handles edge cases where payment succeeded but participation record wasn't updated
            const hasAccepted = judge.participation_accepted || judge.stripe_payment_status === 'succeeded'

            if (hasAccepted) {
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

        judges = grouped
      }
    }
  } catch (err: any) {
    console.error('Error fetching judges:', err)
    error = err.message || 'Failed to load judges'
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
              Early Entry
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
        showEarlyEntry={true}
        earlyEntryJudges={judges.community.activeGrandfathered}
        showPaymentStatus={true}
      />

      <JudgeSection
        title="Pro Judges"
        activeJudges={judges.pro.active}
        inactiveJudges={judges.pro.inactive}
        showPaymentStatus={false}
      />

      <JudgeSection
        title="Supplier Judges"
        activeJudges={judges.supplier.active}
        inactiveJudges={judges.supplier.inactive}
        showPaymentStatus={false}
      />
    </div>
  )
}
