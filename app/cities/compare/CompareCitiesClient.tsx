'use client'

import { Fragment, useState, useCallback } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import styles from './compare.module.css'

// ── City cost data (EUR baseline, sourced Q1 2026) ────────────────────────────

interface CityData {
  slug: string
  code: string
  name: string
  country: string
  flag: string
  costs: Record<CostKey, number>
}

type CostKey = 'rent' | 'groc' | 'dine' | 'util' | 'gym' | 'intnet' | 'health'

const CITIES: CityData[] = [
  { slug:'lisbon',    code:'LIS', name:'Lisbon',    country:'Portugal',       flag:'🇵🇹', costs:{rent:1200,groc:280,dine:180,util:85, gym:45, intnet:35, health:40} },
  { slug:'london',    code:'LHR', name:'London',    country:'United Kingdom', flag:'🇬🇧', costs:{rent:2750,groc:400,dine:360,util:180,gym:65, intnet:50, health:80} },
  { slug:'dublin',    code:'DUB', name:'Dublin',    country:'Ireland',        flag:'🇮🇪', costs:{rent:2400,groc:350,dine:320,util:160,gym:60, intnet:45, health:60} },
  { slug:'amsterdam', code:'AMS', name:'Amsterdam', country:'Netherlands',    flag:'🇳🇱', costs:{rent:2100,groc:320,dine:380,util:140,gym:50, intnet:45, health:70} },
  { slug:'berlin',    code:'BER', name:'Berlin',    country:'Germany',        flag:'🇩🇪', costs:{rent:1450,groc:280,dine:200,util:110,gym:30, intnet:35, health:45} },
  { slug:'barcelona', code:'BCN', name:'Barcelona', country:'Spain',          flag:'🇪🇸', costs:{rent:1550,groc:300,dine:220,util:120,gym:40, intnet:38, health:50} },
  { slug:'new-york',  code:'JFK', name:'New York',  country:'United States',  flag:'🇺🇸', costs:{rent:3550,groc:500,dine:480,util:220,gym:90, intnet:60, health:150} },
  { slug:'toronto',   code:'YYZ', name:'Toronto',   country:'Canada',         flag:'🇨🇦', costs:{rent:1750,groc:340,dine:280,util:150,gym:55, intnet:50, health:0} },
  { slug:'singapore', code:'SIN', name:'Singapore', country:'Singapore',      flag:'🇸🇬', costs:{rent:2050,groc:380,dine:200,util:180,gym:90, intnet:50, health:80} },
  { slug:'tokyo',     code:'HND', name:'Tokyo',     country:'Japan',          flag:'🇯🇵', costs:{rent:1100,groc:320,dine:180,util:130,gym:70, intnet:40, health:30} },
  { slug:'sydney',    code:'SYD', name:'Sydney',    country:'Australia',      flag:'🇦🇺', costs:{rent:1850,groc:380,dine:320,util:170,gym:75, intnet:55, health:40} },
  { slug:'dubai',     code:'DXB', name:'Dubai',     country:'UAE',            flag:'🇦🇪', costs:{rent:2600,groc:400,dine:280,util:200,gym:80, intnet:70, health:60} },
]

const LEDGER_MAX = 4

const COST_ROWS: { key: CostKey; label: string; hint: string }[] = [
  { key:'rent',   label:'Rent · 1BR centre',  hint:'monthly' },
  { key:'groc',   label:'Groceries',          hint:'pantry + market' },
  { key:'dine',   label:'Dining out',         hint:'~12 meals / mo' },
  { key:'util',   label:'Utilities',          hint:'power, water, heat' },
  { key:'gym',    label:'Gym',                hint:'monthly membership' },
  { key:'intnet', label:'Internet / co-work', hint:'home + a day desk' },
  { key:'health', label:'Healthcare',         hint:'avg out-of-pocket' },
]

type CurrencyKey = 'eur' | 'usd' | 'gbp' | 'jpy'
const RATES:      Record<CurrencyKey, number> = { eur:1,    usd:1.07, gbp:0.85, jpy:165 }
const SYMBOL:     Record<CurrencyKey, string> = { eur:'€',  usd:'$',  gbp:'£',  jpy:'¥' }
const CURR_LABEL: Record<CurrencyKey, string> = { eur:'EUR €', usd:'USD $', gbp:'GBP £', jpy:'JPY ¥' }
const CURR_CYCLE: CurrencyKey[] = ['eur', 'usd', 'gbp', 'jpy']

