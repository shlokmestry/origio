import { NextResponse } from 'next/server'
import { getResend } from '@/lib/resend'
import { rateLimit } from '@/lib/rate-limit'

export async function POST(request: Request) {
  const limited = await rateLimit(request, { name: 'send-results', maxRequests: 3, windowSeconds: 60 })
  if (limited) return limited

  try {
    const { email, top3 } = await request.json()

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json({ ok: false }, { status: 400 })
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
      html: `<div style="font-family:sans-serif;max-width:520px;margin:0 auto;background:#0a0a0a;color:#f0f0e8;padding:40px 32px;">
        <p style="font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#888880;margin:0 0 24px;">ORIGIO</p>
        <h1 style="font-size:28px;margin:0 0 8px;font-weight:900;">Your top 3 matches</h1>
        <p style="color:#888880;font-size:14px;margin:0 0 32px;">Based on your role, passport and priorities.</p>
        ${top3.map((c: { flagEmoji: string; name: string; matchPercent: number }, i: number) => `
          <div style="border:1px solid #1f1f1f;padding:16px 20px;margin-bottom:8px;display:flex;align-items:center;gap:12px;">
            <span style="font-size:11px;color:#555;font-weight:700;min-width:20px;">${String(i + 1).padStart(2, '0')}</span>
            <span style="font-size:22px;">${c.flagEmoji}</span>
            <span style="font-size:16px;font-weight:700;flex:1;">${c.name}</span>
            <span style="font-size:14px;color:#00ffd5;font-weight:700;">${c.matchPercent}%</span>
          </div>`).join('')}
        <div style="margin:32px 0;border-top:1px solid #1f1f1f;"></div>
        <a href="https://findorigio.com/pro" style="display:inline-block;background:#00ffd5;color:#0a0a0a;font-weight:800;font-size:13px;letter-spacing:0.15em;text-transform:uppercase;padding:14px 28px;text-decoration:none;">
          Unlock all countries — €4.99 forever
        </a>
        <p style="font-size:11px;color:#555;margin-top:12px;">Salary calc · Visa checklist · 3-country compare</p>
      </div>`,
    })
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[send-results]', err)
    return NextResponse.json({ ok: false })
  }
}
