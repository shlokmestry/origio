// app/api/verify-payment/route.ts
// Fallback: client calls this after checkout success.
// Verifies the Stripe session server-side and grants pro directly.
// This makes pro work even if the webhook is misconfigured.

import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-03-25.dahlia',
})

const adminSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

export async function POST(request: Request) {
  const authHeader = request.headers.get('Authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const token = authHeader.replace('Bearer ', '')

  // Verify the user making the request
  const userSupabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const { data: { user }, error: authError } = await userSupabase.auth.getUser(token)
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { sessionId } = await request.json()
  if (!sessionId) {
    return NextResponse.json({ error: 'Missing sessionId' }, { status: 400 })
  }

  // Retrieve the Stripe checkout session
  let session: Stripe.Checkout.Session
  try {
    session = await stripe.checkout.sessions.retrieve(sessionId)
  } catch (err) {
    console.error('Failed to retrieve Stripe session:', err)
    return NextResponse.json({ error: 'Invalid session' }, { status: 400 })
  }

  // Verify payment succeeded
  if (session.payment_status !== 'paid') {
    return NextResponse.json({ paid: false })
  }

  // Verify the session belongs to this user (security check)
  const sessionUserId = session.metadata?.user_id ?? session.client_reference_id
  if (sessionUserId !== user.id) {
    console.error(`User mismatch: session=${sessionUserId}, requesting=${user.id}`)
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Payment confirmed — grant pro
  const { error: updateError } = await adminSupabase
    .from('profiles')
    .update({ is_pro: true })
    .eq('id', user.id)

  if (updateError) {
    console.error('Failed to update profile:', updateError)
    return NextResponse.json({ error: 'DB update failed' }, { status: 500 })
  }

  console.log(`✅ Pro granted via verify-payment for user ${user.id}`)
  return NextResponse.json({ paid: true, pro: true })
}