import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getResend } from '@/lib/resend'
import { rateLimit } from '@/lib/rate-limit'
import { isValidEmail } from '@/lib/utils'

const SYM: Record<string, string> = { eur: '€', usd: '$', gbp: '£', jpy: '¥' }
const RATES: Record<string, number> = { eur: 1, usd: 1.07, gbp: 0.85, jpy: 165 }

function adminSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

function buildHtml(cities: { name: string; country: string; total: number; sym: string }[], currency: string, shareUrl: string): string {
  const sorted = [...cities].sort((a, b) => a.total - b.total)
  const cheapest = sorted[0]
  const dearest = sorted[sorted.length - 1]
  const maxTotal = dearest.total
  const sym = cities[0]?.sym ?? '€'

  // Savings callout: how much cheapest saves vs dearest per year
  const yearSaving = (dearest.total - cheapest.total) * 12
  const savingLine = cities.length >= 2 && yearSaving > 0
    ? `${sym}${Math.round(yearSaving).toLocaleString()} saved per year in ${cheapest.name} vs ${dearest.name}.`
    : ''

  // Build a card for each city (table-cell safe)
  function cityCard(c: { name: string; country: string; total: number; sym: string }, rank: number): string {
    const isCheap = c.name === cheapest.name && cities.length > 1
    const pct = maxTotal > 0 ? Math.round((c.total / maxTotal) * 100) : 100
    const overPct = cheapest.total > 0 ? Math.round((c.total / cheapest.total - 1) * 100) : 0
    const costColor = isCheap ? '#00ffd5' : '#f0b07a'
    const rankLabel = isCheap ? '№1 · cheapest' : `+${overPct}% vs №1`
    const rankColor = isCheap ? '#00ffd5' : '#666660'

    // Cost bar: a filled strip showing relative cost
    const barFill = `background:#1e1e1e;height:3px;margin-top:10px;`
    const barInner = `display:inline-block;height:3px;width:${pct}%;background:${costColor};vertical-align:top;`

    return `<td valign="top" style="padding:0;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr><td style="background:#161616;border:1px solid #222222;padding:16px 18px;">
      <div style="font-size:9px;letter-spacing:0.18em;text-transform:uppercase;color:${rankColor};font-family:Arial,sans-serif;margin-bottom:8px;">№${rank + 1}</div>
      <div style="font-size:15px;font-weight:700;color:#f0f0e8;font-family:Arial,sans-serif;line-height:1.2;">${c.name}</div>
      <div style="font-size:11px;color:#555550;font-family:Arial,sans-serif;margin-bottom:10px;">${c.country}</div>
      <div style="font-size:20px;font-weight:900;color:${costColor};font-family:Arial,sans-serif;line-height:1;">${c.sym}${Math.round(c.total).toLocaleString()}<span style="font-size:11px;font-weight:400;color:#444440;">/mo</span></div>
      <div style="${barFill}"><div style="${barInner}"></div></div>
      <div style="font-size:10px;color:${rankColor};font-family:Arial,sans-serif;margin-top:6px;">${rankLabel}</div>
    </td></tr>
  </table>
</td>`
  }

  // Grid: 2 columns for ≥3 cities, 1 column for 2 cities
  const useGrid = sorted.length >= 3
  let gridHtml = ''

  if (useGrid) {
    // Pair cities into rows of 2
    const pairs: typeof sorted[] = []
    for (let i = 0; i < sorted.length; i += 2) pairs.push(sorted.slice(i, i + 2))
    gridHtml = pairs.map(pair => {
      const cells = pair.map((c, i) => cityCard(c, sorted.indexOf(c))).join('<td width="12" style="padding:0;">&nbsp;</td>')
      const empty = pair.length === 1 ? '<td width="48%" style="padding:0;"></td>' : ''
      return `<tr><td style="padding:0 0 12px 0;"><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr>${cells}${empty}</tr></table></td></tr>`
    }).join('')
  } else {
    // 2 cities side by side in one row
    const cells = sorted.map((c, i) => cityCard(c, i)).join('<td width="12" style="padding:0;">&nbsp;</td>')
    gridHtml = `<tr><td style="padding:0;"><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr>${cells}</tr></table></td></tr>`
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="color-scheme" content="dark">
  <title>Your city comparison</title>
</head>
<body style="background:#0a0a0a;margin:0;padding:0;font-family:Arial,Helvetica,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#0a0a0a;">
  <tr><td align="center" style="padding:32px 16px;">
    <table width="560" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;width:100%;">

      <!-- Logo row -->
      <tr><td style="padding-bottom:28px;">
        <span style="font-size:10px;font-weight:800;letter-spacing:0.22em;text-transform:uppercase;color:#f0f0e8;font-family:Arial,sans-serif;">ORIGIO</span>
        <span style="font-size:10px;color:#333330;font-family:Arial,sans-serif;"> &nbsp;·&nbsp; City Comparison</span>
      </td></tr>

      <!-- Heading -->
      <tr><td style="padding-bottom:6px;">
        <div style="font-size:24px;font-weight:900;color:#f0f0e8;line-height:1.1;font-family:Arial,sans-serif;">The cost breakdown.</div>
      </td></tr>

      <!-- City names subtitle -->
      <tr><td style="padding-bottom:24px;">
        <div style="font-size:13px;color:#555550;font-family:Arial,sans-serif;">${sorted.map(c => c.name).join(' · ')}</div>
      </td></tr>

      <!-- Divider -->
      <tr><td style="padding-bottom:20px;"><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="border-top:1px solid #1e1e1e;font-size:0;">&nbsp;</td></tr></table></td></tr>

      <!-- City grid -->
      ${gridHtml}

      <!-- Savings callout -->
      ${savingLine ? `<tr><td style="padding-top:8px;padding-bottom:24px;">
        <div style="background:#0f1f1c;border:1px solid #1a3530;padding:12px 16px;">
          <span style="font-size:12px;color:#00ffd5;font-family:Arial,sans-serif;">${savingLine}</span>
        </div>
      </td></tr>` : '<tr><td style="padding-bottom:24px;"></td></tr>'}

      <!-- Divider -->
      <tr><td style="padding-bottom:24px;"><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="border-top:1px solid #1e1e1e;font-size:0;">&nbsp;</td></tr></table></td></tr>

      <!-- CTA -->
      <tr><td style="padding-bottom:28px;">
        <a href="${shareUrl}" style="display:inline-block;background:#00ffd5;color:#0a0a0a;font-weight:800;font-size:11px;letter-spacing:0.16em;text-transform:uppercase;padding:13px 26px;text-decoration:none;font-family:Arial,sans-serif;">View live comparison &rarr;</a>
      </td></tr>

      <!-- Footer -->
      <tr><td>
        <div style="font-size:11px;color:#333330;font-family:Arial,sans-serif;line-height:1.7;">Costs shown in ${currency.toUpperCase()} &nbsp;·&nbsp; 1BR city centre rent &nbsp;·&nbsp; single person estimate<br>findorigio.com &nbsp;&middot;&nbsp; Dublin, Ireland</div>
      </td></tr>

    </table>
  </td></tr>
</table>
</body>
</html>`
}

export async function POST(req: NextRequest) {
  // Rate limit using shared utility (distributed, correct IP extraction)
  const limited = await rateLimit(req, { name: 'capture-city-comparison', maxRequests: 5, windowSeconds: 60 })
  if (limited) return limited

  // Auth: verify bearer token
  const authHeader = req.headers.get('Authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const token = authHeader.replace('Bearer ', '')

  const userSupabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const { data: { user }, error: authError } = await userSupabase.auth.getUser(token)
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

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

  // Validate email format and ensure it belongs to the authenticated user
  if (!isValidEmail(email)) {
    return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
  }
  if (email !== user.email) {
    return NextResponse.json({ error: 'Email mismatch' }, { status: 403 })
  }
  if (!Array.isArray(cities) || cities.length < 2) {
    return NextResponse.json({ error: 'Invalid data' }, { status: 400 })
  }

  const sym = SYM[currency] ?? '€'
  const rate = RATES[currency] ?? 1

  const costSnapshot: Record<string, number> = {}
  cities.forEach(c => { costSnapshot[c.slug] = c.total })

  await adminSupabase().from('city_comparison_leads').insert({
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
