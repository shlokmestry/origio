import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { verifyUnsubscribeToken } from '@/lib/unsubscribeToken'

function page(message: string): NextResponse {
  return new NextResponse(
    `<!doctype html><html><head><meta charset="utf-8"><title>Origio</title></head>` +
    `<body style="background:#0a0a0a;color:#f0f0e8;font-family:sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;text-align:center;padding:24px">` +
    `<p style="font-size:16px;max-width:420px">${message}</p></body></html>`,
    { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
  )
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const uid = searchParams.get('uid')
  const token = searchParams.get('token')

  let valid = false
  try {
    valid = Boolean(uid && token && verifyUnsubscribeToken(uid, token))
  } catch {
    valid = false
  }
  if (!uid || !valid) {
    return page("That unsubscribe link isn't valid.")
  }

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  await supabaseAdmin.from('profiles').update({ marketing_opt_out: true }).eq('id', uid)

  return page("You're unsubscribed. You won't get any more emails like this from Origio.")
}
