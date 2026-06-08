'use client'

import { useState, useEffect, useMemo } from 'react'
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

// ── Gate screen (not signed in OR not pro) ────────────────────────────────

function GateScreen({ signedIn }: { signedIn: boolean }) {
  return (
    <div style={{
      minHeight: '100vh', background: S.bg, color: S.text,
      display: 'flex', flexDirection: 'column',
    }}>
      <Nav />

      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '60px 24px',
        textAlign: 'center',
      }}>

        {/* Lock mark */}
        <div style={{
          width: 52, height: 52,
          border: `1px solid ${S.border}`,
          background: S.card,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 22, marginBottom: 28,
        }}>
          🔒
        </div>

        {/* Label */}
        <p style={{
          fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase',
          color: S.teal, fontWeight: 700, fontFamily: S.sans, marginBottom: 12,
        }}>
          Pro Feature
        </p>

        {/* Heading */}
        <h1 style={{
          fontFamily: S.serif, fontWeight: 800,
          fontSize: 'clamp(28px, 5vw, 44px)',
          letterSpacing: '-0.03em', lineHeight: 1.1,
          color: S.text, marginBottom: 16, maxWidth: 480,
        }}>
          The Playbook requires Pro
        </h1>

        {/* Sub */}
        <p style={{
          fontSize: 15, color: S.muted, lineHeight: 1.65,
          fontFamily: S.sans, maxWidth: 400, marginBottom: 36,
        }}>
          Get a step-by-step relocation plan for any country — visa, money, housing, and life admin — personalised to your passport.
        </p>

        {/* CTA */}
        {signedIn ? (
          <Link
            href="/pro"
            style={{
              display: 'inline-block',
              padding: '13px 28px',
              background: S.teal,
              color: '#000',
              fontFamily: S.sans,
              fontWeight: 700,
              fontSize: 14,
              textDecoration: 'none',
              letterSpacing: '-0.01em',
              border: 'none',
              transition: 'opacity 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
          >
            Upgrade to Pro
          </Link>
        ) : (
          <div style={{ display: 'flex', gap: 10 }}>
            <Link
              href="/signin?next=/playbook"
              style={{
                display: 'inline-block',
                padding: '13px 28px',
                background: S.teal,
                color: '#000',
                fontFamily: S.sans,
                fontWeight: 700,
                fontSize: 14,
                textDecoration: 'none',
                letterSpacing: '-0.01em',
              }}
            >
              Sign in
            </Link>
            <Link
              href="/pro"
              style={{
                display: 'inline-block',
                padding: '13px 28px',
                background: 'transparent',
                color: S.text,
                fontFamily: S.sans,
                fontWeight: 600,
                fontSize: 14,
                textDecoration: 'none',
                border: `1px solid ${S.border}`,
                letterSpacing: '-0.01em',
              }}
            >
              See Pro plans
            </Link>
          </div>
        )}

        {/* Track pills — teaser */}
        <div style={{
          display: 'flex', gap: 8, justifyContent: 'center',
          flexWrap: 'wrap', marginTop: 52,
        }}>
          {[
            { icon: '📋', label: 'Papers',     color: '#f0b07a' },
            { icon: '💳', label: 'Money',      color: S.teal    },
            { icon: '🏠', label: 'Home',       color: '#c084fc' },
            { icon: '✅', label: 'Life Admin', color: '#4ade80' },
          ].map(t => (
            <div key={t.label} style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '6px 14px',
              border: `1px solid ${t.color}30`,
              background: `${t.color}0d`,
              fontSize: 12, fontWeight: 600,
              color: t.color, fontFamily: S.sans,
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
  const router = useRouter()
  const [countries, setCountries] = useState<CountryRow[]>([])
  const [search, setSearch]       = useState('')
  const [hovered, setHovered]     = useState<string | null>(null)

  useEffect(() => {
    supabase
      .from('countries')
      .select('slug, name, flag_emoji')
      .order('name')
      .then(({ data }) => { if (data) setCountries(data as CountryRow[]) })
  }, [])

  const FEATURED = [
    'portugal', 'germany', 'spain', 'netherlands', 'thailand',
    'georgia', 'canada', 'australia', 'singapore', 'japan',
    'united-kingdom', 'uae',
  ]
  const featured = countries.filter(c => FEATURED.includes(c.slug))

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return q
      ? countries.filter(c =>
          c.name.toLowerCase().includes(q) || c.slug.includes(q)
        )
      : []
  }, [countries, search])

  return (
    <div style={{ minHeight: '100vh', background: S.bg, color: S.text }}>
      <Nav />

      <div style={{ maxWidth: 680, margin: '0 auto', padding: '64px 24px 80px' }}>

        {/* Heading */}
        <div style={{ marginBottom: 36 }}>
          <p style={{
            fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase',
            color: S.teal, fontWeight: 700, fontFamily: S.sans, marginBottom: 10,
          }}>
            The Playbook
          </p>
          <h1 style={{
            fontFamily: S.serif, fontWeight: 800,
            fontSize: 'clamp(28px, 4vw, 40px)',
            letterSpacing: '-0.03em', lineHeight: 1.1,
            color: S.text, marginBottom: 10,
          }}>
            Ready to move?
          </h1>
          <p style={{
            fontSize: 14, color: S.muted,
            fontFamily: S.sans, lineHeight: 1.6,
          }}>
            Search your country and get your personalised step-by-step plan.
          </p>
        </div>

        {/* Search */}
        <div style={{ position: 'relative', marginBottom: 32 }}>
          <span style={{
            position: 'absolute', left: 16, top: '50%',
            transform: 'translateY(-50%)',
            fontSize: 14, color: S.muted, pointerEvents: 'none',
          }}>
            🔍
          </span>
          <input
            type="text"
            placeholder="Search a country…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            autoFocus
            style={{
              width: '100%',
              background: S.card,
              border: `1px solid ${S.border}`,
              padding: '14px 16px 14px 44px',
              fontSize: 15,
              color: S.text,
              fontFamily: S.sans,
              outline: 'none',
              transition: 'border-color 0.15s',
            }}
            onFocus={e  => (e.currentTarget.style.borderColor = '#444440')}
            onBlur={e   => (e.currentTarget.style.borderColor = S.border)}
          />
        </div>

        {/* Search results */}
        {search && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 24 }}>
            {filtered.length === 0 && (
              <p style={{ fontSize: 13, color: S.muted, fontFamily: S.sans, padding: '8px 0' }}>
                No countries matched "{search}"
              </p>
            )}
            {filtered.map(c => (
              <button
                key={c.slug}
                onClick={() => router.push(`/country/${c.slug}/playbook`)}
                onMouseEnter={() => setHovered(c.slug)}
                onMouseLeave={() => setHovered(null)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  background: hovered === c.slug ? '#1a1a1a' : S.card,
                  border: `1px solid ${hovered === c.slug ? '#444440' : S.border}`,
                  padding: '12px 16px',
                  cursor: 'pointer', textAlign: 'left',
                  transition: 'background 0.12s, border-color 0.12s',
                  width: '100%',
                }}
              >
                <FlagIcon code={slugToIso(c.slug) ?? ''} size="sm" />
                <span style={{ fontSize: 14, fontWeight: 600, color: S.text, fontFamily: S.sans }}>
                  {c.name}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Popular destinations */}
        {!search && (
          <>
            <p style={{
              fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase',
              color: S.muted, fontWeight: 600, fontFamily: S.sans, marginBottom: 12,
            }}>
              Popular Destinations
            </p>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
              gap: 2,
            }}>
              {featured.map(c => (
                <button
                  key={c.slug}
                  onClick={() => router.push(`/country/${c.slug}/playbook`)}
                  onMouseEnter={() => setHovered(c.slug)}
                  onMouseLeave={() => setHovered(null)}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    gap: 10,
                    background: hovered === c.slug ? '#1a1a1a' : S.card,
                    border: `1px solid ${hovered === c.slug ? '#444440' : S.border}`,
                    padding: '13px 16px',
                    cursor: 'pointer', textAlign: 'left',
                    transition: 'background 0.12s, border-color 0.12s',
                    width: '100%',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <FlagIcon iso={slugToIso[c.slug] ?? ''} style={{ width: 22, height: 16, objectFit: 'cover', border: `1px solid ${S.border}`, flexShrink: 0 }} />
                    <span style={{ fontSize: 13, fontWeight: 600, color: S.text, fontFamily: S.sans }}>
                      {c.name}
                    </span>
                  </div>
                  <span style={{
                    fontSize: 12, color: hovered === c.slug ? S.teal : S.muted,
                    transition: 'color 0.12s',
                  }}>→</span>
                </button>
              ))}
            </div>
          </>
        )}

      </div>

      <Footer />
    </div>
  )
}

// ── Root ──────────────────────────────────────────────────────────────────

export default function PlaybookPage() {
  const { user, loading, isPro } = useAuth()

  // Show nothing while auth resolves to avoid flash
  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: S.bg }}>
        <Nav />
      </div>
    )
  }

  // Not signed in OR signed in but not pro → gate
  if (!user || !isPro) {
    return <GateScreen signedIn={!!user} />
  }

  // Pro user → full page
  return <ProScreen />
}
