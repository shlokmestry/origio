'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Nav from '@/components/Nav'
import type { User } from '@supabase/supabase-js'
import {
  Globe2, LogOut, Trash2, Mail, Lock, Eye, EyeOff,
  Sparkles, Pencil, Check, X, AlertTriangle, Briefcase
} from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

type CountryInfo = { flag_emoji: string; name: string }
type SavedCountry = {
  id: string
  country_slug: string
  created_at: string
  countries?: CountryInfo | CountryInfo[] | null
}
type WizardResult = {
  top_countries: { slug: string; name: string; flagEmoji: string; matchPercent: number }[]
  answers: { role: string }
  created_at: string
}
type Profile = {
  passport_slug: string | null
  job_title: string | null
  onboarded: boolean
}

// ─── Passport data ────────────────────────────────────────────────────────────

const PASSPORT_FLAGS: Record<string, { flag: string; name: string; bgColor: string; accentColor: string; emblem: string; coverText: string; pattern: string }> = {
  'united-states': { flag: '🇺🇸', name: 'United States', bgColor: '#1a3055', accentColor: '#c8a84b', emblem: '🦅', coverText: 'PASSPORT', pattern: 'lines' },
  'united-kingdom': { flag: '🇬🇧', name: 'United Kingdom', bgColor: '#012169', accentColor: '#c8a84b', emblem: '👑', coverText: 'PASSPORT', pattern: 'lines' },
  'canada': { flag: '🇨🇦', name: 'Canada', bgColor: '#cc0001', accentColor: '#ffffff', emblem: '🍁', coverText: 'PASSPORT', pattern: 'lines' },
  'australia': { flag: '🇦🇺', name: 'Australia', bgColor: '#00205b', accentColor: '#c8a84b', emblem: '🦘', coverText: 'PASSPORT', pattern: 'dots' },
  'germany': { flag: '🇩🇪', name: 'Germany', bgColor: '#2a2a2a', accentColor: '#c8a84b', emblem: '🦅', coverText: 'REISEPASS', pattern: 'lines' },
  'france': { flag: '🇫🇷', name: 'France', bgColor: '#002395', accentColor: '#c8a84b', emblem: '⚜️', coverText: 'PASSEPORT', pattern: 'waves' },
  'netherlands': { flag: '🇳🇱', name: 'Netherlands', bgColor: '#ae1c28', accentColor: '#c8a84b', emblem: '👑', coverText: 'PASPOORT', pattern: 'lines' },
  'sweden': { flag: '🇸🇪', name: 'Sweden', bgColor: '#006aa7', accentColor: '#fecc02', emblem: '⚜️', coverText: 'PASS', pattern: 'grid' },
  'norway': { flag: '🇳🇴', name: 'Norway', bgColor: '#ef2b2d', accentColor: '#ffffff', emblem: '🦁', coverText: 'PASS', pattern: 'lines' },
  'denmark': { flag: '🇩🇰', name: 'Denmark', bgColor: '#c60c30', accentColor: '#ffffff', emblem: '👑', coverText: 'PAS', pattern: 'lines' },
  'finland': { flag: '🇫🇮', name: 'Finland', bgColor: '#003580', accentColor: '#ffffff', emblem: '🦁', coverText: 'PASSI', pattern: 'lines' },
  'switzerland': { flag: '🇨🇭', name: 'Switzerland', bgColor: '#d52b1e', accentColor: '#ffffff', emblem: '✚', coverText: 'PASSEPORT', pattern: 'dots' },
  'singapore': { flag: '🇸🇬', name: 'Singapore', bgColor: '#c8102e', accentColor: '#ffffff', emblem: '🦁', coverText: 'PASSPORT', pattern: 'lines' },
  'japan': { flag: '🇯🇵', name: 'Japan', bgColor: '#1a3a6b', accentColor: '#c8a84b', emblem: '🌸', coverText: 'パスポート', pattern: 'waves' },
  'south-korea': { flag: '🇰🇷', name: 'South Korea', bgColor: '#003478', accentColor: '#c8a84b', emblem: '☯️', coverText: '여권', pattern: 'lines' },
  'new-zealand': { flag: '🇳🇿', name: 'New Zealand', bgColor: '#00205b', accentColor: '#c8a84b', emblem: '🌿', coverText: 'PASSPORT', pattern: 'dots' },
  'ireland': { flag: '🇮🇪', name: 'Ireland', bgColor: '#169b62', accentColor: '#c8a84b', emblem: '🍀', coverText: 'PASSPORT', pattern: 'lines' },
  'portugal': { flag: '🇵🇹', name: 'Portugal', bgColor: '#006600', accentColor: '#c8a84b', emblem: '⚔️', coverText: 'PASSAPORTE', pattern: 'lines' },
  'spain': { flag: '🇪🇸', name: 'Spain', bgColor: '#aa151b', accentColor: '#c8a84b', emblem: '👑', coverText: 'PASAPORTE', pattern: 'lines' },
  'italy': { flag: '🇮🇹', name: 'Italy', bgColor: '#009246', accentColor: '#c8a84b', emblem: '⭐', coverText: 'PASSAPORTO', pattern: 'lines' },
  'austria': { flag: '🇦🇹', name: 'Austria', bgColor: '#ed2939', accentColor: '#c8a84b', emblem: '🦅', coverText: 'REISEPASS', pattern: 'lines' },
  'india': { flag: '🇮🇳', name: 'India', bgColor: '#046A38', accentColor: '#FF9933', emblem: '⚖️', coverText: 'PASSPORT', pattern: 'lines' },
  'brazil': { flag: '🇧🇷', name: 'Brazil', bgColor: '#009C3B', accentColor: '#FEDD00', emblem: '⭐', coverText: 'PASSAPORTE', pattern: 'dots' },
  'uae': { flag: '🇦🇪', name: 'UAE', bgColor: '#00732f', accentColor: '#c8a84b', emblem: '🦅', coverText: 'PASSPORT', pattern: 'lines' },
  'mexico': { flag: '🇲🇽', name: 'Mexico', bgColor: '#006847', accentColor: '#c8a84b', emblem: '🦅', coverText: 'PASAPORTE', pattern: 'lines' },
  'china': { flag: '🇨🇳', name: 'China', bgColor: '#de2910', accentColor: '#ffde00', emblem: '⭐', coverText: '护照', pattern: 'lines' },
  'pakistan': { flag: '🇵🇰', name: 'Pakistan', bgColor: '#01411C', accentColor: '#ffffff', emblem: '🌙', coverText: 'PASSPORT', pattern: 'lines' },
  'nigeria': { flag: '🇳🇬', name: 'Nigeria', bgColor: '#008751', accentColor: '#c8a84b', emblem: '🦅', coverText: 'PASSPORT', pattern: 'lines' },
  'south-africa': { flag: '🇿🇦', name: 'South Africa', bgColor: '#007A4D', accentColor: '#FFB612', emblem: '🦅', coverText: 'PASSPORT', pattern: 'lines' },
  'philippines': { flag: '🇵🇭', name: 'Philippines', bgColor: '#0038a8', accentColor: '#fcd116', emblem: '☀️', coverText: 'PASSPORT', pattern: 'lines' },
  'malaysia': { flag: '🇲🇾', name: 'Malaysia', bgColor: '#cc0001', accentColor: '#ffd700', emblem: '🌙', coverText: 'PASPORT', pattern: 'lines' },
  'turkey': { flag: '🇹🇷', name: 'Turkey', bgColor: '#e30a17', accentColor: '#ffffff', emblem: '🌙', coverText: 'PASAPORT', pattern: 'lines' },
  'poland': { flag: '🇵🇱', name: 'Poland', bgColor: '#dc143c', accentColor: '#ffffff', emblem: '🦅', coverText: 'PASZPORT', pattern: 'lines' },
  'ukraine': { flag: '🇺🇦', name: 'Ukraine', bgColor: '#005bbb', accentColor: '#ffd500', emblem: '🌾', coverText: 'ПАСПОРТ', pattern: 'lines' },
  'ghana': { flag: '🇬🇭', name: 'Ghana', bgColor: '#006b3f', accentColor: '#fcd116', emblem: '⭐', coverText: 'PASSPORT', pattern: 'lines' },
}

