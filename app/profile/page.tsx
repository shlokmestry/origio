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

// ─── Passport flags (badge only) ─────────────────────────────────────────────

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
  const [savedCountries, setSavedCountries] = useState<SavedCountry[]>([])
  const [savesLoading, setSavesLoading] = useState(false)
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
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) {
        router.push('/signin')
        return
      }
      setUser(data.user)
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
          .select('passport_slug, job_title, onboarded, is_pro')
          .eq('id', data.user.id)
          .single(),
      ])
      setSavedCountries((savesRes.data as SavedCountry[]) ?? [])
      setWizardResult(wizardRes.data ?? null)
      setProfile(profileRes.data ?? null)
      if (!profileRes.data?.onboarded) { window.location.href = '/onboarding'; return }
      setSavesLoading(false)
      setLoading(false)
    })
  }, [router])

  const removeSave = async (id: string) => {
    await supabase.from('saved_countries').delete().eq('id', id)
    setSavedCountries(prev => prev.filter(s => s.id !== id))
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const saveName = async () => {
    if (!user || !nameValue.trim()) return
    setNameSaving(true)
    await supabase.auth.updateUser({ data: { full_name: nameValue.trim() } })
    setUser(prev => prev ? { ...prev, user_metadata: { ...prev.user_metadata, full_name: nameValue.trim() } } : prev)
    setEditingName(false)
    setNameSaving(false)
  }

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
  const isPro = profile?.is_pro ?? false

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-bg-primary">
      <div className="w-8 h-8 border-2 border-accent/20 border-t-accent rounded-full animate-spin" />
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
                <h1 className="font-heading text-2xl font-extrabold text-text-primary">
                  {user.user_metadata?.full_name ?? 'Explorer'}
                </h1>
                <button onClick={() => setEditingName(true)}
                  className="p-1 rounded-lg text-text-muted hover:text-accent hover:bg-accent/10 transition-colors">
                  <Pencil className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
            <p className="text-text-muted text-sm mb-3">{user.email}</p>

            <div className="flex flex-wrap items-center gap-2">
              {/* Pro badge */}
              {isPro && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-accent/30 bg-accent/10 text-xs text-accent font-semibold">
                  <Sparkles className="w-3 h-3" />
                  Origio Pro
                </div>
              )}
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
        </div>

        {/* Explore globe */}
        <a href="/" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border hover:border-accent/30 hover:bg-accent/5 text-sm text-text-muted hover:text-text-primary transition-all mb-6">
          <Globe2 className="w-4 h-4 text-accent" />
          Explore the Globe
        </a>

        {/* ── Upgrade banner — only for free users ── */}
        {!isPro && (
          <div className="mb-6">
            <UpgradeBanner />
          </div>
        )}

        {/* ── Saved Countries ── */}
        <div className="glass-panel rounded-2xl p-6 mb-6">
          <h2 className="font-heading text-lg font-bold mb-4 text-text-primary">
            Saved Countries
            {savedCountries.length > 0 && (
              <span className="ml-2 text-xs text-accent bg-accent/10 px-2 py-0.5 rounded-full">
                {savedCountries.length}
              </span>
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
                    <button onClick={() => removeSave(save.id)}
                      className="p-1.5 rounded-lg text-text-muted hover:text-score-low hover:bg-rose-500/10 transition-colors">
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
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                        style={{ color, background: color + '20' }}>{labels[i]}</span>
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
            {deleteError && <p className="text-xs text-score-low mb-4">{deleteError}</p>}
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