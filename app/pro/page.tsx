'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/useAuth'
import Nav from '@/components/Nav'
import {
  Zap, Check, Lock, Globe2, Sparkles, ArrowRight,
  Shield, Plus
} from 'lucide-react'

const FREE_FEATURES = [
  'Interactive 3D globe',
  'Top 3 country matches',
  'Basic country info',
  'Salary calculator',
  'Career guides by role',
]

const PRO_FEATURES = [
  { text: 'All 25 countries ranked — not just top 3', bold: 'All 25 countries' },
  { text: 'Unlimited Find My Country runs', bold: null },
  { text: 'Full country deep-dives', bold: null },
  { text: 'Side-by-side comparison', bold: null },
  { text: 'Save country matches', bold: null },
  { text: 'Visa route details & difficulty', bold: null },
]

const PREVIEW_MATCHES = [
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
    a: 'Yes. Pay €5 once and access Pro forever. No subscription, no hidden fees, no auto-renewal — we\'ll never charge your card again.',
  },
  {
    q: 'What payment methods are accepted?',
    a: 'All major credit and debit cards, plus Apple Pay and Google Pay — processed securely via Stripe. We never see your card details.',
  },
  {
    q: 'Can I get a refund?',
    a: 'If something isn\'t right, email us and we\'ll sort it out. We stand behind the product.',
  },
  {
    q: 'Do I need an account?',
    a: 'Yes — Pro features are tied to your account so they work across devices and stay active forever. You can browse the free globe without one.',
  },
  {
    q: 'What if I already ran Find My Country as a free user?',
    a: 'Just run it again after upgrading. Your answers are saved — the next run will instantly show all 25 countries with full deep-dives.',
  },
]

