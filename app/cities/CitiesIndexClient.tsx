'use client'

import { useState, useMemo, useCallback } from 'react'
import Link from 'next/link'
import styles from './cities.module.css'
import { City } from '@/types'
import { supabase } from '@/lib/supabase'
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

interface CityExtra {
  climateBand: ClimateBand
  climate: string
  vibes: Vibe[]
  rentEur: number        // normalized EUR-equivalent for budget filter
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
  lisbon:         { climateBand:'warm',      climate:'Mediterranean',         vibes:['remote','culture','beach','budget'],         rentEur:1200,  visa:'nomad',     internet:'excellent', english:'high',      safety:'very-safe', status:'live' },
  london:         { climateBand:'temperate', climate:'Oceanic',               vibes:['remote','culture','nightlife'],              rentEur:2600,  visa:'sponsor',   internet:'excellent', english:'very-high', safety:'safe',      status:'live' },
  dublin:         { climateBand:'cool',      climate:'Oceanic',               vibes:['remote','culture','nightlife'],              rentEur:2200,  visa:'sponsor',   internet:'good',      english:'very-high', safety:'very-safe', status:'live' },
  amsterdam:      { climateBand:'temperate', climate:'Oceanic',               vibes:['remote','culture','nightlife'],              rentEur:1950,  visa:'visa-free', internet:'excellent', english:'very-high', safety:'very-safe', status:'live' },
  berlin:         { climateBand:'temperate', climate:'Continental',           vibes:['remote','nightlife','culture','budget'],     rentEur:1350,  visa:'nomad',     internet:'good',      english:'high',      safety:'safe',      status:'live' },
  barcelona:      { climateBand:'warm',      climate:'Mediterranean',         vibes:['remote','beach','nightlife'],                rentEur:1450,  visa:'nomad',     internet:'good',      english:'moderate',  safety:'safe',      status:'live' },
  'new-york':     { climateBand:'temperate', climate:'Continental',           vibes:['remote','culture','nightlife'],              rentEur:3500,  visa:'sponsor',   internet:'excellent', english:'very-high', safety:'moderate',  status:'live' },
  toronto:        { climateBand:'cool',      climate:'Continental',           vibes:['family','culture','remote'],                 rentEur:1630,  visa:'income',    internet:'excellent', english:'very-high', safety:'very-safe', status:'live' },
  singapore:      { climateBand:'warm',      climate:'Tropical',              vibes:['remote','family','culture'],                 rentEur:2580,  visa:'sponsor',   internet:'excellent', english:'very-high', safety:'very-safe', status:'live' },
  tokyo:          { climateBand:'temperate', climate:'Humid Subtropical',     vibes:['culture','remote','nightlife','budget'],     rentEur:900,   visa:'investor',  internet:'excellent', english:'moderate',  safety:'very-safe', status:'live' },
  sydney:         { climateBand:'warm',      climate:'Oceanic',               vibes:['beach','family','remote'],                   rentEur:1530,  visa:'sponsor',   internet:'good',      english:'very-high', safety:'very-safe', status:'live' },
  dubai:          { climateBand:'warm',      climate:'Desert',                vibes:['remote','beach','nightlife'],                rentEur:2200,  visa:'investor',  internet:'excellent', english:'high',      safety:'very-safe', status:'live' },
  // ── New live cities — May 2026 ────────────────────────────────────────────
  bangkok:        { climateBand:'warm',      climate:'Tropical',              vibes:['remote','nightlife','culture','budget'],     rentEur:580,   visa:'income',    internet:'excellent', english:'high',      safety:'moderate',  status:'live' },
  'mexico-city':  { climateBand:'temperate', climate:'High-altitude Subtropical', vibes:['remote','culture','nightlife','budget'], rentEur:1050,  visa:'income',    internet:'excellent', english:'moderate',  safety:'moderate',  status:'live' },
  bali:           { climateBand:'warm',      climate:'Tropical',              vibes:['remote','beach','culture','budget'],         rentEur:880,   visa:'nomad',     internet:'good',      english:'high',      safety:'very-safe', status:'live' },
  medellin:       { climateBand:'warm',      climate:'Subtropical Highland',  vibes:['remote','budget','culture','nightlife'],     rentEur:680,   visa:'nomad',     internet:'excellent', english:'moderate',  safety:'moderate',  status:'live' },
  'chiang-mai':   { climateBand:'warm',      climate:'Subtropical',           vibes:['remote','budget','culture'],                 rentEur:310,   visa:'income',    internet:'good',      english:'moderate',  safety:'very-safe', status:'live' },
  'kuala-lumpur': { climateBand:'warm',      climate:'Tropical',              vibes:['remote','family','culture','budget'],        rentEur:590,   visa:'nomad',     internet:'excellent', english:'very-high', safety:'very-safe', status:'live' },
  'cape-town':    { climateBand:'warm',      climate:'Mediterranean',         vibes:['remote','beach','culture'],                  rentEur:840,   visa:'nomad',     internet:'good',      english:'very-high', safety:'moderate',  status:'live' },
  malaga:         { climateBand:'warm',      climate:'Mediterranean',         vibes:['remote','beach','culture'],                  rentEur:1000,  visa:'nomad',     internet:'excellent', english:'moderate',  safety:'very-safe', status:'live' },
  tbilisi:        { climateBand:'temperate', climate:'Continental',           vibes:['remote','culture','budget'],                 rentEur:630,   visa:'visa-free', internet:'good',      english:'moderate',  safety:'safe',      status:'live' },
  'buenos-aires': { climateBand:'temperate', climate:'Humid Subtropical',     vibes:['remote','culture','nightlife','budget'],     rentEur:490,   visa:'nomad',     internet:'good',      english:'moderate',  safety:'moderate',  status:'live' },
  tallinn:        { climateBand:'cool',      climate:'Continental',           vibes:['remote','culture','family'],                 rentEur:840,   visa:'nomad',     internet:'excellent', english:'very-high', safety:'very-safe', status:'live' },
  'da-nang':      { climateBand:'warm',      climate:'Tropical Monsoon',      vibes:['remote','beach','budget'],                   rentEur:390,   visa:'visa-free', internet:'good',      english:'moderate',  safety:'very-safe', status:'live' },
  // ── Coming soon ───────────────────────────────────────────────────────────
  porto:          { climateBand:'temperate', climate:'Atlantic temperate',    vibes:['budget','culture','remote'],                 rentEur:950,   status:'soon' },
  funchal:        { climateBand:'warm',      climate:'Subtropical',           vibes:['remote','beach','culture'],                  rentEur:1100,  status:'soon' },
  manchester:     { climateBand:'cool',      climate:'Oceanic',               vibes:['budget','nightlife','remote'],               rentEur:1350,  status:'soon' },
  edinburgh:      { climateBand:'cool',      climate:'Oceanic',               vibes:['culture','family','remote'],                 rentEur:1530,  status:'soon' },
  cork:           { climateBand:'cool',      climate:'Oceanic',               vibes:['family','budget','remote'],                  rentEur:1450,  status:'soon' },
  rotterdam:      { climateBand:'temperate', climate:'Oceanic',               vibes:['culture','remote','budget'],                 rentEur:1530,  status:'soon' },
  eindhoven:      { climateBand:'temperate', climate:'Oceanic',               vibes:['remote','family','budget'],                  rentEur:1430,  status:'soon' },
  munich:         { climateBand:'temperate', climate:'Continental',           vibes:['family','culture','remote'],                 rentEur:1840,  status:'soon' },
  hamburg:        { climateBand:'cool',      climate:'Oceanic',               vibes:['culture','remote','family'],                 rentEur:1320,  status:'soon' },
  madrid:         { climateBand:'warm',      climate:'Continental',           vibes:['nightlife','culture','remote'],              rentEur:1530,  status:'soon' },
  valencia:       { climateBand:'warm',      climate:'Mediterranean',         vibes:['beach','remote','budget'],                   rentEur:1120,  status:'soon' },
  'san-francisco':{ climateBand:'temperate', climate:'Mediterranean',         vibes:['remote','culture'],                          rentEur:3040,  status:'soon' },
  austin:         { climateBand:'warm',      climate:'Subtropical',           vibes:['remote','nightlife','budget'],               rentEur:1748,  status:'soon' },
  vancouver:      { climateBand:'temperate', climate:'Oceanic',               vibes:['family','beach','remote'],                   rentEur:1748,  status:'soon' },
  montreal:       { climateBand:'cool',      climate:'Continental',           vibes:['culture','nightlife','budget'],              rentEur:1142,  status:'soon' },
  osaka:          { climateBand:'temperate', climate:'Humid Subtropical',     vibes:['culture','budget','nightlife'],              rentEur:470,   status:'soon' },
  kyoto:          { climateBand:'temperate', climate:'Humid Subtropical',     vibes:['culture','family','budget'],                 rentEur:403,   status:'soon' },
  melbourne:      { climateBand:'temperate', climate:'Oceanic',               vibes:['culture','nightlife','remote'],              rentEur:1412,  status:'soon' },
  brisbane:       { climateBand:'warm',      climate:'Subtropical',           vibes:['beach','family','remote'],                   rentEur:1294,  status:'soon' },
  'abu-dhabi':    { climateBand:'warm',      climate:'Desert',                vibes:['family','culture'],                          rentEur:515,   status:'soon' },
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

type SortKey = 'score' | 'rent-asc' | 'rent-desc'

interface FilterState {
  budget: string
  climate: string
  vibe: string
}
const DEFAULT_FILTERS: FilterState = { budget:'any', climate:'any', vibe:'any' }

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
function matchReasons(
  extra: CityExtra,
  filters: FilterState,
): string[] {
  const out: string[] = []
  if (filters.climate !== 'any' && extra.climateBand === filters.climate) {
    const label: Record<string,string> = { warm:'warm year-round', temperate:'four seasons', cool:'cool & crisp' }
    out.push(label[filters.climate])
  }
  if (filters.budget !== 'any') {
    const r = extra.rentEur
    const match = (filters.budget === 'low' && r < 1500) ||
                  (filters.budget === 'mid' && r >= 1500 && r <= 2500) ||
                  (filters.budget === 'high' && r > 2500)
    if (match) {
      const label: Record<string,string> = { low:'under €1,500/mo', mid:'€1,500–2,500/mo', high:'over €2,500/mo' }
      out.push(label[filters.budget])
    }
  }
  if (filters.vibe !== 'any' && extra.vibes.includes(filters.vibe as Vibe)) {
    out.push(filters.vibe)
  }
  return out
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
  const [sort, setSort] = useState<SortKey>('score')
  const enriched = useMemo(() =>
    cities
      .map(c => ({ ...c, extra: CITY_EXTRAS[c.slug] }))
      .filter(c => c.extra?.status === 'live'),
  [cities])

  const filtered = useMemo(() => {
    let list = enriched.slice()

    if (filters.budget !== 'any') {
      list = list.filter(c => {
        // Use the hardcoded EUR-normalised rentEur for budget bucketing
        // (DB rent is in local currency; conversion happens in CITY_EXTRAS)
        const r = c.extra?.rentEur ?? 0
        if (filters.budget === 'low')  return r < 1500
        if (filters.budget === 'mid')  return r >= 1500 && r <= 2500
        if (filters.budget === 'high') return r > 2500
        return true
      })
    }
    if (filters.climate !== 'any') {
      list = list.filter(c => {
        // Always use hardcoded climateBand — DB temp thresholds misclassify cities like Tokyo
        return c.extra?.climateBand === filters.climate
      })
    }
    if (filters.vibe    !== 'any') list = list.filter(c => (c.extra?.vibes ?? []).includes(filters.vibe as Vibe))

    list.sort((a, b) => {
      if (sort === 'score')     return (b.data?.moveScore ?? 0) - (a.data?.moveScore ?? 0)
      if (sort === 'rent-asc')  return (a.extra?.rentEur ?? 0) - (b.extra?.rentEur ?? 0)
      if (sort === 'rent-desc') return (b.extra?.rentEur ?? 0) - (a.extra?.rentEur ?? 0)
      return 0
    })
    return list
  }, [enriched, filters, sort])

  const anyFilterActive = filters.budget !== 'any' || filters.climate !== 'any' || filters.vibe !== 'any'

  const setFilter = useCallback((key: keyof FilterState, val: string) => {
    setFilters(prev => ({ ...prev, [key]: val }))
  }, [])

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS)
    setSort('score')
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
          <div className={styles.heroInner}>
            <span className={`${styles.frameMeta} ${styles.frameMetaTl}`}>ORG-ATL · 2026.Q1 · Vol. 01</span>
            <span className={`${styles.frameMeta} ${styles.frameMetaBl}`}>SCALE 1 : 12 · MONO · SERIF</span>
            <span className={`${styles.frameMeta} ${styles.frameMetaBr}`}>PRINTED IN DARK MODE</span>
            <div className={styles.heroType}>
              <span className={styles.typeSolid}>Citi</span>
              <span className={styles.typeOutline}>es</span>
            </div>
            <p className={styles.heroSub}>The Atlas ~ <span className={styles.grey}>find your city.</span></p>

