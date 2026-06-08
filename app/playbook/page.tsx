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
  bg:     '#0a0a0a',
  card:   '#111111',
  border: '#2a2a2a',
  muted:  '#555550',
  serif:  "'Cabinet Grotesk', sans-serif",
  sans:   "'Satoshi', sans-serif",
  teal:   '#00ffd5',
  text:   '#f0f0e8',
}

// ── Animated suggestion row ───────────────────────────────────────────────

function SuggestionRow({ name, slug, visible, selected, onClick }: {
  name: string; slug: string; visible: boolean; selected: boolean; onClick: () => void
}) {
  const [mounted, setMounted] = useState(false)
  const iso = slugToIso(slug) ?? ''

  useEffect(() => {
    if (visible) {
      const t = setTimeout(() => setMounted(true), 10)
      return () => clearTimeout(t)
    } else {
      setMounted(false)
    }
  }, [visible])

  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '11px 16px',
        background: selected ? '#1a1a1a' : 'transparent',
        border: `1px solid ${selected ? '#444440' : 'transparent'}`,
        cursor: 'pointer',
        opacity: mounted ? 1 : 0,
        transform: mounted ? 'translateY(0)' : 'translateY(6px)',
        transition: 'opacity 0.18s ease, transform 0.18s ease, background 0.1s, border-color 0.1s',
      }}
    >
      <FlagIcon code={iso} size="sm" />
      <span style={{
        fontSize: 15, fontWeight: selected ? 700 : 500,
        color: selected ? S.text : '#aaa',
        fontFamily: S.sans,
        transition: 'color 0.1s',
      }}>
        {name}
      </span>
      {selected && (
        <span style={{ marginLeft: 'auto', fontSize: 11, color: S.teal, fontFamily: S.sans, letterSpacing: '0.06em' }}>
          ↵ enter
        </span>
      )}
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
      alignItems: 'center', justifyContent: 'center',
      zIndex: 50,
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'center' }}>
          <FlagIcon code={iso} size="xl" />
        </div>
        <h2 style={{
          fontFamily: S.serif, fontWeight: 800,
          fontSize: 'clamp(22px, 3vw, 30px)',
          letterSpacing: '-0.03em', color: S.text,
          marginBottom: 12,
        }}>
          Building your {country.name} playbook
        </h2>
        <p style={{
          fontSize: 13, color: S.muted,
          fontFamily: S.sans, letterSpacing: '0.08em',
        }}>
          Personalising to your passport{'.'.repeat(dots + 1)}
        </p>

        {/* Progress bar */}
        <div style={{
          width: 200, height: 2, background: S.border,
          margin: '28px auto 0', overflow: 'hidden',
        }}>
          <div style={{
            height: '100%', background: S.teal,
            animation: 'pb-fill 2s ease forwards',
          }} />
        </div>
      </div>

      <style>{`
        @keyframes pb-fill {
          from { width: 0% }
          to   { width: 100% }
        }
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
            textDecoration: 'none', letterSpacing: '-0.01em',
          }}>
            Upgrade to Pro
          </Link>
        ) : (
          <div style={{ display: 'flex', gap: 10 }}>
            <Link href="/signin?next=/playbook" style={{
              padding: '12px 28px', background: S.teal, color: '#000',
              fontFamily: S.sans, fontWeight: 700, fontSize: 14,
              textDecoration: 'none',
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
            }}>
              {t.icon} {t.label}
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  )
}

// ── Pro screen ────────────────────────────────────────────────────────────

function ProScreen() {
  const router                          = useRouter()
  const [countries, setCountries]       = useState<CountryRow[]>([])
  const [search, setSearch]             = useState('')
  const [selectedIdx, setSelectedIdx]   = useState(0)
  const [loading, setLoading]           = useState<CountryRow | null>(null)
  const inputRef                        = useRef<HTMLInputElement>(null)

  useEffect(() => {
    supabase
      .from('countries').select('slug, name, flag_emoji').order('name')
      .then(({ data }) => { if (data) setCountries(data as CountryRow[]) })
  }, [])

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim()
    if (!q) return []
    return countries.filter(c =>
      c.name.toLowerCase().includes(q) || c.slug.includes(q)
    ).slice(0, 6)
  }, [countries, search])

  // Reset selection when results change
  useEffect(() => { setSelectedIdx(0) }, [filtered.length])

  const navigate = useCallback((c: CountryRow) => {
    setLoading(c)
    setTimeout(() => router.push(`/country/${c.slug}/playbook`), 2000)
  }, [router])

  const handleKey = (e: React.KeyboardEvent) => {
    if (!filtered.length) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIdx(i => Math.min(i + 1, filtered.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIdx(i => Math.max(i - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      navigate(filtered[selectedIdx])
    }
  }

  if (loading) return <LoadingScreen country={loading} />

  return (
    <div style={{ minHeight: '100vh', background: S.bg, color: S.text, display: 'flex', flexDirection: 'column' }}>
      <Nav />

      {/* THE PLAYBOOK — top left corner */}
      <div style={{ padding: '20px 32px 0' }}>
        <span style={{
          fontFamily: S.serif, fontWeight: 800,
          fontSize: 13, letterSpacing: '0.04em',
          color: S.muted, textTransform: 'uppercase',
        }}>
          The Playbook
        </span>
      </div>

      {/* Centred content */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '0 24px 80px',
      }}>

        {/* Heading */}
        <h1 style={{
          fontFamily: S.serif, fontWeight: 800,
          fontSize: 'clamp(32px, 5vw, 52px)',
          letterSpacing: '-0.03em', lineHeight: 1.05,
          color: S.text, marginBottom: 40,
          textAlign: 'center',
        }}>
          Ready to move?
        </h1>

        {/* Search + suggestions */}
        <div style={{ width: '100%', maxWidth: 520, position: 'relative' }}>

          {/* Animated suggestions — above the input */}
          {filtered.length > 0 && (
            <div style={{
              position: 'absolute', bottom: '100%', left: 0, right: 0,
              marginBottom: 4,
              background: S.card,
              border: `1px solid ${S.border}`,
              overflow: 'hidden',
            }}>
              {filtered.map((c, i) => (
                <SuggestionRow
                  key={c.slug}
                  name={c.name}
                  slug={c.slug}
                  visible={true}
                  selected={i === selectedIdx}
                  onClick={() => navigate(c)}
                />
              ))}
            </div>
          )}

          {/* Search input */}
          <input
            ref={inputRef}
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
              padding: '16px 20px',
              fontSize: 16,
              color: S.text,
              fontFamily: S.sans,
              outline: 'none',
              letterSpacing: '-0.01em',
              transition: 'border-color 0.15s',
            }}
            onFocus={e => (e.currentTarget.style.borderColor = '#444440')}
            onBlur={e  => (e.currentTarget.style.borderColor = S.border)}
          />
        </div>

        {/* Hint */}
        <p style={{
          marginTop: 14, fontSize: 12, color: S.muted,
          fontFamily: S.sans, textAlign: 'center',
        }}>
          {search ? 'Use ↑ ↓ to navigate · ↵ to select' : '45 countries available'}
        </p>

      </div>

      <Footer />
    </div>
  )
}

// ── Root ──────────────────────────────────────────────────────────────────

export default function PlaybookPage() {
  const { user, loading, isPro } = useAuth()

  if (loading) return <div style={{ minHeight: '100vh', background: S.bg }}><Nav /></div>
  if (!user || !isPro) return <GateScreen signedIn={!!user} />
  return <ProScreen />
}
