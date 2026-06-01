'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/lib/useAuth'
import { supabase } from '@/lib/supabase'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'

const FEATURES = [
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
    ),
    title: 'Lifetime access',
    desc: 'Pay once, use forever. No subscription, no renewal.',
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
      </svg>
    ),
    title: 'Take-home pay calculator',
    desc: 'Enter your salary, see exact net monthly income and disposable pay after rent and food — for every country.',
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
      </svg>
    ),
    title: '3-country comparison',
    desc: 'Side-by-side: salaries, costs, taxes, visa difficulty — pick any 3 countries from your ranked list.',
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/>
      </svg>
    ),
    title: 'Custom ranking weights',
    desc: 'Re-rank all 37 countries by your own formula. Salary 50%, rent 30%, visa 20% — your call.',
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/>
      </svg>
    ),
    title: 'Budget reality check',
    desc: 'Enter your monthly budget — see which countries you can afford and how much margin you have left.',
  },
]

const FAQS = [
  {
    q: 'Is this really a one-time payment?',
    a: '€4.99 once. Pro forever. No subscription, no renewal, no surprise charges.',
  },
  {
    q: 'What does Pro actually give me?',
    a: 'The tools you need to make a real decision: take-home pay after tax and rent, side-by-side country comparison, custom ranking weights, and a budget reality check. The free tier already shows you all 37 ranked countries — Pro helps you act on that information.',
  },
  {
    q: 'What countries are included?',
    a: 'All 37 countries in the Origio database — Europe, Southeast Asia, Middle East, North America, and Oceania.',
  },
  {
    q: 'Can I get a refund?',
    a: 'If you pay and the tools are genuinely useless for your situation, email us within 7 days. We\'ll sort it.',
  },
]

function ProPageInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, loading: authLoading } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(searchParams.get('cancelled') ? 'Payment cancelled — no charge was made. Try again when ready.' : '')
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
    try {
      const sessionResult = await Promise.race([
        supabase.auth.getSession(),
        new Promise<never>((_, reject) => setTimeout(() => reject(new Error('timeout')), 5000)),
      ])
      const session = sessionResult.data.session
      if (!session) { setLoading(false); router.push('/signin?next=/pro'); return }

      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 15000)
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({}),
        signal: controller.signal,
      })
      clearTimeout(timeout)
      const data = await res.json().catch(() => ({}))
      if (data.url) { window.location.href = data.url; return }
      setError(data.error ?? `Checkout failed (${res.status}). Please try again.`)
      setLoading(false)
    } catch {
      setError('Could not start checkout. Please refresh and try again.')
      setLoading(false)
    }
  }

  return (
    <>
      <Nav />
      <div style={{ minHeight: '100vh', background: '#0a0a0a', fontFamily: "'Satoshi', sans-serif", padding: 'clamp(72px,10vh,100px) clamp(16px,4vw,24px) clamp(48px,8vh,80px)' }}>
        <style>{`
          @keyframes cardPushUp {
            0%   { transform: translateY(60px); opacity: 0; }
            60%  { transform: translateY(-8px);  opacity: 1; }
            80%  { transform: translateY(4px);   opacity: 1; }
            100% { transform: translateY(0px);   opacity: 1; }
          }
          .pro-card {
            background: #0f0f0f;
            border: 1px solid #2a2a2a;
            box-shadow: 6px 6px 0 #00ffd5;
            width: 100%;
            max-width: 480px;
            margin: 0 auto;
            overflow: hidden;
            position: relative;
            box-sizing: border-box;
            animation: cardPushUp 0.65s cubic-bezier(0.22, 1, 0.36, 1) both;
          }
          .pro-cta-btn {
            width: 100%;
            padding: 16px;
            background: #00ffd5;
            color: #0a0a0a;
            border: none;
            font-size: 14px;
            font-weight: 700;
            font-family: 'Satoshi', sans-serif;
            cursor: pointer;
            transition: background 0.15s ease, transform 0.1s ease;
            letter-spacing: 0.06em;
            text-transform: uppercase;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
          }
          .pro-cta-btn:hover:not(:disabled) { background: #00e6c0; }
          .pro-cta-btn:active:not(:disabled) { transform: scale(0.99); }
          .pro-cta-btn:disabled { background: #1a1a1a; color: #444; cursor: not-allowed; }
          .faq-item { border-bottom: 1px solid #1f1f1f; }
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
            color: #f0f0e8;
            cursor: pointer;
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 12px;
            letter-spacing: -0.01em;
          }
          .faq-q:hover { color: #00ffd5; }
          .pro-banner {
            animation: cardPushUp 0.5s cubic-bezier(0.22, 1, 0.36, 1) both;
          }
          .pro-faq {
            animation: cardPushUp 0.75s cubic-bezier(0.22, 1, 0.36, 1) 0.1s both;
          }
          @media (max-width: 600px) {
            .pro-card { max-width: 100%; box-shadow: none; }
          }
        `}</style>

        {/* Free callout banner */}
        <div className="pro-banner" style={{ textAlign: 'center', marginBottom: 24 }}>
          <span style={{
            display: 'inline-block',
            border: '1px solid rgba(0,255,213,0.2)',
            background: 'rgba(0,255,213,0.04)',
            padding: '6px 16px',
            fontSize: 13,
            fontFamily: "'Satoshi', sans-serif",
            color: 'rgba(240,240,232,0.55)',
          }}>
            <span style={{ color: '#00ffd5', fontWeight: 800 }}>FREE</span> — all 37 countries ranked. Pro unlocks the tools.
          </span>
        </div>

        {/* Main card */}
        <div className="pro-card">

          {/* Header */}
          <div style={{ padding: '32px 36px 28px', borderBottom: '1px solid #1f1f1f', textAlign: 'center' }}>
            <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#888880', marginBottom: 10, fontFamily: "'Satoshi', sans-serif" }}>
              Origio Pro
            </p>

            {/* Price */}
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 6, marginBottom: 4 }}>
              <span style={{
                fontSize: 64,
                fontWeight: 800,
                fontFamily: "'Cabinet Grotesk', sans-serif",
                color: '#f0f0e8',
                letterSpacing: '-0.04em',
                lineHeight: 1,
              }}>€4.99</span>
              <span style={{
                fontSize: 18,
                color: '#888880',
                fontFamily: "'Satoshi', sans-serif",
                fontWeight: 500,
                alignSelf: 'flex-end',
                paddingBottom: 6,
              }}>/forever</span>
            </div>
            <p style={{ fontSize: 12, color: '#555', fontFamily: "'Satoshi', sans-serif" }}>+ local taxes · one-time payment</p>
          </div>

          {/* CTA */}
          <div style={{ padding: '24px 36px' }}>
            <button className="pro-cta-btn" onClick={handleUpgrade} disabled={loading}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              {loading ? 'Redirecting…' : 'Get Origio Pro'}
            </button>
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
                  background: 'rgba(0,255,213,0.07)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#00ffd5',
                }}>
                  {f.icon}
                </span>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 700, color: '#f0f0e8', marginBottom: 3, fontFamily: "'Cabinet Grotesk', sans-serif", letterSpacing: '-0.01em' }}>
                    {f.title}{' '}
                    <span style={{ fontWeight: 500, color: '#888880', fontFamily: "'Satoshi', sans-serif" }}>— {f.desc}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className="pro-faq" style={{ maxWidth: 480, margin: '48px auto 0', padding: '0 16px' }}>
          <p style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontWeight: 800, fontSize: 18, color: '#f0f0e8', marginBottom: 4, letterSpacing: '-0.02em' }}>
            Questions
          </p>
          <div style={{ background: '#0f0f0f', border: '1px solid #1f1f1f', padding: '0 24px' }}>
            {FAQS.map((faq, i) => (
              <div key={i} className="faq-item">
                <button className="faq-q" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                  <span>{faq.q}</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                    style={{ flexShrink: 0, transform: openFaq === i ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s ease', color: '#555' }}>
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                </button>
                {openFaq === i && (
                  <p style={{ fontSize: 14, color: '#888880', lineHeight: 1.65, paddingBottom: 18, margin: 0, fontFamily: "'Satoshi', sans-serif" }}>
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

export default function ProPage() {
  return <Suspense><ProPageInner /></Suspense>
}