            <div className={styles.ledgerPanel}>
              <div className={styles.ledgerHead}>
                <div className={styles.ledgerLbl}>
                  Origio Atlas
                  <span className={styles.it}>Twenty-four cities</span>
                </div>
                <div className={styles.ledgerCount}>{liveCities.length}<span className={styles.denom}>/ {TOTAL_CITIES}</span></div>
              </div>
              <div className={styles.ledgerRows}>
                {liveCities.map((c, i) => (
                  <div key={c.id} className={styles.ledgerRow}>
                    <span className={styles.lrN}>N°{String(i+1).padStart(2,'0')}</span>
                    <span className={styles.lrCode}>{c.slug.slice(0,3).toUpperCase()}</span>
                    <span className={styles.lrName}>{c.name}</span>
                    <span className={styles.lrStat}>{formatRent(c.data?.costRentCityCentre, c.currency)}</span>
                    <span className={`${styles.lrStatusDot} ${styles.live}`} />
                  </div>
                ))}
              </div>
              <div className={styles.ledgerFoot}>
                <span>More cities every 90 days</span>
                <span>↓ Scroll to explore</span>
              </div>
            </div>
          </div>
        </section>

        {/* CITIES */}
        <section className={`${styles.step} ${styles.fu} ${styles.d2}`}>
          <div className={styles.stepHead}>
            <div>
              <p className={styles.stepTag}><span className={styles.num}>1</span> Find your city</p>
              <h2 className={styles.stepTitle}>Here&rsquo;s what <span className={styles.it}>fits</span>.</h2>
            </div>
            <p className={styles.stepAside}>{filtered.length} {filtered.length === 1 ? 'city' : 'cities'}</p>
          </div>

