'use client'

import { Fragment, useState, useCallback, useMemo, useEffect } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import styles from './compare.module.css'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import { FlagIcon } from '@/components/FlagIcon'

// City slug → ISO 3166-1 alpha-2 country code
const CITY_TO_ISO: Record<string, string> = {
  lisbon: 'pt', porto: 'pt', funchal: 'pt',
  london: 'gb', manchester: 'gb', edinburgh: 'gb',
  dublin: 'ie', cork: 'ie',
  amsterdam: 'nl', rotterdam: 'nl', eindhoven: 'nl',
  berlin: 'de', munich: 'de', hamburg: 'de',
  barcelona: 'es', madrid: 'es', valencia: 'es',
  'new-york': 'us', 'san-francisco': 'us', austin: 'us',
  toronto: 'ca', vancouver: 'ca', montreal: 'ca',
  singapore: 'sg',
  tokyo: 'jp', osaka: 'jp', kyoto: 'jp',
  sydney: 'au', melbourne: 'au', brisbane: 'au',
  dubai: 'ae', 'abu-dhabi': 'ae',
  bangkok: 'th', 'chiang-mai': 'th',
  'mexico-city': 'mx',
  bali: 'id',
  medellin: 'co', 'buenos-aires': 'ar',
  'kuala-lumpur': 'my',
  'cape-town': 'za',
  malaga: 'es',
  tbilisi: 'ge',
  tallinn: 'ee',
  'da-nang': 'vn',
}

