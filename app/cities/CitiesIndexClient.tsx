'use client'

import { useState, useMemo, useCallback, useEffect, useRef } from 'react'
import Link from 'next/link'
import styles from './cities.module.css'
import { City } from '@/types'

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
  visa?: VisaType
  internet?: InternetQuality
  english?: EnglishLevel
  safety?: SafetyLevel
  status?: CityStatus
}

const CITY_EXTRAS: Record<string, CityExtra> = {
  lisbon:           { climateBand:'warm',      climate:'Mediterranean',     vibes:['remote','culture','beach'],     visa:'nomad',     internet:'excellent', english:'high',      safety:'very-safe', status:'live' },
  porto:            { climateBand:'temperate', climate:'Atlantic temperate', vibes:['budget','culture','remote'],                                                                status:'soon' },
  funchal:          { climateBand:'warm',      climate:'Subtropical',        vibes:['remote','beach','culture'],                                                                 status:'soon' },
  london:           { climateBand:'temperate', climate:'Oceanic',            vibes:['remote','culture','nightlife'], visa:'sponsor',   internet:'excellent', english:'very-high', safety:'safe',      status:'live' },
  manchester:       { climateBand:'cool',      climate:'Oceanic',            vibes:['budget','nightlife','remote'],                                                              status:'soon' },
  edinburgh:        { climateBand:'cool',      climate:'Oceanic',            vibes:['culture','family','remote'],                                                               status:'soon' },
  dublin:           { climateBand:'cool',      climate:'Oceanic',            vibes:['remote','culture','nightlife'], visa:'sponsor',   internet:'good',      english:'very-high', safety:'very-safe', status:'live' },
  cork:             { climateBand:'cool',      climate:'Oceanic',            vibes:['family','budget','remote'],                                                                status:'soon' },
  amsterdam:        { climateBand:'temperate', climate:'Oceanic',            vibes:['remote','culture','nightlife'], visa:'visa-free', internet:'excellent', english:'very-high', safety:'very-safe', status:'live' },
  rotterdam:        { climateBand:'temperate', climate:'Oceanic',            vibes:['culture','remote','budget'],                                                               status:'soon' },
  eindhoven:        { climateBand:'temperate', climate:'Oceanic',            vibes:['remote','family','budget'],                                                                status:'soon' },
  berlin:           { climateBand:'temperate', climate:'Continental',        vibes:['remote','nightlife','culture'],  visa:'nomad',    internet:'good',      english:'high',      safety:'safe',      status:'live' },
  munich:           { climateBand:'temperate', climate:'Continental',        vibes:['family','culture','remote'],                                                               status:'soon' },
  hamburg:          { climateBand:'cool',      climate:'Oceanic',            vibes:['culture','remote','family'],                                                               status:'soon' },
  barcelona:        { climateBand:'warm',      climate:'Mediterranean',      vibes:['remote','beach','nightlife'],    visa:'nomad',    internet:'good',      english:'moderate',  safety:'safe',      status:'live' },
  madrid:           { climateBand:'warm',      climate:'Continental',        vibes:['nightlife','culture','remote'],                                                            status:'soon' },
  valencia:         { climateBand:'warm',      climate:'Mediterranean',      vibes:['beach','remote','budget'],                                                                 status:'soon' },
  'new-york':       { climateBand:'temperate', climate:'Continental',        vibes:['remote','culture','nightlife'],  visa:'sponsor',  internet:'excellent', english:'very-high', safety:'moderate',  status:'live' },
  'san-francisco':  { climateBand:'temperate', climate:'Mediterranean',      vibes:['remote','culture'],                                                                        status:'soon' },
  austin:           { climateBand:'warm',      climate:'Subtropical',        vibes:['remote','nightlife','budget'],                                                             status:'soon' },
  toronto:          { climateBand:'cool',      climate:'Continental',        vibes:['family','culture','remote'],     visa:'income',   internet:'excellent', english:'very-high', safety:'very-safe', status:'live' },
  vancouver:        { climateBand:'temperate', climate:'Oceanic',            vibes:['family','beach','remote'],                                                                 status:'soon' },
  montreal:         { climateBand:'cool',      climate:'Continental',        vibes:['culture','nightlife','budget'],                                                            status:'soon' },
  singapore:        { climateBand:'warm',      climate:'Tropical',           vibes:['remote','family','culture'],     visa:'sponsor',  internet:'excellent', english:'very-high', safety:'very-safe', status:'live' },
  tokyo:            { climateBand:'temperate', climate:'Humid Subtropical',  vibes:['culture','remote','nightlife'],  visa:'investor', internet:'excellent', english:'moderate',  safety:'very-safe', status:'live' },
  osaka:            { climateBand:'temperate', climate:'Humid Subtropical',  vibes:['culture','budget','nightlife'],                                                            status:'soon' },
  kyoto:            { climateBand:'temperate', climate:'Humid Subtropical',  vibes:['culture','family','budget'],                                                               status:'soon' },
  sydney:           { climateBand:'warm',      climate:'Oceanic',            vibes:['beach','family','remote'],       visa:'sponsor',  internet:'good',      english:'very-high', safety:'very-safe', status:'live' },
  melbourne:        { climateBand:'temperate', climate:'Oceanic',            vibes:['culture','nightlife','remote'],                                                            status:'soon' },
  brisbane:         { climateBand:'warm',      climate:'Subtropical',        vibes:['beach','family','remote'],                                                                 status:'soon' },
  dubai:            { climateBand:'warm',      climate:'Desert',             vibes:['remote','beach','nightlife'],    visa:'investor', internet:'excellent', english:'high',      safety:'very-safe', status:'live' },
  'abu-dhabi':      { climateBand:'warm',      climate:'Desert',             vibes:['family','culture'],                                                                        status:'soon' },
}


