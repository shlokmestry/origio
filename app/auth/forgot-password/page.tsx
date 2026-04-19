'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Globe2, Mail, CheckCircle, ArrowLeft } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset`,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setSent(true)
    }
  }

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">

        <div className="flex items-center justify-center gap-2 mb-8">
          <Globe2 className="w-7 h-7 text-accent" />
          <span className="font-heading text-2xl font-extrabold text-text-primary">Origio</span>
        </div>

        <div className="glass-panel rounded-2xl p-7 border border-border">
          {sent ? (
            <div className="text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center mx-auto">
                <CheckCircle className="w-7 h-7 text-accent" />
              </div>
              <h1 className="font-heading text-xl font-extrabold text-text-primary">Check your inbox</h1>
              <p className="text-sm text-text-muted leading-relaxed">
                We sent a password reset link to <span className="text-text-primary font-medium">{email}</span>. Check your spam folder if you don&apos;t see it.
              </p>
              <p className="text-xs text-text-muted">The link expires in 1 hour.</p>
              <Link href="/signin" className="block text-sm text-accent hover:underline mt-2">
                Back to sign in
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h1 className="font-heading text-xl font-extrabold text-text-primary mb-1">Reset your password</h1>
                <p className="text-sm text-text-muted">Enter your email and we&apos;ll send you a reset link.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                  <input
                    type="email"
                    placeholder="Your email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    autoFocus
                    className="w-full pl-10 pr-4 py-3 bg-bg-elevated border border-border rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:border-accent/40 focus:outline-none focus:ring-1 focus:ring-accent/20 transition-colors"
                  />
                </div>

                {error && (
                  <p className="text-xs text-score-low">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={loading || !email}
                  className="cta-button w-full py-3 rounded-xl text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {loading ? 'Sending...' : 'Send reset link'}
                </button>
              </form>

              <div className="mt-5 text-center">
                <Link href="/signin" className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-text-primary transition-colors">
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Back to sign in
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}