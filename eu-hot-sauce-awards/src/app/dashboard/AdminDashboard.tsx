import type { ReactNode } from 'react'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import SauceStatusUpdater from './SauceStatusUpdater'
import BoxManagement from './BoxManagement'
import ExportResultsButton from './ExportResultsButton'
import AddAdminUser from './AddAdminUser'
import StickerGenerator from './StickerGenerator'
import AdminBoxPacker from './AdminBoxPacker'
import JudgeLabelGenerator from './JudgeLabelGenerator'
import PackageTracker from './PackageTracker'
import EventsManager from './EventsManager'
import EmailCampaignManager from './EmailCampaignManager'
import EmailTemplateEditor from './EmailTemplateEditor'
import ProJudgeApproval from './ProJudgeApproval'
import AdminTabs from './AdminTabs'

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
        category,
        suppliers ( brand_name )
      `
    )
    .order('created_at', { ascending: false }) as { data: any[] | null; error: any }

  const { data: suppliers } = await supabase
    .from('suppliers')
    .select(
      'id, brand_name, email, tracking_number, postal_service_name, package_status, package_received_at'
    )
    .order('package_status', { ascending: true }) as { data: any[] | null; error: any }

  if (error) {
    return <p className="text-red-400">Error loading sauces: {error.message}</p>
  }

  if (!sauces) {
    return <p className="text-gray-300">No sauces found.</p>
  }

  const totalSauces = sauces.length
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
            <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {overviewStats.map((stat) => (
                <div key={stat.label} className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{stat.label}</p>
                  <p className="mt-1 text-2xl font-semibold text-gray-900">{stat.value}</p>
                </div>
              ))}
            </div>
          </Card>
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
                        <SauceStatusUpdater sauceId={sauce.id} currentStatus={sauce.status} />
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
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <AdminBoxPacker />
            </Card>
            <Card>
              <BoxManagement />
            </Card>
          </div>
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
          <Card>
            <ProJudgeApproval />
          </Card>
          <Card>
            <AddAdminUser />
          </Card>
          <Card>
            <EventsManager />
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
