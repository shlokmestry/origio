import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { rateLimit } from '@/lib/rate-limit'

export async function POST(request: Request) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2026-03-25.dahlia',
  })

  const limited = await rateLimit(request, { name: 'checkout-report', maxRequests: 5, windowSeconds: 60 })
  if (limited) return limited

  const ALLOWED_ORIGINS = ['https://findorigio.com', 'https://www.findorigio.com']
  const requestOrigin = request.headers.get('origin') ?? ''
  const origin = ALLOWED_ORIGINS.includes(requestOrigin) ? requestOrigin : ALLOWED_ORIGINS[0]

  // Optional: email from body (if user provided it)
  let customerEmail: string | undefined
  try {
    const body = await request.json()
    if (typeof body.email === 'string' && body.email.includes('@')) customerEmail = body.email
  } catch { /* no body — anon is fine */ }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [{ price: process.env.STRIPE_REPORT_PRICE_ID!, quantity: 1 }],
      ...(customerEmail ? { customer_email: customerEmail } : {}),
      success_url: `${origin}/report/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/wizard/results`,
      metadata: { type: 'report' },
      ...(customerEmail ? {} : { billing_address_collection: 'auto' }),
    })
    return NextResponse.json({ url: session.url })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Stripe error'
    console.error('[checkout-report]', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
