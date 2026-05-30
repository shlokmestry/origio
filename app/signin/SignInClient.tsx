'use client'
import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff } from 'lucide-react'
import { supabase } from '@/lib/supabase'

function passwordStrength(pw: string): { pct: number; label: string; color: string } {
  if (pw.length === 0) return { pct: 0,   label: '',                color: '#e5e5e5' }
  if (pw.length < 6)   return { pct: 20,  label: 'Too weak',        color: '#ef4444' }
  if (pw.length < 8)   return { pct: 40,  label: 'Fair',            color: '#f59e0b' }
  if (pw.length < 12)  return { pct: 65,  label: 'Good',            color: '#22c55e' }
  if (pw.length < 15)  return { pct: 85,  label: 'Strong',          color: '#4de6cc' }
  return                      { pct: 100, label: 'Very strong',     color: '#818cf8' }
}

export default function SignInClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const next = searchParams.get('next') ?? '/profile'

  const [tab, setTab]               = useState<'signin' | 'signup'>('signin')
  const [email, setEmail]           = useState('')
  const [password, setPassword]     = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState('')
  const [success, setSuccess]       = useState('')

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) router.push(next)
    })
  }, [next, router])

  const strength = passwordStrength(password)
  const passwordTooShort = tab === 'signup' && password.length > 0 && password.length < 8
  const passwordTooLong  = tab === 'signup' && password.length > 64
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
          ? 'Please confirm your email before signing in.'
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
        setSuccess('Account created! Check your email to confirm.')
        if (data.session) {
          fetch('/api/welcome-user', {
            method: 'POST',
            headers: { Authorization: `Bearer ${data.session.access_token}` },
          }).catch(() => {})
        }
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
    <div style={{ minHeight: '100vh', display: 'flex', background: '#f5f4f0' }}>
      <style>{`
        * { box-sizing: border-box; }
        .auth-input {
          width: 100%;
          padding: 13px 14px 13px 42px;
          background: #fff;
          border: 1.5px solid #e2e2dc;
          border-radius: 10px;
          font-size: 14px;
          font-family: 'Satoshi', sans-serif;
          color: #111;
          outline: none;
          transition: border-color 0.15s ease, box-shadow 0.15s ease;
        }
        .auth-input::placeholder { color: #aaa; }
        .auth-input:focus {
          border-color: #111;
          box-shadow: 0 0 0 3px rgba(0,0,0,0.06);
        }
        .auth-input.error { border-color: #ef4444; }
        .auth-btn-primary {
          width: 100%;
          padding: 14px;
          background: #111;
          color: #fff;
          border: none;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 700;
          font-family: 'Satoshi', sans-serif;
          cursor: pointer;
          transition: background 0.15s ease, transform 0.1s ease;
          letter-spacing: -0.01em;
        }
        .auth-btn-primary:hover:not(:disabled) { background: #222; }
        .auth-btn-primary:active:not(:disabled) { transform: scale(0.99); }
        .auth-btn-primary:disabled { background: #d4d4d0; cursor: not-allowed; }
        .auth-btn-google {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 13px;
          background: #fff;
          border: 1.5px solid #e2e2dc;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 600;
          font-family: 'Satoshi', sans-serif;
          color: #333;
          cursor: pointer;
          transition: border-color 0.15s ease, background 0.15s ease;
        }
        .auth-btn-google:hover { border-color: #bbb; background: #fafaf8; }
        .tab-btn {
          flex: 1;
          padding: 10px;
          background: transparent;
          border: none;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
          font-family: 'Satoshi', sans-serif;
          cursor: pointer;
          transition: background 0.15s ease, color 0.15s ease;
          color: #888;
        }
        .tab-btn.active { background: #fff; color: #111; box-shadow: 0 1px 4px rgba(0,0,0,0.08); }
        .tab-btn:not(.active):hover { color: #555; }
        @media (max-width: 900px) {
          .auth-left-panel { display: none !important; }
          .auth-right-panel { border-radius: 0 !important; max-width: 100% !important; padding: 32px 24px !important; }
        }
      `}</style>

      {/* ── Left: photo panel ── */}
      <div className="auth-left-panel" style={{
        flex: 1,
        position: 'relative',
        overflow: 'hidden',
        minWidth: 0,
      }}>
        {/* Airport photo */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/signin-bg.jpg"
          alt="Airport gate"
          style={{
            position: 'absolute', inset: 0, width: '100%', height: '100%',
            objectFit: 'cover', objectPosition: 'center',
          }}
        />

        {/* Dark overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.3) 40%, rgba(0,0,0,0.7) 100%)',
        }} />

        {/* Content over photo */}
        <div style={{ position: 'relative', zIndex: 2, height: '100%', display: 'flex', flexDirection: 'column', padding: '36px 40px' }}>
          {/* Logo */}
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
            <div style={{ width: 22, height: 22, background: '#fff', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <rect width="12" height="12" rx="2" fill="#0a0a0a"/>
                <circle cx="6" cy="6" r="3" fill="#fff"/>
              </svg>
            </div>
            <span style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontWeight: 800, fontSize: 15, color: '#fff', letterSpacing: '-0.02em' }}>Origio</span>
          </Link>

          {/* Bottom copy */}
          <div style={{ marginTop: 'auto' }}>
            <p style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontWeight: 800, fontSize: 'clamp(28px, 3.5vw, 44px)', color: '#fff', lineHeight: 1.1, letterSpacing: '-0.03em', marginBottom: 12 }}>
              Your next gate<br />is waiting.
            </p>
            <p style={{ fontFamily: "'Satoshi', sans-serif", fontSize: 15, color: 'rgba(255,255,255,0.65)', lineHeight: 1.6, maxWidth: 340 }}>
              Find the country where your salary, lifestyle, and visa all line up.
            </p>

            {/* Stats row */}
            <div style={{ display: 'flex', gap: 28, marginTop: 28 }}>
              {[
                { num: '25', label: 'Countries' },
                { num: '30+', label: 'Job roles' },
                { num: '100%', label: 'Personalised' },
              ].map(s => (
                <div key={s.label}>
                  <p style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontWeight: 800, fontSize: 22, color: '#4de6cc', lineHeight: 1, marginBottom: 3 }}>{s.num}</p>
                  <p style={{ fontFamily: "'Satoshi', sans-serif", fontSize: 11, color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Right: form panel ── */}
      <div className="auth-right-panel" style={{
        width: '100%',
        maxWidth: 520,
        background: '#fff',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: '0',
        padding: '48px 52px',
        position: 'relative',
        overflowY: 'auto',
      }}>

        {/* Top link */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 48 }}>
          <span style={{ fontSize: 13, color: '#888', fontFamily: "'Satoshi', sans-serif" }}>
            {tab === 'signin' ? "Don't have an account? " : 'Already have an account? '}
            <button
              onClick={() => switchTab(tab === 'signin' ? 'signup' : 'signin')}
              style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontSize: 13, fontWeight: 700, color: '#111', fontFamily: "'Satoshi', sans-serif" }}
            >
              {tab === 'signin' ? 'Sign up' : 'Sign in'}
            </button>
          </span>
        </div>

        {/* Form body — vertically centred */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>

          {/* Heading */}
          <h1 style={{
            fontFamily: "'Cabinet Grotesk', sans-serif",
            fontWeight: 800,
            fontSize: 'clamp(28px, 3vw, 36px)',
            color: '#111',
            letterSpacing: '-0.03em',
            lineHeight: 1.1,
            marginBottom: 8,
          }}>
            {tab === 'signin' ? 'Welcome back.' : 'Create account.'}
          </h1>
          <p style={{ fontFamily: "'Satoshi', sans-serif", fontSize: 14, color: '#888', marginBottom: 32, lineHeight: 1.5 }}>
            {tab === 'signin'
              ? 'Sign in to access your personalised results.'
              : 'Free to start. No credit card required.'}
          </p>

          {/* Tab switcher */}
          <div style={{ display: 'flex', background: '#f5f4f0', borderRadius: 10, padding: 4, marginBottom: 28, gap: 2 }}>
            <button className={`tab-btn${tab === 'signin' ? ' active' : ''}`} onClick={() => switchTab('signin')}>Sign in</button>
            <button className={`tab-btn${tab === 'signup' ? ' active' : ''}`} onClick={() => switchTab('signup')}>Create account</button>
          </div>

          {/* Google */}
          <button className="auth-btn-google" onClick={handleGoogle} style={{ marginBottom: 20 }}>
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <div style={{ flex: 1, height: 1, background: '#e8e8e4' }} />
            <span style={{ fontSize: 12, color: '#bbb', fontFamily: "'Satoshi', sans-serif" }}>or continue with email</span>
            <div style={{ flex: 1, height: 1, background: '#e8e8e4' }} />
          </div>

          {/* Email + password form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

            {/* Email */}
            <div style={{ position: 'relative' }}>
              <svg style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#bbb', pointerEvents: 'none' }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 6L2 7"/>
              </svg>
              <input
                className="auth-input"
                type="email"
                placeholder="Email address"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>

            {/* Password */}
            <div>
              <div style={{ position: 'relative' }}>
                <svg style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#bbb', pointerEvents: 'none' }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                <input
                  className={`auth-input${passwordInvalid ? ' error' : ''}`}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  style={{ paddingRight: 44 }}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#bbb', padding: 0, display: 'flex' }}>
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {/* Password strength (signup) */}
              {tab === 'signup' && password.length > 0 && (
                <div style={{ marginTop: 8 }}>
                  <div style={{ height: 3, background: '#f0f0ec', borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: strength.pct + '%', background: strength.color, borderRadius: 2, transition: 'width 0.4s ease, background 0.3s ease' }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 5 }}>
                    <span style={{ fontSize: 11, color: passwordInvalid ? '#ef4444' : strength.color, fontWeight: 600, fontFamily: "'Satoshi', sans-serif" }}>
                      {passwordInvalid ? (passwordTooShort ? `At least 8 characters` : 'Too long') : strength.label}
                    </span>
                    <span style={{ fontSize: 11, color: '#ccc', fontFamily: "'Satoshi', sans-serif" }}>{password.length} chars</span>
                  </div>
                </div>
              )}

              {/* Forgot password (signin) */}
              {tab === 'signin' && (
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 6 }}>
                  <Link href="/auth/forgot-password"
                    style={{ fontSize: 12, color: '#888', textDecoration: 'none', fontFamily: "'Satoshi', sans-serif", fontWeight: 500 }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#111')}
                    onMouseLeave={e => (e.currentTarget.style.color = '#888')}>
                    Forgot password?
                  </Link>
                </div>
              )}
            </div>

            {error   && <p style={{ fontSize: 13, color: '#ef4444', fontWeight: 500, fontFamily: "'Satoshi', sans-serif", margin: '2px 0' }}>{error}</p>}
            {success && <p style={{ fontSize: 13, color: '#22c55e', fontWeight: 500, fontFamily: "'Satoshi', sans-serif", margin: '2px 0' }}>{success}</p>}

            <button type="submit" className="auth-btn-primary" disabled={submitDisabled} style={{ marginTop: 4 }}>
              {loading ? 'Please wait…' : tab === 'signin' ? 'Sign in' : 'Create account'}
            </button>
          </form>

          <p style={{ fontSize: 11, color: '#bbb', marginTop: 20, lineHeight: 1.6, fontFamily: "'Satoshi', sans-serif", textAlign: 'center' }}>
            By continuing you agree to our{' '}
            <Link href="/terms" style={{ color: '#888', textDecoration: 'underline', textUnderlineOffset: 2 }}>Terms</Link>
            {' '}and{' '}
            <Link href="/privacy" style={{ color: '#888', textDecoration: 'underline', textUnderlineOffset: 2 }}>Privacy Policy</Link>.
          </p>
        </div>
      </div>
    </div>
  )
}
