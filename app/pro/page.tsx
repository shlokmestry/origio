'use client'

import { useEffect, useState } from 'react'
import Footer from '@/components/Footer'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/useAuth'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

// ── Icons ─────────────────────────────────────────────────────────────────
function CheckIcon({ accent = true }: { accent?: boolean }) {
  return (
    <span style={{
      flexShrink: 0, width: 16, height: 16,
      border: `1.5px solid ${accent ? '#00ffd5' : '#444'}`,
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      color: accent ? '#00ffd5' : '#666',
    }}>
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12"/>
      </svg>
    </span>
  )
}

function XIcon() {
  return (
    <span style={{
      flexShrink: 0, width: 16, height: 16,
      border: '1.5px solid #2a2a2a',
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#333',
    }}>
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
      </svg>
    </span>
  )
}

// ── Hemisphere SVG ────────────────────────────────────────────────────────
function Hemisphere() {
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, bottom: -60, display: 'flex', justifyContent: 'center', pointerEvents: 'none' }}>
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

// ── Data ──────────────────────────────────────────────────────────────────
const PRO_FEATURES = [
  { num: '01', title: 'All 25 countries ranked', desc: 'Your complete ranking, not just the top 3. Every country scored against your priorities, role, and passport.' },
  { num: '02', title: 'Full report per country', desc: 'Salary, take-home after tax, cost breakdown, visa path, and priority scores for your role and passport.' },
  { num: '03', title: 'Take-home calculator', desc: 'Enter your actual salary. See what you keep after tax and social security in any country.' },
  { num: '04', title: 'Visa checklist', desc: 'Every document you need, in order, with official links. Country-specific to your passport.' },
  { num: '05', title: '3-country comparison', desc: 'Compare your top 3 side by side across every metric. Pre-filled from your results.' },
]

const COMPARE_ROWS = [
  { feature: 'Top country matches',  free: 'Top 3',    pro: 'All 25',    freeCheck: null, proCheck: null },
  { feature: 'Salary by role',       free: null,       pro: null,         freeCheck: true, proCheck: true },
  { feature: 'Visa & cost summary',  free: 'Basic',    pro: 'Full',       freeCheck: null, proCheck: null },
  { feature: 'Full report',          free: null,       pro: null,         freeCheck: false, proCheck: true },
  { feature: 'Take-home calculator', free: null,       pro: null,         freeCheck: false, proCheck: true },
  { feature: 'Visa checklist',       free: null,       pro: null,         freeCheck: false, proCheck: true },
  { feature: '3-country comparison', free: null,       pro: null,         freeCheck: false, proCheck: true },
  { feature: 'Quiz runs',            free: '3 total',  pro: 'Unlimited',  freeCheck: null, proCheck: null },
]

const FAQS = [
  { q: 'Is this a one-time payment?', a: '€19.99 once. Pro forever. No subscription, no renewal, no surprise charges.' },
  { q: 'Why €19.99?', a: 'A single immigration lawyer consultation costs €200–500. Origio gives you the data to make that decision yourself.' },
  { q: 'What payment methods are accepted?', a: 'All major credit and debit cards via Stripe. We never see your card details.' },
  { q: 'Can I get a refund?', a: "If something isn't right, email us and we'll sort it out." },
  { q: 'Do I need an account?', a: 'Yes. Pro features are tied to your account so they work across devices and stay active.' },
  { q: 'I already ran the quiz as a free user. Do I lose my results?', a: "No. Your answers are saved. Run the quiz again after upgrading and you'll see all 25 countries ranked." },
]

