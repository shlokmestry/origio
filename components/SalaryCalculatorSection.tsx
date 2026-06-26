'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import Link from 'next/link'

// Pre-calculated using exact tax logic from salary-calculator/page.tsx
// All values: Senior level (×1.45), rounded to nearest 100
const PAIRS = [
  {
    role: 'SOFTWARE ENGINEER · SENIOR',
    featured: {
      flag: '🇦🇪', country: 'UNITED ARAB EMIRATES',
      grossLabel: 'AED 406,000', netLabel: 'AED 406,000',
      sub: '$110,500 / yr', taxRate: '0%',
    },
    vs: {
      label: 'vs Germany · Same Role',
      netLabel: '€48,800 net',
      sub: 'from €104,400 gross · 53% lost',
    },
    editorial: "That's $66,200/yr you're not taking home in Berlin.",
    odoGross:  { prefix: 'AED ', digits: '406000', suffix: '' },
    odoNet:    { prefix: 'AED ', digits: '406000', suffix: '' },
    odoVs:     { prefix: '€',   digits: '48800',  suffix: ' net' },
  },
  {
    role: 'AI / ML ENGINEER · SENIOR',
    featured: {
      flag: '🇸🇬', country: 'SINGAPORE',
      grossLabel: 'S$217,500', netLabel: 'S$176,700',
      sub: '$130,900 / yr', taxRate: '19%',
    },
    vs: {
      label: 'vs France · Same Role',
      netLabel: '€58,700 net',
      sub: 'from €104,400 gross · 44% lost',
    },
    editorial: "Singapore keeps 81% of your salary. France keeps 44%.",
    odoGross:  { prefix: 'S$', digits: '217500', suffix: '' },
    odoNet:    { prefix: 'S$', digits: '176700', suffix: '' },
    odoVs:     { prefix: '€', digits: '58700',  suffix: ' net' },
  },
  {
    role: 'PRODUCT MANAGER · SENIOR',
    featured: {
      flag: '🇦🇪', country: 'UNITED ARAB EMIRATES',
      grossLabel: 'AED 464,000', netLabel: 'AED 464,000',
      sub: '$126,300 / yr', taxRate: '0%',
    },
    vs: {
      label: 'vs Belgium · Same Role',
      netLabel: '€49,900 net',
      sub: 'from €118,900 gross · 58% lost',
    },
    editorial: "Belgium takes more than half. Dubai takes nothing.",
    odoGross:  { prefix: 'AED ', digits: '464000', suffix: '' },
    odoNet:    { prefix: 'AED ', digits: '464000', suffix: '' },
    odoVs:     { prefix: '€',   digits: '49900',  suffix: ' net' },
  },
  {
    role: 'DEVOPS ENGINEER · SENIOR',
    featured: {
      flag: '🇬🇪', country: 'GEORGIA',
      grossLabel: 'GEL 104,400', netLabel: 'GEL 81,400',
      sub: '$30,100 / yr', taxRate: '22%',
    },
    vs: {
      label: 'vs Denmark · Same Role',
      netLabel: 'DKK 459,500 net',
      sub: 'from DKK 913,500 gross · 50% lost',
    },
    editorial: "Georgia: flat 22%. Denmark: half your paycheck, every month.",
    odoGross:  { prefix: 'GEL ', digits: '104400', suffix: '' },
    odoNet:    { prefix: 'GEL ', digits: '81400',  suffix: '' },
    odoVs:     { prefix: 'DKK ', digits: '459500', suffix: ' net' },
  },
  {
    role: 'CLOUD ARCHITECT · SENIOR',
    featured: {
      flag: '🇪🇪', country: 'ESTONIA',
      grossLabel: '€52,200', netLabel: '€40,900',
      sub: '$44,600 / yr', taxRate: '21%',
    },
    vs: {
      label: 'vs Belgium · Same Role',
      netLabel: '€51,500 net',
      sub: 'from €123,250 gross · 58% lost',
    },
    editorial: "Estonia: 21% flat. Belgium: 58% gone before you touch it.",
    odoGross:  { prefix: '€', digits: '52200',  suffix: '' },
    odoNet:    { prefix: '€', digits: '40900',  suffix: '' },
    odoVs:     { prefix: '€', digits: '51500',  suffix: ' net' },
  },
]

