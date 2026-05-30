import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createElement } from 'react'
import { getResend } from '@/lib/resend'
import WelcomeUser from '@/emails/WelcomeUser'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // Validate `next` — only allow safe relative paths (prevents open redirect)
  const rawNext = searchParams.get('next') ?? '/profile'
  const next = /^\/(?!\/)/.test(rawNext) && !rawNext.includes('@') && !rawNext.includes(':')
    ? rawNext
    : '/profile'

  if (code) {
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

    const { data: { user } } = await supabase.auth.exchangeCodeForSession(code)

    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('onboarded')
        .eq('id', user.id)
        .single()

      const isNewUser = !profile?.onboarded
      if (isNewUser && user.email) {
        try {
          const name = user.user_metadata?.full_name?.split(' ')[0] || ''
          await getResend().emails.send({
            from: 'Origio <hello@findorigio.com>',
            to: user.email,
            subject: 'Welcome to Origio',
            react: createElement(WelcomeUser, { name }),
          })
        } catch (err) {
          console.error('[welcome-user]', err)
        }
      }

      if (isNewUser) {
        return NextResponse.redirect(`${origin}/onboarding`)
      }
    }
  }

  return NextResponse.redirect(`${origin}${next}`)
}
