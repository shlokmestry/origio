'use client'

import { useState, useCallback, useMemo, useEffect } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import styles from './compare.module.css'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import { FlagIcon } from '@/components/FlagIcon'
import { CITY_SLUG_TO_ISO } from '@/lib/flagCodes'
import { useAuth } from '@/lib/AuthProvider'
import { DISPLAY_RATES, FX_LAST_UPDATED } from '@/lib/exchangeRates'
import RankedBarChart, { type RankedEntity } from '@/components/RankedBarChart'
import CompareScrollReset from '@/app/compare/CompareScrollReset'

const REGION_ORDER = ['Europe', 'Asia & Oceania', 'Americas', 'Middle East & Africa']
const CITY_REGION: Record<string, string> = {
  lisbon:'Europe', porto:'Europe', funchal:'Europe', london:'Europe', manchester:'Europe',
  bristol:'Europe', glasgow:'Europe', edinburgh:'Europe', dublin:'Europe', cork:'Europe', amsterdam:'Europe', rotterdam:'Europe',
  eindhoven:'Europe', utrecht:'Europe', 'the-hague':'Europe', berlin:'Europe', munich:'Europe', hamburg:'Europe', cologne:'Europe', frankfurt:'Europe', barcelona:'Europe',
  madrid:'Europe', valencia:'Europe', malaga:'Europe', seville:'Europe', bilbao:'Europe', tbilisi:'Europe', tallinn:'Europe',
  paris:'Europe', milan:'Europe', florence:'Europe', rome:'Europe', athens:'Europe', vienna:'Europe',
  prague:'Europe', budapest:'Europe', bucharest:'Europe', warsaw:'Europe', stockholm:'Europe',
  copenhagen:'Europe', helsinki:'Europe', oslo:'Europe', brussels:'Europe', zurich:'Europe',
  limassol:'Europe', split:'Europe', belgrade:'Europe',
  'new-york':'Americas', 'san-francisco':'Americas', austin:'Americas', miami:'Americas',
  toronto:'Americas', vancouver:'Americas', montreal:'Americas', calgary:'Americas', medellin:'Americas',
  'mexico-city':'Americas', 'buenos-aires':'Americas', 'sao-paulo':'Americas',
  'panama-city':'Americas', 'san-jose-cr':'Americas',
  singapore:'Asia & Oceania', tokyo:'Asia & Oceania', osaka:'Asia & Oceania', kyoto:'Asia & Oceania', fukuoka:'Asia & Oceania',
  sydney:'Asia & Oceania', melbourne:'Asia & Oceania', brisbane:'Asia & Oceania', perth:'Asia & Oceania',
  auckland:'Asia & Oceania', seoul:'Asia & Oceania',
  bangkok:'Asia & Oceania', 'chiang-mai':'Asia & Oceania', bali:'Asia & Oceania',
  'kuala-lumpur':'Asia & Oceania', 'da-nang':'Asia & Oceania', 'ho-chi-minh-city':'Asia & Oceania',
  bangalore:'Asia & Oceania', taipei:'Asia & Oceania',
  dubai:'Middle East & Africa', 'abu-dhabi':'Middle East & Africa', 'cape-town':'Middle East & Africa',
  nairobi:'Middle East & Africa',
}

// ── Data ─────────────────────────────────────────────────────────────────────

export type CostKey = 'rent' | 'groc' | 'dine' | 'util' | 'gym' | 'cowork' | 'transport'

export interface CityData {
  slug: string
  code: string
  // costs are in EUR; null = no data for that line item
  name: string
  country: string
  flag: string
  currency: string
  costs: Record<CostKey, number | null>
}

const FREE_LEDGER_MAX = 4
const PRO_LEDGER_MAX = 8

