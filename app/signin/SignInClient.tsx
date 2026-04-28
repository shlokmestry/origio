'use client'
import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Mail, Lock, Eye, EyeOff } from 'lucide-react'

// ── Cycling sample countries for right panel ──────────────────────────────
const SAMPLE_COUNTRIES = [
  {
    rank: 1,
    flag: "🇩🇰",
    name: "DENMARK",
    match: 88,
    takeHome: "DKK 48,200",
    visa: "Pay limit",
    safety: "9.0",
    coords: "55.8761° N · 12.5683° E",
    scores: [
      { label: "SALARY",       value: 8.8 },
      { label: "SAFETY",       value: 9.0 },
      { label: "HEALTHCARE",   value: 9.2 },
      { label: "AFFORDABILITY",value: 6.4 },
    ],
    reasons: ["HEALTHCARE", "WORK-LIFE", "BIKE CITY"],
    forLine: "FOR AOIFE · PM · IE PASSPORT",
  },
  {
    rank: 1,
    flag: "🇨🇭",
    name: "SWITZERLAND",
    match: 92,
    takeHome: "CHF 9,200",
    visa: "B-Permit",
    safety: "9.3",
    coords: "46.8182° N · 8.2275° E",
    scores: [
      { label: "SALARY",       value: 9.5 },
      { label: "SAFETY",       value: 9.3 },
      { label: "HEALTHCARE",   value: 9.1 },
      { label: "AFFORDABILITY",value: 4.2 },
    ],
    reasons: ["TOP SALARY", "ALPINE LIFE", "LOW CRIME"],
    forLine: "FOR JAMES · SWE · UK PASSPORT",
  },
  {
    rank: 1,
    flag: "🇳🇱",
    name: "NETHERLANDS",
    match: 85,
    takeHome: "€5,100",
    visa: "HSM Visa",
    safety: "8.3",
    coords: "52.1326° N · 5.2913° E",
    scores: [
      { label: "SALARY",       value: 8.1 },
      { label: "SAFETY",       value: 8.3 },
      { label: "HEALTHCARE",   value: 8.6 },
      { label: "AFFORDABILITY",value: 5.8 },
    ],
    reasons: ["30% TAX RULING", "ENGLISH OK", "TECH HUB"],
    forLine: "FOR PRIYA · ENG · IN PASSPORT",
  },
  {
    rank: 1,
    flag: "🇵🇹",
    name: "PORTUGAL",
    match: 91,
    takeHome: "€2,800",
    visa: "D7 Visa",
    safety: "9.0",
    coords: "39.3999° N · 8.2245° W",
    scores: [
      { label: "SALARY",       value: 5.2 },
      { label: "SAFETY",       value: 9.0 },
      { label: "HEALTHCARE",   value: 7.2 },
      { label: "AFFORDABILITY",value: 8.1 },
    ],
    reasons: ["NHR TAX", "LOW COST", "EASY VISA"],
    forLine: "FOR MARCO · DEV · BR PASSPORT",
  },
];

const SCORE_COLOR = (v: number) => v >= 7.5 ? "#00ffd5" : v >= 5 ? "#facc15" : "#ef4444";

function ScoreBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="space-y-0.5">
      <div className="flex justify-between items-center">
        <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", color: "#555" }}>{label}</span>
        <span style={{ fontSize: 9, fontWeight: 700, color: SCORE_COLOR(value) }}>{value.toFixed(1)}</span>
      </div>
      <div style={{ height: 2, background: "#1a1a1a", width: "100%" }}>
        <div style={{ height: "100%", width: `${(value / 10) * 100}%`, background: SCORE_COLOR(value), transition: "width 0.6s ease" }} />
      </div>
    </div>
  );
}

