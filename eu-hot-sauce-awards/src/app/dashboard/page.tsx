import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import LogoutButton from './LogoutButton'
import AdminDashboard from './AdminDashboard'
import JudgeDashboard from './JudgeDashboard'
import CommunityJudgeDashboard from './CommunityJudgeDashboard'
import StripeCheckoutButton from './StripeCheckoutButton'

export default async function DashboardPage() {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  const { data: { user } } = await supabase.auth.getUser()

  if (!user || !user.email) {
    redirect('/login')
  }

  // Fetch judge details
  const { data: judge, error } = await supabase
    .from('judges')
    .select('id, type, stripe_payment_status')
    .eq('email', user.email)
    .single()

  if (error || !judge) {
    // This could happen if a user exists in auth but not in the judges table
    // Or if RLS policy fails.
    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="w-full max-w-md p-8 space-y-6 text-center bg-white rounded-lg shadow-md">
                <h1 className="text-xl font-bold text-red-600">Error</h1>
                <p>Could not retrieve your user profile. Please contact support.</p>
                <p className="font-mono text-sm">{error?.message}</p>
                <LogoutButton />
            </div>
      </div>
    )
  }

  const renderDashboard = () => {
    switch (judge.type) {
      case 'admin':
        return <AdminDashboard />
      case 'pro':
        return <JudgeDashboard />
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

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-2xl bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-8 space-y-6">
          <header className="flex items-center justify-between">
              <div>
                  <h1 className="text-2xl font-bold">Dashboard</h1>
                  <p className="text-sm text-gray-600">Logged in as {user.email}</p>
              </div>
              <LogoutButton />
          </header>
          <main className="pt-4 border-t">
              {renderDashboard()}
          </main>
        </div>
      </div>
    </div>
  )
}
