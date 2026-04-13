'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Nav from '@/components/Nav'
import UpgradeBanner from '@/components/UpgradeBanner'
import type { User } from '@supabase/supabase-js'
import {
  Globe2, LogOut, Trash2,
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
  is_pro: boolean
}

// ─── Passport flags ───────────────────────────────────────────────────────────

const PASSPORT_FLAGS: Record<string, { flag: string; name: string }> = {
  'united-states': { flag: '🇺🇸', name: 'United States' },
  'united-kingdom': { flag: '🇬🇧', name: 'United Kingdom' },
  'canada': { flag: '🇨🇦', name: 'Canada' },
  'australia': { flag: '🇦🇺', name: 'Australia' },
  'germany': { flag: '🇩🇪', name: 'Germany' },
  'france': { flag: '🇫🇷', name: 'France' },
  'netherlands': { flag: '🇳🇱', name: 'Netherlands' },
  'sweden': { flag: '🇸🇪', name: 'Sweden' },
  'norway': { flag: '🇳🇴', name: 'Norway' },
  'denmark': { flag: '🇩🇰', name: 'Denmark' },
  'finland': { flag: '🇫🇮', name: 'Finland' },
  'switzerland': { flag: '🇨🇭', name: 'Switzerland' },
  'singapore': { flag: '🇸🇬', name: 'Singapore' },
  'japan': { flag: '🇯🇵', name: 'Japan' },
  'south-korea': { flag: '🇰🇷', name: 'South Korea' },
  'new-zealand': { flag: '🇳🇿', name: 'New Zealand' },
  'ireland': { flag: '🇮🇪', name: 'Ireland' },
  'portugal': { flag: '🇵🇹', name: 'Portugal' },
  'spain': { flag: '🇪🇸', name: 'Spain' },
  'italy': { flag: '🇮🇹', name: 'Italy' },
  'austria': { flag: '🇦🇹', name: 'Austria' },
  'india': { flag: '🇮🇳', name: 'India' },
  'brazil': { flag: '🇧🇷', name: 'Brazil' },
  'uae': { flag: '🇦🇪', name: 'UAE' },
  'mexico': { flag: '🇲🇽', name: 'Mexico' },
  'china': { flag: '🇨🇳', name: 'China' },
  'pakistan': { flag: '🇵🇰', name: 'Pakistan' },
  'nigeria': { flag: '🇳🇬', name: 'Nigeria' },
  'south-africa': { flag: '🇿🇦', name: 'South Africa' },
  'philippines': { flag: '🇵🇭', name: 'Philippines' },
  'malaysia': { flag: '🇲🇾', name: 'Malaysia' },
  'turkey': { flag: '🇹🇷', name: 'Turkey' },
  'poland': { flag: '🇵🇱', name: 'Poland' },
  'ukraine': { flag: '🇺🇦', name: 'Ukraine' },
  'ghana': { flag: '🇬🇭', name: 'Ghana' },
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

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [savedCountries, setSavedCountries] = useState<SavedCountry[]>([])
  const [wizardResult, setWizardResult] = useState<WizardResult | null>(null)

  // Edit name
  const [editingName, setEditingName] = useState(false)
  const [nameValue, setNameValue] = useState('')
  const [nameSaving, setNameSaving] = useState(false)

  // Delete
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  useEffect(() => {
    // Timeout fallback — if session check hangs more than 8s, show error
    const timeout = setTimeout(() => {
      if (loading) {
        setLoading(false)
        setLoadError(true)
      }
    }, 8000)

    supabase.auth.getSession().then(async ({ data: { session }, error }) => {
      clearTimeout(timeout)

      if (error || !session?.user) {
        router.push('/signin')
        return
      }

      const u = session.user
      setUser(u)
      setNameValue(u.user_metadata?.full_name ?? '')

      try {
        const [savesRes, wizardRes, profileRes] = await Promise.all([
          supabase.from('saved_countries')
            .select('id, country_slug, created_at, countries(flag_emoji, name)')
            .eq('user_id', u.id)
            .order('created_at', { ascending: false }),
          supabase.from('wizard_results')
            .select('top_countries, answers, created_at')
            .eq('user_id', u.id)
            .single(),
          supabase.from('profiles')
            .select('passport_slug, job_title, onboarded, is_pro')
            .eq('id', u.id)
            .single(),
        ])

        setSavedCountries((savesRes.data as SavedCountry[]) ?? [])
        setWizardResult(wizardRes.data ?? null)
        setProfile(profileRes.data ?? null)

        // Not onboarded — redirect
        if (profileRes.data && !profileRes.data.onboarded) {
          window.location.href = '/onboarding'
          return
        }
      } catch {
        setLoadError(true)
      }

      setLoading(false)
    })

    return () => clearTimeout(timeout)
  }, [router, loading])

  const removeSave = async (id: string) => {
    await supabase.from('saved_countries').delete().eq('id', id)
    setSavedCountries(prev => prev.filter(s => s.id !== id))
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    // Hard redirect — forces full page reload so Nav clears session state
    window.location.href = '/'
  }

  const saveName = async () => {
    if (!user || !nameValue.trim()) return
    setNameSaving(true)
    await supabase.auth.updateUser({ data: { full_name: nameValue.trim() } })
    setUser(prev => prev
      ? { ...prev, user_metadata: { ...prev.user_metadata, full_name: nameValue.trim() } }
      : prev)
    setEditingName(false)
    setNameSaving(false)
  }

  const deleteAccount = async () => {
    if (!user) return
    setDeleteLoading(true)
    setDeleteError('')
    try {
      // Get token to send as Bearer — same pattern as /api/checkout
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        setDeleteError('Session expired. Please sign in again.')
        setDeleteLoading(false)
        return
      }

      const res = await fetch('/api/delete-account', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      })

      if (!res.ok) {
        const data = await res.json()
        setDeleteError(data.error ?? 'Something went wrong. Please try again.')
        setDeleteLoading(false)
        return
      }

      await supabase.auth.signOut()
      window.location.href = '/'
    } catch {
      setDeleteError('Network error. Please try again.')
      setDeleteLoading(false)
    }
  }

  const formatSlug = (slug: string) =>
    slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())

  const passportData = profile?.passport_slug ? PASSPORT_FLAGS[profile.passport_slug] : null
  const isPro = profile?.is_pro ?? false

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-bg-primary">
      <div className="w-8 h-8 border-2 border-accent/20 border-t-accent rounded-full animate-spin" />
    </div>
  )

  if (loadError) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-bg-primary gap-4">
      <p className="text-text-muted text-sm">Something went wrong loading your profile.</p>
      <button onClick={() => window.location.reload()}
        className="px-4 py-2 rounded-xl border border-border text-sm text-text-muted hover:text-text-primary transition-colors">
        Try again
      </button>
    </div>
  )

  if (!user) return null

  return (
    <div className="min-h-screen bg-bg-primary">
      <Nav countries={[]} onCountrySelect={() => {}} />

      <div className="max-w-2xl mx-auto px-6 pt-20 pb-12">

        {/* ── Avatar + name + badges ── */}
        <div className="flex items-start gap-4 mb-8">
          {user.user_metadata?.avatar_url ? (
            <img src={user.user_metadata.avatar_url} alt="avatar"
              className="w-16 h-16 rounded-full border border-border flex-shrink-0"
              referrerPolicy="no-referrer" />
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
                <button onClick={saveName} disabled={nameSaving}
                  className="p-1.5 rounded-lg bg-accent/10 text-accent">
                  <Check className="w-4 h-4" />
                </button>
                <button onClick={() => setEditingName(false)} className="p-1.5 rounded-lg text-text-muted">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 mb-1">
                <h1 className="font-heading text-2xl font-extrabold text-text-primary truncate">
                  {user.user_metadata?.full_name ?? user.email?.split('@')[0] ?? 'You'}
                </h1>
                <button onClick={() => setEditingName(true)}
                  className="p-1 rounded-lg text-text-muted hover:text-text-primary transition-colors flex-shrink-0">
                  <Pencil className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            <p className="text-sm text-text-muted mb-3 truncate">{user.email}</p>

            <div className="flex flex-wrap gap-2">
              {isPro && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-semibold">
                  <Sparkles className="w-3 h-3" />
                  Origio Pro
                </span>
              )}
              {passportData && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-bg-elevated border border-border text-text-muted text-xs">
                  {passportData.flag} {passportData.name} passport
                </span>
              )}
              {profile?.job_title && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-bg-elevated border border-border text-text-muted text-xs">
                  <Briefcase className="w-3 h-3" />
                  {profile.job_title}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* ── Upgrade banner for free users ── */}
        {!isPro && (
          <div className="mb-6">
            <UpgradeBanner />
          </div>
        )}

        {/* ── Quick actions ── */}
        <div className="flex flex-wrap gap-3 mb-8">
          <a href="/"
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border hover:border-border-hover text-sm text-text-muted hover:text-text-primary transition-colors">
            <Globe2 className="w-4 h-4" />
            Explore the Globe
          </a>
        </div>

        {/* ── Saved Countries ── */}
        <div className="glass-panel rounded-2xl p-6 border border-border mb-4">
          <h2 className="font-heading text-lg font-bold text-text-primary mb-1">Saved Countries</h2>
          <p className="text-xs text-text-muted mb-4">Countries you&apos;ve bookmarked</p>
          {savedCountries.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-sm text-text-muted mb-2">No saved countries yet</p>
              <a href="/" className="text-sm text-accent hover:underline">Start exploring →</a>
            </div>
          ) : (
            <div className="space-y-2">
              {savedCountries.map(s => {
                const info = getCountryInfo(s.countries)
                return (
                  <div key={s.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{info?.flag_emoji ?? '🌍'}</span>
                      <div>
                        <p className="text-sm font-medium text-text-primary">
                          {info?.name ?? formatSlug(s.country_slug)}
                        </p>
                        <p className="text-xs text-text-muted">{formatDate(s.created_at)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <a href={`/country/${s.country_slug}`}
                        className="text-xs text-accent hover:underline">View</a>
                      <button onClick={() => removeSave(s.id)}
                        className="text-xs text-text-muted hover:text-rose-400 transition-colors ml-2">
                        Remove
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* ── Last Find My Country Result ── */}
        <div className="glass-panel rounded-2xl p-6 border border-border mb-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-heading text-lg font-bold text-text-primary">Last Find My Country Result</h2>
              <p className="text-xs text-text-muted">Your most recent country matches</p>
            </div>
            <a href="/wizard" className="text-xs text-accent hover:underline">Retake quiz →</a>
          </div>

          {!wizardResult ? (
            <div className="text-center py-6">
              <p className="text-sm text-text-muted mb-2">No results yet</p>
              <a href="/wizard" className="text-sm text-accent hover:underline">Take the quiz →</a>
            </div>
          ) : (
            <div className="space-y-2">
              {wizardResult.top_countries.map((c, i) => (
                <div key={c.slug} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
                  <span className="text-text-muted text-xs w-4 text-center font-mono">#{i + 1}</span>
                  <span className="text-xl">{c.flagEmoji}</span>
                  <span className="text-sm font-medium text-text-primary flex-1">{c.name}</span>
                  <span className="text-xs text-accent font-semibold">{capPercent(c.matchPercent)}% match</span>
                </div>
              ))}
              <p className="text-xs text-text-muted pt-2">
                {wizardResult.answers?.role ? formatRole(wizardResult.answers.role) : 'Unknown'} · {formatDate(wizardResult.created_at)}
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
              All your saved countries, country matches, and profile data will be permanently deleted.
            </p>
            {deleteError && <p className="text-xs text-rose-400 mb-4">{deleteError}</p>}
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteConfirm(false)} disabled={deleteLoading}
                className="flex-1 py-2.5 rounded-xl border border-border text-sm text-text-muted hover:text-text-primary transition-colors disabled:opacity-50">
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