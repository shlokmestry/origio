'use client'
import { useEffect, useState } from 'react'
import { Heart, Lock } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function SaveCountryButton({ countrySlug }: { countrySlug: string }) {
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const [isPro, setIsPro] = useState(false)
  const [showProNudge, setShowProNudge] = useState(false)

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'INITIAL_SESSION') {
        if (!session) { setLoading(false); return }
        setUserId(session.user.id)

        const [saveRes, profileRes] = await Promise.all([
          supabase
            .from('saved_countries')
            .select('id')
            .eq('user_id', session.user.id)
            .eq('country_slug', countrySlug)
            .single(),
          supabase
            .from('profiles')
            .select('is_pro')
            .eq('id', session.user.id)
            .single(),
        ])

        setSaved(!!saveRes.data)
        setIsPro(profileRes.data?.is_pro ?? false)
        setLoading(false)
      }
    })
    return () => subscription.unsubscribe()
  }, [countrySlug])

  const toggle = async () => {
    // Not signed in — redirect to signin
    if (!userId) {
      window.location.href = `/signin?next=${encodeURIComponent(window.location.pathname)}`
      return
    }

    // Signed in but not pro — show nudge
    if (!isPro) {
      setShowProNudge(true)
      setTimeout(() => setShowProNudge(false), 3000)
      return
    }

    setLoading(true)
    if (saved) {
      await supabase
        .from('saved_countries')
        .delete()
        .eq('user_id', userId)
        .eq('country_slug', countrySlug)
      setSaved(false)
    } else {
      await supabase
        .from('saved_countries')
        .insert({ user_id: userId, country_slug: countrySlug })
      setSaved(true)
    }
    setLoading(false)
  }

  return (
    <div className="relative">
      <button
        onClick={toggle}
        disabled={loading}
        className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all duration-200 text-sm font-medium
          ${saved
            ? 'bg-rose-500/10 border-rose-500/30 text-rose-400 hover:bg-rose-500/20'
            : isPro || !userId
              ? 'border-border hover:border-border-hover text-text-muted hover:text-text-primary'
              : 'border-border text-text-muted opacity-80'
          }`}
      >
        {!isPro && userId ? (
          <Lock className="w-4 h-4" />
        ) : (
          <Heart className={`w-4 h-4 ${saved ? 'fill-rose-400 text-rose-400' : ''}`} />
        )}
        {saved ? 'Saved' : 'Save Country'}
      </button>

      {/* Pro nudge tooltip */}
      {showProNudge && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 w-56 glass-panel rounded-xl p-3 border border-accent/20 shadow-xl">
          <p className="text-xs text-text-primary font-semibold mb-1">Pro feature</p>
          <p className="text-xs text-text-muted mb-2 leading-relaxed">
            Saving countries requires Origio Pro.
          </p>
          <Link
            href="/pro"
            className="cta-button w-full py-1.5 rounded-lg text-xs text-center block font-bold"
          >
            Upgrade — €5
          </Link>
          {/* Arrow */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0"
            style={{ borderLeft: '6px solid transparent', borderRight: '6px solid transparent', borderTop: '6px solid rgba(0,212,200,0.2)' }} />
        </div>
      )}
    </div>
  )
}