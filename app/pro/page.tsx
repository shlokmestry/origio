'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/useAuth'
import { supabase } from '@/lib/supabase'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import ComicButton from '@/components/ComicButton'

const FEATURES = [
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
    ),
    title: 'Lifetime access',
    desc: 'Pay once, use forever. No monthly subscription, no renewal, no surprise charges.',
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/>
      </svg>
    ),
    title: 'All 37 countries unlocked',
    desc: 'Free users see 3 results. Pro unlocks every country scored against your profile.',
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
      </svg>
    ),
    title: 'Full personalised report',
    desc: 'Salary breakdown, take-home pay, cost of living, visa checklist — tailored to you.',
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
      </svg>
    ),
    title: 'Real salary data',
    desc: 'Gross and net salaries for 30+ job roles across all countries. No guesswork.',
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/>
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
      </svg>
    ),
    title: 'Visa & tax intelligence',
    desc: 'Nomad visas, income tax rates, territorial tax countries — all scored for your situation.',
  },
]

const FAQS = [
  {
    q: 'Is this really a one-time payment?',
    a: '€4.99 once. Pro forever. No subscription, no renewal, no surprise charges. Pay once and every feature is yours permanently.',
  },
  {
    q: 'Why €4.99 and not free?',
    a: 'Keeping the data fresh, the scoring accurate, and the servers running costs money. €4.99 is the lowest we can go and still build something worth using.',
  },
  {
    q: 'What countries are included?',
    a: 'All 37 countries in the Origio database — Europe, Southeast Asia, Middle East, North America, and Oceania.',
  },
  {
    q: 'Can I get a refund?',
    a: 'If you complete your wizard and the results are genuinely useless for your situation, email us within 7 days. We\'ll sort it.',
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
    setLoading(true); setError('')
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { setLoading(false); router.push('/signin?next=/pro'); return }
    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 10000)
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: session.user.id }),
        signal: controller.signal,
      })
      clearTimeout(timeout)
      const data = await res.json().catch(() => ({}))
      if (data.url) { window.location.href = data.url; return }
      setError(data.error ?? `Checkout failed (${res.status}). Please try again.`)
      setLoading(false)
    } catch {
      setError('Network error. Please try again.')
      setLoading(false)
    }
  }

  return (
    <>
      <Nav />
      <div style={{ minHeight: '100vh', background: '#0a0a0a', paddingTop: 100, paddingBottom: 80, fontFamily: "'Satoshi', sans-serif" }}>
        <style>{`
          @keyframes cardPushUp {
            0%   { transform: translateY(60px); opacity: 0; }
            60%  { transform: translateY(-8px);  opacity: 1; }
            80%  { transform: translateY(4px);   opacity: 1; }
            100% { transform: translateY(0px);   opacity: 1; }
          }
          .pro-card {
            background: #fff;
            border-radius: 4px;
            border: 1px solid #e2e2dc;
            box-shadow: 6px 6px 0 #4de6cc;
            width: 100%;
            max-width: 480px;
            margin: 0 auto;
            overflow: hidden;
            position: relative;
            animation: cardPushUp 0.65s cubic-bezier(0.22, 1, 0.36, 1) both;
          }
          .pro-cta-btn {
            width: 100%;
            padding: 16px;
            background: #111;
            color: #fff;
            border: none;
            border-radius: 4px;
            font-size: 15px;
            font-weight: 700;
            font-family: 'Satoshi', sans-serif;
            cursor: pointer;
            transition: background 0.15s ease, transform 0.1s ease;
            letter-spacing: -0.01em;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
          }
          .pro-cta-btn:hover:not(:disabled) { background: #222; }
          .pro-cta-btn:active:not(:disabled) { transform: scale(0.99); }
          .pro-cta-btn:disabled { background: #ccc; cursor: not-allowed; }
          .faq-item { border-bottom: 1px solid #f0f0ec; }
          .faq-item:last-child { border-bottom: none; }
          .faq-q {
            width: 100%;
            background: none;
            border: none;
            padding: 18px 0;
            text-align: left;
            font-family: 'Cabinet Grotesk', sans-serif;
            font-size: 15px;
            font-weight: 700;
            color: #111;
            cursor: pointer;
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 12px;
            letter-spacing: -0.01em;
          }
          .faq-q:hover { color: #333; }
          .pro-banner {
            animation: cardPushUp 0.5s cubic-bezier(0.22, 1, 0.36, 1) both;
          }
          .pro-faq {
            animation: cardPushUp 0.75s cubic-bezier(0.22, 1, 0.36, 1) 0.1s both;
          }
          @media (max-width: 600px) {
            .pro-card { max-width: 100%; border-radius: 0; box-shadow: none; }
          }
        `}</style>

        {/* Free callout banner */}
        <div className="pro-banner" style={{ textAlign: 'center', marginBottom: 24 }}>
          <span style={{
            display: 'inline-block',
            border: '1.5px solid rgba(255,255,255,0.12)',
            background: 'rgba(255,255,255,0.06)',
            borderRadius: 4,
            padding: '6px 16px',
            fontSize: 13,
            fontFamily: "'Satoshi', sans-serif",
            color: 'rgba(255,255,255,0.55)',
          }}>
            <span style={{ color: '#4de6cc', fontWeight: 800 }}>FREE</span> for basic results, or…
          </span>
        </div>

        {/* Main card */}
        <div className="pro-card">

          {/* Header */}
          <div style={{ padding: '32px 36px 28px', borderBottom: '1px solid #f0f0ec', textAlign: 'center' }}>
            <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#aaa', marginBottom: 10, fontFamily: "'Satoshi', sans-serif" }}>
              Origio Pro
            </p>

            {/* Price */}
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 6, marginBottom: 4 }}>
              <span style={{
                fontSize: 18,
                color: '#bbb',
                textDecoration: 'line-through',
                fontFamily: "'Cabinet Grotesk', sans-serif",
                fontWeight: 700,
              }}>€14.99</span>
              <span style={{
                fontSize: 64,
                fontWeight: 800,
                fontFamily: "'Cabinet Grotesk', sans-serif",
                color: '#111',
                letterSpacing: '-0.04em',
                lineHeight: 1,
              }}>€4.99</span>
              <span style={{
                fontSize: 18,
                color: '#888',
                fontFamily: "'Satoshi', sans-serif",
                fontWeight: 500,
                alignSelf: 'flex-end',
                paddingBottom: 6,
              }}>/forever</span>
            </div>
            <p style={{ fontSize: 12, color: '#bbb', fontFamily: "'Satoshi', sans-serif" }}>+ local taxes · one-time payment</p>
          </div>

          {/* CTA */}
          <div style={{ padding: '24px 36px' }}>
            <ComicButton
              variant="accent"
              onClick={handleUpgrade}
              disabled={loading}
              style={{ width: '100%', opacity: loading ? 0.6 : 1, pointerEvents: loading ? 'none' : 'auto' }}
            >
              {loading ? 'Redirecting…' : 'Get Origio Pro'}
            </ComicButton>
            {error && <p style={{ fontSize: 12, color: '#ef4444', marginTop: 10, textAlign: 'center' }}>{error}</p>}
          </div>

          {/* Feature list */}
          <div style={{ padding: '0 36px 32px', display: 'flex', flexDirection: 'column', gap: 20 }}>
            {FEATURES.map((f) => (
              <div key={f.title} style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                <span style={{
                  flexShrink: 0,
                  width: 36,
                  height: 36,
                  background: 'rgba(77,230,204,0.1)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#4de6cc',
                }}>
                  {f.icon}
                </span>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 700, color: '#111', marginBottom: 3, fontFamily: "'Cabinet Grotesk', sans-serif", letterSpacing: '-0.01em' }}>
                    {f.title}{' '}
                    <span style={{ fontWeight: 500, color: '#666', fontFamily: "'Satoshi', sans-serif" }}>— {f.desc}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className="pro-faq" style={{ maxWidth: 480, margin: '48px auto 0', padding: '0 16px' }}>
          <p style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontWeight: 800, fontSize: 18, color: '#fff', marginBottom: 4, letterSpacing: '-0.02em' }}>
            Questions
          </p>
          <div style={{ background: '#fff', border: '1px solid #e2e2dc', borderRadius: 4, padding: '0 24px' }}>
            {FAQS.map((faq, i) => (
              <div key={i} className="faq-item">
                <button className="faq-q" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                  <span>{faq.q}</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                    style={{ flexShrink: 0, transform: openFaq === i ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s ease', color: '#aaa' }}>
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                </button>
                {openFaq === i && (
                  <p style={{ fontSize: 14, color: '#666', lineHeight: 1.65, paddingBottom: 18, margin: 0, fontFamily: "'Satoshi', sans-serif" }}>
                    {faq.a}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom note */}
        <p style={{ textAlign: 'center', marginTop: 32, fontSize: 12, color: 'rgba(255,255,255,0.3)', fontFamily: "'Satoshi', sans-serif" }}>
          Questions? <a href="/contact" style={{ color: 'rgba(255,255,255,0.45)', textDecoration: 'underline', textUnderlineOffset: 2 }}>Get in touch</a>
        </p>
      </div>
      <Footer />
    </>
  )
}
