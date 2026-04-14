'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Nav from '@/components/Nav'
import type { User } from '@supabase/supabase-js'
import {
  Globe2, LogOut, Trash2, Sparkles, Pencil, Check, X,
  AlertTriangle, Briefcase, Zap, BarChart3, Calculator,
  BookOpen, ArrowRight
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

const QUICK_ACTIONS = [
  { label: 'Find My Country', icon: Zap, href: '/wizard', accent: true },
  { label: 'Compare', icon: BarChart3, href: '/compare', accent: false },
  { label: 'Salary Calc', icon: Calculator, href: '/salary-calculator', accent: false },
  { label: 'Guides', icon: BookOpen, href: '/guides', accent: false },
  { label: 'Globe', icon: Globe2, href: '/', accent: false },
]

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [savedCountries, setSavedCountries] = useState<SavedCountry[]>([])
  const [wizardResult, setWizardResult] = useState<WizardResult | null>(null)
  const [editingName, setEditingName] = useState(false)
  const [nameValue, setNameValue] = useState('')
  const [nameSaving, setNameSaving] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  useEffect(() => {
    let mounted = true
    const timeout = setTimeout(() => {
      if (mounted) {
        setLoading(false)
        setLoadError(true)
      }
    }, 10000)

    async function loadData(userId: string) {
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

        if (!mounted) return
        setSavedCountries((savesRes.data as SavedCountry[]) ?? [])
        setWizardResult(wizardRes.data ?? null)
        setProfile(profileRes.data ?? null)

        if (profileRes.data && !profileRes.data.onboarded) {
          window.location.href = '/onboarding'
          return
        }
      } catch {
        if (mounted) setLoadError(true)
      }
      if (mounted) {
        clearTimeout(timeout)
        setLoading(false)
      }
    }

    async function initAuth() {
      await supabase.auth.refreshSession()
      const { data: { session } } = await supabase.auth.getSession()
      if (!mounted) return
      
      if (session?.user) {
        const u = session.user
        setUser(u)
        setNameValue(u.user_metadata?.full_name ?? '')
        await loadData(u.id)
      } else {
        if (mounted) {
          clearTimeout(timeout)
          router.push('/signin')
        }
      }
    }

    initAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return
      if (session?.user && !user) {
        const u = session.user
        setUser(u)
        setNameValue(u.user_metadata?.full_name ?? '')
        await loadData(u.id)
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
      clearTimeout(timeout)
    }
  }, [router, user])

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

  const deleteAccount = async () => {
    if (!user) return
    setDeleteLoading(true)
    setDeleteError('')
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { setDeleteError('Session expired. Please sign in again.'); setDeleteLoading(false); return }
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

      <div className="border-b border-border bg-bg-surface">
        <div className="max-w-4xl mx-auto px-6 pt-24 pb-8">
          <div className="flex items-start gap-5">
            {user.user_metadata?.avatar_url ? (
              <img src={user.user_metadata.avatar_url} alt="avatar"
                className="w-20 h-20 rounded-2xl border border-border flex-shrink-0"
                referrerPolicy="no-referrer" />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center text-3xl font-bold text-accent flex-shrink-0">
                {(user.user_metadata?.full_name ?? user.email ?? 'U')[0].toUpperCase()}
              </div>
            )}

            <div className="flex-1 min-w-0">
              {editingName ? (
                <div className="flex items-center gap-2 mb-2">
                  <input value={nameValue} onChange={e => setNameValue(e.target.value)} autoFocus
                    onKeyDown={e => { if (e.key === 'Enter') saveName(); if (e.key === 'Escape') setEditingName(false) }}
                    className="font-heading text-2xl font-extrabold bg-bg-elevated border border-accent/40 rounded-lg px-3 py-1 text-text-primary focus:outline-none" />
                  <button onClick={saveName} disabled={nameSaving} className="p-1.5 rounded-lg bg-accent/10 text-accent">
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
                    <Sparkles className="w-3 h-3" /> Origio Pro
                  </span>
                )}
                {passportData && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-bg-elevated border border-border text-text-muted text-xs">
                    {passportData.flag} {passportData.name}
                  </span>
                )}
                {profile?.job_title && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-bg-elevated border border-border text-text-muted text-xs">
                    <Briefcase className="w-3 h-3" /> {profile.job_title}
                  </span>
                )}
              </div>
            </div>

            <button onClick={signOut}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border text-xs text-text-muted hover:text-text-primary transition-colors flex-shrink-0">
              <LogOut className="w-3.5 h-3.5" /> Sign out
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">

        <div className="grid grid-cols-5 gap-2">
          {QUICK_ACTIONS.map(action => {
            const Icon = action.icon
            return (
              <a key={action.label} href={action.href}
                className={`flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all text-center ${
                  action.accent
                    ? 'bg-accent/10 border-accent/30 hover:bg-accent/20 text-accent'
                    : 'bg-bg-elevated border-border hover:border-accent/20 text-text-muted hover:text-text-primary'
                }`}>
                <Icon className="w-5 h-5" />
                <span className="text-xs font-medium">{action.label}</span>
              </a>
            )
          })}
        </div>

        {!isPro && (
          <div className="glass-panel rounded-2xl p-5 border border-accent/20 flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="text-sm font-bold text-text-primary">Upgrade to Origio Pro</p>
                <p className="text-xs text-text-muted">Unlimited matches · All 25 countries · Full deep-dives</p>
              </div>
            </div>
            <a href="/pro" className="cta-button px-5 py-2.5 rounded-xl text-sm flex items-center gap-2 flex-shrink-0">
              <Zap className="w-4 h-4" /> €5 one-time
            </a>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6">

          <div className="glass-panel rounded-2xl border border-border overflow-hidden">
            <div className="flex items-center justify-between px-5 pt-5 pb-3">
              <h2 className="font-heading text-base font-bold text-text-primary">Your Top Match</h2>
              <a href="/wizard" className="text-xs text-accent hover:underline flex items-center gap-1">
                Retake <ArrowRight className="w-3 h-3" />
              </a>
            </div>

            {!wizardResult ? (
              <div className="text-center py-10 px-5">
                <div className="text-5xl mb-3">🌍</div>
                <p className="text-sm text-text-muted mb-4">No results yet</p>
                <a href="/wizard" className="cta-button px-5 py-2.5 rounded-xl text-sm inline-flex items-center gap-2">
                  <Zap className="w-4 h-4" /> Find My Country
                </a>
              </div>
            ) : (
              <div>
                <div className="px-5 pb-4">
                  <div className="rounded-2xl p-5 text-center"
                    style={{ background: `linear-gradient(135deg, ${MATCH_COLORS[0]}15, ${MATCH_COLORS[0]}05)`, border: `1px solid ${MATCH_COLORS[0]}30` }}>
                    <div className="text-5xl mb-2">{topMatch?.flagEmoji}</div>
                    <p className="font-heading text-xl font-extrabold text-text-primary">{topMatch?.name}</p>
                    <p className="font-heading text-3xl font-extrabold mt-1" style={{ color: MATCH_COLORS[0] }}>
                      {capPercent(topMatch?.matchPercent ?? 0)}%
                    </p>
                    <p className="text-xs text-text-muted">match</p>
                  </div>
                </div>

                <div className="border-t border-border">
                  {wizardResult.top_countries.slice(1).map((c, i) => (
                    <div key={c.slug} className="flex items-center gap-3 px-5 py-3 border-b border-border last:border-0">
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full text-center min-w-[28px]"
                        style={{ color: MATCH_COLORS[i + 1], background: MATCH_COLORS[i + 1] + '20' }}>
                        {MATCH_LABELS[i + 1]}
                      </span>
                      <span className="text-lg">{c.flagEmoji}</span>
                      <span className="text-sm font-medium text-text-primary flex-1">{c.name}</span>
                      <span className="text-xs font-semibold" style={{ color: MATCH_COLORS[i + 1] }}>
                        {capPercent(c.matchPercent)}%
                      </span>
                    </div>
                  ))}
                </div>

                <div className="px-5 py-3 border-t border-border">
                  <p className="text-xs text-text-muted">
                    {wizardResult.answers?.role ? formatRole(wizardResult.answers.role) : 'Unknown role'} · {formatDate(wizardResult.created_at)}
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="glass-panel rounded-2xl border border-border overflow-hidden">
            <div className="flex items-center justify-between px-5 pt-5 pb-3">
              <h2 className="font-heading text-base font-bold text-text-primary">
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
                <div className="text-5xl mb-3">📌</div>
                <p className="text-sm text-text-muted mb-4">No saved countries yet</p>
                <a href="/" className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border text-sm text-text-muted hover:text-text-primary transition-colors mx-auto w-fit">
                  <Globe2 className="w-4 h-4" /> Explore the Globe
                </a>
              </div>
            ) : (
              <div>
                {savedCountries.slice(0, 6).map(s => {
                  const info = getCountryInfo(s.countries)
                  return (
                    <div key={s.id} className="flex items-center gap-3 px-5 py-3 border-b border-border last:border-0 group">
                      <span className="text-xl flex-shrink-0">{info?.flag_emoji ?? '🌍'}</span>
                      <a href={`/country/${s.country_slug}`}
                        className="text-sm font-medium text-text-primary hover:text-accent transition-colors flex-1 truncate">
                        {info?.name ?? formatSlug(s.country_slug)}
                      </a>
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <a href={`/country/${s.country_slug}`} className="text-xs text-accent hover:underline">View</a>
                        <button onClick={() => removeSave(s.id)}
                          className="text-xs text-text-muted hover:text-rose-400 transition-colors">
                          Remove
                        </button>
                      </div>
                    </div>
                  )
                })}
                {savedCountries.length > 6 && (
                  <div className="px-5 py-3 text-xs text-text-muted">
                    +{savedCountries.length - 6} more saved
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-5 border border-border">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <p className="text-sm font-semibold text-text-primary">Account settings</p>
              <p className="text-xs text-text-muted">{user.email}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={signOut}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border text-xs text-text-muted hover:text-text-primary transition-colors">
                <LogOut className="w-3.5 h-3.5" /> Sign out
              </button>
              <button onClick={() => { setShowDeleteConfirm(true); setDeleteError('') }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-rose-500/20 text-xs text-rose-400 hover:bg-rose-500/5 transition-colors">
                <Trash2 className="w-3.5 h-3.5" /> Delete account
              </button>
            </div>
          </div>
        </div>

      </div>

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