'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/useAuth'
import Nav from '@/components/Nav'
import {
  Globe2, LogOut, Trash2, Sparkles, Pencil,
  AlertTriangle, Briefcase, Zap, ArrowRight, Search, Check, X, Lock, KeyRound
} from 'lucide-react'

type SavedCountry = {
  id: string
  country_slug: string
  created_at: string
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
function capPercent(n: number) { return Math.min(n, 99) }
function formatRole(r: string) {
  return r.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase()).trim()
}
function formatSlug(slug: string) {
  return slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}
function matchPercentColor(pct: number): string {
  if (pct >= 90) return '#4ade80'
  if (pct >= 75) return '#facc15'
  return '#888880'
}

const MATCH_LABELS = ['Best Match', '2nd', '3rd']

export default function ProfilePage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [savedCountries, setSavedCountries] = useState<SavedCountry[]>([])
  const [wizardResult, setWizardResult] = useState<WizardResult | null>(null)
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
  const [deleteConfirmText, setDeleteConfirmText] = useState('')
  const [setPasswordSent, setSetPasswordSent] = useState(false)
  const [setPasswordLoading, setSetPasswordLoading] = useState(false)

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
            .select('id, country_slug, created_at')
            .eq('user_id', userId)
            .order('created_at', { ascending: false }),
          supabase.from('wizard_results')
            .select('top_countries, answers, created_at')
            .eq('user_id', userId)
            .maybeSingle(),
          supabase.from('profiles')
            .select('passport_slug, job_title, onboarded, is_pro')
            .eq('id', userId)
            .maybeSingle(),
        ])
        if (savesRes.error) console.error('saved_countries error:', savesRes.error)
        setSavedCountries((savesRes.data as SavedCountry[]) ?? [])
        setWizardResult(wizardRes.data ?? null)
        const p = profileRes.data ?? null
        setProfile(p)
        if (p) { setEditJobTitle(p.job_title ?? ''); setEditPassport(p.passport_slug) }
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
    if (!user) { setSaveError('Not logged in'); return }
    if (editName.trim().length > 100) { setSaveError('Name too long (max 100 chars)'); return }
    if (editJobTitle.trim().length > 80) { setSaveError('Job title too long (max 80 chars)'); return }
    if (editPassport && !PASSPORT_FLAGS[editPassport]) { setSaveError('Invalid passport selection'); return }
    setSaving(true); setSaveError('')
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('No session')
      const { error: profileError } = await supabase.from('profiles')
        .update({ job_title: editJobTitle.trim() || null, passport_slug: editPassport })
        .eq('id', user.id)
      if (profileError) throw profileError
      if (editName.trim()) {
        try {
          await Promise.race([
            supabase.auth.updateUser({ data: { full_name: editName.trim() } }),
            new Promise((_, r) => setTimeout(() => r(new Error('timeout')), 3000))
          ])
        } catch (e) { console.error('Name update failed:', e) }
      }
      setDisplayName(editName.trim() || displayName)
      setProfile(prev => prev ? { ...prev, job_title: editJobTitle.trim() || null, passport_slug: editPassport } : prev)
      setEditing(false)
    } catch (err: any) {
      setSaveError(err?.message || 'Failed to save. Please try again.')
    } finally { setSaving(false) }
  }

  const removeSave = async (id: string) => {
    if (!user) return
    await supabase.from('saved_countries').delete().eq('id', id).eq('user_id', user.id)
    setSavedCountries(prev => prev.filter(s => s.id !== id))
  }

  const signOut = async () => { await supabase.auth.signOut(); window.location.href = '/' }

  const deleteAccount = async () => {
    if (!user) return
    setDeleteLoading(true); setDeleteError('')
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
        setDeleteLoading(false); return
      }
      await supabase.auth.signOut()
      window.location.href = '/'
    } catch {
      setDeleteError('Network error. Please try again.')
      setDeleteLoading(false)
    }
  }

  // Send password setup link for Google OAuth users
  const handleSetPassword = async () => {
    if (!user?.email) return
    setSetPasswordLoading(true)
    const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
      redirectTo: `${window.location.origin}/auth/reset`,
    })
    setSetPasswordLoading(false)
    if (!error) setSetPasswordSent(true)
  }

  // Detect if user signed in with Google (no password identity)
  const isGoogleUser = user?.app_metadata?.provider === 'google' ||
    (user?.identities ?? []).every((id: any) => id.provider === 'google')

  const passportData = profile?.passport_slug ? PASSPORT_FLAGS[profile.passport_slug] : null
  const isPro = profile?.is_pro ?? false
  const topMatch = wizardResult?.top_countries?.[0]
  const memberSince = user?.created_at ? formatDate(user.created_at) : null
  const filteredPassports = PASSPORT_LIST.filter(p =>
    p.name.toLowerCase().includes(passportSearch.toLowerCase())
  )

  if (loading || authLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
      <div className="w-8 h-8 border-2 border-[#2a2a2a] border-t-accent animate-spin" />
    </div>
  )

  if (loadError) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0a0a] gap-4">
      <p className="text-text-muted text-sm font-medium">Something went wrong loading your profile.</p>
      <button onClick={() => window.location.reload()}
        className="ghost-button px-4 py-2 text-sm font-bold uppercase tracking-wide">
        Try again
      </button>
    </div>
  )

  if (!user) return null

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-text-primary">
      <Nav countries={[]} onCountrySelect={() => {}} />

      {/* Header */}
      <div className="border-b-2 border-[#2a2a2a] bg-[#0f0f0f]">
        <div className="max-w-5xl mx-auto px-6 pt-20 pb-8">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-4">
              {user.user_metadata?.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={user.user_metadata.avatar_url} alt="avatar"
                  className="w-14 h-14 border-2 border-[#2a2a2a] object-cover flex-shrink-0" />
              ) : (
                <div className="w-14 h-14 border-2 border-accent flex items-center justify-center flex-shrink-0 bg-accent/10">
                  <span className="font-heading text-xl font-extrabold text-accent">
                    {(displayName?.[0] ?? user.email?.[0] ?? '?').toUpperCase()}
                  </span>
                </div>
              )}
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="font-heading text-2xl font-extrabold uppercase tracking-tight">{displayName}</h1>
                  {isPro && (
                    <span className="border-2 border-accent text-accent text-[10px] font-bold px-2 py-0.5 uppercase tracking-widest flex items-center gap-1">
                      <Sparkles className="w-2.5 h-2.5" /> Pro
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 mt-1 text-xs font-bold text-text-muted uppercase tracking-wide flex-wrap">
                  {profile?.job_title && <span className="flex items-center gap-1"><Briefcase className="w-3 h-3" />{profile.job_title}</span>}
                  {passportData && <span>{passportData.flag} {passportData.name}</span>}
                  {memberSince && <span>Since {memberSince}</span>}
                </div>
              </div>
            </div>
            <button onClick={openEdit}
              className="ghost-button flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wide">
              <Pencil className="w-3.5 h-3.5" /> Edit Profile
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">

        {!isPro && (
          <div className="border-2 border-accent p-5 flex items-center justify-between gap-4 flex-wrap"
            style={{ boxShadow: '4px 4px 0 #00ffd5' }}>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 border-2 border-accent flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-4 h-4 text-accent" />
              </div>
              <div>
                <p className="text-sm font-bold text-text-primary uppercase tracking-tight">Upgrade to Origio Pro</p>
                <p className="text-xs text-text-muted">Unlimited matches · Full rankings · All 25 countries · €19.99 one-time</p>
              </div>
            </div>
            <a href="/pro" className="cta-button px-5 py-2.5 text-xs font-bold uppercase tracking-wide inline-flex items-center gap-2 flex-shrink-0">
              <Zap className="w-3.5 h-3.5" /> Get Pro
            </a>
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-6">

          {/* Wizard result */}
          <div className="border-2 border-[#2a2a2a] overflow-hidden bg-[#111111]">
            <div className="flex items-center justify-between px-5 py-4 border-b-2 border-[#2a2a2a]">
              <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Your Country Matches</p>
              <a href="/wizard" className="text-xs font-bold text-accent hover:opacity-80 transition-opacity uppercase tracking-wide flex items-center gap-1">
                Retake <ArrowRight className="w-3 h-3" />
              </a>
            </div>

            {!wizardResult ? (
              <div className="text-center py-10 px-5">
                <div className="text-4xl mb-3">🧭</div>
                <p className="text-sm font-bold text-text-muted mb-4">No results yet</p>
                <a href="/wizard" className="cta-button px-5 py-2.5 text-xs font-bold uppercase tracking-wide inline-flex">
                  Find My Country
                </a>
              </div>
            ) : (
              <>
                {topMatch && (
                  <div className="px-5 py-4 border-b-2 border-[#2a2a2a] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{topMatch.flagEmoji}</span>
                      <div>
                        <p className="font-heading font-extrabold text-text-primary uppercase tracking-tight">{topMatch.name}</p>
                        <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: matchPercentColor(capPercent(topMatch.matchPercent ?? 0)) }}>Best Match</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-heading text-2xl font-extrabold" style={{ color: matchPercentColor(capPercent(topMatch.matchPercent ?? 0)) }}>
                        {capPercent(topMatch.matchPercent ?? 0)}%
                      </p>
                      <p className="text-[10px] font-bold text-text-muted uppercase">match</p>
                    </div>
                  </div>
                )}
                {wizardResult.top_countries.slice(1).map((c, i) => {
                  const pctColor = matchPercentColor(capPercent(c.matchPercent))
                  return (
                    <div key={c.slug} className="flex items-center gap-3 px-5 py-3 border-b border-[#1a1a1a] last:border-0">
                      <span className="border px-1.5 py-0.5 text-[10px] font-bold uppercase"
                        style={{ borderColor: pctColor, color: pctColor }}>
                        {MATCH_LABELS[i + 1]}
                      </span>
                      <span className="text-lg">{c.flagEmoji}</span>
                      <span className="text-sm font-medium text-text-primary flex-1">{c.name}</span>
                      <span className="text-xs font-bold" style={{ color: pctColor }}>{capPercent(c.matchPercent)}%</span>
                    </div>
                  )
                })}
                <div className="px-5 py-2.5 border-t-2 border-[#2a2a2a]">
                  <p className="text-[10px] font-bold text-text-muted uppercase tracking-wide">
                    {wizardResult.answers?.role ? formatRole(wizardResult.answers.role) : 'Unknown'} · {formatDate(wizardResult.created_at)}
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Saved countries */}
          <div className="border-2 border-[#2a2a2a] overflow-hidden bg-[#111111]">
            <div className="flex items-center justify-between px-5 py-4 border-b-2 border-[#2a2a2a]">
              <div className="flex items-center gap-2">
                <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Saved Countries</p>
                {savedCountries.length > 0 && (
                  <span className="border-2 border-accent text-accent text-[10px] font-bold px-1.5 py-0.5">
                    {savedCountries.length}
                  </span>
                )}
              </div>
              <a href="/" className="text-xs font-bold text-accent hover:opacity-80 transition-opacity uppercase tracking-wide flex items-center gap-1">
                Explore <ArrowRight className="w-3 h-3" />
              </a>
            </div>

            {savedCountries.length === 0 ? (
              <div className="text-center py-10 px-5">
                <div className="text-4xl mb-3">📌</div>
                <p className="text-sm font-bold text-text-muted mb-3">No saved countries yet</p>
                <a href="/" className="text-xs font-bold text-accent hover:opacity-80 transition-opacity uppercase tracking-wide">Start exploring →</a>
              </div>
            ) : (
              <div>
                {savedCountries.slice(0, 6).map(s => {
                  const countryData = PASSPORT_FLAGS[s.country_slug]
                  return (
                    <div key={s.id} className="flex items-center gap-3 px-5 py-3 border-b border-[#1a1a1a] last:border-0 group">
                      <span className="text-lg flex-shrink-0">{countryData?.flag ?? '🌍'}</span>
                      <a href={`/country/${s.country_slug}`}
                        className="text-sm font-medium text-text-primary hover:text-accent transition-colors flex-1 truncate uppercase tracking-tight">
                        {countryData?.name ?? formatSlug(s.country_slug)}
                      </a>
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <a href={`/country/${s.country_slug}`} className="text-xs font-bold text-accent hover:opacity-80 uppercase">View</a>
                        <button onClick={() => removeSave(s.id)} className="text-xs font-bold text-text-muted hover:text-rose-400 transition-colors uppercase">Remove</button>
                      </div>
                    </div>
                  )
                })}
                {savedCountries.length > 6 && (
                  <div className="px-5 py-3 text-xs font-bold text-text-muted uppercase tracking-wide">
                    +{savedCountries.length - 6} more saved
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Sign-in method — shown for Google OAuth users */}
        {isGoogleUser && (
          <div className="border-2 border-[#2a2a2a] bg-[#111111]">
            <div className="flex items-center justify-between px-5 py-4 border-b-2 border-[#2a2a2a]">
              <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Sign-in Method</p>
            </div>
            <div className="px-5 py-4 flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                {/* Google icon */}
                <div className="w-8 h-8 border-2 border-[#2a2a2a] flex items-center justify-center flex-shrink-0 bg-[#1a1a1a]">
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-bold text-text-primary uppercase tracking-tight">Google</p>
                  <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Connected</p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                {setPasswordSent ? (
                  <p className="text-xs font-bold text-accent uppercase tracking-wide flex items-center gap-1.5">
                    <Check className="w-3 h-3" /> Check your email
                  </p>
                ) : (
                  <button
                    onClick={handleSetPassword}
                    disabled={setPasswordLoading}
                    className="ghost-button flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase tracking-wide disabled:opacity-50"
                  >
                    <KeyRound className="w-3 h-3" />
                    {setPasswordLoading ? 'Sending...' : 'Set a password'}
                  </button>
                )}
                <p className="text-[10px] text-text-muted">Also sign in with email + password</p>
              </div>
            </div>
          </div>
        )}

        {/* Account row */}
        <div className="border-2 border-[#2a2a2a] flex flex-wrap items-center justify-between gap-3 px-5 py-4">
          <p className="text-xs font-bold text-text-muted">{user.email}</p>
          <div className="flex gap-2 flex-wrap">
            {/* Only show reset password for non-Google users */}
            {!isGoogleUser && (
              <a href="/auth/forgot-password"
                className="ghost-button flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase tracking-wide">
                <Lock className="w-3 h-3" /> Reset password
              </a>
            )}
            <button onClick={signOut}
              className="ghost-button flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase tracking-wide">
              <LogOut className="w-3 h-3" /> Sign out
            </button>
            <button onClick={() => { setShowDeleteConfirm(true); setDeleteError(''); setDeleteConfirmText('') }}
              className="flex items-center gap-1.5 px-3 py-1.5 border-2 border-rose-500/30 text-xs font-bold text-rose-400 hover:border-rose-500/60 transition-colors uppercase tracking-wide">
              <Trash2 className="w-3 h-3" /> Delete account
            </button>
          </div>
        </div>

      </div>

      {/* Edit modal */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
          <div className="bg-[#111111] border-2 border-[#f0f0e8] p-6 w-full max-w-md" style={{ boxShadow: '6px 6px 0 #f0f0e8' }}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-heading text-lg font-extrabold uppercase tracking-tight">Edit Profile</h3>
              <button onClick={() => setEditing(false)} className="p-1.5 border-2 border-[#2a2a2a] hover:border-text-primary transition-colors">
                <X className="w-4 h-4 text-text-muted" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1.5 block">Display name</label>
                <input value={editName} onChange={e => setEditName(e.target.value)}
                  className="w-full px-3 py-2.5 bg-[#1a1a1a] border-2 border-[#2a2a2a] focus:border-accent text-text-primary text-sm font-medium outline-none transition-colors" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1.5 block">Job title</label>
                <input value={editJobTitle} onChange={e => setEditJobTitle(e.target.value)}
                  placeholder="e.g. Software Engineer, Nurse, Student..."
                  className="w-full px-3 py-2.5 bg-[#1a1a1a] border-2 border-[#2a2a2a] focus:border-accent text-text-primary text-sm font-medium placeholder:text-text-muted outline-none transition-colors" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1.5 block">Passport</label>
                {editPassport && (
                  <div className="flex items-center justify-between mb-2 px-3 py-2 border-2 border-accent bg-accent/5">
                    <span className="text-sm font-bold text-text-primary">
                      {PASSPORT_FLAGS[editPassport]?.flag} {PASSPORT_FLAGS[editPassport]?.name}
                    </span>
                    <button onClick={() => setEditPassport(null)} className="text-xs font-bold text-text-muted hover:text-rose-400 transition-colors uppercase">Clear</button>
                  </div>
                )}
                <div className="relative mb-2">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
                  <input placeholder="Search passport..." value={passportSearch}
                    onChange={e => setPassportSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-[#1a1a1a] border-2 border-[#2a2a2a] focus:border-accent text-sm text-text-primary placeholder:text-text-muted outline-none transition-colors" />
                </div>
                <div className="max-h-36 overflow-y-auto border-2 border-[#2a2a2a]">
                  {filteredPassports.slice(0, 20).map(p => (
                    <button key={p.slug} onClick={() => { setEditPassport(p.slug); setPassportSearch('') }}
                      className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left transition-colors border-b border-[#1a1a1a] last:border-0 ${
                        editPassport === p.slug ? 'bg-accent/10 text-text-primary' : 'hover:bg-[#1a1a1a] text-text-muted hover:text-text-primary'
                      }`}>
                      <span>{p.flag}</span>
                      <span className="flex-1 font-medium">{p.name}</span>
                      {editPassport === p.slug && <Check className="w-3.5 h-3.5 text-accent" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {saveError && <p className="text-xs font-bold text-rose-400 mt-3">{saveError}</p>}

            <div className="flex gap-3 mt-5">
              <button onClick={() => setEditing(false)} disabled={saving}
                className="ghost-button flex-1 py-2.5 text-sm font-bold uppercase tracking-wide disabled:opacity-50">
                Cancel
              </button>
              <button onClick={saveEdit} disabled={saving}
                className="cta-button flex-1 py-2.5 text-sm font-bold uppercase tracking-wide disabled:opacity-50 disabled:transform-none disabled:shadow-none">
                {saving ? 'Saving...' : 'Save changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
          <div className="bg-[#111111] border-2 border-rose-500/40 p-6 max-w-sm w-full" style={{ boxShadow: '6px 6px 0 rgba(239,68,68,0.3)' }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 border-2 border-rose-500/40 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
              </div>
              <div>
                <h3 className="font-heading text-base font-extrabold uppercase tracking-tight">Delete account?</h3>
                <p className="text-[10px] font-bold text-text-muted uppercase tracking-wide">This cannot be undone</p>
              </div>
            </div>
            <p className="text-sm text-text-muted mb-4 leading-relaxed">
              All your saved countries, country matches, and profile data will be permanently deleted.
            </p>
            {deleteError && <p className="text-xs font-bold text-rose-400 mb-4">{deleteError}</p>}
            <div className="mb-4">
              <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1.5 block">
                Type <span className="text-rose-400 font-extrabold">DELETE</span> to confirm
              </label>
              <input
                value={deleteConfirmText}
                onChange={e => setDeleteConfirmText(e.target.value)}
                placeholder="DELETE"
                className="w-full px-3 py-2.5 bg-[#1a1a1a] border-2 border-[#2a2a2a] focus:border-rose-500/60 text-text-primary text-sm font-medium outline-none transition-colors"
              />
            </div>
            <div className="flex gap-3">
              <button onClick={() => { setShowDeleteConfirm(false); setDeleteConfirmText('') }} disabled={deleteLoading}
                className="ghost-button flex-1 py-2.5 text-sm font-bold uppercase tracking-wide disabled:opacity-50">
                Cancel
              </button>
              <button onClick={deleteAccount} disabled={deleteLoading || deleteConfirmText !== 'DELETE'}
                className="flex-1 py-2.5 border-2 border-rose-500/40 bg-rose-500/10 hover:bg-rose-500/20 text-sm font-bold text-rose-400 transition-colors disabled:opacity-50 uppercase tracking-wide">
                {deleteLoading ? 'Deleting...' : 'Yes, delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}