const COST_ROWS: { key: CostKey; label: string; hint: string; color: string }[] = [
  { key:'rent',      label:'Rent',      hint:'1BR centre',  color:'#a8651e' },
  { key:'groc',      label:'Groceries', hint:'per month',   color:'#5f6d2d' },
  { key:'dine',      label:'Dining',    hint:'eating out',  color:'#1f5a4d' },
  { key:'util',      label:'Utilities', hint:'power+water', color:'#3b485c' },
  { key:'gym',       label:'Gym',       hint:'monthly',     color:'#6f3e6b' },
  { key:'cowork',    label:'Coworking', hint:'hot desk',    color:'#a04c2a' },
  { key:'transport', label:'Transit',   hint:'monthly pass',color:'#b03c4e' },
]

type CurrencyKey = 'eur' | 'usd' | 'gbp' | 'jpy'
const RATES:      Record<CurrencyKey, number> = DISPLAY_RATES
const SYMBOL:     Record<CurrencyKey, string> = { eur:'€',  usd:'$',  gbp:'£',  jpy:'¥' }
const CURR_LABEL: Record<CurrencyKey, string> = { eur:'EUR €', usd:'USD $', gbp:'GBP £', jpy:'JPY ¥' }
const CURR_CYCLE: CurrencyKey[] = ['eur', 'usd', 'gbp', 'jpy']

function fmt(n: number, currency: CurrencyKey): string {
  return SYMBOL[currency] + Math.round(n * RATES[currency]).toLocaleString()
}

function fmtCompact(n: number, currency: CurrencyKey): string {
  const v = Math.round(n * RATES[currency])
  if (v >= 1000) return SYMBOL[currency] + (v / 1000).toFixed(1).replace(/\.0$/, '') + 'k'
  return SYMBOL[currency] + v
}

// ── Component ─────────────────────────────────────────────────────────────────

interface Props { allCities: CityData[] }

