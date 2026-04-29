// app/api/webhook/route.ts
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { resend } from '@/lib/resend'
import WelcomePro from '@/emails/WelcomePro'
import { createElement } from 'react'
import { rateLimit } from '@/lib/rate-limit'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-03-25.dahlia',
})

const adminSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

export async function POST(request: Request) {
  // Rate limit: max 20 webhook calls per minute (Stripe retries can burst)
  const limited = await rateLimit(request, { name: 'webhook', maxRequests: 20, windowSeconds: 60 })
  if (limited) return limited
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session

    const userId = session.metadata?.user_id ?? session.client_reference_id
    if (!userId) {
      console.error('No user_id in session metadata')
      return NextResponse.json({ error: 'No user_id' }, { status: 400 })
    }

    const { error } = await adminSupabase
      .from('profiles')
      .update({ is_pro: true })
      .eq('id', userId)

    if (error) {
      console.error('Failed to update profile:', error)
      return NextResponse.json({ error: 'DB update failed' }, { status: 500 })
    }

    // Send Pro welcome email
    if (session.customer_email) {
      const customerName = session.customer_details?.name ?? 'there'
      await resend.emails.send({
        from: 'Origio <noreply@findorigio.com>',
        to: session.customer_email,
        subject: 'Welcome to Origio Pro ✨',
        react: createElement(WelcomePro, { name: customerName }),
      })
    }

    console.log(`✅ User ${userId} upgraded to Pro`)
  }

  return NextResponse.json({ received: true })
}