'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Eye, EyeOff } from 'lucide-react'

// ── Country data ──────────────────────────────────────────────────────────────
const COUNTRIES = [
  {
    flag: '🇨🇭', name: 'Switzerland', score: 92, scoreColor: '#4ade80',
    salary: 'CHF 9,620', visa: 'EU/EFTA', safety: '9.3', safetyColor: '#4ade80',
    bars: { salary: 96, safety: 93, health: 88, afford: 42 },
    nums: { salary: '9.6', safety: '9.3', health: '8.8', afford: '4.2' },
    coord: '47.3769° N · 8.5417° E',
    reasons: [['★ Salary fit', '#00ffd5'], ['★ Safety', '#4ade80'], ['★ Easy visa', '#fafafa']] as [string, string][],
    forName: 'Aoife', forRole: 'PM', forPassport: 'IE',
    ghost: 'SWITZERLAND',
  },
  {
    flag: '🇩🇰', name: 'Denmark', score: 88, scoreColor: '#4ade80',
    salary: 'DKK 48,200', visa: 'Pay limit', safety: '9.0', safetyColor: '#4ade80',
    bars: { salary: 88, safety: 90, health: 92, afford: 64 },
    nums: { salary: '8.8', safety: '9.0', health: '9.2', afford: '6.4' },
    coord: '55.6761° N · 12.5683° E',
    reasons: [['★ Healthcare', '#4ade80'], ['★ Work-life', '#fafafa'], ['★ Bike city', '#00ffd5']] as [string, string][],
    forName: 'James', forRole: 'SWE', forPassport: 'UK',
    ghost: 'DENMARK',
  },
  {
    flag: '🇳🇱', name: 'Netherlands', score: 85, scoreColor: '#facc15',
    salary: '€ 5,840', visa: '30% ruling', safety: '8.5', safetyColor: '#4ade80',
    bars: { salary: 82, safety: 85, health: 86, afford: 58 },
    nums: { salary: '8.2', safety: '8.5', health: '8.6', afford: '5.8' },
    coord: '52.3676° N · 4.9041° E',
    reasons: [['★ 30% ruling', '#00ffd5'], ['★ English', '#fafafa'], ['★ Connected', '#4ade80']] as [string, string][],
    forName: 'Priya', forRole: 'ENG', forPassport: 'IN',
    ghost: 'NETHERLANDS',
  },
  {
    flag: '🇵🇹', name: 'Portugal', score: 81, scoreColor: '#facc15',
    salary: '€ 3,140', visa: 'D7 / D8', safety: '8.2', safetyColor: '#4ade80',
    bars: { salary: 62, safety: 82, health: 80, afford: 88 },
    nums: { salary: '6.2', safety: '8.2', health: '8.0', afford: '8.8' },
    coord: '38.7223° N · 9.1393° W',
    reasons: [['★ Affordable', '#4ade80'], ['★ Climate', '#fafafa'], ['★ Nomad visa', '#00ffd5']] as [string, string][],
    forName: 'Marco', forRole: 'DEV', forPassport: 'BR',
    ghost: 'PORTUGAL',
  },
]

const ROWS = [
  { text: 'Portugal · Denmark · Netherlands · Germany ·', solid: false, dir: 'l' },
  { text: 'Spain · Switzerland · Ireland · Norway ·', solid: true, dir: 'r' },
  { text: 'Sweden · Canada · Singapore · Japan ·', solid: false, dir: 'l' },
  { text: 'Estonia · France · Finland · Australia ·', solid: true, dir: 'r' },
  { text: 'New Zealand · UK · Iceland · Belgium ·', solid: false, dir: 'l' },
  { text: 'Czechia · Italy · Greece · Mexico · UAE ·', solid: true, dir: 'r' },
]

