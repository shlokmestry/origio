'use client'
import { useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'

function FuzzyOverlay() {
  return (
    <motion.div
      initial={{ transform: 'translateX(-10%) translateY(-10%)' }}
      animate={{ transform: 'translateX(10%) translateY(10%)' }}
      transition={{ repeat: Infinity, duration: 0.2, ease: 'linear', repeatType: 'mirror' }}
      style={{ backgroundImage: 'url("/black-noise.png")' }}
      className="pointer-events-none absolute -inset-[100%] opacity-[15%]"
    />
  )
}

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="relative overflow-hidden">
      <div style={{
        minHeight: '100vh',
        background: '#0a0a0a',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
      }}>
        <FuzzyOverlay />

        {/* Centre content */}
        <div style={{ position: 'relative', zIndex: 10, textAlign: 'center' }}>
          <p style={{
            fontFamily: "'Cabinet Grotesk', sans-serif",
            fontWeight: 800,
            fontSize: 'clamp(120px, 22vw, 240px)',
            color: '#fff',
            lineHeight: 1,
            letterSpacing: '-0.04em',
            margin: 0,
          }}>
            500
          </p>
          <p style={{
            fontFamily: "'Satoshi', sans-serif",
            fontSize: 'clamp(13px, 1.5vw, 16px)',
            color: 'rgba(255,255,255,0.38)',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            marginTop: 12,
          }}>
            Page not found
          </p>
        </div>

        {/* Bottom-right link */}
        <Link href="/" style={{
          position: 'fixed',
          bottom: 28,
          right: 32,
          zIndex: 20,
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          fontFamily: "'Satoshi', sans-serif",
          fontSize: 12,
          color: 'rgba(255,255,255,0.35)',
          textDecoration: 'none',
          letterSpacing: '0.04em',
          transition: 'color 0.15s ease',
        }}
          onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
          onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.35)')}
        >
          wanna go back to homepage? →
        </Link>
      </div>
    </div>
  )
}
