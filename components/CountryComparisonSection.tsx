'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { FlagIcon } from '@/components/FlagIcon'

// Stat diffs: Country A vs Country B
// Costs from app city data (Numbeo-sourced), tax from salary-calculator TAX_DATA
const PAIRS = [
  {
    // Dubai rent €2,200 vs Berlin €1,350 → Dubai 63% more expensive
    // UAE 0% income tax vs Germany ~40% effective for senior SE
    // Dubai internet ~200 Mbps, Berlin ~95 Mbps
    a: { code: 'ae', name: 'UNITED ARAB\nEMIRATES' },
    b: { code: 'de', name: 'GERMANY' },
    stats: [
      { label: 'INCOME TAX',   value: '−40pp', good: true },
      { label: 'INTERNET',     value: '+111%', good: true },
      { label: 'MONTHLY COST', value: '+63%',  good: false },
    ],
    editorial: 'Dubai keeps your full salary. Berlin keeps 40% of it.',
  },
  {
    // Tallinn rent €840 vs Amsterdam €1,950 → EE 57% cheaper
    // Estonia 20% flat tax vs Netherlands ~42% effective → −22pp
    // Both excellent internet, EE ~160 Mbps vs NL ~130 Mbps → EE +23%
    a: { code: 'ee', name: 'ESTONIA' },
    b: { code: 'nl', name: 'NETHERLANDS' },
    stats: [
      { label: 'MONTHLY COST', value: '−57%',  good: true },
      { label: 'INCOME TAX',   value: '−22pp', good: true },
      { label: 'INTERNET',     value: '+23%',  good: true },
    ],
    editorial: 'Estonia. Lower cost, lower tax, faster internet. Still EU.',
  },
  {
    // Tbilisi rent €630 vs Paris €1,800 → GE 65% cheaper
    // Georgia 20% flat + 2% SS = 22% vs France ~30% income tax + 22% SS = ~52% → −30pp
    // Georgia good internet vs France excellent → GE ~80 Mbps vs FR ~200 Mbps
    a: { code: 'ge', name: 'GEORGIA' },
    b: { code: 'fr', name: 'FRANCE' },
    stats: [
      { label: 'MONTHLY COST',  value: '−65%',  good: true },
      { label: 'TAX BURDEN',    value: '−30pp', good: true },
      { label: 'INTERNET',      value: '−60%',  good: false },
    ],
    editorial: "Georgia costs 65% less than Paris. Your bank account will notice.",
  },
  {
    // Bangkok rent €580 vs London €2,600 → TH 78% cheaper
    // Thailand effective ~12% income tax vs UK ~40% → −28pp
    // Bangkok excellent internet ~200 Mbps vs London ~120 Mbps → +67%
    a: { code: 'th', name: 'THAILAND' },
    b: { code: 'gb', name: 'UNITED\nKINGDOM' },
    stats: [
      { label: 'MONTHLY COST', value: '−78%',  good: true },
      { label: 'INCOME TAX',   value: '−28pp', good: true },
      { label: 'INTERNET',     value: '+67%',  good: true },
    ],
    editorial: 'Bangkok. 78% cheaper than London. Same Netflix, better weather.',
  },
  {
    // Singapore rent €2,580 vs Copenhagen €1,700 → SG 52% more expensive
    // Singapore effective ~18% vs Denmark effective ~52% → −34pp
    // Singapore ~256 Mbps vs Denmark ~160 Mbps → +60%
    a: { code: 'sg', name: 'SINGAPORE' },
    b: { code: 'dk', name: 'DENMARK' },
    stats: [
      { label: 'INCOME TAX',   value: '−34pp', good: true },
      { label: 'INTERNET',     value: '+60%',  good: true },
      { label: 'MONTHLY COST', value: '+52%',  good: false },
    ],
    editorial: 'Singapore taxes you 34% less than Denmark. The rent is the price.',
  },
  {
    // Lisbon rent €1,200 vs Zurich €2,500 → PT 52% cheaper
    // Portugal ~28% effective vs Switzerland ~23% federal+cantonal ~31% effective → −3pp (minimal)
    // Both excellent internet, similar speeds
    a: { code: 'pt', name: 'PORTUGAL' },
    b: { code: 'ch', name: 'SWITZERLAND' },
    stats: [
      { label: 'MONTHLY COST', value: '−52%',  good: true },
      { label: 'INCOME TAX',   value: '−3pp',  good: true },
      { label: 'INTERNET',     value: '−5%',   good: false },
    ],
    editorial: 'Lisbon. Half the cost of Zurich with nearly the same tax rate.',
  },
  {
    // Warsaw rent €900 vs Stockholm €1,600 → PL 44% cheaper
    // Poland 12-32% income tax, effective ~18% vs Sweden ~32% effective → −14pp
    // Warsaw excellent internet ~180 Mbps vs Stockholm ~170 Mbps → +6%
    a: { code: 'pl', name: 'POLAND' },
    b: { code: 'se', name: 'SWEDEN' },
    stats: [
      { label: 'MONTHLY COST', value: '−44%',  good: true },
      { label: 'INCOME TAX',   value: '−14pp', good: true },
      { label: 'INTERNET',     value: '+6%',   good: true },
    ],
    editorial: 'Warsaw costs 44% less than Stockholm. EU passport, same timezone.',
  },
  {
    // Buenos Aires rent €490 vs New York €3,500 → AR 86% cheaper
    // Argentina effective ~25% vs US ~28% federal effective → −3pp (minimal)
    // Buenos Aires good internet vs NY excellent → −40%
    a: { code: 'ar', name: 'ARGENTINA' },
    b: { code: 'us', name: 'UNITED\nSTATES' },
    stats: [
      { label: 'MONTHLY COST', value: '−86%',  good: true },
      { label: 'INCOME TAX',   value: '−3pp',  good: true },
      { label: 'INTERNET',     value: '−40%',  good: false },
    ],
    editorial: 'Buenos Aires. 86% cheaper than New York. Same remote job.',
  },
]

