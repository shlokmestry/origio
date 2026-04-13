// app/api/delete-account/route.ts
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { resend } from '@/lib/resend'
import AccountDeleted from '@/emails/AccountDeleted'
import { createElement } from 'react'
import { rateLimit } from '@/lib/rate-limit'

const adminClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

export async function DELETE(request: Request) {
  // Rate limit: max 2 deletion attempts per minute
  const limited = rateLimit(request, { name: 'delete-account', maxRequests: 2, windowSeconds: 60 })
  if (limited) return limited
  const authHeader = request.headers.get('Authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const token = authHeader.replace('Bearer ', '')

  const userClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const { data: { user }, error: authError } = await userClient.auth.getUser(token)
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Send deletion email before deleting the account
  const userName = user.user_metadata?.full_name ?? user.email?.split('@')[0] ?? 'there'
  await resend.emails.send({
    from: 'Origio <onboarding@resend.dev>',
    to: user.email!,
    subject: 'Your Origio account has been deleted',
    react: createElement(AccountDeleted, { name: userName }),
  })

  // Delete all user data then auth user
  await Promise.all([
    adminClient.from('saved_countries').delete().eq('user_id', user.id),
    adminClient.from('wizard_results').delete().eq('user_id', user.id),
    adminClient.from('profiles').delete().eq('id', user.id),
  ])

  const { error: deleteError } = await adminClient.auth.admin.deleteUser(user.id)
  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}