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
      
      attempts++
      
      await supabase.auth.refreshSession()
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!mounted) return
      
      if (session?.user) {
        setUser(session.user)
        setLoading(false)
        return
      }

      if (attempts < 5) {
        await new Promise(resolve => setTimeout(resolve, 300))
        checkAuthWithRetry()
      } else {
        setLoading(false)
      }
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return

      if (event === 'INITIAL_SESSION' || event === 'SIGNED_IN') {
        if (session?.user) {
          setUser(session.user)
        }
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