function PassportMiniSVG({ slug }: { slug: string }) {
  const d = PASSPORT_FLAGS[slug]
  if (!d) return null
  const pid = `pm-${slug.replace(/-/g, '')}`
  return (
    <svg viewBox="0 0 200 280" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        <pattern id={pid} x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
          <line x1="0" y1="0" x2="0" y2="20" stroke={d.accentColor} strokeWidth="0.4" opacity="0.15" />
        </pattern>
      </defs>
      <rect x="0" y="0" width="200" height="280" rx="8" fill={d.bgColor} />
      <rect x="0" y="0" width="200" height="280" rx="8" fill={`url(#${pid})`} />
      <rect x="0" y="0" width="200" height="5" fill={d.accentColor} opacity="0.5" />
      <rect x="0" y="275" width="200" height="5" fill={d.accentColor} opacity="0.5" />
      <rect x="0" y="0" width="5" height="280" fill={d.accentColor} opacity="0.25" />
      <circle cx="100" cy="108" r="34" fill={d.accentColor} opacity="0.1" />
      <circle cx="100" cy="108" r="30" fill="none" stroke={d.accentColor} strokeWidth="0.8" opacity="0.35" />
      <text x="100" y="118" textAnchor="middle" fontSize="28" fill="#ffffff" opacity="0.9">{d.emblem}</text>
      <text x="100" y="163" textAnchor="middle" fontSize="7" fill={d.accentColor} opacity="0.8" letterSpacing="2" fontFamily="serif" fontWeight="bold">{d.name.toUpperCase()}</text>
      <text x="100" y="180" textAnchor="middle" fontSize="9" fill="#ffffff" opacity="0.65" letterSpacing="3" fontFamily="serif">{d.coverText}</text>
      <text x="100" y="220" textAnchor="middle" fontSize="20" opacity="0.9">{d.flag}</text>
      <rect x="10" y="245" width="180" height="2.5" rx="1" fill={d.accentColor} opacity="0.1" />
      <rect x="10" y="251" width="180" height="2.5" rx="1" fill={d.accentColor} opacity="0.1" />
      <rect x="10" y="257" width="120" height="2.5" rx="1" fill={d.accentColor} opacity="0.1" />
    </svg>
  )
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}
function getCountryInfo(c: CountryInfo | CountryInfo[] | null | undefined): CountryInfo | null {
  if (!c) return null
  return Array.isArray(c) ? (c[0] ?? null) : c
}
function capPercent(n: number) { return Math.min(n, 99) }
function formatRole(r: string) {
  return r.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase()).trim()
}

