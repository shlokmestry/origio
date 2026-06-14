'use client'

import { useState, useMemo, useCallback } from 'react'
import Link from 'next/link'
import styles from './cities.module.css'
import { City } from '@/types'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import { FlagIcon } from '@/components/FlagIcon'
import { slugToIso } from '@/lib/flagCodes'

export type CityItem = City

// ── Static supplementary data ─────────────────────────────────────────────

type ClimateBand = 'warm' | 'temperate' | 'cool'
type Vibe = 'remote' | 'culture' | 'beach' | 'family' | 'nightlife' | 'budget'
type VisaType = 'nomad' | 'sponsor' | 'visa-free' | 'investor' | 'income'
type InternetQuality = 'excellent' | 'good' | 'ok'
type EnglishLevel = 'very-high' | 'high' | 'moderate'
type SafetyLevel = 'very-safe' | 'safe' | 'moderate'
type CityStatus = 'live' | 'soon'
type Region = 'europe' | 'asia' | 'americas' | 'middleeast'

interface CityExtra {
  climateBand: ClimateBand
  climate: string
  vibes: Vibe[]
  rentEur: number
  region: Region
  visa?: VisaType
  internet?: InternetQuality
  english?: EnglishLevel
  safety?: SafetyLevel
  status?: CityStatus
}

