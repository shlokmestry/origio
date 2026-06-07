'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import { FlagIcon } from '@/components/FlagIcon'
import { slugToIso } from '@/lib/flagCodes'
import { supabase } from '@/lib/supabase'

interface CountryRow {
  slug: string
  name: string
  flag_emoji: string
}

const S = {
  bg: '#0a0a0a',
  card: '#111111',
  border: 'rgba(255,255,255,0.07)',
  dim: 'rgba(255,255,255,0.45)',
  serif: "'Cabinet Grotesk', sans-serif",
  sans: "'Satoshi', sans-serif",
  teal: '#00ffd5',
}

export default function PlaybookLandingPage() {
  const router = useRouter()
  const [countries, setCountries] = useState<CountryRow[]>([])
  const [search, setSearch] = useState('')
  const [hovered, setHovered] = useState<string | null>(null)

  useEffect(() => {
    supabase.from('countries').select('slug, name, flag_emoji').order('name')
      .then(({ data }) => { if (data) setCountries(data as CountryRow[]) })
  }, [])

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return q ? countries.filter(c => c.name.toLowerCase().includes(q) || c.slug.includes(q)) : countries
  }, [countries, search])

  const FEATURED = ['portugal', 'germany', 'spain', 'netherlands', 'thailand', 'georgia', 'canada', 'australia', 'singapore', 'japan', 'united-kingdom', 'uae']
  const featured = countries.filter(c => FEATURED.includes(c.slug))

  function go(slug: string) {
    router.push(`/country/${slug}/playbook`)
  }

  return (
    <div style={{ background: S.bg, minHeight: '100vh', fontFamily: S.sans }}>
      <Nav />

      <div style={{ maxWidth: 760, margin: '0 auto', padding: '120px 24px 80px' }}>

        {/* Hero */}
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.1em', color: S.teal, textTransform: 'uppercase', marginBottom: 16 }}>
            Pro Feature
          </div>
          <h1 style={{ fontFamily: S.serif, fontSize: 'clamp(36px, 6vw, 56px)', fontWeight: 800, color: '#fff', lineHeight: 1.05, letterSpacing: '-0.03em', margin: '0 0 20px' }}>
            The Playbook
          </h1>
          <p style={{ fontSize: 18, color: S.dim, lineHeight: 1.6, maxWidth: 500, margin: '0 auto 0' }}>
            Pick your destination and get a step-by-step relocation plan — visa, money, housing, and life admin, all in one place.
          </p>
        </div>

        {/* Track pills */}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 52 }}>
          {[
            { icon: '📋', label: 'Papers', color: '#f0b07a' },
            { icon: '💳', label: 'Money', color: S.teal },
            { icon: '🏠', label: 'Home', color: '#c084fc' },
            { icon: '✅', label: 'Life Admin', color: '#4ade80' },
          ].map(t => (
            <div key={t.label} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 100, border: `1px solid ${t.color}30`, background: `${t.color}10`, fontSize: 13, fontWeight: 600, color: t.color }}>
              {t.icon} {t.label}
            </div>
          ))}
        </div>

        {/* Search */}
        <div style={{ position: 'relative', marginBottom: 12 }}>
          <span style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', fontSize: 16, pointerEvents: 'none' }}>🔍</span>
          <input
            type="text"
            placeholder="Search for a country…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            autoFocus
            style={{
              width: '100%', boxSizing: 'border-box',
              background: S.card, border: `1px solid ${S.border}`,
              borderRadius: 12, padding: '14px 16px 14px 44px',
              fontSize: 16, color: '#fff', outline: 'none',
              fontFamily: S.sans,
            }}
          />
        </div>

        {/* Featured countries (shown when no search) */}
        {!search && (
          <>
            <p style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 12, marginTop: 32 }}>
              Popular destinations
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 10, marginBottom: 40 }}>
              {featured.map(c => (
                <button
                  key={c.slug}
                  onClick={() => go(c.slug)}
                  onMouseEnter={() => setHovered(c.slug)}
                  onMouseLeave={() => setHovered(null)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    background: hovered === c.slug ? '#1a1a1a' : S.card,
                    border: `1px solid ${hovered === c.slug ? 'rgba(0,255,213,0.25)' : S.border}`,
                    borderRadius: 10, padding: '12px 14px',
                    cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s',
                  }}
                >
                  <FlagIcon code={slugToIso(c.slug) ?? c.slug} size="sm" />
                  <span style={{ fontSize: 14, fontWeight: 600, color: hovered === c.slug ? '#fff' : 'rgba(255,255,255,0.75)', fontFamily: S.sans }}>
                    {c.name}
                  </span>
                </button>
              ))}
            </div>
          </>
        )}

        {/* Search results */}
        {search && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 8 }}>
            {filtered.length === 0 && (
              <p style={{ color: S.dim, fontSize: 14, padding: '16px 0' }}>No countries found.</p>
            )}
            {filtered.map(c => (
              <button
                key={c.slug}
                onClick={() => go(c.slug)}
                onMouseEnter={() => setHovered(c.slug)}
                onMouseLeave={() => setHovered(null)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  background: hovered === c.slug ? '#1a1a1a' : 'transparent',
                  border: `1px solid ${hovered === c.slug ? S.border : 'transparent'}`,
                  borderRadius: 8, padding: '10px 12px',
                  cursor: 'pointer', textAlign: 'left', transition: 'all 0.12s',
                }}
              >
                <FlagIcon code={slugToIso(c.slug) ?? c.slug} size="sm" />
                <span style={{ fontSize: 15, fontWeight: 500, color: '#fff', fontFamily: S.sans }}>{c.name}</span>
              </button>
            ))}
          </div>
        )}

        {/* Value props */}
        {!search && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16, marginTop: 16 }}>
            {[
              { icon: '🎯', title: 'Step-by-step plan', desc: 'Every action in order, nothing missed.' },
              { icon: '📊', title: 'Move Readiness Score', desc: 'See your progress as a live percentage.' },
              { icon: '🔗', title: 'Curated resources', desc: 'Official links, affiliate partners, communities.' },
              { icon: '🛂', title: 'Passport-aware', desc: 'Steps adapt to your passport tier automatically.' },
            ].map(v => (
              <div key={v.title} style={{ background: S.card, border: `1px solid ${S.border}`, borderRadius: 12, padding: '20px' }}>
                <div style={{ fontSize: 24, marginBottom: 10 }}>{v.icon}</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 6 }}>{v.title}</div>
                <div style={{ fontSize: 13, color: S.dim, lineHeight: 1.5 }}>{v.desc}</div>
              </div>
            ))}
          </div>
        )}

      </div>

      <Footer />
    </div>
  )
}
