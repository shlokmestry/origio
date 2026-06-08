'use client'

import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import { FlagIcon } from '@/components/FlagIcon'
import { slugToIso } from '@/lib/flagCodes'
import { useAuth } from '@/lib/AuthProvider'

interface CountryRow {
  slug: string
  name: string
  flag_emoji: string
}

const S = {
  bg:    '#0a0a0a',
  card:  '#111111',
  border:'#2a2a2a',
  muted: '#555550',
  serif: "'Cabinet Grotesk', sans-serif",
  sans:  "'Satoshi', sans-serif",
  teal:  '#00ffd5',
  text:  '#f0f0e8',
}

// ── Typewriter display ────────────────────────────────────────────────────
// Shows top match with typewriter animation above the input

function TypewriterMatch({ country }: { country: CountryRow | null }) {
  const [displayed, setDisplayed] = useState('')
  const [prevSlug, setPrevSlug]   = useState('')
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current)

    if (!country) {
      setDisplayed('')
      setPrevSlug('')
      return
    }

    if (country.slug === prevSlug) return

    // Reset and type out character by character
    setDisplayed('')
    setPrevSlug(country.slug)

    const name = country.name
    let i = 0
    const tick = () => {
      i++
      setDisplayed(name.slice(0, i))
      if (i < name.length) timerRef.current = setTimeout(tick, 45)
    }
    timerRef.current = setTimeout(tick, 60)

    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [country?.slug]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!country) return <div style={{ height: 56 }} />

  const iso = slugToIso(country.slug) ?? ''

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      gap: 10, height: 56,
    }}>
      <FlagIcon code={iso} size="md" />
      <span style={{
        fontFamily: S.serif, fontWeight: 800,
        fontSize: 'clamp(22px, 2.8vw, 32px)',
        letterSpacing: '-0.03em',
        color: S.text,
        whiteSpace: 'nowrap',
      }}>
        {displayed}
        <span style={{
          display: 'inline-block', width: 2, height: '1em',
          background: S.teal, marginLeft: 2, verticalAlign: 'middle',
          animation: 'blink 0.8s step-end infinite',
        }} />
      </span>
    </div>
  )
}

// ── Loading screen ────────────────────────────────────────────────────────

function LoadingScreen({ country }: { country: CountryRow }) {
  const [dots, setDots] = useState(0)
  const iso = slugToIso(country.slug) ?? ''

  useEffect(() => {
    const t = setInterval(() => setDots(d => (d + 1) % 4), 400)
    return () => clearInterval(t)
  }, [])

  return (
    <div style={{
      position: 'fixed', inset: 0, background: S.bg,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', zIndex: 50,
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'center' }}>
          <FlagIcon code={iso} size="xl" />
        </div>
        <h2 style={{
          fontFamily: S.serif, fontWeight: 800,
          fontSize: 'clamp(20px, 3vw, 28px)',
          letterSpacing: '-0.03em', color: S.text, marginBottom: 10,
        }}>
          Building your {country.name} playbook
        </h2>
        <p style={{
          fontSize: 13, color: S.muted,
          fontFamily: S.sans, letterSpacing: '0.06em',
        }}>
          Personalising to your passport{'.'.repeat(dots + 1)}
        </p>
        <div style={{
          width: 180, height: 2, background: S.border,
          margin: '24px auto 0', overflow: 'hidden',
        }}>
          <div style={{
            height: '100%', background: S.teal,
            animation: 'pb-fill 2s ease forwards',
          }} />
        </div>
      </div>
      <style>{`
        @keyframes pb-fill { from { width: 0% } to { width: 100% } }
        @keyframes blink { from, to { opacity: 1 } 50% { opacity: 0 } }
      `}</style>
    </div>
  )
}

// ── Gate screen ───────────────────────────────────────────────────────────

function GateScreen({ signedIn }: { signedIn: boolean }) {
  return (
    <div style={{ minHeight: '100vh', background: S.bg, color: S.text, display: 'flex', flexDirection: 'column', paddingTop: 52 }}>
      <Nav />
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '60px 24px', textAlign: 'center',
      }}>
        <div style={{
          width: 48, height: 48, border: `1px solid ${S.border}`,
          background: S.card, display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontSize: 20, marginBottom: 24,
        }}>🔒</div>
        <p style={{
          fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase',
          color: S.teal, fontWeight: 700, fontFamily: S.sans, marginBottom: 10,
        }}>Pro Feature</p>
        <h1 style={{
          fontFamily: S.serif, fontWeight: 800,
          fontSize: 'clamp(26px, 5vw, 42px)',
          letterSpacing: '-0.03em', lineHeight: 1.1,
          color: S.text, marginBottom: 14, maxWidth: 440,
        }}>
          The Playbook requires Pro
        </h1>
        <p style={{
          fontSize: 14, color: S.muted, lineHeight: 1.65,
          fontFamily: S.sans, maxWidth: 380, marginBottom: 32,
        }}>
          Step-by-step relocation plan — visa, money, housing, life admin — personalised to your passport.
        </p>
        {signedIn ? (
          <Link href="/pro" style={{
            padding: '12px 28px', background: S.teal, color: '#000',
            fontFamily: S.sans, fontWeight: 700, fontSize: 14,
            textDecoration: 'none',
          }}>Upgrade to Pro</Link>
        ) : (
          <div style={{ display: 'flex', gap: 10 }}>
            <Link href="/signin?next=/playbook" style={{
              padding: '12px 28px', background: S.teal, color: '#000',
              fontFamily: S.sans, fontWeight: 700, fontSize: 14, textDecoration: 'none',
            }}>Sign in</Link>
            <Link href="/pro" style={{
              padding: '12px 28px', background: 'transparent', color: S.text,
              fontFamily: S.sans, fontWeight: 600, fontSize: 14,
              textDecoration: 'none', border: `1px solid ${S.border}`,
            }}>See Pro plans</Link>
          </div>
        )}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap', marginTop: 48 }}>
          {[
            { icon: '📋', label: 'Papers',     color: '#f0b07a' },
            { icon: '💳', label: 'Money',      color: S.teal    },
            { icon: '🏠', label: 'Home',       color: '#c084fc' },
            { icon: '✅', label: 'Life Admin', color: '#4ade80' },
          ].map(t => (
            <div key={t.label} style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '5px 12px', border: `1px solid ${t.color}30`,
              background: `${t.color}0d`, fontSize: 12,
              fontWeight: 600, color: t.color, fontFamily: S.sans,
            }}>{t.icon} {t.label}</div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  )
}

