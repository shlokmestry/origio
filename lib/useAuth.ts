import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const initRef = useRef(false)

  useEffect(() => {
    if (initRef.current) return
    initRef.current = true

    let resolved = false

    async function resolveAuth() {
      if (resolved) return
      
      const { data: { session } } = await supabase.auth.getSession()
      if (resolved) return
      
      if (session?.user) {
        setUser(session.user)
      }
      resolved = true
      setLoading(false)
    }

    resolveAuth()

    supabase.auth.onAuthStateChange((event, session) => {
      if (resolved) return
      
      if (event === 'INITIAL_SESSION' || event === 'SIGNED_IN') {
        if (session?.user) {
          setUser(session.user)
        }
        resolved = true
        setLoading(false)
      } else if (event === 'SIGNED_OUT') {
        setUser(null)
      }
    })

    const timeout = setTimeout(() => {
      if (!resolved) {
        resolved = true
        setLoading(false)
      }
    }, 5000)

    return () => {
      resolved = true
      clearTimeout(timeout)
    }
  }, [])

  return { user, loading }
}
