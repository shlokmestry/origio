'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { FlagIcon } from '@/components/FlagIcon'

// Stat diffs: Country A vs Country B (positive = A has advantage)
const PAIRS = [
  {
    a: { code: 'ae', name: 'UNITED ARAB\nEMIRATES' },
    b: { code: 'de', name: 'GERMANY' },
    stats: [
      { label: 'INCOME TAX',    value: '−42pp',  good: true },
      { label: 'MONTHLY COST',  value: '−5%',    good: true },
      { label: 'INTERNET',      value: '+130%',  good: true },
    ],
    editorial: 'Zero tax in Dubai. Germany takes 42% of every paycheck.',
  },
  {
    a: { code: 'ee', name: 'ESTONIA' },
    b: { code: 'nl', name: 'NETHERLANDS' },
    stats: [
      { label: 'MONTHLY COST',  value: '−50%',  good: true },
      { label: 'INCOME TAX',    value: '−29pp', good: true },
      { label: 'INTERNET',      value: '−6%',   good: false },
    ],
    editorial: 'Estonia. Half the cost, half the tax, same fibre.',
  },
  {
    a: { code: 'ge', name: 'GEORGIA' },
    b: { code: 'fr', name: 'FRANCE' },
    stats: [
      { label: 'MONTHLY COST',  value: '−68%',  good: true },
      { label: 'INCOME TAX',    value: '−21pp', good: true },
      { label: 'INTERNET',      value: '−61%',  good: false },
    ],
    editorial: 'Georgia costs 68% less. You keep 20% more of your salary.',
  },
  {
    a: { code: 'th', name: 'THAILAND' },
    b: { code: 'gb', name: 'UNITED\nKINGDOM' },
    stats: [
      { label: 'MONTHLY COST',  value: '−65%',  good: true },
      { label: 'INCOME TAX',    value: '−30pp', good: true },
      { label: 'INTERNET',      value: '−12%',  good: false },
    ],
    editorial: 'Thailand. 65% cheaper to live, 30% cheaper to earn.',
  },
  {
    a: { code: 'sg', name: 'SINGAPORE' },
    b: { code: 'be', name: 'BELGIUM' },
    stats: [
      { label: 'INCOME TAX',    value: '−35pp', good: true },
      { label: 'INTERNET',      value: '+133%', good: true },
      { label: 'MONTHLY COST',  value: '+3%',   good: false },
    ],
    editorial: 'Singapore costs the same as Belgium. You keep 35% more.',
  },
]

