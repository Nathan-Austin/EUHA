import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import LogoutButton from './LogoutButton'
import AdminDashboard from './AdminDashboard'
import CommunityJudgeDashboard from './CommunityJudgeDashboard'
import SupplierDashboard from './SupplierDashboard'
import StripeCheckoutButton from './StripeCheckoutButton'

export default async function DashboardPage() {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  const { data: { user } } = await supabase.auth.getUser()

  if (!user || !user.email) {
    redirect('/login')
  }

  // Fetch judge details - use maybeSingle to handle cases where user might not be a judge
  const { data: judges, error: judgeQueryError } = await supabase
    .from('judges')
    .select('id, type, stripe_payment_status')
    .ilike('email', user.email)

  if (judgeQueryError) {
    return (
        <div className="flex items-center justify-center min-h-screen bg-[#08040e]">
            <div className="w-full max-w-md p-8 space-y-6 text-center bg-white rounded-lg shadow-md">
                <h1 className="text-xl font-bold text-red-600">Error</h1>
                <p>Could not retrieve your user profile. Please contact support.</p>
                <p className="font-mono text-sm">{judgeQueryError?.message}</p>
                <LogoutButton />
            </div>
      </div>
    )
  }

  // Take the first judge record (in case of duplicates, prioritize by type)
  const judge = judges && judges.length > 0
    ? judges.sort((a, b) => {
        const priority = { admin: 0, pro: 1, supplier: 2, community: 3 };
        return (priority[a.type as keyof typeof priority] || 99) - (priority[b.type as keyof typeof priority] || 99);
      })[0]
    : null;

  if (!judge) {
    // User exists in auth but not in judges table
    return (
        <div className="flex items-center justify-center min-h-screen bg-[#08040e]">
            <div className="w-full max-w-md p-8 space-y-6 text-center bg-white rounded-lg shadow-md">
                <h1 className="text-xl font-bold text-red-600">Access Denied</h1>
                <p>No judge or supplier profile found for this email. Please contact support.</p>
                <LogoutButton />
            </div>
      </div>
    )
  }

  const renderDashboard = async () => {
    switch (judge.type) {
      case 'admin':
        return <AdminDashboard />
      case 'pro':
        return <CommunityJudgeDashboard />
      case 'supplier': {
        // Fetch supplier data for dashboard
        const { data: supplier } = await supabase
          .from('suppliers')
          .select('id, brand_name, tracking_number, postal_service_name, package_status, package_received_at')
          .ilike('email', user.email!)
          .single();

        if (!supplier) {
          return <p>Supplier profile not found. Please contact support.</p>;
        }

        // Check for pending payments
        const { data: pendingPayments } = await supabase
          .from('supplier_payments')
          .select('id, entry_count, discount_percent, subtotal_cents, discount_cents, amount_due_cents, stripe_payment_status')
          .eq('supplier_id', supplier.id)
          .neq('stripe_payment_status', 'succeeded')
          .order('created_at', { ascending: false })
          .limit(1);

        const pendingPayment = pendingPayments && pendingPayments.length > 0 ? pendingPayments[0] : null;

        return <SupplierDashboard
          supplierData={{
            brandName: supplier.brand_name,
            trackingNumber: supplier.tracking_number,
            postalServiceName: supplier.postal_service_name,
            packageStatus: supplier.package_status || 'pending',
            packageReceivedAt: supplier.package_received_at,
          }}
          pendingPayment={pendingPayment}
          userEmail={user.email!}
        />;
      }
      case 'community':
        if (judge.stripe_payment_status === 'succeeded') {
          return <CommunityJudgeDashboard />
        }
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Payment Required</h2>
            <p>To participate as a community judge, you must first pay the €15 entry fee.</p>
            <StripeCheckoutButton judgeId={judge.id} email={user.email!} />
          </div>
        )
      default:
        return <p>Unknown user type. Please contact support.</p>
    }
  }

  const dashboardContent = await renderDashboard()

  if (judge.type === 'admin') {
    return (
      <div className="min-h-screen bg-[#08040e]">
        <header className="border-b bg-white shadow-sm">
          <div className="flex flex-col gap-4 px-4 py-6 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-10">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-sm text-gray-600">Logged in as {user.email}</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <LogoutButton />
            </div>
          </div>
        </header>
        <main className="w-full px-4 py-8 sm:px-6 lg:px-10">
          <div className="w-full">{dashboardContent}</div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#08040e]">
      <div className="w-full max-w-2xl overflow-hidden rounded-lg bg-white shadow-md">
        <div className="space-y-6 p-8">
          <header className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Dashboard</h1>
              <p className="text-sm text-gray-600">Logged in as {user.email}</p>
            </div>
            <LogoutButton />
          </header>
          <main className="border-t pt-4">{dashboardContent}</main>
        </div>
      </div>
    </div>
  )
}
