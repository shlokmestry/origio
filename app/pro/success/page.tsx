'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Nav from '@/components/Nav'
import { Check, Sparkles, Globe2, Zap } from 'lucide-react'

const FREE_FEATURES = [
  'Interactive 3D globe',
  'Basic country info',
  'Salary calculator',
  'Career guides by role',
  '1 wizard run',
]

const PRO_FEATURES = [
  'Everything in Free',
  'Unlimited wizard runs',
  'Full country deep-dives',
  'Side-by-side country comparison',
  'Saved wizard results',
  'Visa route details',
  'Priority updates',
]

export default function ProPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isPro, setIsPro] = useState(false)
  const [checkingUser, setCheckingUser] = useState(true)

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (data.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('is_pro')
          .eq('id', data.user.id)
          .single()
        setIsPro(profile?.is_pro ?? false)
      }
      setCheckingUser(false)
    })
  }, [])

  const handleUpgrade = async () => {
    setLoading(true)
    setError('')

    // Check if signed in first
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      // Not signed in — go to signin with redirect back to /pro
      router.push('/signin?next=/pro')
      return
    }

    try {
      const res = await fetch('/api/checkout', { method: 'POST' })
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

  return (
    <div className="min-h-screen bg-bg-primary">
      <Nav countries={[]} onCountrySelect={() => {}} />

      <div className="max-w-4xl mx-auto px-6 pt-28 pb-16">

        {/* Header */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-accent/20 bg-accent/5 text-accent text-xs font-semibold mb-6 uppercase tracking-widest">
            <Sparkles className="w-3 h-3" />
            Origio Pro
          </div>
          <h1 className="font-heading text-4xl sm:text-5xl font-extrabold text-text-primary mb-4">
            Find where you truly belong
          </h1>
          <p className="text-text-muted text-lg max-w-xl mx-auto">
            One-time payment. No subscription. No recurring charges. Unlock everything forever for less than a coffee.
          </p>
        </div>

        {/* Pricing cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">

          {/* Free */}
          <div className="glass-panel rounded-2xl p-8">
            <div className="flex items-center gap-2 mb-2">
              <Globe2 className="w-5 h-5 text-text-muted" />
              <h2 className="font-heading text-xl font-bold text-text-primary">Free</h2>
            </div>
            <p className="text-text-muted text-sm mb-6">Get started exploring countries</p>
            <div className="mb-8">
              <span className="font-heading text-4xl font-extrabold text-text-primary">€0</span>
              <span className="text-text-muted text-sm ml-2">forever</span>
            </div>
            <div className="space-y-3 mb-8">
              {FREE_FEATURES.map(f => (
                <div key={f} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-bg-elevated border border-border flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 text-text-muted" />
                  </div>
                  <span className="text-sm text-text-muted">{f}</span>
                </div>
              ))}
            </div>
            <div className="w-full py-3 rounded-xl border border-border text-sm text-text-muted text-center">
              Current plan
            </div>
          </div>

          {/* Pro */}
          <div className="relative rounded-2xl p-8 border border-accent/30 bg-accent/5">
            {/* Popular badge */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="px-4 py-1 rounded-full bg-accent text-bg-primary text-xs font-bold">
                BEST VALUE
              </span>
            </div>

            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-accent" />
              <h2 className="font-heading text-xl font-bold text-text-primary">Pro</h2>
            </div>
            <p className="text-text-muted text-sm mb-6">Everything you need to plan your move</p>
            <div className="mb-8">
              <span className="font-heading text-4xl font-extrabold text-text-primary">€5</span>
              <span className="text-text-muted text-sm ml-2">one-time</span>
            </div>
            <div className="space-y-3 mb-8">
              {PRO_FEATURES.map(f => (
                <div key={f} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 text-accent" />
                  </div>
                  <span className="text-sm text-text-primary">{f}</span>
                </div>
              ))}
            </div>

            {isPro ? (
              <div className="w-full py-3 rounded-xl bg-accent/10 border border-accent/20 text-sm text-accent text-center font-semibold flex items-center justify-center gap-2">
                <Sparkles className="w-4 h-4" />
                You&apos;re on Pro
              </div>
            ) : (
              <>
                {error && <p className="text-xs text-score-low mb-3">{error}</p>}
                <button
                  onClick={handleUpgrade}
                  disabled={loading || checkingUser}
                  className="cta-button w-full py-3 rounded-xl text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Zap className="w-4 h-4" />
                  {loading ? 'Loading...' : 'Upgrade to Pro — €5'}
                </button>
                <p className="text-xs text-text-muted text-center mt-3">
                  Secure payment via Stripe. No recurring charges.
                </p>
              </>
            )}
          </div>

        </div>

        {/* FAQ */}
        <div className="max-w-xl mx-auto space-y-4">
          <h3 className="font-heading text-lg font-bold text-text-primary text-center mb-6">Common questions</h3>
          {[
            { q: 'Is this really a one-time payment?', a: 'Yes. Pay once, access Pro forever. No subscription, no hidden fees.' },
            { q: 'What payment methods are accepted?', a: 'All major credit and debit cards via Stripe. Safe and secure.' },
            { q: 'Can I get a refund?', a: 'If you have an issue, contact us and we\'ll sort it out.' },
            { q: 'Do I need an account?', a: 'Yes — you need an account so we can unlock Pro features for you specifically.' },
          ].map(({ q, a }) => (
            <div key={q} className="glass-panel rounded-xl p-5">
              <p className="text-sm font-semibold text-text-primary mb-1">{q}</p>
              <p className="text-sm text-text-muted">{a}</p>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}