import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { COMPETITION_YEAR } from '@/lib/config'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // Protected routes that require authentication
  const protectedPaths = ['/dashboard', '/judge']
  const isProtectedPath = protectedPaths.some(path => request.nextUrl.pathname.startsWith(path))

  // Redirect to login if accessing protected route without auth
  if (isProtectedPath && !user) {
    const redirectUrl = new URL('/login', request.url)
    return NextResponse.redirect(redirectUrl)
  }

  // For authenticated users on protected routes, check permissions
  if (isProtectedPath && user) {
    // Ensure user has an email
    if (!user.email) {
      const redirectUrl = new URL('/login', request.url)
      return NextResponse.redirect(redirectUrl)
    }

    const { data: judge } = await supabase
      .from('judges')
      .select('type, active, stripe_payment_status')
      .ilike('email', user.email)
      .single()

    if (judge) {
      // Admins bypass most checks (but still check on /judge routes below)
      const isAdmin = judge.type === 'admin'

      // Community judges must have paid
      if (judge.type === 'community' && judge.stripe_payment_status !== 'succeeded') {
        // Only redirect if not already on dashboard (dashboard shows payment button)
        if (request.nextUrl.pathname.startsWith('/judge')) {
          const redirectUrl = new URL('/dashboard', request.url)
          return NextResponse.redirect(redirectUrl)
        }
      }

      // All judges except admin must be active
      if (!judge.active && !isAdmin) {
        // Allow dashboard access (shows appropriate message)
        if (request.nextUrl.pathname.startsWith('/judge')) {
          const redirectUrl = new URL('/dashboard', request.url)
          return NextResponse.redirect(redirectUrl)
        }
      }

      // CRITICAL: Check year-specific participation for /judge routes
      // This prevents judges from previous years accessing current year judging
      if (request.nextUrl.pathname.startsWith('/judge') && !isAdmin) {
        const { data: participation } = await supabase
          .from('judge_participations')
          .select('accepted')
          .ilike('email', user.email!) // user.email is guaranteed to exist due to guard clause above
          .eq('year', COMPETITION_YEAR)
          .single()

        // Redirect to dashboard if not accepted for current year
        if (!participation || participation.accepted !== true) {
          const redirectUrl = new URL('/dashboard', request.url)
          return NextResponse.redirect(redirectUrl)
        }
      }
    }
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
