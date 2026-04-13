'use client'
import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Nav from '@/components/Nav'
import { Sparkles, CheckCircle, Loader2 } from 'lucide-react'
import Link from 'next/link'

export default function SuccessClient() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const sessionId = searchParams.get('session_id')

  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying')
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    if (!sessionId) {
      router.replace('/pro')
      return
    }

    let cancelled = false

    async function verify() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        setStatus('error')
        setErrorMsg('You need to be signed in.')
        return
      }

      if (cancelled) return

      try {
        // Call verify-payment API — checks Stripe directly and grants pro.
        // This works even when the webhook is misconfigured.
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

        if (!res.ok) {
          throw new Error(data.error ?? 'Verification failed')
        }

        if (data.paid && data.pro) {
          router.refresh()
          setStatus('success')
          return
        }

        if (data.paid === false) {
          setStatus('error')
          setErrorMsg('Payment not completed. No charge was made.')
          return
        }

        // Fallback: webhook may have already fired
        const { data: profile } = await supabase
          .from('profiles')
          .select('is_pro')
          .eq('id', session.user.id)
          .single()

        if (profile?.is_pro) {
          router.refresh()
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
    <div className="min-h-screen bg-bg-primary">
      <Nav countries={[]} onCountrySelect={() => {}} />

      <div className="max-w-lg mx-auto px-6 pt-32 pb-16 text-center">
        {status === 'verifying' && (
          <div className="space-y-6">
            <div className="w-16 h-16 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center mx-auto">
              <Loader2 className="w-8 h-8 text-accent animate-spin" />
            </div>
            <h1 className="font-heading text-2xl font-bold text-text-primary">
              Verifying your payment…
            </h1>
            <p className="text-text-muted text-sm">This should only take a moment.</p>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-6">
            <div className="w-16 h-16 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8 text-accent" />
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-accent/20 bg-accent/5 text-accent text-xs font-semibold uppercase tracking-widest">
              <Sparkles className="w-3 h-3" />
              Welcome to Pro
            </div>
            <h1 className="font-heading text-3xl sm:text-4xl font-extrabold text-text-primary">
              You&apos;re all set! 🎉
            </h1>
            <p className="text-text-muted text-base max-w-sm mx-auto">
              Your account has been upgraded. All Pro features are now unlocked — forever.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
              <Link href="/wizard" className="cta-button px-6 py-3 rounded-xl text-sm flex items-center justify-center gap-2">
                <Sparkles className="w-4 h-4" />
                Run the Wizard
              </Link>
              <Link href="/" className="px-6 py-3 rounded-xl text-sm border border-border text-text-muted hover:text-text-primary transition-colors text-center">
                Explore countries
              </Link>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-6">
            <div className="w-16 h-16 rounded-full bg-score-low/10 border border-score-low/20 flex items-center justify-center mx-auto">
              <span className="text-2xl">⚠️</span>
            </div>
            <h1 className="font-heading text-2xl font-bold text-text-primary">Something went wrong</h1>
            <p className="text-text-muted text-sm max-w-sm mx-auto">{errorMsg}</p>
            <Link href="/pro" className="cta-button px-6 py-3 rounded-xl text-sm inline-flex items-center gap-2">
              Back to Pro
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}