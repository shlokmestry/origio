import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getResend } from '@/lib/resend'
import { render } from '@react-email/render'
import CityComparison from '@/emails/CityComparison'

const RATE_LIMIT = new Map<string, number>()

const SYM: Record<string, string> = { eur: '€', usd: '$', gbp: '£', jpy: '¥' }
const RATES: Record<string, number> = { eur: 1, usd: 1.07, gbp: 0.85, jpy: 165 }

function supabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  const now = Date.now()
  const last = RATE_LIMIT.get(ip) ?? 0
  if (now - last < 60_000) {
    return NextResponse.json({ error: 'Rate limited' }, { status: 429 })
  }
  RATE_LIMIT.set(ip, now)

  let body: {
    email: string
    cities: { slug: string; name: string; country: string; total: number }[]
    currency: string
    shareUrl: string
  }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 })
  }

  const { email, cities, currency, shareUrl } = body
  if (!email || !email.includes('@') || !Array.isArray(cities) || cities.length < 2) {
    return NextResponse.json({ error: 'Invalid data' }, { status: 400 })
  }

  const sym = SYM[currency] ?? '€'
  const rate = RATES[currency] ?? 1

  const costSnapshot: Record<string, number> = {}
  cities.forEach(c => { costSnapshot[c.slug] = c.total })

  // Save to DB
  const db = supabase()
  await db.from('city_comparison_leads').insert({
    email,
    cities: cities.map(c => c.slug),
    currency,
    cost_snapshot: costSnapshot,
  })

  // Send email
  const resend = getResend()
  const cityRows = cities.map(c => ({
    name: c.name,
    country: c.country,
    total: c.total * rate,
    currency,
    sym,
  }))

  const html = await render(CityComparison({ cities: cityRows, shareUrl }))

  await resend.emails.send({
    from: 'Origio <hello@findorigio.com>',
    to: email,
    subject: `Your city comparison: ${cities.map(c => c.name).join(' vs ')}`,
    html,
  })

  return NextResponse.json({ ok: true })
}
