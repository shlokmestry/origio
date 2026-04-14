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
  '1 Find My Country run',
]

const PRO_FEATURES = [
  'Everything in Free',
  'Unlimited Find My Country',
  'Full country deep-dives',
  'Side-by-side country comparison',
  'Saved country matches',
  'Visa route details',
  'Priority updates',
]

export default function ProPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [checkingUser, setCheckingUser] = useState(true)

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('is_pro')
          .eq('id', session.user.id)
          .single()
        if (profile?.is_pro) {
          router.replace('/profile')
          return
        }
      }
      setCheckingUser(false)
    })

    return () => subscription.unsubscribe()
  }, [router])

  const handleUpgrade = async () => {
    setLoading(true)
    setError('')

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      router.push('/signin?next=/pro')
      return
    }

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

  if (checkingUser) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg-primary">
      <Nav countries={[]} onCountrySelect={() => {}} />
      <div className="max-w-4xl mx-auto px-6 pt-28 pb-16">

        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-accent/20 bg-accent/5 text-accent text-xs font-semibold mb-6 uppercase tracking-widest">
            <Sparkles className="w-3 h-3" />
            Origio Pro
          </div>
          <h1 className="font-heading text-4xl sm:text-5xl font-extrabold text-text-primary mb-4">
            Find where you truly belong
          </h1>
          <p className="text-text-muted text-lg max-w-xl mx-auto">
            One-time payment. No subscription. No recurring charges. Unlock everything forever.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-6 max-w-2xl mx-auto mb-16">

          <div className="glass-panel rounded-2xl p-6 border border-border">
            <div className="flex items-center gap-2 mb-1">
              <Globe2 className="w-4 h-4 text-text-muted" />
              <span className="font-heading font-bold text-text-primary">Free</span>
            </div>
            <p className="text-xs text-text-muted mb-4">Get started exploring countries</p>
            <div className="mb-6">
              <span className="font-heading text-3xl font-extrabold text-text-primary">€0</span>
              <span className="text-sm text-text-muted ml-2">forever</span>
            </div>
            <ul className="space-y-2 mb-6">
              {FREE_FEATURES.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-text-muted">
                  <Check className="w-4 h-4 text-text-muted flex-shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <div className="w-full py-3 rounded-xl border border-border text-sm text-text-muted text-center">
              Current plan
            </div>
          </div>

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
            <p className="text-xs text-text-muted mb-4">Everything you need to plan your move</p>
            <div className="mb-6">
              <span className="font-heading text-3xl font-extrabold text-text-primary">€5</span>
              <span className="text-sm text-text-muted ml-2">one-time</span>
            </div>
            <ul className="space-y-2 mb-6">
              {PRO_FEATURES.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-text-primary">
                  <Check className="w-4 h-4 text-accent flex-shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            {error && <p className="text-xs text-score-low mb-3">{error}</p>}
            <button
              onClick={handleUpgrade}
              disabled={loading}
              className="cta-button w-full py-3 rounded-xl text-sm flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Zap className="w-4 h-4" />
              {loading ? 'Loading...' : 'Upgrade to Pro — €5'}
            </button>
            <p className="text-xs text-text-muted text-center mt-3">
              Secure payment via Stripe. No recurring charges.
            </p>
          </div>
        </div>

        <div className="max-w-xl mx-auto space-y-4">
          <h3 className="font-heading text-lg font-bold text-text-primary text-center mb-6">Common questions</h3>
          {[
            { q: 'Is this really a one-time payment?', a: 'Yes. Pay once, access Pro forever. No subscription, no hidden fees.' },
            { q: 'What payment methods are accepted?', a: 'All major credit and debit cards via Stripe. Safe and secure.' },
            { q: "Can I get a refund?", a: "If you have an issue, contact us and we'll sort it out." },
            { q: 'Do I need an account?', a: 'Yes — you need an account so we can unlock Pro features for you.' },
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