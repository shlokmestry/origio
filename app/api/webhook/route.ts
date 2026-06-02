import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { getResend } from '@/lib/resend'
import WelcomePro from '@/emails/WelcomePro'
import { createElement } from 'react'
import { rateLimit } from '@/lib/rate-limit'
import * as Sentry from "@sentry/nextjs"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-03-25.dahlia',
})

const adminSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

export async function POST(request: Request): Promise<Response> {
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
    Sentry.captureException(err, {
      tags: { route: 'webhook', type: 'signature_verification_failed' },
    })
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session

    const userId = session.metadata?.user_id ?? session.client_reference_id ?? null
    if (!userId) {
      // Return 200 so Stripe doesn't retry — log for manual recovery
      Sentry.captureMessage('Orphaned payment: no user_id in metadata or client_reference_id', 'error', {
        extra: { stripeSessionId: session.id, customerEmail: session.customer_email },
      })
      console.error('Orphaned payment — no user_id:', session.id)
      return NextResponse.json({ received: true, warning: 'no_user_id' })
    }

    try {
      const { error } = await adminSupabase
        .from('profiles')
        .update({ is_pro: true })
        .eq('id', userId)

      if (error) {
        Sentry.captureException(error, {
          tags: { route: 'webhook', type: 'profile_update_failed', user_id: userId },
        })
        console.error('Failed to update profile:', error)
        return NextResponse.json({ error: 'DB update failed' }, { status: 500 })
      }

      if (session.customer_email) {
        try {
          const resend = getResend()
          const customerName = session.customer_details?.name ?? 'there'
          await resend.emails.send({
            from: 'Origio <onboarding@resend.dev>',
            to: session.customer_email,
            subject: 'Welcome to Origio Pro ✨',
            react: createElement(WelcomePro, { name: customerName }),
          })
        } catch (emailErr) {
          Sentry.captureException(emailErr, {
            tags: { route: 'webhook', type: 'email_send_failed', user_id: userId },
          })
          console.error('Failed to send welcome email:', emailErr)
        }
      }

      console.log(`✅ User ${userId} upgraded to Pro`)
    } catch (err) {
      Sentry.captureException(err, {
        tags: { route: 'webhook', type: 'checkout_processing_error', user_id: userId },
      })
      console.error('Error processing checkout:', err)
      return NextResponse.json({ error: 'Processing failed' }, { status: 500 })
    }
  }

  return NextResponse.json({ received: true })
}