export default function CountryComparisonSection() {
  const [idx, setIdx]         = useState(0)
  const [visible, setVisible] = useState(true)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  useEffect(() => {
    const timer = setInterval(() => {
      setVisible(false)
      setTimeout(() => {
        setIdx(i => (i + 1) % PAIRS.length)
        setVisible(true)
      }, 380)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  const pair = PAIRS[idx]

  return (
    <section
      aria-label="Country Comparison"
      style={{
        background:    '#08090f',
        paddingTop:    'clamp(64px, 9vh, 100px)',
        paddingBottom: 'clamp(64px, 9vh, 100px)',
        paddingLeft:   'clamp(20px, 4vw, 56px)',
        paddingRight:  'clamp(20px, 4vw, 56px)',
        position:      'relative',
        overflow:      'hidden',
      }}
    >
      {/* Main comparison area */}
      <div
        style={{
          maxWidth:   1100,
          margin:     '0 auto',
          opacity:    visible ? 1 : 0,
          transition: 'opacity 0.38s ease',
        }}
      >
        {/* Country names row — stacks vertically on mobile */}
        {isMobile ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Country A */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <FlagIcon code={pair.a.code} size="md" />
              <h2 style={{
                fontFamily: 'Cabinet Grotesk, sans-serif', fontWeight: 800,
                fontSize: 'clamp(28px, 8vw, 40px)', letterSpacing: '-0.03em',
                lineHeight: 0.95, color: '#ffffff', margin: 0,
              }}>
                {pair.a.name.replace('\n', ' ')}
              </h2>
            </div>

            {/* Stat chips row on mobile */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {pair.stats.map((s, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  background: '#0e0f17',
                  border: `1px solid ${s.good ? 'rgba(0,255,213,0.2)' : 'rgba(255,80,80,0.15)'}`,
                  padding: '6px 12px',
                }}>
                  <span style={{ fontFamily: 'Satoshi, monospace', fontSize: 13, fontWeight: 700, color: s.good ? '#00ffd5' : 'rgba(255,100,100,0.85)' }}>
                    {s.value}
                  </span>
                  <span style={{ fontFamily: 'Satoshi, sans-serif', fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)' }}>
                    {s.label}
                  </span>
                </div>
              ))}
            </div>

            {/* Country B */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <FlagIcon code={pair.b.code} size="md" />
              <h2 style={{
                fontFamily: 'Cabinet Grotesk, sans-serif', fontWeight: 800,
                fontSize: 'clamp(28px, 8vw, 40px)', letterSpacing: '-0.03em',
                lineHeight: 0.95, color: 'rgba(255,255,255,0.3)', margin: 0,
              }}>
                {pair.b.name.replace('\n', ' ')}
              </h2>
            </div>
          </div>
        ) : (
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1px 1fr',
            alignItems: 'center', gap: 0, position: 'relative',
            minHeight: 'clamp(140px, 18vw, 220px)',
          }}>
            {/* Country A */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', paddingRight: 'clamp(32px, 5vw, 72px)', gap: 12 }}>
              <FlagIcon code={pair.a.code} size="lg" />
              <h2 style={{
                fontFamily: 'Cabinet Grotesk, sans-serif', fontWeight: 800,
                fontSize: 'clamp(32px, 5.5vw, 76px)', letterSpacing: '-0.03em',
                lineHeight: 0.95, color: '#ffffff', margin: 0,
                textAlign: 'right', whiteSpace: 'pre-line',
              }}>
                {pair.a.name}
              </h2>
            </div>

            {/* Divider with floating stat chips */}
            <div style={{ position: 'relative', alignSelf: 'stretch', display: 'flex', justifyContent: 'center' }}>
              <div style={{ width: 1, background: 'rgba(255,255,255,0.12)', height: '100%', position: 'absolute', left: '50%', transform: 'translateX(-50%)' }} />
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center' }}>
                {pair.stats.map((s, i) => (
                  <div key={i} style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
                    background: '#0e0f17',
                    border: `1px solid ${s.good ? 'rgba(0,255,213,0.2)' : 'rgba(255,80,80,0.15)'}`,
                    padding: '4px 10px', whiteSpace: 'nowrap',
                  }}>
                    <span style={{ fontFamily: 'Satoshi, monospace', fontSize: 'clamp(11px, 1.4vw, 15px)', fontWeight: 700, color: s.good ? '#00ffd5' : 'rgba(255,100,100,0.85)', letterSpacing: '-0.01em' }}>
                      {s.value}
                    </span>
                    <span style={{ fontFamily: 'Satoshi, sans-serif', fontSize: 9, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.28)' }}>
                      {s.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Country B */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', paddingLeft: 'clamp(32px, 5vw, 72px)', gap: 12 }}>
              <FlagIcon code={pair.b.code} size="lg" />
              <h2 style={{
                fontFamily: 'Cabinet Grotesk, sans-serif', fontWeight: 800,
                fontSize: 'clamp(32px, 5.5vw, 76px)', letterSpacing: '-0.03em',
                lineHeight: 0.95, color: 'rgba(255,255,255,0.28)', margin: 0, whiteSpace: 'pre-line',
              }}>
                {pair.b.name}
              </h2>
            </div>
          </div>
        )}

        {/* Editorial line + CTA */}
        <div style={{
          display: 'flex', flexDirection: isMobile ? 'column' : 'row',
          justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'center',
          marginTop: 'clamp(24px, 4vh, 48px)', gap: 16,
        }}>
          <p style={{
            fontFamily: 'Satoshi, sans-serif', fontStyle: 'italic',
            fontSize: isMobile ? 14 : 'clamp(13px, 1.5vw, 17px)',
            fontWeight: 400, color: 'rgba(255,255,255,0.42)', margin: 0,
            maxWidth: 520,
          }}>
            '{pair.editorial}'
          </p>

          <Link
            href="/compare/countries"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '12px 20px',
              border: '1px solid rgba(255,255,255,0.18)',
              fontFamily: 'Satoshi, sans-serif', fontSize: 11, fontWeight: 700,
              letterSpacing: '0.14em', textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.55)', textDecoration: 'none',
              transition: 'border-color 0.15s, color 0.15s',
              alignSelf: isMobile ? 'flex-start' : 'auto',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#00ffd5'; (e.currentTarget as HTMLElement).style.color = '#00ffd5' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.18)'; (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.55)' }}
          >
            COMPARE COUNTRIES →
          </Link>
        </div>

        {/* Progress dots */}
        <div style={{
          display:        'flex',
          justifyContent: 'center',
          gap:            8,
          marginTop:      'clamp(32px, 4.5vh, 52px)',
        }}>
          {PAIRS.map((_, i) => (
            <button
              key={i}
              onClick={() => { setVisible(false); setTimeout(() => { setIdx(i); setVisible(true) }, 380) }}
              aria-label={`Show pair ${i + 1}`}
              style={{
                width:      i === idx ? 20 : 6,
                height:     6,
                background: i === idx ? '#00ffd5' : 'rgba(255,255,255,0.15)',
                border:     'none',
                cursor:     'pointer',
                padding:    0,
                transition: 'width 0.3s ease, background 0.3s ease',
              }}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
