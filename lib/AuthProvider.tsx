'use client'
import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'
import * as Sentry from '@sentry/nextjs'

interface AuthContextType {
  user: User | null
  loading: boolean
  isPro: boolean
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true, isPro: false })

async function fetchIsPro(userId: string, accessToken: string): Promise<boolean> {
  try {
    const { createClient } = await import('@supabase/supabase-js')
    const client = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { global: { headers: { Authorization: `Bearer ${accessToken}` } } }
    )
    const { data, error } = await client
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

    // Step 1: getSession() reads from local cookies immediately — no network needed.
    // This unblocks the UI as fast as possible.
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (cancelled) return
      const currentUser = session?.user ?? null
      setUser(currentUser)
      setLoading(false)
      if (currentUser && session?.access_token) {
        Sentry.setUser({ id: currentUser.id, email: currentUser.email })
        fetchIsPro(currentUser.id, session.access_token).then(pro => { if (!cancelled) setIsPro(pro) })
      }
    }).catch(() => {
      if (!cancelled) setLoading(false)
    })

    // Step 2: onAuthStateChange handles subsequent changes (sign-in, sign-out,
    // token refresh). Skip INITIAL_SESSION — already handled by getSession() above.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (cancelled || event === 'INITIAL_SESSION') return
      const currentUser = session?.user ?? null
      setUser(currentUser)
      if (currentUser && session?.access_token) {
        Sentry.setUser({ id: currentUser.id, email: currentUser.email })
        fetchIsPro(currentUser.id, session.access_token).then(pro => { if (!cancelled) setIsPro(pro) })
      } else {
        Sentry.setUser(null)
        setIsPro(false)
      }
    })

    // Safety net: 5s max before we unblock regardless
    const safetyTimer = setTimeout(() => { if (!cancelled) setLoading(false) }, 5000)

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
