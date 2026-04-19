'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/useAuth'
import Nav from '@/components/Nav'
import {
  Zap, Check, Lock, Globe2, Sparkles, ArrowRight,
  Shield, Plus,
} from 'lucide-react'

// ─── Static data ──────────────────────────────────────────────────────────────

const FREE_FEATURES = [
  '25 countries, real salary data',
  'Top 3 personalised country matches',
  'Cost of living & visa overview',
  'Role-specific relocation guides',
]

const PRO_FEATURES = [
  { text: 'All 25 countries ranked ~ not just top 3', bold: 'All 25 countries' },
  { text: 'Unlimited Find My Country runs', bold: null },
  { text: 'Full country deep-dives', bold: null },
  { text: 'Side-by-side comparison', bold: null },
  { text: 'Save country matches', bold: null },
  { text: 'Visa route details & difficulty', bold: null },
]

const FALLBACK_MATCHES = [
  { rank: '01', flag: '🇩🇰', name: 'Denmark', sub: 'Copenhagen · Schengen · Green Card track', pct: 94, label: 'Excellent', labelColor: '#00d4c8' },
  { rank: '02', flag: '🇳🇴', name: 'Norway', sub: 'Oslo · EEA · Skilled worker visa', pct: 91, label: 'Excellent', labelColor: '#00d4c8' },
  { rank: '03', flag: '🇨🇦', name: 'Canada', sub: 'Toronto · Express Entry · 6 mo wait', pct: 89, label: 'Strong', labelColor: '#facc15' },
]

const LOCKED_MATCHES = [
  { rank: '04', flag: '🇦🇺', name: 'Australia', sub: 'Melbourne · 189 Skilled · Points-tested', pct: 86, label: 'Strong' },
  { rank: '05', flag: '🇩🇪', name: 'Germany', sub: 'Berlin · EU Blue Card · Fast-track', pct: 83, label: 'Strong' },
  { rank: '06', flag: '🇳🇱', name: 'Netherlands', sub: 'Amsterdam · DAFT · 30% ruling', pct: 81, label: 'Strong' },
]

const FAQS = [
  {
    q: 'Is this really a one-time payment?',
    a: "Yes. Pay €5 once and access Pro forever. No subscription, no hidden fees, no auto-renewal ~ we'll never charge your card again.",
  },
  {
    q: 'What payment methods are accepted?',
    a: "All major credit and debit cards, plus Apple Pay and Google Pay ~ processed securely via Stripe. We never see your card details.",
  },
  {
    q: 'Can I get a refund?',
    a: "If something isn't right, email us and we'll sort it out. We stand behind the product.",
  },
  {
    q: 'Do I need an account?',
    a: "Yes, Pro features are tied to your account so they work across devices and stay active forever. You can browse the free globe without one.",
  },
  {
    q: 'What if I already ran Find My Country as a free user?',
    a: "Just run it again after upgrading. Your answers are saved — the next run will instantly show all 25 countries with full deep-dives.",
  },
]

// ─── Types ────────────────────────────────────────────────────────────────────

type TopCountry = {
  slug: string
  name: string
  flagEmoji: string
  matchPercent: number
}

