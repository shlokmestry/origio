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

    function resolve(source: string, u: User | null) {
      console.log(`🔑 AUTH [${source}]: user=${!!u} | already resolved=${resolved}`)
      if (resolved) {
        setUser(u)
        return
      }
      resolved = true
      setUser(u)
      setLoading(false)
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log(`🔑 onAuthStateChange event: ${event} | user: ${!!session?.user}`)
      resolve('onAuthStateChange', session?.user ?? null)
    })

    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log(`🔑 getSession resolved: user=${!!session?.user}`)
      resolve('getSession', session?.user ?? null)
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