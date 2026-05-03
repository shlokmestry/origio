'use client'
import { useEffect } from 'react'
import { Globe2 } from 'lucide-react'

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
    <div className="min-h-screen bg-bg-primary flex flex-col items-center justify-center px-6 text-center">
      <div className="space-y-6 max-w-md">
        <div className="text-7xl">🌍</div>
        <div className="space-y-2">
          <h1 className="font-heading text-5xl font-extrabold text-text-primary">500</h1>
          <p className="font-heading text-xl font-bold text-text-primary">Something went wrong</p>
          <p className="text-text-muted text-sm leading-relaxed">
            We hit an unexpected error. It has been logged and we will look into it.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={reset}
            className="cta-button px-6 py-3 rounded-2xl text-sm font-medium inline-flex items-center gap-2"
          >
            Try again
          </button>
          <a
            href="/"
            className="px-6 py-3 rounded-2xl text-sm border border-border hover:border-accent/30 text-text-muted hover:text-text-primary transition-colors inline-flex items-center gap-2"
          >
            <Globe2 className="w-4 h-4" />
            Back to Globe
          </a>
        </div>
      </div>
    </div>
  )
}