import { NextResponse } from 'next/server'
import { createElement } from 'react'
import { getResend } from '@/lib/resend'
import { createClient } from '@supabase/supabase-js'
import WelcomeUser from '@/emails/WelcomeUser'

export async function POST(request: Request) {
  const authHeader = request.headers.get('Authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ ok: false }, { status: 401 })
  }
  const token = authHeader.replace('Bearer ', '')
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const { data: { user }, error: authError } = await supabase.auth.getUser(token)
  if (authError || !user) {
    return NextResponse.json({ ok: false }, { status: 401 })
  }

  try {
    const name = user.user_metadata?.full_name?.split(' ')[0] || ''
    const resend = getResend()
    await resend.emails.send({
      from: 'Origio <hello@findorigio.com>',
      to: user.email!,
      subject: 'Welcome to Origio',
      react: createElement(WelcomeUser, { name }),
    })
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[welcome-user]', err)
    return NextResponse.json({ ok: false })
  }
}