export default function CompareCitiesClient({ allCities }: Props) {
  const searchParams = useSearchParams()
  const { isPro, loading, isProLoading } = useAuth()
  const authPending = loading || isProLoading
  const ledgerMax = isPro ? PRO_LEDGER_MAX : FREE_LEDGER_MAX

  const defaultSlugs = useMemo(() => {
    const live = allCities.map(c => c.slug)
    return ['lisbon', 'berlin', 'london'].filter(s => live.includes(s)).slice(0, 3)
      .concat(live.slice(0, 3)).filter((s, i, a) => a.indexOf(s) === i).slice(0, 3)
  }, [allCities])

  const [selected, setSelected] = useState<string[]>(() => {
    const fromUrl = searchParams.get('cities')
    if (fromUrl && fromUrl.length <= 200) {
      const slugs = fromUrl.split(',').filter(s => /^[a-z0-9-]+$/.test(s) && allCities.some(c => c.slug === s))
      if (slugs.length >= 2) return slugs.slice(0, PRO_LEDGER_MAX)
    }
    return defaultSlugs
  })

  const [currency, setCurrency] = useState<CurrencyKey>(() => {
    const c = searchParams.get('currency')
    return (CURR_CYCLE.includes(c as CurrencyKey) ? c : 'eur') as CurrencyKey
  })
  const [isolated, setIsolated] = useState<CostKey | null>(() => {
    const iso = searchParams.get('iso')
    return iso && COST_ROWS.some(r => r.key === iso) ? iso as CostKey : null
  })
  const [copied, setCopied] = useState(false)
  const [linkCopied, setLinkCopied] = useState(false)
  const [emailVal, setEmailVal] = useState('')
  const [emailState, setEmailState] = useState<'idle' | 'loading' | 'sent' | 'error'>('idle')
  const [citySearch, setCitySearch] = useState('')

  // Sync state → URL (client-only — window not available on server)
  useEffect(() => {
    if (typeof window === 'undefined') return
    const url = new URL(window.location.href)
    url.searchParams.set('cities', selected.join(','))
    if (currency !== 'eur') url.searchParams.set('currency', currency)
    else url.searchParams.delete('currency')
    if (isolated) url.searchParams.set('iso', isolated)
    else url.searchParams.delete('iso')
    window.history.replaceState(null, '', url.toString())
  }, [selected, currency, isolated])

  useEffect(() => {
    if (authPending) return
    setSelected(prev => prev.length > ledgerMax ? prev.slice(0, ledgerMax) : prev)
  }, [ledgerMax, authPending])

  // ── Derived data ──────────────────────────────────────────────────────────

  const visibleSelected = useMemo(
    () => authPending && !isPro ? selected.slice(0, FREE_LEDGER_MAX) : selected,
    [authPending, isPro, selected]
  )

  const picks = useMemo(
    () => visibleSelected.map(s => allCities.find(c => c.slug === s)).filter(Boolean) as CityData[],
    [visibleSelected, allCities]
  )

  const totals = useMemo(
    () => picks.map(c => COST_ROWS.reduce((s, r) => s + (c.costs[r.key] ?? 0), 0)),
    [picks]
  )

  const rankedEntities = useMemo<RankedEntity<CostKey>[]>(
    () => picks.map(c => ({
      slug: c.slug,
      code: c.code,
      name: c.name,
      meta: c.country,
      flag: c.flag,
      iso: CITY_SLUG_TO_ISO[c.slug],
      costs: c.costs,
    })),
    [picks]
  )

  const filteredPickerCities = useMemo(() => {
    const q = citySearch.trim().toLowerCase()
    if (!q) return allCities
    return allCities.filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.country.toLowerCase().includes(q) ||
      c.slug.toLowerCase().includes(q) ||
      CITY_REGION[c.slug]?.toLowerCase().includes(q)
    )
  }, [allCities, citySearch])

  // ── Handlers ─────────────────────────────────────────────────────────────

  const toggleCity = useCallback((slug: string) => {
    setSelected(prev => {
      if (prev.includes(slug)) {
        if (prev.length <= 2) return prev
        return prev.filter(s => s !== slug)
      }
      if (prev.length >= ledgerMax) return prev
      return [...prev, slug]
    })
  }, [ledgerMax])

  const nextCurrency = useCallback(() => {
    setCurrency(prev => CURR_CYCLE[(CURR_CYCLE.indexOf(prev) + 1) % CURR_CYCLE.length])
  }, [])

  const toggleIsolate = useCallback((key: CostKey) => {
    setIsolated(prev => prev === key ? null : key)
  }, [])

  const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())

  const submitEmail = useCallback(async () => {
    if (!isValidEmail(emailVal) || picks.length < 2) return
    setEmailState('loading')
    try {
      const shareUrl = typeof window !== 'undefined' ? window.location.href : 'https://findorigio.com/cities/compare'
      const res = await fetch('/api/capture-city-comparison', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: emailVal,
          cities: picks.map((c, i) => ({ slug: c.slug, name: c.name, country: c.country, total: totals[i] })),
          currency,
          shareUrl,
        }),
      })
      setEmailState(res.ok ? 'sent' : 'error')
    } catch {
      setEmailState('error')
    }
  }, [emailVal, picks, totals, currency])

  const reset = useCallback(() => {
    setSelected(defaultSlugs)
    setCurrency('eur')
    setIsolated(null)
    setCitySearch('')
  }, [defaultSlugs])

  const copyTable = useCallback(() => {
    if (picks.length < 2) return
    const lines: string[] = [['Category', ...picks.map(p => p.name)].join('\t')]
    COST_ROWS.forEach(r => {
      lines.push([r.label, ...picks.map(p => p.costs[r.key] == null ? '—' : fmt(p.costs[r.key]!, currency))].join('\t'))
    })
    const tots = picks.map(c => COST_ROWS.reduce((s, r) => s + (c.costs[r.key] ?? 0), 0))
    lines.push(['TOTAL / MO', ...tots.map(t => fmt(t, currency))].join('\t'))
    navigator.clipboard.writeText(lines.join('\n')).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 1400)
  }, [picks, currency])

  const copyLink = useCallback(() => {
    const url = typeof window !== 'undefined' ? window.location.href : ''
    navigator.clipboard.writeText(url).catch(() => {})
    setLinkCopied(true)
    setTimeout(() => setLinkCopied(false), 1600)
  }, [])

  const downloadCSV = useCallback(() => {
    if (picks.length < 2) return
    const rows: string[] = []
    rows.push(['Category', ...picks.map(p => p.name)].map(v => `"${v}"`).join(','))
    COST_ROWS.forEach(r => {
      rows.push([r.label, ...picks.map(p => p.costs[r.key] == null ? '' : fmt(p.costs[r.key]!, currency))].map(v => `"${v}"`).join(','))
    })
    const tots = picks.map(c => COST_ROWS.reduce((s, r) => s + (c.costs[r.key] ?? 0), 0))
    rows.push(['TOTAL / MO', ...tots.map(t => fmt(t, currency))].map(v => `"${v}"`).join(','))
    rows.push(['', ...picks.map(p => `https://findorigio.com/city/${p.slug}`)].map(v => `"${v}"`).join(','))
    const blob = new Blob([rows.join('\n')], { type: 'text/csv' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `origio-compare-${picks.map(p => p.slug).join('-')}.csv`
    a.click()
    URL.revokeObjectURL(a.href)
  }, [picks, currency])

  const exportPDF = useCallback(() => {
    if (!isPro) {
      window.location.href = '/pro'
      return
    }
    window.print()
  }, [isPro])

  return (
    <div className={styles.page}>
      <CompareScrollReset />

      <Nav countries={[]} onCountrySelect={() => {}} />

      <main className={styles.folio} style={{ paddingTop: 80 }}>
        <div className={styles.compareToggleWrap}>
          <div className={styles.compareToggle}>
            <Link href="/compare/countries" className={styles.compareToggleItem}>Compare Countries</Link>
            <Link href="/compare/cities" className={`${styles.compareToggleItem} ${styles.compareToggleItemActive}`}>Compare Cities</Link>
          </div>
        </div>

        {/* Heading */}
        <div className={styles.mathHead}>
          <span className={styles.mathSolid}>City </span>
          <span className={styles.mathOutline}>vs City</span>
        </div>

        {/* Sub */}
        <section className={`${styles.raceSub} ${styles.fu}`}>
          <div className={styles.raceSubL}>
            Choose up to {ledgerMax} cities. Compare estimated monthly spend, not postcard vibes. Currency{' '}
            <button type="button" className={styles.currToggle} onClick={nextCurrency}>
              {CURR_LABEL[currency]} ⇄
            </button>
          </div>
        </section>

        {/* Pick strip */}
        <section className={styles.pickStrip}>
          <p className={styles.pickSeoLine}>
            Compare rent, groceries, utilities and daily burn across {allCities.length} cities.
          </p>
          <p className={styles.pickSeoLine}>
            Stored city rows, normalized to {currency.toUpperCase()}. FX refreshed {FX_LAST_UPDATED}. Estimates, not live quotes.
          </p>
          <div className={styles.selectedBar}>
            <div className={styles.selectedBarL}>
              <span className={styles.pickLbl}>
                <span className={styles.pickLblArr}>→</span> Selected cities
              </span>
              <div className={styles.selectedPills}>
                {picks.map(c => {
                  const minReached = visibleSelected.length <= 2
                  return (
                    <button
                      key={c.slug}
                      type="button"
                      className={styles.selectedPill}
                      disabled={minReached}
                      onClick={() => toggleCity(c.slug)}
                    >
                      {CITY_SLUG_TO_ISO[c.slug] ? <FlagIcon code={CITY_SLUG_TO_ISO[c.slug]} size="sm" className={styles.chFlag} /> : <span className={styles.chFlag}>{c.flag}</span>}
                      {c.name}
                      <span className={styles.selectedPillX}>×</span>
                    </button>
                  )
                })}
              </div>
            </div>
            <div className={styles.selectedBarR}>
              <span className={styles.pickCap}>
                <span className={styles.pickCapNum}>{visibleSelected.length}</span> of {ledgerMax} selected
              </span>
              <button type="button" className={styles.legendAction} onClick={copyLink}>
                {linkCopied ? '✓ Link copied' : '↗ Share'}
              </button>
              <button type="button" className={`${styles.legendAction} ${styles.legendActionGhost}`} onClick={reset}>
                ↻ Clear all
              </button>
            </div>
          </div>

          <div className={styles.pickHeader}>
            <span className={styles.pickLbl}>
              <span className={styles.pickLblArr}>→</span> City picker
            </span>
            <div className={styles.pickTools}>
              <input
                type="text"
                value={citySearch}
                onChange={e => setCitySearch(e.target.value)}
                className={styles.pickSearch}
                placeholder="Search city or country"
              />
              {citySearch && (
                <button type="button" className={styles.pickSearchClear} onClick={() => setCitySearch('')}>
                  ×
                </button>
              )}
            </div>
          </div>
          <div className={styles.pickGroups}>
            {REGION_ORDER.map(region => {
              const regionCities = filteredPickerCities.filter(c => CITY_REGION[c.slug] === region)
              if (!regionCities.length) return null
              return (
                <div key={region} className={styles.pickGroup}>
                  <span className={styles.pickGroupLabel}>{region}</span>
                  <div className={styles.pickGroupCities}>
                    {regionCities.map(c => {
                      const isOn = selected.includes(c.slug)
                      const atMax = selected.length >= ledgerMax && !isOn
                      const minReached = visibleSelected.length <= 2 && isOn
                      return (
                        <button
                          key={c.slug}
                          type="button"
                          className={`${styles.pickChip}${isOn ? ' ' + styles.pickChipOn : ''}`}
                          disabled={atMax || minReached}
                          onClick={() => toggleCity(c.slug)}
                        >
                          {CITY_SLUG_TO_ISO[c.slug] ? <FlagIcon code={CITY_SLUG_TO_ISO[c.slug]} size="sm" className={styles.chFlag} /> : <span className={styles.chFlag}>{c.flag}</span>}
                          {c.name}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Legend + actions */}
          <div className={styles.legendRow}>
            <span className={styles.legendLbl}>
              <span className={styles.legendLblArr}>↳</span> Show only
            </span>
            {COST_ROWS.map(r => (
              <button
                key={r.key}
                type="button"
                className={[
                  styles.legendKey,
                  isolated === r.key ? styles.legendKeyOn : '',
                  isolated && isolated !== r.key ? styles.legendKeyDim : '',
                ].filter(Boolean).join(' ')}
                onClick={() => toggleIsolate(r.key)}
              >
                <span className={styles.lkSw} style={{ background: r.color }} />
                {r.label}
              </button>
            ))}
            <span className={styles.legendSpacer} />
            <button type="button" className={`${styles.legendAction} ${styles.legendActionGhost}`} onClick={copyTable}>
              {copied ? '✓ Copied' : '⬇ Copy data'}
            </button>
            <button type="button" className={`${styles.legendAction} ${styles.legendActionGhost}`} onClick={downloadCSV}>
              ↓ CSV
            </button>
            <button type="button" className={`${styles.legendAction} ${styles.legendActionGhost}`} onClick={exportPDF}>
              {isPro ? '↓ PDF' : 'PDF · Pro'}
            </button>
          </div>
        </section>

        <RankedBarChart
          entities={rankedEntities}
          costRows={COST_ROWS}
          isolated={isolated}
          currencyLabel={currency.toUpperCase()}
          formatMoney={(n) => fmt(n, currency)}
          formatCompact={(n) => fmtCompact(n, currency)}
          emptyLabel="Pick at least two cities above."
          verdictNoun="city"
        />


        {/* Email capture */}
        {picks.length >= 2 && (
          <section style={{
            margin: '32px 0 0',
            padding: '28px 32px',
            background: '#111111',
            border: '1px solid rgba(240,240,232,0.085)',
            display: 'flex',
            alignItems: 'center',
            gap: 20,
            flexWrap: 'wrap' as const,
          }}>
            <div style={{ flex: '1 1 260px' }}>
              <div style={{ fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase' as const, color: 'rgba(240,240,232,0.4)', marginBottom: 6, fontFamily: 'sans-serif' }}>
                → Save this comparison
              </div>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#f0f0e8', fontFamily: 'sans-serif' }}>
                Want this emailed to you?
              </div>
              <div style={{ fontSize: 13, color: 'rgba(240,240,232,0.45)', marginTop: 4, fontFamily: 'sans-serif' }}>
                We&rsquo;ll send the full breakdown to your inbox. No account needed.
              </div>
            </div>
            {emailState === 'sent' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: '1 1 320px' }}>
                <div style={{ fontSize: 14, color: '#00ffd5', fontWeight: 700, fontFamily: 'sans-serif' }}>
                  ✓ On its way — check your inbox.
                </div>
                <div style={{ fontSize: 12, color: 'rgba(240,240,232,0.4)', fontFamily: 'sans-serif' }}>
                  Didn&rsquo;t arrive? Check spam, or{' '}
                  <button type="button" onClick={() => setEmailState('idle')} style={{ background: 'none', border: 'none', color: '#00ffd5', cursor: 'pointer', fontSize: 12, fontFamily: 'sans-serif', padding: 0, textDecoration: 'underline' }}>
                    try again
                  </button>.
                </div>
                <button type="button" onClick={copyLink} style={{ alignSelf: 'flex-start', background: 'none', border: '1px solid rgba(240,240,232,0.15)', color: '#f0f0e8', fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase' as const, padding: '8px 14px', cursor: 'pointer', fontFamily: 'sans-serif', fontWeight: 700 }}>
                  {linkCopied ? '✓ Link copied' : '↗ Share comparison link'}
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: 8, flex: '1 1 320px', alignItems: 'stretch' }}>
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={emailVal}
                  onChange={e => setEmailVal(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') submitEmail() }}
                  disabled={emailState === 'loading'}
                  style={{
                    flex: 1,
                    background: '#1a1a1a',
                    border: `1px solid ${emailState === 'error' ? '#f87171' : 'rgba(240,240,232,0.12)'}`,
                    color: '#f0f0e8',
                    fontSize: 14,
                    padding: '10px 14px',
                    fontFamily: 'sans-serif',
                    outline: 'none',
                  }}
                />
                <button
                  type="button"
                  onClick={submitEmail}
                  disabled={emailState === 'loading' || !isValidEmail(emailVal)}
                  style={{
                    background: '#00ffd5',
                    color: '#0a0a0a',
                    border: 'none',
                    fontWeight: 800,
                    fontSize: 11,
                    letterSpacing: '0.15em',
                    textTransform: 'uppercase' as const,
                    padding: '10px 20px',
                    cursor: emailState === 'loading' ? 'wait' : 'pointer',
                    fontFamily: 'sans-serif',
                    opacity: !isValidEmail(emailVal) ? 0.4 : 1,
                  }}
                >
                  {emailState === 'loading' ? '...' : 'Send →'}
                </button>
              </div>
            )}
            {emailState === 'error' && (
              <div style={{ width: '100%', fontSize: 12, color: '#f87171', fontFamily: 'sans-serif' }}>
                Failed to send — double-check your email and try again.
              </div>
            )}
          </section>
        )}

      </main>
      <Footer />
    </div>
  )
}
