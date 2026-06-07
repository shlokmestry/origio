import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getResend } from '@/lib/resend'

const RATE_LIMIT = new Map<string, number>()

const SYM: Record<string, string> = { eur: '€', usd: '$', gbp: '£', jpy: '¥' }
const RATES: Record<string, number> = { eur: 1, usd: 1.07, gbp: 0.85, jpy: 165 }

function supabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

function buildHtml(cities: { name: string; country: string; total: number; sym: string }[], currency: string, shareUrl: string): string {
  const cheapest = [...cities].sort((a, b) => a.total - b.total)[0]
  const cityRows = cities.map(c => {
    const isCheap = c.name === cheapest.name && cities.length > 1
    const borderColor = isCheap ? '#00ffd5' : '#2a2a2a'
    const totalColor = isCheap ? '#00ffd5' : '#f0b07a'
    const badgeHtml = isCheap ? `<div style="font-size:11px;color:#00ffd5;margin-top:4px;letter-spacing:0.1em;text-transform:uppercase;">↓ Best deal</div>` : ''
    return `
      <div style="margin-bottom:16px;padding:16px 20px;background:#1a1a1a;border-left:3px solid ${borderColor};">
        <div style="font-size:13px;font-weight:700;color:#f0f0e8;margin-bottom:4px;font-family:sans-serif;">${c.name} · ${c.country}</div>
        <div style="font-size:22px;font-weight:900;color:${totalColor};font-family:sans-serif;">
          ${c.sym}${Math.round(c.total).toLocaleString()}<span style="font-size:13px;font-weight:400;color:#555550;"> /mo</span>
        </div>
        ${badgeHtml}
      </div>`
  }).join('')

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="background:#0a0a0a;margin:0;padding:0;font-family:sans-serif;">
  <div style="max-width:520px;margin:40px auto;padding:40px 32px;background:#111111;border:1px solid #2a2a2a;">
    <div style="font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#555550;margin-bottom:24px;">ORIGIO · City Comparison</div>
    <div style="font-size:26px;font-weight:900;color:#f0f0e8;margin-bottom:12px;line-height:1.1;">Your city cost breakdown.</div>
    <div style="font-size:14px;color:#666660;margin-bottom:28px;line-height:1.6;">Here's the monthly cost comparison you built, saved so you can reference it later.</div>
    <hr style="border:none;border-top:1px solid #2a2a2a;margin-bottom:24px;">
    ${cityRows}
    <hr style="border:none;border-top:1px solid #2a2a2a;margin:24px 0;">
    <a href="${shareUrl}" style="display:inline-block;background:#00ffd5;color:#0a0a0a;font-weight:800;font-size:12px;letter-spacing:0.15em;text-transform:uppercase;padding:14px 28px;text-decoration:none;">View comparison &rarr;</a>
    <div style="font-size:12px;color:#444440;margin-top:32px;line-height:1.6;">All costs are estimates for a single person. Rent is 1BR city centre. Numbers shown in ${currency.toUpperCase()}.</div>
    <div style="font-size:11px;color:#333330;margin-top:24px;">findorigio.com &middot; Dublin, Ireland</div>
  </div>
</body>
</html>`
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

  await supabase().from('city_comparison_leads').insert({
    email,
    cities: cities.map(c => c.slug),
    currency,
    cost_snapshot: costSnapshot,
  })

  const cityRows = cities.map(c => ({ name: c.name, country: c.country, total: c.total * rate, sym }))
  const html = buildHtml(cityRows, currency, shareUrl)

  const resend = getResend()
  await resend.emails.send({
    from: 'Origio <hello@findorigio.com>',
    to: email,
    subject: `Your city comparison: ${cities.map(c => c.name).join(' vs ')}`,
    html,
  })

  return NextResponse.json({ ok: true })
}