// ── Main ──────────────────────────────────────────────────────────────────
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

  const eyebrow = { fontSize: 10, fontWeight: 800, letterSpacing: '0.2em', textTransform: 'uppercase' as const, color: '#888880' }
  const btnPrimary: React.CSSProperties = {
    background: '#00ffd5', color: '#0a0a0a', fontWeight: 800, textTransform: 'uppercase',
    letterSpacing: '0.15em', fontSize: 11, border: '2px solid #00ffd5',
    boxShadow: '3px 3px 0 #00aa90', display: 'inline-flex', alignItems: 'center',
    justifyContent: 'center', gap: 8, cursor: 'pointer', padding: '14px 28px',
    transition: 'transform .12s ease, box-shadow .12s ease',
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#f0f0e8', fontFamily: 'inherit', overflowX: 'hidden' }}>

      <style>{`
        .cta-hover:hover { transform: translate(-1px,-1px); box-shadow: 4px 4px 0 #00aa90 !important; }
        .ghost-hover:hover { color: #f0f0e8 !important; border-color: #444 !important; }
        .compare-row-hover:hover { background: #0d0d0d; }
        .faq-hover:hover { background: #0d0d0d; }
      `}</style>

      {/* ── NAV ── */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(10,10,10,0.9)', backdropFilter: 'blur(8px)', borderBottom: '1px solid #1a1a1a' }}>
        <div style={{ maxWidth: 1152, margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 56 }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
            <div style={{ width: 12, height: 12, background: '#00ffd5', border: '2px solid #f0f0e8', flexShrink: 0 }} />
            <span style={{ fontFamily: 'var(--font-heading, sans-serif)', fontSize: 15, fontWeight: 900, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#f0f0e8' }}>Origio</span>
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <a href="#pricing" style={{ ...eyebrow, textDecoration: 'none', color: '#888880' }}>Pricing</a>
            <a href="#faq"     style={{ ...eyebrow, textDecoration: 'none', color: '#888880' }}>FAQ</a>
            <Link href="/"     style={{ ...eyebrow, textDecoration: 'none', color: '#888880' }}>← Back</Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{ position: 'relative', paddingTop: 80, paddingBottom: 320, borderBottom: '1px solid #1a1a1a', overflow: 'hidden' }}>
        <Hemisphere />
        <div style={{ position: 'relative', maxWidth: 768, margin: '0 auto', padding: '0 24px', textAlign: 'center' }}>
          <p style={{ ...eyebrow, marginBottom: 20 }}>One-time payment · No subscription</p>
          <h1 style={{ fontFamily: 'var(--font-heading, sans-serif)', fontSize: 'clamp(52px, 8vw, 88px)', lineHeight: 0.88, fontWeight: 900, letterSpacing: '-0.025em', textTransform: 'uppercase', marginBottom: 24 }}>
            Full access.<br/><span style={{ color: '#00ffd5' }}>€19.99.</span> Once.
          </h1>
          <p style={{ fontSize: 15, color: '#888880', lineHeight: 1.7, maxWidth: 480, margin: '0 auto 36px' }}>
            Free: top 3 matches. Pro: all 25, take-home calculator, visa checklist, 3-country comparison.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 40 }}>
            <button onClick={handleUpgrade} disabled={loading} className="cta-hover" style={{ ...btnPrimary, opacity: loading ? 0.5 : 1 }}>
              {loading ? 'Redirecting…' : 'Get Pro — €19.99'}
            </button>
            <a href="#compare" className="ghost-hover" style={{
              background: 'transparent', color: '#888880', fontWeight: 800, textTransform: 'uppercase',
              letterSpacing: '0.15em', fontSize: 11, border: '1px solid #2a2a2a',
              display: 'inline-flex', alignItems: 'center', padding: '14px 28px',
              textDecoration: 'none', transition: 'color .12s ease, border-color .12s ease',
            }}>Compare plans</a>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: 24 }}>
            {['No subscription', 'Secure via Stripe', 'Yours forever'].map(t => (
              <span key={t} style={{ ...eyebrow }}>{t}</span>
            ))}
          </div>
          {error && <p style={{ marginTop: 16, fontSize: 13, color: '#f87171', fontWeight: 700 }}>{error}</p>}
        </div>
      </section>

      {/* ── PRICE CARD ── */}
      <section id="pricing" style={{ position: 'relative', marginTop: -288, paddingBottom: 80, paddingLeft: 24, paddingRight: 24, borderBottom: '1px solid #1a1a1a' }}>
        <div style={{ position: 'relative', maxWidth: 448, margin: '0 auto' }}>
          <div style={{
            position: 'relative',
            background: '#0d0d0d',
            border: '2px solid #2a2a2a',
            boxShadow: '6px 6px 0 #00ffd5',
            padding: 40,
          }}>
            {/* Label */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginBottom: 32 }}>
              <span style={{ ...eyebrow }}>Origio Pro</span>
            </div>

            {/* Price */}
            <div style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                <span style={{ fontFamily: 'var(--font-heading, sans-serif)', fontSize: 80, fontWeight: 900, lineHeight: 1, letterSpacing: '-0.03em' }}>
                  €19<span style={{ fontSize: 40, color: '#888880' }}>.99</span>
                </span>
              </div>
              <p style={{ ...eyebrow, color: '#00ffd5', marginTop: 12 }}>Once · forever · no renewal</p>
            </div>

            {/* Comparison line */}
            <div style={{ borderTop: '1px solid #1a1a1a', paddingTop: 20, marginBottom: 28, fontSize: 11, color: '#888880' }}>
              <span style={{ textDecoration: 'line-through', textDecorationThickness: 2, textDecorationColor: '#555' }}>€200+ for an immigration consult</span>
            </div>

            {/* Features */}
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px', display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                ['All 25 countries ranked', 'not just the top 3'],
                ['Full report per country', 'salary, tax, visa, cost'],
                ['Take-home calculator', 'pre-filled for your role'],
                ['Visa checklist', 'with official links'],
                ['3-country comparison', 'side-by-side'],
              ].map(([bold, rest]) => (
                <li key={bold} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <CheckIcon />
                  <span style={{ fontSize: 13, color: '#f0f0e8', lineHeight: 1.4 }}>
                    <strong>{bold}</strong> — {rest}
                  </span>
                </li>
              ))}
            </ul>

            {/* CTA */}
            <button onClick={handleUpgrade} disabled={loading} className="cta-hover"
              style={{ ...btnPrimary, width: '100%', padding: '14px 0', opacity: loading ? 0.5 : 1 }}>
              {loading ? 'Redirecting…' : 'Get Pro — €19.99'}
            </button>
            <p style={{ textAlign: 'center', fontSize: 10, fontWeight: 700, color: '#888880', marginTop: 16, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              Secure checkout via Stripe
            </p>
          </div>
        </div>
      </section>

      {/* ── WHAT YOU UNLOCK ── */}
      <section style={{ padding: '80px 24px', borderBottom: '1px solid #1a1a1a' }}>
        <div style={{ maxWidth: 672, margin: '0 auto' }}>
          <p style={{ ...eyebrow, marginBottom: 12 }}>What Pro includes</p>
          <h2 style={{ fontFamily: 'var(--font-heading, sans-serif)', fontSize: 'clamp(28px, 4vw, 36px)', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-0.01em', marginBottom: 48 }}>
            Five features. Not in the free tier.
          </h2>
          <div>
            {PRO_FEATURES.map((f, i) => (
              <div key={f.num} style={{ display: 'flex', alignItems: 'flex-start', gap: 20, padding: '24px 0', borderBottom: i < PRO_FEATURES.length - 1 ? '1px solid #111' : 'none' }}>
                <span style={{ fontFamily: 'var(--font-heading, sans-serif)', fontSize: 32, fontWeight: 900, color: '#00ffd5', width: 40, flexShrink: 0 }}>{f.num}</span>
                <div>
                  <p style={{ fontFamily: 'var(--font-heading, sans-serif)', fontSize: 14, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.01em', marginBottom: 6, color: '#f0f0e8' }}>{f.title}</p>
                  <p style={{ fontSize: 13, color: '#888880', lineHeight: 1.6 }}>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FREE vs PRO ── */}
      <section id="compare" style={{ padding: '80px 24px', borderBottom: '1px solid #1a1a1a' }}>
        <div style={{ maxWidth: 768, margin: '0 auto' }}>
          <p style={{ ...eyebrow, marginBottom: 12 }}>Free vs Pro</p>
          <h2 style={{ fontFamily: 'var(--font-heading, sans-serif)', fontSize: 'clamp(28px, 4vw, 36px)', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-0.01em', marginBottom: 48 }}>
            What's the difference?
          </h2>

          <div style={{ border: '1px solid #1a1a1a' }}>
            {/* Header */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px 120px', background: '#0d0d0d', borderBottom: '1px solid #1a1a1a' }}>
              <div style={{ padding: '16px 20px' }}><p style={eyebrow}>Feature</p></div>
              <div style={{ padding: '16px 12px', borderLeft: '1px solid #1a1a1a', textAlign: 'center' }}>
                <p style={eyebrow}>Free</p>
                <p style={{ fontFamily: 'var(--font-heading, sans-serif)', fontSize: 15, fontWeight: 900, marginTop: 2 }}>€0</p>
              </div>
              <div style={{ padding: '16px 12px', borderLeft: '1px solid rgba(0,255,213,0.3)', textAlign: 'center', background: 'rgba(10,22,20,0.8)' }}>
                <p style={{ ...eyebrow, color: '#00ffd5' }}>Pro</p>
                <p style={{ fontFamily: 'var(--font-heading, sans-serif)', fontSize: 15, fontWeight: 900, color: '#00ffd5', marginTop: 2 }}>€19.99</p>
              </div>
            </div>

            {/* Rows */}
            {COMPARE_ROWS.map((row, i) => (
              <div key={row.feature} className="compare-row-hover"
                style={{ display: 'grid', gridTemplateColumns: '1fr 120px 120px', borderBottom: i < COMPARE_ROWS.length - 1 ? '1px solid #111' : 'none', alignItems: 'center', transition: 'background .12s ease' }}>
                <div style={{ padding: '14px 20px', fontSize: 13, fontWeight: 500 }}>{row.feature}</div>
                <div style={{ padding: '14px 12px', borderLeft: '1px solid #1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {row.freeCheck === true  && <CheckIcon accent={false} />}
                  {row.freeCheck === false && <XIcon />}
                  {row.free !== null && row.freeCheck === null && <span style={{ fontSize: 12, color: '#888880' }}>{row.free}</span>}
                </div>
                <div style={{ padding: '14px 12px', borderLeft: '1px solid rgba(0,255,213,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(10,22,20,0.4)' }}>
                  {row.proCheck === true  && <CheckIcon />}
                  {row.proCheck === false && <XIcon />}
                  {row.pro !== null && row.proCheck === null && <span style={{ fontSize: 12, color: '#00ffd5', fontWeight: 700 }}>{row.pro}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" style={{ padding: '80px 24px', borderBottom: '1px solid #1a1a1a' }}>
        <div style={{ maxWidth: 672, margin: '0 auto' }}>
          <p style={{ ...eyebrow, marginBottom: 12 }}>Common questions</p>
          <h2 style={{ fontFamily: 'var(--font-heading, sans-serif)', fontSize: 'clamp(28px, 4vw, 36px)', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-0.01em', marginBottom: 48 }}>
            Before you upgrade.
          </h2>
          <div style={{ border: '1px solid #1a1a1a' }}>
            {FAQS.map((faq, i) => (
              <div key={i} style={{ borderBottom: i < FAQS.length - 1 ? '1px solid #111' : 'none' }}>
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="faq-hover"
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '16px 20px', textAlign: 'left', background: 'transparent', border: 'none',
                    cursor: 'pointer', transition: 'background .12s ease',
                  }}>
                  <span style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#f0f0e8', paddingRight: 16 }}>{faq.q}</span>
                  <svg style={{ width: 16, height: 16, color: openFaq === i ? '#00ffd5' : '#888880', flexShrink: 0, transform: openFaq === i ? 'rotate(180deg)' : 'none', transition: 'transform .2s ease, color .2s ease' }}
                    viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                </button>
                {openFaq === i && (
                  <div style={{ padding: '16px 20px', fontSize: 12, color: '#888880', lineHeight: 1.7, borderTop: '1px solid #111' }}>
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section style={{ padding: '80px 24px' }}>
        <div style={{ maxWidth: 768, margin: '0 auto' }}>
          <div style={{ border: '1px solid #2a2a2a', padding: 'clamp(32px, 5vw, 48px)', boxShadow: '4px 4px 0 #00ffd5' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 24 }}>
              <div>
                <h2 style={{ fontFamily: 'var(--font-heading, sans-serif)', fontSize: 'clamp(28px, 4vw, 36px)', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-0.01em', marginBottom: 8 }}>Get the full ranking.</h2>
                <p style={{ fontSize: 13, color: '#888880' }}>€19.99. No subscription.</p>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 16 }}>
                <button onClick={handleUpgrade} disabled={loading} className="cta-hover"
                  style={{ ...btnPrimary, opacity: loading ? 0.5 : 1 }}>
                  {loading ? 'Redirecting…' : 'Get Pro — €19.99'}
                </button>
                <Link href="/wizard" style={{ fontSize: 11, fontWeight: 700, color: '#888880', textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '0.1em' }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#f0f0e8')}
                  onMouseLeave={e => (e.currentTarget.style.color = '#888880')}>
                  Try free first →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

    <Footer />
    </div>
  )
}