// rentEur: approximate EUR equivalent using May 2026 rates
// GBP×1.18  USD×0.92  CAD×0.68  SGD×0.68  JPY×0.0064  AUD×0.59  AED×0.25
const CITY_EXTRAS: Record<string, CityExtra> = {
  // ── Live cities ────────────────────────────────────────────────────────────
  lisbon:              { climateBand:'warm',      climate:'Mediterranean',             vibes:['remote','culture','beach','budget'],         rentEur:1200,  region:'europe',     visa:'nomad',     internet:'excellent', english:'high',      safety:'very-safe', status:'live' },
  london:              { climateBand:'temperate', climate:'Oceanic',                   vibes:['remote','culture','nightlife'],              rentEur:2600,  region:'europe',     visa:'sponsor',   internet:'excellent', english:'very-high', safety:'safe',      status:'live' },
  dublin:              { climateBand:'cool',      climate:'Oceanic',                   vibes:['remote','culture','nightlife'],              rentEur:2200,  region:'europe',     visa:'sponsor',   internet:'good',      english:'very-high', safety:'very-safe', status:'live' },
  amsterdam:           { climateBand:'temperate', climate:'Oceanic',                   vibes:['remote','culture','nightlife'],              rentEur:1950,  region:'europe',     visa:'visa-free', internet:'excellent', english:'very-high', safety:'very-safe', status:'live' },
  berlin:              { climateBand:'temperate', climate:'Continental',               vibes:['remote','nightlife','culture','budget'],     rentEur:1350,  region:'europe',     visa:'nomad',     internet:'good',      english:'high',      safety:'safe',      status:'live' },
  barcelona:           { climateBand:'warm',      climate:'Mediterranean',             vibes:['remote','beach','nightlife'],                rentEur:1450,  region:'europe',     visa:'nomad',     internet:'good',      english:'moderate',  safety:'safe',      status:'live' },
  malaga:              { climateBand:'warm',      climate:'Mediterranean',             vibes:['remote','beach','culture'],                  rentEur:1000,  region:'europe',     visa:'nomad',     internet:'excellent', english:'moderate',  safety:'very-safe', status:'live' },
  tbilisi:             { climateBand:'temperate', climate:'Continental',               vibes:['remote','culture','budget'],                 rentEur:630,   region:'europe',     visa:'visa-free', internet:'good',      english:'moderate',  safety:'safe',      status:'live' },
  tallinn:             { climateBand:'cool',      climate:'Continental',               vibes:['remote','culture','family'],                 rentEur:840,   region:'europe',     visa:'nomad',     internet:'excellent', english:'very-high', safety:'very-safe', status:'live' },
  porto:               { climateBand:'warm',      climate:'Atlantic Mediterranean',    vibes:['budget','culture','remote'],                 rentEur:950,   region:'europe',     visa:'nomad',     internet:'good',      english:'high',      safety:'very-safe', status:'live' },
  paris:               { climateBand:'temperate', climate:'Oceanic',                   vibes:['culture','nightlife','remote'],              rentEur:1800,  region:'europe',     visa:'sponsor',   internet:'excellent', english:'moderate',  safety:'safe',      status:'live' },
  milan:               { climateBand:'temperate', climate:'Continental',               vibes:['culture','nightlife','remote'],              rentEur:1500,  region:'europe',     visa:'sponsor',   internet:'excellent', english:'moderate',  safety:'safe',      status:'live' },
  rome:                { climateBand:'warm',      climate:'Mediterranean',             vibes:['culture','beach','remote'],                  rentEur:1200,  region:'europe',     visa:'sponsor',   internet:'good',      english:'moderate',  safety:'safe',      status:'live' },
  athens:              { climateBand:'warm',      climate:'Mediterranean',             vibes:['remote','culture','beach','budget'],         rentEur:850,   region:'europe',     visa:'nomad',     internet:'good',      english:'high',      safety:'very-safe', status:'live' },
  munich:              { climateBand:'temperate', climate:'Continental',               vibes:['family','culture','remote'],                 rentEur:1840,  region:'europe',     visa:'sponsor',   internet:'excellent', english:'high',      safety:'very-safe', status:'live' },
  vienna:              { climateBand:'temperate', climate:'Continental',               vibes:['culture','family','remote'],                 rentEur:1300,  region:'europe',     visa:'sponsor',   internet:'excellent', english:'high',      safety:'very-safe', status:'live' },
  prague:              { climateBand:'temperate', climate:'Continental',               vibes:['budget','culture','nightlife','remote'],     rentEur:900,   region:'europe',     visa:'sponsor',   internet:'excellent', english:'high',      safety:'very-safe', status:'live' },
  budapest:            { climateBand:'temperate', climate:'Continental',               vibes:['budget','culture','nightlife','remote'],     rentEur:800,   region:'europe',     visa:'nomad',     internet:'good',      english:'high',      safety:'very-safe', status:'live' },
  warsaw:              { climateBand:'cool',      climate:'Continental',               vibes:['budget','culture','remote'],                 rentEur:900,   region:'europe',     visa:'sponsor',   internet:'excellent', english:'high',      safety:'very-safe', status:'live' },
  stockholm:           { climateBand:'cool',      climate:'Continental',               vibes:['culture','family','remote'],                 rentEur:1600,  region:'europe',     visa:'sponsor',   internet:'excellent', english:'very-high', safety:'very-safe', status:'live' },
  copenhagen:          { climateBand:'cool',      climate:'Oceanic',                   vibes:['culture','family','remote'],                 rentEur:1700,  region:'europe',     visa:'sponsor',   internet:'excellent', english:'very-high', safety:'very-safe', status:'live' },
  helsinki:            { climateBand:'cool',      climate:'Subarctic',                 vibes:['culture','family','remote'],                 rentEur:1500,  region:'europe',     visa:'sponsor',   internet:'excellent', english:'very-high', safety:'very-safe', status:'live' },
  oslo:                { climateBand:'cool',      climate:'Oceanic',                   vibes:['culture','family','remote'],                 rentEur:1800,  region:'europe',     visa:'sponsor',   internet:'excellent', english:'very-high', safety:'very-safe', status:'live' },
  brussels:            { climateBand:'temperate', climate:'Oceanic',                   vibes:['culture','family','remote'],                 rentEur:1200,  region:'europe',     visa:'sponsor',   internet:'excellent', english:'very-high', safety:'safe',      status:'live' },
  zurich:              { climateBand:'temperate', climate:'Continental',               vibes:['remote','culture','family'],                 rentEur:2500,  region:'europe',     visa:'sponsor',   internet:'excellent', english:'very-high', safety:'very-safe', status:'live' },
  limassol:            { climateBand:'warm',      climate:'Mediterranean',             vibes:['remote','beach','culture'],                  rentEur:1300,  region:'europe',     visa:'nomad',     internet:'good',      english:'very-high', safety:'very-safe', status:'live' },
  split:               { climateBand:'warm',      climate:'Mediterranean',             vibes:['beach','culture','remote','budget'],         rentEur:850,   region:'europe',     visa:'nomad',     internet:'good',      english:'high',      safety:'very-safe', status:'live' },
  bucharest:           { climateBand:'temperate', climate:'Continental',               vibes:['budget','culture','remote'],                 rentEur:600,   region:'europe',     visa:'sponsor',   internet:'excellent', english:'high',      safety:'safe',      status:'live' },
  belgrade:            { climateBand:'temperate', climate:'Continental',               vibes:['budget','nightlife','culture','remote'],     rentEur:700,   region:'europe',     visa:'visa-free', internet:'good',      english:'high',      safety:'safe',      status:'live' },
  'new-york':          { climateBand:'temperate', climate:'Continental',               vibes:['remote','culture','nightlife'],              rentEur:3500,  region:'americas',   visa:'sponsor',   internet:'excellent', english:'very-high', safety:'moderate',  status:'live' },
  toronto:             { climateBand:'cool',      climate:'Continental',               vibes:['family','culture','remote'],                 rentEur:1630,  region:'americas',   visa:'income',    internet:'excellent', english:'very-high', safety:'very-safe', status:'live' },
  vancouver:           { climateBand:'temperate', climate:'Oceanic',                   vibes:['family','beach','remote'],                   rentEur:1748,  region:'americas',   visa:'income',    internet:'excellent', english:'very-high', safety:'very-safe', status:'live' },
  miami:               { climateBand:'warm',      climate:'Subtropical',               vibes:['beach','nightlife','remote'],                rentEur:2300,  region:'americas',   visa:'sponsor',   internet:'excellent', english:'very-high', safety:'moderate',  status:'live' },
  medellin:            { climateBand:'warm',      climate:'Subtropical Highland',      vibes:['remote','budget','culture','nightlife'],     rentEur:680,   region:'americas',   visa:'nomad',     internet:'excellent', english:'moderate',  safety:'moderate',  status:'live' },
  'mexico-city':       { climateBand:'temperate', climate:'High-altitude Subtropical', vibes:['remote','culture','nightlife','budget'],     rentEur:1050,  region:'americas',   visa:'income',    internet:'excellent', english:'moderate',  safety:'moderate',  status:'live' },
  'buenos-aires':      { climateBand:'temperate', climate:'Humid Subtropical',         vibes:['remote','culture','nightlife','budget'],     rentEur:490,   region:'americas',   visa:'nomad',     internet:'good',      english:'moderate',  safety:'moderate',  status:'live' },
  'sao-paulo':         { climateBand:'warm',      climate:'Subtropical',               vibes:['culture','nightlife','remote'],              rentEur:700,   region:'americas',   visa:'nomad',     internet:'good',      english:'moderate',  safety:'moderate',  status:'live' },
  'panama-city':       { climateBand:'warm',      climate:'Tropical',                  vibes:['remote','budget','culture'],                 rentEur:900,   region:'americas',   visa:'income',    internet:'good',      english:'high',      safety:'moderate',  status:'live' },
  'san-jose-cr':       { climateBand:'warm',      climate:'Subtropical Highland',      vibes:['remote','budget','culture'],                 rentEur:800,   region:'americas',   visa:'income',    internet:'good',      english:'moderate',  safety:'moderate',  status:'live' },
  singapore:           { climateBand:'warm',      climate:'Tropical',                  vibes:['remote','family','culture'],                 rentEur:2580,  region:'asia',       visa:'sponsor',   internet:'excellent', english:'very-high', safety:'very-safe', status:'live' },
  tokyo:               { climateBand:'temperate', climate:'Humid Subtropical',         vibes:['culture','remote','nightlife','budget'],     rentEur:900,   region:'asia',       visa:'investor',  internet:'excellent', english:'moderate',  safety:'very-safe', status:'live' },
  osaka:               { climateBand:'temperate', climate:'Humid Subtropical',         vibes:['culture','budget','nightlife'],              rentEur:470,   region:'asia',       visa:'investor',  internet:'excellent', english:'moderate',  safety:'very-safe', status:'live' },
  seoul:               { climateBand:'temperate', climate:'Continental',               vibes:['culture','nightlife','remote','budget'],     rentEur:950,   region:'asia',       visa:'income',    internet:'excellent', english:'moderate',  safety:'very-safe', status:'live' },
  sydney:              { climateBand:'warm',      climate:'Oceanic',                   vibes:['beach','family','remote'],                   rentEur:1530,  region:'asia',       visa:'sponsor',   internet:'good',      english:'very-high', safety:'very-safe', status:'live' },
  melbourne:           { climateBand:'temperate', climate:'Oceanic',                   vibes:['culture','nightlife','remote'],              rentEur:1412,  region:'asia',       visa:'sponsor',   internet:'good',      english:'very-high', safety:'very-safe', status:'live' },
  auckland:            { climateBand:'temperate', climate:'Oceanic',                   vibes:['remote','family','beach'],                   rentEur:1700,  region:'asia',       visa:'sponsor',   internet:'good',      english:'very-high', safety:'very-safe', status:'live' },
  bangkok:             { climateBand:'warm',      climate:'Tropical',                  vibes:['remote','nightlife','culture','budget'],     rentEur:580,   region:'asia',       visa:'income',    internet:'excellent', english:'high',      safety:'moderate',  status:'live' },
  bali:                { climateBand:'warm',      climate:'Tropical',                  vibes:['remote','beach','culture','budget'],         rentEur:880,   region:'asia',       visa:'nomad',     internet:'good',      english:'high',      safety:'very-safe', status:'live' },
  'chiang-mai':        { climateBand:'warm',      climate:'Subtropical',               vibes:['remote','budget','culture'],                 rentEur:310,   region:'asia',       visa:'income',    internet:'good',      english:'moderate',  safety:'very-safe', status:'live' },
  'kuala-lumpur':      { climateBand:'warm',      climate:'Tropical',                  vibes:['remote','family','culture','budget'],        rentEur:590,   region:'asia',       visa:'nomad',     internet:'excellent', english:'very-high', safety:'very-safe', status:'live' },
  'da-nang':           { climateBand:'warm',      climate:'Tropical Monsoon',          vibes:['remote','beach','budget'],                   rentEur:390,   region:'asia',       visa:'visa-free', internet:'good',      english:'moderate',  safety:'very-safe', status:'live' },
  'ho-chi-minh-city':  { climateBand:'warm',      climate:'Tropical',                  vibes:['budget','remote','culture'],                 rentEur:500,   region:'asia',       visa:'visa-free', internet:'good',      english:'moderate',  safety:'very-safe', status:'live' },
  bangalore:           { climateBand:'warm',      climate:'Subtropical Highland',      vibes:['remote','culture','budget'],                 rentEur:450,   region:'asia',       visa:'sponsor',   internet:'excellent', english:'very-high', safety:'safe',      status:'live' },
  dubai:               { climateBand:'warm',      climate:'Desert',                    vibes:['remote','beach','nightlife'],                rentEur:2200,  region:'middleeast', visa:'investor',  internet:'excellent', english:'high',      safety:'very-safe', status:'live' },
  'cape-town':         { climateBand:'warm',      climate:'Mediterranean',             vibes:['remote','beach','culture'],                  rentEur:840,   region:'middleeast', visa:'nomad',     internet:'good',      english:'very-high', safety:'moderate',  status:'live' },
  // ── Coming soon ───────────────────────────────────────────────────────────
  funchal:        { climateBand:'warm',      climate:'Subtropical',               vibes:['remote','beach','culture'],                  rentEur:1100,  region:'europe',     status:'soon' },
  manchester:     { climateBand:'cool',      climate:'Oceanic',                   vibes:['budget','nightlife','remote'],               rentEur:1350,  region:'europe',     status:'soon' },
  edinburgh:      { climateBand:'cool',      climate:'Oceanic',                   vibes:['culture','family','remote'],                 rentEur:1530,  region:'europe',     status:'soon' },
  cork:           { climateBand:'cool',      climate:'Oceanic',                   vibes:['family','budget','remote'],                  rentEur:1450,  region:'europe',     status:'soon' },
  rotterdam:      { climateBand:'temperate', climate:'Oceanic',                   vibes:['culture','remote','budget'],                 rentEur:1530,  region:'europe',     status:'soon' },
  eindhoven:      { climateBand:'temperate', climate:'Oceanic',                   vibes:['remote','family','budget'],                  rentEur:1430,  region:'europe',     status:'soon' },
  hamburg:        { climateBand:'cool',      climate:'Oceanic',                   vibes:['culture','remote','family'],                 rentEur:1320,  region:'europe',     status:'soon' },
  madrid:         { climateBand:'warm',      climate:'Continental',               vibes:['nightlife','culture','remote'],              rentEur:1530,  region:'europe',     status:'soon' },
  valencia:       { climateBand:'warm',      climate:'Mediterranean',             vibes:['beach','remote','budget'],                   rentEur:1120,  region:'europe',     status:'soon' },
  'san-francisco':{ climateBand:'temperate', climate:'Mediterranean',             vibes:['remote','culture'],                          rentEur:3040,  region:'americas',   status:'soon' },
  austin:         { climateBand:'warm',      climate:'Subtropical',               vibes:['remote','nightlife','budget'],               rentEur:1748,  region:'americas',   status:'soon' },
  montreal:       { climateBand:'cool',      climate:'Continental',               vibes:['culture','nightlife','budget'],              rentEur:1142,  region:'americas',   status:'soon' },
  kyoto:          { climateBand:'temperate', climate:'Humid Subtropical',         vibes:['culture','family','budget'],                 rentEur:403,   region:'asia',       status:'soon' },
  brisbane:       { climateBand:'warm',      climate:'Subtropical',               vibes:['beach','family','remote'],                   rentEur:1294,  region:'asia',       status:'soon' },
  'abu-dhabi':    { climateBand:'warm',      climate:'Desert',                    vibes:['family','culture'],                          rentEur:515,   region:'middleeast', status:'soon' },
}

