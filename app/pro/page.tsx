'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/useAuth'
import Nav from '@/components/Nav'
import { Check, Sparkles, Globe2, Zap, Lock } from 'lucide-react'

const FREE_FEATURES = [
  'Interactive 3D globe',
  'Top 3 country matches',
  'Basic country info',
  'Salary calculator',
  'Career guides by role',
]

const PRO_FEATURES = [
  'All 25 countries ranked — not just top 3',
  'Unlimited Find My Country runs',
  'Full country deep-dives',
  'Side-by-side country comparison',
  'Save and revisit country matches',
  'Visa route details & difficulty ratings',
]

// Mock top match preview for the visual
const PREVIEW_MATCHES = [
  { flag: '🇩🇰', name: 'Denmark', pct: 94, locked: false },
  { flag: '🇳🇴', name: 'Norway', pct: 91, locked: false },
  { flag: '🇨🇦', name: 'Canada', pct: 89, locked: false },
  { flag: '🇦🇺', name: 'Australia', pct: 86, locked: true },
  { flag: '🇩🇪', name: 'Germany', pct: 83, locked: true },
  { flag: '🇳🇱', name: 'Netherlands', pct: 81, locked: true },
]

export default function ProPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (authLoading) return
    if (user) {
      supabase
        .from('profiles')
        .select('is_pro')
        .eq('id', user.id)
        .single()
        .then(({ data: profile }) => {
          if (profile?.is_pro) router.replace('/profile')
        })
    }
  }, [user, authLoading, router])

  const handleUpgrade = async () => {
    setLoading(true)
    setError('')
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { router.push('/signin?next=/pro'); return }
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${session.access_token}` },
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        setError('Something went wrong. Please try again.')
        setLoading(false)
      }
    } catch {
      setError('Network error. Please try again.')
      setLoading(false)
    }
  }

  if (authLoading) return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="min-h-screen bg-bg-primary">
      <Nav countries={[]} onCountrySelect={() => {}} />

      <div className="max-w-5xl mx-auto px-6 pt-28 pb-20">

        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-accent/20 bg-accent/5 text-accent text-xs font-semibold mb-5 uppercase tracking-widest">
            <Sparkles className="w-3 h-3" /> Origio Pro
          </div>
          <h1 className="font-heading text-4xl sm:text-5xl font-extrabold text-text-primary mb-4">
            See where you truly rank
          </h1>
          <p className="text-text-muted text-base max-w-lg mx-auto">
            Free users see their top 3 matches. Pro unlocks all 25 — ranked, scored, and detailed. One payment, yours forever.
          </p>
        </div>

        {/* Visual comparison — the key hook */}
        <div className="glass-panel rounded-2xl border border-border overflow-hidden mb-14 max-w-lg mx-auto">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">Your country matches</p>
            <span className="text-xs text-accent bg-accent/10 px-2 py-0.5 rounded-full font-semibold">Example</span>
          </div>
          <div>
            {PREVIEW_MATCHES.map((m, i) => (
              <div key={m.name}
                className={`flex items-center gap-3 px-5 py-3 border-b border-border last:border-0 ${m.locked ? 'opacity-40' : ''}`}>
                <span className="text-xs text-text-muted w-4 text-center">#{i + 1}</span>
                {m.locked ? (
                  <>
                    <div className="w-6 h-6 rounded bg-bg-elevated flex items-center justify-center flex-shrink-0">
                      <Lock className="w-3 h-3 text-text-muted" />
                    </div>
                    <div className="flex-1 h-3 bg-bg-elevated rounded" />
                    <div className="w-12 h-3 bg-bg-elevated rounded" />
                  </>
                ) : (
                  <>
                    <span className="text-lg">{m.flag}</span>
                    <span className="text-sm font-medium text-text-primary flex-1">{m.name}</span>
                    <span className="text-xs font-semibold text-accent">{m.pct}% match</span>
                  </>
                )}
              </div>
            ))}
          </div>
          <div className="px-5 py-4 bg-bg-elevated border-t border-border text-center">
            <p className="text-xs text-text-muted mb-3">
              <span className="text-text-primary font-semibold">22 more countries</span> unlocked with Pro
            </p>
            <button onClick={handleUpgrade} disabled={loading}
              className="cta-button px-6 py-2.5 rounded-xl text-sm inline-flex items-center gap-2 disabled:opacity-50">
              <Zap className="w-3.5 h-3.5" />
              {loading ? 'Loading...' : 'Unlock all 25 — €5'}
            </button>
          </div>
        </div>

        {/* Pricing cards */}
        <div className="grid sm:grid-cols-2 gap-5 max-w-3xl mx-auto mb-16">

          {/* Free */}
          <div className="glass-panel rounded-2xl p-6 border border-border">
            <div className="flex items-center gap-2 mb-1">
              <Globe2 className="w-4 h-4 text-text-muted" />
              <span className="font-heading font-bold text-text-primary">Free</span>
            </div>
            <p className="text-xs text-text-muted mb-5">Start exploring, no account needed</p>
            <div className="mb-6">
              <span className="font-heading text-3xl font-extrabold text-text-primary">€0</span>
              <span className="text-sm text-text-muted ml-2">forever</span>
            </div>
            <ul className="space-y-2.5 mb-6">
              {FREE_FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-text-muted">
                  <Check className="w-4 h-4 text-text-muted flex-shrink-0 mt-0.5" />
                  {f}
                </li>
              ))}
            </ul>
            <div className="w-full py-3 rounded-xl border border-border text-sm text-text-muted text-center">
              Current plan
            </div>
          </div>

          {/* Pro */}
          <div className="glass-panel rounded-2xl p-6 border border-accent/30 relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="px-3 py-1 rounded-full bg-accent text-bg-primary text-xs font-bold uppercase tracking-wider">
                Best Value
              </span>
            </div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-accent" />
              <span className="font-heading font-bold text-text-primary">Pro</span>
            </div>
            <p className="text-xs text-text-muted mb-5">Everything you need to plan your move</p>
            <div className="mb-6">
              <span className="font-heading text-3xl font-extrabold text-text-primary">€5</span>
              <span className="text-sm text-text-muted ml-2">one-time · no subscription</span>
            </div>
            <ul className="space-y-2.5 mb-6">
              {PRO_FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-text-primary">
                  <Check className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                  {f}
                </li>
              ))}
            </ul>
            {error && <p className="text-xs text-rose-400 mb-3">{error}</p>}
            <button onClick={handleUpgrade} disabled={loading}
              className="cta-button w-full py-3 rounded-xl text-sm flex items-center justify-center gap-2 disabled:opacity-50">
              <Zap className="w-4 h-4" />
              {loading ? 'Loading...' : 'Upgrade to Pro — €5'}
            </button>
            <p className="text-xs text-text-muted text-center mt-3">
              Secure payment via Stripe. No recurring charges.
            </p>
          </div>
        </div>

        {/* FAQ */}
        <div className="max-w-2xl mx-auto space-y-3">
          <h3 className="font-heading text-lg font-bold text-text-primary text-center mb-6">Common questions</h3>
          {[
            { q: 'Is this really a one-time payment?', a: 'Yes. Pay once, access Pro forever. No subscription, no hidden fees, no renewal.' },
            { q: 'What payment methods are accepted?', a: 'All major credit and debit cards via Stripe. Safe and secure.' },
            { q: "Can I get a refund?", a: "If you have an issue, email us and we'll sort it out." },
            { q: 'Do I need an account?', a: 'Yes — we need an account to unlock Pro features for you and keep them active.' },
            { q: 'What if I already ran Find My Country as a free user?', a: 'Just run it again after upgrading — you will see all 25 countries this time.' },
          ].map(({ q, a }) => (
            <div key={q} className="glass-panel rounded-xl p-5 border border-border">
              <p className="text-sm font-semibold text-text-primary mb-1">{q}</p>
              <p className="text-sm text-text-muted">{a}</p>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}