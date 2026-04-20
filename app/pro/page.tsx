'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check, Zap, ArrowRight, ChevronDown, ChevronUp, Lock, Sparkles, Globe2, FileText, ArrowRightLeft, Bookmark } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/useAuth'
import Link from 'next/link'

const FREE_FEATURES = [
  'Top 3 personalised country matches',
  'Salary insights by role & country',
  'Basic cost of living & visa overview',
  'Unlimited relocation quiz runs',
]

const PRO_FEATURES_LIST = [
  { icon: Sparkles, title: 'Full top-25 ranked country results', desc: 'Run the quiz as many times as you want. Tweak your answers, explore different roles, compare scenarios.' },
  { icon: FileText, title: 'Complete country deep-dives (salary, visa, lifestyle, healthcare)', desc: 'Unlock the complete country report all salary roles, full cost breakdown, visa details, and quality of life data.' },
  { icon: ArrowRightLeft, title: 'Side-by-side country comparison', desc: 'Pick any two countries and compare them across every metric on one screen.' },
  { icon: Bookmark, title: 'Save & revisit your matches', desc: 'Bookmark countries you\'re interested in. Access your saved list from any device, any time.' },
  { icon: Globe2, title: 'Unlimited relocation quiz runs', desc: 'See all 25 countries ranked for you, not just the top 3.' },
]

