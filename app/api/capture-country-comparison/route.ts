import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getResend } from '@/lib/resend'
import { rateLimit } from '@/lib/rate-limit'
import { isValidEmail } from '@/lib/utils'

function escapeHtml(s: string): string {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function supabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

function buildHtml(
  countries: { name: string; flag: string; color: string }[],
  role: string,
  shareUrl: string
): string {
  const countryCards = countries.map(c => `
    <td width="${countries.length === 2 ? '48%' : '31%'}" valign="top" style="padding:0;">
      <div style="background:#161616;border:1px solid #222222;border-top:2px solid ${escapeHtml(c.color)};padding:16px 18px;">
        <div style="font-size:20px;margin-bottom:6px;">${escapeHtml(c.flag)}</div>
        <div style="font-size:14px;font-weight:700;color:#f0f0e8;font-family:Arial,sans-serif;">${escapeHtml(c.name)}</div>
      </div>
    </td>`).join('<td width="2%" style="padding:0;"></td>')

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="color-scheme" content="dark">
  <title>Your country comparison</title>
</head>
<body style="background:#0a0a0a;margin:0;padding:0;font-family:Arial,Helvetica,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#0a0a0a;">
  <tr><td align="center" style="padding:32px 16px;">
    <table width="560" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;width:100%;">

      <!-- Logo -->
      <tr><td style="padding-bottom:28px;">
        <span style="font-size:10px;font-weight:800;letter-spacing:0.22em;text-transform:uppercase;color:#f0f0e8;font-family:Arial,sans-serif;">ORIGIO</span>
        <span style="font-size:10px;color:#333330;font-family:Arial,sans-serif;"> &nbsp;·&nbsp; Country Comparison</span>
      </td></tr>

      <!-- Heading -->
      <tr><td style="padding-bottom:6px;">
        <div style="font-size:24px;font-weight:900;color:#f0f0e8;line-height:1.1;font-family:Arial,sans-serif;">Your country comparison.</div>
      </td></tr>
      <tr><td style="padding-bottom:24px;">
        <div style="font-size:13px;color:#555550;font-family:Arial,sans-serif;">${escapeHtml(role)} &nbsp;·&nbsp; ${countries.map(c => escapeHtml(c.name)).join(' vs ')}</div>
      </td></tr>

      <!-- Divider -->
      <tr><td style="padding-bottom:20px;"><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="border-top:1px solid #1e1e1e;font-size:0;">&nbsp;</td></tr></table></td></tr>

      <!-- Country cards -->
      <tr><td style="padding-bottom:24px;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>${countryCards}</tr>
        </table>
      </td></tr>

      <!-- Note -->
      <tr><td style="padding-bottom:24px;">
        <div style="background:#0f1520;border:1px solid #1a2535;padding:12px 16px;">
          <span style="font-size:12px;color:#7dd3fc;font-family:Arial,sans-serif;">The full comparison includes salary, cost of living, tax, visa difficulty, and quality of life scores.</span>
        </div>
      </td></tr>

      <!-- Divider -->
      <tr><td style="padding-bottom:24px;"><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="border-top:1px solid #1e1e1e;font-size:0;">&nbsp;</td></tr></table></td></tr>

      <!-- CTA -->
      <tr><td style="padding-bottom:28px;">
        <a href="${escapeHtml(shareUrl)}" style="display:inline-block;background:#00ffd5;color:#0a0a0a;font-weight:800;font-size:11px;letter-spacing:0.16em;text-transform:uppercase;padding:13px 26px;text-decoration:none;font-family:Arial,sans-serif;">View live comparison &rarr;</a>
      </td></tr>

      <!-- Footer -->
      <tr><td>
        <div style="font-size:11px;color:#333330;font-family:Arial,sans-serif;line-height:1.7;">findorigio.com &nbsp;&middot;&nbsp; Dublin, Ireland</div>
      </td></tr>

    </table>
  </td></tr>
</table>
</body>
</html>`
}

export async function POST(req: NextRequest) {
  const limited = await rateLimit(req, { name: 'capture-country-comparison', maxRequests: 5, windowSeconds: 60 })
  if (limited) return limited

  // Require auth — prevents sending emails to arbitrary addresses
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
    countries: { slug: string; name: string; flag: string; color: string }[]
    role: string
    shareUrl: string
  }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 })
  }

  const { email, countries, role, shareUrl } = body

  if (!isValidEmail(email)) {
    return NextResponse.json({ error: 'Invalid data' }, { status: 400 })
  }
  // Only allow sending to the authenticated user's own email
  if (email !== user.email) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  if (!Array.isArray(countries) || countries.length < 2) {
    return NextResponse.json({ error: 'Invalid data' }, { status: 400 })
  }

  await supabase().from('country_comparison_leads').insert({
    email,
    countries: countries.map(c => c.slug),
    role,
    cost_snapshot: {},
  })

  const html = buildHtml(countries, role, shareUrl)
  const resend = getResend()
  await resend.emails.send({
    from: 'Origio <hello@findorigio.com>',
    to: email,
    subject: `Your country comparison: ${countries.map(c => c.name).join(' vs ')}`,
    html,
  })

  return NextResponse.json({ ok: true })
}
