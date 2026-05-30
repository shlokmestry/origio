import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'
import { rateLimit } from '@/lib/rate-limit'

export async function POST(request: Request): Promise<Response> {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2026-03-25.dahlia',
  })

  const limited = await rateLimit(request, { name: 'checkout-report', maxRequests: 5, windowSeconds: 60 })
  if (limited) return limited

  const ALLOWED_ORIGINS = ['https://findorigio.com', 'https://www.findorigio.com']
  const requestOrigin = request.headers.get('origin') ?? ''
  const origin = ALLOWED_ORIGINS.includes(requestOrigin) ? requestOrigin : ALLOWED_ORIGINS[0]

  let customerEmail: string | undefined
  let userId: string | undefined
  try {
    const body = await request.json()
    if (typeof body.email === 'string' && body.email.includes('@')) customerEmail = body.email

    const authHeader = request.headers.get('Authorization')
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.replace('Bearer ', '')
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )
      const { data: { user } } = await supabase.auth.getUser(token)
      if (user) userId = user.id
    }
  } catch { /* ignore */ }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [{ price: process.env.STRIPE_REPORT_PRICE_ID!, quantity: 1 }],
      ...(customerEmail ? { customer_email: customerEmail } : {}),
      success_url: `${origin}/report/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/wizard/results`,
      metadata: { type: 'report', ...(userId ? { user_id: userId } : {}) },
      ...(customerEmail ? {} : { billing_address_collection: 'auto' }),
    })
    return NextResponse.json({ url: session.url })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Stripe error'
    console.error('[checkout-report]', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
