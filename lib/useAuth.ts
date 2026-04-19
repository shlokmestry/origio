import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    // onAuthStateChange fires INITIAL_SESSION synchronously from the cookie
    // on page load — this is the single source of truth. No need for
    // getSession() polling or retry loops on top of it.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return

      if (event === 'INITIAL_SESSION') {
        // Always fires first — sets definitive initial state
        setUser(session?.user ?? null)
        setLoading(false)
      } else if (event === 'SIGNED_IN' || event === 'USER_UPDATED' || event === 'TOKEN_REFRESHED') {
        setUser(session?.user ?? null)
      } else if (event === 'SIGNED_OUT') {
        setUser(null)
        setLoading(false)
      }
    })

    // Safety net: if INITIAL_SESSION never fires (edge case / cold start)
    // fall back to getSession after 3s
    const fallback = setTimeout(async () => {
      if (!mounted || !loading) return
      const { data: { session } } = await supabase.auth.getSession()
      if (!mounted) return
      setUser(session?.user ?? null)
      setLoading(false)
    }, 3000)

    return () => {
      mounted = false
      subscription.unsubscribe()
      clearTimeout(fallback)
    }
  }, [])

  return { user, loading }
}