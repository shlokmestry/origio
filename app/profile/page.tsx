'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/useAuth'
import Nav from '@/components/Nav'
import {
  Globe2, LogOut, Trash2, Sparkles, Pencil,
  AlertTriangle, Briefcase, Zap, ArrowRight, Search, Check, X
} from 'lucide-react'

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

const PASSPORT_LIST = Object.entries(PASSPORT_FLAGS).map(([slug, d]) => ({ slug, ...d }))

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

const MATCH_COLORS = ['#fbbf24', '#00d4c8', '#a78bfa']
const MATCH_LABELS = ['Best Match', '2nd', '3rd']

export default function ProfilePage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [savedCountries, setSavedCountries] = useState<SavedCountry[]>([])
  const [wizardResult, setWizardResult] = useState<WizardResult | null>(null)

  // Local display state — updates instantly on save
  const [displayName, setDisplayName] = useState('')

  const [editing, setEditing] = useState(false)
  const [editName, setEditName] = useState('')
  const [editJobTitle, setEditJobTitle] = useState('')
  const [editPassport, setEditPassport] = useState<string | null>(null)
  const [passportSearch, setPassportSearch] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  useEffect(() => {
    if (authLoading) return
    if (!user) { setLoading(false); setLoadError(true); return }

    const userId = user.id
    const initialName = user.user_metadata?.full_name ?? user.email?.split('@')[0] ?? ''
    setDisplayName(initialName)
    setEditName(initialName)

    async function loadData() {
      await new Promise(r => setTimeout(r, 300))
      try {
        const [savesRes, wizardRes, profileRes] = await Promise.all([
          supabase.from('saved_countries')
            .select('id, country_slug, created_at, countries(flag_emoji, name)')
            .eq('user_id', userId)
            .order('created_at', { ascending: false }),
          supabase.from('wizard_results')
            .select('top_countries, answers, created_at')
            .eq('user_id', userId)
            .single(),
          supabase.from('profiles')
            .select('passport_slug, job_title, onboarded, is_pro')
            .eq('id', userId)
            .single(),
        ])

        setSavedCountries((savesRes.data as SavedCountry[]) ?? [])
        setWizardResult(wizardRes.data ?? null)
        const p = profileRes.data ?? null
        setProfile(p)
        if (p) {
          setEditJobTitle(p.job_title ?? '')
          setEditPassport(p.passport_slug)
        }
        if (p && !p.onboarded) { window.location.href = '/onboarding'; return }
      } catch { setLoadError(true) }
      setLoading(false)
    }

    loadData()
  }, [user, authLoading, router])

  const openEdit = () => {
    setEditName(displayName)
    setEditJobTitle(profile?.job_title ?? '')
    setEditPassport(profile?.passport_slug ?? null)
    setPassportSearch('')
    setSaveError('')
    setEditing(true)
  }

  const saveEdit = async () => {
    if (!user) {
      setSaveError('Not logged in')
      return
    }
    setSaving(true)
    setSaveError('')
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('No session')

      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          job_title: editJobTitle.trim() || null,
          passport_slug: editPassport,
        })
        .eq('id', user.id)

      if (profileError) throw profileError

      if (editName.trim()) {
        const nameUpdatePromise = supabase.auth.updateUser({
          data: { full_name: editName.trim() }
        })
        if (nameError) console.error('Name update failed:', nameError)
      }

      // Update all local display state instantly — no refresh needed
      setDisplayName(editName.trim() || displayName)
      setProfile(prev => prev ? {
        ...prev,
        job_title: editJobTitle.trim() || null,
        passport_slug: editPassport,
      } : prev)

      setEditing(false)
    } catch (err: any) {
      setSaveError(err?.message || 'Failed to save. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const removeSave = async (id: string) => {
    await supabase.from('saved_countries').delete().eq('id', id)
    setSavedCountries(prev => prev.filter(s => s.id !== id))
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  const deleteAccount = async () => {
    if (!user) return
    setDeleteLoading(true)
    setDeleteError('')
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { setDeleteError('Session expired.'); setDeleteLoading(false); return }
      const res = await fetch('/api/delete-account', {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${session.access_token}` },
      })
      if (!res.ok) {
        const data = await res.json()
        setDeleteError(data.error ?? 'Something went wrong.')
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
  const topMatch = wizardResult?.top_countries?.[0]
  const memberSince = user?.created_at ? formatDate(user.created_at) : null
  const filteredPassports = PASSPORT_LIST.filter(p =>
    p.name.toLowerCase().includes(passportSearch.toLowerCase())
  )

  if (loading || authLoading) return (
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

      {/* ── Header ── */}
      <div className="border-b border-border">
        <div className="max-w-5xl mx-auto px-6 pt-24 pb-8">
          <div className="flex items-start gap-5">
            {user.user_metadata?.avatar_url ? (
              <img src={user.user_metadata.avatar_url} alt="avatar"
                className="w-16 h-16 rounded-2xl border border-border flex-shrink-0"
                referrerPolicy="no-referrer" />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center text-2xl font-bold text-accent flex-shrink-0">
                {(displayName || user.email || 'U')[0].toUpperCase()}
              </div>
            )}

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <h1 className="font-heading text-xl font-extrabold text-text-primary truncate">
                  {displayName || user.email?.split('@')[0] || 'You'}
                </h1>
                <button onClick={openEdit}
                  className="p-1 rounded-lg text-text-muted hover:text-accent hover:bg-accent/10 transition-colors flex-shrink-0">
                  <Pencil className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-sm text-text-muted mb-3 truncate">{user.email}</p>

              <div className="flex flex-wrap gap-1.5">
                {isPro && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-semibold">
                    <Sparkles className="w-3 h-3" /> Pro
                  </span>
                )}
                {passportData && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-bg-elevated border border-border text-text-muted text-xs">
                    {passportData.flag} {passportData.name}
                  </span>
                )}
                {profile?.job_title && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-bg-elevated border border-border text-text-muted text-xs">
                    <Briefcase className="w-3 h-3" /> {profile.job_title}
                  </span>
                )}
                {memberSince && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-bg-elevated border border-border text-text-muted text-xs">
                    Member since {memberSince}
                  </span>
                )}
              </div>
            </div>
          </div>

          {!isPro && (
            <div className="mt-5 flex items-center justify-between gap-3 px-4 py-3 rounded-xl border border-border bg-bg-elevated">
              <p className="text-xs text-text-muted">
                <span className="text-accent font-semibold">Origio Pro</span> — unlock all 25 countries, unlimited matches · €5 one-time
              </p>
              <a href="/pro" className="text-xs text-accent font-semibold hover:underline whitespace-nowrap flex items-center gap-1">
                Upgrade <ArrowRight className="w-3 h-3" />
              </a>
            </div>
          )}
        </div>
      </div>

      {/* ── Content ── */}
      <div className="max-w-5xl mx-auto px-6 py-8 space-y-5">

        <div className="grid md:grid-cols-2 gap-5">

          {/* Top Match */}
          <div className="glass-panel rounded-2xl border border-border overflow-hidden">
            <div className="flex items-center justify-between px-5 pt-5 pb-3">
              <h2 className="font-heading text-sm font-bold text-text-primary">Your Top Match</h2>
              <a href="/wizard" className="text-xs text-accent hover:underline flex items-center gap-1">
                Retake <ArrowRight className="w-3 h-3" />
              </a>
            </div>

            {!wizardResult ? (
              <div className="text-center py-10 px-5">
                <div className="text-4xl mb-3">🌍</div>
                <p className="text-sm text-text-muted mb-4">No results yet</p>
                <a href="/wizard" className="cta-button px-4 py-2 rounded-xl text-xs inline-flex items-center gap-2">
                  <Zap className="w-3.5 h-3.5" /> Find My Country
                </a>
              </div>
            ) : (
              <div>
                <div className="px-5 pb-4">
                  <div className="rounded-xl p-5 text-center"
                    style={{ background: `linear-gradient(135deg, ${MATCH_COLORS[0]}15, ${MATCH_COLORS[0]}05)`, border: `1px solid ${MATCH_COLORS[0]}30` }}>
                    <div className="text-4xl mb-1.5">{topMatch?.flagEmoji}</div>
                    <p className="font-heading text-lg font-extrabold text-text-primary">{topMatch?.name}</p>
                    <p className="font-heading text-2xl font-extrabold" style={{ color: MATCH_COLORS[0] }}>
                      {capPercent(topMatch?.matchPercent ?? 0)}%
                    </p>
                    <p className="text-xs text-text-muted">match</p>
                  </div>
                </div>
                <div className="border-t border-border">
                  {wizardResult.top_countries.slice(1).map((c, i) => (
                    <div key={c.slug} className="flex items-center gap-3 px-5 py-2.5 border-b border-border last:border-0">
                      <span className="text-xs font-bold px-1.5 py-0.5 rounded-full"
                        style={{ color: MATCH_COLORS[i + 1], background: MATCH_COLORS[i + 1] + '20' }}>
                        {MATCH_LABELS[i + 1]}
                      </span>
                      <span className="text-base">{c.flagEmoji}</span>
                      <span className="text-sm text-text-primary flex-1">{c.name}</span>
                      <span className="text-xs font-semibold" style={{ color: MATCH_COLORS[i + 1] }}>
                        {capPercent(c.matchPercent)}%
                      </span>
                    </div>
                  ))}
                </div>
                <div className="px-5 py-2.5 border-t border-border">
                  <p className="text-xs text-text-muted">
                    {wizardResult.answers?.role ? formatRole(wizardResult.answers.role) : 'Unknown'} · {formatDate(wizardResult.created_at)}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Saved Countries */}
          <div className="glass-panel rounded-2xl border border-border overflow-hidden">
            <div className="flex items-center justify-between px-5 pt-5 pb-3">
              <h2 className="font-heading text-sm font-bold text-text-primary">
                Saved Countries
                {savedCountries.length > 0 && (
                  <span className="ml-2 text-xs text-accent bg-accent/10 px-2 py-0.5 rounded-full">
                    {savedCountries.length}
                  </span>
                )}
              </h2>
              <a href="/" className="text-xs text-accent hover:underline flex items-center gap-1">
                Explore <ArrowRight className="w-3 h-3" />
              </a>
            </div>

            {savedCountries.length === 0 ? (
              <div className="text-center py-10 px-5">
                <div className="text-4xl mb-3">📌</div>
                <p className="text-sm text-text-muted mb-3">No saved countries yet</p>
                <a href="/" className="text-xs text-accent hover:underline">Start exploring →</a>
              </div>
            ) : (
              <div>
                {savedCountries.slice(0, 6).map(s => {
                  const info = getCountryInfo(s.countries)
                  return (
                    <div key={s.id} className="flex items-center gap-3 px-5 py-2.5 border-b border-border last:border-0 group">
                      <span className="text-lg flex-shrink-0">{info?.flag_emoji ?? '🌍'}</span>
                      <a href={`/country/${s.country_slug}`}
                        className="text-sm text-text-primary hover:text-accent transition-colors flex-1 truncate">
                        {info?.name ?? formatSlug(s.country_slug)}
                      </a>
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <a href={`/country/${s.country_slug}`} className="text-xs text-accent hover:underline">View</a>
                        <button onClick={() => removeSave(s.id)} className="text-xs text-text-muted hover:text-rose-400 transition-colors">
                          Remove
                        </button>
                      </div>
                    </div>
                  )
                })}
                {savedCountries.length > 6 && (
                  <div className="px-5 py-2.5 text-xs text-text-muted">
                    +{savedCountries.length - 6} more saved
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Account row */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 rounded-xl border border-border">
          <p className="text-xs text-text-muted">{user.email}</p>
          <div className="flex gap-2">
            <button onClick={signOut}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs text-text-muted hover:text-text-primary transition-colors whitespace-nowrap">
              <LogOut className="w-3 h-3" /> Sign out
            </button>
            <button onClick={() => { setShowDeleteConfirm(true); setDeleteError('') }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-rose-500/20 text-xs text-rose-400 hover:bg-rose-500/5 transition-colors whitespace-nowrap">
              <Trash2 className="w-3 h-3" /> Delete account
            </button>
          </div>
        </div>

      </div>

      {/* ── Edit modal ── */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="glass-panel rounded-2xl p-6 w-full max-w-md border border-border">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-heading text-lg font-bold text-text-primary">Edit profile</h3>
              <button onClick={() => setEditing(false)} className="p-1.5 rounded-lg text-text-muted hover:text-text-primary transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs text-text-muted uppercase tracking-wider mb-1.5 block">Display name</label>
                <input value={editName} onChange={e => setEditName(e.target.value)}
                  className="w-full px-3 py-2.5 bg-bg-elevated border border-border rounded-xl text-sm text-text-primary focus:border-accent/40 focus:outline-none transition-colors" />
              </div>

              <div>
                <label className="text-xs text-text-muted uppercase tracking-wider mb-1.5 block">Job title</label>
                <input value={editJobTitle} onChange={e => setEditJobTitle(e.target.value)}
                  placeholder="e.g. Software Engineer, Nurse, Student..."
                  className="w-full px-3 py-2.5 bg-bg-elevated border border-border rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:border-accent/40 focus:outline-none transition-colors" />
              </div>

              <div>
                <label className="text-xs text-text-muted uppercase tracking-wider mb-1.5 block">Passport</label>
                {editPassport && (
                  <div className="flex items-center justify-between mb-2 px-3 py-2 rounded-lg bg-accent/5 border border-accent/20">
                    <span className="text-sm text-text-primary">
                      {PASSPORT_FLAGS[editPassport]?.flag} {PASSPORT_FLAGS[editPassport]?.name}
                    </span>
                    <button onClick={() => setEditPassport(null)} className="text-xs text-text-muted hover:text-rose-400 transition-colors">
                      Clear
                    </button>
                  </div>
                )}
                <div className="relative mb-2">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
                  <input placeholder="Search passport..."
                    value={passportSearch} onChange={e => setPassportSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-bg-elevated border border-border rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:border-accent/40 focus:outline-none transition-colors" />
                </div>
                <div className="max-h-36 overflow-y-auto space-y-0.5">
                  {filteredPassports.slice(0, 20).map(p => (
                    <button key={p.slug} onClick={() => { setEditPassport(p.slug); setPassportSearch('') }}
                      className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-left transition-colors ${
                        editPassport === p.slug
                          ? 'bg-accent/10 text-text-primary'
                          : 'hover:bg-bg-elevated text-text-muted hover:text-text-primary'
                      }`}>
                      <span>{p.flag}</span>
                      <span className="flex-1">{p.name}</span>
                      {editPassport === p.slug && <Check className="w-3.5 h-3.5 text-accent" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {saveError && <p className="text-xs text-rose-400 mt-3">{saveError}</p>}

            <div className="flex gap-3 mt-5">
              <button onClick={() => setEditing(false)} disabled={saving}
                className="flex-1 py-2.5 rounded-xl border border-border text-sm text-text-muted hover:text-text-primary transition-colors disabled:opacity-50">
                Cancel
              </button>
              <button onClick={saveEdit} disabled={saving}
                className="flex-1 py-2.5 rounded-xl cta-button text-sm disabled:opacity-50">
                {saving ? 'Saving...' : 'Save changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete confirm ── */}
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
