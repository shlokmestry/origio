'use client'
import { useEffect } from 'react'

export default function GlobalError({
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
    <html>
      <body style={{ margin: 0, background: '#0a0a0a', color: '#f0f0e8', fontFamily: 'sans-serif' }}>
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          gap: 24,
        }}>
          <p style={{ fontSize: 'clamp(80px, 16vw, 160px)', fontWeight: 800, letterSpacing: '-0.04em', margin: 0, lineHeight: 1 }}>
            500
          </p>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.38)', letterSpacing: '0.12em', textTransform: 'uppercase', margin: 0 }}>
            Something went wrong
          </p>
          <button
            onClick={reset}
            style={{
              marginTop: 8,
              padding: '12px 24px',
              background: '#00ffd5',
              color: '#0a0a0a',
              border: 'none',
              fontWeight: 700,
              fontSize: 12,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              cursor: 'pointer',
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  )
}