// ── Geo dots ──────────────────────────────────────────────────────────────────
const GEO_DOTS = [
  { flag: '🇨🇭', label: 'Zurich',     top: '28%', left: '52%', delay: '0s'    },
  { flag: '🇩🇰', label: 'Copenhagen', top: '18%', left: '51%', delay: '0.6s'  },
  { flag: '🇳🇱', label: 'Amsterdam',  top: '32%', left: '48%', delay: '1.2s'  },
  { flag: '🇵🇹', label: 'Lisbon',     top: '55%', left: '41%', delay: '1.8s'  },
  { flag: '🇸🇬', label: 'Singapore',  top: '68%', left: '78%', delay: '0.9s'  },
]

// ── Typewriter hook ───────────────────────────────────────────────────────────
function useTypewriter(text: string, speed = 38) {
  const [displayed, setDisplayed] = useState('')
  const [done, setDone] = useState(false)
  const prevText = useRef(text)

  useEffect(() => {
    if (prevText.current === text) return
    prevText.current = text
    setDone(false)
    setDisplayed('')
    let i = 0
    const id = setInterval(() => {
      i++
      setDisplayed(text.slice(0, i))
      if (i >= text.length) { clearInterval(id); setDone(true) }
    }, speed)
    return () => clearInterval(id)
  }, [text, speed])

  // On mount, type it once
  useEffect(() => {
    let i = 0
    const id = setInterval(() => {
      i++
      setDisplayed(text.slice(0, i))
      if (i >= text.length) { clearInterval(id); setDone(true) }
    }, speed)
    return () => clearInterval(id)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return { displayed, done }
}

// ── Password strength ─────────────────────────────────────────────────────────
function passwordStrength(pw: string): { pct: number; label: string; color: string } {
  if (pw.length === 0) return { pct: 0,   label: '',              color: '#1a1a1a' }
  if (pw.length < 6)   return { pct: 20,  label: 'guessable',     color: '#f87171' }
  if (pw.length < 8)   return { pct: 40,  label: 'fine',          color: '#facc15' }
  if (pw.length < 12)  return { pct: 65,  label: 'decent',        color: '#4ade80' }
  if (pw.length < 15)  return { pct: 85,  label: 'paranoid',      color: '#00ffd5' }
  return                      { pct: 100, label: 'government-level', color: '#a78bfa' }
}

function barColor(pct: number) {
  if (pct >= 75) return '#4ade80'
  if (pct >= 50) return '#facc15'
  return '#f87171'
}

// ── Animated score ticker ─────────────────────────────────────────────────────
function ScoreTicker({ target, run }: { target: number; run: boolean }) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    if (!run) { setVal(0); return }
    let current = 0
    const step = Math.ceil(target / 28)
    const id = setInterval(() => {
      current = Math.min(current + step, target)
      setVal(current)
      if (current >= target) clearInterval(id)
    }, 40)
    return () => clearInterval(id)
  }, [run, target])
  return <>{val}</>
}

