'use client'
import { supabase } from '@/lib/supabase'

export default function AuthButton() {
  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
  }

  return (
    <button onClick={signInWithGoogle} className="cta-button px-6 py-2 rounded-lg">
      Sign in with Google
    </button>
  )
}