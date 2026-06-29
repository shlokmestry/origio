import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'
import { rateLimit } from '@/lib/rate-limit'

const ALLOWED_ORIGINS = ['https://findorigio.com', 'https://www.findorigio.com']

export async function POST(request: Request): Promise<Response> {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2026-03-25.dahlia',
  })

  const limited = await rateLimit(request, { name: 'checkout-report', maxRequests: 5, windowSeconds: 60 })
  if (limited) return limited

  // Validate Content-Type
  const contentType = request.headers.get('content-type') ?? ''
  if (!contentType.includes('application/json')) {
    return NextResponse.json({ error: 'Unsupported Media Type' }, { status: 415 })
  }

  // Browsers omit Origin on same-origin requests — treat absence as trusted.
  // Only reject when Origin is explicitly set to an unknown value.
  const requestOrigin = request.headers.get('origin')
  if (requestOrigin && !ALLOWED_ORIGINS.includes(requestOrigin)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  const origin = requestOrigin ?? ALLOWED_ORIGINS[0]

  const authHeader = request.headers.get('Authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const token = authHeader.replace('Bearer ', '')

  try {
    const body = await request.json()
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { global: { headers: { Authorization: `Bearer ${token}` } } }
    )
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user || !user.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('is_pro')
      .eq('id', user.id)
      .maybeSingle()
    if (profile?.is_pro) {
      return NextResponse.json({ error: 'Pro users already have full report access.' }, { status: 409 })
    }

    if (!body.resultId || typeof body.resultId !== 'string') {
      return NextResponse.json({ error: 'Missing resultId' }, { status: 400 })
    }

    const { data: result } = await supabase
      .from('wizard_results')
      .select('id')
      .eq('id', body.resultId)
      .eq('user_id', user.id)
      .maybeSingle()
    if (!result) {
      return NextResponse.json({ error: 'Result not found' }, { status: 404 })
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [{ price: process.env.STRIPE_REPORT_PRICE_ID!, quantity: 1 }],
      customer_email: user.email,
      success_url: `${origin}/report/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/wizard/results`,
      metadata: { type: 'report', user_id: user.id, result_id: result.id },
    })
    return NextResponse.json({ url: session.url })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Stripe error'
    console.error('[checkout-report]', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
