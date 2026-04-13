'use client'
import Link from 'next/link'
import { Sparkles, Lock } from 'lucide-react'

const PRO_FEATURES = [
  'Unlimited Find My Country',
  'Full country deep-dives',
  'Side-by-side country comparison',
  'Saved country matches',
]

export default function UpgradeBanner({ compact = false }: { compact?: boolean }) {
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
        <Link href="/pro"
          className="cta-button px-6 py-2.5 rounded-xl text-sm flex items-center gap-2 mx-auto w-fit">
          <Sparkles className="w-4 h-4" />
          Upgrade to Pro — €5
        </Link>
      </div>
    )
  }

  return (
    <div className="glass-panel rounded-2xl p-6 border border-accent/10">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-5 h-5 text-accent" />
          </div>
          <div>
            <p className="text-sm font-bold text-text-primary">Upgrade to Origio Pro</p>
            <p className="text-xs text-text-muted">
              {PRO_FEATURES.join(' · ')}
            </p>
          </div>
        </div>
        <Link href="/pro"
          className="cta-button px-5 py-2.5 rounded-xl text-sm flex items-center gap-2 flex-shrink-0">
          <Sparkles className="w-3.5 h-3.5" />
          €5 one-time
        </Link>
      </div>
    </div>
  )
}