const TOTAL_CITIES = Object.keys(CITY_EXTRAS).length

const CCY: Record<string, string> = {
  EUR:'€', GBP:'£', USD:'$', JPY:'¥', SGD:'S$', AUD:'A$', CAD:'CA$', AED:'AED ',
}

function formatRent(rent: number | undefined, currency: string): string {
  if (rent == null) return '—'
  return `${CCY[currency] ?? currency}${rent.toLocaleString()}`
}

// ── Filter + sort state ───────────────────────────────────────────────────

interface FilterState {
  region: string
}
const DEFAULT_FILTERS: FilterState = { region:'any' }

// ── Helpers ───────────────────────────────────────────────────────────────

function splitName(name: string): [string, string] {
  const letters = name.replace(/[^A-Za-zÀ-ÿ]/g, '')
  const mid = Math.ceil(letters.length / 2)
  let count = 0
  for (let i = 0; i < name.length; i++) {
    if (/[A-Za-zÀ-ÿ]/.test(name[i])) {
      count++
      if (count === mid) return [name.slice(0, i + 1), name.slice(i + 1)]
    }
  }
  return [name, '']
}

// Returns which active filters this city satisfies (for "why" hint)
function matchReasons(extra: CityExtra, filters: FilterState): string[] {
  if (filters.region !== 'any' && extra.region === filters.region) {
    const label: Record<string,string> = { europe:'Europe', asia:'Asia & Pacific', americas:'Americas', middleeast:'Middle East & Africa' }
    return [label[filters.region]]
  }
  return []
}

