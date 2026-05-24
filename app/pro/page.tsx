'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/useAuth'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'

// ── Icons ──────────────────────────────────────────────────────────────────────
function Check({ accent = true }: { accent?: boolean }) {
  return (
    <span style={{
      flexShrink: 0, width: 16, height: 16,
      border: `1.5px solid ${accent ? '#00ffd5' : '#444'}`,
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      color: accent ? '#00ffd5' : '#555',
    }}>
      <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12"/>
      </svg>
    </span>
  )
}

function XMark() {
  return (
    <span style={{
      flexShrink: 0, width: 16, height: 16,
      border: '1.5px solid #2a2a2a',
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#333',
    }}>
      <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
      </svg>
    </span>
  )
}

function LiveDot() {
  return (
    <span style={{
      display: 'inline-block', width: 6, height: 6, borderRadius: '50%',
      background: '#4ade80', boxShadow: '0 0 8px rgba(74,222,128,0.6)',
      animation: 'livepulse 2s ease-in-out infinite', flexShrink: 0,
    }} />
  )
}

// ── Hemisphere SVG ─────────────────────────────────────────────────────────────
function Hemisphere() {
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, bottom: -60, display: 'flex', justifyContent: 'center', pointerEvents: 'none' }}>
      <div style={{
        position: 'absolute', width: 1200, height: 600, bottom: 0,
        background: 'radial-gradient(ellipse at center bottom, rgba(0,255,213,0.22) 0%, rgba(0,255,213,0.08) 35%, transparent 65%)',
        filter: 'blur(20px)',
      }} />
      <div style={{ position: 'relative', width: 1100, height: 550 }}>
        <svg viewBox="-550 -500 1100 550" fill="none" style={{ width: '100%', height: '100%', display: 'block' }}>
          <defs>
            <clipPath id="top-half">
              <rect x="-550" y="-500" width="1100" height="500"/>
            </clipPath>
          </defs>
          <g clipPath="url(#top-half)">
            <ellipse cx="0" cy="-260" rx="248" ry="22" stroke="rgba(0,255,213,0.25)" strokeWidth="1" fill="none"/>
            <ellipse cx="0" cy="-200" rx="299" ry="30" stroke="rgba(0,255,213,0.25)" strokeWidth="1" fill="none"/>
            <ellipse cx="0" cy="-130" rx="335" ry="40" stroke="rgba(0,255,213,0.45)" strokeWidth="1.2" fill="none"/>
            <ellipse cx="0" cy="-60"  rx="355" ry="48" stroke="rgba(0,255,213,0.25)" strokeWidth="1" fill="none"/>
            <circle cx="0" cy="0" r="360" stroke="rgba(0,255,213,0.55)" strokeWidth="1.5" fill="none"/>
            <ellipse cx="0" cy="0" rx="60"  ry="360" stroke="rgba(0,255,213,0.4)"  strokeWidth="1.2" fill="none"/>
            <ellipse cx="0" cy="0" rx="140" ry="360" stroke="rgba(0,255,213,0.2)"  strokeWidth="1"   fill="none"/>
            <ellipse cx="0" cy="0" rx="220" ry="360" stroke="rgba(0,255,213,0.2)"  strokeWidth="1"   fill="none"/>
            <ellipse cx="0" cy="0" rx="295" ry="360" stroke="rgba(0,255,213,0.2)"  strokeWidth="1"   fill="none"/>
            {[[-160,-180],[70,-110],[210,-220],[-260,-90],[310,-60]].map(([cx,cy],i) => (
              <g key={i}>
                <circle cx={cx} cy={cy} r="9" fill="rgba(0,255,213,0.35)"/>
                <circle cx={cx} cy={cy} r="3.2" fill="#00ffd5"/>
              </g>
            ))}
          </g>
          <line x1="-360" y1="0" x2="360" y2="0" stroke="rgba(0,255,213,0.7)" strokeWidth="1.5"/>
        </svg>
      </div>
    </div>
  )
}

