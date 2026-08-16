import type { ReactNode } from 'react'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import SauceStatusUpdater from './SauceStatusUpdater'
import BypassPaymentButton from './BypassPaymentButton'
import BoxManagement from './BoxManagement'
import ExportResultsButton from './ExportResultsButton'
import AddAdminUser from './AddAdminUser'
import StickerGenerator from './StickerGenerator'
import AdminBoxPacker from './AdminBoxPacker'
import JudgeLabelGenerator from './JudgeLabelGenerator'
import JarLabelGenerator from './JarLabelGenerator'
import PackageTracker from './PackageTracker'
import EventsManager from './EventsManager'
import EventJudgingManager from './EventJudgingManager'
import EmailCampaignManager from './EmailCampaignManager'
import EmailTemplateEditor from './EmailTemplateEditor'
import JudgingReminderSender from './JudgingReminderSender'
import WinnersAnnouncementSender from './WinnersAnnouncementSender'
import ResultsFeedbackSender from './ResultsFeedbackSender'
import ProJudgeApproval from './ProJudgeApproval'
import JudgeAnalysis from './JudgeAnalysis'
import AdminTabs from './AdminTabs'
import ResultsTable from './ResultsTable'
import SupplierCountryManager from './SupplierCountryManager'
import { getResultsData } from '@/app/actions'
import { COMPETITION_YEAR } from '@/lib/config'
import SendPaymentRemindersButton from './SendPaymentRemindersButton'
import VatInvoiceSender from './VatInvoiceSender'
import JudgeShippingManager from './JudgeShippingManager'
import DhlLabelScanner from './DhlLabelScanner'
import PackageReceiveScanner from './PackageReceiveScanner'
import SettingToggle from './SettingToggle'
import { getCompetitionSetting } from '@/app/actions'

const formatStatusLabel = (status: string) =>
  status
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())

function Card({ children, padding = 'p-6' }: { children: ReactNode; padding?: string }) {
  return (
    <div className={`rounded-2xl border border-gray-200 bg-white shadow-sm ${padding}`}>
      {children}
    </div>
  )
}

function SectionHeading({ title, description }: { title: string; description?: string }) {
  return (
    <div className="space-y-1">
      <h3 className="text-xl font-semibold text-white">{title}</h3>
      {description ? <p className="text-sm text-gray-300">{description}</p> : null}
    </div>
  )
}