const FAQS = [
  { q: 'Is this really a one-time payment?', a: 'Yes, €5 once, Pro forever. No subscription, no renewal, no surprise charges.' },
  { q: 'What payment methods are accepted?', a: 'All major credit and debit cards via Stripe. We never see your card details.' },
  { q: 'Can I get a refund?', a: 'If something isn\'t right, email us and we\'ll sort it out. We stand behind the product.' },
  { q: 'Do I need an account?', a: 'Yes, Pro features are tied to your account so they work across devices and stay active forever.' },
  { q: 'What if I already ran Find My Country as a free user?', a: 'Just run it again after upgrading. Your answers are saved the next run will instantly show all 25 countries.' },
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
      if (data.url) window.location.href = data.url
      else { setError('Something went wrong. Please try again.'); setLoading(false) }
    } catch {
      setError('Network error. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-text-primary">

      {/* Nav */}
      <div className="flex items-center justify-between px-6 py-4 border-b-2 border-[#2a2a2a]">
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <div className="w-3 h-3 bg-accent border-2 border-text-primary" />
          <span className="font-heading font-extrabold uppercase tracking-tight">Origio</span>
        </Link>
        <Link href="/" className="text-sm font-bold text-text-muted hover:text-text-primary transition-colors uppercase tracking-wide">
          ← Back
        </Link>
      </div>

      {/* Hero */}
      <section className="border-b-2 border-[#2a2a2a] py-16 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 border-2 border-accent text-accent text-xs font-bold px-3 py-1.5 uppercase tracking-widest mb-6">
            <Sparkles className="w-3 h-3" /> One-time · No subscription
          </div>
          <h1 className="font-heading text-5xl sm:text-6xl font-extrabold uppercase tracking-tight leading-[0.95] mb-4">
            Origio Pro
          </h1>
          <p className="text-text-muted text-base max-w-md mx-auto leading-relaxed mb-8">
            Free shows you the top 3. Pro ranks all 25 — with deep-dives, visa routes, and side-by-side comparison.{' '}
            <span className="text-text-primary font-bold">Pay once. Yours forever.</span>
          </p>

          <div className="flex items-center justify-center gap-3 mb-6 flex-wrap">
            <button onClick={handleUpgrade} disabled={loading}
              className="cta-button px-8 py-4 text-base font-bold uppercase tracking-wide disabled:opacity-50 disabled:transform-none disabled:shadow-none">
              <Zap className="w-4 h-4 mr-2" />
              {loading ? 'Redirecting…' : 'Upgrade to Pro ~ €5'}
            </button>
            <a href="#pricing"
              className="ghost-button px-6 py-4 text-sm font-bold uppercase tracking-wide inline-flex items-center gap-2">
              Compare plans <ArrowRight className="w-4 h-4" />
            </a>
          </div>

          <div className="flex items-center justify-center gap-6 text-xs font-bold text-text-muted flex-wrap uppercase tracking-wide">
            {['No subscription', 'Secure via Stripe', 'Cancel-free forever'].map(t => (
              <span key={t} className="flex items-center gap-1.5">
                <Check className="w-3 h-3 text-accent" /> {t}
              </span>
            ))}
          </div>

          {error && <p className="mt-4 text-sm text-red-400 font-bold">{error}</p>}
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-6 border-b-2 border-[#2a2a2a]">
        <div className="max-w-2xl mx-auto">
          <p className="text-xs font-bold text-text-muted uppercase tracking-widest mb-8 text-center">What you unlock</p>
          <div className="space-y-0 border-2 border-[#2a2a2a]" style={{ boxShadow: "6px 6px 0 #00ffd5" }}>
            {PRO_FEATURES_LIST.map((f, i) => {
              const Icon = f.icon
              return (
                <div key={f.title} className={`flex items-start gap-4 p-5 ${i < PRO_FEATURES_LIST.length - 1 ? "border-b-2 border-[#2a2a2a]" : ""}`}>
                  <div className="w-9 h-9 border-2 border-accent flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4 text-accent" />
                  </div>
                  <div>
                    <p className="font-heading font-bold text-text-primary text-sm uppercase tracking-tight mb-1">{f.title}</p>
                    <p className="text-xs text-text-muted leading-relaxed">{f.desc}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Pricing table */}
      <section id="pricing" className="py-16 px-6 border-b-2 border-[#2a2a2a]">
        <div className="max-w-2xl mx-auto">
          <p className="text-xs font-bold text-text-muted uppercase tracking-widest mb-8 text-center">Pricing</p>
          <div className="grid sm:grid-cols-2 gap-0 border-2 border-[#2a2a2a]">
            {/* Free */}
            <div className="p-6 border-b-2 sm:border-b-0 sm:border-r-2 border-[#2a2a2a]">
              <p className="font-heading text-xs font-bold text-text-muted uppercase tracking-widest mb-1">Free</p>
              <p className="font-heading text-4xl font-extrabold text-text-primary mb-6">€0</p>
              <div className="space-y-2">
                {FREE_FEATURES.map(f => (
                  <div key={f} className="flex items-center gap-2 text-sm text-text-muted">
                    <Check className="w-3.5 h-3.5 text-text-muted flex-shrink-0" />
                    {f}
                  </div>
                ))}
              </div>
            </div>
            {/* Pro */}
            <div className="p-6 bg-accent/5 relative" style={{ boxShadow: "inset 0 0 0 2px #00ffd5" }}>
              <div className="absolute top-3 right-3 border-2 border-accent text-accent text-[10px] font-bold px-2 py-0.5 uppercase tracking-widest">Best value</div>
              <p className="font-heading text-xs font-bold text-accent uppercase tracking-widest mb-1">Pro</p>
              <p className="font-heading text-4xl font-extrabold text-text-primary mb-1">€5</p>
              <p className="text-xs text-text-muted mb-6 font-bold uppercase tracking-wide">One-time · Forever</p>
              <div className="space-y-2">
                {[...FREE_FEATURES, ...PRO_FEATURES_LIST.map(f => f.title)].map(f => (
                  <div key={f} className="flex items-center gap-2 text-sm text-text-primary">
                    <Check className="w-3.5 h-3.5 text-accent flex-shrink-0" />
                    {f}
                  </div>
                ))}
              </div>
              <button onClick={handleUpgrade} disabled={loading}
                className="cta-button w-full py-3 mt-6 text-sm font-bold uppercase tracking-wide disabled:opacity-50 disabled:transform-none disabled:shadow-none">
                {loading ? 'Redirecting…' : 'Get Pro — €5'}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 px-6 border-b-2 border-[#2a2a2a]">
        <div className="max-w-2xl mx-auto">
          <p className="text-xs font-bold text-text-muted uppercase tracking-widest mb-8 text-center">Questions</p>
          <div className="border-2 border-[#2a2a2a]">
            {FAQS.map((faq, i) => (
              <div key={i} className={i < FAQS.length - 1 ? "border-b-2 border-[#2a2a2a]" : ""}>
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left text-sm font-bold hover:bg-[#1a1a1a] transition-colors uppercase tracking-wide">
                  <span>{faq.q}</span>
                  {openFaq === i
                    ? <ChevronUp className="w-4 h-4 text-accent flex-shrink-0 ml-4" />
                    : <ChevronDown className="w-4 h-4 text-text-muted flex-shrink-0 ml-4" />}
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-5 text-sm text-text-muted leading-relaxed border-t border-[#1a1a1a] pt-3">{faq.a}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 px-6">
        <div className="max-w-sm mx-auto text-center space-y-6">
          <h2 className="font-heading text-3xl font-extrabold uppercase tracking-tight">Ready to move?</h2>
          <p className="text-text-muted text-sm">One payment. Full access. Forever.</p>
          <button onClick={handleUpgrade} disabled={loading}
            className="cta-button w-full py-4 text-sm font-bold uppercase tracking-wide disabled:opacity-50 disabled:transform-none disabled:shadow-none">
            <Zap className="w-4 h-4 mr-2" />
            {loading ? 'Redirecting…' : 'Upgrade to Pro ~ €5'}
          </button>
          <p className="text-xs font-bold text-text-muted uppercase tracking-wide">Secure · One-time · Stripe</p>
        </div>
      </section>

    </div>
  )
}