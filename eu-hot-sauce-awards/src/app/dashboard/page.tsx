export const maxDuration = 300

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { COMPETITION_YEAR } from '@/lib/config'
import LogoutButton from './LogoutButton'
import AdminDashboard from './AdminDashboard'
import CommunityJudgeDashboard from './CommunityJudgeDashboard'
import SupplierDashboard from './SupplierDashboard'
import StripeCheckoutButton from './StripeCheckoutButton'
import { getSupplierUnpaidSauces, getCompetitionSetting } from '@/app/actions'

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
          .select(`
            id, brand_name, contact_name, package_status, package_received_at,
            ehc_id, ehc_status, ehc_verified_at,
            address_street, address_house_number, address_line2, city, state, postal_code, country, phone,
            bio, website, instagram, logo_path, ehc_sync_consent
          `)
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
          .eq('competition_year', COMPETITION_YEAR)
          .order('created_at', { ascending: false });

        // Has this supplier already opted in to the current competition year?
        // Either they've explicitly entered via the dashboard gate, or they
        // already have a sauce (paid or not) recorded for this year.
        const { data: participation } = await supabase
          .from('supplier_participations')
          .select('participated')
          .ilike('email', user.email!)
          .eq('year', COMPETITION_YEAR)
          .maybeSingle();

        const unpaidSaucesResult = await getSupplierUnpaidSauces();
        const unpaidSauces = 'data' in unpaidSaucesResult ? unpaidSaucesResult.data : [];

        const hasOptedIn = Boolean(participation?.participated)
          || (enteredSauces?.length ?? 0) > 0
          || unpaidSauces.length > 0;

        const { data: pendingPayment, error: pendingPaymentError } = await supabase
          .from('supplier_payments')
          .select('id, stripe_payment_status, entry_count')
          .eq('supplier_id', supplier.id)
          .eq('competition_year', COMPETITION_YEAR)
          .neq('stripe_payment_status', 'succeeded')
          .maybeSingle();

        if (pendingPaymentError) {
          console.error('Failed to look up pending payment:', pendingPaymentError);
        }

        const shippingOpen = await getCompetitionSetting('shipping_open');

        return <SupplierDashboard
          supplierData={{
            brandName: supplier.brand_name,
            packageStatus: supplier.package_status || 'pending',
            packageReceivedAt: supplier.package_received_at,
          }}
          ehcData={{
            ehcId: supplier.ehc_id,
            ehcStatus: supplier.ehc_status,
            ehcVerifiedAt: supplier.ehc_verified_at,
          }}
          producerInfo={{
            brandName: supplier.brand_name,
            contactName: supplier.contact_name,
            addressStreet: supplier.address_street,
            addressHouseNumber: supplier.address_house_number,
            addressLine2: supplier.address_line2,
            city: supplier.city,
            state: supplier.state,
            postalCode: supplier.postal_code,
            country: supplier.country,
            phone: supplier.phone,
            bio: supplier.bio,
            website: supplier.website,
            instagram: supplier.instagram,
            logoPath: supplier.logo_path,
            ehcSyncConsent: supplier.ehc_sync_consent,
          }}
          enteredSauces={enteredSauces || []}
          hasOptedIn={hasOptedIn}
          unpaidSauces={unpaidSauces}
          hasExistingPayment={Boolean(pendingPayment)}
          paymentStatus={pendingPayment?.stripe_payment_status ?? null}
          confirmedEntryCount={pendingPayment?.entry_count ?? null}
          shippingOpen={shippingOpen}
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

  if (judge.type === 'supplier') {
    return (
      <div className="min-h-screen bg-[#faf6ec] text-black">
        <header className="border-b-4 border-black bg-[#F5C518]">
          <div className="mx-auto flex max-w-[1240px] flex-wrap items-center justify-between gap-4 px-6 py-4">
            <div className="flex items-center gap-3.5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/ehsa-badge.png" alt="European Hot Sauce Awards" className="h-11 w-11 flex-shrink-0" />
              <span className="font-[family-name:var(--font-archivo-black)] text-lg uppercase leading-none text-black">
                Supplier dashboard
                <small className="mt-1 block font-sans text-[11px] font-semibold tracking-[0.12em] text-black/70">
                  Logged in as {user.email}
                </small>
              </span>
            </div>
            <LogoutButton />
          </div>
        </header>
        <main className="mx-auto max-w-[1240px] px-6 py-10">{dashboardContent}</main>
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
