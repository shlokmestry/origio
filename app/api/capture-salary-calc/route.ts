import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getResend } from '@/lib/resend'
import { rateLimit } from '@/lib/rate-limit'
import { isValidEmail } from '@/lib/utils'

function adminSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

function buildHtml(data: {
  countryName: string
  countryFlag: string
  role: string
  level: string
  symbol: string
  grossLocal: number
  netLocal: number
  grossUSD: number
  netUSD: number
  effectiveRate: number
  currency: string
}, shareUrl: string): string {
  const taxed = Math.round(data.grossLocal - data.netLocal)
  const taxPct = data.grossLocal > 0 ? Math.round((taxed / data.grossLocal) * 100) : 0
  const netPct = 100 - taxPct

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="color-scheme" content="dark">
  <title>Your salary breakdown</title>
</head>
<body style="background:#0a0a0a;margin:0;padding:0;font-family:Arial,Helvetica,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#0a0a0a;">
  <tr><td align="center" style="padding:32px 16px;">
    <table width="560" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;width:100%;">

      <!-- Logo -->
      <tr><td style="padding-bottom:28px;">
        <span style="font-size:10px;font-weight:800;letter-spacing:0.22em;text-transform:uppercase;color:#f0f0e8;font-family:Arial,sans-serif;">ORIGIO</span>
        <span style="font-size:10px;color:#333330;font-family:Arial,sans-serif;"> &nbsp;·&nbsp; Salary Calculator</span>
      </td></tr>

      <!-- Heading -->
      <tr><td style="padding-bottom:6px;">
        <div style="font-size:24px;font-weight:900;color:#f0f0e8;line-height:1.1;font-family:Arial,sans-serif;">Your salary breakdown.</div>
      </td></tr>
      <tr><td style="padding-bottom:24px;">
        <div style="font-size:13px;color:#555550;font-family:Arial,sans-serif;">${data.role} · ${data.level} · ${data.countryFlag} ${data.countryName}</div>
      </td></tr>

      <!-- Divider -->
      <tr><td style="padding-bottom:20px;"><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="border-top:1px solid #1e1e1e;font-size:0;">&nbsp;</td></tr></table></td></tr>

      <!-- Main numbers: 2 columns -->
      <tr><td style="padding-bottom:16px;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td width="49%" valign="top" style="padding:0;">
              <div style="background:#161616;border:1px solid #222222;padding:20px;">
                <div style="font-size:9px;letter-spacing:0.18em;text-transform:uppercase;color:#555550;font-family:Arial,sans-serif;margin-bottom:10px;">Gross annual</div>
                <div style="font-size:26px;font-weight:900;color:#f0f0e8;font-family:Arial,sans-serif;line-height:1;">${data.symbol}${Math.round(data.grossLocal).toLocaleString()}</div>
                <div style="font-size:11px;color:#444440;font-family:Arial,sans-serif;margin-top:4px;">$${data.grossUSD.toLocaleString()} USD</div>
              </div>
            </td>
            <td width="2%" style="padding:0;"></td>
            <td width="49%" valign="top" style="padding:0;">
              <div style="background:#161616;border:1px solid #1a3530;border-top:2px solid #00ffd5;padding:20px;">
                <div style="font-size:9px;letter-spacing:0.18em;text-transform:uppercase;color:#00ffd5;font-family:Arial,sans-serif;margin-bottom:10px;">Net annual</div>
                <div style="font-size:26px;font-weight:900;color:#00ffd5;font-family:Arial,sans-serif;line-height:1;">${data.symbol}${Math.round(data.netLocal).toLocaleString()}</div>
                <div style="font-size:11px;color:#444440;font-family:Arial,sans-serif;margin-top:4px;">$${data.netUSD.toLocaleString()} USD</div>
              </div>
            </td>
          </tr>
        </table>
      </td></tr>

      <!-- Tax bar -->
      <tr><td style="padding-bottom:24px;">
        <div style="background:#161616;border:1px solid #222222;padding:16px 20px;">
          <div style="display:flex;justify-content:space-between;margin-bottom:10px;">
            <span style="font-size:11px;color:#555550;font-family:Arial,sans-serif;">Tax &amp; deductions</span>
            <span style="font-size:13px;font-weight:700;color:#f87171;font-family:Arial,sans-serif;">${data.effectiveRate.toFixed(1)}% effective rate</span>
          </div>
          <!-- Bar (table-based for email compatibility) -->
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="height:6px;">
            <tr>
              <td width="${taxPct}%" style="background:#ef4444;opacity:0.7;height:6px;font-size:0;">&nbsp;</td>
              <td width="${netPct}%" style="background:#00ffd5;opacity:0.8;height:6px;font-size:0;">&nbsp;</td>
            </tr>
          </table>
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:8px;">
            <tr>
              <td style="font-size:10px;color:#666660;font-family:Arial,sans-serif;">${data.symbol}${taxed.toLocaleString()} taken</td>
              <td align="right" style="font-size:10px;color:#00ffd5;font-family:Arial,sans-serif;">${data.symbol}${Math.round(data.netLocal).toLocaleString()} kept</td>
            </tr>
          </table>
        </div>
      </td></tr>

      <!-- Monthly take-home callout -->
      <tr><td style="padding-bottom:24px;">
        <div style="background:#0f1f1c;border:1px solid #1a3530;padding:12px 16px;">
          <span style="font-size:12px;color:#00ffd5;font-family:Arial,sans-serif;">${data.symbol}${Math.round(data.netLocal / 12).toLocaleString()}/mo take-home in ${data.countryName}. That's $${Math.round(data.netUSD / 12).toLocaleString()} per month.</span>
        </div>
      </td></tr>

      <!-- Divider -->
      <tr><td style="padding-bottom:24px;"><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="border-top:1px solid #1e1e1e;font-size:0;">&nbsp;</td></tr></table></td></tr>

      <!-- CTA -->
      <tr><td style="padding-bottom:28px;">
        <a href="${shareUrl}" style="display:inline-block;background:#00ffd5;color:#0a0a0a;font-weight:800;font-size:11px;letter-spacing:0.16em;text-transform:uppercase;padding:13px 26px;text-decoration:none;font-family:Arial,sans-serif;">Open calculator &rarr;</a>
      </td></tr>

      <!-- Footer -->
      <tr><td>
        <div style="font-size:11px;color:#333330;font-family:Arial,sans-serif;line-height:1.7;">Estimates only. Does not account for province/state tax, deductions, or benefits.<br>findorigio.com &nbsp;&middot;&nbsp; Dublin, Ireland</div>
      </td></tr>

    </table>
  </td></tr>
</table>
</body>
</html>`
}

export async function POST(req: NextRequest) {
  // Rate limit using shared utility
  const limited = await rateLimit(req, { name: 'capture-salary-calc', maxRequests: 5, windowSeconds: 60 })
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
    countryName: string
    countryFlag: string
    countryCode: string
    role: string
    level: string
    symbol: string
    grossLocal: number
    netLocal: number
    grossUSD: number
    netUSD: number
    effectiveRate: number
    currency: string
    shareUrl: string
  }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 })
  }

  const { email, ...data } = body
  if (!isValidEmail(email)) {
    return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
  }
  if (email !== user.email) {
    return NextResponse.json({ error: 'Email mismatch' }, { status: 403 })
  }

  await adminSupabase().from('salary_calc_leads').insert({
    email,
    country: data.countryCode,
    role: data.role,
    level: data.level,
    gross_local: data.grossLocal,
    gross_usd: data.grossUSD,
    net_local: data.netLocal,
    effective_rate: data.effectiveRate,
  })

  const { shareUrl, ...emailData } = data
  const html = buildHtml(emailData, shareUrl)
  const resend = getResend()
  await resend.emails.send({
    from: 'Origio <hello@findorigio.com>',
    to: email,
    subject: `Your ${data.role} salary in ${data.countryName}: ${data.symbol}${Math.round(data.netLocal).toLocaleString()} net`,
    html,
  })

  return NextResponse.json({ ok: true })
}