function formatDigits(raw: string): string {
  // Insert commas: "406000" → "406,000"
  return parseInt(raw, 10).toLocaleString('en')
}

function buildOdometer(el: HTMLElement, prefix: string, digits: string, suffix: string, accentColor: string) {
  const formatted = formatDigits(digits)
  el.innerHTML = ''
  el.style.display = 'flex'
  el.style.alignItems = 'baseline'
  el.style.gap = '0'
  el.style.color = accentColor

  const cells: { strip: HTMLElement; target: number; pos: number }[] = []
  let digitPos = 0

  if (prefix) {
    const pre = document.createElement('span')
    pre.textContent = prefix
    pre.style.flexShrink = '0'
    el.appendChild(pre)
  }

  formatted.split('').forEach(ch => {
    if (ch === ',') {
      const sep = document.createElement('span')
      sep.textContent = ','
      sep.style.flexShrink = '0'
      el.appendChild(sep)
    } else {
      const target = parseInt(ch, 10)
      const cell = document.createElement('span')
      cell.style.display = 'block'
      cell.style.overflow = 'hidden'
      cell.style.height = '1em'
      cell.style.width = '0.62em'
      cell.style.flexShrink = '0'
      cell.style.lineHeight = '1'
      cell.style.position = 'relative'

      const strip = document.createElement('span')
      strip.style.display = 'flex'
      strip.style.flexDirection = 'column'
      strip.style.lineHeight = '1'
      strip.style.transform = 'translateY(0px)'

      for (let d = 0; d <= 9; d++) {
        const s = document.createElement('span')
        s.textContent = String(d)
        s.style.display = 'block'
        s.style.height = '1em'
        s.style.lineHeight = '1'
        s.style.textAlign = 'center'
        s.style.fontVariantNumeric = 'tabular-nums'
        strip.appendChild(s)
      }

      cell.appendChild(strip)
      el.appendChild(cell)
      cells.push({ strip, target, pos: digitPos })
      digitPos++
    }
  })

  if (suffix) {
    const suf = document.createElement('span')
    suf.textContent = suffix
    suf.style.flexShrink = '0'
    el.appendChild(suf)
  }

  return cells
}

function animateCells(cells: { strip: HTMLElement; target: number; pos: number }[], fontSize: number, baseDelay: number) {
  function easeOutCubic(t: number) { return 1 - Math.pow(1 - t, 3) }

  cells.forEach(item => {
    const delay = baseDelay + item.pos * 70
    const finalY = -(item.target * fontSize)
    if (item.target === 0) return

    setTimeout(() => {
      const start = Date.now()
      const duration = 1100
      const timer = setInterval(() => {
        const elapsed = Date.now() - start
        const p = Math.min(elapsed / duration, 1)
        item.strip.style.transform = `translateY(${finalY * easeOutCubic(p)}px)`
        if (p >= 1) {
          clearInterval(timer)
          item.strip.style.transform = `translateY(${finalY}px)`
        }
      }, 16)
    }, delay)
  })
}

