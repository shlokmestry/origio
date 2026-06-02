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
    const { data } = await supabase
      .from('profiles').select('is_pro').eq('id', userId).single()
    return data?.is_pro ?? false
  } catch {
    return false
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser]     = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [isPro, setIsPro]   = useState(false)

  useEffect(() => {
    // Eagerly resolve the current session and pro status together
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        const pro = await fetchIsPro(session.user.id)
        setIsPro(pro)
      }
      setLoading(false)
    })

    // Keep in sync on auth state changes (sign-in, sign-out, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        const pro = await fetchIsPro(session.user.id)
        setIsPro(pro)
      } else {
        setIsPro(false)
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
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
