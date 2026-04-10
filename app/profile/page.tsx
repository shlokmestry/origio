'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'
import Nav from '@/components/Nav'

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
      setLoading(false)
    })
  }, [])

  const signOut = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-text-muted">Loading...</p>
    </div>
  )

  if (!user) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6">
      <h1 className="font-display text-3xl gradient-text">Sign in to Origio</h1>
      <p className="text-text-muted">Save countries and track your wizard results</p>
      <AuthButton />
    </div>
  )

  return (
    <div className="min-h-screen bg-bg-primary">
      <Nav />
      <div className="max-w-2xl mx-auto px-6 py-24">

        {/* Avatar + Name */}
        <div className="flex items-center gap-4 mb-10">
          {user.user_metadata?.avatar_url && (
            <img
              src={user.user_metadata.avatar_url}
              alt="avatar"
              className="w-16 h-16 rounded-full border border-border"
            />
          )}
          <div>
            <h1 className="font-display text-2xl text-text-primary">
              {user.user_metadata?.full_name ?? 'Explorer'}
            </h1>
            <p className="text-text-muted text-sm">{user.email}</p>
          </div>
        </div>

        {/* Saved Countries — placeholder for now */}
        <div className="glass-panel rounded-2xl p-6 mb-6">
          <h2 className="font-display text-lg mb-4 text-text-primary">Saved Countries</h2>
          <p className="text-text-muted text-sm">No saved countries yet — start exploring!</p>
        </div>

        {/* Wizard Result — placeholder for now */}
        <div className="glass-panel rounded-2xl p-6 mb-10">
          <h2 className="font-display text-lg mb-4 text-text-primary">Last Wizard Result</h2>
          <p className="text-text-muted text-sm">No wizard results yet — take the quiz!</p>
        </div>

        <button onClick={signOut} className="text-sm text-text-muted hover:text-score-low transition-colors">
          Sign out
        </button>

      </div>
    </div>
  )
}

import AuthButton from '@/components/AuthButton'