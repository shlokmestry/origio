'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Globe2, Sparkles, Check } from 'lucide-react'

const PRO_FEATURES = [
  'Unlimited wizard runs',
  'Full country deep-dives',
  'Side-by-side country comparison',
  'Saved wizard results',
  'Salary breakdown by role',
]

export default function ProSuccessPage() {
  const router = useRouter()
  const [countdown, setCountdown] = useState(5)

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          router.push('/profile')
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [router])

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md text-center">

        {/* Icon */}
        <div className="w-20 h-20 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center mx-auto mb-6">
          <Sparkles className="w-10 h-10 text-accent" />
        </div>

        {/* Heading */}
        <h1 className="font-heading text-3xl font-extrabold text-text-primary mb-3">
          Welcome to Origio Pro!
        </h1>
        <p className="text-text-muted mb-8">
          Your account has been upgraded. You now have access to everything.
        </p>

        {/* Features */}
        <div className="glass-panel rounded-2xl p-6 mb-8 text-left">
          <p className="text-xs font-semibold uppercase tracking-widest text-accent mb-4">
            What you unlocked
          </p>
          <div className="space-y-3">
            {PRO_FEATURES.map(f => (
              <div key={f} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                  <Check className="w-3 h-3 text-accent" />
                </div>
                <span className="text-sm text-text-primary">{f}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Redirect */}
        <p className="text-sm text-text-muted mb-4">
          Redirecting to your profile in {countdown}s...
        </p>
        <button
          onClick={() => router.push('/profile')}
          className="cta-button px-8 py-3 rounded-xl text-sm flex items-center gap-2 mx-auto"
        >
          <Globe2 className="w-4 h-4" />
          Go to profile
        </button>

      </div>
    </div>
  )
}