const CCY: Record<string, string> = {
  EUR:'€', GBP:'£', USD:'$', JPY:'¥', SGD:'S$', AUD:'A$', CAD:'CA$', AED:'AED ',
}

function formatRent(rentUsd: number | undefined, currency: string): string {
  if (!rentUsd) return '—'
  return `${CCY[currency] ?? currency}${rentUsd.toLocaleString()}`
}

// ── Filter state ──────────────────────────────────────────────────────────

interface FilterState {
  budget: string; climate: string; vibe: string
  visa: string; internet: string; english: string; safety: string
  move: string | null
}
const DEFAULT_FILTERS: FilterState = {
  budget:'any', climate:'any', vibe:'any',
  visa:'any', internet:'any', english:'any', safety:'any', move:null,
}

// ── Utilities ─────────────────────────────────────────────────────────────

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

// ── PrefWord dropdown ─────────────────────────────────────────────────────

interface PrefWordProps {
  value: string
  options: { val: string; label: string }[]
  alignRight?: boolean
  onChange: (val: string) => void
}

function PrefWord({ value, options, alignRight, onChange }: PrefWordProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLSpanElement>(null)
  const current = options.find(o => o.val === value)?.label ?? options[0].label

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [])

  const cls = [styles.prefWord, alignRight ? styles.alignRight : '', open ? styles.open : ''].filter(Boolean).join(' ')

  return (
    <span
      ref={ref} className={cls} tabIndex={0}
      onClick={() => setOpen(o => !o)}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOpen(o => !o) }
        if (e.key === 'Escape') setOpen(false)
      }}
    >
      <span className={styles.prefCurrent}>{current}</span>
      <span className={styles.arr}>▾</span>
      <span className={styles.prefPopover} role="listbox" onClick={e => e.stopPropagation()}>
        {options.map(opt => (
          <button key={opt.val} type="button"
            className={opt.val === value ? styles.on : undefined}
            onClick={() => { onChange(opt.val); setOpen(false) }}
          >
            {opt.label}
          </button>
        ))}
      </span>
    </span>
  )
}

