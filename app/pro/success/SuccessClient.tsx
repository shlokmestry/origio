'use client'
import { useState, useEffect, useRef } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Nav from '@/components/Nav'
import { Sparkles, CheckCircle, Loader2, Globe2, ArrowRight, Zap, Shield, BarChart3, Map } from 'lucide-react'
import Link from 'next/link'

// ─── Confetti ────────────────────────────────────────────────────────────────

function Confetti() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const colors = ['#00d4c8', '#4ade80', '#fbbf24', '#a78bfa', '#f472b6']
    const pieces = Array.from({ length: 120 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height - canvas.height,
      r: Math.random() * 6 + 4,
      d: Math.random() * 80 + 10,
      color: colors[Math.floor(Math.random() * colors.length)],
      tilt: Math.floor(Math.random() * 10) - 10,
      tiltAngle: 0,
      tiltAngleInc: Math.random() * 0.07 + 0.05,
    }))

    let angle = 0
    let frame: number

    function draw() {
      if (!ctx || !canvas) return
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      angle += 0.01
      pieces.forEach((p, i) => {
        p.tiltAngle += p.tiltAngleInc
        p.y += (Math.cos(angle + p.d) + 2) * 1.5
        p.x += Math.sin(angle) * 1.5
        p.tilt = Math.sin(p.tiltAngle) * 12
        ctx.beginPath()
        ctx.lineWidth = p.r
        ctx.strokeStyle = p.color
        ctx.moveTo(p.x + p.tilt + p.r / 4, p.y)
        ctx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r / 4)
        ctx.stroke()
        if (p.y > canvas.height) {
          pieces[i] = { ...p, x: Math.random() * canvas.width, y: -10 }
        }
      })
      frame = requestAnimationFrame(draw)
    }

    draw()
    const stop = setTimeout(() => cancelAnimationFrame(frame), 5000)
    return () => { cancelAnimationFrame(frame); clearTimeout(stop) }
  }, [])

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-50" style={{ opacity: 0.85 }} />
}

// ─── Pro features list ────────────────────────────────────────────────────────

