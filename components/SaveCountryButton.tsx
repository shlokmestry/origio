'use client'
import { useEffect, useState } from 'react'
import { Heart } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function SaveCountryButton({ countrySlug }: { countrySlug: string }) {
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const [pulse, setPulse] = useState(false)

  useEffect(() => {
    async function init() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { setLoading(false); return }
      setUserId(session.user.id)
      const { data } = await supabase
        .from('saved_countries')
        .select('id')
        .eq('user_id', session.user.id)
        .eq('country_slug', countrySlug)
        .maybeSingle()
      setSaved(!!data)
      setLoading(false)
    }
    init()
  }, [countrySlug])

  const toggle = async () => {
    if (!userId) {
      window.location.href = `/signin?next=${encodeURIComponent(window.location.pathname)}`
      return
    }
    if (!/^[a-z]+(-[a-z]+)*$/.test(countrySlug)) return

    // Optimistic update + pulse animation
    const next = !saved
    setSaved(next)
    setPulse(true)
    setTimeout(() => setPulse(false), 300)

    if (!next) {
      const { error } = await supabase
        .from('saved_countries')
        .delete()
        .eq('user_id', userId)
        .eq('country_slug', countrySlug)
      if (error) setSaved(true) // revert on error
    } else {
      const { error } = await supabase
        .from('saved_countries')
        .insert({ user_id: userId, country_slug: countrySlug })
      if (error) setSaved(false) // revert on error
    }
  }

  return (
    <>
      <style>{`
        @keyframes heartPop {
          0%   { transform: scale(1); }
          40%  { transform: scale(1.35); }
          70%  { transform: scale(0.9); }
          100% { transform: scale(1); }
        }
        .save-heart-icon.popping { animation: heartPop 0.3s cubic-bezier(0.22,1,0.36,1) both; }
      `}</style>
      <button
        onClick={toggle}
        disabled={loading}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '8px 16px',
          borderRadius: 999,
          border: saved ? '1px solid rgba(244,63,94,0.4)' : '1px solid rgba(255,255,255,0.15)',
          background: saved ? 'rgba(244,63,94,0.1)' : 'transparent',
          color: saved ? '#f43f5e' : 'rgba(255,255,255,0.55)',
          fontSize: 13,
          fontWeight: 600,
          fontFamily: 'Satoshi, sans-serif',
          cursor: loading ? 'default' : 'pointer',
          transition: 'background 0.2s, border-color 0.2s, color 0.2s',
          opacity: loading ? 0.5 : 1,
        }}
      >
        <Heart
          className={`save-heart-icon${pulse ? ' popping' : ''}`}
          size={15}
          style={{
            fill: saved ? '#f43f5e' : 'none',
            color: saved ? '#f43f5e' : 'currentColor',
            transition: 'fill 0.15s, color 0.15s',
            flexShrink: 0,
          }}
        />
        {saved ? 'Saved' : 'Save Country'}
      </button>
    </>
  )
}
