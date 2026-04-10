'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'
import { Globe2, LogOut, Trash2, Mail, Lock, Eye, EyeOff, Sparkles } from 'lucide-react'

type SavedCountry = {
  id: string
  country_slug: string
  created_at: string
}

type WizardResult = {
  top_countries: {
    slug: string
    name: string
    flagEmoji: string
    matchPercent: number
  }[]
  answers: { role: string }
  created_at: string
}

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [savedCountries, setSavedCountries] = useState<SavedCountry[]>([])
  const [savesLoading, setSavesLoading] = useState(false)
  const [wizardResult, setWizardResult] = useState<WizardResult | null>(null)

  // Auth form state
  const [tab, setTab] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [authLoading, setAuthLoading] = useState(false)
  const [authError, setAuthError] = useState('')
  const [authSuccess, setAuthSuccess] = useState('')

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      setUser(data.user)
      if (data.user) {
        setSavesLoading(true)
        const [savesRes, wizardRes] = await Promise.all([
          supabase
            .from('saved_countries')
            .select('id, country_slug, created_at')
            .eq('user_id', data.user.id)
            .order('created_at', { ascending: false }),
          supabase
            .from('wizard_results')
            .select('top_countries, answers, created_at')
            .eq('user_id', data.user.id)
            .single()
        ])
        setSavedCountries(savesRes.data ?? [])
        setWizardResult(wizardRes.data ?? null)
        setSavesLoading(false)
      }
      setLoading(false)
    })
  }, [])

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthLoading(true)
    setAuthError('')
    setAuthSuccess('')
    if (tab === 'signup') {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) setAuthError(error.message)
      else setAuthSuccess('Check your email to confirm your account!')
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setAuthError(error.message)
      else window.location.reload()
    }
    setAuthLoading(false)
  }

  const handleGoogleSignIn = async () => {
    const next = new URLSearchParams(window.location.search).get('next') ?? '/profile'
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    })
  }

  const removeSave = async (id: string) => {
    await supabase.from('saved_countries').delete().eq('id', id)
    setSavedCountries((prev) => prev.filter((s) => s.id !== id))
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  const formatSlug = (slug: string) =>
    slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-text-muted">Loading...</p>
    </div>
  )

  if (!user) return (
    <div className="min-h-screen bg-bg-primary flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-center gap-2 mb-8">
          <Globe2 className="w-7 h-7 text-accent" />
          <span className="font-heading text-2xl font-extrabold">Origio</span>
        </div>
        <div className="flex rounded-xl bg-bg-elevated border border-border p-1 mb-6">
          <button
            onClick={() => { setTab('signin'); setAuthError(''); setAuthSuccess('') }}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${tab === 'signin' ? 'bg-bg-surface text-text-primary shadow-sm' : 'text-text-muted hover:text-text-primary'}`}
          >Sign In</button>
          <button
            onClick={() => { setTab('signup'); setAuthError(''); setAuthSuccess('') }}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${tab === 'signup' ? 'bg-bg-surface text-text-primary shadow-sm' : 'text-text-muted hover:text-text-primary'}`}
          >Create Account</button>
        </div>
        <form onSubmit={handleEmailAuth} className="space-y-3 mb-4">
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required
              className="w-full pl-10 pr-4 py-3 bg-bg-elevated border border-border rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:border-accent/40 focus:outline-none focus:ring-1 focus:ring-accent/20 transition-colors" />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input type={showPassword ? 'text' : 'password'} placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required
              className="w-full pl-10 pr-10 py-3 bg-bg-elevated border border-border rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:border-accent/40 focus:outline-none focus:ring-1 focus:ring-accent/20 transition-colors" />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary">
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {authError && <p className="text-xs text-score-low">{authError}</p>}
          {authSuccess && <p className="text-xs text-score-high">{authSuccess}</p>}
          <button type="submit" disabled={authLoading} className="cta-button w-full py-3 rounded-xl text-sm disabled:opacity-50">
            {authLoading ? 'Please wait...' : tab === 'signin' ? 'Sign In' : 'Create Account'}
          </button>
        </form>
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs text-text-muted">or</span>
          <div className="flex-1 h-px bg-border" />
        </div>
        <button onClick={handleGoogleSignIn}
          className="w-full flex items-center justify-center gap-3 py-3 rounded-xl border border-border hover:border-border-hover bg-bg-elevated hover:bg-bg-surface transition-all text-sm text-text-primary font-medium">
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-bg-primary">
      <nav className="sticky top-0 z-50 glass-panel">
        <div className="max-w-2xl mx-auto px-6 h-16 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Globe2 className="w-5 h-5 text-accent" />
            <span className="font-heading text-lg font-extrabold">Origio</span>
          </a>
          <button onClick={signOut} className="flex items-center gap-1.5 text-sm text-text-muted hover:text-text-primary transition-colors">
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-12">

        {/* Avatar + Name */}
        <div className="flex items-center gap-4 mb-10">
          {user.user_metadata?.avatar_url ? (
            <img src={user.user_metadata.avatar_url} alt="avatar" className="w-16 h-16 rounded-full border border-border" />
          ) : (
            <div className="w-16 h-16 rounded-full bg-bg-elevated border border-border flex items-center justify-center text-2xl font-bold text-accent">
              {(user.user_metadata?.full_name ?? user.email ?? 'U')[0].toUpperCase()}
            </div>
          )}
          <div>
            <h1 className="font-heading text-2xl font-extrabold text-text-primary">
              {user.user_metadata?.full_name ?? 'Explorer'}
            </h1>
            <p className="text-text-muted text-sm">{user.email}</p>
          </div>
        </div>

        {/* Saved Countries */}
        <div className="glass-panel rounded-2xl p-6 mb-6">
          <h2 className="font-heading text-lg font-bold mb-4 text-text-primary">
            Saved Countries
            {savedCountries.length > 0 && (
              <span className="ml-2 text-xs text-accent bg-accent/10 px-2 py-0.5 rounded-full">{savedCountries.length}</span>
            )}
          </h2>
          {savesLoading ? (
            <p className="text-text-muted text-sm">Loading...</p>
          ) : savedCountries.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-text-muted text-sm mb-3">No saved countries yet</p>
              <a href="/" className="text-sm text-accent hover:underline">Start exploring →</a>
            </div>
          ) : (
            <div className="space-y-2">
              {savedCountries.map((save) => (
                <div key={save.id} className="flex items-center justify-between p-3 rounded-xl bg-bg-elevated border border-border hover:border-accent/20 transition-colors">
                  <a href={`/country/${save.country_slug}`} className="text-sm font-medium text-text-primary hover:text-accent transition-colors">
                    {formatSlug(save.country_slug)}
                  </a>
                  <button onClick={() => removeSave(save.id)} className="p-1.5 rounded-lg text-text-muted hover:text-score-low hover:bg-rose-500/10 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ✅ Wizard Result — now wired in */}
        <div className="glass-panel rounded-2xl p-6 mb-10">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-4 h-4 text-accent" />
            <h2 className="font-heading text-lg font-bold text-text-primary">Last Wizard Result</h2>
          </div>
          {!wizardResult ? (
            <div className="text-center py-6">
              <p className="text-text-muted text-sm mb-3">No wizard results yet</p>
              <a href="/" className="text-sm text-accent hover:underline">Take the quiz →</a>
            </div>
          ) : (
            <div className="space-y-2">
              {wizardResult.top_countries.map((c, i) => {
                const colors = ["#fbbf24", "#00d4c8", "#a78bfa"]
                const labels = ["Best Match", "2nd Match", "3rd Match"]
                const color = colors[i]
                return (
                  <a
                    key={c.slug}
                    href={`/country/${c.slug}`}
                    className="flex items-center justify-between p-3 rounded-xl bg-bg-elevated border border-border hover:border-accent/20 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ color, background: color + '20' }}>
                        {labels[i]}
                      </span>
                      <span className="text-lg">{c.flagEmoji}</span>
                      <span className="text-sm font-medium text-text-primary">{c.name}</span>
                    </div>
                    <span className="text-sm font-bold" style={{ color }}>{c.matchPercent}%</span>
                  </a>
                )
              })}
              <p className="text-xs text-text-muted pt-1">
                Role: {wizardResult.answers?.role} · {new Date(wizardResult.created_at).toLocaleDateString()}
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}