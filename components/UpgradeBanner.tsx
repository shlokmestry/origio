'use client'
import Link from 'next/link'
import { Sparkles, Lock } from 'lucide-react'

const PRO_FEATURES = [
  'Unlimited Find My Country',
  'Full country deep-dives',
  'Side-by-side comparison',
  'Saved country matches',
]

export default function UpgradeBanner({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <div className="border-2 border-[#2a2a2a] p-6 text-center" style={{ boxShadow: "4px 4px 0 #2a2a2a" }}>
        <Lock className="w-7 h-7 text-accent mx-auto mb-3" />
        <h3 className="font-heading text-base font-extrabold text-text-primary uppercase tracking-tight mb-1">
          Origio Pro feature
        </h3>
        <p className="text-xs text-text-muted mb-4">Upgrade for €19.99 ~ one time, no subscription.</p>
        <Link href="/pro" className="cta-button px-6 py-2.5 text-xs font-bold inline-flex items-center gap-2 uppercase tracking-wide">
          <Sparkles className="w-3.5 h-3.5" />
          Upgrade to Pro ~ €19.99
        </Link>
      </div>
    )
  }

  return (
    <div className="border-2 border-[#2a2a2a] p-5" style={{ boxShadow: "4px 4px 0 #2a2a2a" }}>
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 border-2 border-accent flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-5 h-5 text-accent" />
          </div>
          <div>
            <p className="text-sm font-bold text-text-primary uppercase tracking-tight">Upgrade to Origio Pro</p>
            <p className="text-xs text-text-muted mt-0.5">{PRO_FEATURES.join(' · ')}</p>
          </div>
        </div>
        <Link href="/pro" className="cta-button px-5 py-2.5 text-xs font-bold inline-flex items-center gap-2 uppercase flex-shrink-0">
          <Sparkles className="w-3 h-3" />
          €19.99 one-time
        </Link>
      </div>
    </div>
  )
}