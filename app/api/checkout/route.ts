import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { rateLimit } from '@/lib/rate-limit'
import * as Sentry from "@sentry/nextjs";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-03-25.dahlia',
})

export async function POST(request: Request): Promise<Response> {
  // Rate limit: max 10 checkout initiations per minute
  const limited = await rateLimit(request, { name: 'checkout', maxRequests: 10, windowSeconds: 60 })
  if (limited) return limited

  try {
    // Verify session server-side — never trust userId from the request body
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll() },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          },
        },
      }
    )

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
    }

    const userId = user.id

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: 'Origio Pro',
              description: 'Lifetime access to all Pro features',
            },
            unit_amount: 500, // €5.00
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/pro/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pro?cancelled=true`,
      metadata: {
        user_id: userId,
      },
      client_reference_id: userId,
    })

    return NextResponse.json({ sessionId: session.id, url: session.url })
  } catch (error) {
    Sentry.captureException(error, {
      tags: {
        route: 'checkout',
        type: 'session_creation_failed',
      },
    });
    console.error('Checkout error:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
