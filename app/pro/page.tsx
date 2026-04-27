'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check, Zap, ChevronDown, ChevronUp, X } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/useAuth'
import Link from 'next/link'

const FREE_FEATURES = [
  { text: 'Top 3 country matches', included: true },
  { text: 'Salary overview by role', included: true },
  { text: 'Basic visa & cost summary', included: true },
  { text: '3 quiz runs total', included: true },
  { text: 'All 25 countries ranked', included: false },
  { text: 'Full personalised report', included: false },
  { text: 'Take-home calculator', included: false },
  { text: '3-country comparison', included: false },
]

const PRO_FEATURES = [
  {
    title: 'All 25 countries ranked',
    desc: 'See your complete personalised ranking, not just the top 3. Every country scored against your priorities.',
  },
  {
    title: 'Full personalised report',
    desc: 'Salary, take-home after tax, cost breakdown, visa path, and priority scores — specific to your role and passport.',
  },
  {
    title: 'Take-home salary calculator',
    desc: 'Input your actual salary and see exactly what you keep after tax and social security in any country.',
  },
  {
    title: 'Visa checklist',
    desc: 'Every document you need, in order, with official links. Country-specific.',
  },
  {
    title: '3-country comparison',
    desc: 'Compare your top 3 matches side by side across every metric. Pre-filled from your wizard results.',
  },
  
]