function fmt(n: number, currency: CurrencyKey): string {
  const v = n * RATES[currency]
  return SYMBOL[currency] + Math.round(v).toLocaleString()
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function CompareCitiesClient() {
  const searchParams = useSearchParams()

  const [selected, setSelected] = useState<string[]>(() => {
    const fromUrl = searchParams.get('cities')
    if (fromUrl) {
      const slugs = fromUrl.split(',').filter(s => CITIES.some(c => c.slug === s))
      if (slugs.length >= 2) return slugs.slice(0, LEDGER_MAX)
    }
    return ['lisbon', 'berlin', 'tokyo']
  })

  const [currency, setCurrency] = useState<CurrencyKey>('eur')
  const [copied, setCopied] = useState(false)

  const toggleCity = useCallback((slug: string) => {
    setSelected(prev => {
      if (prev.includes(slug)) return prev.filter(s => s !== slug)
      if (prev.length >= LEDGER_MAX) return prev
      return [...prev, slug]
    })
  }, [])

  const nextCurrency = useCallback(() => {
    setCurrency(prev => CURR_CYCLE[(CURR_CYCLE.indexOf(prev) + 1) % CURR_CYCLE.length])
  }, [])

  const reset = useCallback(() => {
    setSelected(['lisbon', 'berlin', 'tokyo'])
    setCurrency('eur')
  }, [])

  const copyTable = useCallback(() => {
    const picks = selected.map(s => CITIES.find(c => c.slug === s)).filter(Boolean) as CityData[]
    if (picks.length < 2) return
    const lines: string[] = [['Category', ...picks.map(p => p.name)].join('\t')]
    COST_ROWS.forEach(r => {
      lines.push([r.label, ...picks.map(p => p.costs[r.key] === 0 ? 'free' : fmt(p.costs[r.key], currency))].join('\t'))
    })
    const totals = picks.map(c => COST_ROWS.reduce((s, r) => s + c.costs[r.key], 0))
    lines.push(['TOTAL / MO', ...totals.map(t => fmt(t, currency))].join('\t'))
    navigator.clipboard.writeText(lines.join('\n')).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 1400)
  }, [selected, currency])

  const picks = selected.map(s => CITIES.find(c => c.slug === s)).filter(Boolean) as CityData[]
  const cols = picks.length

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
            <span className={styles.crumb}>Origio / Cities /</span> Compare
          </span>
          <div className={styles.navRight}>
            <Link href="/cities" className={styles.nbtn}>← Back to cities</Link>
            <Link href="/onboarding" className={styles.nbtn}>Find My City</Link>
          </div>
        </div>
      </nav>

      <div className={styles.pageWrap}>

        <Link href="/cities" className={styles.backLink}>
          <span className={styles.backArr}>←</span> Cities · The Atlas
        </Link>

        {/* PRE-HEAD */}
        <section className={`${styles.preHead} ${styles.fu}`}>
          <p className={styles.preEyebrow}>III · A ledger of everyday life</p>
          <h1 className={styles.preTitle}>
            The math, <span className={styles.it}>on paper.</span>
          </h1>
          <p className={styles.preSub}>
            Add up to four cities — rent, groceries, the gym, the doctor — and see what a real
            month adds up to. Double-entered, sourced quarterly.
          </p>
        </section>

        {/* LEDGER */}
        <section className={`${styles.ledgerSection} ${styles.fu}`}>
          <div className={styles.ledgerPaper}>
            <span className={styles.metaTl}>ORG-LDG · 2026.Q1 · Folio III</span>
            <span className={styles.metaTr}>
              Double-entry · numbers in {currency.toUpperCase()}
            </span>

            <p className={styles.ledgerEyebrow}>Compare</p>
            <h2 className={styles.ledgerTitle}>Side by <span className={styles.it}>side</span>.</h2>
            <p className={styles.ledgerSub}>
              Pick cities below in{' '}
              <button type="button" className={styles.currToggle} onClick={nextCurrency}>
                {CURR_LABEL[currency]} ⇄
              </button>
              {' '}— the table re-tallies in real time.
            </p>

            {/* CITY PICKER */}
            <div className={styles.ledgerPicker}>
              <span className={styles.ledgerPickerLbl}>Compare</span>
              {CITIES.map(c => {
                const isOn = selected.includes(c.slug)
                const atMax = selected.length >= LEDGER_MAX && !isOn
                return (
                  <button
                    key={c.slug}
                    type="button"
                    className={`${styles.ledgerChip}${isOn ? ' ' + styles.ledgerChipOn : ''}`}
                    disabled={atMax}
                    onClick={() => toggleCity(c.slug)}
                  >
                    <span className={styles.chFlag}>{c.flag}</span>
                    {c.name}
                  </button>
                )
              })}
              <span className={styles.ledgerCap}>
                <span className={styles.capNum}>{selected.length}</span> / 4 selected
              </span>
            </div>

            {/* TABLE */}
            {picks.length < 2 ? (
              <div className={styles.ledgerEmpty}>
                Pick at least two cities above to compare.
                <span>— or three, or four —</span>
              </div>
            ) : (
              <div className={styles.ledgerTable}>
                <div
                  className={styles.ltGrid}
                  style={{ gridTemplateColumns: `200px repeat(${cols}, minmax(140px, 1fr))` }}
                >
                  {/* Header */}
                  <div className={styles.ltHCat}>Category</div>
                  {picks.map(c => (
                    <div key={c.slug} className={styles.ltHCity}>
                      <span className={styles.ltHFlag}>{c.flag}</span>
                      <span className={styles.ltHName}>{c.name}</span>
                      <span className={styles.ltHIso}>{c.country} · {c.code}</span>
                    </div>
                  ))}

                  {/* Data rows */}
                  {COST_ROWS.map(r => {
                    const vals = picks.map(c => c.costs[r.key])
                    const nonZero = vals.filter(v => v > 0)
                    const min = nonZero.length ? Math.min(...nonZero) : 0
                    const max = nonZero.length > 1 ? Math.max(...nonZero) : 0
                    return (
                      <Fragment key={r.key}>
                        <div className={styles.ltRowLabel}>
                          {r.label}
                          <span className={styles.ltHint}>{r.hint}</span>
                        </div>
                        {picks.map(c => {
                          const v = c.costs[r.key]
                          const isCheap = v === min && min !== max && v > 0
                          const isDear  = v === max && min !== max && cols >= 3 && v > 0
                          const isZero  = v === 0
                          const cls = [
                            styles.ltCell,
                            isCheap ? styles.cheap : '',
                            isDear  ? styles.dear  : '',
                            isZero  ? styles.zero  : '',
                          ].filter(Boolean).join(' ')
                          return (
                            <div key={c.slug + '-' + r.key} className={cls}>
                              {isZero ? 'free' : fmt(v, currency)}
                            </div>
                          )
                        })}
                      </Fragment>
                    )
                  })}

                  {/* Total row */}
                  {(() => {
                    const totals = picks.map(c =>
                      COST_ROWS.reduce((s, r) => s + c.costs[r.key], 0)
                    )
                    const minT = Math.min(...totals)
                    const maxT = Math.max(...totals)
                    return (
                      <Fragment key="totals">
                        <div className={styles.ltTotalLabel}>
                          Total / month
                          <span className={styles.ltTotalSub}>7 line-items, all-in</span>
                        </div>
                        {picks.map((c, i) => {
                          const t = totals[i]
                          const isCheapest = t === minT && minT !== maxT
                          const isPriciest = t === maxT && minT !== maxT && cols >= 3
                          let annot = '· baseline'
                          if (isCheapest) annot = '★ best deal'
                          else if (isPriciest) annot = '· steepest'
                          else if (minT !== maxT) annot = '+' + Math.round((t / minT - 1) * 100) + '% over cheapest'
                          return (
                            <div
                              key={c.slug + '-total'}
                              className={[
                                styles.ltTotal,
                                isCheapest ? styles.ltTotalCheapest : '',
                                isPriciest  ? styles.ltTotalPriciest  : '',
                              ].filter(Boolean).join(' ')}
                            >
                              {fmt(t, currency)}
                              <span className={styles.ltTotalAnnot}>{annot}</span>
                            </div>
                          )
                        })}
                      </Fragment>
                    )
                  })()}
                </div>
              </div>
            )}

            {/* ACTIONS */}
            <div className={styles.ledgerActions}>
              <button type="button" className={styles.ledgerBtn} onClick={copyTable}>
                {copied ? '✓ Copied' : '⧉ Copy table'}
              </button>
              <button
                type="button"
                className={`${styles.ledgerBtn} ${styles.ledgerBtnGhost}`}
                onClick={() => window.print()}
              >
                ↓ Print / PDF
              </button>
              <button
                type="button"
                className={`${styles.ledgerBtn} ${styles.ledgerBtnGhost}`}
                onClick={reset}
              >
                ↻ Reset
              </button>
            </div>

            <div className={styles.ledgerFootNote}>
              <span>Sourced quarterly · local journalists · 2026.Q1</span>
              <span className={styles.footIt}>All numbers are real. The worst case is.</span>
            </div>
          </div>
        </section>

      </div>

      {/* FOOTER */}
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <Link href="/" className={styles.footerLogo}>
            <div className={styles.footerLogoMark}><span /></div>
            <span className={styles.footerLogoText}>Origio</span>
          </Link>
          <p className={styles.footerNote}>Data last verified · May 2026 · Local sources per city</p>
        </div>
      </footer>
    </div>
  )
}
