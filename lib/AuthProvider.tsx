'use client'
import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

interface AuthContextType {
  user: User | null
  loading: boolean
  isPro: boolean
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true, isPro: false })

async function fetchIsPro(userId: string): Promise<boolean> {
  try {
    // maybeSingle() — no error thrown on 0 rows, unlike single()
    const { data, error } = await supabase
      .from('profiles').select('is_pro').eq('id', userId).maybeSingle()
    if (error) {
      console.error('[AuthProvider] fetchIsPro error:', error.message)
      return false
    }
    return data?.is_pro ?? false
  } catch (e) {
    console.error('[AuthProvider] fetchIsPro threw:', e)
    return false
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser]       = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [isPro, setIsPro]     = useState(false)

  useEffect(() => {
    let cancelled = false

    // Safety net: never leave loading=true for more than 6 seconds
    const safetyTimer = setTimeout(() => {
      if (!cancelled) setLoading(false)
    }, 6000)

    supabase.auth.getSession()
      .then(async ({ data: { session } }) => {
        if (cancelled) return
        setUser(session?.user ?? null)
        if (session?.user) {
          const pro = await fetchIsPro(session.user.id)
          if (!cancelled) setIsPro(pro)
        }
        if (!cancelled) setLoading(false)
      })
      .catch(() => {
        if (!cancelled) setLoading(false)
      })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_, session) => {
      if (cancelled) return
      setUser(session?.user ?? null)
      if (session?.user) {
        const pro = await fetchIsPro(session.user.id)
        if (!cancelled) setIsPro(pro)
      } else {
        if (!cancelled) setIsPro(false)
      }
      if (!cancelled) setLoading(false)
    })

    return () => {
      cancelled = true
      clearTimeout(safetyTimer)
      subscription.unsubscribe()
    }
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, isPro }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