function CyclingCard() {
  const [idx, setIdx] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIdx(i => (i + 1) % SAMPLE_COUNTRIES.length);
        setVisible(true);
      }, 400);
    }, 4200);
    return () => clearInterval(timer);
  }, []);

  const c = SAMPLE_COUNTRIES[idx];

  return (
    <div
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(8px)",
        transition: "opacity 0.4s ease, transform 0.4s ease",
        border: "1px solid #00ffd5",
        background: "#0d0d0d",
        padding: "20px",
        boxShadow: "4px 4px 0 #00ffd520",
        width: "100%",
        maxWidth: 280,
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <span style={{ fontSize: 9, fontWeight: 700, color: "#555", letterSpacing: "0.15em" }}>YOUR TOP MATCH</span>
        <span style={{ fontSize: 9, fontWeight: 700, color: "#00ffd5", letterSpacing: "0.1em" }}>SAMPLE</span>
      </div>

      {/* Rank + flag + name */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
        <span style={{ fontSize: 9, fontWeight: 900, color: "#00ffd5", letterSpacing: "0.1em" }}>#{c.rank.toString().padStart(2, "0")}</span>
        <span style={{ fontSize: 22 }}>{c.flag}</span>
        <span style={{ fontFamily: "var(--font-heading, sans-serif)", fontSize: 18, fontWeight: 900, letterSpacing: "-0.02em", color: "#f0f0e8" }}>{c.name}</span>
      </div>

      {/* Match % */}
      <div style={{ marginBottom: 14 }}>
        <span style={{ fontFamily: "var(--font-heading, sans-serif)", fontSize: 36, fontWeight: 900, color: "#4ade80", lineHeight: 1 }}>{c.match}</span>
        <span style={{ fontSize: 11, fontWeight: 700, color: "#888", marginLeft: 4 }}>% match</span>
      </div>

      {/* Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 14, borderTop: "1px solid #1a1a1a", borderBottom: "1px solid #1a1a1a", padding: "10px 0" }}>
        <div>
          <div style={{ fontSize: 8, fontWeight: 700, color: "#555", letterSpacing: "0.1em", marginBottom: 2 }}>TAKE-HOME</div>
          <div style={{ fontSize: 11, fontWeight: 900, color: "#00ffd5" }}>{c.takeHome}</div>
        </div>
        <div>
          <div style={{ fontSize: 8, fontWeight: 700, color: "#555", letterSpacing: "0.1em", marginBottom: 2 }}>VISA</div>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#f0f0e8" }}>{c.visa}</div>
        </div>
        <div>
          <div style={{ fontSize: 8, fontWeight: 700, color: "#555", letterSpacing: "0.1em", marginBottom: 2 }}>SAFETY</div>
          <div style={{ fontSize: 11, fontWeight: 900, color: "#f0f0e8" }}>{c.safety}</div>
        </div>
      </div>

      {/* Score bars */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 14 }}>
        {c.scores.map(s => <ScoreBar key={s.label} label={s.label} value={s.value} />)}
      </div>

      {/* Reason chips */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 12 }}>
        {c.reasons.map(r => (
          <span key={r} style={{ fontSize: 8, fontWeight: 700, padding: "3px 7px", border: "1px solid #00ffd540", color: "#00ffd5", letterSpacing: "0.08em" }}>
            ✦ {r}
          </span>
        ))}
      </div>

      {/* Footer */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #1a1a1a", paddingTop: 8 }}>
        <span style={{ fontSize: 8, fontWeight: 700, color: "#333", letterSpacing: "0.08em" }}>{c.forLine}</span>
        <span style={{ fontSize: 8, fontWeight: 700, color: "#00ffd5", letterSpacing: "0.08em" }}>LIVE</span>
      </div>
    </div>
  );
}

// ── Scrolling country name background ────────────────────────────────────
const BG_NAMES = "DENMARK · NETHERLANDS · SWITZERLAND · PORTUGAL · SPAIN · IRELAND · JAPAN · UAE · GERMANY · SWEDEN · SINGAPORE · ";

