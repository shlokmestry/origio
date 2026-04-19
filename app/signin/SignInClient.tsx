'use client'
import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Globe2, Mail, Lock, Eye, EyeOff } from 'lucide-react'

export default function SignInClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const next = searchParams.get('next') ?? '/profile'

  const [tab, setTab] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) router.push(next)
    })
  }, [next, router])

  const passwordTooShort = tab === 'signup' && password.length > 0 && password.length < 8
  const passwordTooLong = tab === 'signup' && password.length > 16
  const passwordInvalid = passwordTooShort || passwordTooLong
  const submitDisabled = loading || (tab === 'signup' && passwordInvalid)

  const passwordHint = () => {
    if (passwordTooLong) return `Too long — max 16 characters (${password.length}/16)`
    if (passwordTooShort) return `Too short — min 8 characters (${password.length}/8)`
    if (tab === 'signup' && password.length > 0) return `${password.length}/16`
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (submitDisabled) return
    setLoading(true)
    setError('')
    setSuccess('')

    if (tab === 'signin') {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        const msg = error.message.toLowerCase()
        if (msg.includes('email not confirmed')) {
          setError('Please confirm your email before signing in. Check your inbox.')
        } else {
          setError('Invalid email or password.')
        }
      } else {
        router.push(next)
      }
    } else {
      const { data, error } = await supabase.auth.signUp({ email, password })
      if (error) {
        const msg = error.message.toLowerCase()
        if (
          msg.includes('already registered') ||
          msg.includes('already exists') ||
          msg.includes('user already') ||
          msg.includes('email already')
        ) {
          setError('An account with this email already exists.')
          setTab('signin')
        } else {
          setError(error.message)
        }
      } else if (data.user && data.user.identities?.length === 0) {
        setError('An account with this email already exists.')
        setTab('signin')
      } else {
        setSuccess('Account created! Check your email to confirm before signing in.')
      }
    }

    setLoading(false)
  }

  const handleGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    })
  }

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">

        <div className="flex items-center justify-center gap-2 mb-8">
          <Globe2 className="w-7 h-7 text-accent" />
          <span className="font-heading text-2xl font-extrabold text-text-primary">Origio</span>
        </div>

        <div className="flex rounded-xl bg-bg-elevated border border-border p-1 mb-6">
          <button
            onClick={() => { setTab('signin'); setError(''); setSuccess('') }}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${tab === 'signin' ? 'bg-bg-surface text-text-primary shadow-sm' : 'text-text-muted hover:text-text-primary'}`}>
            Sign In
          </button>
          <button
            onClick={() => { setTab('signup'); setError(''); setSuccess('') }}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${tab === 'signup' ? 'bg-bg-surface text-text-primary shadow-sm' : 'text-text-muted hover:text-text-primary'}`}>
            Create Account
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 mb-4">
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input type="email" placeholder="Email" value={email}
              onChange={e => setEmail(e.target.value)} required
              className="w-full pl-10 pr-4 py-3 bg-bg-elevated border border-border rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:border-accent/40 focus:outline-none focus:ring-1 focus:ring-accent/20 transition-colors" />
          </div>

          <div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                maxLength={tab === 'signup' ? 16 : undefined}
                className={`w-full pl-10 pr-10 py-3 bg-bg-elevated border rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 transition-colors ${
                  passwordInvalid
                    ? 'border-score-low/50 focus:border-score-low/50 focus:ring-score-low/20'
                    : 'border-border focus:border-accent/40 focus:ring-accent/20'
                }`}
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary">
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {tab === 'signup' && passwordHint() && (
              <p className={`text-xs mt-1.5 ${passwordInvalid ? 'text-score-low' : 'text-text-muted'}`}>
                {passwordHint()}
              </p>
            )}
            {tab === 'signup' && password.length === 0 && (
              <p className="text-xs mt-1.5 text-text-muted">8–16 characters</p>
            )}
            {/* Forgot password — only show on sign in tab */}
            {tab === 'signin' && (
              <div className="flex justify-end mt-1.5">
                <Link href="/auth/forgot-password" className="text-xs text-text-muted hover:text-accent transition-colors">
                  Forgot password?
                </Link>
              </div>
            )}
          </div>

          {error && <p className="text-xs text-score-low">{error}</p>}
          {success && <p className="text-xs text-score-high">{success}</p>}

          <button type="submit" disabled={submitDisabled}
            className="cta-button w-full py-3 rounded-xl text-sm disabled:opacity-40 disabled:cursor-not-allowed">
            {loading ? 'Please wait...' : tab === 'signin' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        {/* Google OAuth */}
        <div className="relative mb-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs text-text-muted">
            <span className="bg-bg-primary px-3">or</span>
          </div>
        </div>

        <button onClick={handleGoogle}
          className="w-full flex items-center justify-center gap-3 py-3 rounded-xl border border-border hover:border-border-hover transition-colors text-sm text-text-muted hover:text-text-primary">
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </button>

        <p className="text-center text-xs text-text-muted mt-6">
          By continuing you agree to our{' '}
          <Link href="/terms" className="hover:text-accent transition-colors">Terms</Link>
          {' '}and{' '}
          <Link href="/privacy" className="hover:text-accent transition-colors">Privacy Policy</Link>
        </p>
      </div>
    </div>
  )
}