// ── Pro screen ────────────────────────────────────────────────────────────

function ProScreen() {
  const router                        = useRouter()
  const [countries, setCountries]     = useState<CountryRow[]>([])
  const [search, setSearch]           = useState('')
  const [navigating, setNavigating]   = useState<CountryRow | null>(null)

  useEffect(() => {
    fetch('/api/countries')
      .then(r => r.json())
      .then((data: Array<{ slug: string; name: string; flagEmoji?: string; flag_emoji?: string }>) => {
        if (!Array.isArray(data)) return
        setCountries(data.map(c => ({ slug: c.slug, name: c.name, flag_emoji: c.flagEmoji ?? c.flag_emoji ?? '' })))
      })
      .catch(e => console.error('countries load error:', e))
  }, [])

  const topMatch = useMemo<CountryRow | null>(() => {
    const q = search.toLowerCase().trim()
    if (!q || !countries.length) return null
    const startsWith = countries.find(c => c.name.toLowerCase().startsWith(q))
    if (startsWith) return startsWith
    return countries.find(c => c.name.toLowerCase().includes(q) || c.slug.includes(q)) ?? null
  }, [countries, search])

  const navigate = useCallback((c: CountryRow) => {
    setNavigating(c)
    setTimeout(() => router.push(`/country/${c.slug}/playbook`), 2000)
  }, [router])

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && topMatch) {
      e.preventDefault()
      navigate(topMatch)
    }
  }

  if (navigating) return <LoadingScreen country={navigating} />

  return (
    <>
      <style>{`
        @keyframes blink { from, to { opacity: 1 } 50% { opacity: 0 } }
        @keyframes pb-fill { from { width: 0% } to { width: 100% } }
      `}</style>

      <div style={{
        background: S.bg, color: S.text,
        display: 'flex', flexDirection: 'column',
        paddingTop: 52,
      }}>
        <Nav />

        {/* Hero — full viewport height so footer is below fold */}
        <div style={{
          minHeight: 'calc(100vh - 52px)',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          padding: '0 24px',
          textAlign: 'center',
        }}>

          <p style={{
            fontFamily: S.sans, fontWeight: 700, fontSize: 11,
            letterSpacing: '0.12em', textTransform: 'uppercase',
            color: S.muted, marginBottom: 20,
          }}>
            The Playbook
          </p>

          <h1 style={{
            fontFamily: S.serif, fontWeight: 800,
            fontSize: 'clamp(36px, 6vw, 64px)',
            letterSpacing: '-0.04em', lineHeight: 1.0,
            color: S.text,
            marginBottom: 40,
          }}>
            Ready to move?
          </h1>

          {/* Search + typewriter above it */}
          <div style={{ width: '100%', maxWidth: 560 }}>
            {/* Typewriter sits directly above input */}
            <TypewriterMatch country={topMatch} />

            <input
              type="text"
              placeholder="Type a country…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={handleKey}
              autoFocus
              spellCheck={false}
              autoComplete="off"
              style={{
                width: '100%',
                background: S.card,
                border: `1px solid ${S.border}`,
                padding: '18px 22px',
                fontSize: 17,
                color: S.text,
                fontFamily: S.sans,
                outline: 'none',
                letterSpacing: '-0.01em',
                transition: 'border-color 0.15s',
                textAlign: 'center',
                boxSizing: 'border-box',
              }}
              onFocus={e => (e.currentTarget.style.borderColor = '#444440')}
              onBlur={e  => (e.currentTarget.style.borderColor = S.border)}
            />

            <p style={{
              marginTop: 12, fontSize: 12, color: S.muted,
              fontFamily: S.sans, textAlign: 'center',
            }}>
              {topMatch
                ? `Press ↵ to open ${topMatch.name} playbook`
                : countries.length > 0
                  ? `${countries.length} countries available`
                  : '…'}
            </p>
          </div>

        </div>

        <Footer />
      </div>
    </>
  )
}

// ── Root ──────────────────────────────────────────────────────────────────

export default function PlaybookPage() {
  const { user, loading, isPro } = useAuth()

  if (loading) return <div style={{ minHeight: '100vh', background: S.bg }}><Nav /></div>
  if (!user || !isPro) return <GateScreen signedIn={!!user} />
  return <ProScreen />
}