const FAQS = [
  {
    q: 'Is this really a one-time payment?',
    a: '€19.99 once. Pro forever. No subscription, no renewal, no surprise charges. Pay once and every feature is yours permanently.',
  },
  {
    q: 'Why €19.99 and not less?',
    a: 'A single immigration lawyer consultation costs €200–500. Origio gives you the data to make that decision yourself. €19.99 is fair for what it does.',
  },
  {
    q: 'What payment methods are accepted?',
    a: 'All major credit and debit cards via Stripe. We never see your card details.',
  },
  {
    q: 'Can I get a refund?',
    a: "If something isn't right, email us and we'll sort it out. We stand behind the product.",
  },
  {
    q: 'Do I need an account?',
    a: 'Yes — Pro features are tied to your account so they work across devices and stay active permanently.',
  },
  {
    q: 'I already ran the quiz as a free user. Do I lose my results?',
    a: "No. Your answers are saved. Run the quiz again after upgrading and you'll instantly see all 25 countries ranked.",
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
      if (data.url) window.location.href = data.url
      else { setError('Something went wrong. Please try again.'); setLoading(false) }
    } catch {
      setError('Network error. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#f0f0e8]">

      {/* Nav */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[#1a1a1a]">
        <Link href="/" className="flex items-center gap-2 hover:opacity-70 transition-opacity">
          <div className="w-3 h-3 bg-accent border-2 border-[#f0f0e8]" />
          <span className="font-heading font-extrabold uppercase tracking-tight text-sm">Origio</span>
        </Link>
        <Link href="/" className="text-[11px] font-bold text-[#888880] hover:text-[#f0f0e8] transition-colors uppercase tracking-widest">
          ← Back
        </Link>
      </div>

      {/* Hero */}
      <section className="py-20 px-6 border-b border-[#1a1a1a]">
        <div className="max-w-2xl mx-auto">
          <p className="text-[10px] font-bold text-[#888880] uppercase tracking-[0.2em] mb-6">
            One-time · No subscription
          </p>
          <h1 className="font-heading text-[64px] sm:text-[80px] leading-[0.88] font-extrabold uppercase tracking-[-0.02em] mb-6">
            Origio Pro
          </h1>
          <p className="text-[15px] text-[#888880] max-w-md leading-relaxed mb-10">
            Free shows you the top 3. Pro ranks all 25 — with full personalised reports, take-home calculations, and 3-country comparison.{' '}
            <span className="text-[#f0f0e8] font-bold">Pay once. Yours forever.</span>
          </p>

          <div className="flex flex-wrap items-center gap-4 mb-6">
            <button
              onClick={handleUpgrade}
              disabled={loading}
              className="px-8 py-3.5 text-[11px] font-extrabold uppercase tracking-[0.15em] bg-accent text-[#0a0a0a] disabled:opacity-50"
              style={{ boxShadow: loading ? 'none' : '3px 3px 0 #00aa90' }}
            >
              <Zap className="w-3.5 h-3.5 inline mr-2" />
              {loading ? 'Redirecting…' : 'Get Pro — €19.99'}
            </button>
            <a href="#pricing"
              className="px-8 py-3.5 text-[11px] font-extrabold uppercase tracking-[0.15em] border border-[#2a2a2a] text-[#888880] hover:text-[#f0f0e8] hover:border-[#444] transition-colors">
              Compare plans
            </a>
          </div>

          <div className="flex flex-wrap gap-5 text-[10px] font-bold text-[#888880] uppercase tracking-widest">
            {['No subscription', 'Secure via Stripe', 'One-time payment'].map(t => (
              <span key={t} className="flex items-center gap-1.5">
                <Check className="w-3 h-3 text-accent" /> {t}
              </span>
            ))}
          </div>

          {error && <p className="mt-4 text-sm text-red-400 font-bold">{error}</p>}
        </div>
      </section>

      {/* What you unlock */}
      <section className="py-16 px-6 border-b border-[#1a1a1a]">
        <div className="max-w-2xl mx-auto">
          <p className="text-[10px] font-bold text-[#888880] uppercase tracking-[0.2em] mb-10">What you unlock</p>

          <div>
            {PRO_FEATURES.map((f, i) => (
              <div
                key={f.title}
                className={`flex items-start gap-5 py-5 ${i < PRO_FEATURES.length - 1 ? 'border-b border-[#111]' : ''}`}
              >
                <Check className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-heading text-[13px] font-extrabold uppercase tracking-tight text-[#f0f0e8] mb-1">{f.title}</p>
                  <p className="text-[11px] text-[#888880] leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing table */}
      <section id="pricing" className="py-16 px-6 border-b border-[#1a1a1a]">
        <div className="max-w-2xl mx-auto">
          <p className="text-[10px] font-bold text-[#888880] uppercase tracking-[0.2em] mb-10">Pricing</p>

          <div className="grid sm:grid-cols-2 border border-[#1a1a1a]">

            {/* Free */}
            <div className="p-7 border-b sm:border-b-0 sm:border-r border-[#1a1a1a]">
              <p className="text-[10px] font-bold text-[#888880] uppercase tracking-[0.2em] mb-4">Free</p>
              <p className="font-heading text-5xl font-extrabold mb-8">€0</p>
              <div className="space-y-3">
                {FREE_FEATURES.map(f => (
                  <div key={f.text} className="flex items-center gap-3">
                    {f.included
                      ? <Check className="w-3.5 h-3.5 text-[#888880] flex-shrink-0" />
                      : <X className="w-3.5 h-3.5 text-[#2a2a2a] flex-shrink-0" />
                    }
                    <span className={`text-[12px] font-medium ${f.included ? 'text-[#888880]' : 'text-[#333]'}`}>
                      {f.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Pro */}
            <div className="p-7 relative border border-accent" style={{ boxShadow: '4px 4px 0 #00ffd5' }}>
              <div className="absolute -top-px -right-px border border-accent bg-accent text-[#0a0a0a] text-[9px] font-extrabold px-2 py-0.5 uppercase tracking-widest">
                Best value
              </div>
              <p className="text-[10px] font-bold text-accent uppercase tracking-[0.2em] mb-4">Pro</p>
              <div className="flex items-baseline gap-2 mb-1">
                <p className="font-heading text-5xl font-extrabold">€19.99</p>
              </div>
              <p className="text-[10px] font-bold text-[#888880] uppercase tracking-widest mb-8">One-time · Forever</p>
              <div className="space-y-3 mb-8">
                {FREE_FEATURES.map(f => (
                  <div key={f.text} className="flex items-center gap-3">
                    <Check className="w-3.5 h-3.5 text-accent flex-shrink-0" />
                    <span className={`text-[12px] font-medium ${f.included ? 'text-[#888880]' : 'text-[#f0f0e8]'}`}>
                      {f.text}
                    </span>
                  </div>
                ))}
              </div>
              <button
                onClick={handleUpgrade}
                disabled={loading}
                className="w-full py-3 text-[11px] font-extrabold uppercase tracking-[0.15em] bg-accent text-[#0a0a0a] disabled:opacity-50"
                style={{ boxShadow: loading ? 'none' : '2px 2px 0 #00aa90' }}
              >
                {loading ? 'Redirecting…' : 'Get Pro — €19.99'}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 px-6 border-b border-[#1a1a1a]">
        <div className="max-w-2xl mx-auto">
          <p className="text-[10px] font-bold text-[#888880] uppercase tracking-[0.2em] mb-10">Questions</p>
          <div className="border border-[#1a1a1a]">
            {FAQS.map((faq, i) => (
              <div key={i} className={i < FAQS.length - 1 ? 'border-b border-[#111]' : ''}>
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-[#0d0d0d] transition-colors"
                >
                  <span className="text-[12px] font-bold text-[#f0f0e8] uppercase tracking-wide pr-4">{faq.q}</span>
                  {openFaq === i
                    ? <ChevronUp className="w-4 h-4 text-accent flex-shrink-0" />
                    : <ChevronDown className="w-4 h-4 text-[#888880] flex-shrink-0" />}
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-5 text-[12px] text-[#888880] leading-relaxed border-t border-[#111] pt-4">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-6">
        <div className="max-w-2xl mx-auto flex flex-wrap items-center justify-between gap-6">
          <div>
            <h2 className="font-heading text-3xl font-extrabold uppercase tracking-tight mb-2">Ready to move?</h2>
            <p className="text-[12px] text-[#888880]">One payment. Full access. Forever.</p>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <button
              onClick={handleUpgrade}
              disabled={loading}
              className="px-8 py-3.5 text-[11px] font-extrabold uppercase tracking-[0.15em] bg-accent text-[#0a0a0a] disabled:opacity-50"
              style={{ boxShadow: loading ? 'none' : '3px 3px 0 #00aa90' }}
            >
              <Zap className="w-3.5 h-3.5 inline mr-2" />
              {loading ? 'Redirecting…' : 'Get Pro — €19.99'}
            </button>
            <Link href="/wizard"
              className="text-[11px] font-bold text-[#888880] hover:text-[#f0f0e8] transition-colors uppercase tracking-widest">
              Try free first →
            </Link>
          </div>
        </div>
      </section>

    </div>
  )
}