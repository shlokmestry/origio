import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let authCheckTimeout: NodeJS.Timeout
    let mounted = true
    let checked = false

    async function checkAuth() {
      if (checked || !mounted) return
      checked = true

      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (!mounted) return

      if (authUser) {
        setUser(authUser)
      }
      setLoading(false)
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted || checked) return

      if (event === 'INITIAL_SESSION' || event === 'SIGNED_IN') {
        checked = true
        setUser(session?.user ?? null)
        setLoading(false)
      } else if (event === 'SIGNED_OUT') {
        checked = true
        setUser(null)
        setLoading(false)
      }
    })

    checkAuth()

    authCheckTimeout = setTimeout(() => {
      if (mounted && !checked) {
        checked = true
        setLoading(false)
      }
    }, 8000)

    return () => {
      mounted = false
      subscription.unsubscribe()
      clearTimeout(authCheckTimeout)
    }
  }, [])

  return { user, loading }
}