// ─── Auth error interpreter ───────────────────────────────────────────────────

function interpretAuthError(
  error: { message: string },
  mode: 'signin' | 'signup'
): { message: string; switchTab?: 'signin' | 'signup' } {
  const msg = error.message.toLowerCase()

  if (mode === 'signup') {
    if (
      msg.includes('already registered') ||
      msg.includes('already exists') ||
      msg.includes('user already') ||
      msg.includes('email already')
    ) {
      return {
        message: 'An account with this email already exists. Switching to sign in.',
        switchTab: 'signin',
      }
    }
    if (msg.includes('password') && msg.includes('weak')) {
      return { message: 'Password too weak. Use at least 8 characters.' }
    }
  }

  if (mode === 'signin') {
    if (msg.includes('email not confirmed')) {
      return { message: 'Please confirm your email before signing in. Check your inbox.' }
    }
    // Supabase returns the same error string for both wrong password and
    // non-existent account — cannot distinguish, show generic message
    return { message: 'Invalid email or password. Please check your credentials and try again.' }
  }

  return { message: error.message }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [savedCountries, setSavedCountries] = useState<SavedCountry[]>([])
  const [savesLoading, setSavesLoading] = useState(false)
  const [wizardResult, setWizardResult] = useState<WizardResult | null>(null)

  // Auth form
  const [tab, setTab] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [authLoading, setAuthLoading] = useState(false)
  const [authError, setAuthError] = useState('')
  const [authSuccess, setAuthSuccess] = useState('')

  // Edit name
  const [editingName, setEditingName] = useState(false)
  const [nameValue, setNameValue] = useState('')
  const [nameSaving, setNameSaving] = useState(false)

  // Delete
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      setUser(data.user)
      if (data.user) {
        setNameValue(data.user.user_metadata?.full_name ?? '')
        setSavesLoading(true)
        const [savesRes, wizardRes, profileRes] = await Promise.all([
          supabase.from('saved_countries')
            .select('id, country_slug, created_at, countries(flag_emoji, name)')
            .eq('user_id', data.user.id)
            .order('created_at', { ascending: false }),
          supabase.from('wizard_results')
            .select('top_countries, answers, created_at')
            .eq('user_id', data.user.id)
            .single(),
          supabase.from('profiles')
            .select('passport_slug, job_title, onboarded')
            .eq('id', data.user.id)
            .single(),
        ])
        setSavedCountries((savesRes.data as SavedCountry[]) ?? [])
        setWizardResult(wizardRes.data ?? null)
        setProfile(profileRes.data ?? null)
        if (!profileRes.data?.onboarded) { window.location.href = '/onboarding'; return }
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
      if (error) {
        const { message, switchTab } = interpretAuthError(error, 'signup')
        setAuthError(message)
        if (switchTab) setTimeout(() => setTab(switchTab), 1200)
      } else {
        setAuthSuccess('Check your email to confirm your account!')
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        const { message } = interpretAuthError(error, 'signin')
        setAuthError(message)
      } else {
        window.location.reload()
      }
    }

    setAuthLoading(false)
  }

  const handleGoogleSignIn = async () => {
    const next = new URLSearchParams(window.location.search).get('next') ?? '/profile'
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}` },
    })
  }

  const removeSave = async (id: string) => {
    await supabase.from('saved_countries').delete().eq('id', id)
    setSavedCountries(prev => prev.filter(s => s.id !== id))
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  const saveName = async () => {
    if (!user || !nameValue.trim()) return
    setNameSaving(true)
    await supabase.auth.updateUser({ data: { full_name: nameValue.trim() } })
    setUser(prev => prev ? { ...prev, user_metadata: { ...prev.user_metadata, full_name: nameValue.trim() } } : prev)
    setEditingName(false)
    setNameSaving(false)
  }

  // Uses server API route with service role key to fully delete auth user
  const deleteAccount = async () => {
    if (!user) return
    setDeleteLoading(true)
    setDeleteError('')
    try {
      const res = await fetch('/api/delete-account', { method: 'DELETE' })
      if (!res.ok) {
        const data = await res.json()
        setDeleteError(data.error ?? 'Something went wrong. Please try again.')
        setDeleteLoading(false)
        return
      }
      await supabase.auth.signOut()
      router.push('/')
    } catch {
      setDeleteError('Network error. Please try again.')
      setDeleteLoading(false)
    }
  }

  const formatSlug = (slug: string) =>
    slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())

  const passportData = profile?.passport_slug ? PASSPORT_FLAGS[profile.passport_slug] : null

  // ── Loading ──
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-bg-primary">
      <div className="w-8 h-8 border-2 border-accent/20 border-t-accent rounded-full animate-spin" />
    </div>
  )

  // ── Not signed in ──
  if (!user) return (
    <div className="min-h-screen bg-bg-primary flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-center gap-2 mb-8">
          <Globe2 className="w-7 h-7 text-accent" />
          <span className="font-heading text-2xl font-extrabold">Origio</span>
        </div>

        <div className="flex rounded-xl bg-bg-elevated border border-border p-1 mb-6">
          <button onClick={() => { setTab('signin'); setAuthError(''); setAuthSuccess('') }}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${tab === 'signin' ? 'bg-bg-surface text-text-primary shadow-sm' : 'text-text-muted hover:text-text-primary'}`}>
            Sign In
          </button>
          <button onClick={() => { setTab('signup'); setAuthError(''); setAuthSuccess('') }}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${tab === 'signup' ? 'bg-bg-surface text-text-primary shadow-sm' : 'text-text-muted hover:text-text-primary'}`}>
            Create Account
          </button>
        </div>

        <form onSubmit={handleEmailAuth} className="space-y-3 mb-4">
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required
              className="w-full pl-10 pr-4 py-3 bg-bg-elevated border border-border rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:border-accent/40 focus:outline-none focus:ring-1 focus:ring-accent/20 transition-colors" />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input type={showPassword ? 'text' : 'password'} placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required
              className="w-full pl-10 pr-10 py-3 bg-bg-elevated border border-border rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:border-accent/40 focus:outline-none focus:ring-1 focus:ring-accent/20 transition-colors" />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary">
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {authError && (
            <p className={`text-xs ${authError.includes('Switching') ? 'text-amber-400' : 'text-score-low'}`}>
              {authError}
            </p>
          )}
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
        <p className="text-xs text-text-muted text-center mt-3">
          Google sign-in works for both new and existing accounts.
        </p>
      </div>
    </div>
  )

  // ── Signed in ──
  return (
    <div className="min-h-screen bg-bg-primary">
      <Nav countries={[]} onCountrySelect={() => {}} />

      <div className="max-w-2xl mx-auto px-6 pt-20 pb-12">

        {/* ── Avatar + name + badges ── */}
        <div className="flex items-start gap-4 mb-8">
          {user.user_metadata?.avatar_url ? (
            <img src={user.user_metadata.avatar_url} alt="avatar" className="w-16 h-16 rounded-full border border-border flex-shrink-0" referrerPolicy="no-referrer" />
          ) : (
            <div className="w-16 h-16 rounded-full bg-bg-elevated border border-border flex items-center justify-center text-2xl font-bold text-accent flex-shrink-0">
              {(user.user_metadata?.full_name ?? user.email ?? 'U')[0].toUpperCase()}
            </div>
          )}

          <div className="flex-1 min-w-0">
            {editingName ? (
              <div className="flex items-center gap-2 mb-1">
                <input value={nameValue} onChange={e => setNameValue(e.target.value)} autoFocus
                  onKeyDown={e => { if (e.key === 'Enter') saveName(); if (e.key === 'Escape') setEditingName(false) }}
                  className="font-heading text-xl font-extrabold bg-bg-elevated border border-accent/40 rounded-lg px-3 py-1 text-text-primary focus:outline-none" />
                <button onClick={saveName} disabled={nameSaving} className="p-1.5 rounded-lg bg-accent/10 text-accent"><Check className="w-4 h-4" /></button>
                <button onClick={() => setEditingName(false)} className="p-1.5 rounded-lg text-text-muted"><X className="w-4 h-4" /></button>
              </div>
            ) : (
              <div className="flex items-center gap-2 mb-1">
                <h1 className="font-heading text-2xl font-extrabold text-text-primary">
                  {user.user_metadata?.full_name ?? 'Explorer'}
                </h1>
                <button onClick={() => setEditingName(true)} className="p-1 rounded-lg text-text-muted hover:text-accent hover:bg-accent/10 transition-colors">
                  <Pencil className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
            <p className="text-text-muted text-sm mb-3">{user.email}</p>

            <div className="flex flex-wrap items-center gap-2">
              {passportData && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border bg-bg-elevated text-xs text-text-muted">
                  <span>{passportData.flag}</span>
                  <span>{passportData.name} passport</span>
                </div>
              )}
              {profile?.job_title && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border bg-bg-elevated text-xs text-text-muted">
                  <Briefcase className="w-3 h-3" />
                  <span>{profile.job_title}</span>
                </div>
              )}
            </div>
          </div>

          {profile?.passport_slug && (
            <div className="w-14 flex-shrink-0">
              <PassportMiniSVG slug={profile.passport_slug} />
            </div>
          )}
        </div>

        {/* Explore globe */}
        <a href="/" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border hover:border-accent/30 hover:bg-accent/5 text-sm text-text-muted hover:text-text-primary transition-all mb-6">
          <Globe2 className="w-4 h-4 text-accent" />
          Explore the Globe
        </a>

        {/* ── Saved Countries ── */}
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
              {savedCountries.map(save => {
                const info = getCountryInfo(save.countries)
                return (
                  <div key={save.id} className="flex items-center justify-between p-3 rounded-xl bg-bg-elevated border border-border hover:border-accent/20 transition-colors">
                    <a href={`/country/${save.country_slug}`} className="flex items-center gap-2 text-sm font-medium text-text-primary hover:text-accent transition-colors">
                      {info?.flag_emoji && <span className="text-base">{info.flag_emoji}</span>}
                      {info?.name ?? formatSlug(save.country_slug)}
                    </a>
                    <button onClick={() => removeSave(save.id)} className="p-1.5 rounded-lg text-text-muted hover:text-score-low hover:bg-rose-500/10 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* ── Wizard Result ── */}
        <div className="glass-panel rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-accent" />
              <h2 className="font-heading text-lg font-bold text-text-primary">Last Wizard Result</h2>
            </div>
            <a href="/wizard" className="text-xs text-accent hover:underline">Retake quiz →</a>
          </div>
          {!wizardResult ? (
            <div className="text-center py-6">
              <p className="text-text-muted text-sm mb-3">No wizard results yet</p>
              <a href="/wizard" className="text-sm text-accent hover:underline">Take the quiz →</a>
            </div>
          ) : (
            <div className="space-y-2">
              {wizardResult.top_countries.map((c, i) => {
                const colors = ['#fbbf24', '#00d4c8', '#a78bfa']
                const labels = ['Best Match', '2nd Match', '3rd Match']
                const color = colors[i]
                return (
                  <div key={c.slug} className="flex items-center justify-between p-3 rounded-xl bg-bg-elevated border border-border hover:border-accent/20 transition-colors">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ color, background: color + '20' }}>{labels[i]}</span>
                      <span className="text-lg">{c.flagEmoji}</span>
                      <span className="text-sm font-medium text-text-primary">{c.name}</span>
                    </div>
                    <span className="text-sm font-bold" style={{ color }}>{capPercent(c.matchPercent)}%</span>
                  </div>
                )
              })}
              <p className="text-xs text-text-muted pt-2">
                Role: {wizardResult.answers?.role ? formatRole(wizardResult.answers.role) : 'Unknown'} · {formatDate(wizardResult.created_at)}
              </p>
            </div>
          )}
        </div>

        {/* ── Account ── */}
        <div className="glass-panel rounded-2xl p-6 border border-rose-500/10">
          <h2 className="font-heading text-lg font-bold text-text-primary mb-1">Account</h2>
          <p className="text-xs text-text-muted mb-4">Manage your account settings</p>
          <div className="flex flex-col sm:flex-row gap-3">
            <button onClick={signOut}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border hover:border-border-hover text-sm text-text-muted hover:text-text-primary transition-colors">
              <LogOut className="w-4 h-4" />Sign out
            </button>
            <button onClick={() => { setShowDeleteConfirm(true); setDeleteError('') }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-rose-500/20 hover:border-rose-500/40 hover:bg-rose-500/5 text-sm text-rose-400 transition-colors">
              <Trash2 className="w-4 h-4" />Delete account
            </button>
          </div>
        </div>

      </div>

      {/* ── Delete confirm modal ── */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="glass-panel rounded-2xl p-6 max-w-sm w-full border border-rose-500/20">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-rose-500/10 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-rose-400" />
              </div>
              <div>
                <h3 className="font-heading text-lg font-bold text-text-primary">Delete account?</h3>
                <p className="text-xs text-text-muted">This cannot be undone</p>
              </div>
            </div>
            <p className="text-sm text-text-muted mb-4">
              All your saved countries, wizard results, and profile data will be permanently deleted.
            </p>
            {deleteError && (
              <p className="text-xs text-score-low mb-4">{deleteError}</p>
            )}
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-2.5 rounded-xl border border-border text-sm text-text-muted hover:text-text-primary transition-colors">
                Cancel
              </button>
              <button onClick={deleteAccount} disabled={deleteLoading}
                className="flex-1 py-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 hover:bg-rose-500/20 text-sm text-rose-400 font-medium transition-colors disabled:opacity-50">
                {deleteLoading ? 'Deleting...' : 'Yes, delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}