export default function CountryComparisonSection() {
  const [idx, setIdx]         = useState(0)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const timer = setInterval(() => {
      setVisible(false)
      setTimeout(() => {
        setIdx(i => (i + 1) % PAIRS.length)
        setVisible(true)
      }, 380)
    }, 8000)
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
      {/* Section label */}
      <p style={{
        fontFamily:    'Satoshi, sans-serif',
        fontSize:      10,
        fontWeight:    700,
        letterSpacing: '0.22em',
        textTransform: 'uppercase',
        color:         'rgba(255,255,255,0.22)',
        margin:        '0 0 clamp(40px, 6vh, 64px)',
        textAlign:     'center',
      }}>
        THE SPLIT.
      </p>

      {/* Main comparison area */}
      <div
        style={{
          maxWidth:   1100,
          margin:     '0 auto',
          opacity:    visible ? 1 : 0,
          transition: 'opacity 0.38s ease',
        }}
      >
        {/* Country names row */}
        <div style={{
          display:        'grid',
          gridTemplateColumns: '1fr 1px 1fr',
          alignItems:     'center',
          gap:            0,
          position:       'relative',
          minHeight:      'clamp(140px, 18vw, 220px)',
        }}>
          {/* Country A */}
          <div style={{
            display:       'flex',
            flexDirection: 'column',
            alignItems:    'flex-end',
            paddingRight:  'clamp(32px, 5vw, 72px)',
            gap:           12,
          }}>
            <FlagIcon code={pair.a.code} size="lg" />
            <h2 style={{
              fontFamily:    'Cabinet Grotesk, sans-serif',
              fontWeight:    800,
              fontSize:      'clamp(32px, 5.5vw, 76px)',
              letterSpacing: '-0.03em',
              lineHeight:    0.95,
              color:         '#ffffff',
              margin:        0,
              textAlign:     'right',
              whiteSpace:    'pre-line',
            }}>
              {pair.a.name}
            </h2>
          </div>

          {/* Divider with floating stat chips */}
          <div style={{ position: 'relative', alignSelf: 'stretch', display: 'flex', justifyContent: 'center' }}>
            <div style={{
              width:      1,
              background: 'rgba(255,255,255,0.12)',
              height:     '100%',
              position:   'absolute',
              left:       '50%',
              transform:  'translateX(-50%)',
            }} />
            {/* Stat chips */}
            <div style={{
              position:       'absolute',
              top:            '50%',
              left:           '50%',
              transform:      'translate(-50%, -50%)',
              display:        'flex',
              flexDirection:  'column',
              gap:            8,
              alignItems:     'center',
            }}>
              {pair.stats.map((s, i) => (
                <div key={i} style={{
                  display:       'flex',
                  flexDirection: 'column',
                  alignItems:    'center',
                  gap:           2,
                  background:    '#0e0f17',
                  border:        `1px solid ${s.good ? 'rgba(0,255,213,0.2)' : 'rgba(255,80,80,0.15)'}`,
                  padding:       '4px 10px',
                  whiteSpace:    'nowrap',
                }}>
                  <span style={{
                    fontFamily:    'Satoshi, monospace',
                    fontSize:      'clamp(11px, 1.4vw, 15px)',
                    fontWeight:    700,
                    color:         s.good ? '#00ffd5' : 'rgba(255,100,100,0.85)',
                    letterSpacing: '-0.01em',
                  }}>
                    {s.value}
                  </span>
                  <span style={{
                    fontFamily:    'Satoshi, sans-serif',
                    fontSize:      8,
                    fontWeight:    600,
                    letterSpacing: '0.14em',
                    textTransform: 'uppercase',
                    color:         'rgba(255,255,255,0.28)',
                  }}>
                    {s.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Country B */}
          <div style={{
            display:       'flex',
            flexDirection: 'column',
            alignItems:    'flex-start',
            paddingLeft:   'clamp(32px, 5vw, 72px)',
            gap:           12,
          }}>
            <FlagIcon code={pair.b.code} size="lg" />
            <h2 style={{
              fontFamily:    'Cabinet Grotesk, sans-serif',
              fontWeight:    800,
              fontSize:      'clamp(32px, 5.5vw, 76px)',
              letterSpacing: '-0.03em',
              lineHeight:    0.95,
              color:         'rgba(255,255,255,0.28)',
              margin:        0,
              whiteSpace:    'pre-line',
            }}>
              {pair.b.name}
            </h2>
          </div>
        </div>

        {/* Editorial line + CTA */}
        <div style={{
          display:        'flex',
          justifyContent: 'space-between',
          alignItems:     'center',
          marginTop:      'clamp(28px, 4vh, 48px)',
          flexWrap:       'wrap',
          gap:            20,
        }}>
          <p style={{
            fontFamily:  'Satoshi, sans-serif',
            fontStyle:   'italic',
            fontSize:    'clamp(13px, 1.5vw, 17px)',
            fontWeight:  400,
            color:       'rgba(255,255,255,0.42)',
            margin:      0,
            maxWidth:    520,
          }}>
            '{pair.editorial}'
          </p>

          <Link
            href="/compare"
            style={{
              display:        'inline-flex',
              alignItems:     'center',
              gap:            8,
              padding:        '10px 20px',
              border:         '1px solid rgba(255,255,255,0.18)',
              fontFamily:     'Satoshi, sans-serif',
              fontSize:       11,
              fontWeight:     700,
              letterSpacing:  '0.14em',
              textTransform:  'uppercase',
              color:          'rgba(255,255,255,0.55)',
              textDecoration: 'none',
              transition:     'border-color 0.15s, color 0.15s',
              whiteSpace:     'nowrap',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.borderColor = '#00ffd5'
              ;(e.currentTarget as HTMLElement).style.color = '#00ffd5'
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.18)'
              ;(e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.55)'
            }}
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
