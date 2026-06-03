import { NextResponse } from 'next/server'
import { getResend } from '@/lib/resend'
import { rateLimit } from '@/lib/rate-limit'
import { createClient } from '@supabase/supabase-js'
import { isValidEmail } from '@/lib/utils'

export async function POST(request: Request) {
  const limited = await rateLimit(request, { name: 'send-results', maxRequests: 3, windowSeconds: 60 })
  if (limited) return limited

  const contentType = request.headers.get('content-type') ?? ''
  if (!contentType.includes('application/json')) {
    return NextResponse.json({ ok: false }, { status: 415 })
  }

  // Require auth — prevents sending emails to arbitrary addresses
  const authHeader = request.headers.get('Authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ ok: false }, { status: 401 })
  }
  const token = authHeader.replace('Bearer ', '')
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const { data: { user }, error: authError } = await supabase.auth.getUser(token)
  if (authError || !user) {
    return NextResponse.json({ ok: false }, { status: 401 })
  }

  try {
    const { email, top3 } = await request.json()

    if (!email || typeof email !== 'string' || !isValidEmail(email)) {
      return NextResponse.json({ ok: false }, { status: 400 })
    }
    // Only allow sending to the authenticated user's own email
    if (email !== user.email) {
      return NextResponse.json({ ok: false }, { status: 403 })
    }
    if (!Array.isArray(top3) || top3.length === 0 || top3.length > 3) {
      return NextResponse.json({ ok: false }, { status: 400 })
    }

    const resend = getResend()
    const countryLines = top3.map((c: { flagEmoji: string; name: string; matchPercent: number }, i: number) =>
      `${i + 1}. ${c.flagEmoji} ${c.name} — ${c.matchPercent}% match`
    ).join('\n')

    await resend.emails.send({
      from: 'Origio <hello@findorigio.com>',
      to: email,
      subject: 'Your top 3 matches are ready',
      text: `Here are your top matches:\n\n${countryLines}\n\nSee all 37 countries ranked → https://findorigio.com/pro\n\nSalary after tax · Visa checklist · 3-country compare\n\nOrigio`,
      html: `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0a0a0a;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#0a0a0a;">
  <tr><td align="center" style="padding:40px 16px;">
    <table width="520" cellpadding="0" cellspacing="0" border="0" style="max-width:520px;width:100%;">
      <tr><td style="padding:0 0 24px 0;">
        <span style="font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#555550;font-family:sans-serif;">ORIGIO</span>
      </td></tr>
      <tr><td style="padding:0 0 8px 0;">
        <span style="font-size:28px;font-weight:900;color:#f0f0e8;font-family:sans-serif;">Your top 3 matches</span>
      </td></tr>
      <tr><td style="padding:0 0 32px 0;">
        <span style="font-size:14px;color:#666660;font-family:sans-serif;">Based on your role, passport and priorities.</span>
      </td></tr>
      ${top3.map((c: { flagEmoji: string; name: string; matchPercent: number }, i: number) => `
      <tr><td style="padding:0 0 8px 0;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid #2a2a2a;background:#111111;">
          <tr>
            <td width="32" style="padding:16px 0 16px 20px;font-size:11px;color:#555550;font-weight:700;font-family:sans-serif;vertical-align:middle;">${String(i + 1).padStart(2, '0')}</td>
            <td width="36" style="padding:16px 8px;font-size:22px;vertical-align:middle;">${c.flagEmoji}</td>
            <td style="padding:16px 0;font-size:16px;font-weight:700;color:#f0f0e8;font-family:sans-serif;vertical-align:middle;">${c.name}</td>
            <td width="60" align="right" style="padding:16px 20px 16px 0;font-size:14px;color:#00ffd5;font-weight:700;font-family:sans-serif;vertical-align:middle;">${c.matchPercent}%</td>
          </tr>
        </table>
      </td></tr>`).join('')}
      <tr><td style="padding:32px 0;border-top:1px solid #2a2a2a;"></td></tr>
      <tr><td style="padding:0 0 12px 0;">
        <a href="https://findorigio.com/pro" style="display:inline-block;background:#00ffd5;color:#0a0a0a;font-weight:800;font-size:12px;letter-spacing:0.15em;text-transform:uppercase;padding:14px 28px;text-decoration:none;font-family:sans-serif;">
          Unlock all countries &mdash; &euro;4.99 forever
        </a>
      </td></tr>
      <tr><td>
        <span style="font-size:11px;color:#555550;font-family:sans-serif;">Salary calc &middot; Visa checklist &middot; 3-country compare</span>
      </td></tr>
      <tr><td style="padding:40px 0 0 0;">
        <span style="font-size:11px;color:#333330;font-family:sans-serif;">findorigio.com &middot; You received this because you used the wizard.</span>
      </td></tr>
    </table>
  </td></tr>
</table>
</body></html>`,
    })
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[send-results]', err)
    return NextResponse.json({ ok: false })
  }
}
