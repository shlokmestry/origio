import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    let attempts = 0

    async function checkAuthWithRetry() {
      if (!mounted) return
      
      const { data: { user: authUser } } = await supabase.auth.getUser()
      
      if (!mounted) return
      
      if (authUser) {
        setUser(authUser)
        setLoading(false)
        return
      }

      attempts++
      if (attempts < 3) {
        await new Promise(resolve => setTimeout(resolve, 500))
        checkAuthWithRetry()
      } else {
        setLoading(false)
      }
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

    checkAuthWithRetry()

    const timeout = setTimeout(() => {
      if (mounted) {
        setLoading(false)
      }
    }, 10000)

    return () => {
      mounted = false
      subscription.unsubscribe()
      clearTimeout(timeout)
    }
  }, [])

  return { user, loading }
}
