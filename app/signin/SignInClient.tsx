'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Eye, EyeOff } from 'lucide-react'

// ── Cycling country data (exact from design HTML) ─────────────────────────
const COUNTRIES = [
  {
    flag: '🇨🇭', name: 'Switzerland', score: 92, scoreColor: '#4ade80',
    salary: 'CHF 9,620', visa: 'EU/EFTA', safety: '9.3', safetyColor: '#4ade80',
    bars: { salary: 96, safety: 93, health: 88, afford: 42 },
    nums: { salary: '9.6', safety: '9.3', health: '8.8', afford: '4.2' },
    coord: '47.3769° N · 8.5417° E',
    reasons: [['★ Salary fit', '#00ffd5'], ['★ Safety', '#4ade80'], ['★ Easy visa', '#fafafa']] as [string, string][],
  },
  {
    flag: '🇩🇰', name: 'Denmark', score: 88, scoreColor: '#4ade80',
    salary: 'DKK 48,200', visa: 'Pay limit', safety: '9.0', safetyColor: '#4ade80',
    bars: { salary: 88, safety: 90, health: 92, afford: 64 },
    nums: { salary: '8.8', safety: '9.0', health: '9.2', afford: '6.4' },
    coord: '55.6761° N · 12.5683° E',
    reasons: [['★ Healthcare', '#4ade80'], ['★ Work-life', '#fafafa'], ['★ Bike city', '#00ffd5']] as [string, string][],
  },
  {
    flag: '🇳🇱', name: 'Netherlands', score: 85, scoreColor: '#facc15',
    salary: '€ 5,840', visa: '30% ruling', safety: '8.5', safetyColor: '#4ade80',
    bars: { salary: 82, safety: 85, health: 86, afford: 58 },
    nums: { salary: '8.2', safety: '8.5', health: '8.6', afford: '5.8' },
    coord: '52.3676° N · 4.9041° E',
    reasons: [['★ 30% ruling', '#00ffd5'], ['★ English-friendly', '#fafafa'], ['★ Connected', '#4ade80']] as [string, string][],
  },
  {
    flag: '🇵🇹', name: 'Portugal', score: 81, scoreColor: '#facc15',
    salary: '€ 3,140', visa: 'D7 / D8', safety: '8.2', safetyColor: '#4ade80',
    bars: { salary: 62, safety: 82, health: 80, afford: 88 },
    nums: { salary: '6.2', safety: '8.2', health: '8.0', afford: '8.8' },
    coord: '38.7223° N · 9.1393° W',
    reasons: [['★ Affordable', '#4ade80'], ['★ Climate', '#fafafa'], ['★ Digital nomad', '#00ffd5']] as [string, string][],
  },
]

function barColor(pct: number) {
  if (pct >= 75) return '#4ade80'
  if (pct >= 50) return '#facc15'
  return '#f87171'
}

