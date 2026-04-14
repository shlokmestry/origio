import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let authCheckTimeout: NodeJS.Timeout
    let mounted = true

    async function checkAuth() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!mounted) return
      
      if (session?.user) {
        setUser(session.user)
      }
      setLoading(false)
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return
      
      if (event === 'INITIAL_SESSION' || event === 'SIGNED_IN') {
        setUser(session?.user ?? null)
        setLoading(false)
      } else if (event === 'SIGNED_OUT') {
        setUser(null)
        setLoading(false)
      }
    })

    checkAuth()

    authCheckTimeout = setTimeout(() => {
      if (mounted) {
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