          {/* ── FILTER BAR ── */}
          <div className={styles.filterBar}>
            <ChipGroup
              label="Climate"
              value={filters.climate}
              onChange={v => setFilter('climate', v)}
              options={[
                { val:'any',       label:'Any' },
                { val:'warm',      label:'🌞 Warm' },
                { val:'temperate', label:'🍂 Temperate' },
                { val:'cool',      label:'❄️ Cool' },
              ]}
            />
            <ChipGroup
              label="Budget (EUR equiv.)"
              value={filters.budget}
              onChange={v => setFilter('budget', v)}
              options={[
                { val:'any',  label:'Any price' },
                { val:'low',  label:'Under €1,500' },
                { val:'mid',  label:'€1,500 – 2,500' },
                { val:'high', label:'Over €2,500' },
              ]}
            />
            <ChipGroup
              label="Vibe"
              value={filters.vibe}
              onChange={v => setFilter('vibe', v)}
              options={[
                { val:'any',       label:'Anything' },
                { val:'remote',    label:'Remote-friendly' },
                { val:'family',    label:'Family' },
                { val:'nightlife', label:'Nightlife' },
                { val:'culture',   label:'Culture' },
                { val:'beach',     label:'Beach' },
                { val:'budget',    label:'Budget' },
              ]}
            />
            <div className={styles.filterBarRight}>
              <span className={styles.chipLabel}>Sort</span>
              <div className={styles.chips}>
                {([
                  { val:'score',     label:'Top rated' },
                  { val:'rent-asc',  label:'Cheapest first' },
                  { val:'rent-desc', label:'Most expensive' },
                ] as { val: SortKey; label: string }[]).map(o => (
                  <button
                    key={o.val}
                    type="button"
                    className={`${styles.chip}${sort === o.val ? ' ' + styles.chipOn : ''}`}
                    onClick={() => setSort(o.val)}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
              {anyFilterActive && (
                <button className={styles.resetChip} onClick={resetFilters}>↺ Reset</button>
              )}
            </div>
          </div>

          {/* CITY GRID */}
          {filtered.length > 0 ? (
            <div className={styles.cityGrid}>
              {filtered.map((c, i) => {
                const [solid, outl] = splitName(c.name)
                const extra = c.extra!
                const href = `/city/${c.slug}`
                const reasons = anyFilterActive ? matchReasons(extra, filters) : []
                return (
                  <Link key={c.id} href={href}
                    className={styles.cityCard}
                    data-climate={extra.climateBand}
                    data-slug={c.slug}
                  >
                    <span className={styles.ccNum}>
                      №{String(i+1).padStart(2,'0')}
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
                          <span key={v} className={`${styles.ccTag}${filters.vibe === v ? ' ' + styles.ccTagMatch : ''}`}>{VIBE_LABELS[v] ?? v}</span>
                        ))}
                      </div>
                      {/* Why this city — shows on hover when filters active */}
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

        {/* COMPARE CTA */}
        <section className={`${styles.compareCta} ${styles.fu} ${styles.d4}`}>
          <Link href="/cities/compare" className={styles.ccLink}>
            <span className={styles.ccEyebrow}>III · A ledger of everyday life</span>
            <span className={styles.ccHeadline}>
              <span className={styles.ccLine}>Compare the</span>
              <span className={`${styles.ccLine} ${styles.ccLineIt}`}><span className={styles.ccIt}>real cost</span></span>
              <span className={styles.ccLine}>of any two or four cities.</span>
            </span>
            <span className={styles.ccMeta}>
              <span className={styles.ccMetaL}>Rent · groceries · gym · doctor · internet · dining · utilities</span>
              <span className={styles.ccMetaR}>Open the ledger <span className={styles.ccArr}>→</span></span>
            </span>
          </Link>
        </section>


      </div>

      <Footer />
    </div>
  )
}
