import { waitUntil } from '@vercel/functions'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { sendAllResultsFeedbackEmails } from '@/app/actions'

export const maxDuration = 300

export async function POST(req: NextRequest) {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  const { data: { user } } = await supabase.auth.getUser()
  if (!user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: adminCheck } = await supabase
    .from('judges')
    .select('type')
    .ilike('email', user.email)
    .single()

  if (adminCheck?.type !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  waitUntil(sendAllResultsFeedbackEmails(user.email))

  return NextResponse.json({ started: true })
}
