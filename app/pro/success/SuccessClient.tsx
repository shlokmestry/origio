'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Nav from '@/components/Nav'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

type PageStatus = 'verifying' | 'success' | 'error'

interface TopMatch {
  name: string
  flagEmoji: string
  matchPercent: number
}

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'

const PRO_FEATURES = [
  { n: '01', title: 'All 25 countries ranked',    desc: 'Your full personalised ranking, not just the top 3.' },
  { n: '02', title: 'Full personalised report',   desc: 'Salary, take-home after tax, costs, visa path — specific to you.' },
  { n: '03', title: 'Salary calculator',          desc: 'Real take-home after tax in any country, for your salary.' },
  { n: '04', title: 'Visa checklist',             desc: 'Every document, in order, with official links — country-specific.' },
  { n: '05', title: '3-country comparison',       desc: 'Top matches side by side across salary, rent, visa, tax and more.' },
]

function rnd() { return CHARS[Math.floor(Math.random() * CHARS.length)] }

type TileState = 'cy' | 'on' | 'ld' | 'er'

function Tile({ char, state }: { char: string; state: TileState }) {
  const colors: Record<TileState, string> = {
    cy: 'rgba(255,255,255,0.16)',
    on: '#4de6cc',
    ld: 'rgba(255,255,255,0.60)',
    er: '#ff4f4f',
  }
  const bgs: Record<TileState, string> = {
    cy: '#111118',
    on: 'rgba(77,230,204,0.06)',
    ld: '#111118',
    er: 'rgba(255,79,79,0.05)',
  }
  const borders: Record<TileState, string> = {
    cy: 'rgba(255,255,255,0.04)',
    on: 'rgba(77,230,204,0.12)',
    ld: 'rgba(255,255,255,0.04)',
    er: 'rgba(255,79,79,0.10)',
  }

  return (
    <span style={{
      position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      width: 46, height: 64, background: bgs[state], border: `1px solid ${borders[state]}`,
      borderRadius: 6, fontFamily: "'Space Mono', monospace", fontSize: 28, fontWeight: 700,
      color: colors[state], overflow: 'hidden', flexShrink: 0,
      transition: 'color 0.06s, background 0.1s', userSelect: 'none',
    }}>
      {char === ' ' ? '\u00a0' : char}
      <span style={{ position: 'absolute', left: 0, right: 0, top: '50%', height: 1, background: 'rgba(0,0,0,0.55)', pointerEvents: 'none' }} />
    </span>
  )
}

interface TileData { char: string; state: TileState }

function TileStrip({ tiles, small }: { tiles: TileData[]; small?: boolean }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
      {tiles.map((t, i) => (
        <span key={i} style={small ? { transform: 'scale(0.78)', transformOrigin: 'top left' } : {}}>
          <Tile char={t.char} state={t.state} />
        </span>
      ))}
    </div>
  )
}

