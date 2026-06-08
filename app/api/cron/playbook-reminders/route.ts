import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getResend } from '@/lib/resend'

// Vercel cron calls this daily at 08:00 UTC.
// Finds users with a playbook move_date set and todo steps starting within 7 days.
// Sends one reminder email per user per day (de-duped by updated_at).

const CRON_SECRET = process.env.CRON_SECRET

interface PlaybookState {
  progress: Record<string, string>
  moveDate?: string
  updatedAt: number
}

interface DueStep {
  id: string
  title: string
  daysBefore: number
}

// Minimal step metadata needed for the reminder — imported inline to avoid
// bundling the full playbookSteps module (which is client-only).
const STEP_DAYS: Record<string, { title: string; daysBefore: number }> = {
  // Shared across all countries (generic + overrides)
  p1: { title: 'Start your visa research', daysBefore: 180 },
  p2: { title: 'Gather required documents', daysBefore: 120 },
  p3: { title: 'Get documents translated', daysBefore: 90 },
  p4: { title: 'Book visa appointment', daysBefore: 90 },
  p5: { title: 'Submit visa application', daysBefore: 60 },
  m1: { title: 'Open a Wise account', daysBefore: 90 },
  m_wise: { title: 'Open a Wise account', daysBefore: 90 },
  m2: { title: 'Set your move budget', daysBefore: 90 },
  m3: { title: 'Research tax obligations', daysBefore: 60 },
  m4: { title: 'Notify your current bank', daysBefore: 30 },
  h1: { title: 'Research neighbourhoods', daysBefore: 60 },
  h2: { title: 'Browse mid-term rentals', daysBefore: 45 },
  h3: { title: 'Book short-stay for arrival week', daysBefore: 30 },
  l_sw: { title: 'Get health insurance', daysBefore: 30 },
  l1: { title: 'Arrange health cover', daysBefore: 30 },
  l2: { title: 'Notify your home tax authority', daysBefore: 14 },
  l3: { title: 'Sort your driving licence / IDP', daysBefore: 30 },
}

function getDueSteps(state: PlaybookState): DueStep[] {
  if (!state.moveDate) return []
  const moveDate = new Date(state.moveDate + 'T00:00:00')
  if (isNaN(moveDate.getTime())) return []

  const now = Date.now()
  const sevenDaysMs = 7 * 24 * 60 * 60 * 1000

  return Object.entries(STEP_DAYS)
    .filter(([id, meta]) => {
      if (state.progress[id] === 'done') return false
      const startBy = moveDate.getTime() - meta.daysBefore * 86400000
      // Due if the start-by date is within the next 7 days (and not already past by > 7 days)
      return startBy <= now + sevenDaysMs && startBy >= now - sevenDaysMs
    })
    .map(([id, meta]) => ({ id, title: meta.title, daysBefore: meta.daysBefore }))
    .sort((a, b) => b.daysBefore - a.daysBefore)
}

function buildEmail(email: string, countrySlug: string, moveDate: string, dueSteps: DueStep[]): string {
  const countryName = countrySlug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
  const moveDateFmt = new Date(moveDate + 'T00:00:00').toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric',
  })
  const stepLines = dueSteps
    .slice(0, 5)
    .map(s => `  • ${s.title}`)
    .join('\n')

  return `Hey,

Your ${countryName} move date is ${moveDateFmt}. Based on your playbook, these steps are coming up in the next 7 days:

${stepLines}

Pick up where you left off: https://findorigio.com/country/${countrySlug}/playbook

Shlok
Origio`
}

export async function GET(req: NextRequest) {
  // Verify this is called by Vercel cron (or a trusted internal caller)
  const authHeader = req.headers.get('authorization')
  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )

  // Fetch all playbook_progress rows updated in the last 30 days
  // (active users only — skip stale rows)
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  const { data: rows, error } = await admin
    .from('playbook_progress')
    .select('user_id, country_slug, state')
    .gte('updated_at', thirtyDaysAgo)

  if (error) {
    console.error('playbook-reminders: fetch error', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (!rows?.length) {
    return NextResponse.json({ sent: 0, message: 'No active playbooks' })
  }

  // Get user emails from auth.users via admin API
  const userIds = [...new Set(rows.map(r => r.user_id))]
  const { data: users, error: userErr } = await admin.auth.admin.listUsers({ perPage: 1000 })
  if (userErr) {
    console.error('playbook-reminders: user fetch error', userErr)
    return NextResponse.json({ error: userErr.message }, { status: 500 })
  }

  const emailByUserId = Object.fromEntries(
    (users?.users ?? [])
      .filter(u => userIds.includes(u.id) && u.email)
      .map(u => [u.id, u.email!])
  )

  const resend = getResend()
  let sent = 0

  for (const row of rows) {
    const email = emailByUserId[row.user_id]
    if (!email) continue

    const state = row.state as PlaybookState
    const dueSteps = getDueSteps(state)
    if (!dueSteps.length) continue

    try {
      await resend.emails.send({
        from: 'Shlok at Origio <hello@findorigio.com>',
        to: email,
        subject: `Playbook reminder: ${dueSteps.length} step${dueSteps.length > 1 ? 's' : ''} due for your ${row.country_slug.replace(/-/g, ' ')} move`,
        text: buildEmail(email, row.country_slug, state.moveDate!, dueSteps),
      })
      sent++
    } catch (err) {
      console.error(`playbook-reminders: failed to send to ${email}`, err)
    }
  }

  return NextResponse.json({ sent, total: rows.length })
}