// ── Cycling card ──────────────────────────────────────────────────────────────
function CyclingCard({ idx, fading, isSignup }: { idx: number; fading: boolean; isSignup: boolean }) {
  const c = COUNTRIES[idx]
  const [tickerRun, setTickerRun] = useState(false)

  useEffect(() => {
    if (!fading) {
      const t = setTimeout(() => setTickerRun(true), 80)
      return () => clearTimeout(t)
    } else {
      setTickerRun(false)
    }
  }, [fading, idx])

  return (
    <div style={{
      opacity: fading ? 0 : 1,
      transform: fading ? 'translateY(8px) scale(0.98)' : 'translateY(0) scale(1)',
      transition: 'opacity 0.35s ease, transform 0.35s ease',
      background: '#0a0a0a', border: '2px solid #2a2a2a',
      boxShadow: '6px 6px 0 #00ffd5', width: 360, maxWidth: '100%',
    }}>
      {/* Head */}
      <div style={{ padding: '10px 20px', borderBottom: '2px solid #2a2a2a', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#888880' }}>
          {isSignup ? '✦ New match found' : 'Your top match'}
        </span>
        <span style={{ fontFamily: 'Satoshi, sans-serif', fontSize: 10, color: isSignup ? '#00ffd5' : '#888880', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          {isSignup ? 'scanning...' : 'Sample'}
        </span>
      </div>

      <div style={{ padding: 20 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 20 }}>
          <span style={{ fontSize: 56, lineHeight: 1 }}>{c.flag}</span>
          <div>
            <p style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#888880', marginBottom: 4 }}>#01</p>
            <p style={{ fontFamily: 'var(--font-heading, sans-serif)', fontSize: 24, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-0.02em', lineHeight: 1, color: '#fafafa' }}>{c.name}</p>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginTop: 10 }}>
              <span style={{ fontFamily: 'var(--font-heading, sans-serif)', fontSize: 42, fontWeight: 900, lineHeight: 1, color: c.scoreColor }}>
                {isSignup ? <ScoreTicker target={c.score} run={tickerRun && isSignup} /> : c.score}
              </span>
              <span style={{ color: '#888880', fontSize: 13, fontWeight: 700 }}>% match</span>
            </div>
          </div>
        </div>

        {/* Stats grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', border: '2px solid #1a1a1a', marginBottom: 16 }}>
          {[
            { label: 'Take-home', val: c.salary, color: '#00ffd5' },
            { label: 'Visa',      val: c.visa,   color: '#fafafa' },
            { label: 'Safety',    val: c.safety,  color: c.safetyColor },
          ].map((s, i) => (
            <div key={s.label} style={{ padding: 10, borderRight: i < 2 ? '2px solid #1a1a1a' : 'none' }}>
              <p style={{ fontSize: 8, fontWeight: 800, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#888880', marginBottom: 3 }}>{s.label}</p>
              <p style={{ fontFamily: 'var(--font-heading, sans-serif)', fontSize: 12, fontWeight: 900, color: s.color }}>{s.val}</p>
            </div>
          ))}
        </div>

        {/* Bars */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
          {[
            { label: 'Salary',        pct: c.bars.salary, num: c.nums.salary },
            { label: 'Safety',        pct: c.bars.safety, num: c.nums.safety },
            { label: 'Healthcare',    pct: c.bars.health, num: c.nums.health },
            { label: 'Affordability', pct: c.bars.afford, num: c.nums.afford },
          ].map(b => (
            <div key={b.label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#888880', width: 74, flexShrink: 0 }}>{b.label}</span>
              <div style={{ flex: 1, height: 3, background: '#1a1a1a', position: 'relative', overflow: 'hidden' }}>
                <span style={{
                  position: 'absolute', left: 0, top: 0, bottom: 0,
                  width: (fading ? 0 : b.pct) + '%',
                  background: barColor(b.pct),
                  transition: fading ? 'width 0.2s ease' : 'width 0.8s cubic-bezier(.2,.8,.2,1) 0.1s',
                }} />
              </div>
              <span style={{ fontFamily: 'Satoshi, sans-serif', fontSize: 10, color: '#fafafa', width: 26, textAlign: 'right', flexShrink: 0 }}>{b.num}</span>
            </div>
          ))}
        </div>

        <div style={{ borderTop: '1px dashed #2a2a2a', marginBottom: 14 }} />

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
          {c.reasons.map(([label, color], i) => (
            <span key={label} style={{
              border: `2px solid ${color}`, padding: '3px 7px', color,
              fontSize: 9, fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase',
              transform: `rotate(${i % 2 === 0 ? '-1.5deg' : '1deg'})`,
              display: 'inline-flex', alignItems: 'center',
            }}>{label}</span>
          ))}
        </div>
      </div>

      <div style={{ padding: '10px 20px', borderTop: '2px solid #2a2a2a', background: '#0f0f0f', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#888880' }}>
          {isSignup ? `New · ${c.forRole} · ${c.forPassport} passport` : `For ${c.forName} · ${c.forRole} · ${c.forPassport} passport`}
        </span>
        <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: isSignup ? '#facc15' : '#00ffd5' }}>
          {isSignup ? 'found' : 'live'}
        </span>
      </div>
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function SignInClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const next = searchParams.get('next') ?? '/profile'

  const [tab, setTab] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [btnReady, setBtnReady] = useState(false)
  const [hoveredDot, setHoveredDot] = useState<string | null>(null)

  const [cardIdx, setCardIdx] = useState(0)
  const [fading, setFading] = useState(false)

  // Typewriter
  const signinText  = 'Still\nsearching?'
  const signupText  = 'Somewhere\na version\nof you\nalready\nmoved.'
  const { displayed: twText, done: twDone } = useTypewriter(
    tab === 'signin' ? signinText : signupText, 36
  )

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) router.push(next)
    })
  }, [next, router])

  // Card cycling
  useEffect(() => {
    const t = setInterval(() => {
      setFading(true)
      setTimeout(() => { setCardIdx(i => (i + 1) % COUNTRIES.length); setFading(false) }, 350)
    }, 4500)
    return () => clearInterval(t)
  }, [])

  // Button ready pulse when both fields filled
  useEffect(() => {
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    const pwOk = password.length >= 8
    if (emailOk && pwOk && !btnReady) {
      setBtnReady(true)
    } else if (!emailOk || !pwOk) {
      setBtnReady(false)
    }
  }, [email, password])

  const strength = passwordStrength(password)
  const passwordTooShort = tab === 'signup' && password.length > 0 && password.length < 8
  const passwordTooLong  = tab === 'signup' && password.length > 16
  const passwordInvalid  = passwordTooShort || passwordTooLong
  const submitDisabled   = loading || (tab === 'signup' && passwordInvalid)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (submitDisabled) return
    setLoading(true); setError(''); setSuccess('')

    if (tab === 'signin') {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        setError(error.message.toLowerCase().includes('email not confirmed')
          ? 'Please confirm your email before signing in. Check your inbox.'
          : 'Invalid email or password.')
      } else {
        router.push(next)
      }
    } else {
      const { data, error } = await supabase.auth.signUp({ email, password })
      if (error) {
        const msg = error.message.toLowerCase()
        if (msg.includes('already registered') || msg.includes('already exists') || msg.includes('user already') || msg.includes('email already')) {
          setError('An account with this email already exists.'); setTab('signin')
        } else { setError(error.message) }
      } else if (data.user && data.user.identities?.length === 0) {
        setError('An account with this email already exists.'); setTab('signin')
      } else {
        setSuccess('Account created! Check your email to confirm before signing in.')
      }
    }
    setLoading(false)
  }

  const handleGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}` },
    })
  }

  const switchTab = (t: 'signin' | 'signup') => {
    setTab(t); setError(''); setSuccess('')
  }

  return (
    <div style={{ minHeight: '100vh', display: 'grid', gridTemplateColumns: '1fr 1fr', background: '#0a0a0a', color: '#fafafa' }}
      className="auth-grid">

      <style>{`
        @keyframes driftL { from{transform:translateX(0)} to{transform:translateX(-12%)} }
        @keyframes driftR { from{transform:translateX(-12%)} to{transform:translateX(0)} }
        @keyframes pulse  { 0%,100%{opacity:1} 50%{opacity:0.35} }
        @keyframes btnpulse { 0%{box-shadow:3px 3px 0 #fafafa} 50%{box-shadow:3px 3px 0 #00ffd5,0 0 20px rgba(0,255,213,0.3)} 100%{box-shadow:3px 3px 0 #fafafa} }
        @keyframes dotpulse { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.5);opacity:0.6} }
        @keyframes scanline { 0%{top:-4px} 100%{top:100%} }
        @media(max-width:1024px){.auth-grid{grid-template-columns:1fr!important}.auth-right{display:none!important}}
        .geo-dot:hover .geo-tooltip{opacity:1!important;transform:translateY(0)!important}
        input::placeholder{color:#444}
      `}</style>

      {/* ══ LEFT: FORM ══ */}
      <div style={{ display: 'flex', flexDirection: 'column', padding: '32px 40px 32px', position: 'relative', overflow: 'hidden' }}>

        {/* Ghost country watermark */}
        <div style={{
          position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
          pointerEvents: 'none', overflow: 'hidden', zIndex: 0,
          opacity: fading ? 0 : 0.028,
          transition: 'opacity 0.4s ease',
        }}>
          <span style={{
            fontFamily: 'var(--font-heading, sans-serif)',
            fontSize: 'clamp(80px, 18vw, 160px)',
            fontWeight: 900, letterSpacing: '-0.03em',
            textTransform: 'uppercase', color: '#00ffd5',
            whiteSpace: 'nowrap',
            filter: 'blur(2px)',
          }}>
            {COUNTRIES[cardIdx].ghost}
          </span>
        </div>

        {/* Logo */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', position: 'relative', zIndex: 1, marginBottom: 'auto' }}>
          <div style={{ width: 14, height: 14, background: '#00ffd5', border: '2px solid #fafafa', flexShrink: 0 }} />
          <span style={{ fontFamily: 'var(--font-heading, sans-serif)', fontSize: 15, fontWeight: 900, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Origio</span>
        </Link>

        {/* Form centred */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', position: 'relative', zIndex: 1 }}>
          <div style={{ width: '100%', maxWidth: 400, margin: '0 auto' }}>

            {/* Eyebrow */}
            <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#888880', marginBottom: 12 }}>
              {tab === 'signin' ? 'Welcome back.' : 'Welcome to Origio.'}
            </p>

            {/* Typewriter headline */}
            <h1 style={{
              fontFamily: 'var(--font-heading, sans-serif)',
              fontSize: tab === 'signup' ? 'clamp(28px, 4vw, 36px)' : 'clamp(36px, 5vw, 48px)',
              fontWeight: 900, letterSpacing: '-0.025em', lineHeight: 1.0,
              textTransform: 'uppercase', marginBottom: 16,
              minHeight: tab === 'signup' ? '160px' : '100px',
              whiteSpace: 'pre-line',
              transition: 'font-size 0.2s ease',
            }}>
              {twText}
              <span style={{
                display: 'inline-block', width: 3, height: '0.85em',
                background: '#00ffd5', verticalAlign: 'text-bottom',
                marginLeft: 3,
                opacity: twDone ? 0 : 1,
                animation: twDone ? 'none' : 'pulse 0.8s ease-in-out infinite',
              }} />
            </h1>

            <p style={{ fontSize: 13, color: '#888880', lineHeight: 1.6, marginBottom: 28 }}>
              {tab === 'signin'
                ? "Your data didn't go anywhere. Sign in to access your matches."
                : 'Free to start. Just your job, your passport, and your priorities.'}
            </p>

            {/* Tab switcher */}
            <div style={{ display: 'flex', border: '2px solid #2a2a2a', marginBottom: 16 }}>
              {(['signin', 'signup'] as const).map((t) => (
                <button key={t} onClick={() => switchTab(t)} style={{
                  flex: 1, padding: '11px 0',
                  fontFamily: 'var(--font-heading, sans-serif)',
                  fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em',
                  background: tab === t ? '#1a1a1a' : 'transparent',
                  color: tab === t ? '#fafafa' : '#555',
                  border: 'none', cursor: 'pointer', transition: 'all 0.15s',
                }}>
                  {t === 'signin' ? 'Sign In' : 'Create Account'}
                </button>
              ))}
            </div>

            {/* Inputs */}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 14 }}>

              {/* Email */}
              <div style={{ position: 'relative' }}>
                <svg style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', width: 14, height: 14, color: '#555' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="4" width="20" height="16" rx="0"/><path d="M22 7l-10 6L2 7"/>
                </svg>
                <input type="email" placeholder="you@email.com" value={email}
                  onChange={e => setEmail(e.target.value)} required
                  style={{
                    width: '100%', paddingLeft: 40, paddingRight: 14, paddingTop: 13, paddingBottom: 13,
                    background: '#0f0f0f', border: '2px solid #2a2a2a', color: '#fafafa',
                    fontSize: 14, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit',
                    transition: 'border-color 0.12s',
                  }}
                  onFocus={e => e.target.style.borderColor = '#00ffd5'}
                  onBlur={e => e.target.style.borderColor = '#2a2a2a'}
                />
              </div>

              {/* Password */}
              <div>
                <div style={{ position: 'relative' }}>
                  <svg style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', width: 14, height: 14, color: '#555' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="0"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    maxLength={tab === 'signup' ? 16 : undefined}
                    style={{
                      width: '100%', paddingLeft: 40, paddingRight: 42, paddingTop: 13, paddingBottom: 13,
                      background: '#0f0f0f',
                      border: `2px solid ${passwordInvalid ? '#f87171' : '#2a2a2a'}`,
                      color: '#fafafa', fontSize: 14, outline: 'none',
                      boxSizing: 'border-box', fontFamily: 'inherit', transition: 'border-color 0.12s',
                    }}
                    onFocus={e => { if (!passwordInvalid) e.target.style.borderColor = '#00ffd5' }}
                    onBlur={e => { if (!passwordInvalid) e.target.style.borderColor = '#2a2a2a' }}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#555', padding: 0 }}>
                    {showPassword ? <EyeOff style={{ width: 14, height: 14 }} /> : <Eye style={{ width: 14, height: 14 }} />}
                  </button>
                </div>

                {/* Password strength bar (signup only) */}
                {tab === 'signup' && (
                  <div style={{ marginTop: 6 }}>
                    <div style={{ height: 3, background: '#1a1a1a', position: 'relative', overflow: 'hidden' }}>
                      <div style={{
                        position: 'absolute', left: 0, top: 0, bottom: 0,
                        width: strength.pct + '%',
                        background: strength.color,
                        transition: 'width 0.4s cubic-bezier(.2,.8,.2,1), background 0.3s ease',
                      }} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                      <span style={{ fontSize: 10, color: passwordInvalid ? '#f87171' : strength.color, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                        {passwordInvalid
                          ? (passwordTooLong ? `too long (${password.length}/16)` : `too short (${password.length}/8)`)
                          : strength.label}
                      </span>
                      {!passwordInvalid && password.length > 0 && (
                        <span style={{ fontSize: 10, color: '#555', fontFamily: 'Satoshi, sans-serif' }}>{password.length}/16</span>
                      )}
                    </div>
                  </div>
                )}

                {tab === 'signin' && (
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 6 }}>
                    <Link href="/auth/forgot-password"
                      style={{ fontSize: 10, fontWeight: 700, color: '#555', textDecoration: 'none', letterSpacing: '0.08em', textTransform: 'uppercase' }}
                      onMouseEnter={e => (e.currentTarget.style.color = '#00ffd5')}
                      onMouseLeave={e => (e.currentTarget.style.color = '#555')}>
                      Forgot password?
                    </Link>
                  </div>
                )}
              </div>

              {error   && <p style={{ fontSize: 12, color: '#f87171', fontWeight: 600, margin: '2px 0' }}>{error}</p>}
              {success && <p style={{ fontSize: 12, color: '#4ade80', fontWeight: 600, margin: '2px 0' }}>{success}</p>}

              {/* Submit */}
              <button type="submit" disabled={submitDisabled}
                style={{
                  width: '100%', padding: '14px 0',
                  background: submitDisabled ? '#111' : '#00ffd5',
                  color: submitDisabled ? '#333' : '#0a0a0a',
                  border: `2px solid ${submitDisabled ? '#1a1a1a' : '#00ffd5'}`,
                  boxShadow: submitDisabled ? 'none' : '3px 3px 0 #fafafa',
                  fontSize: 12, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase',
                  cursor: submitDisabled ? 'not-allowed' : 'pointer',
                  fontFamily: 'inherit',
                  animation: btnReady && !submitDisabled ? 'btnpulse 1.5s ease-in-out 1' : 'none',
                  transition: 'background 0.15s, color 0.15s, border-color 0.15s, box-shadow 0.15s',
                }}>
                {loading ? 'Please wait…' : tab === 'signin' ? 'Sign in →' : 'Create Account →'}
              </button>
            </form>

            {/* Divider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '16px 0' }}>
              <div style={{ flex: 1, height: 1, background: '#1a1a1a' }} />
              <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#444' }}>or</span>
              <div style={{ flex: 1, height: 1, background: '#1a1a1a' }} />
            </div>

            {/* Google */}
            <button onClick={handleGoogle}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                padding: '13px 0', background: 'transparent', border: '2px solid #2a2a2a',
                color: '#555', fontSize: 12, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase',
                cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.12s',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#fafafa'; e.currentTarget.style.color = '#fafafa' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#2a2a2a'; e.currentTarget.style.color = '#555' }}>
              <svg style={{ width: 14, height: 14 }} viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>

            <p style={{ textAlign: 'center', fontSize: 10, color: '#444', marginTop: 20, lineHeight: 1.6 }}>
              By continuing you agree to our{' '}
              <Link href="/terms" style={{ color: '#888', textDecoration: 'underline', textUnderlineOffset: 2 }}>Terms</Link>
              {' '}and{' '}
              <Link href="/privacy" style={{ color: '#888', textDecoration: 'underline', textUnderlineOffset: 2 }}>Privacy Policy</Link>.
            </p>
          </div>
        </div>

        <p style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#333', position: 'relative', zIndex: 1 }}>
          Origio · 2026 · All findings personalised.
        </p>
      </div>

      {/* ══ RIGHT: ART PANEL ══ */}
      <div className="auth-right" style={{
        display: 'flex', flexDirection: 'column', padding: 36, position: 'relative', overflow: 'hidden',
        background: 'radial-gradient(ellipse at 30% 0%, rgba(0,255,213,0.09), transparent 55%), radial-gradient(ellipse at 80% 100%, rgba(0,255,213,0.05), transparent 50%), #0d0d0d',
      }}>

        {/* Grid lines */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.022) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.022) 1px, transparent 1px)',
          backgroundSize: '52px 52px',
          maskImage: 'radial-gradient(ellipse at center, #000 25%, transparent 72%)',
        }} />

        {/* Radar rings */}
        <svg style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', width: 680, height: 680, opacity: 0.3, pointerEvents: 'none' }} viewBox="0 0 680 680">
          {[70,130,190,250,310,335].map((r, i) => (
            <circle key={r} cx="340" cy="340" r={r} fill="none"
              stroke={i === 2 ? 'rgba(0,255,213,0.5)' : '#1a1a1a'}
              strokeWidth={i === 2 ? 1 : 0.8}
              strokeDasharray={i === 2 ? '3 8' : '0'}
            />
          ))}
          <line x1="10" y1="340" x2="670" y2="340" stroke="#1a1a1a" strokeWidth="0.8"/>
          <line x1="340" y1="10" x2="340" y2="670" stroke="#1a1a1a" strokeWidth="0.8"/>
        </svg>

        {/* Floating geo dots */}
        {GEO_DOTS.map((dot) => (
          <div key={dot.label} className="geo-dot" style={{
            position: 'absolute', top: dot.top, left: dot.left,
            zIndex: 8, cursor: 'default',
          }}
            onMouseEnter={() => setHoveredDot(dot.label)}
            onMouseLeave={() => setHoveredDot(null)}
          >
            <div style={{
              width: 28, height: 28, borderRadius: '50%',
              border: '1.5px solid rgba(0,255,213,0.4)',
              background: 'rgba(0,255,213,0.06)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 14,
              animation: `dotpulse 3s ease-in-out infinite`,
              animationDelay: dot.delay,
            }}>
              {dot.flag}
            </div>
            {/* Tooltip */}
            <div className="geo-tooltip" style={{
              position: 'absolute', bottom: '120%', left: '50%', transform: 'translateX(-50%) translateY(4px)',
              background: '#0f0f0f', border: '1px solid #2a2a2a',
              padding: '4px 10px', whiteSpace: 'nowrap',
              fontFamily: 'Satoshi, sans-serif', fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase',
              color: '#00ffd5',
              opacity: hoveredDot === dot.label ? 1 : 0,
              transition: 'opacity 0.15s, transform 0.15s',
              pointerEvents: 'none',
            }}>
              {dot.label}
            </div>
          </div>
        ))}

        {/* Country wallpaper text */}
        <div style={{
          position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
          justifyContent: 'center', pointerEvents: 'none', userSelect: 'none',
          maskImage: 'linear-gradient(180deg, transparent 0%, #000 15%, #000 85%, transparent 100%)',
        }}>
          {ROWS.map((row, i) => (
            <div key={i} style={{
              fontFamily: 'var(--font-heading, sans-serif)',
              fontSize: 'clamp(36px, 4.8vw, 64px)',
              fontWeight: 900, letterSpacing: '-0.02em', textTransform: 'uppercase',
              whiteSpace: 'nowrap', padding: '4px 0',
              color: row.solid ? 'rgba(255,255,255,0.035)' : 'transparent',
              WebkitTextStroke: row.solid ? '0' : '1px rgba(255,255,255,0.055)',
              animation: `${row.dir === 'l' ? 'driftL' : 'driftR'} ${42 + i * 6}s linear infinite`,
            }}>
              {row.text}
            </div>
          ))}
        </div>

        {/* Scanline effect */}
        <div style={{
          position: 'absolute', left: 0, right: 0, height: 2, zIndex: 6,
          background: 'linear-gradient(90deg, transparent, rgba(0,255,213,0.15), transparent)',
          animation: 'scanline 8s linear infinite',
          pointerEvents: 'none',
        }} />

        {/* Live dot */}
        <div style={{ position: 'relative', zIndex: 10, display: 'flex', alignItems: 'center', gap: 8, marginBottom: 'auto' }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ade80', boxShadow: '0 0 8px rgba(74,222,128,0.6)', animation: 'pulse 2s ease-in-out infinite' }} />
          <p style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#888880' }}>Live · 25 countries scored</p>
        </div>

        {/* Cycling card */}
        <div style={{ position: 'relative', zIndex: 10, flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <CyclingCard idx={cardIdx} fading={fading} isSignup={tab === 'signup'} />
        </div>

        {/* Pullquote */}
        <div style={{ position: 'relative', zIndex: 10, maxWidth: 400 }}>
          <p style={{ fontFamily: 'var(--font-heading, sans-serif)', fontSize: 20, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-0.01em', lineHeight: 1.1, marginBottom: 10 }}>
            Where would your <span style={{ color: '#00ffd5' }}>salary stretch furthest?</span>
          </p>
          <p style={{ fontSize: 11, color: '#888880', lineHeight: 1.6 }}>
            Origio scores 25 countries against your role, passport, and priorities.
          </p>
        </div>

        {/* Coord ticker */}
        <div style={{
          position: 'absolute', bottom: 16, left: 16, right: 16,
          display: 'flex', justifyContent: 'space-between',
          fontFamily: 'Satoshi, sans-serif', fontSize: 9, color: '#333', letterSpacing: '0.1em',
          textTransform: 'uppercase', pointerEvents: 'none', zIndex: 10,
          opacity: fading ? 0 : 1, transition: 'opacity 0.35s ease',
        }}>
          <span>51.5074° N · 0.1278° W</span>
          <span>→</span>
          <span>{COUNTRIES[cardIdx].coord}</span>
        </div>
      </div>
    </div>
  )
}