function ScrollingBg() {
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
      {/* Horizontal scrolling rows */}
      {[0, 1, 2, 3, 4].map((row) => (
        <div
          key={row}
          style={{
            position: "absolute",
            top: `${15 + row * 18}%`,
            whiteSpace: "nowrap",
            fontFamily: "var(--font-heading, sans-serif)",
            fontSize: 48,
            fontWeight: 900,
            letterSpacing: "-0.02em",
            color: row === 2 ? "#00ffd5" : "#f0f0e8",
            opacity: row === 2 ? 0.06 : 0.03,
            animation: `scrollLeft ${18 + row * 4}s linear infinite`,
            animationDirection: row % 2 === 0 ? "normal" : "reverse",
          }}
        >
          {BG_NAMES.repeat(4)}
        </div>
      ))}

      {/* Concentric rings */}
      <div style={{ position: "absolute", bottom: "10%", left: "50%", transform: "translateX(-50%)" }}>
        {[200, 150, 100, 60].map((size, i) => (
          <div
            key={size}
            style={{
              position: "absolute",
              width: size,
              height: size,
              borderRadius: "50%",
              border: i === 0 ? "1px dashed #00ffd540" : "1px solid #ffffff08",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
            }}
          />
        ))}
      </div>

      {/* Fade masks top/bottom */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "30%", background: "linear-gradient(to bottom, #0a0a0a, transparent)" }} />
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "30%", background: "linear-gradient(to top, #0a0a0a, transparent)" }} />

      <style>{`
        @keyframes scrollLeft {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}

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
    <div style={{ minHeight: "100vh", display: "flex", background: "#0a0a0a", color: "#f0f0e8" }}>

      {/* ── LEFT PANEL ── */}
      <div style={{ flex: 1, position: "relative", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "32px 40px", overflow: "hidden" }}
        className="hidden lg:flex">
        <ScrollingBg />

        {/* Logo */}
        <div style={{ position: "relative", zIndex: 10, display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 14, height: 14, background: "#00ffd5", border: "2px solid #f0f0e8" }} />
          <span style={{ fontFamily: "var(--font-heading, sans-serif)", fontWeight: 900, fontSize: 16, letterSpacing: "0.05em", textTransform: "uppercase" }}>
            Origio
          </span>
        </div>

        {/* Live badge */}
        <div style={{ position: "absolute", top: 32, right: 40, zIndex: 10, display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#00ffd5" }} />
          <span style={{ fontSize: 9, fontWeight: 700, color: "#555", letterSpacing: "0.15em" }}>LIVE · 25 COUNTRIES SCORED</span>
        </div>

        {/* Bottom editorial text */}
        <div style={{ position: "relative", zIndex: 10 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: "#333", letterSpacing: "0.08em", marginBottom: 8, textTransform: "uppercase" }}>
            Where would your
          </p>
          <p style={{ fontFamily: "var(--font-heading, sans-serif)", fontSize: 28, fontWeight: 900, lineHeight: 1.05, letterSpacing: "-0.02em" }}>
            SALARY STRETCH<br />
            <span style={{ color: "#00ffd5" }}>THE FURTHEST?</span>
          </p>
          <p style={{ fontSize: 11, color: "#444", marginTop: 12, maxWidth: 320, lineHeight: 1.6 }}>
            Origio scores 25 countries against your role, passport, and priorities — so you can stop guessing where to move next.
          </p>
          {/* Coordinates */}
          <div style={{ marginTop: 20, display: "flex", gap: 16 }}>
            <span style={{ fontSize: 9, fontWeight: 700, color: "#2a2a2a", letterSpacing: "0.1em", fontFamily: "monospace" }}>51.5074° N · 0.1278° W</span>
            <span style={{ fontSize: 9, fontWeight: 700, color: "#2a2a2a", letterSpacing: "0.1em", fontFamily: "monospace" }}>45.8761° N · 12.5683° E</span>
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div style={{ width: "100%", maxWidth: 520, display: "flex", flexDirection: "column", justifyContent: "center", padding: "48px 40px", borderLeft: "1px solid #1a1a1a", background: "#0a0a0a", position: "relative" }}
        className="lg:max-w-[520px]">

        {/* Mobile logo */}
        <div className="lg:hidden" style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 40 }}>
          <div style={{ width: 12, height: 12, background: "#00ffd5", border: "2px solid #f0f0e8" }} />
          <span style={{ fontFamily: "var(--font-heading, sans-serif)", fontWeight: 900, fontSize: 15, letterSpacing: "0.05em", textTransform: "uppercase" }}>Origio</span>
        </div>

        {/* Cycling card — desktop only, above form */}
        <div className="hidden lg:flex" style={{ justifyContent: "center", marginBottom: 32 }}>
          <CyclingCard />
        </div>

        {/* Welcome text */}
        <div style={{ marginBottom: 28 }}>
          <p style={{ fontSize: 10, fontWeight: 700, color: "#555", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 6 }}>
            WELCOME BACK
          </p>
          <h1 style={{ fontFamily: "var(--font-heading, sans-serif)", fontSize: 36, fontWeight: 900, letterSpacing: "-0.02em", lineHeight: 1.05 }}>
            FIND WHERE<br />
            YOU <span style={{ color: "#00ffd5" }}>BELONG.</span>
          </h1>
          <p style={{ fontSize: 12, color: "#555", marginTop: 10, lineHeight: 1.6 }}>
            Sign in to pick up your wizard answers, saved countries, and personalised reports.
          </p>
        </div>

        {/* Tab switcher */}
        <div style={{ display: "flex", border: "2px solid #1a1a1a", marginBottom: 20 }}>
          {(['signin', 'signup'] as const).map((t) => (
            <button key={t}
              onClick={() => { setTab(t); setError(''); setSuccess('') }}
              style={{
                flex: 1, padding: "10px 0",
                fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase",
                background: tab === t ? "#f0f0e8" : "transparent",
                color: tab === t ? "#0a0a0a" : "#555",
                border: "none", cursor: "pointer", transition: "all 0.2s",
              }}>
              {t === 'signin' ? 'SIGN IN' : 'CREATE ACCOUNT'}
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 16 }}>
          {/* Email */}
          <div style={{ position: "relative" }}>
            <Mail style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", width: 14, height: 14, color: "#444" }} />
            <input type="email" placeholder="you@email.com" value={email}
              onChange={e => setEmail(e.target.value)} required
              style={{
                width: "100%", paddingLeft: 40, paddingRight: 14, paddingTop: 12, paddingBottom: 12,
                background: "#111", border: "2px solid #1a1a1a", color: "#f0f0e8",
                fontSize: 13, outline: "none", boxSizing: "border-box",
                fontFamily: "inherit",
              }}
              onFocus={e => (e.target.style.borderColor = "#00ffd5")}
              onBlur={e => (e.target.style.borderColor = "#1a1a1a")}
            />
          </div>

          {/* Password */}
          <div>
            <div style={{ position: "relative" }}>
              <Lock style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", width: 14, height: 14, color: "#444" }} />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                maxLength={tab === 'signup' ? 16 : undefined}
                style={{
                  width: "100%", paddingLeft: 40, paddingRight: 44, paddingTop: 12, paddingBottom: 12,
                  background: "#111", border: `2px solid ${passwordInvalid ? "#ef4444" : "#1a1a1a"}`,
                  color: "#f0f0e8", fontSize: 13, outline: "none", boxSizing: "border-box",
                  fontFamily: "inherit",
                }}
                onFocus={e => { if (!passwordInvalid) e.target.style.borderColor = "#00ffd5" }}
                onBlur={e => { if (!passwordInvalid) e.target.style.borderColor = "#1a1a1a" }}
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#444", padding: 0 }}>
                {showPassword ? <EyeOff style={{ width: 14, height: 14 }} /> : <Eye style={{ width: 14, height: 14 }} />}
              </button>
            </div>
            {tab === 'signup' && (passwordHint() || password.length === 0) && (
              <p style={{ fontSize: 10, marginTop: 4, color: passwordInvalid ? "#ef4444" : "#444" }}>
                {password.length === 0 ? "8–16 characters" : passwordHint()}
              </p>
            )}
            {tab === 'signin' && (
              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 4 }}>
                <Link href="/auth/forgot-password" style={{ fontSize: 10, color: "#444", textDecoration: "none", letterSpacing: "0.05em" }}
                  onMouseEnter={e => (e.currentTarget.style.color = "#00ffd5")}
                  onMouseLeave={e => (e.currentTarget.style.color = "#444")}>
                  FORGOT PASSWORD?
                </Link>
              </div>
            )}
          </div>

          {error   && <p style={{ fontSize: 11, color: "#ef4444", fontWeight: 600 }}>{error}</p>}
          {success && <p style={{ fontSize: 11, color: "#4ade80", fontWeight: 600 }}>{success}</p>}

          {/* Submit */}
          <button type="submit" disabled={submitDisabled}
            style={{
              width: "100%", padding: "13px 0",
              background: submitDisabled ? "#1a1a1a" : "#00ffd5",
              color: submitDisabled ? "#444" : "#0a0a0a",
              border: "none", cursor: submitDisabled ? "not-allowed" : "pointer",
              fontSize: 11, fontWeight: 900, letterSpacing: "0.15em", textTransform: "uppercase",
              boxShadow: submitDisabled ? "none" : "3px 3px 0 #00aa90",
              transition: "all 0.2s", fontFamily: "inherit",
            }}>
            {loading ? 'PLEASE WAIT...' : tab === 'signin' ? 'SIGN IN →' : 'CREATE ACCOUNT →'}
          </button>
        </form>

        {/* Divider */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
          <div style={{ flex: 1, height: 1, background: "#1a1a1a" }} />
          <span style={{ fontSize: 10, color: "#333", fontWeight: 700, letterSpacing: "0.1em" }}>OR</span>
          <div style={{ flex: 1, height: 1, background: "#1a1a1a" }} />
        </div>

        {/* Google */}
        <button onClick={handleGoogle}
          style={{
            width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
            padding: "12px 0", border: "2px solid #1a1a1a", background: "transparent",
            cursor: "pointer", fontSize: 11, fontWeight: 700, color: "#555", letterSpacing: "0.1em",
            textTransform: "uppercase", transition: "all 0.2s", fontFamily: "inherit",
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = "#2a2a2a"; e.currentTarget.style.color = "#f0f0e8" }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = "#1a1a1a"; e.currentTarget.style.color = "#555" }}>
          <svg style={{ width: 14, height: 14 }} viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </button>

        {/* Legal */}
        <p style={{ textAlign: "center", fontSize: 10, color: "#333", marginTop: 20, letterSpacing: "0.05em" }}>
          By continuing you agree to our{' '}
          <Link href="/terms" style={{ color: "#444", textDecoration: "none" }}
            onMouseEnter={e => (e.currentTarget.style.color = "#00ffd5")}
            onMouseLeave={e => (e.currentTarget.style.color = "#444")}>
            Terms
          </Link>
          {' '}and{' '}
          <Link href="/privacy" style={{ color: "#444", textDecoration: "none" }}
            onMouseEnter={e => (e.currentTarget.style.color = "#00ffd5")}
            onMouseLeave={e => (e.currentTarget.style.color = "#444")}>
            Privacy Policy
          </Link>
        </p>

        {/* Footer */}
        <p style={{ textAlign: "center", fontSize: 9, color: "#222", marginTop: 24, letterSpacing: "0.1em", fontWeight: 700 }}>
          ORIGIO · 2026 · ALL FINDINGS PERSONALISED.
        </p>
      </div>
    </div>
  )
}