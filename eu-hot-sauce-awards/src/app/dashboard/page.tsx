import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { COMPETITION_YEAR } from '@/lib/config'
import LogoutButton from './LogoutButton'
import AdminDashboard from './AdminDashboard'
import CommunityJudgeDashboard from './CommunityJudgeDashboard'
import SupplierDashboard from './SupplierDashboard'
import StripeCheckoutButton from './StripeCheckoutButton'

export const dynamic = 'force-dynamic'

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
    .select('id, type, open_judging, stripe_payment_status, address, address_line2, city, postal_code, state, country, dhl_tracking_number, dhl_label_url')
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
        const priority = { admin: 0, pro: 1, supplier: 2, community: 3, event: 4 };
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
        return <CommunityJudgeDashboard
          openJudging={judge.open_judging ?? false}
          shippingAddress={{
            address: judge.address,
            address_line2: judge.address_line2,
            city: judge.city,
            postal_code: judge.postal_code,
            state: judge.state,
            country: judge.country,
          }}
          trackingNumber={judge.dhl_tracking_number}
          labelUrl={judge.dhl_label_url}
        />
      case 'supplier': {
        // Fetch supplier data for dashboard
        const { data: supplier } = await supabase
          .from('suppliers')
          .select('id, brand_name, package_status, package_received_at')
          .ilike('email', user.email!)
          .single();

        if (!supplier) {
          return <p>Supplier profile not found. Please contact support.</p>;
        }

        // Fetch entered (paid) sauces for current competition year
        const { data: enteredSauces } = await supabase
          .from('sauces')
          .select('id, name, category, image_path, status')
          .eq('supplier_id', supplier.id)
          .in('payment_status', ['paid', 'payment_waived'])
          .gte('created_at', `${COMPETITION_YEAR - 1}-09-01`)
          .lt('created_at', `${COMPETITION_YEAR + 1}-01-01`)
          .order('created_at', { ascending: false });

        return <SupplierDashboard
          supplierData={{
            brandName: supplier.brand_name,
            packageStatus: supplier.package_status || 'pending',
            packageReceivedAt: supplier.package_received_at,
          }}
          judgeData={{
            address: judge.address,
            address_line2: judge.address_line2,
            city: judge.city,
            postal_code: judge.postal_code,
            state: judge.state,
            country: judge.country,
            dhl_tracking_number: judge.dhl_tracking_number,
            dhl_label_url: judge.dhl_label_url,
          }}
          enteredSauces={enteredSauces || []}
        />;
      }
      case 'community':
        if (judge.stripe_payment_status === 'succeeded') {
          return <CommunityJudgeDashboard
            openJudging={judge.open_judging ?? false}
            shippingAddress={{
              address: judge.address,
              address_line2: judge.address_line2,
              city: judge.city,
              postal_code: judge.postal_code,
              state: judge.state,
              country: judge.country,
            }}
            trackingNumber={judge.dhl_tracking_number}
            labelUrl={judge.dhl_label_url}
          />
        }
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Payment Required</h2>
            <p>To participate as a community judge, you must first pay the €15 entry fee.</p>
            <StripeCheckoutButton judgeId={judge.id} email={user.email!} />
          </div>
        )
      case 'event':
        return <CommunityJudgeDashboard
          isEventJudge={true}
          openJudging={true}
          shippingAddress={{ address: null, address_line2: null, city: null, postal_code: null, state: null, country: null }}
          trackingNumber={null}
          labelUrl={null}
        />
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
