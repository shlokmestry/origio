'use client'

import { Fragment, useMemo } from 'react'
import styles from '@/app/cities/compare/compare.module.css'
import { FlagIcon } from '@/components/FlagIcon'

export type RankedCostRow<K extends string = string> = {
  key: K
  label: string
  color: string
}

export type RankedEntity<K extends string = string> = {
  slug: string
  code: string
  name: string
  meta: string
  flag: string
  iso?: string
  costs: Record<K, number | null>
}

interface RankedBarChartProps<K extends string = string> {
  entities: RankedEntity<K>[]
  costRows: RankedCostRow<K>[]
  isolated: K | null
  currencyLabel: string
  formatMoney: (n: number) => string
  formatCompact: (n: number) => string
  emptyLabel: string
  verdictNoun: string
}

function niceMax(v: number): number {
  if (v <= 2000) return Math.ceil(v / 500) * 500
  if (v <= 6000) return Math.ceil(v / 1000) * 1000
  return Math.ceil(v / 2000) * 2000
}

export default function RankedBarChart<K extends string = string>({
  entities,
  costRows,
  isolated,
  currencyLabel,
  formatMoney,
  formatCompact,
  emptyLabel,
  verdictNoun,
}: RankedBarChartProps<K>) {
  const totals = useMemo(
    () => entities.map(c => costRows.reduce((s, r) => s + (c.costs[r.key] ?? 0), 0)),
    [entities, costRows]
  )

  const indexed = useMemo(
    () => entities
      .map((c, i) => ({ c, total: totals[i] }))
      .sort((a, b) => a.total - b.total),
    [entities, totals]
  )

  const isoTotals = useMemo(
    () => entities.map((c, i) => isolated ? (c.costs[isolated] ?? 0) : totals[i]),
    [entities, isolated, totals]
  )

  const scaleMax = useMemo(
    () => niceMax(isoTotals.length ? Math.max(...isoTotals) : 5000),
    [isoTotals]
  )

  const scaleTicks = useMemo(() => {
    const TICKS = 5
    return Array.from({ length: TICKS + 1 }, (_, i) => ({
      pct: (i / TICKS) * 100,
      label: i === 0 ? '0' : formatCompact((scaleMax * i) / TICKS),
    }))
  }, [scaleMax, formatCompact])

  const minT = indexed.length ? indexed[0].total : 0
  const maxT = indexed.length ? indexed[indexed.length - 1].total : 0
  const isolatedRow = isolated ? costRows.find(r => r.key === isolated) : null
  const hasIsolatedData = isolatedRow
    ? entities.some(c => c.costs[isolatedRow.key] != null)
    : true

  const verdict = useMemo(() => {
    if (indexed.length < 2) return null
    const cheapest = indexed[0]
    const dearest = indexed[indexed.length - 1]
    const gap = dearest.total - cheapest.total
    const gapPct = cheapest.total > 0 ? Math.round((dearest.total / cheapest.total - 1) * 100) : 0
    const yearGap = gap * 12
    let bigRow = costRows[0]
    let bigDelta = 0
    costRows.forEach(r => {
      const d = (dearest.c.costs[r.key] ?? 0) - (cheapest.c.costs[r.key] ?? 0)
      if (Math.abs(d) > Math.abs(bigDelta)) {
        bigDelta = d
        bigRow = r
      }
    })
    const tied = Math.abs(gap) < 1
    return { cheapest, dearest, gap, gapPct, yearGap, bigRow, bigDelta, tied }
  }, [indexed, costRows])

  const renderRow = (c: RankedEntity<K>, total: number, rank: number) => {
    const isCheap = total === minT && minT !== maxT
    const isDear = total === maxT && minT !== maxT && entities.length >= 3
    const isoVal = isolated ? (c.costs[isolated] ?? 0) : total
    const widthPct = scaleMax > 0 ? (isoVal / scaleMax) * 100 : 0
    const visibleRows = isolated ? costRows.filter(r => r.key === isolated) : costRows

    let deltaEl: React.ReactNode
    if (isolatedRow) {
      deltaEl = `only ${isolatedRow.label.toLowerCase()}`
    } else if (isCheap) {
      deltaEl = <span className={styles.deltaDown}>↓ baseline · cheapest</span>
    } else if (total === minT) {
      deltaEl = <span className={styles.deltaBase}>— baseline —</span>
    } else {
      const overPct = minT > 0 ? Math.round((total / minT - 1) * 100) : 0
      const overAbs = formatMoney(total - minT)
      deltaEl = <span className={styles.deltaUp}>+{overPct}% · {overAbs}/mo over №1</span>
    }

    return (
      <div key={c.slug} className={[styles.raceRow, isCheap ? styles.isCheap : '', isDear ? styles.isDear : ''].filter(Boolean).join(' ')}>
        <div className={styles.rrL}>
          <span className={styles.rrRank}>№{rank + 1}</span>
          <div className={styles.rrId}>
            {c.iso ? <FlagIcon code={c.iso} size="sm" className={styles.rrFlag} /> : <span className={styles.rrFlag}>{c.flag}</span>}
            <span className={styles.rrName}>{c.name}</span>
            <span className={styles.rrMeta}>{c.meta} · {c.code}</span>
          </div>
        </div>

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
                    {showVal && <span className={styles.rrSegVal}>{formatMoney(v)}</span>}
                    <span className={styles.rrSegTip}>{r.label} · {formatMoney(v)} / mo</span>
                  </div>
                )
              })}
          </div>
        </div>

        <div className={styles.rrR}>
          <span className={styles.rrTotal}>{formatMoney(isolated ? (c.costs[isolated] ?? 0) : total)}</span>
          <span className={styles.rrDelta}>{deltaEl}</span>
        </div>
      </div>
    )
  }

  return (
    <>
      <section className={styles.race}>
        <div className={styles.scale}>
          <div className={styles.scaleL}>Scale · linear · {currencyLabel}/mo</div>
          <div className={styles.scaleTrack}>
            {scaleTicks.map((t, i) => (
              <Fragment key={i}>
                <span className={`${styles.scaleTick} ${styles.scaleTickMajor}`} style={{ left: `${t.pct}%` }} />
                <span className={styles.scaleLabel} style={{ left: `${t.pct}%` }}>{t.label}</span>
              </Fragment>
            ))}
          </div>
          <div className={styles.scaleR}>→ steeper</div>
        </div>

        <div className={styles.raceList}>
          {entities.length < 2 ? (
            <div className={styles.raceEmpty}>
              {emptyLabel}
              <span>— or three, or four —</span>
            </div>
          ) : !hasIsolatedData && isolatedRow ? (
            <div className={styles.raceEmpty}>
              No {isolatedRow.label.toLowerCase()} data for selected {verdictNoun}s yet.
              <span>Source-backed rows only. No fake zeroes.</span>
            </div>
          ) : indexed.map(({ c, total }, rank) => renderRow(c, total, rank))}
        </div>
      </section>

      <section className={styles.verdict}>
        <div>
          <div className={styles.verdictEyebrow}>→ The Verdict</div>
          <p className={styles.verdictText}>
            {verdict ? (
              verdict.tied ? (
                <>
                  Cost-only verdict: selected {verdictNoun}s are effectively tied on shown monthly costs.
                </>
              ) : (
                <>
                  Cost-only verdict: <span className={styles.amberText}>{verdict.dearest.c.name}</span> is +{verdict.gapPct}% above{' '}
                  <span className={styles.amberText}>{verdict.cheapest.c.name}</span>. That&rsquo;s{' '}
                  <span className={styles.amberText}>{formatMoney(verdict.yearGap)}/year</span> before salary, tax, visa and lifestyle tradeoffs.
                </>
              )
            ) : (
              <>Pick two {verdictNoun}s to see what a month really costs.</>
            )}
          </p>
        </div>

        <div className={styles.verdictR}>
          {verdict ? (
            <>
              <div className={`${styles.vrCard} ${styles.vrCardCheap}`}>
                <div className={styles.vrLbl}>→ Lowest shown cost</div>
                <div className={styles.vrBody}>
                  <span className={styles.it}>{verdict.cheapest.c.name}</span> ·{' '}
                  <span className={`${styles.vrBig} ${styles.vrBigCheap}`}>{formatMoney(verdict.cheapest.total)}</span><br />
                  a month, shown rows only.
                </div>
              </div>
              <div className={`${styles.vrCard} ${styles.vrCardDear}`}>
                <div className={styles.vrLbl}>→ Steepest</div>
                <div className={styles.vrBody}>
                  <span className={styles.it}>{verdict.dearest.c.name}</span> ·{' '}
                  <span className={`${styles.vrBig} ${styles.vrBigDear}`}>+{verdict.gapPct}%</span><br />
                  over №1 every month.
                </div>
              </div>
              <div className={styles.vrCard}>
                <div className={styles.vrLbl}>→ Biggest gap · single line</div>
                <div className={styles.vrBody}>
                  {Math.abs(verdict.bigDelta) > 0 ? (
                    <>
                      <span className={styles.it}>{verdict.bigRow.label}</span> ·{' '}
                      <span className={styles.vrBig}>{formatMoney(Math.abs(verdict.bigDelta))}</span><br />
                      between №1 and last.
                    </>
                  ) : (
                    <>No material line-item gap.</>
                  )}
                </div>
              </div>
            </>
          ) : null}
        </div>
      </section>
    </>
  )
}
