'use client'
import { useEffect, useState } from 'react'
import { Heart } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function SaveCountryButton({ countrySlug }: { countrySlug: string }) {
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
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
    })
  }, [countrySlug])

  const toggle = async () => {
    if (!userId) {
      // Redirect to signin with current page as next destination
      window.location.href = `/signin?next=${encodeURIComponent(window.location.pathname)}`
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
    <button
      onClick={toggle}
      disabled={loading}
      className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all duration-200 text-sm font-medium
        ${saved
          ? 'bg-rose-500/10 border-rose-500/30 text-rose-400 hover:bg-rose-500/20'
          : 'border-border hover:border-border-hover text-text-muted hover:text-text-primary'
        }`}
    >
      <Heart className={`w-4 h-4 ${saved ? 'fill-rose-400 text-rose-400' : ''}`} />
      {saved ? 'Saved' : 'Save Country'}
    </button>
  )
}