export default async function AdminDashboard() {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  const { data: sauces, error } = await supabase
    .from('sauces')
    .select(
      `
        id,
        name,
        sauce_code,
        status,
        payment_status,
        payment_id,
        category,
        suppliers ( brand_name )
      `
    )
    .eq('competition_year', COMPETITION_YEAR)
    .order('created_at', { ascending: false }) as { data: any[] | null; error: any }

  // Distinguish "confirmed, payment due January" from plain unconfirmed-unpaid —
  // that state lives on the linked supplier_payments row, not on the sauce itself.
  const paymentIds = Array.from(new Set((sauces || []).map((s) => s.payment_id).filter(Boolean)))
  const { data: linkedPayments } = paymentIds.length > 0
    ? await supabase
        .from('supplier_payments')
        .select('id, stripe_payment_status')
        .in('id', paymentIds)
    : { data: [] as { id: string; stripe_payment_status: string }[] }
  const paymentStatusById = new Map((linkedPayments || []).map((p) => [p.id, p.stripe_payment_status]))

  // Suppliers active this season: since suppliers persist across years (an
  // account created in a prior year is reused when they re-enter), filtering
  // by suppliers.created_at would silently drop returning suppliers. Instead,
  // scope to whoever has at least one sauce entered for the current year.
  const { data: currentSeasonSupplierLinks } = await supabase
    .from('sauces')
    .select('supplier_id')
    .eq('competition_year', COMPETITION_YEAR)

  const currentSeasonSupplierIds = Array.from(
    new Set((currentSeasonSupplierLinks || []).map((s) => s.supplier_id).filter(Boolean))
  )

  const { data: suppliers } = (
    currentSeasonSupplierIds.length > 0
      ? await supabase
          .from('suppliers')
          .select(
            'id, brand_name, email, tracking_number, postal_service_name, package_status, package_received_at, country, region'
          )
          .in('id', currentSeasonSupplierIds)
          .order('package_status', { ascending: true })
      : { data: [], error: null }
  ) as { data: any[] | null; error: any }

  const { data: shippingJudges } = await supabase
    .from('judges')
    .select(
      'id, name, email, type, address, address_line2, city, postal_code, state, country, dhl_tracking_number, dhl_label_url, label_generated_at, label_generation_error'
    )
    .in('type', ['pro', 'community', 'supplier'])
    .order('type', { ascending: true }) as { data: any[] | null; error: any }

  const { count: eventOpenCount } = await supabase
    .from('sauces')
    .select('*', { count: 'exact', head: true })
    .eq('event_open', true)

  const resultsData = await getResultsData()
  const shippingOpen = await getCompetitionSetting('shipping_open')
  const judgesDashboardOpen = await getCompetitionSetting('judges_dashboard_open')
  const resultsResults = 'results' in resultsData ? resultsData.results : []
  const resultsScoringCategories = 'scoringCategories' in resultsData ? resultsData.scoringCategories : []

  if (error) {
    return <p className="text-red-400">Error loading sauces: {error.message}</p>
  }

  if (!sauces) {
    return <p className="text-gray-300">No sauces found.</p>
  }

  const totalSauces = sauces.length
  const paidSauces = sauces.filter((sauce) => sauce.payment_status === 'paid').length
  const confirmedDeferredSauces = sauces.filter(
    (sauce) => sauce.payment_status === 'pending_payment' && paymentStatusById.get(sauce.payment_id) === 'deferred'
  ).length
  const unpaidSauces = sauces.filter((sauce) => sauce.payment_status === 'pending_payment').length - confirmedDeferredSauces
  const statusCounts = sauces.reduce((acc, sauce) => {
    const statusKey = sauce.status || 'unknown'
    acc[statusKey] = (acc[statusKey] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  const missingCodes = sauces.filter((sauce) => !sauce.sauce_code).length

  const totalSuppliers = suppliers?.length ?? 0
  const packagesInTransit =
    suppliers?.filter((supplier) => supplier.package_status === 'shipped').length ?? 0
  const packagesAwaitingCheckIn =
    suppliers?.filter((supplier) => supplier.package_status !== 'received').length ?? 0
  const packagesReceived =
    suppliers?.filter((supplier) => supplier.package_status === 'received').length ?? 0

  const statusHighlights = (Object.entries(statusCounts) as Array<[string, number]>)
    .sort(([, countA], [, countB]) => countB - countA)
    .slice(0, 4)

  const overviewStats = [
    { label: 'Total Sauces', value: totalSauces },
    { label: 'Paid Sauces', value: paidSauces, highlight: true },
    { label: 'Confirmed (Due Jan)', value: confirmedDeferredSauces },
    { label: 'Unconfirmed / Unpaid', value: unpaidSauces, warning: unpaidSauces > 0 },
    { label: 'Missing Codes', value: missingCodes },
    { label: 'Packages In Transit', value: packagesInTransit },
    { label: 'Awaiting Check-In', value: packagesAwaitingCheckIn },
    { label: 'Packages Received', value: packagesReceived },
    { label: 'Suppliers', value: totalSuppliers },
  ]

  const tabs = [
    {
      id: 'overview',
      label: 'Overview',
      icon: '📊',
      content: (
        <div className="space-y-6">
          <Card>
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-2">
                <h2 className="text-2xl font-semibold text-gray-900">Admin Control Panel</h2>
                <p className="text-sm text-gray-600">
                  Monitor competition flow, keep logistics on track, and publish updates from one place.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <ExportResultsButton />
              </div>
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {overviewStats.map((stat) => (
                <div key={stat.label} className={`rounded-xl border px-4 py-3 ${
                  stat.warning
                    ? 'border-orange-300 bg-orange-50'
                    : stat.highlight
                    ? 'border-green-300 bg-green-50'
                    : 'border-gray-200 bg-gray-50'
                }`}>
                  <p className={`text-xs font-medium uppercase tracking-wide ${
                    stat.warning ? 'text-orange-700' : stat.highlight ? 'text-green-700' : 'text-gray-500'
                  }`}>{stat.label}</p>
                  <p className={`mt-1 text-2xl font-semibold ${
                    stat.warning ? 'text-orange-900' : stat.highlight ? 'text-green-900' : 'text-gray-900'
                  }`}>{stat.value}</p>
                </div>
              ))}
            </div>
          </Card>
          {unpaidSauces > 0 && (
            <Card>
              <SendPaymentRemindersButton />
            </Card>
          )}
        </div>
      ),
    },
    {
      id: 'sauces',
      label: 'Sauce Management',
      icon: '🌶️',
      content: (
        <div className="space-y-6">
          <SectionHeading
            title="Sauce Overview"
            description="Track every entry at a glance and manage status updates as bottles move through the process."
          />
          {statusHighlights.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {statusHighlights.map(([status, count]) => (
                <Card key={status} padding="p-4">
                  <p className="text-sm font-medium text-gray-600">{formatStatusLabel(status)}</p>
                  <p className="mt-2 text-3xl font-semibold text-gray-900">{count}</p>
                </Card>
              ))}
            </div>
          ) : null}
          <Card padding="p-0">
            <div className="overflow-x-auto rounded-2xl">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-100 text-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-left">Code</th>
                    <th className="px-4 py-3 text-left">Brand</th>
                    <th className="px-4 py-3 text-left">Sauce Name</th>
                    <th className="px-4 py-3 text-left">Category</th>
                    <th className="px-4 py-3 text-left">Payment</th>
                    <th className="px-4 py-3 text-left">Status</th>
                    <th className="px-4 py-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sauces.map((sauce) => (
                    <tr key={sauce.id} className="border-t text-sm">
                      <td className="whitespace-nowrap px-4 py-3">
                        {sauce.sauce_code ? (
                          <span className="rounded bg-gray-100 px-2 py-1 font-mono text-sm font-semibold">
                            {sauce.sauce_code}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-700">{sauce.suppliers?.brand_name || 'N/A'}</td>
                      <td className="px-4 py-3 text-gray-900">{sauce.name}</td>
                      <td className="px-4 py-3 text-gray-600">{sauce.category}</td>
                      <td className="px-4 py-3">
                        {(() => {
                          const isConfirmedDeferred =
                            sauce.payment_status === 'pending_payment' && paymentStatusById.get(sauce.payment_id) === 'deferred'
                          return (
                            <span
                              className={`rounded-full px-2 py-1 text-xs font-semibold ${
                                sauce.payment_status === 'paid'
                                  ? 'bg-green-100 text-green-800'
                                  : isConfirmedDeferred
                                  ? 'bg-blue-100 text-blue-800'
                                  : sauce.payment_status === 'pending_payment'
                                  ? 'bg-orange-100 text-orange-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {sauce.payment_status === 'paid'
                                ? '✓ Paid'
                                : isConfirmedDeferred
                                ? '📅 Confirmed (Jan)'
                                : sauce.payment_status === 'pending_payment'
                                ? '⚠ Unconfirmed'
                                : 'Waived'}
                            </span>
                          )
                        })()}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2 py-1 text-xs font-semibold ${
                            sauce.status === 'registered'
                              ? 'bg-blue-200 text-blue-800'
                              : sauce.status === 'arrived'
                              ? 'bg-yellow-200 text-yellow-800'
                              : sauce.status === 'boxed'
                              ? 'bg-purple-200 text-purple-800'
                              : 'bg-green-200 text-green-800'
                          }`}
                        >
                          {formatStatusLabel(sauce.status)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-2">
                          <SauceStatusUpdater sauceId={sauce.id} currentStatus={sauce.status} />
                          {sauce.payment_status === 'pending_payment' && (
                            <BypassPaymentButton
                              sauceId={sauce.id}
                              sauceName={sauce.name}
                              brandName={sauce.suppliers?.brand_name || 'Unknown'}
                            />
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      ),
    },
    {
      id: 'logistics',
      label: 'Logistics & Packing',
      icon: '📦',
      content: (
        <div className="space-y-6">
          <SectionHeading
            title="Logistics & Packing"
            description="Stay on top of supplier shipments and keep judging boxes moving."
          />
          <SettingToggle
            settingKey="shipping_open"
            title="Shipping window"
            description={'Controls whether the "Ship your samples" instructions show on the supplier dashboard. Keep this closed until payment and shipping logistics are ready — suppliers see a "more info coming" message instead.'}
            initialEnabled={shippingOpen}
            competitionYear={COMPETITION_YEAR}
            closeConfirmMessage={`Close the shipping window for ${COMPETITION_YEAR}? Suppliers will stop seeing shipping instructions on their dashboard.`}
          />
          <Card>
            <PackageReceiveScanner />
          </Card>
          {suppliers && suppliers.length > 0 ? (
            <Card>
              <PackageTracker
                suppliers={suppliers.map((supplier) => ({
                  id: supplier.id,
                  brandName: supplier.brand_name,
                  email: supplier.email,
                  trackingNumber: supplier.tracking_number,
                  postalServiceName: supplier.postal_service_name,
                  packageStatus: supplier.package_status || 'pending',
                  packageReceivedAt: supplier.package_received_at,
                }))}
              />
            </Card>
          ) : null}
          <Card>
            <BoxManagement />
          </Card>
        </div>
      ),
    },
    {
      id: 'box-packing',
      label: 'Box Packing',
      icon: '📬',
      content: (
        <div className="space-y-6">
          <SectionHeading
            title="Box Packing Scanner"
            description="Scan judge and sauce QR codes to assign sauces to judging boxes."
          />
          <AdminBoxPacker />
        </div>
      ),
    },
    {
      id: 'assets',
      label: 'Assets & Labels',
      icon: '🏷️',
      content: (
        <div className="space-y-6">
          <SectionHeading
            title="Assets & Collateral"
            description="Generate stickers and judge labels without leaving the dashboard."
          />
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <StickerGenerator />
            </Card>
            <Card>
              <JudgeLabelGenerator />
            </Card>
          </div>
          <Card>
            <JarLabelGenerator />
          </Card>
        </div>
      ),
    },
    {
      id: 'results',
      label: 'Results',
      icon: '🏆',
      content: (
        <div className="space-y-6">
          <SectionHeading
            title="Judging Results"
            description="Live weighted scores. Pro ×2.0 · Community ×1.0 · Supplier ×1.0. Paid sauces only."
          />
          <Card padding="p-6">
            <ResultsTable results={resultsResults} scoringCategories={resultsScoringCategories} />
          </Card>
        </div>
      ),
    },
    {
      id: 'admin',
      label: 'Administration',
      icon: '⚙️',
      content: (
        <div className="space-y-6">
          <SectionHeading
            title="Administration"
            description="Manage access and website updates from a single place."
          />
          <SettingToggle
            settingKey="judges_dashboard_open"
            title="Judges dashboard"
            description="Controls whether any judge (pro, community, or event) can access the judges dashboard at all — checked before payment/active status, so it blocks everyone uniformly. Keep this closed until the 2027 judging dashboard and approval/payment pipeline are ready; judges see a 'not open yet' message instead."
            initialEnabled={judgesDashboardOpen}
            competitionYear={COMPETITION_YEAR}
            closeConfirmMessage={`Close the judges dashboard for ${COMPETITION_YEAR}? All judges (regardless of active/payment status) will be blocked and see a "not open yet" message instead.`}
          />
          <Card>
            <JudgeAnalysis />
          </Card>
          <Card>
            <ProJudgeApproval />
          </Card>
          <Card>
            <AddAdminUser />
          </Card>
          <Card>
            <EventJudgingManager
              eventOpenCount={eventOpenCount ?? 0}
              totalSauceCount={totalSauces}
            />
          </Card>
          <Card>
            <EventsManager />
          </Card>
          <Card>
            <SupplierCountryManager
              suppliers={(suppliers || []).map((s) => ({
                id: s.id,
                brand_name: s.brand_name,
                country: s.country ?? null,
                region: s.region ?? 'european',
              }))}
            />
          </Card>
        </div>
      ),
    },
    {
      id: 'shipping',
      label: 'DHL Shipping',
      icon: '🚚',
      content: (
        <div className="space-y-6">
          <SectionHeading
            title="DHL Shipping — Judge Boxes"
            description="Generate DHL shipping labels for outgoing judging boxes. Labels print separately from judging labels."
          />
          <Card>
            <DhlLabelScanner />
          </Card>
          <Card>
            <JudgeShippingManager judges={shippingJudges || []} />
          </Card>
        </div>
      ),
    },
    {
      id: 'marketing',
      label: 'Marketing',
      icon: '📧',
      content: (
        <div className="space-y-6">
          <SectionHeading
            title="Marketing & Outreach"
            description="Manage email campaigns and customize email templates."
          />
          <Card>
            <VatInvoiceSender />
          </Card>
          <Card>
            <ResultsFeedbackSender />
          </Card>
          <Card>
            <WinnersAnnouncementSender />
          </Card>
          <Card>
            <JudgingReminderSender />
          </Card>
          <Card>
            <EmailTemplateEditor />
          </Card>
          <Card>
            <EmailCampaignManager />
          </Card>
        </div>
      ),
    },
  ]

  return <AdminTabs tabs={tabs} />
}
