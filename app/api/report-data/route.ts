import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import Stripe from 'stripe'
import { rateLimit } from '@/lib/rate-limit'

export async function GET(request: NextRequest): Promise<Response> {
  const limited = await rateLimit(request, { name: 'report-data', maxRequests: 20, windowSeconds: 60 })
  if (limited) return limited

  const authHeader = request.headers.get('Authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const token = authHeader.replace('Bearer ', '')

  const resultId = request.nextUrl.searchParams.get('resultId')
  const sessionId = request.nextUrl.searchParams.get('sessionId')
  if (!resultId || !sessionId) {
    return NextResponse.json({ error: 'Missing resultId or sessionId' }, { status: 400 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { global: { headers: { Authorization: `Bearer ${token}` } } }
  )

  const { data: { user }, error: authError } = await supabase.auth.getUser(token)
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2026-03-25.dahlia',
  })

  let session: Stripe.Checkout.Session
  try {
    session = await stripe.checkout.sessions.retrieve(sessionId)
  } catch {
    return NextResponse.json({ error: 'Invalid checkout session' }, { status: 400 })
  }

  if (session.payment_status !== 'paid') {
    return NextResponse.json({ error: 'Payment not confirmed' }, { status: 402 })
  }

  const sessionUserId = session.metadata?.user_id ?? session.client_reference_id
  if (session.metadata?.type !== 'report' || sessionUserId !== user.id || session.metadata?.result_id !== resultId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { data: result, error } = await supabase
    .from('wizard_results')
    .select('id, top_countries, answers')
    .eq('id', resultId)
    .eq('user_id', user.id)
    .maybeSingle()

  if (error) {
    return NextResponse.json({ error: 'Failed to load report data' }, { status: 500 })
  }
  if (!result) {
    return NextResponse.json({ error: 'Report data not found' }, { status: 404 })
  }

  return NextResponse.json({
    resultId: result.id,
    matches: result.top_countries,
    answers: result.answers,
  })
}