const REGION_ORDER = ['Europe', 'Asia & Oceania', 'Americas', 'Middle East & Africa']
const CITY_REGION: Record<string, string> = {
  lisbon:'Europe', porto:'Europe', funchal:'Europe', london:'Europe', manchester:'Europe',
  edinburgh:'Europe', dublin:'Europe', cork:'Europe', amsterdam:'Europe', rotterdam:'Europe',
  eindhoven:'Europe', berlin:'Europe', munich:'Europe', hamburg:'Europe', barcelona:'Europe',
  madrid:'Europe', valencia:'Europe', malaga:'Europe', tbilisi:'Europe', tallinn:'Europe',
  'new-york':'Americas', 'san-francisco':'Americas', austin:'Americas', toronto:'Americas',
  vancouver:'Americas', montreal:'Americas', medellin:'Americas', 'mexico-city':'Americas',
  'buenos-aires':'Americas',
  singapore:'Asia & Oceania', tokyo:'Asia & Oceania', osaka:'Asia & Oceania', kyoto:'Asia & Oceania',
  sydney:'Asia & Oceania', melbourne:'Asia & Oceania', brisbane:'Asia & Oceania',
  bangkok:'Asia & Oceania', 'chiang-mai':'Asia & Oceania', bali:'Asia & Oceania',
  'kuala-lumpur':'Asia & Oceania', 'da-nang':'Asia & Oceania',
  dubai:'Middle East & Africa', 'abu-dhabi':'Middle East & Africa', 'cape-town':'Middle East & Africa',
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

const LEDGER_MAX = 4

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
const RATES:      Record<CurrencyKey, number> = { eur:1,    usd:1.07, gbp:0.85, jpy:165 }
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

function niceMax(v: number): number {
  if (v <= 2000) return Math.ceil(v / 500) * 500
  if (v <= 6000) return Math.ceil(v / 1000) * 1000
  return Math.ceil(v / 2000) * 2000
}

// ── Component ─────────────────────────────────────────────────────────────────

interface Props { allCities: CityData[] }

export default function CompareCitiesClient({ allCities }: Props) {
  const searchParams = useSearchParams()

  const defaultSlugs = useMemo(() => {
    const live = allCities.map(c => c.slug)
    return ['lisbon', 'berlin', 'london'].filter(s => live.includes(s)).slice(0, 3)
      .concat(live.slice(0, 3)).filter((s, i, a) => a.indexOf(s) === i).slice(0, 3)
  }, [allCities])

  const [selected, setSelected] = useState<string[]>(() => {
    const fromUrl = searchParams.get('cities')
    if (fromUrl && fromUrl.length <= 200) {
      const slugs = fromUrl.split(',').filter(s => /^[a-z0-9-]+$/.test(s) && allCities.some(c => c.slug === s))
      if (slugs.length >= 2) return slugs.slice(0, LEDGER_MAX)
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
  const [emailVal, setEmailVal] = useState('')
  const [emailState, setEmailState] = useState<'idle' | 'loading' | 'sent' | 'error'>('idle')

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

  // ── Derived data ──────────────────────────────────────────────────────────

  const picks = useMemo(
    () => selected.map(s => allCities.find(c => c.slug === s)).filter(Boolean) as CityData[],
    [selected, allCities]
  )

  const totals = useMemo(
    () => picks.map(c => COST_ROWS.reduce((s, r) => s + (c.costs[r.key] ?? 0), 0)),
    [picks]
  )

  const indexed = useMemo(
    () => picks
      .map((c, i) => ({ c, total: totals[i] }))
      .sort((a, b) => a.total - b.total),
    [picks, totals]
  )

  const isoTotals = useMemo(
    () => picks.map(c => isolated ? (c.costs[isolated] ?? 0) : totals[picks.indexOf(c)]),
    [picks, isolated, totals]
  )

  const scaleMax = useMemo(
    () => niceMax(isoTotals.length ? Math.max(...isoTotals) : 5000),
    [isoTotals]
  )

  const minT = indexed.length ? indexed[0].total : 0
  const maxT = indexed.length ? indexed[indexed.length - 1].total : 0

  // Scale ticks (0..5)
  const scaleTicks = useMemo(() => {
    const TICKS = 5
    return Array.from({ length: TICKS + 1 }, (_, i) => ({
      pct: (i / TICKS) * 100,
      label: i === 0 ? '0' : fmtCompact((scaleMax * i) / TICKS, currency),
    }))
  }, [scaleMax, currency])

  // Verdict
  const verdict = useMemo(() => {
    if (indexed.length < 2) return null
    const cheapest = indexed[0]
    const dearest  = indexed[indexed.length - 1]
    const gap = dearest.total - cheapest.total
    const gapPct = Math.round((dearest.total / cheapest.total - 1) * 100)
    const yearGap = gap * 12
    let bigRow = COST_ROWS[0]
    let bigDelta = 0
    COST_ROWS.forEach(r => {
      const d = (dearest.c.costs[r.key] ?? 0) - (cheapest.c.costs[r.key] ?? 0)
      if (Math.abs(d) > Math.abs(bigDelta)) { bigDelta = d; bigRow = r }
    })
    return { cheapest, dearest, gap, gapPct, yearGap, bigRow, bigDelta }
  }, [indexed])

  const strikeLabel = useMemo(() => {
    if (!verdict) return 'a small inheritance'
    const d = verdict.dearest.c.slug
    const c = verdict.cheapest.c.slug
    const pair = [d, c].sort().join('|')
    const pairLabels: Record<string, string> = {
      // Original pairs
      'lisbon|london':           "your landlord's third holiday home",
      'lisbon|new-york':         "a year of therapy for living in New York",
      'lisbon|singapore':        "a condo in the country you left",
      'london|new-york':         "the deposit on a studio neither of you can afford",
      'london|tokyo':            "what London charges just for the postcode",
      'dubai|london':            "the tax you didn't pay living in Dubai",
      'berlin|new-york':         "a sabbatical, a motorbike, and change",
      'berlin|london':           "six months of Berlin rent, paid twice",
      'amsterdam|new-york':      "a boat house. a real one.",
      'barcelona|london':        "a long weekend every single month",
      'dubai|singapore':         "a business class round-trip, twelve times",
      'sydney|tokyo':            "a plot twist",
      'toronto|new-york':        "your Canadian healthcare, in cash",
      // New city pairs
      'bangkok|london':          "six flights to Bangkok and back",
      'bangkok|new-york':        "a year in Bangkok. Twice.",
      'bangkok|singapore':       "what Singapore charges for the school district",
      'bangkok|tokyo':           "all the ramen you'll ever need",
      'chiang-mai|london':       "twelve months in Chiang Mai, with spending money",
      'chiang-mai|new-york':     "a down payment. On the Chiang Mai apartment.",
      'chiang-mai|lisbon':       "already the cheapest city on this list",
      'bali|london':             "a villa with a pool. For the year.",
      'bali|singapore':          "what Singapore charges for a parking space",
      'bali|new-york':           "the therapy you need to afford New York",
      'medellin|london':         "eleven months of Medellín rent",
      'medellin|barcelona':      "the difference is the eternal spring",
      'medellin|lisbon':         "a flight home every month and still cheaper",
      'mexico-city|new-york':    "a year of guac. Legal, unlimited.",
      'mexico-city|london':      "what London charges for the accent",
      'mexico-city|berlin':      "the tacos you didn't eat in Berlin",
      'kuala-lumpur|singapore':  "Singapore's postcode, without Singapore's rent",
      'kuala-lumpur|london':     "a long stay hotel in London. One month.",
      'cape-town|london':        "a flight to Cape Town. And back. Many times.",
      'cape-town|amsterdam':     "Table Mountain isn't in the price",
      'malaga|london':           "300 days of Málaga sun you're not getting in London",
      'malaga|berlin':           "the Beckham Law working exactly as intended",
      'malaga|barcelona':        "beach, cheaper rent, and the same visa",
      'tbilisi|london':          "a year of wine. Georgian wine.",
      'tbilisi|lisbon':          "what Lisbon costs. Visa-free, no application.",
      'tbilisi|berlin':          "the sulphur bath budget for a decade",
      'buenos-aires|london':     "the steak budget. For life.",
      'buenos-aires|new-york':   "Palermo vs. the other Palermo. Yours is cheaper.",
      'buenos-aires|barcelona':  "European architecture at South American prices",
      'tallinn|london':          "a medieval old town. Medieval prices it is not, but closer.",
      'tallinn|amsterdam':       "the e-residency application fee. Many times over.",
      'da-nang|london':          "a beach, a bowl of pho, and most of your rent back",
      'da-nang|bali':            "Da Nang is what Bali was before everyone found Bali",
      'da-nang|singapore':       "eleven months of Da Nang for one month of Singapore",
    }
    if (pairLabels[pair]) return pairLabels[pair]
    const y = verdict.yearGap
    if (y < 3000)  return 'a decent holiday'
    if (y < 6000)  return "a gym membership you'd actually use"
    if (y < 10000) return 'a return business class ticket'
    if (y < 15000) return 'a used car, running'
    if (y < 20000) return 'a semester abroad'
    if (y < 30000) return 'a small inheritance'
    if (y < 50000) return 'a down payment deposit'
    return 'a year off, honestly'
  }, [verdict])

  // ── Handlers ─────────────────────────────────────────────────────────────

  const toggleCity = useCallback((slug: string) => {
    setSelected(prev => {
      if (prev.includes(slug)) {
        if (prev.length <= 2) return prev
        return prev.filter(s => s !== slug)
      }
      if (prev.length >= LEDGER_MAX) return prev
      return [...prev, slug]
    })
  }, [])

  const nextCurrency = useCallback(() => {
    setCurrency(prev => CURR_CYCLE[(CURR_CYCLE.indexOf(prev) + 1) % CURR_CYCLE.length])
  }, [])

  const toggleIsolate = useCallback((key: CostKey) => {
    setIsolated(prev => prev === key ? null : key)
  }, [])

  const submitEmail = useCallback(async () => {
    if (!emailVal.includes('@') || picks.length < 2) return
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

  // ── Render helpers ────────────────────────────────────────────────────────

  function renderRaceRow(c: CityData, total: number, rank: number) {
    const isCheap = total === minT && minT !== maxT
    const isDear  = total === maxT && minT !== maxT && picks.length >= 3
    const isoVal  = isolated ? (c.costs[isolated] ?? 0) : total
    const widthPct = scaleMax > 0 ? (isoVal / scaleMax) * 100 : 0

    const rowCls = [
      styles.raceRow,
      isCheap ? styles.isCheap : '',
      isDear  ? styles.isDear  : '',
    ].filter(Boolean).join(' ')

    // Segments: when isolated, only the isolated seg; otherwise all
    const visibleRows = isolated
      ? COST_ROWS.filter(r => r.key === isolated)
      : COST_ROWS

    // Delta text
    let deltaEl: React.ReactNode
    if (isolated) {
      deltaEl = `only ${COST_ROWS.find(r => r.key === isolated)!.label.toLowerCase()}`
    } else if (isCheap) {
      deltaEl = <span className={styles.deltaDown}>↓ baseline · cheapest</span>
    } else if (total === minT) {
      deltaEl = <span className={styles.deltaBase}>— baseline —</span>
    } else {
      const overPct = Math.round((total / minT - 1) * 100)
      const overAbs = fmt(total - minT, currency)
      deltaEl = <span className={styles.deltaUp}>+{overPct}% · {overAbs}/mo over №1</span>
    }

    return (
      <div key={c.slug} className={rowCls}>

        {/* Left: rank + city */}
        <div className={styles.rrL}>
          <span className={styles.rrRank}>№{rank + 1}</span>
          <div className={styles.rrId}>
            {CITY_TO_ISO[c.slug] ? <FlagIcon code={CITY_TO_ISO[c.slug]} size="sm" className={styles.rrFlag} /> : <span className={styles.rrFlag}>{c.flag}</span>}
            <span className={styles.rrName}>{c.name}</span>
            <span className={styles.rrMeta}>{c.country} · {c.code}</span>
          </div>
        </div>

        {/* Centre: bar */}
        <div className={styles.rrTrack}>
          <div className={styles.rrBar} style={{ width: `${widthPct.toFixed(2)}%` }}>
            {visibleRows
              .filter(r => (c.costs[r.key] ?? 0) > 0)
              .map(r => {
                const v = c.costs[r.key] ?? 0
                const pct = total > 0 ? v / total : 0
                const showLbl = pct > 0.13 || !!isolated
                const showVal = pct > 0.18 || !!isolated
                return (
                  <div
                    key={r.key}
                    className={[styles.rrSeg, isolated === r.key ? styles.rrSegLit : ''].filter(Boolean).join(' ')}
                    style={{ flexGrow: v, background: r.color }}
                  >
                    {showLbl && <span className={styles.rrSegLbl}>{r.label}</span>}
                    {showVal && <span className={styles.rrSegVal}>{fmt(v, currency)}</span>}
                    <span className={styles.rrSegTip}>{r.label} · {fmt(v, currency)} / mo</span>
                  </div>
                )
              })}
          </div>
        </div>

        {/* Right: total + delta */}
        <div className={styles.rrR}>
          <span className={styles.rrTotal}>
            {fmt(isolated ? (c.costs[isolated] ?? 0) : total, currency)}
          </span>
          <span className={styles.rrDelta}>{deltaEl}</span>
        </div>
      </div>
    )
  }

  // Build race list with inter-row annotations
  const raceElements = useMemo(() => {
    if (picks.length < 2) return null
    const els: React.ReactNode[] = []

    indexed.forEach(({ c, total }, rank) => {
      els.push(renderRaceRow(c, total, rank))

    })

    return els
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [indexed, isolated, currency, minT, maxT, picks.length, scaleMax])

  // Verdict sentence — scenario-aware
  const verdictSentence = useMemo((): React.ReactNode => {
    if (!verdict) return 'Pick two cities to see what a month really costs.'
    const { cheapest, dearest, gap, gapPct, yearGap, bigRow, bigDelta } = verdict
    const cheap = <strong><span className={styles.amberText}>{cheapest.c.name}</span></strong>
    const dear  = <strong><span className={styles.amberText}>{dearest.c.name}</span></strong>
    const fGap      = <span className={styles.amberText}>{fmt(gap, currency)}</span>
    const fYearGap  = <span className={styles.amberText}>{fmt(yearGap, currency)}</span>
    const fBigDelta = <span className={styles.amberText}>{fmt(Math.abs(bigDelta), currency)}</span>

    // Scenario 1: nearly equal
    if (gapPct < 12) {
      return <>{dear} and {cheap} cost almost the same — {fGap}/mo apart. Pick on vibes.</>
    }

    // Scenario 2: rent dominates
    if (bigRow.key === 'rent' && Math.abs(bigDelta) > gap * 0.65) {
      return <>The gap is mostly rent. {dear} charges {fBigDelta}/mo more for a 1BR than {cheap}. Everything else is close.</>
    }

    // Scenario 3: enormous gap
    if (gapPct > 85) {
      return <>{dear} costs +{gapPct}% more than {cheap} every month. That&rsquo;s {fYearGap}/year — or just move to {cheap}.</>
    }

    // Scenario 4: non-rent category drives it
    if (bigRow.key !== 'rent') {
      return <>Surprisingly, {bigRow.label.toLowerCase()} is the main gap. {dear} spends {fBigDelta}/mo more on it than {cheap}.</>
    }

    // Default
    return <>Living in {dear} costs {fGap}/mo more than {cheap}. Over a year, that&rsquo;s <span className={styles.strike}>{strikeLabel}</span> — {fYearGap} you&rsquo;re not spending.</>
  }, [verdict, currency, strikeLabel, styles])

  return (
    <div className={styles.page}>

      <Nav countries={[]} onCountrySelect={() => {}} />

      <main className={styles.folio} style={{ paddingTop: 80 }}>

        {/* Heading */}
        <div className={styles.mathHead}>
          <span className={styles.mathSolid}>The </span>
          <span className={styles.mathOutline}>Math</span>
        </div>

        {/* Sub */}
        <section className={`${styles.raceSub} ${styles.fu}`}>
          <div className={styles.raceSubL}>
            Pick up to four cities. Numbers in{' '}
            <button type="button" className={styles.currToggle} onClick={nextCurrency}>
              {CURR_LABEL[currency]} ⇄
            </button>
          </div>
        </section>

        {/* Pick strip */}
        <section className={styles.pickStrip}>
          <div className={styles.pickHeader}>
            <span className={styles.pickLbl}>
              <span className={styles.pickLblArr}>→</span> Pick cities
            </span>
            <span className={styles.pickCap}>
              <span className={styles.pickCapNum}>{selected.length}</span> of 4 selected
            </span>
          </div>
          <div className={styles.pickGroups}>
            {REGION_ORDER.map(region => {
              const regionCities = allCities.filter(c => CITY_REGION[c.slug] === region)
              if (!regionCities.length) return null
              return (
                <div key={region} className={styles.pickGroup}>
                  <span className={styles.pickGroupLabel}>{region}</span>
                  <div className={styles.pickGroupCities}>
                    {regionCities.map(c => {
                      const isOn = selected.includes(c.slug)
                      const atMax = selected.length >= LEDGER_MAX && !isOn
                      const minReached = selected.length <= 2 && isOn
                      return (
                        <button
                          key={c.slug}
                          type="button"
                          className={`${styles.pickChip}${isOn ? ' ' + styles.pickChipOn : ''}`}
                          disabled={atMax || minReached}
                          onClick={() => toggleCity(c.slug)}
                        >
                          {CITY_TO_ISO[c.slug] ? <FlagIcon code={CITY_TO_ISO[c.slug]} size="sm" className={styles.chFlag} /> : <span className={styles.chFlag}>{c.flag}</span>}
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
              <span className={styles.legendLblArr}>↳</span> Categories · click to isolate
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
            <button type="button" className={styles.legendAction} onClick={() => {
              navigator.clipboard.writeText(window.location.href).catch(() => {})
              setCopied(true)
              setTimeout(() => setCopied(false), 1800)
            }}>
              {copied ? '✓ Copied' : '↗ Share'}
            </button>
            <button type="button" className={`${styles.legendAction} ${styles.legendActionGhost}`} onClick={reset}>
              ↻ Reset
            </button>
          </div>
        </section>

        {/* Race section */}
        <section className={styles.race}>
          {/* Scale ruler */}
          <div className={styles.scale}>
            <div className={styles.scaleL}>Scale · linear · {currency.toUpperCase()}/mo</div>
            <div className={styles.scaleTrack}>
              {scaleTicks.map((t, i) => (
                <Fragment key={i}>
                  <span
                    className={`${styles.scaleTick} ${styles.scaleTickMajor}`}
                    style={{ left: `${t.pct}%` }}
                  />
                  <span
                    className={styles.scaleLabel}
                    style={{ left: `${t.pct}%` }}
                  >
                    {t.label}
                  </span>
                </Fragment>
              ))}
            </div>
            <div className={styles.scaleR}>→ steeper</div>
          </div>

          {/* Race list */}
          <div className={styles.raceList}>
            {picks.length < 2 ? (
              <div className={styles.raceEmpty}>
                Pick at least two cities above.
                <span>— or three, or four —</span>
              </div>
            ) : raceElements}
          </div>
        </section>

        {/* Verdict */}
        <section className={styles.verdict}>
          <div>
            <div className={styles.verdictEyebrow}>→ The Verdict</div>
            <p className={styles.verdictText}>{verdictSentence}</p>
          </div>

          <div className={styles.verdictR}>
            {verdict ? (
              <>
                <div className={`${styles.vrCard} ${styles.vrCardCheap}`}>
                  <div className={styles.vrLbl}>→ Best deal</div>
                  <div className={styles.vrBody}>
                    <span className={styles.it}>{verdict.cheapest.c.name}</span> ·{' '}
                    <span className={`${styles.vrBig} ${styles.vrBigCheap}`}>
                      {fmt(verdict.cheapest.total, currency)}
                    </span><br />
                    a month, all-in.
                  </div>
                </div>
                <div className={`${styles.vrCard} ${styles.vrCardDear}`}>
                  <div className={styles.vrLbl}>→ Steepest</div>
                  <div className={styles.vrBody}>
                    <span className={styles.it}>{verdict.dearest.c.name}</span> ·{' '}
                    <span className={`${styles.vrBig} ${styles.vrBigDear}`}>
                      +{verdict.gapPct}%
                    </span><br />
                    over №1 every month.
                  </div>
                </div>
                <div className={styles.vrCard}>
                  <div className={styles.vrLbl}>→ Biggest gap · single line</div>
                  <div className={styles.vrBody}>
                    <span className={styles.it}>{verdict.bigRow.label}</span> ·{' '}
                    <span className={styles.vrBig}>
                      {fmt(Math.abs(verdict.bigDelta), currency)}
                    </span><br />
                    between №1 and last.
                  </div>
                </div>
              </>
            ) : null}
          </div>
        </section>


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
              <div style={{ fontSize: 14, color: '#00ffd5', fontWeight: 700, fontFamily: 'sans-serif' }}>
                ✓ Sent — check your inbox.
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
                    border: '1px solid rgba(240,240,232,0.12)',
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
                  disabled={emailState === 'loading' || !emailVal.includes('@')}
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
                    opacity: !emailVal.includes('@') ? 0.4 : 1,
                  }}
                >
                  {emailState === 'loading' ? '...' : 'Send →'}
                </button>
              </div>
            )}
            {emailState === 'error' && (
              <div style={{ width: '100%', fontSize: 12, color: '#f87171', fontFamily: 'sans-serif' }}>
                Something went wrong. Try again.
              </div>
            )}
          </section>
        )}

      </main>
      <Footer />
    </div>
  )
}
