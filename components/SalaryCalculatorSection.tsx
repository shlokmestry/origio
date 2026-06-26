'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'

export default function SalaryCalculatorSection() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const animatedRef = useRef(false)

  useEffect(() => {
    const CONFIGS = [
      { id: 'odo-gross', prefix: 'AED ', formatted: '350,000', suffix: '', globalDelay: 200 },
      { id: 'odo-net',   prefix: 'AED ', formatted: '350,000', suffix: '', globalDelay: 200 },
      { id: 'odo-de',    prefix: '€',     formatted: '58,400',  suffix: ' net', globalDelay: 350 },
    ]

    function buildOdometer(el: HTMLElement, cfg: typeof CONFIGS[0]) {
      el.innerHTML = ''
      el.style.display = 'flex'
      el.style.alignItems = 'flex-end'
      el.style.gap = '0'
      el.style.overflow = 'visible'

      const cells: { strip: HTMLElement; target: number; pos: number }[] = []
      let digitPos = 0

      if (cfg.prefix) {
        const pre = document.createElement('span')
        pre.textContent = cfg.prefix
        pre.style.flexShrink = '0'
        el.appendChild(pre)
      }

      cfg.formatted.split('').forEach(ch => {
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
          cell.style.width = '0.6em'
          cell.style.flexShrink = '0'
          cell.style.lineHeight = '1'

          const strip = document.createElement('span')
          strip.style.display = 'flex'
          strip.style.flexDirection = 'column'
          strip.style.lineHeight = '1'

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

      if (cfg.suffix) {
        const suf = document.createElement('span')
        suf.textContent = cfg.suffix
        suf.style.flexShrink = '0'
        el.appendChild(suf)
      }

      return cells
    }

    function fire(fontSize: number) {
      if (animatedRef.current) return
      animatedRef.current = true

      function easeOutCubic(t: number) { return 1 - Math.pow(1 - t, 3) }

      CONFIGS.forEach(cfg => {
        const el = document.getElementById(cfg.id) as any
        if (!el || !el._odoCells) return
        el._odoCells.forEach((item: { strip: HTMLElement; target: number; pos: number }) => {
          const delay = cfg.globalDelay + item.pos * 80
          const finalY = -(item.target * fontSize)
          if (item.target === 0) return

          setTimeout(() => {
            const start = Date.now()
            const duration = 1200
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
      })
    }

    function init() {
      let fontSize = 26
      const firstEl = document.getElementById(CONFIGS[0].id)
      if (firstEl) {
        fontSize = parseFloat(window.getComputedStyle(firstEl).fontSize)
      }

      CONFIGS.forEach(cfg => {
        const el = document.getElementById(cfg.id) as any
        if (!el) return
        el._odoCells = buildOdometer(el, cfg)
      })

      const card = sectionRef.current
      if (!card) return

      // Fire on scroll into view
      const io = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting) {
          io.disconnect()
          setTimeout(() => fire(fontSize), 200)
        }
      }, { threshold: 0.1 })
      io.observe(card)
    }

    init()
  }, [])

  return (
    <section
      ref={sectionRef}
      style={{
        width: '100%',
        background: '#0a0a0a',
        padding: '100px 48px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <div style={{ width: '100%', maxWidth: 960 }}>

        {/* Headline */}
        <h2 style={{
          fontFamily: 'var(--font-heading), Helvetica Neue, Arial, sans-serif',
          fontSize: 'clamp(52px, 7vw, 88px)',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '-0.03em',
          color: '#f0f0e8',
          lineHeight: 0.95,
          marginBottom: 16,
        }}>
          The Math.
        </h2>

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
        <div style={{
          background: '#111',
          border: '1px solid #2a2a2a',
          borderLeft: '3px solid #00ffd5',
          boxShadow: '3px 3px 0 #1a1a1a',
          marginBottom: 32,
        }}>

          {/* Card header */}
          <div style={{
            padding: '18px 24px 16px',
            borderBottom: '1px solid #1a1a1a',
            display: 'flex',
            flexDirection: 'column',
            gap: 5,
          }}>
            <div style={{ fontFamily: 'monospace', fontSize: 11, color: '#555', letterSpacing: '0.14em', textTransform: 'uppercase' }}>
              ROLE: <span style={{ color: '#888' }}>SOFTWARE ENGINEER · SENIOR</span>
            </div>
            <div style={{ fontFamily: 'monospace', fontSize: 11, color: '#555', letterSpacing: '0.14em', textTransform: 'uppercase' }}>
              COUNTRY: <span style={{ color: '#888' }}>🇦🇪 UNITED ARAB EMIRATES</span>
            </div>
          </div>

          {/* Card body — three columns */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
          }}>

            {/* Col 1 */}
            <div style={{ padding: '24px 24px 22px', borderRight: '1px solid #1a1a1a' }}>
              <span style={{ display: 'block', fontFamily: 'monospace', fontSize: 10, color: '#555', letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 10 }}>
                Gross Salary
              </span>
              <span
                id="odo-gross"
                style={{ display: 'block', fontFamily: 'monospace', fontSize: 'clamp(18px, 2.4vw, 26px)', color: '#f0f0e8', letterSpacing: '-0.02em', lineHeight: 1, marginBottom: 8 }}
              >
                AED&nbsp;350,000
              </span>
              <span style={{ fontFamily: 'monospace', fontSize: 11, color: '#555' }}>$95,200 / yr</span>
            </div>

            {/* Col 2 */}
            <div style={{ padding: '24px 24px 22px', borderRight: '1px solid #1a1a1a' }}>
              <span style={{ display: 'block', fontFamily: 'monospace', fontSize: 10, color: '#555', letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 10 }}>
                Net Take-Home
              </span>
              <span
                id="odo-net"
                style={{ display: 'block', fontFamily: 'monospace', fontSize: 'clamp(18px, 2.4vw, 26px)', color: '#00ffd5', letterSpacing: '-0.02em', lineHeight: 1, marginBottom: 8 }}
              >
                AED&nbsp;350,000
              </span>
              <span style={{ fontFamily: 'monospace', fontSize: 11, color: '#555' }}>Tax rate: 0%</span>
            </div>

            {/* Col 3 */}
            <div style={{ padding: '24px 24px 22px' }}>
              <span style={{ display: 'block', fontFamily: 'monospace', fontSize: 10, color: '#555', letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 10 }}>
                vs Germany · Same Role
              </span>
              <span
                id="odo-de"
                style={{ display: 'block', fontFamily: 'monospace', fontSize: 'clamp(18px, 2.4vw, 26px)', color: '#f0f0e8', letterSpacing: '-0.02em', lineHeight: 1, marginBottom: 8 }}
              >
                €58,400&nbsp;net
              </span>
              <span style={{ fontFamily: 'monospace', fontSize: 11, color: '#555' }}>
                <s style={{ textDecorationColor: '#444' }}>from €95,000 gross</s> · 39% lost
              </span>
            </div>

          </div>

          {/* Editorial line */}
          <div style={{
            padding: '14px 24px 16px',
            borderTop: '1px solid #1a1a1a',
            fontFamily: 'monospace',
            fontSize: 12,
            color: '#666',
            letterSpacing: '0.02em',
          }}>
            &ldquo;That&rsquo;s $36,800/yr you&rsquo;re not taking home <span style={{ color: '#888' }}>in Munich.</span>&rdquo;
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
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#00ffd5'; (e.currentTarget as HTMLElement).style.color = '#0a0a0a' }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#00ffd5' }}
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
