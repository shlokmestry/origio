'use client'
import { useEffect, useState } from 'react'
import { Heart } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import ComicButton from '@/components/ComicButton'

export default function SaveCountryButton({ countrySlug }: { countrySlug: string }) {
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'INITIAL_SESSION') {
        if (!session) { setLoading(false); return }
        setUserId(session.user.id)
        const { data } = await supabase
          .from('saved_countries')
          .select('id')
          .eq('user_id', session.user.id)
          .eq('country_slug', countrySlug)
          .single()
        setSaved(!!data)
        setLoading(false)
      }
    })
    return () => subscription.unsubscribe()
  }, [countrySlug])

  const toggle = async () => {
    if (!userId) {
      window.location.href = `/signin?next=${encodeURIComponent(window.location.pathname)}`
      return
    }
    // Validate slug format before any DB operation
    if (!/^[a-z]+(-[a-z]+)*$/.test(countrySlug)) return
    setLoading(true)
    if (saved) {
      const { error } = await supabase
        .from('saved_countries')
        .delete()
        .eq('user_id', userId)
        .eq('country_slug', countrySlug)
      if (!error) setSaved(false)
    } else {
      const { error } = await supabase
        .from('saved_countries')
        .insert({ user_id: userId, country_slug: countrySlug })
      if (!error) setSaved(true)
    }
    setLoading(false)
  }

  return (
    <ComicButton
      variant={saved ? 'destructive' : 'default'}
      onClick={toggle}
      disabled={loading}
      style={{ opacity: loading ? 0.5 : 1, pointerEvents: loading ? 'none' : 'auto' }}
    >
      <Heart style={{ width: 14, height: 14, fill: saved ? 'currentColor' : 'none' }} />
      {saved ? 'Saved' : 'Save Country'}
    </ComicButton>
  )
}