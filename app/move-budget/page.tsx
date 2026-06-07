'use client'

import { useState, useEffect, useMemo, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import { FlagIcon } from '@/components/FlagIcon'
import { slugToIso } from '@/lib/flagCodes'
import { supabase } from '@/lib/supabase'

// ── Types ─────────────────────────────────────────────────────────────────────

interface CountryRow {
  slug: string
  name: string
  flag_emoji: string
  currency: string
  continent: string
}

interface CostData {
  costRentCityCentre: number
  costGroceriesMonthly: number
  costTransportMonthly: number
  costUtilitiesMonthly: number
  incomeTaxRateMid: number
}

// ── Static data ────────────────────────────────────────────────────────────────

// Visa fees in EUR (approximate, based on official sources)
const VISA_FEES: Record<string, number> = {
  portugal: 90, germany: 75, spain: 80, netherlands: 75, ireland: 60,
  france: 99, italy: 80, sweden: 60, norway: 70, switzerland: 65,
  austria: 80, belgium: 80, denmark: 60, finland: 60,
  'united-kingdom': 115, singapore: 30, uae: 100, australia: 145,
  canada: 150, japan: 30, 'south-korea': 60, thailand: 40,
  georgia: 0, indonesia: 50, 'south-africa': 30, estonia: 80,
  hungary: 80, cyprus: 80, romania: 80, serbia: 65, argentina: 0,
  usa: 160, mexico: 36, colombia: 52, panama: 50,
  'new-zealand': 165, malaysia: 25, india: 40, brazil: 60,
}

// Extra visa costs (translations, notarisation, medical, photos, travel to embassy)
const VISA_EXTRAS: Record<string, number> = {
  portugal: 250, germany: 300, 'united-kingdom': 200, australia: 250,
  canada: 350, usa: 300, singapore: 150, uae: 200, japan: 100,
  // EU tier (free movement — nominal admin)
  ireland: 50, france: 50, spain: 80, netherlands: 50,
  // defaults
}
const getVisaExtras = (slug: string) => VISA_EXTRAS[slug] ?? 180

// Flight estimates in EUR from Western Europe (adjust by origin region)
const FLIGHT_BY_CONTINENT: Record<string, number> = {
  Europe: 150, Asia: 600, Oceania: 800, Americas: 700,
  Africa: 500, 'Middle East': 400,
}

// Setup costs: SIM + transit pass + first-week extras + short-stay gap
const SETUP_BY_TIER: Record<string, number> = {
  expensive: 600, mid: 350, cheap: 200,
}
const COUNTRY_SETUP_TIER: Record<string, string> = {
  'united-kingdom': 'expensive', norway: 'expensive', switzerland: 'expensive',
  singapore: 'expensive', uae: 'expensive', australia: 'expensive', canada: 'expensive',
  usa: 'expensive', japan: 'mid', germany: 'mid', netherlands: 'mid',
  ireland: 'mid', france: 'mid', sweden: 'mid', denmark: 'mid',
  portugal: 'mid', spain: 'mid', italy: 'mid',
  georgia: 'cheap', thailand: 'cheap', indonesia: 'cheap', malaysia: 'cheap',
  'south-africa': 'cheap', argentina: 'cheap', colombia: 'cheap',
}
const getSetupCost = (slug: string) => SETUP_BY_TIER[COUNTRY_SETUP_TIER[slug] ?? 'mid']

// Currency → EUR rates (approximate)
const TO_EUR: Record<string, number> = {
  EUR: 1, USD: 0.93, GBP: 1.17, AUD: 0.60, CAD: 0.68,
  SGD: 0.69, AED: 0.25, CHF: 1.04, JPY: 0.0062, KRW: 0.00069,
  THB: 0.026, MYR: 0.20, IDR: 0.000062, ZAR: 0.051,
  COP: 0.00022, GEL: 0.34, VND: 0.000036, MXN: 0.054,
  CZK: 0.041, PLN: 0.23, RON: 0.20, RSD: 0.0086, HUF: 0.0026,
  BRL: 0.18, INR: 0.011, NZD: 0.56, NOK: 0.086, SEK: 0.089, DKK: 0.134,
  ARS: 0.001,
}

const toEur = (amount: number, currency: string) => Math.round(amount * (TO_EUR[currency] ?? 1))

const BUFFER_MONTHS = 3

// ── Component ─────────────────────────────────────────────────────────────────

function MoveBudgetContent() {
  const searchParams = useSearchParams()
  const initialSlug = searchParams.get('country') ?? ''

  const [countries, setCountries] = useState<CountryRow[]>([])
  const [slug, setSlug] = useState(initialSlug)
  const [costData, setCostData] = useState<CostData | null>(null)
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [monthlySavings, setMonthlySavings] = useState<string>('')
  const [expandedBucket, setExpandedBucket] = useState<string | null>(null)

  // Load all countries
  useEffect(() => {
    supabase.from('countries').select('slug, name, flag_emoji, currency, continent').order('name')
      .then(({ data }) => { if (data) setCountries(data as CountryRow[]) })
  }, [])

  // Load cost data when slug changes
  useEffect(() => {
    if (!slug) { setCostData(null); return }
    setLoading(true);
    (async () => {
      const { data: country } = await supabase.from('countries').select('id').eq('slug', slug).single()
      if (!country) { setLoading(false); return }
      const { data } = await supabase.from('country_data')
        .select('costRentCityCentre, costGroceriesMonthly, costTransportMonthly, costUtilitiesMonthly, incomeTaxRateMid')
        .eq('country_id', country.id)
        .single()
      setCostData(data as CostData | null)
      setLoading(false)
    })()
  }, [slug])

  const selected = countries.find(c => c.slug === slug)

  const budget = useMemo(() => {
    if (!selected || !costData) return null
    const cur = selected.currency
    const rentEur = toEur(costData.costRentCityCentre, cur)
    const grocEur = toEur(costData.costGroceriesMonthly, cur)
    const transEur = toEur(costData.costTransportMonthly, cur)
    const utilEur = toEur(costData.costUtilitiesMonthly, cur)
    const monthlyTotal = rentEur + grocEur + transEur + utilEur

    const visaFee = VISA_FEES[slug] ?? 80
    const visaExtras = getVisaExtras(slug)
    const visaTotal = visaFee + visaExtras

    const continent = selected.continent ?? 'Europe'
    const flightEst = FLIGHT_BY_CONTINENT[continent] ?? 400

    const deposit = rentEur * 2  // first month + deposit
    const landingTotal = deposit

    const setupTotal = getSetupCost(slug)

    const buffer = monthlyTotal * BUFFER_MONTHS

    const grandTotal = visaTotal + flightEst + landingTotal + setupTotal + buffer

    return {
      visaTotal, visaFee, visaExtras,
      flightEst,
      landingTotal, deposit, rentEur,
      setupTotal,
      buffer, monthlyTotal,
      grandTotal,
    }
  }, [selected, costData, slug])

  const monthsToMove = useMemo(() => {
    const s = parseFloat(monthlySavings.replace(/[^0-9.]/g, ''))
    if (!budget || !s || s <= 0) return null
    return Math.ceil(budget.grandTotal / s)
  }, [budget, monthlySavings])

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return q ? countries.filter(c => c.name.toLowerCase().includes(q) || c.slug.includes(q)) : countries
  }, [countries, search])

  const S = {
    bg: '#0a0a0a', card: '#111111', border: 'rgba(255,255,255,0.07)',
    dim: 'rgba(255,255,255,0.45)', serif: "'Cabinet Grotesk', sans-serif",
    sans: "'Satoshi', sans-serif", amber: '#f0b07a',
  }

  const buckets = budget ? [
    {
      id: 'visa',
      icon: '📋',
      label: 'Visa & documents',
      amount: budget.visaTotal,
      color: '#c084fc',
      desc: 'Application fee, translations, notarisation, medical exam, passport photos.',
      breakdown: [
        { label: 'Visa application fee', amount: budget.visaFee },
        { label: 'Translations & notarisation', amount: budget.visaExtras },
      ],
    },
    {
      id: 'flight',
      icon: '✈️',
      label: 'Getting there',
      amount: budget.flightEst,
      color: '#7dd3fc',
      desc: 'One-way economy flight with checked luggage. Estimate based on destination region.',
      breakdown: [
        { label: 'One-way flight (economy)', amount: budget.flightEst },
      ],
    },
    {
      id: 'landing',
      icon: '🏠',
      label: 'Landing costs',
      amount: budget.landingTotal,
      color: '#f0b07a',
      desc: 'First month rent + security deposit (2 months). Agency fee not included.',
      breakdown: [
        { label: 'First month rent', amount: budget.rentEur },
        { label: 'Security deposit (1 month)', amount: budget.rentEur },
      ],
    },
    {
      id: 'setup',
      icon: '🧳',
      label: 'Setup costs',
      amount: budget.setupTotal,
      color: '#4ade80',
      desc: 'SIM card, transit pass, short-stay gap (Airbnb before rental starts), basic supplies.',
      breakdown: [
        { label: 'SIM + transit pass', amount: Math.round(budget.setupTotal * 0.3) },
        { label: 'Short-stay gap (Airbnb)', amount: Math.round(budget.setupTotal * 0.5) },
        { label: 'Misc setup', amount: Math.round(budget.setupTotal * 0.2) },
      ],
    },
    {
      id: 'buffer',
      icon: '🛡️',
      label: `${BUFFER_MONTHS}-month buffer`,
      amount: budget.buffer,
      color: '#00ffd5',
      desc: `${BUFFER_MONTHS} months of living costs (rent + groceries + transport + utilities). Don't leave without this.`,
      breakdown: [
        { label: 'Monthly living costs', amount: budget.monthlyTotal },
        { label: `× ${BUFFER_MONTHS} months`, amount: budget.buffer },
      ],
    },
  ] : []

  return (
    <div style={{ background: S.bg, color: '#fff', minHeight: '100vh', fontFamily: S.sans }}>
      <Nav countries={[]} onCountrySelect={() => {}} />

      <div style={{ maxWidth: 760, margin: '0 auto', padding: 'clamp(90px,10vw,110px) clamp(20px,4vw,40px) 80px' }}>

        {/* Header */}
        <div style={{ marginBottom: 48 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: S.dim, marginBottom: 12 }}>Move Budget</div>
          <h1 style={{ fontFamily: S.serif, fontSize: 'clamp(32px,5vw,52px)', fontWeight: 400, color: '#fff', margin: '0 0 16px', lineHeight: 1.1 }}>
            What do you need in your bank account?
          </h1>
          <p style={{ fontSize: 15, color: S.dim, lineHeight: 1.6, margin: 0, maxWidth: 580 }}>
            Not monthly costs. The upfront capital you need before you can actually go. Visa fees, flights, deposit, setup, and a buffer.
          </p>
        </div>

        {/* Country picker */}
        <div style={{ marginBottom: 36 }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: S.dim, marginBottom: 10 }}>Choose destination</div>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search countries…"
            style={{ width: '100%', boxSizing: 'border-box', padding: '12px 16px', background: S.card, border: `1px solid ${S.border}`, color: '#fff', fontSize: 14, fontFamily: S.sans, outline: 'none', marginBottom: 8 }}
          />
          {search && (
            <div style={{ background: S.card, border: `1px solid ${S.border}`, maxHeight: 240, overflowY: 'auto' }}>
              {filtered.slice(0, 12).map(c => (
                <button
                  key={c.slug}
                  onClick={() => { setSlug(c.slug); setSearch('') }}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: 'none', border: 'none', color: '#fff', fontFamily: S.sans, fontSize: 13, cursor: 'pointer', textAlign: 'left', borderBottom: `1px solid rgba(255,255,255,0.04)` }}
                >
                  {slugToIso(c.slug) ? <FlagIcon code={slugToIso(c.slug)!} size="sm" /> : <span>{c.flag_emoji}</span>}
                  {c.name}
                </button>
              ))}
            </div>
          )}
          {!search && selected && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', background: S.card, border: `1px solid ${S.border}` }}>
              {slugToIso(slug) ? <FlagIcon code={slugToIso(slug)!} size="sm" /> : <span>{selected.flag_emoji}</span>}
              <span style={{ fontSize: 14, fontWeight: 600 }}>{selected.name}</span>
              <button onClick={() => setSlug('')} style={{ marginLeft: 'auto', fontSize: 11, color: S.dim, background: 'none', border: 'none', cursor: 'pointer' }}>Change ×</button>
            </div>
          )}
        </div>

        {/* Loading */}
        {loading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[1,2,3,4,5].map(i => (
              <div key={i} style={{ height: 72, background: S.card, border: `1px solid ${S.border}`, borderRadius: 12, opacity: 0.5 }} />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && !slug && (
          <div style={{ textAlign: 'center', padding: '60px 0', color: S.dim }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>🌍</div>
            <p style={{ fontSize: 15 }}>Search for a country above to see your move budget.</p>
          </div>
        )}

        {/* Results */}
        {!loading && budget && selected && (
          <>
            {/* Grand total */}
            <div style={{ background: S.card, border: `1px solid rgba(240,176,122,0.3)`, borderRadius: 14, padding: '28px 32px', marginBottom: 24, textAlign: 'center' }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: S.amber, marginBottom: 10 }}>
                Moving to {selected.name} costs roughly
              </div>
              <div style={{ fontFamily: S.serif, fontSize: 'clamp(48px, 8vw, 72px)', color: '#fff', lineHeight: 1, marginBottom: 8 }}>
                €{budget.grandTotal.toLocaleString()}
              </div>
              <div style={{ fontSize: 13, color: S.dim }}>upfront, before your first month's salary</div>
            </div>

            {/* Bucket breakdown */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 32 }}>
              {buckets.map(b => (
                <div key={b.id} style={{ background: S.card, border: `1px solid ${S.border}`, borderRadius: 14, overflow: 'hidden' }}>
                  <button
                    onClick={() => setExpandedBucket(expandedBucket === b.id ? null : b.id)}
                    style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 16, padding: '18px 22px', background: 'none', border: 'none', color: '#fff', fontFamily: S.sans, cursor: 'pointer', textAlign: 'left' }}
                  >
                    <span style={{ fontSize: 20, flexShrink: 0 }}>{b.icon}</span>
                    <span style={{ flex: 1, fontSize: 14, fontWeight: 600 }}>{b.label}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      {/* Mini bar */}
                      <div style={{ width: 80, height: 4, background: 'rgba(255,255,255,0.07)', borderRadius: 100, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${Math.round((b.amount / budget.grandTotal) * 100)}%`, background: b.color, borderRadius: 100 }} />
                      </div>
                      <span style={{ fontFamily: S.serif, fontSize: 18, color: b.color, minWidth: 70, textAlign: 'right' }}>€{b.amount.toLocaleString()}</span>
                      <span style={{ fontSize: 12, color: S.dim, transform: expandedBucket === b.id ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>▾</span>
                    </div>
                  </button>
                  {expandedBucket === b.id && (
                    <div style={{ padding: '0 22px 18px', borderTop: `1px solid rgba(255,255,255,0.04)` }}>
                      <p style={{ fontSize: 13, color: S.dim, lineHeight: 1.6, margin: '12px 0 16px' }}>{b.desc}</p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {b.breakdown.map((row, i) => (
                          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: S.dim, padding: '4px 0', borderBottom: i < b.breakdown.length - 1 ? `1px solid rgba(255,255,255,0.04)` : 'none' }}>
                            <span>{row.label}</span>
                            <span style={{ color: '#fff', fontWeight: 600 }}>€{row.amount.toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Savings calculator */}
            <div style={{ background: S.card, border: `1px solid ${S.border}`, borderRadius: 14, padding: '24px 28px', marginBottom: 32 }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: S.dim, marginBottom: 16 }}>When can you go?</div>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ flex: '1 1 200px', display: 'flex', alignItems: 'center', gap: 0 }}>
                  <span style={{ padding: '0 14px', background: 'rgba(255,255,255,0.05)', border: `1px solid ${S.border}`, borderRight: 'none', fontSize: 14, color: S.dim, height: 44, display: 'flex', alignItems: 'center' }}>€</span>
                  <input
                    type="number"
                    placeholder="Your monthly savings"
                    value={monthlySavings}
                    onChange={e => setMonthlySavings(e.target.value)}
                    style={{ flex: 1, padding: '0 14px', height: 44, background: 'rgba(255,255,255,0.04)', border: `1px solid ${S.border}`, color: '#fff', fontSize: 14, fontFamily: S.sans, outline: 'none' }}
                  />
                  <span style={{ padding: '0 14px', background: 'rgba(255,255,255,0.05)', border: `1px solid ${S.border}`, borderLeft: 'none', fontSize: 12, color: S.dim, height: 44, display: 'flex', alignItems: 'center', whiteSpace: 'nowrap' }}>/mo saved</span>
                </div>
                {monthsToMove !== null && (
                  <div style={{ flex: '1 1 160px', padding: '12px 16px', background: 'rgba(0,255,213,0.08)', border: '1px solid rgba(0,255,213,0.2)', borderRadius: 10 }}>
                    <span style={{ fontSize: 22, fontFamily: S.serif, color: '#00ffd5' }}>{monthsToMove} months</span>
                    <span style={{ fontSize: 12, color: S.dim, display: 'block', marginTop: 2 }}>
                      {monthsToMove <= 3 ? 'You could go soon.' : monthsToMove <= 12 ? 'This year is realistic.' : 'Plan for next year.'}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Playbook CTA */}
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <Link href={`/country/${slug}/playbook`}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#fff', color: '#0a0a0a', fontWeight: 800, fontSize: 12, letterSpacing: '0.14em', textTransform: 'uppercase', padding: '14px 28px', textDecoration: 'none' }}>
                📋 Open The Playbook for {selected.name} →
              </Link>
              <Link href={`/country/${slug}/personalised`}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'transparent', color: S.dim, border: `1px solid ${S.border}`, fontWeight: 700, fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '14px 28px', textDecoration: 'none' }}>
                ← Full country report
              </Link>
            </div>

            {/* Disclaimer */}
            <p style={{ marginTop: 24, fontSize: 11, color: 'rgba(255,255,255,0.2)', lineHeight: 1.6 }}>
              All figures are estimates in EUR. Visa fees, flight prices, and deposit requirements vary. Verify official costs before planning your move. Monthly costs from Origio city data; exchange rates approximate.
            </p>
          </>
        )}

      </div>
      <Footer />
    </div>
  )
}

export default function MoveBudgetPage() {
  return (
    <Suspense fallback={<div style={{ background: '#0a0a0a', minHeight: '100vh' }} />}>
      <MoveBudgetContent />
    </Suspense>
  )
}