// ── Data ───────────────────────────────────────────────────────────────────────
const PRO_FEATURES = [
  { num: '01', title: 'All 25 countries ranked', desc: 'Your complete personalised ranking, not just the top 3. Every country in the wizard pool scored against your priorities.' },
  { num: '02', title: 'Full personalised report', desc: 'Salary, take-home after tax, cost breakdown, visa path, and priority scores specific to your role and passport.' },
  { num: '03', title: 'Take-home calculator', desc: 'Input your actual salary and see exactly what you keep after tax and social security in any country.' },
  { num: '04', title: 'Visa checklist', desc: 'Every document you need, in order, with official links. Country-specific.' },
  { num: '05', title: '3-country comparison', desc: 'Compare your top 3 matches side by side across every metric. Pre-filled from your wizard results.' },
]

const COMPARE_ROWS = [
  { feature: 'Top country matches',  free: 'Top 3',   pro: 'All 25',    freeCheck: null,  proCheck: null  },
  { feature: 'Salary by role',       free: null,      pro: null,         freeCheck: true,  proCheck: true  },
  { feature: 'Visa & cost summary',  free: 'Basic',   pro: 'Full',       freeCheck: null,  proCheck: null  },
  { feature: 'Personalised report',  free: null,      pro: null,         freeCheck: false, proCheck: true  },
  { feature: 'Take-home calculator', free: null,      pro: null,         freeCheck: false, proCheck: true  },
  { feature: 'Visa checklist',       free: null,      pro: null,         freeCheck: false, proCheck: true  },
  { feature: '3-country comparison', free: null,      pro: null,         freeCheck: false, proCheck: true  },
  { feature: 'Quiz runs',            free: '3 total', pro: 'Unlimited',  freeCheck: null,  proCheck: null  },
]

const FAQS = [
  { q: 'Is this really a one-time payment?', a: '€4.99 once. Pro forever. No subscription, no renewal, no surprise charges. Pay once and every feature is yours permanently.' },
  { q: 'Why €4.99 and not free?', a: 'Keeping the data fresh, the scoring accurate, and the servers running costs money. €4.99 is the lowest we can go and still build something worth using.' },
  { q: 'What payment methods are accepted?', a: 'All major credit and debit cards via Stripe. We never see your card details.' },
  { q: 'Can I get a refund?', a: "If something isn't right, email us and we'll sort it out. We stand behind the product." },
  { q: 'Do I need an account?', a: 'Yes. Pro features are tied to your account so they work across devices and stay active permanently.' },
  { q: 'I already ran the quiz as a free user. Do I lose my results?', a: "No. Your answers are saved. Run the quiz again after upgrading and you'll instantly see all 25 countries ranked." },
]

// ── Tokens ─────────────────────────────────────────────────────────────────────
const SERIF = "var(--font-heading, Georgia, 'Times New Roman', serif)"
const SANS  = "var(--font-body, 'Satoshi', system-ui, sans-serif)"
const MONO  = "'Cabinet Grotesk', monospace"

const eyebrow: React.CSSProperties = {
  fontFamily: MONO, fontSize: 10, fontWeight: 800,
  letterSpacing: '0.2em', textTransform: 'uppercase', color: '#888880',
  margin: 0,
}

const btnPrimary: React.CSSProperties = {
  background: '#00ffd5', color: '#0a0a0a',
  fontFamily: SANS, fontWeight: 800,
  textTransform: 'uppercase', letterSpacing: '0.15em', fontSize: 11,
  border: '2px solid #00ffd5', boxShadow: '3px 3px 0 #00aa90',
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
  cursor: 'pointer', padding: '14px 28px',
  textDecoration: 'none',
  transition: 'transform .12s ease, box-shadow .12s ease',
}