export default function ProPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  useEffect(() => {
    if (authLoading) return
    if (user) {
      supabase.from('profiles').select('is_pro').eq('id', user.id).single()
        .then(({ data }) => { if (data?.is_pro) router.replace('/profile') })
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
      if (data.url) { window.location.href = data.url }
      else { setError('Something went wrong. Please try again.'); setLoading(false) }
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

      {/* ── HERO ── */}
      <section className="relative pt-36 pb-10 overflow-hidden">
        {/* Grid bg */}
        <div className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)',
            backgroundSize: '56px 56px',
            maskImage: 'radial-gradient(ellipse 70% 50% at 50% 0%, #000 40%, transparent 75%)',
          }} />
        {/* Ambient glow */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(60% 50% at 50% 0%, rgba(0,212,200,0.14), transparent 70%)' }} />

        <div className="relative max-w-6xl mx-auto px-6 text-center">
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-accent/20 bg-accent/5 text-accent text-xs font-bold uppercase tracking-widest mb-6">
            <Sparkles className="w-3 h-3" />
            Origio Pro · One-time €5
          </div>

          {/* Headline */}
          <h1 className="font-heading font-extrabold tracking-tight leading-[0.95] text-5xl sm:text-7xl text-text-primary mb-6">
            See where you{' '}
            <span className="gradient-text">truly rank</span>
          </h1>

          {/* Subhead */}
          <p className="text-text-muted text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed mb-8">
            Free shows your top 3 country matches. Pro ranks all 25 — with deep-dives,
            visa routes, and side-by-side comparison.{' '}
            <span className="text-text-primary">Pay once. Yours forever.</span>
          </p>

          {/* CTAs */}
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

          {/* Trust row */}
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
            {/* Soft glow */}
            <div className="absolute -inset-8 pointer-events-none rounded-[40px]"
              style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(0,212,200,0.12), transparent 70%)' }} />

            <div className="relative glass-panel rounded-2xl overflow-hidden"
              style={{ boxShadow: '0 40px 80px -20px rgba(0,0,0,0.6)' }}>

              {/* Header */}
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-border">
                <div className="flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-accent" />
                  <span className="text-xs font-semibold text-text-muted uppercase tracking-widest">Your Matches</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-text-muted">Live preview</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                </div>
              </div>

              {/* Visible rows */}
              {PREVIEW_MATCHES.map(m => (
                <div key={m.name} className="flex items-center gap-4 px-5 py-4 border-b border-border hover:bg-white/[0.02] transition-colors">
                  <div className="flex items-center gap-2.5">
                    <span className="font-heading text-sm font-bold text-accent w-5">{m.rank}</span>
                    <span className="text-2xl">{m.flag}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-text-primary">{m.name}</p>
                    <p className="text-xs text-text-muted truncate">{m.sub}</p>
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
                        <p className="text-xs text-text-muted">{m.sub}</p>
                      </div>
                      <div className="text-right">
                        <div className="font-heading text-xl font-bold text-text-primary leading-none">
                          {m.pct}<span className="text-text-muted text-sm font-medium">%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Floating lock chip */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-accent"
                    style={{ background: 'rgba(10,10,15,0.8)', border: '1px solid rgba(0,212,200,0.25)', backdropFilter: 'blur(8px)' }}>
                    <Lock className="w-3 h-3" /> +22 more locked
                  </div>
                </div>

                {/* Fade bottom */}
                <div className="absolute left-0 right-0 bottom-0 h-32 pointer-events-none"
                  style={{ background: 'linear-gradient(180deg, transparent 0%, rgba(17,17,24,0.75) 70%, rgba(17,17,24,0.95) 100%)' }} />
              </div>

              {/* CTA foot */}
              <div className="px-5 py-5 border-t border-border" style={{ background: 'rgba(26,26,36,0.6)' }}>
                <button onClick={handleUpgrade} disabled={loading}
                  className="cta-button w-full py-3 rounded-xl text-sm flex items-center justify-center gap-2 disabled:opacity-50">
                  <Lock className="w-4 h-4" />
                  {loading ? 'Redirecting…' : 'Unlock all 25 — €5'}
                </button>
                <p className="mt-3 text-xs text-text-muted text-center">One-time payment · Never charged again</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" className="relative py-20">
        <div className="max-w-5xl mx-auto px-6">

          <div className="text-center mb-14">
            <p className="text-xs font-bold text-text-muted uppercase tracking-widest mb-3">Pricing</p>
            <h2 className="font-heading text-4xl sm:text-5xl font-extrabold tracking-tight text-text-primary">
              One price. <span className="gradient-text">Forever.</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-5 max-w-4xl mx-auto">

            {/* Free */}
            <div className="glass-panel rounded-2xl p-8 border border-border flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-bg-elevated border border-border flex items-center justify-center">
                    <Globe2 className="w-4 h-4 text-text-muted" />
                  </div>
                  <span className="font-heading font-bold text-lg text-text-primary">Free</span>
                </div>
                <span className="text-xs font-semibold text-text-muted bg-bg-elevated border border-border px-2 py-1 rounded-full uppercase tracking-wider">Current</span>
              </div>

              <p className="text-sm text-text-muted mb-6">Start exploring — no account needed.</p>

              <div className="mb-8">
                <span className="font-heading text-5xl font-extrabold text-text-primary tracking-tight">€0</span>
                <span className="text-sm text-text-muted ml-2">forever</span>
              </div>

              <div className="h-px bg-border mb-6" />

              <ul className="space-y-3 mb-8 flex-1">
                {FREE_FEATURES.map(f => (
                  <li key={f} className="flex items-start gap-3 text-sm text-text-muted">
                    <Check className="w-4 h-4 text-text-muted flex-shrink-0 mt-0.5" /> {f}
                  </li>
                ))}
              </ul>

              <div className="w-full py-3 rounded-xl border border-border text-sm text-text-muted text-center font-medium">
                Current plan
              </div>
            </div>

            {/* Pro */}
            <div className="relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20">
                <span className="px-3 py-1.5 rounded-full bg-accent text-bg-primary text-xs font-extrabold uppercase tracking-widest"
                  style={{ boxShadow: '0 8px 30px rgba(0,212,200,0.45)' }}>
                  ★ Best Value
                </span>
              </div>

              {/* Ambient glow */}
              <div className="absolute -inset-px rounded-[24px] pointer-events-none"
                style={{ background: 'radial-gradient(60% 80% at 50% 0%, rgba(0,212,200,0.35), transparent 70%)', filter: 'blur(20px)', opacity: 0.6 }} />

              <div className="relative glass-panel rounded-2xl p-8 overflow-hidden"
                style={{ border: '1px solid rgba(0,212,200,0.3)', borderTop: '2px solid #00d4c8' }}>

                {/* Subtle grid */}
                <div className="absolute top-0 left-0 right-0 h-40 pointer-events-none opacity-[0.04]"
                  style={{ backgroundImage: 'linear-gradient(rgba(0,212,200,1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,200,1) 1px, transparent 1px)', backgroundSize: '20px 20px' }} />

                <div className="relative flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-accent/10 border border-accent/30 flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-accent" />
                    </div>
                    <span className="font-heading font-bold text-lg text-text-primary">Pro</span>
                  </div>
                  <span className="text-xs font-semibold text-accent bg-accent/10 border border-accent/25 px-2 py-1 rounded-full uppercase tracking-wider">One-time</span>
                </div>

                <p className="text-sm text-text-muted mb-6">Everything you need to plan your move.</p>

                <div className="mb-8">
                  <span className="font-heading text-5xl font-extrabold text-text-primary tracking-tight">€5</span>
                  <span className="text-sm text-text-muted ml-2">· no subscription</span>
                  <p className="text-xs text-accent/80 mt-1">Paid once. Access forever.</p>
                </div>

                <div className="h-px mb-6"
                  style={{ background: 'linear-gradient(to right, transparent, rgba(0,212,200,0.3), transparent)' }} />

                <ul className="space-y-3 mb-8">
                  {PRO_FEATURES.map(f => (
                    <li key={f.text} className="flex items-start gap-3 text-sm text-text-primary">
                      <div className="w-4 h-4 rounded-full bg-accent/15 border border-accent/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check className="w-2.5 h-2.5 text-accent" />
                      </div>
                      {f.bold
                        ? <span><span className="font-semibold">{f.bold}</span>{f.text.replace(f.bold, '')}</span>
                        : f.text}
                    </li>
                  ))}
                </ul>

                {error && <p className="text-xs text-rose-400 mb-3">{error}</p>}

                <button onClick={handleUpgrade} disabled={loading}
                  className="cta-button w-full py-3.5 rounded-xl text-sm flex items-center justify-center gap-2 disabled:opacity-50">
                  <Zap className="w-4 h-4" />
                  {loading ? 'Redirecting…' : 'Upgrade to Pro — €5'}
                </button>
                <p className="text-xs text-text-muted text-center mt-3 flex items-center justify-center gap-1.5">
                  <Shield className="w-3 h-3" /> Secure payment via Stripe
                </p>
              </div>
            </div>
          </div>

          {/* Social proof */}
          <div className="mt-14 flex flex-wrap items-center justify-center gap-x-10 gap-y-4 text-sm text-text-muted">
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {['from-teal-400 to-teal-600', 'from-purple-400 to-purple-600', 'from-amber-400 to-amber-600'].map((g, i) => (
                  <div key={i} className={`w-7 h-7 rounded-full bg-gradient-to-br ${g} border-2 border-bg-primary`} />
                ))}
                <div className="w-7 h-7 rounded-full bg-bg-elevated border-2 border-bg-primary flex items-center justify-center text-xs font-bold text-text-muted">+</div>
              </div>
              <span className="text-sm"><span className="text-text-primary font-semibold">1,000+</span> people found their country</span>
            </div>
            <span className="h-4 w-px bg-border" />
            <div className="flex items-center gap-1.5 text-sm">
              <Sparkles className="w-4 h-4 text-accent" />
              <span className="text-text-primary font-semibold">4.9/5</span>
              <span>from Pro users</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="relative py-20">
        <div className="max-w-2xl mx-auto px-6">

          <div className="text-center mb-10">
            <p className="text-xs font-bold text-text-muted uppercase tracking-widest mb-3">FAQ</p>
            <h2 className="font-heading text-4xl font-extrabold tracking-tight text-text-primary">Common questions</h2>
          </div>

          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <div key={i} className="glass-panel rounded-xl border border-border overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between gap-4 p-5 text-left">
                  <span className="text-sm font-semibold text-text-primary">{faq.q}</span>
                  <Plus className={`w-4 h-4 text-text-muted flex-shrink-0 transition-transform duration-200 ${openFaq === i ? 'rotate-45 text-accent' : ''}`} />
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-5 text-sm text-text-muted leading-relaxed">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Final CTA */}
          <div className="mt-14 text-center">
            <p className="text-sm text-text-muted mb-4">Still deciding?</p>
            <button onClick={handleUpgrade} disabled={loading}
              className="cta-button px-8 py-3.5 rounded-xl text-sm inline-flex items-center gap-2 disabled:opacity-50">
              <Zap className="w-4 h-4" />
              {loading ? 'Redirecting…' : 'Unlock all 25 — €5'}
            </button>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-border mt-10">
        <div className="max-w-7xl mx-auto px-6 py-10 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Globe2 className="w-5 h-5 text-accent" />
            <span className="font-heading font-bold text-text-primary">Origio</span>
            <span className="text-text-muted text-xs ml-2">© 2026</span>
          </div>
          <div className="flex items-center gap-6 text-xs text-text-muted">
            <a href="/faq" className="hover:text-text-primary transition-colors">FAQ</a>
            <a href="/about" className="hover:text-text-primary transition-colors">About</a>
          </div>
        </div>
      </footer>
    </div>
  )
}