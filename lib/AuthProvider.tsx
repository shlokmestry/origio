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

    // Safety net: never leave loading=true for more than 5 seconds
    const safetyTimer = setTimeout(() => {
      if (!cancelled) setLoading(false)
    }, 5000)

    // Use onAuthStateChange only — avoids the race with getSession() double-firing.
    // INITIAL_SESSION fires immediately with the current session (or null if signed out).
    // We set loading=false right away (before isPro fetch) so pages don't wait on DB.
    // isPro updates asynchronously — a brief stale value is acceptable for the nav pill.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (cancelled) return
      const currentUser = session?.user ?? null
      setUser(currentUser)

      // Unblock the UI immediately — don't make pages wait for the isPro DB round-trip
      if (!cancelled) setLoading(false)
      clearTimeout(safetyTimer)

      if (currentUser) {
        const pro = await fetchIsPro(currentUser.id)
        if (!cancelled) setIsPro(pro)
      } else {
        if (!cancelled) setIsPro(false)
      }
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