function useTileEngine() {
  const [destTiles,  setDestTiles]  = useState<TileData[]>([])
  const [matchTiles, setMatchTiles] = useState<TileData[]>([])
  const destIv  = useRef<ReturnType<typeof setInterval> | null>(null)
  const matchIv = useRef<ReturnType<typeof setInterval> | null>(null)

  const clearIvs = useCallback(() => {
    if (destIv.current)  { clearInterval(destIv.current);  destIv.current  = null }
    if (matchIv.current) { clearInterval(matchIv.current); matchIv.current = null }
  }, [])

  const startVerifying = useCallback(() => {
    clearIvs()
    const makeRnd = (n: number): TileData[] => Array.from({ length: n }, () => ({ char: rnd(), state: 'cy' as TileState }))
    setDestTiles(makeRnd(8))
    setMatchTiles(makeRnd(3))
    destIv.current  = setInterval(() => setDestTiles(makeRnd(8)), 85)
    matchIv.current = setInterval(() => setMatchTiles(makeRnd(3)), 85)
  }, [clearIvs])

  const startSuccess = useCallback((dest: string, match: string) => {
    clearIvs()

    function animate(
      target: string,
      setter: React.Dispatch<React.SetStateAction<TileData[]>>,
      ivRef: React.MutableRefObject<ReturnType<typeof setInterval> | null>,
      delay: number
    ) {
      const chars = [...target]
      setter(chars.map(() => ({ char: rnd(), state: 'cy' })))
      const RATE = 2.8
      let tick = 0
      const run = () => {
        ivRef.current = setInterval(() => {
          setter(chars.map((c, i) => {
            const landAt = Math.floor(i * RATE)
            if (tick >= landAt + 2) return { char: c, state: 'ld' }
            if (tick >= landAt)     return { char: c, state: 'on' }
            return { char: rnd(), state: 'cy' }
          }))
          tick++
          if (tick > chars.length * RATE + 6) {
            if (ivRef.current) { clearInterval(ivRef.current); ivRef.current = null }
            setter(chars.map(c => ({ char: c, state: 'ld' })))
          }
        }, 55)
      }
      if (delay) setTimeout(run, delay); else run()
    }

    animate(dest,  setDestTiles,  destIv,  0)
    animate(match, setMatchTiles, matchIv, 360)
  }, [clearIvs])

  const startError = useCallback((text: string) => {
    clearIvs()
    setDestTiles([...text].map(c => ({ char: c, state: 'er' })))
    setMatchTiles([{ char: '—', state: 'er' }])
  }, [clearIvs])

  useEffect(() => () => clearIvs(), [clearIvs])

  return { destTiles, matchTiles, startVerifying, startSuccess, startError }
}

function StatusBadge({ mode }: { mode: 'confirmed' | 'searching' | 'failed' | 'none' }) {
  if (mode === 'none') return null
  const colors = { confirmed: '#4de6cc', searching: 'rgba(255,255,255,0.38)', failed: '#ff4f4f' }
  const labels = { confirmed: 'Confirmed', searching: 'Searching', failed: 'Failed' }
  const col = colors[mode]
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontFamily: "'Space Mono', monospace", fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', color: col }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: col, flexShrink: 0, animation: mode === 'confirmed' ? 'breathe 2s ease-in-out infinite' : mode === 'searching' ? 'pulse 1.1s ease-in-out infinite' : 'none' }} />
      {labels[mode]}
    </span>
  )
}

function DepartureBoard({ destTiles, matchTiles, statusMode, glowing }: {
  destTiles: TileData[]; matchTiles: TileData[];
  statusMode: 'confirmed' | 'searching' | 'failed' | 'none'; glowing: boolean
}) {
  return (
    <div style={{ border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, background: '#0c0c10', overflow: 'hidden', marginBottom: 72, position: 'relative', boxShadow: glowing ? '0 0 60px rgba(77,230,204,0.07), 0 0 0 1px rgba(77,230,204,0.14)' : 'none' }}>
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px)', backgroundSize: '28px 28px', pointerEvents: 'none' }} />
      <div style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'grid', gridTemplateColumns: '1fr 160px 200px', padding: '12px 28px' }}>
        {['Destination', 'Match', 'Status'].map(l => (
          <span key={l} style={{ fontFamily: "'Space Mono', monospace", fontSize: 8, fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.16)' }}>{l}</span>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 160px 200px', padding: '26px 28px', alignItems: 'center', minHeight: 108, position: 'relative', zIndex: 1 }}>
        <TileStrip tiles={destTiles} />
        <TileStrip tiles={matchTiles} small />
        <StatusBadge mode={statusMode} />
      </div>
    </div>
  )
}

