// app/api/checkout/route.ts
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { rateLimit } from '@/lib/rate-limit'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-03-25.dahlia',
})

export async function POST(request: Request) {
  // Rate limit: max 5 checkout sessions per minute
  const limited = await rateLimit(request, { name: 'checkout', maxRequests: 5, windowSeconds: 60 })
  if (limited) return limited
  // Get token from Authorization header — sent from client
  const authHeader = request.headers.get('Authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const token = authHeader.replace('Bearer ', '')

  // Use token to get user — works reliably on Vercel without cookie issues
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const { data: { user }, error } = await supabase.auth.getUser(token)

  if (error || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const origin = request.headers.get('origin') ?? 'https://findorigio.com'

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: [{ price: process.env.STRIPE_PRICE_ID!, quantity: 1 }],
    customer_email: user.email,
    client_reference_id: user.id,
    success_url: `${origin}/pro/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/pro`,
    metadata: { user_id: user.id },
  })

  return NextResponse.json({ url: session.url })
}