const VIBE_LABELS: Record<string, string> = {
  remote:    'Remote-friendly',
  family:    'Family',
  nightlife: 'Nightlife',
  culture:   'Culture',
  beach:     'Beach',
  budget:    'Budget',
}

// ── Filter chip component ─────────────────────────────────────────────────

interface ChipGroupProps {
  label: string
  options: { val: string; label: string }[]
  value: string
  onChange: (v: string) => void
}

function ChipGroup({ label, options, value, onChange }: ChipGroupProps) {
  return (
    <div className={styles.chipGroup}>
      <span className={styles.chipLabel}>{label}</span>
      <div className={styles.chips}>
        {options.map(o => (
          <button
            key={o.val}
            type="button"
            className={`${styles.chip}${value === o.val ? ' ' + styles.chipOn : ''}`}
            onClick={() => onChange(o.val)}
            aria-pressed={value === o.val}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────

interface CitiesIndexClientProps { cities: City[] }

export default function CitiesIndexClient({ cities }: CitiesIndexClientProps) {
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS)
  const [search, setSearch] = useState('')
  const enriched = useMemo(() =>
    cities
      .map(c => ({ ...c, extra: CITY_EXTRAS[c.slug] }))
      .filter(c => c.extra?.status === 'live'),
  [cities])

  const filtered = useMemo(() => {
    let list = enriched.slice()

    if (search.trim()) {
      const q = search.trim().toLowerCase()
      list = list.filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.slug.toLowerCase().includes(q) ||
        c.countryName.toLowerCase().includes(q)
      )
    } else if (filters.region !== 'any') {
      list = list.filter(c => c.extra?.region === filters.region)
    }

    list.sort((a, b) => (b.data?.moveScore ?? 0) - (a.data?.moveScore ?? 0))
    return list
  }, [enriched, filters, search])

  const anyFilterActive = filters.region !== 'any'

  const setFilter = useCallback(<K extends keyof FilterState>(key: K, val: string) => {
    setFilters(prev => ({ ...prev, [key]: val }))
    setSearch('')
  }, [])

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS)
    setSearch('')
  }, [])

  const liveCities = useMemo(() =>
    enriched.slice().sort((a, b) => (b.data?.moveScore ?? 0) - (a.data?.moveScore ?? 0)),
  [enriched])

  return (
    <div className={styles.page} style={{ paddingTop: 80 }}>

      <Nav countries={[]} onCountrySelect={() => {}} />

      <div className={styles.pageInner}>

        {/* HERO */}
        <section className={`${styles.heroFrame} ${styles.fu} ${styles.d1}`}>
          <div className={styles.heroType}>
            <span className={styles.typeSolid}>Citi</span>
            <span className={styles.typeOutline}>es</span>
          </div>
        </section>

        {/* CITIES */}
        <section className={`${styles.step} ${styles.fu} ${styles.d2}`}>
          <div className={styles.stepHead}>
            <div>
<h2 className={styles.stepTitle}>Here&rsquo;s what <span className={styles.it}>fits</span>.</h2>
            </div>
            <p className={styles.stepAside}>{filtered.length} {filtered.length === 1 ? 'city' : 'cities'}</p>
          </div>

          {/* ── SEARCH + FILTER BAR ── */}
          <div className={styles.filterBar}>
            {/* Search input */}
            <div className={styles.searchWrap}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0, color: 'var(--c-dimmer)' }}>
                <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M9.5 9.5L12.5 12.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <input
                type="text"
                className={styles.searchInput}
                placeholder="Search cities..."
                value={search}
                onChange={e => { setSearch(e.target.value); setFilters(DEFAULT_FILTERS) }}
              />
              {search && (
                <button className={styles.searchClear} onClick={() => setSearch('')} aria-label="Clear search">×</button>
              )}
            </div>

            {/* Region chips — hidden when searching */}
            {!search && (
              <ChipGroup
                label="Region"
                value={filters.region}
                onChange={v => setFilter('region', v)}
                options={[
                  { val:'any',        label:'Anywhere' },
                  { val:'europe',     label:'Europe' },
                  { val:'asia',       label:'Asia & Pacific' },
                  { val:'americas',   label:'Americas' },
                  { val:'middleeast', label:'Middle East & Africa' },
                ]}
              />
            )}
            {anyFilterActive && !search && (
              <button className={styles.resetChip} onClick={resetFilters} style={{ alignSelf: 'flex-end', marginBottom: 2 }}>↺ Reset</button>
            )}
          </div>

          {/* ── COMPARE BANNER ── */}
          <Link href="/cities/compare" className={styles.cmpBanner}>
            <span className={styles.cmpBannerL}>Compare cities · rent · groceries · gym · transit — up to 4 side by side</span>
            <span className={styles.cmpBannerR}>Open the ledger →</span>
          </Link>

          {/* CITY GRID */}
          {filtered.length > 0 ? (
            <div className={styles.cityGrid}>
              {/* ── FEATURED HERO CARD (first result, only when not searching) ── */}
              {!search && (() => {
                const c = filtered[0]
                const extra = c.extra!
                const [solid, outl] = splitName(c.name)
                return (
                  <Link href={`/city/${c.slug}`} className={styles.heroCity}>
                    <div className={styles.hcInner}>
                      <span className={styles.hcBadge}>№ 01 · Top rated city</span>
                      <h3 className={styles.hcName}>
                        <span className={styles.solid}>{solid}</span>
                        <span className={styles.outl}>{outl}</span>
                      </h3>
                      <p className={styles.hcSub}>
                        {slugToIso(c.countrySlug) ? <FlagIcon code={slugToIso(c.countrySlug)!} size="sm" className={styles.flag} /> : <span className={styles.flag}>{c.flagEmoji}</span>}
                        {c.countryName}<span className={styles.sep}> · </span>{extra.climate}
                      </p>
                      {c.tagline && <p className={styles.hcTagline}>{c.tagline}</p>}
                      <div className={styles.ccTags} style={{ marginTop: 8 }}>
                        {extra.vibes.map(v => (
                          <span key={v} className={`${styles.ccTag}${''}`}>{VIBE_LABELS[v] ?? v}</span>
                        ))}
                      </div>
                      <span className={styles.hcArrow}>Read the dispatch →</span>
                    </div>
                    <div className={styles.hcR}>
                      <div className={styles.hcStat}>
                        <p className={styles.hcStatL}>Move Score</p>
                        <p className={styles.hcScore}>{c.data?.moveScore?.toFixed(1) ?? '—'}<span className={styles.hcScoreUnit}>/10</span></p>
                      </div>
                      <div className={styles.hcStat}>
                        <p className={styles.hcStatL}>Rent · 1BR centre</p>
                        <p className={styles.hcStatV}>{formatRent(c.data?.costRentCityCentre, c.currency)}<span className={styles.unit}>/mo</span></p>
                      </div>
                      <div className={styles.hcStat}>
                        <p className={styles.hcStatL}>Climate</p>
                        <p className={`${styles.hcStatV} ${styles.climate}`}>{extra.climate}</p>
                      </div>
                    </div>
                  </Link>
                )
              })()}

              {/* ── REMAINING CITIES (or all when searching) ── */}
              {(search ? filtered : filtered.slice(1)).map((c, i) => {
                const [solid, outl] = splitName(c.name)
                const extra = c.extra!
                const href = `/city/${c.slug}`
                const reasons = anyFilterActive && !search ? matchReasons(extra, filters) : []
                const rank = search ? i : i + 1
                return (
                  <Link key={c.id} href={href}
                    className={styles.cityCard}
                    data-climate={extra.climateBand}
                    data-slug={c.slug}
                  >
                    <span className={styles.ccNum}>
                      №{String(rank + 1).padStart(2,'0')}
                      <span className={styles.mark}>of {filtered.length}</span>
                    </span>
                    <div className={styles.ccL}>
                      <span className={`${styles.ccStatus} ${styles.live}`}>In atlas · live</span>
                      <h3 className={styles.ccName}>
                        <span className={styles.solid}>{solid}</span>
                        <span className={styles.outl}>{outl}</span>
                      </h3>
                      <p className={styles.ccSub}>
                        {slugToIso(c.countrySlug) ? <FlagIcon code={slugToIso(c.countrySlug)!} size="sm" className={styles.flag} /> : <span className={styles.flag}>{c.flagEmoji}</span>}
                        {c.countryName}<span className={styles.sep}>·</span>{c.slug.slice(0,3).toUpperCase()}
                      </p>
                      {c.tagline && <p className={styles.ccTagline}>{c.tagline}</p>}
                      <div className={styles.ccTags}>
                        {extra.vibes.map(v => (
                          <span key={v} className={`${styles.ccTag}${''}`}>{VIBE_LABELS[v] ?? v}</span>
                        ))}
                      </div>
                      {reasons.length > 0 && (
                        <div className={styles.whyHint}>
                          {reasons.map(r => <span key={r} className={styles.whyTag}>✓ {r}</span>)}
                        </div>
                      )}
                    </div>
                    <div className={styles.ccR}>
                      <div className={styles.ccStat}>
                        <p className={styles.ccStatL}>Move score</p>
                        <p className={`${styles.ccStatV} ${styles.score}`}>
                          {c.data?.moveScore?.toFixed(1) ?? '—'}<span className={styles.unit}>/10</span>
                        </p>
                      </div>
                      <div className={styles.ccStat}>
                        <p className={styles.ccStatL}>Rent · 1BR centre</p>
                        <p className={styles.ccStatV}>
                          {formatRent(c.data?.costRentCityCentre, c.currency)}<span className={styles.unit}>/mo</span>
                        </p>
                      </div>
                      <div className={styles.ccStat}>
                        <p className={styles.ccStatL}>Climate</p>
                        <p className={`${styles.ccStatV} ${styles.climate}`}>{extra.climate}</p>
                      </div>
                      <span className={styles.ccArrow}>View city →</span>
                    </div>
                  </Link>
                )
              })}
            </div>
          ) : (
            <div className={styles.emptyState}>
              <p className={styles.emptyN}>0</p>
              <p className={styles.emptyMsg}>No cities match that combination. Try loosening a filter.</p>
              <button className={styles.nbtn} onClick={resetFilters}>↺ Reset filters</button>
            </div>
          )}
        </section>

        {/* COMING SOON */}
        <section className={`${styles.step} ${styles.fu} ${styles.d3}`} style={{ paddingTop: 0 }}>
          <div className={styles.stepHead}>
            <div>
              <h2 className={styles.stepTitle}>Coming <span className={styles.it}>next</span>.</h2>
            </div>
            <p className={styles.stepAside}>{Object.entries(CITY_EXTRAS).filter(([, v]) => v.status === 'soon').length} cities</p>
          </div>
          <div className={styles.soonGrid}>
            {Object.entries(CITY_EXTRAS)
              .filter(([, v]) => v.status === 'soon')
              .map(([slug, extra]) => (
                <div key={slug} className={styles.soonCard}>
                  <span className={styles.soonStatus}>Coming soon</span>
                  <p className={styles.soonName}>{slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</p>
                  <p className={styles.soonClimate}>{extra.climate}</p>
                  <div className={styles.soonTags}>
                    {extra.vibes.slice(0, 2).map(v => (
                      <span key={v} className={styles.soonTag}>{VIBE_LABELS[v] ?? v}</span>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        </section>

      </div>

      <Footer />
    </div>
  )
}