function getMatchLabel(pct: number): { label: string; color: string } {
  if (pct >= 85) return { label: 'Excellent', color: '#00d4c8' }
  if (pct >= 70) return { label: 'Strong', color: '#facc15' }
  return { label: 'Fair', color: '#f87171' }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function ProPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  // Wizard result state
  const [wizardMatches, setWizardMatches] = useState<TopCountry[] | null>(null)
  const [wizardLoading, setWizardLoading] = useState(true)

  // Redirect already-pro users
  useEffect(() => {
    if (authLoading) return
    if (user) {
      supabase.from('profiles').select('is_pro').eq('id', user.id).single()
        .then(({ data }) => { if (data?.is_pro) router.replace('/profile') })
    }
  }, [user, authLoading, router])

  // Fetch wizard results if signed in
  useEffect(() => {
    if (authLoading) return
    if (!user) { setWizardLoading(false); return }

    supabase
      .from('wizard_results')
      .select('top_countries')
      .eq('user_id', user.id)
      .single()
      .then(({ data }) => {
        if (data?.top_countries?.length) {
          setWizardMatches(data.top_countries as TopCountry[])
        }
        setWizardLoading(false)
      })
  }, [user, authLoading])

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
      if (data.url) { window.location.href = data.url }
      else { setError('Something went wrong. Please try again.'); setLoading(false) }
    } catch {
      setError('Network error. Please try again.')
      setLoading(false)
    }
  }

  const hasRealMatches = !wizardLoading && wizardMatches && wizardMatches.length > 0
  const showFallback = !wizardLoading && !wizardMatches

  // The top 3 rows to show — either real or fallback
  const previewRows = hasRealMatches
    ? wizardMatches!.slice(0, 3).map((c, i) => {
        const { label, color } = getMatchLabel(c.matchPercent)
        return {
          rank: `0${i + 1}`,
          flag: c.flagEmoji,
          name: c.name,
          sub: null, // no sub for real matches
          pct: Math.min(c.matchPercent, 99),
          label,
          labelColor: color,
        }
      })
    : FALLBACK_MATCHES

  if (authLoading) return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="min-h-screen bg-bg-primary">
      <Nav countries={[]} onCountrySelect={() => {}} />

      {/* ── HERO ── */}
      <section className="relative pt-36 pb-10 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)',
            backgroundSize: '56px 56px',
            maskImage: 'radial-gradient(ellipse 70% 50% at 50% 0%, #000 40%, transparent 75%)',
          }} />
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(60% 50% at 50% 0%, rgba(0,212,200,0.14), transparent 70%)' }} />

        <div className="relative max-w-6xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-accent/20 bg-accent/5 text-accent text-xs font-bold uppercase tracking-widest mb-6">
            <Sparkles className="w-3 h-3" />
            Origio Pro · One-time €5
          </div>

          <h1 className="font-heading font-extrabold tracking-tight leading-[0.95] text-5xl sm:text-7xl text-text-primary mb-6">
            See where you{' '}
            <span className="gradient-text">truly rank</span>
          </h1>

          <p className="text-text-muted text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed mb-8">
            Free shows your top 3 country matches. Pro ranks all 25 — with deep-dives,
            visa routes, and side-by-side comparison.{' '}
            <span className="text-text-primary">Pay once. Yours forever.</span>
          </p>

          <div className="flex items-center justify-center gap-3 mb-8 flex-wrap">
            <button onClick={handleUpgrade} disabled={loading}
              className="cta-button px-6 py-3 rounded-xl text-sm inline-flex items-center gap-2 disabled:opacity-50">
              <Zap className="w-4 h-4" />
              {loading ? 'Redirecting…' : 'Upgrade to Pro — €5'}
            </button>
            <a href="#pricing"
              className="px-5 py-3 rounded-xl text-sm inline-flex items-center gap-2 border border-border hover:border-border-hover text-text-muted hover:text-text-primary transition-colors">
              Compare plans <ArrowRight className="w-4 h-4" />
            </a>
          </div>

          <div className="flex items-center justify-center gap-6 text-xs text-text-muted flex-wrap">
            {['No subscription', 'Secure via Stripe', 'Cancel-free forever'].map(t => (
              <span key={t} className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-accent" /> {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── PAYWALL PREVIEW ── */}
      <section className="relative py-16">
        <div className="max-w-xl mx-auto px-6">
          <div className="relative">
            <div className="absolute -inset-8 pointer-events-none rounded-[40px]"
              style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(0,212,200,0.12), transparent 70%)' }} />

            <div className="relative glass-panel rounded-2xl overflow-hidden"
              style={{ boxShadow: '0 40px 80px -20px rgba(0,0,0,0.6)' }}>

              {/* Header */}
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-border">
                <div className="flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-accent" />
                  <span className="text-xs font-semibold text-text-muted uppercase tracking-widest">
                    {hasRealMatches ? 'Your Matches' : 'Example Matches'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {hasRealMatches ? (
                    <span className="text-xs text-accent font-semibold">Your real results</span>
                  ) : (
                    <span className="text-xs text-text-muted">Preview</span>
                  )}
                  <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                </div>
              </div>

              {/* No quiz nudge — shown when signed in but no wizard results */}
              {showFallback && user && (
                <div className="flex items-center gap-3 px-5 py-3 border-b border-border bg-accent/5">
                  <Sparkles className="w-3.5 h-3.5 text-accent flex-shrink-0" />
                  <p className="text-xs text-text-muted flex-1">
                    These are example results.{' '}
                    <Link href="/wizard" className="text-accent hover:underline font-semibold">
                      Take the quiz
                    </Link>
                    {' '}to see your personal matches.
                  </p>
                </div>
              )}

              {/* No quiz nudge — signed out */}
              {showFallback && !user && (
                <div className="flex items-center gap-3 px-5 py-3 border-b border-border bg-accent/5">
                  <Sparkles className="w-3.5 h-3.5 text-accent flex-shrink-0" />
                  <p className="text-xs text-text-muted flex-1">
                    <Link href="/wizard" className="text-accent hover:underline font-semibold">
                      Take the quiz first
                    </Link>
                    {' '}to see your personal country matches here.
                  </p>
                </div>
              )}

              {/* Loading skeleton */}
              {wizardLoading && (
                <div className="px-5 py-4 space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="flex items-center gap-4 animate-pulse">
                      <div className="w-5 h-3 bg-bg-elevated rounded" />
                      <div className="w-8 h-8 bg-bg-elevated rounded-full" />
                      <div className="flex-1 h-3 bg-bg-elevated rounded" />
                      <div className="w-12 h-4 bg-bg-elevated rounded" />
                    </div>
                  ))}
                </div>
              )}

              {/* Preview rows — real or fallback */}
              {!wizardLoading && previewRows.map(m => (
                <div key={m.name} className="flex items-center gap-4 px-5 py-4 border-b border-border hover:bg-white/[0.02] transition-colors">
                  <div className="flex items-center gap-2.5">
                    <span className="font-heading text-sm font-bold text-accent w-5">{m.rank}</span>
                    <span className="text-2xl">{m.flag}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-text-primary">{m.name}</p>
                    {m.sub && <p className="text-xs text-text-muted truncate">{m.sub}</p>}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="font-heading text-xl font-bold text-text-primary leading-none">
                      {m.pct}<span className="text-text-muted text-sm font-medium">%</span>
                    </div>
                    <div className="text-[10px] uppercase tracking-wider mt-1 font-semibold" style={{ color: m.labelColor }}>
                      {m.label}
                    </div>
                  </div>
                </div>
              ))}

              {/* Pro gate divider */}
              <div className="relative flex items-center gap-3 px-5 py-3 border-b border-border"
                style={{ background: 'linear-gradient(to right, transparent, rgba(0,212,200,0.05), transparent)' }}>
                <div className="flex-1 h-px" style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.08) 1px, transparent 1px)', backgroundSize: '6px 6px', backgroundRepeat: 'repeat-x' }} />
                <span className="text-[10px] font-bold text-accent uppercase tracking-widest whitespace-nowrap">Pro unlocks below</span>
                <div className="flex-1 h-px" style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.08) 1px, transparent 1px)', backgroundSize: '6px 6px', backgroundRepeat: 'repeat-x' }} />
              </div>

              {/* Locked rows */}
              <div className="relative">
                {LOCKED_MATCHES.map(m => (
                  <div key={m.name} className="relative flex items-center gap-4 px-5 py-4 border-b border-border last:border-0">
                    <div className="flex items-center gap-4 flex-1" style={{ filter: 'blur(5px) saturate(0.4)', opacity: 0.55 }}>
                      <div className="flex items-center gap-2.5">
                        <span className="font-heading text-sm font-bold text-text-muted w-5">{m.rank}</span>
                        <span className="text-2xl">{m.flag}</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-text-primary">{m.name}</p>
                        <p className="text-xs text-text-muted truncate">{m.sub}</p>
                      </div>
                      <div className="text-right">
                        <div className="font-heading text-xl font-bold">{m.pct}%</div>
                        <div className="text-[10px] text-text-muted uppercase">{m.label}</div>
                      </div>
                    </div>
                    <Lock className="w-3.5 h-3.5 text-text-muted flex-shrink-0 absolute right-5" />
                  </div>
                ))}

                {/* Upgrade CTA inside locked section */}
                <div className="px-5 py-5 flex flex-col items-center gap-3 border-t border-border"
                  style={{ background: 'linear-gradient(to bottom, transparent, rgba(0,212,200,0.04))' }}>
                  <p className="text-xs text-text-muted text-center">
                    {hasRealMatches
                      ? `+ ${22} more countries ranked for you`
                      : '+ 22 more countries waiting'}
                  </p>
                  <button onClick={handleUpgrade} disabled={loading}
                    className="cta-button px-5 py-2.5 rounded-xl text-sm inline-flex items-center gap-2 w-full justify-center">
                    <Zap className="w-3.5 h-3.5" />
                    {loading ? 'Redirecting…' : 'Unlock all 25 — €5'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PRICING TABLE ── */}
      <section id="pricing" className="relative py-20">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="font-heading text-3xl font-extrabold text-center text-text-primary mb-12">
            Simple pricing
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Free */}
            <div className="glass-panel rounded-2xl p-8 border border-border">
              <div className="mb-6">
                <p className="text-xs font-bold text-text-muted uppercase tracking-widest mb-2">Free</p>
                <div className="flex items-baseline gap-1">
                  <span className="font-heading text-4xl font-extrabold text-text-primary">€0</span>
                  <span className="text-text-muted text-sm">forever</span>
                </div>
                <p className="text-xs text-text-muted mt-2">Start exploring — no account needed.</p>
              </div>
              <ul className="space-y-3 mb-8">
                {FREE_FEATURES.map(f => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-text-muted">
                    <Check className="w-4 h-4 text-text-muted flex-shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/"
                className="block text-center w-full py-3 rounded-xl border border-border text-sm text-text-muted hover:text-text-primary hover:border-border-hover transition-colors">
                Continue free
              </Link>
            </div>

            {/* Pro */}
            <div className="relative rounded-2xl p-8 overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, rgba(0,212,200,0.08) 0%, rgba(0,0,0,0) 60%)',
                border: '1px solid rgba(0,212,200,0.3)',
                boxShadow: '0 0 40px rgba(0,212,200,0.08)',
              }}>
              <div className="absolute top-4 right-4">
                <span className="text-[10px] font-bold text-bg-primary bg-accent px-2.5 py-1 rounded-full uppercase tracking-wider">
                  Best value
                </span>
              </div>
              <div className="mb-6">
                <p className="text-xs font-bold text-accent uppercase tracking-widest mb-2">Pro</p>
                <div className="flex items-baseline gap-1">
                  <span className="font-heading text-4xl font-extrabold text-text-primary">€5</span>
                  <span className="text-text-muted text-sm">one-time</span>
                </div>
                <p className="text-xs text-text-muted mt-2">Pay once. Access forever. No subscription.</p>
              </div>
              <ul className="space-y-3 mb-8">
                {PRO_FEATURES.map(f => (
                  <li key={f.text} className="flex items-start gap-2.5 text-sm text-text-primary">
                    <Check className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                    {f.bold ? (
                      <span><strong>{f.bold}</strong>{f.text.replace(f.bold, '')}</span>
                    ) : f.text}
                  </li>
                ))}
              </ul>
              <button onClick={handleUpgrade} disabled={loading}
                className="cta-button w-full py-3.5 rounded-xl text-sm font-bold inline-flex items-center justify-center gap-2 disabled:opacity-50">
                <Zap className="w-4 h-4" />
                {loading ? 'Redirecting…' : 'Upgrade to Pro — €5'}
              </button>
              {error && <p className="text-xs text-red-400 mt-3 text-center">{error}</p>}
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-20 border-t border-border">
        <div className="max-w-2xl mx-auto px-6">
          <h2 className="font-heading text-2xl font-extrabold text-text-primary mb-10 text-center">
            Questions
          </h2>
          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <div key={i} className="glass-panel rounded-xl overflow-hidden border border-border">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left"
                >
                  <span className="text-sm font-semibold text-text-primary">{faq.q}</span>
                  <Plus className={`w-4 h-4 text-text-muted flex-shrink-0 transition-transform ${openFaq === i ? 'rotate-45' : ''}`} />
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-4">
                    <p className="text-sm text-text-muted leading-relaxed">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Globe2 className="w-4 h-4 text-accent" />
            <span className="font-heading text-sm font-bold text-text-primary">Origio</span>
            <span className="text-text-muted text-xs ml-2">© 2026</span>
          </div>
          <div className="flex items-center gap-5 text-xs text-text-muted">
            <Link href="/about" className="hover:text-text-primary transition-colors">About</Link>
            <Link href="/faq" className="hover:text-text-primary transition-colors">FAQ</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}