// ── Main component ────────────────────────────────────────────────────────

interface CitiesIndexClientProps {
  cities: City[]
}

export default function CitiesIndexClient({ cities }: CitiesIndexClientProps) {
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS)
  const [prefsOpen, setPrefsOpen] = useState(false)
  const [waitlistInput, setWaitlistInput] = useState('')
  const [waitlistDone, setWaitlistDone] = useState(false)
  const prefsRef = useRef<HTMLDivElement>(null)

  // Only cities with real data (live status)
  const enriched = useMemo(() =>
    cities
      .map(c => ({ ...c, extra: CITY_EXTRAS[c.slug] }))
      .filter(c => c.extra?.status === 'live'),
  [cities])

  const filtered = useMemo(() => {
    let list = enriched.slice()

    if (filters.budget !== 'any') {
      list = list.filter(c => {
        const r = c.data?.costRentCityCentre ?? 0
        if (filters.budget === 'low')  return r < 1500
        if (filters.budget === 'mid')  return r >= 1500 && r <= 2500
        if (filters.budget === 'high') return r > 2500
        return true
      })
    }
    if (filters.climate !== 'any') list = list.filter(c => (c.extra?.climateBand ?? 'temperate') === filters.climate)
    if (filters.vibe    !== 'any') list = list.filter(c => (c.extra?.vibes ?? []).includes(filters.vibe as Vibe))

    if (filters.move === 'international') {
      const intR:  Record<string,number> = { excellent:3, good:2, ok:1 }
      const engR:  Record<string,number> = { 'very-high':3, high:2, moderate:1 }
      const safR:  Record<string,number> = { 'very-safe':3, safe:2, moderate:1 }
      if (filters.visa     !== 'any') list = list.filter(c => !c.extra?.visa     || c.extra.visa     === filters.visa)
      if (filters.internet !== 'any') list = list.filter(c => !c.extra?.internet || (intR[c.extra.internet] ?? 0) >= (intR[filters.internet] ?? 0))
      if (filters.english  !== 'any') list = list.filter(c => !c.extra?.english  || (engR[c.extra.english]  ?? 0) >= (engR[filters.english]  ?? 0))
      if (filters.safety   !== 'any') list = list.filter(c => !c.extra?.safety   || (safR[c.extra.safety]   ?? 0) >= (safR[filters.safety]   ?? 0))
    }

    list.sort((a, b) => (b.data?.moveScore ?? 0) - (a.data?.moveScore ?? 0))
    return list
  }, [enriched, filters])

  const setFilter = useCallback((key: keyof FilterState, val: string) => {
    setFilters(prev => ({ ...prev, [key]: val }))
  }, [])

  const resetFilters = useCallback(() => setFilters(DEFAULT_FILTERS), [])

  // Ledger: all 12 live cities ranked by move score (highest = most trending)
  const liveCities = useMemo(() =>
    enriched.slice().sort((a, b) => (b.data?.moveScore ?? 0) - (a.data?.moveScore ?? 0)),
  [enriched])

  return (
    <div className={styles.page}>

      {/* NAV */}
      <nav className={styles.nav}>
        <div className={styles.navInner}>
          <Link href="/" className={styles.navLogo}>
            <div className={styles.navLogoMark}><span /></div>
            <span className={styles.navLogoText}>Origio</span>
          </Link>
          <span className={styles.navCenter}>
            <span className={styles.crumb}>Origio /</span> Cities
          </span>
          <div className={styles.navRight}>
            <Link href="/compare" className={styles.nbtn}>Compare</Link>
            <Link href="/onboarding" className={styles.nbtn}>Find My City</Link>
          </div>
        </div>
      </nav>

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
            <p className={styles.heroSub}>The Atlas — <span className={styles.grey}>find your city.</span></p>

            <div className={styles.ledgerPanel}>
              <div className={styles.ledgerHead}>
                <div className={styles.ledgerLbl}>
                  Origio Atlas
                  <span className={styles.it}>Twelve launch cities</span>
                </div>
                <div className={styles.ledgerCount}>{liveCities.length}<span className={styles.denom}>/ 24</span></div>
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
                <span>More cities — every 90 days</span>
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

          {/* City grid */}
          {filtered.length > 0 ? (
            <div className={styles.cityGrid}>
              {filtered.map((c, i) => {
                const [solid, outl] = splitName(c.name)
                const isLive = (c.extra?.status ?? 'soon') === 'live'
                const href = isLive ? `/city/${c.slug}` : '#'
                return (
                  <a key={c.id} href={href}
                    className={`${styles.cityCard}${!isLive ? ' ' + styles.soon : ''}`}
                    data-climate={c.extra?.climateBand ?? 'temperate'}
                    data-slug={c.slug}
                    onClick={!isLive ? e => e.preventDefault() : undefined}
                  >
                    <span className={styles.ccNum}>
                      №{String(i+1).padStart(2,'0')}
                      <span className={styles.mark}>of {filtered.length}</span>
                    </span>
                    <div className={styles.ccL}>
                      <span className={`${styles.ccStatus} ${isLive ? styles.live : ''}`}>
                        {isLive ? 'In atlas · live' : 'Coming · Q2 2026'}
                      </span>
                      <h3 className={styles.ccName}>
                        <span className={styles.solid}>{solid}</span>
                        <span className={styles.outl}>{outl}</span>
                      </h3>
                      <p className={styles.ccSub}>
                        <span className={styles.flag}>{c.flagEmoji}</span>
                        {c.countryName}<span className={styles.sep}>·</span>{c.slug.slice(0,3).toUpperCase()}
                      </p>
                      {c.tagline && <p className={styles.ccTagline}>{c.tagline}</p>}
                      {(c.extra?.vibes ?? []).length > 0 && (
                        <div className={styles.ccTags}>
                          {(c.extra?.vibes ?? []).map(v => <span key={v} className={styles.ccTag}>{v}</span>)}
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
                        <p className={`${styles.ccStatV} ${styles.climate}`}>{c.extra?.climate ?? '—'}</p>
                      </div>
                      <span className={styles.ccArrow}>{isLive ? '→' : 'notify me'}</span>
                    </div>
                  </a>
                )
              })}
            </div>
          ) : (
            <div className={styles.emptyState}>
              <p className={styles.emptyN}>0</p>
              <p className={styles.emptyMsg}>No cities match that combination. Try loosening a filter.</p>
              <button className={styles.nbtn} onClick={resetFilters}>↺ Reset preferences</button>
            </div>
          )}

          {/* Reveal */}
          <div className={styles.prefsReveal}>
            <div className={styles.prRule}><span className={styles.prGlyph}>¶</span></div>
            <div className={styles.prBody}>
              <p className={styles.prEyebrow}>Need a hand?</p>
              <h3 className={styles.prTitle}>Still can&rsquo;t find your city?&nbsp;<span className={styles.it}>Let us help you narrow it down.</span></h3>
              <p className={styles.prSub}>Tell us what you actually want — climate, budget, what you&apos;re here for — and the list re-sorts to fit.</p>
              <button type="button" className={`${styles.prCta}${prefsOpen ? ' ' + styles.open : ''}`} onClick={() => {
                const next = !prefsOpen
                setPrefsOpen(next)
                if (next) setTimeout(() => prefsRef.current?.scrollIntoView({ behavior:'smooth', block:'center' }), 50)
              }}>
                <span className={styles.prCtaText}>{prefsOpen ? 'Close the helper — show all cities' : 'Take me somewhere — build a sentence'}</span>
                <span className={styles.prCtaArr}>↓</span>
              </button>
            </div>
          </div>

          {/* Prefs sentence */}
          <div ref={prefsRef} className={`${styles.prefsQuote}${prefsOpen ? ' ' + styles.open : ''}`}>
            <div className={styles.prefsQuoteInner}>
              <div className={styles.prefsSentence}>
                Take me somewhere{' '}
                <PrefWord value={filters.climate} onChange={v => setFilter('climate', v)} options={[
                  {val:'any',label:'anywhere'},{val:'warm',label:'warm year-round'},
                  {val:'temperate',label:'four seasons'},{val:'cool',label:'cool & crisp'},
                ]} />
                , with rent{' '}
                <PrefWord value={filters.budget} onChange={v => setFilter('budget', v)} options={[
                  {val:'any',label:'at any price'},{val:'low',label:'under €1,500 / mo'},
                  {val:'mid',label:'€1,500 – 2,500 / mo'},{val:'high',label:'over €2,500 / mo'},
                ]} />
                , where I can{' '}
                <PrefWord value={filters.vibe} alignRight onChange={v => setFilter('vibe', v)} options={[
                  {val:'any',label:'do anything'},{val:'remote',label:'work remotely'},
                  {val:'family',label:'raise a family'},{val:'nightlife',label:'stay out late'},
                  {val:'culture',label:'live in culture'},{val:'beach',label:'be near the beach'},
                  {val:'budget',label:'live cheap'},
                ]} />.
              </div>
              <div className={styles.prefsAside}>
                <span>↳ Change a word — the list re-sorts</span>
                <button className={styles.resetBtn} type="button" onClick={resetFilters}>↺ Reset all</button>
              </div>
            </div>
          </div>
        </section>

        {/* COMPARE CTA */}
        <section className={`${styles.compareCta} ${styles.fu} ${styles.d4}`}>
          <Link href="/compare" className={styles.ccLink}>
            <span className={styles.ccEyebrow}>III · A ledger of everyday life</span>
            <span className={styles.ccHeadline}>
              <span className={styles.ccLine}>Compare the</span>
              <span className={`${styles.ccLine} ${styles.ccLineIt}`}><span className={styles.ccIt}>real cost</span></span>
              <span className={styles.ccLine}>of any two — or four — cities.</span>
            </span>
            <span className={styles.ccMeta}>
              <span className={styles.ccMetaL}>Rent · groceries · gym · doctor · internet · dining · utilities</span>
              <span className={styles.ccMetaR}>Open the ledger <span className={styles.ccArr}>→</span></span>
            </span>
          </Link>
        </section>

        {/* WAITLIST */}
        <section className={`${styles.waitlist} ${styles.fu} ${styles.d4}`}>
          <div>
            <p className={styles.wlEyebrow}>Don&apos;t see your city?</p>
            <h3 className={styles.wlTitle}>We add <span className={styles.it}>two cities</span> every quarter.</h3>
            <p className={styles.wlSub}>Tell us the city you&apos;re researching — we&apos;ll prioritise the most-requested ones, and email you when the report goes live.</p>
          </div>
          <form className={styles.wlForm} onSubmit={e => { e.preventDefault(); setWaitlistInput(''); setWaitlistDone(true) }}>
            <input type="text" placeholder="e.g. Mexico City, Bali, Cape Town"
              value={waitlistInput} onChange={e => setWaitlistInput(e.target.value)} />
            <button type="submit">{waitlistDone ? '✓ Added' : 'Notify Me →'}</button>
          </form>
        </section>

      </div>

      {/* FOOTER */}
      <footer>
        <div className={styles.footer}>
          <div className={styles.footerInner}>
            <Link href="/" className={styles.footerLogo}>
              <div className={styles.footerLogoMark}><span /></div>
              <span className={styles.footerLogoText}>Origio</span>
            </Link>
            <p className={styles.footerNote}>Data last verified · Mar 2026 · Local sources per city</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
