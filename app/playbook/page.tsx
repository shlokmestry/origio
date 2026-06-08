'use client'

import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import { FlagIcon } from '@/components/FlagIcon'
import { slugToIso } from '@/lib/flagCodes'
import { supabase } from '@/lib/supabase'
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

// ── Animated country name display ─────────────────────────────────────────
// Shows the top-matching country name letter by letter above the search bar

function AnimatedCountryName({ country }: { country: CountryRow | null }) {
  const [key, setKey] = useState(0)

  useEffect(() => {
    if (country) setKey(k => k + 1)
  }, [country?.slug]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!country) return <div style={{ height: 64, marginBottom: 8 }} />

  const iso  = slugToIso(country.slug) ?? ''
  const name = country.name
  // Each character step = total duration / chars, capped for feel
  const steps = name.length
  const dur   = Math.max(0.6, Math.min(steps * 0.07, 1.8))

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      gap: 12, height: 64, marginBottom: 8,
    }}>
      <FlagIcon code={iso} size="md" />
      <span
        key={key}
        style={{
          fontFamily: S.serif, fontWeight: 800,
          fontSize: 'clamp(24px, 3vw, 34px)',
          letterSpacing: '-0.02em',
          color: S.text,
          overflow: 'hidden',
          whiteSpace: 'nowrap',
          borderRight: `3px solid ${S.teal}`,
          display: 'inline-block',
          animation: `
            tw-typing ${dur}s steps(${steps}, end) forwards,
            tw-caret 0.5s step-end infinite
          `,
        }}
      >
        {name}
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
        @keyframes tw-caret { from, to { border-color: transparent } 50% { border-color: ${S.teal} } }
      `}</style>
    </div>
  )
}

// ── Gate screen ───────────────────────────────────────────────────────────

function GateScreen({ signedIn }: { signedIn: boolean }) {
  return (
    <div style={{ minHeight: '100vh', background: S.bg, color: S.text, display: 'flex', flexDirection: 'column' }}>
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
    supabase.from('countries').select('slug, name, flag_emoji').order('name')
      .then(({ data }) => { if (data) setCountries(data as CountryRow[]) })
  }, [])

  // Top matching country as user types
  const topMatch = useMemo<CountryRow | null>(() => {
    const q = search.toLowerCase().trim()
    if (!q) return null
    return countries.find(c =>
      c.name.toLowerCase().includes(q) || c.slug.includes(q)
    ) ?? null
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
        @keyframes tw-typing { from { width: 0 } to { width: 100% } }
        @keyframes tw-caret  { from, to { border-color: transparent } 50% { border-color: ${S.teal} } }
        @keyframes pb-fill   { from { width: 0% } to { width: 100% } }
      `}</style>

      <div style={{
        minHeight: '100vh', background: S.bg, color: S.text,
        display: 'flex', flexDirection: 'column',
      }}>
        <Nav />

        {/* Centred main area — everything stacked here */}
        <div style={{
          flex: 1, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          padding: '0 24px 80px',
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
            marginBottom: 48,
          }}>
            Ready to move?
          </h1>

          {/* Animated country name above search */}
          <AnimatedCountryName country={topMatch} />

          {/* Search input */}
          <div style={{ width: '100%', maxWidth: 560 }}>
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
              }}
              onFocus={e => (e.currentTarget.style.borderColor = '#444440')}
              onBlur={e  => (e.currentTarget.style.borderColor = S.border)}
            />

            {/* Hint line */}
            <p style={{
              marginTop: 12, fontSize: 12, color: S.muted,
              fontFamily: S.sans, textAlign: 'center',
            }}>
              {topMatch
                ? `Press ↵ to open ${topMatch.name} playbook`
                : '45 countries available'}
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
