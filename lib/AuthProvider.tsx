'use client'
import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

interface AuthContextType {
  user: User | null
  loading: boolean
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true })

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let resolved = false

    function resolve(u: User | null) {
      if (resolved) {
        // After initial resolve, still update user on auth changes
        setUser(u)
        return
      }
      resolved = true
      setUser(u)
      setLoading(false)
    }

    // onAuthStateChange — reliable on client-side navigation
    // fires INITIAL_SESSION immediately with in-memory session
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      resolve(session?.user ?? null)
    })

    // getSession — reliable on cold page load (new tab, hard refresh)
    // races with onAuthStateChange, whichever wins sets the user first
    supabase.auth.getSession().then(({ data: { session } }) => {
      resolve(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}