// ── Main ───────────────────────────────────────────────────────────────────────
export default function ProPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [openFaq, setOpenFaq] = useState<number | null>(0)

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
    <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#f0f0e8', overflowX: 'hidden' }}>

      <style>{`
        @keyframes livepulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
        .cta-hover:hover { transform: translate(-1px,-1px); box-shadow: 4px 4px 0 #00aa90 !important; }
        .ghost-hover:hover { color: #f0f0e8 !important; border-color: #555 !important; }
        .compare-row:hover { background: rgba(255,255,255,0.015); }
        .faq-btn:hover { background: rgba(255,255,255,0.02); }
      `}</style>

      <Nav countries={[]} onCountrySelect={() => {}} />

      {/* ══ HERO ══ */}
      <section style={{ position: 'relative', paddingTop: 80, paddingBottom: 320, borderBottom: '1px solid #1a1a1a', overflow: 'hidden' }}>
        <Hemisphere />
        <div style={{ position: 'relative', maxWidth: 768, margin: '0 auto', padding: '0 24px', textAlign: 'center' }}>
          <p style={{ ...eyebrow, marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            ★ One-time payment · No subscription
          </p>
          <h1 style={{
            fontFamily: SERIF, fontWeight: 900,
            fontSize: 'clamp(52px, 8vw, 88px)',
            lineHeight: 0.9, letterSpacing: '-0.025em',
            textTransform: 'uppercase', marginBottom: 24,
          }}>
            Pay once.<br/>Move <em style={{ color: '#00ffd5', fontStyle: 'italic', textTransform: 'none' }}>freely.</em>
          </h1>
          <p style={{ fontFamily: SANS, fontSize: 15, color: '#888880', lineHeight: 1.7, maxWidth: 420, margin: '0 auto 36px' }}>
            Free shows you the top 3. Pro ranks all 25 with full personalised reports, take-home calculations, and side-by-side comparison.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 40 }}>
            <button onClick={handleUpgrade} disabled={loading} className="cta-hover"
              style={{ ...btnPrimary, opacity: loading ? 0.5 : 1, borderRadius: 999, padding: '13px 28px' }}>
              {loading ? 'Redirecting…' : 'Get Pro · €4.99'}
            </button>
            <a href="#compare" className="ghost-hover" style={{
              fontFamily: SANS, fontWeight: 700, fontSize: 13,
              color: '#888880', textDecoration: 'none',
              display: 'inline-flex', alignItems: 'center', gap: 4,
              transition: 'color .12s',
            }}>
              Compare plans →
            </a>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: 24 }}>
            {['No subscription', 'Secure via Stripe', 'Yours forever'].map(t => (
              <span key={t} style={{ ...eyebrow, display: 'flex', alignItems: 'center', gap: 6 }}>
                <LiveDot /> {t}
              </span>
            ))}
          </div>
          {error && <p style={{ marginTop: 16, fontFamily: SANS, fontSize: 13, color: '#f87171', fontWeight: 700 }}>{error}</p>}
        </div>
      </section>

      {/* ══ PRICE CARD ══ */}
      <section id="pricing" style={{ position: 'relative', marginTop: -288, paddingBottom: 80, padding: '0 24px 96px', borderBottom: '1px solid #1a1a1a' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{
            background: 'linear-gradient(180deg, #0d0d0d 0%, #0a0a0a 100%)',
            border: '2px solid #2a2a2a',
            boxShadow: '6px 6px 0 #00ffd5, inset 0 1px 0 rgba(255,255,255,0.03)',
            padding: '48px 56px',
            position: 'relative', overflow: 'hidden',
          }}>
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,255,213,0.07), transparent 55%)', pointerEvents: 'none' }} />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 56, alignItems: 'center', position: 'relative' }} className="price-grid">

              {/* Left: price info */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                  <span style={{
                    border: '1.5px solid #00ffd5', padding: '4px 10px', color: '#00ffd5',
                    fontFamily: MONO, fontSize: 9, fontWeight: 800, letterSpacing: '0.18em', textTransform: 'uppercase',
                    display: 'inline-flex', alignItems: 'center', gap: 4,
                    transform: 'rotate(-3deg)',
                  }}>★ Best value</span>
                </div>

                <h2 style={{
                  fontFamily: SERIF, fontWeight: 900, fontSize: 'clamp(32px, 4vw, 52px)',
                  lineHeight: 1, letterSpacing: '-0.015em',
                  marginBottom: 16, textTransform: 'uppercase',
                }}>
                  Origio <em style={{ color: '#00ffd5', fontStyle: 'italic', textTransform: 'none' }}>Pro</em>
                </h2>

                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 8 }}>
                  <span style={{
                    fontFamily: SERIF, fontWeight: 900,
                    fontSize: 'clamp(56px, 8vw, 80px)',
                    lineHeight: 1, letterSpacing: '-0.03em',
                  }}>
                    €4<span style={{ fontSize: '0.5em', color: '#888880' }}>.99</span>
                  </span>
                </div>

                <p style={{ fontFamily: MONO, fontSize: 9, color: '#00ffd5', letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 20 }}>
                  Once · forever · no renewal
                </p>

                <div style={{ borderTop: '1px solid #1a1a1a', paddingTop: 16, marginBottom: 0 }}>
                  <p style={{ fontFamily: SANS, fontSize: 12, color: '#888880', lineHeight: 1.6 }}>
                    An immigration consult costs €200+. Origio gives you the data to decide yourself —{' '}
                    <span style={{ color: '#00ffd5', fontWeight: 700 }}>save 90%</span>.
                  </p>
                </div>
              </div>

              {/* Right: features + CTA */}
              <div style={{ borderLeft: '1px solid #1f1f1f', paddingLeft: 48 }}>
                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 28px', display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {[
                    ['All 25 countries ranked', '— not just the top 3'],
                    ['Full personalised reports', '— for every country'],
                    ['Take-home calculator', '— pre-filled for your role'],
                    ['Visa checklist', '— with official links'],
                    ['3-country comparison', '— side-by-side'],
                  ].map(([bold, rest]) => (
                    <li key={bold} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                      <span style={{ color: '#00ffd5', fontSize: 16, lineHeight: 1.1, flexShrink: 0, marginTop: 1 }}>✦</span>
                      <span style={{ fontFamily: SANS, fontSize: 14, lineHeight: 1.4 }}>
                        <strong style={{ color: '#f0f0e8', fontWeight: 700 }}>{bold}</strong>{' '}
                        <span style={{ color: 'rgba(240,240,232,0.45)' }}>{rest}</span>
                      </span>
                    </li>
                  ))}
                </ul>

                <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                  <button onClick={handleUpgrade} disabled={loading} className="cta-hover"
                    style={{ ...btnPrimary, borderRadius: 999, opacity: loading ? 0.5 : 1 }}>
                    {loading ? 'Redirecting…' : 'Get Pro · €4.99 →'}
                  </button>
                  <span style={{ fontFamily: SANS, fontSize: 11, color: '#555' }}>Secure checkout via Stripe</span>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* ══ WHAT YOU UNLOCK ══ */}
      <section style={{ padding: '96px 24px', borderBottom: '1px solid #1a1a1a' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <p style={{ ...eyebrow, color: '#00ffd5', marginBottom: 12 }}>What you unlock</p>
          <h2 style={{
            fontFamily: SERIF, fontWeight: 900, fontSize: 'clamp(40px, 6vw, 80px)',
            lineHeight: 1, letterSpacing: '-0.02em', marginBottom: 64,
          }}>
            Five things free users <em style={{ color: '#00ffd5', fontStyle: 'italic' }}>don't get</em>.
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 0 }} className="features-grid">
            {PRO_FEATURES.map((f, i) => (
              <div key={f.num} style={{
                display: 'flex', alignItems: 'flex-start', gap: 24,
                padding: '32px 28px',
                borderTop: '1px solid #1a1a1a',
                borderRight: i % 2 === 0 ? '1px solid #1a1a1a' : 'none',
              }}>
                <span style={{ fontFamily: SERIF, fontWeight: 900, fontSize: 44, color: '#00ffd5', lineHeight: 1, flexShrink: 0, minWidth: 52, fontStyle: 'italic' }}>{f.num}</span>
                <div>
                  <p style={{ fontFamily: SERIF, fontWeight: 900, fontSize: 20, color: '#f0f0e8', marginBottom: 8, letterSpacing: '-0.01em' }}>{f.title}</p>
                  <p style={{ fontFamily: SANS, fontSize: 14, color: 'rgba(240,240,232,0.52)', lineHeight: 1.65 }}>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ FREE vs PRO ══ */}
      <section id="compare" style={{ padding: '96px 24px', borderBottom: '1px solid #1a1a1a' }}>
        <div style={{ maxWidth: 860, margin: '0 auto' }}>
          <p style={{ ...eyebrow, color: '#00ffd5', marginBottom: 12 }}>Free vs Pro</p>
          <h2 style={{
            fontFamily: SERIF, fontWeight: 900, fontSize: 'clamp(40px, 6vw, 80px)',
            lineHeight: 1, letterSpacing: '-0.02em', marginBottom: 56,
          }}>
            What's the <em style={{ color: '#00ffd5', fontStyle: 'italic' }}>difference</em>?
          </h2>
          <div style={{ border: '1px solid #1a1a1a' }}>
            {/* Header row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px 140px', background: '#0d0d0d', borderBottom: '1px solid #1a1a1a' }}>
              <div style={{ padding: '16px 24px' }}><p style={eyebrow}>Feature</p></div>
              <div style={{ padding: '16px 12px', borderLeft: '1px solid #1a1a1a', textAlign: 'center' }}>
                <p style={eyebrow}>Free</p>
                <p style={{ fontFamily: SERIF, fontWeight: 900, fontSize: 15, marginTop: 4 }}>€0</p>
              </div>
              <div style={{ padding: '16px 12px', borderLeft: '1px solid rgba(0,255,213,0.3)', textAlign: 'center', background: 'rgba(10,22,20,0.8)' }}>
                <p style={{ ...eyebrow, color: '#00ffd5' }}>Pro</p>
                <p style={{ fontFamily: SERIF, fontWeight: 900, fontSize: 15, color: '#00ffd5', marginTop: 4 }}>€4.99</p>
              </div>
            </div>
            {COMPARE_ROWS.map((row, i) => (
              <div key={row.feature} className="compare-row" style={{
                display: 'grid', gridTemplateColumns: '1fr 120px 140px',
                borderBottom: i < COMPARE_ROWS.length - 1 ? '1px solid #111' : 'none',
                alignItems: 'center', transition: 'background .12s',
              }}>
                <div style={{ padding: '14px 24px', fontFamily: SANS, fontSize: 14, fontWeight: 500 }}>{row.feature}</div>
                <div style={{ padding: '14px 12px', borderLeft: '1px solid #1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {row.freeCheck === true  && <Check accent={false} />}
                  {row.freeCheck === false && <XMark />}
                  {row.free && row.freeCheck === null && <span style={{ fontFamily: SANS, fontSize: 12, color: '#888880' }}>{row.free}</span>}
                </div>
                <div style={{ padding: '14px 12px', borderLeft: '1px solid rgba(0,255,213,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(10,22,20,0.4)' }}>
                  {row.proCheck === true  && <Check />}
                  {row.proCheck === false && <XMark />}
                  {row.pro && row.proCheck === null && <span style={{ fontFamily: SANS, fontSize: 12, color: '#00ffd5', fontWeight: 700 }}>{row.pro}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ FAQ ══ */}
      <section id="faq" style={{ padding: '96px 24px', borderBottom: '1px solid #1a1a1a' }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <p style={{ ...eyebrow, color: '#00ffd5', marginBottom: 12 }}>Questions</p>
          <h2 style={{
            fontFamily: SERIF, fontWeight: 900, fontSize: 'clamp(40px, 6vw, 80px)',
            lineHeight: 1, letterSpacing: '-0.02em', marginBottom: 56,
          }}>
            Before you <em style={{ color: '#00ffd5', fontStyle: 'italic' }}>upgrade</em>.
          </h2>
          <div style={{ borderTop: '1px solid #1a1a1a', borderBottom: '1px solid #1a1a1a' }}>
            {FAQS.map((faq, i) => (
              <div key={i} style={{ borderBottom: i < FAQS.length - 1 ? '1px solid #111' : 'none' }}>
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="faq-btn"
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '22px 4px', textAlign: 'left', background: 'transparent', border: 'none',
                    cursor: 'pointer', transition: 'background .12s', gap: 16,
                  }}>
                  <span style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 'clamp(16px, 2vw, 22px)', color: '#f0f0e8', lineHeight: 1.2 }}>{faq.q}</span>
                  <svg style={{
                    width: 22, height: 22, color: openFaq === i ? '#00ffd5' : '#555', flexShrink: 0,
                    transform: openFaq === i ? 'rotate(45deg)' : 'none',
                    transition: 'transform .2s ease, color .2s ease',
                  }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                  </svg>
                </button>
                {openFaq === i && (
                  <div style={{ paddingBottom: 22, paddingRight: 32 }}>
                    <p style={{ fontFamily: SANS, fontSize: 15, color: 'rgba(240,240,232,0.6)', lineHeight: 1.7 }}>{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ FINAL CTA ══ */}
      <section style={{ padding: '96px 24px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{
            border: '1px solid #2a2a2a', padding: 'clamp(40px, 6vw, 64px)',
            background: 'radial-gradient(120% 120% at 50% 0%, rgba(0,255,213,0.08) 0%, rgba(10,10,10,0) 60%)',
            textAlign: 'center', position: 'relative', overflow: 'hidden',
            boxShadow: '4px 4px 0 #00ffd5',
          }}>
            <div style={{ position: 'absolute', top: -40, right: -40, width: 160, height: 160, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,255,213,0.12), transparent 70%)', pointerEvents: 'none' }} />
            <h2 style={{
              fontFamily: SERIF, fontWeight: 900,
              fontSize: 'clamp(40px, 6vw, 80px)',
              lineHeight: 1, letterSpacing: '-0.02em', marginBottom: 16, position: 'relative',
            }}>
              Ready to <em style={{ color: '#00ffd5', fontStyle: 'italic' }}>move</em>?
            </h2>
            <p style={{ fontFamily: SANS, fontSize: 15, color: '#888880', lineHeight: 1.6, marginBottom: 36 }}>
              One payment. Full access. Forever.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: 20 }}>
              <button onClick={handleUpgrade} disabled={loading} className="cta-hover"
                style={{ ...btnPrimary, borderRadius: 999, opacity: loading ? 0.5 : 1 }}>
                {loading ? 'Redirecting…' : 'Get Pro · €4.99 →'}
              </button>
              <Link href="/wizard"
                style={{ fontFamily: SANS, fontSize: 12, fontWeight: 700, color: '#888880', textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '0.1em' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#f0f0e8')}
                onMouseLeave={e => (e.currentTarget.style.color = '#888880')}>
                Try free first →
              </Link>
            </div>
            {error && <p style={{ marginTop: 16, fontFamily: SANS, fontSize: 13, color: '#f87171', fontWeight: 700 }}>{error}</p>}
          </div>
        </div>
      </section>

      <style>{`
        @media (max-width: 768px) {
          .price-grid { grid-template-columns: 1fr !important; }
          .features-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <Footer />
    </div>
  )
}