export default function SuccessClient() {
  const searchParams = useSearchParams()
  const router       = useRouter()
  const sessionId    = searchParams.get('session_id')

  const [pageStatus, setPageStatus] = useState<PageStatus>('verifying')
  const [errorMsg,   setErrorMsg]   = useState('')
  const [statusMode, setStatusMode] = useState<'confirmed' | 'searching' | 'failed' | 'none'>('searching')
  const [glowing,    setGlowing]    = useState(false)
  const [mounted,    setMounted]    = useState(false)

  const { destTiles, matchTiles, startVerifying, startSuccess, startError } = useTileEngine()

  useEffect(() => {
    setMounted(true)
    startVerifying()
  }, [startVerifying])

  const goSuccess = useCallback((match: TopMatch | null) => {
    const dest = match ? match.name.toUpperCase().slice(0, 10) : 'CONFIRMED'
    const pct  = match ? `${match.matchPercent}%` : '--'
    startSuccess(dest, pct)
    setTimeout(() => { setStatusMode('confirmed'); setGlowing(true) }, 900)
    setPageStatus('success')
  }, [startSuccess])

  const goError = useCallback((msg: string) => {
    startError('NOT FOUND')
    setStatusMode('failed')
    setErrorMsg(msg)
    setPageStatus('error')
  }, [startError])

  useEffect(() => {
    if (!sessionId) { router.replace('/pro'); return }

    // DEV ONLY — safe on prod (NODE_ENV is always 'production' on Vercel)
    if (process.env.NODE_ENV === 'development' && sessionId === 'test_success') {
      goSuccess({ name: 'Portugal', flagEmoji: '🇵🇹', matchPercent: 83 })
      return
    }
    if (process.env.NODE_ENV === 'development' && sessionId === 'test_error') {
      goError('Payment not completed. No charge was made.')
      return
    }

    if (!mounted) return
    let cancelled = false

    async function verify() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { goError('You need to be signed in.'); return }
      if (cancelled) return

      try {
        const res = await fetch('/api/verify-payment', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.access_token}` },
          body: JSON.stringify({ sessionId }),
        })
        if (cancelled) return
        const data = await res.json()
        if (!res.ok) throw new Error(data.error ?? 'Verification failed')

        if (data.paid && data.pro) {
          router.refresh()
          const { data: result } = await supabase.from('wizard_results').select('top_countries').eq('user_id', session.user.id).maybeSingle()
          goSuccess(result?.top_countries?.[0] ?? null)
          return
        }

        if (data.paid === false) { goError('Payment not completed. No charge was made.'); return }

        const { data: profile } = await supabase.from('profiles').select('is_pro').eq('id', session.user.id).single()
        if (profile?.is_pro) {
          router.refresh()
          const { data: result } = await supabase.from('wizard_results').select('top_countries').eq('user_id', session.user.id).maybeSingle()
          goSuccess(result?.top_countries?.[0] ?? null)
        } else {
          goError("Something went wrong. If you were charged, contact us and we'll sort it out.")
        }
      } catch (err) {
        if (cancelled) return
        goError("Couldn't verify payment. If you were charged, contact us and we'll sort it out.")
      }
    }

    verify()
    return () => { cancelled = true }
  }, [sessionId, router, mounted, goSuccess, goError])

  return (
    <div style={{ minHeight: '100vh', background: '#050508', color: '#fff', fontFamily: "'Inter', sans-serif", WebkitFontSmoothing: 'antialiased' }}>
      <style>{`
        @keyframes breathe { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(0.8)} }
        @keyframes pulse   { 0%,100%{opacity:1} 50%{opacity:0.3} }
        @keyframes fadeUp  { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        .fu { animation: fadeUp 0.55s ease both; }
        .d2 { animation-delay: 0.12s; }
        .d3 { animation-delay: 0.22s; }
        .d4 { animation-delay: 0.34s; }
        .d5 { animation-delay: 0.48s; }
        @media (max-width: 700px) {
          .success-grid { grid-template-columns: 1fr !important; }
          .page-pad { padding: 80px 20px 80px !important; }
        }
      `}</style>

      <Nav countries={[]} onCountrySelect={() => {}} />

      <div className="page-pad" style={{ maxWidth: 1040, margin: '0 auto', padding: '104px 40px 120px' }}>

        <DepartureBoard destTiles={destTiles} matchTiles={matchTiles} statusMode={statusMode} glowing={glowing} />

        {pageStatus === 'verifying' && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '28vh' }}>
            <p style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.38)' }}>
              Verifying payment_
            </p>
          </div>
        )}

        {pageStatus === 'error' && (
          <div className="fu d2" style={{ maxWidth: 420 }}>
            <p style={{ fontFamily: "'Space Mono', monospace", fontSize: 8, fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#ff4f4f', marginBottom: 22 }}>
              {'// ERR_402 · payment incomplete'}
            </p>
            <h1 style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: 'clamp(48px,8vw,72px)', fontWeight: 400, lineHeight: 0.92, letterSpacing: '-0.02em', color: '#fff', marginBottom: 22 }}>
              No charge<br /><em>was made.</em>
            </h1>
            <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.38)', lineHeight: 1.7, marginBottom: 32, maxWidth: 380 }}>{errorMsg}</p>
            <Link href="/pro" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '12px 22px', border: '1px solid rgba(255,255,255,0.12)', fontFamily: "'Space Mono', monospace", fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.38)', textDecoration: 'none' }}>
              ← Back to Pro
            </Link>
          </div>
        )}

        {pageStatus === 'success' && (
          <div className="success-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 64, alignItems: 'start' }}>

            <div>
              <div className="fu d2" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(77,230,204,0.10)', border: '1px solid rgba(77,230,204,0.22)', borderRadius: 100, padding: '6px 14px', marginBottom: 28 }}>
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#4de6cc', animation: 'breathe 2.5s ease-in-out infinite' }} />
                <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#4de6cc' }}>Pro active</span>
              </div>

              <h1 className="fu d3" style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: 'clamp(56px,8vw,88px)', fontWeight: 400, lineHeight: 0.90, letterSpacing: '-0.02em', color: '#fff', marginBottom: 24 }}>
                Pro<br /><em>unlocked.</em>
              </h1>

              <p className="fu d4" style={{ fontSize: 15, color: 'rgba(255,255,255,0.38)', lineHeight: 1.7, marginBottom: 36, maxWidth: 400 }}>
                No renewal. No expiry. Everything is yours — permanently.
                Your Pro status is active; check it anytime in your{' '}
                <Link href="/profile" style={{ color: '#4de6cc', textDecoration: 'none' }}>profile</Link>.
              </p>

              <div className="fu d5" style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
                <Link href="/wizard" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 24px', background: '#4de6cc', color: '#050508', fontFamily: "'Space Mono', monospace", fontSize: 11, fontWeight: 700, letterSpacing: '0.10em', textTransform: 'uppercase', textDecoration: 'none', boxShadow: '3px 3px 0 rgba(77,230,204,0.3)' }}>
                  Run quiz — see all 25 <ArrowRight size={13} />
                </Link>
                <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: "'Space Mono', monospace", fontSize: 10, fontWeight: 700, letterSpacing: '0.10em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.38)', textDecoration: 'none' }}>
                  Explore globe <ArrowRight size={11} />
                </Link>
              </div>
            </div>

            <div className="fu d4">
              <p style={{ fontFamily: "'Space Mono', monospace", fontSize: 8, fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.22)', marginBottom: 24 }}>Now included</p>
              {PRO_FEATURES.map((f, i) => (
                <div key={f.n} style={{ display: 'flex', gap: 16, alignItems: 'flex-start', paddingTop: i === 0 ? 0 : 18, paddingBottom: i < PRO_FEATURES.length - 1 ? 18 : 0, borderBottom: i < PRO_FEATURES.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
                  <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.18)', flexShrink: 0, paddingTop: 2, letterSpacing: '0.08em' }}>{f.n}</span>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 700, color: '#fff', letterSpacing: '0.02em', marginBottom: 4 }}>{f.title}</p>
                    <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.32)', lineHeight: 1.6 }}>{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

      </div>
    </div>
  )
}