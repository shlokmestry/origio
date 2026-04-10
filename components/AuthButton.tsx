'use client'
import { supabase } from '@/lib/supabase'

export default function AuthButton() {
  const signInWithGoogle = async () => {
    // ✅ Pass the ?next= param through to the callback
    const next = new URLSearchParams(window.location.search).get('next') ?? '/profile'
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    })
  }

  return (
    <button onClick={signInWithGoogle} className="cta-button px-6 py-2 rounded-lg">
      Sign in with Google
    </button>
  )
}