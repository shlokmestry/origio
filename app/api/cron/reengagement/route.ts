import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createElement } from 'react'
import { getResend } from '@/lib/resend'
import { signUnsubscribeToken } from '@/lib/unsubscribeToken'
import ReengagementNudge from '@/emails/ReengagementNudge'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

const WIZARD_AGE_DAYS = 3
const BATCH_LIMIT = 50

interface TopCountry {
  slug: string
  name: string
  flagEmoji: string
  matchPercent: number
}

function adminSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET
  const authHeader = request.headers.get('authorization')
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ ok: false }, { status: 401 })
  }
  if (!process.env.UNSUBSCRIBE_SECRET) {
    return NextResponse.json({ ok: false, error: 'UNSUBSCRIBE_SECRET is not set' }, { status: 500 })
  }

  const supabase = adminSupabase()
  const cutoff = new Date(Date.now() - WIZARD_AGE_DAYS * 24 * 60 * 60 * 1000).toISOString()

  const { data: wizardResults, error: wizardError } = await supabase
    .from('wizard_results')
    .select('user_id, top_countries, created_at')
    .lte('created_at', cutoff)
    .limit(200)

  if (wizardError || !wizardResults?.length) {
    return NextResponse.json({ ok: true, sent: 0, reason: 'no eligible wizard results' })
  }

  const userIds = wizardResults.map((w) => w.user_id).filter(Boolean) as string[]

  const { data: profiles, error: profileError } = await supabase
    .from('profiles')
    .select('id, email, full_name, is_pro, reengagement_email_sent_at, marketing_opt_out')
    .in('id', userIds)

  if (profileError || !profiles) {
    return NextResponse.json({ ok: false, error: 'failed to load profiles' }, { status: 500 })
  }

  const profileById = new Map(profiles.map((p) => [p.id, p]))
  const resend = getResend()

  let sent = 0
  const errors: string[] = []

  for (const result of wizardResults) {
    if (sent >= BATCH_LIMIT) break
    if (!result.user_id) continue

    const profile = profileById.get(result.user_id)
    if (!profile) continue
    if (!profile.email) continue
    if (profile.is_pro) continue
    if (profile.marketing_opt_out) continue
    if (profile.reengagement_email_sent_at) continue

    const topCountries = result.top_countries as TopCountry[] | null
    const topCountry = topCountries?.[0]
    if (!topCountry) continue

    const name = profile.full_name?.split(' ')[0] ?? ''
    const unsubscribeUrl =
      `https://findorigio.com/api/unsubscribe?uid=${encodeURIComponent(profile.id)}` +
      `&token=${signUnsubscribeToken(profile.id)}`

    try {
      await resend.emails.send({
        from: 'Origio <hello@findorigio.com>',
        to: profile.email,
        subject: `Still thinking about ${topCountry.name}?`,
        react: createElement(ReengagementNudge, { name, topCountry, unsubscribeUrl }),
      })

      await supabase
        .from('profiles')
        .update({ reengagement_email_sent_at: new Date().toISOString() })
        .eq('id', profile.id)

      sent++
    } catch (err) {
      errors.push(`${profile.id}: ${err instanceof Error ? err.message : 'unknown error'}`)
    }
  }

  return NextResponse.json({ ok: true, sent, errors: errors.length ? errors : undefined })
}