const PRO_FEATURES = [
  {
    icon: Zap,
    title: 'Unlimited Wizard Runs',
    desc: 'Run the country-matching wizard as many times as you want. Change priorities, job, budget — fresh results every time.',
    cta: 'Run the Wizard',
    href: '/wizard',
  },
  {
    icon: BarChart3,
    title: 'All 25 Countries Ranked',
    desc: 'See your full personalised ranking across all 25 countries — not just the top 10.',
    cta: 'Run the Wizard',
    href: '/wizard',
  },
  {
    icon: Globe2,
    title: 'Full Country Deep-Dives',
    desc: 'Detailed salary data, cost breakdowns, visa routes, healthcare and quality of life scores for every country.',
    cta: 'Explore Countries',
    href: '/',
  },
  {
    icon: Map,
    title: 'Side-by-Side Comparison',
    desc: 'Compare any two countries head-to-head on salary, cost of living, safety, taxes, and more.',
    cta: 'Compare Now',
    href: '/compare',
  },
  {
    icon: Shield,
    title: 'Visa Route Details',
    desc: 'Step-by-step visa pathways, difficulty ratings, and official government links for every country.',
    cta: 'Explore Countries',
    href: '/',
  },
]

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function SuccessClient() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const sessionId = searchParams.get('session_id')

  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying')
  const [errorMsg, setErrorMsg] = useState('')
  const [showConfetti, setShowConfetti] = useState(false)

  useEffect(() => {
    if (!sessionId) { router.replace('/pro'); return }

    let cancelled = false

    async function verify() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { setStatus('error'); setErrorMsg('You need to be signed in.'); return }
      if (cancelled) return

      try {
        const res = await fetch('/api/verify-payment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ sessionId }),
        })
        if (cancelled) return
        const data = await res.json()

        if (!res.ok) throw new Error(data.error ?? 'Verification failed')

        if (data.paid && data.pro) {
          router.refresh()
          setStatus('success')
          setShowConfetti(true)
          return
        }

        if (data.paid === false) {
          setStatus('error')
          setErrorMsg('Payment not completed. No charge was made.')
          return
        }

        // Fallback: webhook may have already fired
        const { data: profile } = await supabase
          .from('profiles').select('is_pro').eq('id', session.user.id).single()

        if (profile?.is_pro) {
          router.refresh()
          setStatus('success')
          setShowConfetti(true)
        } else {
          setStatus('error')
          setErrorMsg("Something went wrong. If you were charged, contact us and we'll sort it out.")
        }
      } catch (err) {
        if (cancelled) return
        console.error('Verification error:', err)
        setStatus('error')
        setErrorMsg("Couldn't verify your payment. If you were charged, contact us and we'll sort it out.")
      }
    }

    verify()
    return () => { cancelled = true }
  }, [sessionId, router])

  return (
    <div className="min-h-screen bg-bg-primary">
      {showConfetti && <Confetti />}
      <Nav countries={[]} onCountrySelect={() => {}} />

      <div className="max-w-3xl mx-auto px-6 pt-28 pb-20">

        {/* Verifying */}
        {status === 'verifying' && (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-accent animate-spin" />
            </div>
            <h1 className="font-heading text-2xl font-bold text-text-primary">Verifying your payment…</h1>
            <p className="text-text-muted text-sm">This should only take a moment.</p>
          </div>
        )}

        {/* Error */}
        {status === 'error' && (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-score-low/10 border border-score-low/20 flex items-center justify-center">
              <span className="text-2xl">⚠️</span>
            </div>
            <h1 className="font-heading text-2xl font-bold text-text-primary">Something went wrong</h1>
            <p className="text-text-muted text-sm max-w-sm">{errorMsg}</p>
            <Link href="/pro" className="cta-button px-6 py-3 rounded-xl text-sm inline-flex items-center gap-2">
              Back to Pro
            </Link>
          </div>
        )}

        {/* Success */}
        {status === 'success' && (
          <div className="space-y-14">

            {/* Hero */}
            <div className="text-center space-y-5">
              <div className="relative inline-flex">
                <div className="w-20 h-20 rounded-full bg-accent/10 border border-accent/30 flex items-center justify-center">
                  <CheckCircle className="w-10 h-10 text-accent" />
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-accent flex items-center justify-center">
                  <Sparkles className="w-3.5 h-3.5 text-bg-primary" />
                </div>
              </div>

              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-accent/20 bg-accent/5 text-accent text-xs font-semibold uppercase tracking-widest">
                <Sparkles className="w-3 h-3" />
                Welcome to Pro
              </div>

              <h1 className="font-heading text-4xl sm:text-5xl font-extrabold text-text-primary">
                You're all set! 🎉
              </h1>
              <p className="text-text-muted text-base max-w-md mx-auto">
                Your account is now upgraded. All Pro features are unlocked — forever. No renewal, no expiry.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                <Link href="/wizard" className="cta-button px-6 py-3 rounded-xl text-sm flex items-center justify-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Run the Wizard
                </Link>
                <Link href="/" className="px-6 py-3 rounded-xl text-sm border border-border text-text-muted hover:text-text-primary transition-colors flex items-center justify-center gap-2">
                  <Globe2 className="w-4 h-4" />
                  Explore the Globe
                </Link>
                <Link href="/compare" className="px-6 py-3 rounded-xl text-sm border border-border text-text-muted hover:text-text-primary transition-colors flex items-center justify-center gap-2">
                  Compare Countries
                </Link>
              </div>
            </div>

            {/* What's unlocked */}
            <div>
              <p className="text-xs text-text-muted uppercase tracking-widest font-semibold text-center mb-6">
                Everything you now have access to
              </p>
              <div className="grid gap-3">
                {PRO_FEATURES.map((f, i) => {
                  const Icon = f.icon
                  return (
                    <div
                      key={f.title}
                      className="glass-panel rounded-2xl p-5 border border-border hover:border-accent/20 transition-all group"
                      style={{ animationDelay: `${i * 0.1}s` }}
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center flex-shrink-0">
                          <Icon className="w-5 h-5 text-accent" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-4 mb-1">
                            <p className="font-heading font-bold text-text-primary text-sm">{f.title}</p>
                            <Link href={f.href} className="flex items-center gap-1 text-xs text-accent hover:underline flex-shrink-0">
                              {f.cta} <ArrowRight className="w-3 h-3" />
                            </Link>
                          </div>
                          <p className="text-xs text-text-muted leading-relaxed">{f.desc}</p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Bottom CTA */}
            <div className="glass-panel rounded-2xl p-8 border border-accent/20 text-center space-y-4">
              <div className="text-3xl">🌍</div>
              <h3 className="font-heading text-xl font-bold text-text-primary">Ready to find your country?</h3>
              <p className="text-text-muted text-sm max-w-sm mx-auto">
                Answer 8 quick questions and get your personalised ranking of all 25 countries — now with your full Pro results.
              </p>
              <Link href="/wizard" className="cta-button px-8 py-3 rounded-xl text-sm inline-flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Find My Country
              </Link>
            </div>

          </div>
        )}
      </div>
    </div>
  )
}