// ── Cycling product card ──────────────────────────────────────────────────
function CyclingCard() {
  const [idx, setIdx] = useState(0)
  const [fading, setFading] = useState(false)

  useEffect(() => {
    const t = setInterval(() => {
      setFading(true)
      setTimeout(() => {
        setIdx(i => (i + 1) % COUNTRIES.length)
        setFading(false)
      }, 350)
    }, 4200)
    return () => clearInterval(t)
  }, [])

  const c = COUNTRIES[idx]

  return (
    <div style={{
      opacity: fading ? 0 : 1,
      transform: fading ? 'translateY(6px)' : 'translateY(0)',
      transition: 'opacity 0.35s ease, transform 0.35s ease',
      background: '#0a0a0a',
      border: '2px solid #2a2a2a',
      boxShadow: '6px 6px 0 #00ffd5',
      width: 380,
      maxWidth: '100%',
    }}>
      {/* Card head */}
      <div style={{ padding: '10px 20px', borderBottom: '2px solid #2a2a2a', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#888880' }}>Your top match</span>
        <span style={{ fontFamily: 'monospace', fontSize: 10, color: '#888880', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Sample</span>
      </div>

      {/* Card body */}
      <div style={{ padding: 20 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 20 }}>
          <span style={{ fontSize: 64, lineHeight: 1 }}>{c.flag}</span>
          <div>
            <p style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#888880', marginBottom: 4 }}>#01</p>
            <p style={{ fontFamily: 'var(--font-heading, sans-serif)', fontSize: 26, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-0.02em', lineHeight: 1, color: '#fafafa' }}>{c.name}</p>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginTop: 10 }}>
              <span style={{ fontFamily: 'var(--font-heading, sans-serif)', fontSize: 44, fontWeight: 900, lineHeight: 1, color: c.scoreColor }}>{c.score}</span>
              <span style={{ color: '#888880', fontSize: 14, fontWeight: 700 }}>% match</span>
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', border: '2px solid #1a1a1a', marginBottom: 20 }}>
          {[
            { label: 'Take-home', val: c.salary, color: '#00ffd5' },
            { label: 'Visa',      val: c.visa,   color: '#fafafa' },
            { label: 'Safety',    val: c.safety,  color: c.safetyColor },
          ].map((s, i) => (
            <div key={s.label} style={{ padding: 12, borderRight: i < 2 ? '2px solid #1a1a1a' : 'none' }}>
              <p style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#888880', marginBottom: 4 }}>{s.label}</p>
              <p style={{ fontFamily: 'var(--font-heading, sans-serif)', fontSize: 13, fontWeight: 900, color: s.color }}>{s.val}</p>
            </div>
          ))}
        </div>

        {/* Priority bars */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
          {[
            { label: 'Salary',       pct: c.bars.salary, num: c.nums.salary },
            { label: 'Safety',       pct: c.bars.safety, num: c.nums.safety },
            { label: 'Healthcare',   pct: c.bars.health, num: c.nums.health },
            { label: 'Affordability',pct: c.bars.afford, num: c.nums.afford },
          ].map(b => (
            <div key={b.label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#888880', width: 80, flexShrink: 0 }}>{b.label}</span>
              <div style={{ flex: 1, height: 4, background: '#1a1a1a', position: 'relative' }}>
                <span style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: b.pct + '%', background: barColor(b.pct), transition: 'width 0.8s cubic-bezier(.2,.8,.2,1)' }} />
              </div>
              <span style={{ fontFamily: 'monospace', fontSize: 11, color: '#fafafa', width: 28, textAlign: 'right', flexShrink: 0 }}>{b.num}</span>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div style={{ borderTop: '1px dashed #2a2a2a', marginBottom: 16 }} />

        {/* Reason stamps */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {c.reasons.map(([label, color]) => (
            <span key={label} style={{
              border: `2px solid ${color}`, padding: '4px 8px', color,
              fontSize: 10, fontWeight: 800, letterSpacing: '0.16em', textTransform: 'uppercase',
              display: 'inline-flex', alignItems: 'center',
              transform: `rotate(${Math.random() > 0.5 ? '-1.5deg' : '1deg'})`,
            }}>{label}</span>
          ))}
        </div>
      </div>

      {/* Card foot */}
      <div style={{ padding: '10px 20px', borderTop: '2px solid #2a2a2a', background: '#0f0f0f', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#888880' }}>For Aoife · PM · IE passport</span>
        <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#00ffd5' }}>live</span>
      </div>
    </div>
  )
}

// ── Art panel background ──────────────────────────────────────────────────
const ROWS = [
  { text: 'Portugal · Denmark · Netherlands · Germany ·', solid: false, dir: 'l', accent: null },
  { text: 'Spain · ', solid: true,  dir: 'r', accent: 'Switzerland' },
  { text: 'Sweden · Canada · Singapore · Japan ·',        solid: false, dir: 'l', accent: null },
  { text: 'Estonia · France · Finland · Australia ·',     solid: true,  dir: 'r', accent: null },
  { text: 'New Zealand · UK · Iceland · Belgium ·',       solid: false, dir: 'l', accent: null },
  { text: 'Czechia · Italy · Greece · Mexico · UAE ·',    solid: true,  dir: 'r', accent: null },
]

// ── Main component ────────────────────────────────────────────────────────
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

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) router.push(next)
    })
  }, [next, router])

  const passwordTooShort = tab === 'signup' && password.length > 0 && password.length < 8
  const passwordTooLong  = tab === 'signup' && password.length > 16
  const passwordInvalid  = passwordTooShort || passwordTooLong
  const submitDisabled   = loading || (tab === 'signup' && passwordInvalid)

  const passwordHint = () => {
    if (passwordTooLong)  return `Too long — max 16 characters (${password.length}/16)`
    if (passwordTooShort) return `Too short — min 8 characters (${password.length}/8)`
    if (tab === 'signup' && password.length > 0) return `${password.length}/16`
    return null
  }

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
          setError('An account with this email already exists.')
          setTab('signin')
        } else {
          setError(error.message)
        }
      } else if (data.user && data.user.identities?.length === 0) {
        setError('An account with this email already exists.')
        setTab('signin')
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

  return (
    <div className="min-h-screen grid lg:grid-cols-2" style={{ background: '#0a0a0a', color: '#fafafa' }}>

      {/* ── LEFT: FORM ── */}
      <div className="flex flex-col px-6 sm:px-10 py-8 lg:py-10">

        {/* Logo */}
        <a href="/" className="flex items-center gap-2" style={{ opacity: 1 }}>
          <div style={{ width: 14, height: 14, background: '#00ffd5', border: '2px solid #fafafa', flexShrink: 0 }} />
          <span style={{ fontFamily: 'var(--font-heading, sans-serif)', fontSize: 15, fontWeight: 900, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Origio</span>
        </a>

        {/* Form centred */}
        <div className="flex-1 flex items-center">
          <div className="w-full" style={{ maxWidth: 400, margin: '0 auto' }}>

            <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#888880', marginBottom: 8 }}>Welcome back</p>
            <h1 style={{ fontFamily: 'var(--font-heading, sans-serif)', fontSize: 40, fontWeight: 900, letterSpacing: '-0.02em', lineHeight: 1.0, textTransform: 'uppercase', marginBottom: 16 }}>
              Find where<br />you <span style={{ color: '#00ffd5' }}>belong.</span>
            </h1>
            <p style={{ fontSize: 13, color: '#888880', lineHeight: 1.6, maxWidth: 360, marginBottom: 32 }}>
              Sign in to pick up your wizard answers, saved countries, and personalised reports.
            </p>

            {/* Tab switcher */}
            <div style={{ display: 'flex', border: '2px solid #2a2a2a', background: '#0f0f0f', marginBottom: 16 }}>
              {(['signin', 'signup'] as const).map((t) => (
                <button key={t}
                  onClick={() => { setTab(t); setError(''); setSuccess('') }}
                  style={{
                    flex: 1, padding: '12px 0',
                    fontFamily: 'var(--font-heading, sans-serif)',
                    fontSize: 13, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em',
                    background: tab === t ? '#1a1a1a' : 'transparent',
                    color: tab === t ? '#fafafa' : '#888880',
                    border: tab === t ? '2px solid #2a2a2a' : '2px solid transparent',
                    cursor: 'pointer', transition: 'all 0.12s ease',
                  }}>
                  {t === 'signin' ? 'Sign In' : 'Create Account'}
                </button>
              ))}
            </div>

            {/* Inputs */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
              {/* Email */}
              <div style={{ position: 'relative' }}>
                <svg style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: '#888880' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="4" width="20" height="16" rx="0"/><path d="M22 7l-10 6L2 7"/>
                </svg>
                <input type="email" placeholder="you@email.com" value={email}
                  onChange={e => setEmail(e.target.value)} required
                  style={{
                    width: '100%', paddingLeft: 44, paddingRight: 16, paddingTop: 14, paddingBottom: 14,
                    background: '#0f0f0f', border: '2px solid #2a2a2a', color: '#fafafa',
                    fontSize: 14, outline: 'none', boxSizing: 'border-box', fontWeight: 500, fontFamily: 'inherit',
                    transition: 'border-color 0.12s ease',
                  }}
                  onFocus={e => (e.target.style.borderColor = '#00ffd5')}
                  onBlur={e => (e.target.style.borderColor = '#2a2a2a')}
                />
              </div>

              {/* Password */}
              <div>
                <div style={{ position: 'relative' }}>
                  <svg style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: '#888880' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
                      width: '100%', paddingLeft: 44, paddingRight: 44, paddingTop: 14, paddingBottom: 14,
                      background: '#0f0f0f', border: `2px solid ${passwordInvalid ? '#f87171' : '#2a2a2a'}`,
                      color: '#fafafa', fontSize: 14, outline: 'none', boxSizing: 'border-box',
                      fontWeight: 500, fontFamily: 'inherit', transition: 'border-color 0.12s ease',
                    }}
                    onFocus={e => { if (!passwordInvalid) e.target.style.borderColor = '#00ffd5' }}
                    onBlur={e => { if (!passwordInvalid) e.target.style.borderColor = '#2a2a2a' }}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#888880', padding: 0 }}>
                    {showPassword ? <EyeOff style={{ width: 16, height: 16 }} /> : <Eye style={{ width: 16, height: 16 }} />}
                  </button>
                </div>
                {tab === 'signup' && (
                  <p style={{ fontSize: 11, marginTop: 4, color: passwordInvalid ? '#f87171' : '#888880' }}>
                    {password.length === 0 ? '8–16 characters' : passwordHint() ?? `${password.length}/16`}
                  </p>
                )}
                {tab === 'signin' && (
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 6 }}>
                    <Link href="/auth/forgot-password"
                      style={{ fontSize: 11, fontWeight: 700, color: '#888880', textDecoration: 'none', letterSpacing: '0.08em', textTransform: 'uppercase' }}
                      onMouseEnter={e => (e.currentTarget.style.color = '#00ffd5')}
                      onMouseLeave={e => (e.currentTarget.style.color = '#888880')}>
                      Forgot password?
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {error   && <p style={{ fontSize: 12, color: '#f87171', fontWeight: 600, marginBottom: 12 }}>{error}</p>}
            {success && <p style={{ fontSize: 12, color: '#4ade80', fontWeight: 600, marginBottom: 12 }}>{success}</p>}

            {/* CTA */}
            <button type="button" onClick={handleSubmit as any} disabled={submitDisabled}
              style={{
                width: '100%', padding: '14px 0',
                background: submitDisabled ? '#1a1a1a' : '#00ffd5',
                color: submitDisabled ? '#444' : '#0a0a0a',
                border: `2px solid ${submitDisabled ? '#1a1a1a' : '#00ffd5'}`,
                boxShadow: submitDisabled ? 'none' : '3px 3px 0 #fafafa',
                fontSize: 13, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase',
                cursor: submitDisabled ? 'not-allowed' : 'pointer',
                transition: 'all 0.12s ease', fontFamily: 'inherit',
              }}>
              {loading ? 'Please wait...' : tab === 'signin' ? 'Sign in →' : 'Create Account →'}
            </button>

            {/* Divider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0' }}>
              <div style={{ flex: 1, height: 2, background: '#1a1a1a' }} />
              <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#888880' }}>or</span>
              <div style={{ flex: 1, height: 2, background: '#1a1a1a' }} />
            </div>

            {/* Google */}
            <button onClick={handleGoogle}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
                padding: '14px 0', background: 'transparent', border: '2px solid #2a2a2a',
                color: '#888880', fontSize: 13, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase',
                cursor: 'pointer', transition: 'all 0.12s ease', fontFamily: 'inherit',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#fafafa'; e.currentTarget.style.color = '#fafafa' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#2a2a2a'; e.currentTarget.style.color = '#888880' }}>
              <svg style={{ width: 16, height: 16 }} viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>

            <p style={{ textAlign: 'center', fontSize: 11, color: '#888880', marginTop: 24, lineHeight: 1.6 }}>
              By continuing you agree to our{' '}
              <Link href="/terms" style={{ color: '#fafafa', textDecoration: 'underline', textUnderlineOffset: 2 }}>Terms</Link>
              {' '}and{' '}
              <Link href="/privacy" style={{ color: '#fafafa', textDecoration: 'underline', textUnderlineOffset: 2 }}>Privacy Policy</Link>.
            </p>
          </div>
        </div>

        {/* Bottom */}
        <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#888880' }}>
          Origio · 2026 · All findings personalised.
        </p>
      </div>

      {/* ── RIGHT: ART PANEL ── */}
      <div className="hidden lg:flex flex-col p-10 relative overflow-hidden"
        style={{
          background: 'radial-gradient(ellipse at 30% 0%, rgba(0,255,213,0.10), transparent 60%), radial-gradient(ellipse at 80% 100%, rgba(0,255,213,0.06), transparent 55%), #0d0d0d',
          isolation: 'isolate',
        }}>

        {/* Faint grid */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)',
          backgroundSize: '56px 56px',
          maskImage: 'radial-gradient(ellipse at center, #000 30%, transparent 75%)',
        }} />

        {/* Concentric rings */}
        <svg style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', width: 720, height: 720, opacity: 0.35, pointerEvents: 'none' }} viewBox="0 0 720 720">
          <circle cx="360" cy="360" r="80"  fill="none" stroke="#1a1a1a" strokeWidth="1"/>
          <circle cx="360" cy="360" r="140" fill="none" stroke="#1a1a1a" strokeWidth="1"/>
          <circle cx="360" cy="360" r="200" fill="none" stroke="rgba(0,255,213,0.35)" strokeWidth="1" strokeDasharray="2 6"/>
          <circle cx="360" cy="360" r="260" fill="none" stroke="#1a1a1a" strokeWidth="1"/>
          <circle cx="360" cy="360" r="330" fill="none" stroke="#1a1a1a" strokeWidth="1"/>
          <line x1="20" y1="360" x2="700" y2="360" stroke="#1a1a1a" strokeWidth="1"/>
          <line x1="360" y1="20" x2="360" y2="700" stroke="#1a1a1a" strokeWidth="1"/>
        </svg>

        {/* Country name wallpaper */}
        <div style={{
          position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
          justifyContent: 'center', pointerEvents: 'none', userSelect: 'none',
          maskImage: 'linear-gradient(180deg, transparent 0%, #000 18%, #000 82%, transparent 100%)',
        }}>
          {ROWS.map((row, i) => (
            <div key={i} style={{
              fontFamily: 'var(--font-heading, sans-serif)',
              fontSize: 'clamp(42px, 5.4vw, 72px)',
              fontWeight: 900, letterSpacing: '-0.02em', textTransform: 'uppercase',
              whiteSpace: 'nowrap', padding: '6px 0',
              color: row.solid ? 'rgba(255,255,255,0.04)' : 'transparent',
              WebkitTextStroke: row.solid ? '0' : '1px rgba(255,255,255,0.07)',
              animation: `${row.dir === 'l' ? 'driftL' : 'driftR'} ${40 + i * 5}s linear infinite`,
            }}>
              {row.text}
              {row.accent && <span style={{ color: 'rgba(0,255,213,0.8)', WebkitTextStroke: 0 as any }}>{row.accent}</span>}
              {row.accent && ' · Ireland · Norway ·'}
            </div>
          ))}
        </div>

        {/* Live dot + eyebrow */}
        <div style={{ position: 'relative', zIndex: 10, display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 6, height: 6, borderRadius: '50%', background: '#4ade80',
            boxShadow: '0 0 8px rgba(74,222,128,0.6)',
            animation: 'pulse 2s ease-in-out infinite',
          }} />
          <p style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#888880' }}>
            Live · 25 countries scored
          </p>
        </div>

        {/* Cycling card — centred */}
        <div style={{ position: 'relative', zIndex: 10, flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <CyclingCard />
        </div>

        {/* Bottom pullquote */}
        <div style={{ position: 'relative', zIndex: 10, maxWidth: 420 }}>
          <p style={{ fontFamily: 'var(--font-heading, sans-serif)', fontSize: 24, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-0.01em', lineHeight: 1.05, marginBottom: 12 }}>
            Where would your <span style={{ color: '#00ffd5' }}>salary stretch the furthest?</span>
          </p>
          <p style={{ fontSize: 12, color: '#888880', lineHeight: 1.6 }}>
            Origio scores 25 countries against your role, passport, and priorities — so you can stop guessing where to move next.
          </p>
        </div>

        {/* Coordinate ticker */}
        <div style={{
          position: 'absolute', bottom: 18, left: 18, right: 18,
          display: 'flex', justifyContent: 'space-between',
          fontFamily: 'monospace', fontSize: 10, color: '#444', letterSpacing: '0.1em', textTransform: 'uppercase',
          pointerEvents: 'none', zIndex: 10,
        }}>
          <span>51.5074° N · 0.1278° W</span>
          <span>→</span>
          <span>47.3769° N · 8.5417° E</span>
        </div>

        <style>{`
          @keyframes driftL { from { transform: translateX(0); } to { transform: translateX(-12%); } }
          @keyframes driftR { from { transform: translateX(-12%); } to { transform: translateX(0); } }
          @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.35; } }
        `}</style>
      </div>
    </div>
  )
}