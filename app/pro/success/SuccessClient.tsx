'use client'
import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Nav from '@/components/Nav'
import { Sparkles, Loader2, ArrowRight } from 'lucide-react'
import Link from 'next/link'

const PRO_FEATURES = [
  {
    title: 'All 25 countries ranked',
    desc: 'Your full personalised ranking, not just the top 3.',
    href: '/wizard',
    cta: 'Run the quiz',
  },
  {
    title: 'Full personalised reports',
    desc: 'Salary, take-home, costs, visa path — specific to your role and passport.',
    href: '/wizard',
    cta: 'View report',
  },
  {
    title: 'Side-by-side comparison',
    desc: 'Compare any two countries head-to-head on every metric.',
    href: '/compare',
    cta: 'Compare now',
  },
  {
    title: 'Full country deep-dives',
    desc: 'Every salary role, every visa route, every cost breakdown.',
    href: '/',
    cta: 'Explore globe',
  },
  {
    title: 'Unlimited quiz runs',
    desc: 'Change your priorities, job, or budget and get fresh results every time.',
    href: '/wizard',
    cta: 'Start again',
  },
]

export default function SuccessClient() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const sessionId = searchParams.get('session_id')

  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying')
  const [errorMsg, setErrorMsg] = useState('')
  const [topMatch, setTopMatch] = useState<{ name: string; flagEmoji: string; matchPercent: number } | null>(null)

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
          // Pull wizard result for personalisation
          const { data: result } = await supabase
            .from('wizard_results')
            .select('top_countries')
            .eq('user_id', session.user.id)
            .maybeSingle()
          if (result?.top_countries?.[0]) setTopMatch(result.top_countries[0])
          setStatus('success')
          return
        }

        if (data.paid === false) {
          setStatus('error')
          setErrorMsg('Payment not completed. No charge was made.')
          return
        }

        // Fallback: check profile directly
        const { data: profile } = await supabase
          .from('profiles').select('is_pro').eq('id', session.user.id).single()
        if (profile?.is_pro) {
          router.refresh()
          const { data: result } = await supabase
            .from('wizard_results')
            .select('top_countries')
            .eq('user_id', session.user.id)
            .maybeSingle()
          if (result?.top_countries?.[0]) setTopMatch(result.top_countries[0])
          setStatus('success')
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
    <div className="min-h-screen bg-[#0a0a0a] text-[#f0f0e8]">
      <Nav countries={[]} onCountrySelect={() => {}} />

      <div className="max-w-2xl mx-auto px-6 pt-24 pb-24">

        {/* Verifying */}
        {status === 'verifying' && (
          <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
            <div className="w-12 h-12 border-2 border-[#2a2a2a] border-t-accent animate-spin" />
            <p className="text-[11px] font-bold text-[#888880] uppercase tracking-widest">Verifying payment...</p>
          </div>
        )}

        {/* Error */}
        {status === 'error' && (
          <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center">
            <p className="text-[10px] font-bold text-[#888880] uppercase tracking-widest">Something went wrong</p>
            <h1 className="font-heading text-3xl font-extrabold uppercase tracking-tight">Payment issue</h1>
            <p className="text-sm text-[#888880] max-w-sm leading-relaxed">{errorMsg}</p>
            <Link href="/pro"
              className="px-7 py-3 text-[11px] font-extrabold uppercase tracking-[0.15em] border border-[#2a2a2a] text-[#888880] hover:text-[#f0f0e8] hover:border-[#444] transition-colors">
              Back to Pro
            </Link>
          </div>
        )}

        {/* Success */}
        {status === 'success' && (
          <div>

            {/* Hero */}
            <section className="pb-14 border-b border-[#1a1a1a]">
              <p className="text-[10px] font-bold text-[#888880] uppercase tracking-[0.2em] mb-8">
                Payment confirmed
              </p>

              <h1 className="font-heading text-[64px] sm:text-[80px] leading-[0.88] font-extrabold uppercase tracking-[-0.02em] mb-6">
                Pro unlocked.
              </h1>

              <p className="text-[15px] text-[#888880] mb-10 max-w-md leading-relaxed">
                No renewal. No expiry. Everything is yours. Your Pro status is active — you can verify it anytime in your{' '}
                <Link href="/profile" className="text-accent hover:underline">profile</Link>.
              </p>

              {/* Personalised CTA if wizard was run */}
              {topMatch ? (
                <div className="mb-8 border-l-2 border-accent pl-5">
                  <p className="text-[10px] font-bold text-[#888880] uppercase tracking-widest mb-2">
                    Your top match was
                  </p>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-4xl">{topMatch.flagEmoji}</span>
                    <div>
                      <p className="font-heading text-2xl font-extrabold uppercase tracking-tight">{topMatch.name}</p>
                      <p className="text-[11px] font-bold text-accent">{topMatch.matchPercent}% match</p>
                    </div>
                  </div>
                  <Link
                    href="/wizard/results"
                    className="inline-block px-7 py-3.5 text-[11px] font-extrabold uppercase tracking-[0.15em] bg-accent text-[#0a0a0a]"
                    style={{ boxShadow: '3px 3px 0 #00aa90' }}
                  >
                    See all 25 countries ranked →
                  </Link>
                </div>
              ) : (
                <Link
                  href="/wizard"
                  className="inline-block px-7 py-3.5 text-[11px] font-extrabold uppercase tracking-[0.15em] bg-accent text-[#0a0a0a]"
                  style={{ boxShadow: '3px 3px 0 #00aa90' }}
                >
                  Find my country →
                </Link>
              )}
            </section>

            {/* What's unlocked */}
            <section className="py-14 border-b border-[#1a1a1a]">
              <p className="text-[10px] font-bold text-[#888880] uppercase tracking-[0.2em] mb-8">
                What you now have access to
              </p>

              <div>
                {PRO_FEATURES.map((f, i) => (
                  <div
                    key={f.title}
                    className={`flex items-start justify-between gap-6 py-5 ${i < PRO_FEATURES.length - 1 ? 'border-b border-[#111]' : ''}`}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-heading text-[14px] font-extrabold uppercase tracking-tight text-[#f0f0e8] mb-1">
                        {f.title}
                      </p>
                      <p className="text-[11px] text-[#555] leading-relaxed">{f.desc}</p>
                    </div>
                    <Link
                      href={f.href}
                      className="flex-shrink-0 flex items-center gap-1 text-[10px] font-bold text-[#888880] hover:text-accent transition-colors uppercase tracking-widest"
                    >
                      {f.cta} <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                ))}
              </div>
            </section>

            {/* Bottom */}
            <section className="pt-14">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="font-heading text-lg font-extrabold uppercase tracking-tight mb-1">
                    Ready to start?
                  </p>
                  <p className="text-[11px] text-[#888880]">
                    Run the quiz and see all 25 countries ranked for you.
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <Link href="/wizard"
                    className="px-7 py-3 text-[11px] font-extrabold uppercase tracking-[0.15em] bg-accent text-[#0a0a0a]"
                    style={{ boxShadow: '3px 3px 0 #00aa90' }}>
                    Find my country
                  </Link>
                  <Link href="/"
                    className="text-[11px] font-bold text-[#888880] hover:text-[#f0f0e8] transition-colors uppercase tracking-widest">
                    Explore globe →
                  </Link>
                </div>
              </div>
            </section>

          </div>
        )}
      </div>
    </div>
  )
}