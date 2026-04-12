'use client'
import { useState } from 'react'
import { Sparkles, Lock } from 'lucide-react'

const PRO_FEATURES = [
  'Unlimited wizard runs',
  'Full country deep-dives',
  'Side-by-side country comparison',
  'Saved wizard results',
  'Salary breakdown by role',
]

export default function UpgradeBanner({ compact = false }: { compact?: boolean }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleUpgrade = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/checkout', { method: 'POST' })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else if (res.status === 401) {
        window.location.href = '/signin'
      } else {
        setError('Something went wrong. Please try again.')
        setLoading(false)
      }
    } catch {
      setError('Network error. Please try again.')
      setLoading(false)
    }
  }

  if (compact) {
    return (
      <div className="glass-panel rounded-2xl p-6 text-center border border-accent/10">
        <Lock className="w-8 h-8 text-accent mx-auto mb-3" />
        <h3 className="font-heading text-lg font-bold text-text-primary mb-1">
          Origio Pro feature
        </h3>
        <p className="text-sm text-text-muted mb-4">
          Upgrade for €5 — one time, no subscription.
        </p>
        {error && <p className="text-xs text-score-low mb-3">{error}</p>}
        <button
          onClick={handleUpgrade}
          disabled={loading}
          className="cta-button px-6 py-2.5 rounded-xl text-sm flex items-center gap-2 mx-auto disabled:opacity-50"
        >
          <Sparkles className="w-4 h-4" />
          {loading ? 'Loading...' : 'Upgrade to Pro — €5'}
        </button>
      </div>
    )
  }

  return (
    <div className="glass-panel rounded-2xl p-8 text-center border border-accent/10 max-w-md mx-auto">
      <div className="w-14 h-14 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center mx-auto mb-4">
        <Sparkles className="w-7 h-7 text-accent" />
      </div>
      <h2 className="font-heading text-2xl font-extrabold text-text-primary mb-2">
        Origio Pro
      </h2>
      <p className="text-text-muted text-sm mb-6">
        One-time payment. No subscription. Unlock everything forever.
      </p>

      <div className="text-left space-y-2.5 mb-6">
        {PRO_FEATURES.map(f => (
          <div key={f} className="flex items-center gap-2.5">
            <div className="w-4 h-4 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
              <span className="text-accent text-[10px]">✓</span>
            </div>
            <span className="text-sm text-text-muted">{f}</span>
          </div>
        ))}
      </div>

      <div className="mb-4">
        <span className="font-heading text-4xl font-extrabold text-text-primary">€5</span>
        <span className="text-text-muted text-sm ml-2">one-time</span>
      </div>

      {error && <p className="text-xs text-score-low mb-3">{error}</p>}

      <button
        onClick={handleUpgrade}
        disabled={loading}
        className="cta-button w-full py-3 rounded-xl text-sm flex items-center justify-center gap-2 disabled:opacity-50"
      >
        <Sparkles className="w-4 h-4" />
        {loading ? 'Loading...' : 'Upgrade to Pro — €5'}
      </button>
      <p className="text-xs text-text-muted mt-3">
        Secure payment via Stripe. No recurring charges.
      </p>
    </div>
  )
}