export default function SalaryCalculatorSection() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  const hasEnteredView = useRef(false)
  const [pairIndex, setPairIndex] = useState(0)
  const [visible, setVisible] = useState(true)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  const pair = PAIRS[pairIndex]

  const runAnimation = useCallback(() => {
    const grossEl = document.getElementById('odo-gross')
    const netEl   = document.getElementById('odo-net')
    const vsEl    = document.getElementById('odo-vs')
    if (!grossEl || !netEl || !vsEl) return

    const fontSize = parseFloat(window.getComputedStyle(grossEl).fontSize)

    const p = PAIRS[pairIndex]

    const grossCells = buildOdometer(grossEl, p.odoGross.prefix, p.odoGross.digits, p.odoGross.suffix, '#f0f0e8')
    const netCells   = buildOdometer(netEl,   p.odoNet.prefix,   p.odoNet.digits,   p.odoNet.suffix,   '#00ffd5')
    const vsCells    = buildOdometer(vsEl,    p.odoVs.prefix,    p.odoVs.digits,    p.odoVs.suffix,    '#f0f0e8')

    animateCells(grossCells, fontSize, 150)
    animateCells(netCells,   fontSize, 150)
    animateCells(vsCells,    fontSize, 280)
  }, [pairIndex])

  // Run animation when pair changes and card is visible
  useEffect(() => {
    if (!visible) return
    // Small delay to let React render the new static text first
    const t = setTimeout(runAnimation, 50)
    return () => clearTimeout(t)
  }, [pairIndex, visible, runAnimation])

  // IntersectionObserver — trigger first animation + start cycle
  useEffect(() => {
    const card = cardRef.current
    if (!card) return

    const io = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && !hasEnteredView.current) {
        hasEnteredView.current = true
        io.disconnect()
      }
    }, { threshold: 0.1 })
    io.observe(card)
    return () => io.disconnect()
  }, [])

  // Cycle every 8 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      // Fade out
      setVisible(false)
      setTimeout(() => {
        setPairIndex(i => (i + 1) % PAIRS.length)
        setVisible(true)
      }, 350)
    }, 8000)
    return () => clearInterval(interval)
  }, [])

  return (
    <section
      ref={sectionRef}
      style={{
        width: '100%',
        background: '#0a0a0a',
        padding: isMobile ? '60px 20px' : '100px 48px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <div style={{ width: '100%', maxWidth: 960 }}>

        {/* Header row: headline + pair dots */}
        <div style={{ display: 'flex', alignItems: isMobile ? 'flex-start' : 'flex-end', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', marginBottom: 16, gap: 12 }}>
          <h2 style={{
            fontFamily: 'var(--font-heading), Helvetica Neue, Arial, sans-serif',
            fontSize: isMobile ? 'clamp(40px, 11vw, 56px)' : 'clamp(52px, 7vw, 88px)',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '-0.03em',
            color: '#f0f0e8',
            lineHeight: 0.95,
            margin: 0,
          }}>
            The Math.
          </h2>

          {/* Dot indicators */}
          <div style={{ display: 'flex', gap: 6, paddingBottom: isMobile ? 0 : 8 }}>
            {PAIRS.map((_, i) => (
              <div key={i} style={{
                width: i === pairIndex ? 20 : 6,
                height: 6,
                background: i === pairIndex ? '#00ffd5' : '#2a2a2a',
                transition: 'all 0.3s ease',
              }} />
            ))}
          </div>
        </div>

        <p style={{
          fontFamily: 'monospace',
          fontSize: 13,
          color: '#888',
          letterSpacing: '0.02em',
          marginBottom: 48,
        }}>
          Same job. Different country. The gap will surprise you.
        </p>

        {/* Card */}
        <div
          ref={cardRef}
          style={{
            background: '#111',
            border: '1px solid #2a2a2a',
            borderLeft: '3px solid #00ffd5',
            boxShadow: '3px 3px 0 #1a1a1a',
            marginBottom: 32,
            opacity: visible ? 1 : 0,
            transition: 'opacity 0.3s ease',
          }}
        >
          {/* Card header */}
          <div style={{
            padding: '18px 24px 16px',
            borderBottom: '1px solid #1a1a1a',
            display: 'flex',
            flexDirection: 'column',
            gap: 5,
          }}>
            <div style={{ fontFamily: 'monospace', fontSize: 11, color: '#555', letterSpacing: '0.14em', textTransform: 'uppercase' }}>
              ROLE: <span style={{ color: '#888' }}>{pair.role}</span>
            </div>
            <div style={{ fontFamily: 'monospace', fontSize: 11, color: '#555', letterSpacing: '0.14em', textTransform: 'uppercase' }}>
              COUNTRY: <span style={{ color: '#888' }}>{pair.featured.flag} {pair.featured.country}</span>
            </div>
          </div>

          {/* Three columns → single column on mobile */}
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 1fr' }}>

            {/* Gross */}
            <div style={{ padding: isMobile ? '18px 16px' : '24px 24px 22px', borderRight: isMobile ? 'none' : '1px solid #1a1a1a', borderBottom: isMobile ? '1px solid #1a1a1a' : 'none' }}>
              <span style={{ display: 'block', fontFamily: 'monospace', fontSize: 10, color: '#555', letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 10 }}>
                Gross Salary
              </span>
              <span
                id="odo-gross"
                style={{ display: 'flex', fontFamily: 'monospace', fontSize: isMobile ? 18 : 'clamp(16px, 2.2vw, 24px)', color: '#f0f0e8', letterSpacing: '-0.02em', lineHeight: 1, marginBottom: 8 }}
              >
                {pair.featured.grossLabel}
              </span>
              <span style={{ fontFamily: 'monospace', fontSize: 11, color: '#555' }}>{pair.featured.sub}</span>
            </div>

            {/* Net */}
            <div style={{ padding: isMobile ? '18px 16px' : '24px 24px 22px', borderRight: isMobile ? 'none' : '1px solid #1a1a1a', borderBottom: isMobile ? '1px solid #1a1a1a' : 'none' }}>
              <span style={{ display: 'block', fontFamily: 'monospace', fontSize: 10, color: '#555', letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 10 }}>
                Net Take-Home
              </span>
              <span
                id="odo-net"
                style={{ display: 'flex', fontFamily: 'monospace', fontSize: isMobile ? 18 : 'clamp(16px, 2.2vw, 24px)', color: '#00ffd5', letterSpacing: '-0.02em', lineHeight: 1, marginBottom: 8 }}
              >
                {pair.featured.netLabel}
              </span>
              <span style={{ fontFamily: 'monospace', fontSize: 11, color: '#555' }}>Tax rate: {pair.featured.taxRate}</span>
            </div>

            {/* VS */}
            <div style={{ padding: isMobile ? '18px 16px' : '24px 24px 22px' }}>
              <span style={{ display: 'block', fontFamily: 'monospace', fontSize: 10, color: '#555', letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 10 }}>
                {pair.vs.label}
              </span>
              <span
                id="odo-vs"
                style={{ display: 'flex', fontFamily: 'monospace', fontSize: isMobile ? 18 : 'clamp(16px, 2.2vw, 24px)', color: '#f0f0e8', letterSpacing: '-0.02em', lineHeight: 1, marginBottom: 8 }}
              >
                {pair.vs.netLabel}
              </span>
              <span style={{ fontFamily: 'monospace', fontSize: 11, color: '#555' }}>
                <s style={{ textDecorationColor: '#444' }}>{pair.vs.sub.split(' · ')[0]}</s>
                {pair.vs.sub.includes(' · ') ? ` · ${pair.vs.sub.split(' · ')[1]}` : ''}
              </span>
            </div>

          </div>

          {/* Editorial */}
          <div style={{
            padding: '14px 24px 16px',
            borderTop: '1px solid #1a1a1a',
            fontFamily: 'monospace',
            fontSize: 12,
            color: '#666',
            letterSpacing: '0.02em',
          }}>
            &ldquo;{pair.editorial}&rdquo;
          </div>

        </div>

        {/* CTA */}
        <Link
          href="/salary-calculator"
          style={{
            display: 'inline-block',
            border: '1px solid #00ffd5',
            padding: '13px 22px',
            fontFamily: 'monospace',
            fontSize: 12,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: '#00ffd5',
            background: 'transparent',
            textDecoration: 'none',
            marginBottom: 18,
          }}
          onMouseEnter={e => {
            const el = e.currentTarget as HTMLElement
            el.style.background = '#00ffd5'
            el.style.color = '#0a0a0a'
          }}
          onMouseLeave={e => {
            const el = e.currentTarget as HTMLElement
            el.style.background = 'transparent'
            el.style.color = '#00ffd5'
          }}
        >
          Run Your Numbers →
        </Link>

        <br />

        <span style={{ fontFamily: 'monospace', fontSize: 11, color: '#444', letterSpacing: '0.08em' }}>
          20 roles · 45 countries · salary after every deduction.
        </span>

      </div>
    </section>
  )
}
