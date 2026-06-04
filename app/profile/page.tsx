'use client'
import Footer from '@/components/Footer'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/useAuth'
import { getPassportStrength, resolveEffectivePassports } from '@/lib/wizard'
import Nav from '@/components/Nav'
import {
  LogOut, Trash2, Sparkles, Pencil,
  AlertTriangle, Briefcase, Zap, ArrowRight, Search, Check, X, Lock, KeyRound
} from 'lucide-react'
import { FlagIcon } from '@/components/FlagIcon'
import { slugToIso } from '@/lib/flagCodes'

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
  second_passport_slug: string | null
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
function formatDateShort(d: string) {
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}
function capPercent(n: number) { return Math.min(n, 99) }
function formatRole(r: string) {
  return r.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase()).trim()
}
function formatSlug(slug: string) {
  return slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

const MATCH_LABELS = ['Best Match', '2nd', '3rd', '4th', '5th']

export default function ProfilePage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [savedCountries, setSavedCountries] = useState<SavedCountry[]>([])
  const [wizardResults, setWizardResults] = useState<WizardResult[] | null>(null)
  const [displayName, setDisplayName] = useState('')
  const [editing, setEditing] = useState(false)
  const [editName, setEditName] = useState('')
  const [editJobTitle, setEditJobTitle] = useState('')
  const [editPassport, setEditPassport] = useState<string | null>(null)
  const [editSecondPassport, setEditSecondPassport] = useState<string | null>(null)
  const [secondPassportSearch, setSecondPassportSearch] = useState('')
  const [showSecondPassportEdit, setShowSecondPassportEdit] = useState(false)
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

    // Reset error state in case a previous render saw user=null transiently
    setLoadError(false)
    setLoading(true)

    const userId = user.id
    const initialName = user.user_metadata?.full_name ?? user.email?.split('@')[0] ?? ''
    setDisplayName(initialName)
    setEditName(initialName)

    async function loadData() {
      try {
        const dataPromise = Promise.all([
          supabase.from('saved_countries')
            .select('id, country_slug, created_at')
            .eq('user_id', userId)
            .order('created_at', { ascending: false }),
          supabase.from('wizard_results')
            .select('top_countries, answers, created_at')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(3),
          supabase.from('profiles')
            .select('passport_slug, second_passport_slug, job_title, onboarded, is_pro')
            .eq('id', userId)
            .maybeSingle(),
        ])
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('timeout')), 10_000)
        )
        const [savesRes, wizardRes, profileRes] = await Promise.race([dataPromise, timeoutPromise])
        if (savesRes.error) console.error('saved_countries error:', savesRes.error)
        setSavedCountries((savesRes.data as SavedCountry[]) ?? [])
        setWizardResults((wizardRes.data as WizardResult[]) ?? null)
        const p = profileRes.data ?? null
        setProfile(p)
        if (p) {
          setEditJobTitle(p.job_title ?? '')
          setEditPassport(p.passport_slug)
          setEditSecondPassport(p.second_passport_slug)
          setShowSecondPassportEdit(!!p.second_passport_slug)
        }
        if (p && !p.onboarded) { setLoading(false); router.push('/onboarding'); return }
      } catch { setLoadError(true) }
      setLoading(false)
    }
    loadData()
  // router from useRouter is stable — safe to omit from deps
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading])

  const openEdit = () => {
    setEditName(displayName)
    setEditJobTitle(profile?.job_title ?? '')
    setEditPassport(profile?.passport_slug ?? null)
    setEditSecondPassport(profile?.second_passport_slug ?? null)
    setShowSecondPassportEdit(!!profile?.second_passport_slug)
    setPassportSearch('')
    setSecondPassportSearch('')
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
        .update({ job_title: editJobTitle.trim() || null, passport_slug: editPassport, second_passport_slug: editSecondPassport })
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
      setProfile(prev => prev ? { ...prev, job_title: editJobTitle.trim() || null, passport_slug: editPassport, second_passport_slug: editSecondPassport } : prev)
      setEditing(false)
    } catch (err: any) {
      setSaveError(err?.message || 'Failed to save. Please try again.')
    } finally { setSaving(false) }
  }

  const removeSave = async (id: string) => {
    if (!user) return
    const snapshot = savedCountries
    setSavedCountries(prev => prev.filter(s => s.id !== id))
    const { error } = await supabase.from('saved_countries').delete().eq('id', id).eq('user_id', user.id)
    if (error) setSavedCountries(snapshot)
  }

  const signOut = async () => { await supabase.auth.signOut(); router.push('/') }

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
      router.push('/')
    } catch {
      setDeleteError('Network error. Please try again.')
      setDeleteLoading(false)
    }
  }

  const handleSetPassword = async () => {
    if (!user?.email) return
    setSetPasswordLoading(true)
    const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
      redirectTo: `${window.location.origin}/auth/reset`,
    })
    setSetPasswordLoading(false)
    if (!error) setSetPasswordSent(true)
  }

  const isGoogleUser = user?.app_metadata?.provider === 'google' ||
    (user?.identities ?? []).every((id: any) => id.provider === 'google')

  const NO_DUAL_CITIZENSHIP: Record<string, string> = {
    'india': 'India does not recognise dual citizenship. If you hold another passport, you are no longer an Indian citizen — you may hold OCI (Overseas Citizen of India) instead.',
    'china': 'China does not recognise dual citizenship. Naturalising elsewhere means renouncing Chinese citizenship.',
    'japan': 'Japan requires citizens to choose one nationality by age 22. Holding another passport means you have renounced Japanese citizenship.',
    'singapore': 'Singapore does not allow dual citizenship. Acquiring another nationality automatically terminates Singapore citizenship.',
    'uae': 'The UAE does not permit dual citizenship for its nationals. Naturalisation elsewhere requires renouncing UAE citizenship.',
    'indonesia': 'Indonesia does not permit dual citizenship for adults. A second passport means Indonesian citizenship has been relinquished.',
    'malaysia': 'Malaysia does not allow dual citizenship. Acquiring another nationality results in automatic loss of Malaysian citizenship.',
    'south-korea': 'South Korea generally does not permit dual citizenship for adults.',
  }

  const EU_PASSPORT_SLUGS = new Set(["ireland","germany","france","netherlands","spain","portugal","sweden","norway","switzerland","austria","belgium","denmark","finland","italy","poland","romania"])
  const EU_COUNTRY_SLUGS  = new Set(["germany","netherlands","portugal","spain","ireland","france","italy","united-kingdom","sweden","switzerland","norway","austria","finland","belgium","denmark","poland"])
  const savedPassportCtx = (() => {
    if (!profile?.passport_slug) return null
    const { primary, secondary } = resolveEffectivePassports(profile.passport_slug, profile.second_passport_slug ?? undefined)
    const tier = Math.min(getPassportStrength(primary), secondary ? getPassportStrength(secondary) : 4) as 1|2|3|4
    const isEU = EU_PASSPORT_SLUGS.has(primary) || (secondary ? EU_PASSPORT_SLUGS.has(secondary) : false)
    return { tier, isEU, hasDual: !!profile.second_passport_slug }
  })()
  const passportData = profile?.passport_slug ? PASSPORT_FLAGS[profile.passport_slug] : null
  const secondPassportData = profile?.second_passport_slug ? PASSPORT_FLAGS[profile.second_passport_slug] : null
  const filteredSecondPassports = PASSPORT_LIST.filter(p =>
    p.name.toLowerCase().includes(secondPassportSearch.toLowerCase()) && p.slug !== editPassport
  )
  const editDualConflict = editPassport && editSecondPassport
    ? (NO_DUAL_CITIZENSHIP[editPassport] ? { slug: editPassport, message: NO_DUAL_CITIZENSHIP[editPassport] }
      : NO_DUAL_CITIZENSHIP[editSecondPassport] ? { slug: editSecondPassport, message: NO_DUAL_CITIZENSHIP[editSecondPassport] }
      : null)
    : null
  const isPro = profile?.is_pro ?? false
  const wizardResult = wizardResults?.[0] ?? null
  const topMatch = wizardResult?.top_countries?.[0]
  const memberSince = user?.created_at ? formatDate(user.created_at) : null
  const filteredPassports = PASSPORT_LIST.filter(p =>
    p.name.toLowerCase().includes(passportSearch.toLowerCase())
  )

  if (loading || authLoading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#050508' }}>
      <div className="w-7 h-7 rounded-full border-2 border-white/10 border-t-white/60 animate-spin" />
    </div>
  )

  if (loadError) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ background: '#050508' }}>
      <p className="text-white/40 text-sm">Something went wrong loading your profile.</p>
      <button onClick={() => window.location.reload()}
        className="px-4 py-2 text-sm font-semibold text-white/70 border border-white/10 rounded-lg hover:border-white/20 hover:text-white transition-colors">
        Try again
      </button>
    </div>
  )

  if (!user) return null

  return (
    <div className="min-h-screen" style={{ background: '#050508', color: '#fff', fontFamily: 'Satoshi, sans-serif' }}>
      <Nav countries={[]} onCountrySelect={() => {}} />

      <div className="max-w-[1000px] mx-auto px-10 pt-28 pb-20" style={{ paddingLeft: 'clamp(20px, 4vw, 40px)', paddingRight: 'clamp(20px, 4vw, 40px)' }}>

        {/* ── PROFILE HEADER ── */}
        <div className="flex items-start justify-between gap-6 pb-10 mb-10 flex-wrap" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="flex items-center gap-6 flex-wrap">
            {/* Avatar */}
            {user.user_metadata?.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.user_metadata.avatar_url}
                alt="avatar"
                className="w-[72px] h-[72px] rounded-full object-cover flex-shrink-0"
                style={{ border: '1px solid rgba(255,255,255,0.14)' }}
              />
            ) : (
              <div
                className="w-[72px] h-[72px] rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.14)' }}
              >
                <span style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: 28, color: '#fff' }}>
                  {(displayName?.[0] ?? user.email?.[0] ?? '?').toUpperCase()}
                </span>
              </div>
            )}

            <div>
              {/* Name + Pro badge */}
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <span style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: 'clamp(24px, 5vw, 36px)', fontWeight: 400, lineHeight: 1, color: '#fff' }}>
                  {displayName}
                </span>
                {isPro && (
                  <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1"
                    style={{ background: '#fff', color: '#0a0a0a', fontSize: 10, fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase' }}>
                    <Sparkles className="w-2.5 h-2.5" /> Pro
                  </span>
                )}
              </div>
              {/* Meta row */}
              <div className="flex items-center gap-4 flex-wrap">
                {profile?.job_title && (
                  <span className="flex items-center gap-1.5" style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)' }}>
                    <Briefcase className="w-3 h-3" />{profile.job_title}
                  </span>
                )}
                {passportData && (
                  <>
                    <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'rgba(255,255,255,0.18)', display: 'inline-block' }} />
                    <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', display: 'flex', alignItems: 'center', gap: 5 }}>
                      {slugToIso(profile!.passport_slug!) ? <FlagIcon code={slugToIso(profile!.passport_slug!)!} size="sm" /> : <span>{passportData.flag}</span>} {passportData.name}
                      {secondPassportData && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>· {slugToIso(profile!.second_passport_slug!) ? <FlagIcon code={slugToIso(profile!.second_passport_slug!)!} size="sm" /> : <span>{secondPassportData.flag}</span>} {secondPassportData.name}</span>
                      )}
                    </span>
                  </>
                )}
                {memberSince && (
                  <>
                    <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'rgba(255,255,255,0.18)', display: 'inline-block' }} />
                    <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)' }}>Since {memberSince}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2.5 flex-wrap items-start">
            <button onClick={openEdit}
              className="inline-flex items-center gap-1.5 transition-all"
              style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.14)', borderRadius: 8, padding: '10px 18px', fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.7)', cursor: 'pointer', whiteSpace: 'nowrap' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.3)'; (e.currentTarget as HTMLElement).style.color = '#fff' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.14)'; (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.7)' }}>
              <Pencil className="w-3.5 h-3.5" /> Edit Profile
            </button>
            <button onClick={signOut}
              className="inline-flex items-center gap-1.5 transition-all"
              style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.14)', borderRadius: 8, padding: '10px 18px', fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.7)', cursor: 'pointer', whiteSpace: 'nowrap' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.3)'; (e.currentTarget as HTMLElement).style.color = '#fff' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.14)'; (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.7)' }}>
              <LogOut className="w-3.5 h-3.5" /> Sign Out
            </button>
          </div>
        </div>

        {/* ── PRO UPGRADE BANNER ── */}
        {!isPro && (
          <div className="flex items-center justify-between gap-5 flex-wrap mb-7"
            style={{ background: '#0d0d10', border: '1px solid rgba(255,255,255,0.14)', borderRadius: 14, padding: '20px 24px' }}>
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center flex-shrink-0"
                style={{ width: 42, height: 42, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10 }}>
                <Zap className="w-4 h-4 text-white/60" />
              </div>
              <div>
                <p style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: 20, color: '#fff', marginBottom: 3 }}>Upgrade to Origio Pro</p>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)' }}>Unlimited matches · Full rankings · All 37 countries · €4.99 one-time</p>
              </div>
            </div>
            <a href="/pro" style={{ fontSize: 13, fontWeight: 700, color: '#00ffd5', textDecoration: 'underline', textUnderlineOffset: 3, whiteSpace: 'nowrap' }}>
              Get Pro
            </a>
          </div>
        )}

        {/* ── CARDS GRID ── */}
        <div className="grid gap-5 mb-5" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>

          {/* Passport Card */}
          {profile?.passport_slug && (
            <div style={{ background: '#0d0d10', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, overflow: 'hidden' }}>
              <div className="flex items-center justify-between" style={{ padding: '18px 22px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)' }}>
                  Your Passports
                </span>
                <button onClick={openEdit} style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', background: 'none', border: 'none', cursor: 'pointer' }}>Edit</button>
              </div>
              <div style={{ padding: '16px 22px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                {/* Primary */}
                <div className="flex items-center gap-3" style={{ padding: '12px 14px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10 }}>
                  {slugToIso(profile.passport_slug) ? <FlagIcon code={slugToIso(profile.passport_slug)!} size="sm" /> : <span style={{ fontSize: 22 }}>{PASSPORT_FLAGS[profile.passport_slug]?.flag}</span>}
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: '#fff', marginBottom: 2 }}>{PASSPORT_FLAGS[profile.passport_slug]?.name}</p>
                    <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>Primary passport</p>
                  </div>
                  {savedPassportCtx && (
                    <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', padding: '3px 8px', background: savedPassportCtx.tier === 1 ? 'rgba(0,255,213,0.12)' : 'rgba(255,255,255,0.07)', color: savedPassportCtx.tier === 1 ? '#00ffd5' : 'rgba(255,255,255,0.45)', border: `1px solid ${savedPassportCtx.tier === 1 ? 'rgba(0,255,213,0.25)' : 'rgba(255,255,255,0.12)'}`, borderRadius: 6 }}>
                      T{getPassportStrength(profile.passport_slug)}
                    </span>
                  )}
                </div>
                {/* Second passport or add prompt */}
                {profile.second_passport_slug ? (
                  <div className="flex items-center gap-3" style={{ padding: '12px 14px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10 }}>
                    {slugToIso(profile.second_passport_slug!) ? <FlagIcon code={slugToIso(profile.second_passport_slug!)!} size="sm" /> : <span style={{ fontSize: 22 }}>{PASSPORT_FLAGS[profile.second_passport_slug]?.flag}</span>}
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: '#fff', marginBottom: 2 }}>{PASSPORT_FLAGS[profile.second_passport_slug]?.name}</p>
                      <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>Second passport</p>
                    </div>
                    {savedPassportCtx?.hasDual && savedPassportCtx.tier < getPassportStrength(profile.passport_slug) && (
                      <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', padding: '3px 8px', background: 'rgba(255,200,80,0.1)', color: 'rgba(255,200,80,0.8)', border: '1px solid rgba(255,200,80,0.2)', borderRadius: 6 }}>↑ upgrades</span>
                    )}
                  </div>
                ) : (
                  <button onClick={openEdit} style={{ width: '100%', padding: '12px 14px', background: 'transparent', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: 10, fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.3)', cursor: 'pointer', textAlign: 'left', letterSpacing: '0.04em' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.25)'; (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.6)' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.1)'; (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.3)' }}>
                    + Add second passport
                  </button>
                )}
              </div>
            </div>
          )}

          {wizardResult && (() => {
            const daysAgo = Math.floor((Date.now() - new Date(wizardResult.created_at).getTime()) / 86400000)
            return daysAgo > 30 ? (
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12,
                padding: '12px 16px', marginBottom: 16,
                borderLeft: '2px solid #facc15', background: 'rgba(250,204,21,0.04)',
              }}>
                <p style={{ fontFamily: "var(--font-body,'Satoshi',sans-serif)", fontSize: 13, color: '#facc15', margin: 0 }}>
                  Your results are {daysAgo} days old — priorities change.
                </p>
                <button onClick={() => router.push('/wizard')} style={{
                  fontFamily: "'Cabinet Grotesk','Satoshi',sans-serif", fontSize: 10, fontWeight: 700,
                  letterSpacing: '0.16em', textTransform: 'uppercase', color: '#facc15',
                  background: 'none', border: '1px solid #facc15', padding: '6px 14px', cursor: 'pointer',
                }}>
                  Retake →
                </button>
              </div>
            ) : null
          })()}

          {/* Country Matches */}
          <div style={{ background: '#0d0d10', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, overflow: 'hidden' }}>
            {/* Card head */}
            <div className="flex items-center justify-between" style={{ padding: '18px 22px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              <div className="flex items-center gap-3 flex-wrap">
                <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)' }}>
                  Your Country Matches
                </span>
                {wizardResult?.created_at && (
                  <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)', letterSpacing: '0.04em' }}>
                    Updated {Math.floor((Date.now() - new Date(wizardResult.created_at).getTime()) / 86400000)}d ago
                  </span>
                )}
              </div>
              <a href="/wizard" className="flex items-center gap-1.5 transition-colors"
                style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.45)', textDecoration: 'none', letterSpacing: '0.04em' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = '#fff'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.45)'}>
                Retake <ArrowRight className="w-3 h-3" />
              </a>
            </div>

            {!wizardResult ? (
              <div className="flex flex-col items-center justify-center text-center" style={{ padding: '48px 24px' }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>🧭</div>
                <p style={{ fontSize: 14, fontWeight: 500, color: 'rgba(255,255,255,0.35)', marginBottom: 14 }}>No results yet</p>
                <a href="/wizard"
                  style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.45)', textDecoration: 'none' }}>
                  Find My Country →
                </a>
              </div>
            ) : (
              <>
                {/* Best match */}
                {topMatch && (
                  <div className="flex items-center justify-between" style={{ padding: '22px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                    <div className="flex items-center gap-4">
                      {slugToIso(topMatch.slug) ? <FlagIcon code={slugToIso(topMatch.slug)!} size="lg" /> : <span style={{ fontSize: 40, lineHeight: 1 }}>{topMatch.flagEmoji}</span>}
                      <div>
                        <div style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: 24, color: '#fff', marginBottom: 2 }}>
                          {topMatch.name}
                        </div>
                        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)' }}>
                          Best Match
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: 42, color: '#fff', lineHeight: 1 }}>
                        {capPercent(topMatch.matchPercent ?? 0)}%
                      </div>
                      <div style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                        match
                      </div>
                    </div>
                  </div>
                )}

                {/* Other matches */}
                {wizardResult.top_countries.slice(1).map((c, i) => {
                  const pct = capPercent(c.matchPercent ?? 0)
                  return (
                    <div key={c.slug} className="flex items-center gap-3" style={{ padding: '13px 22px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.18)', width: 28, flexShrink: 0 }}>
                        {MATCH_LABELS[i + 1] ?? `${i + 2}th`}
                      </span>
                      {slugToIso(c.slug) ? <FlagIcon code={slugToIso(c.slug)!} size="sm" /> : <span style={{ fontSize: 20 }}>{c.flagEmoji}</span>}
                      <span style={{ fontSize: 14, fontWeight: 500, color: 'rgba(255,255,255,0.8)', flex: 1 }}>{c.name}</span>
                      {/* Progress bar */}
                      <div style={{ flex: '0 0 80px', height: 2, background: 'rgba(255,255,255,0.07)', borderRadius: 2 }}>
                        <div style={{ width: `${pct}%`, height: '100%', background: '#fff', borderRadius: 2 }} />
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.6)', minWidth: 34, textAlign: 'right' }}>{pct}%</span>
                    </div>
                  )
                })}

                {/* Actions row */}
                <div className="flex items-center justify-between flex-wrap gap-3" style={{ padding: '14px 22px', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                  <button
                    onClick={() => {
                      if (wizardResult?.answers) sessionStorage.setItem('wizardAnswers', JSON.stringify(wizardResult.answers))
                      router.push('/wizard')
                    }}
                    style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.35)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, letterSpacing: '0.04em' }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = '#fff'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.35)'}>
                    What if I changed my priorities? →
                  </button>
                  {wizardResult.top_countries.length >= 2 && (
                    <a href={`/compare?a=${wizardResult.top_countries[0].slug}&b=${wizardResult.top_countries[1].slug}`}
                      style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.35)', textDecoration: 'none', letterSpacing: '0.04em' }}
                      onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = '#00ffd5'}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.35)'}>
                      Compare top 2 →
                    </a>
                  )}
                </div>

                <div style={{ padding: '10px 22px', fontSize: 11, color: 'rgba(255,255,255,0.18)', letterSpacing: '0.04em', borderTop: '1px solid rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span>{wizardResult.answers?.role ? formatRole(wizardResult.answers.role) : 'Unknown'} · {formatDate(wizardResult.created_at)}</span>
                  {(wizardResults?.length ?? 0) > 1 && (
                    <span style={{ color: 'rgba(255,255,255,0.15)' }}>You&apos;ve run this {wizardResults!.length} times</span>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Saved Countries */}
          <div style={{ background: '#0d0d10', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, overflow: 'hidden' }}>
            <div className="flex items-center justify-between" style={{ padding: '18px 22px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              <div className="flex items-center gap-2">
                <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)' }}>
                  Saved Countries
                </span>
                {savedCountries.length > 0 && (
                  <span className="inline-flex items-center justify-center"
                    style={{ width: 18, height: 18, background: 'rgba(255,255,255,0.1)', borderRadius: '50%', fontSize: 10, fontWeight: 700, color: '#fff' }}>
                    {savedCountries.length}
                  </span>
                )}
              </div>
              <Link href="/" className="flex items-center gap-1.5 transition-colors"
                style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.45)', textDecoration: 'none', letterSpacing: '0.04em' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = '#fff'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.45)'}>
                Explore <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {savedCountries.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center" style={{ padding: '48px 24px' }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>📌</div>
                <p style={{ fontSize: 14, fontWeight: 500, color: 'rgba(255,255,255,0.35)', marginBottom: 14 }}>No saved countries yet</p>
                <Link href="/"
                  style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.45)', textDecoration: 'none' }}>
                  Start exploring →
                </Link>
              </div>
            ) : (
              <>
                {savedCountries.slice(0, 6).map(s => {
                  const countryData = PASSPORT_FLAGS[s.country_slug]
                  const isEUCountry = EU_COUNTRY_SLUGS.has(s.country_slug)
                  const showEUBadge = savedPassportCtx?.isEU && isEUCountry
                  const showDualBadge = savedPassportCtx?.hasDual && !showEUBadge && savedPassportCtx.tier <= 2
                  return (
                    <div key={s.id} className="group flex items-center gap-3 transition-colors"
                      style={{ padding: '13px 22px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                      onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.025)'}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}>
                      {slugToIso(s.country_slug) ? <FlagIcon code={slugToIso(s.country_slug)!} size="sm" /> : <span style={{ fontSize: 20, flexShrink: 0 }}>{countryData?.flag ?? '🌍'}</span>}
                      <a href={`/country/${s.country_slug}`}
                        style={{ fontSize: 14, fontWeight: 500, color: 'rgba(255,255,255,0.8)', textDecoration: 'none', flex: 1 }}
                        onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = '#fff'}
                        onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.8)'}>
                        {countryData?.name ?? formatSlug(s.country_slug)}
                      </a>
                      {showEUBadge && (
                        <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#00ffd5', border: '1px solid rgba(0,255,213,0.25)', padding: '2px 6px', flexShrink: 0 }}>
                          EU ✓
                        </span>
                      )}
                      {showDualBadge && (
                        <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(0,255,213,0.6)', flexShrink: 0 }}>
                          T{savedPassportCtx!.tier}
                        </span>
                      )}
                      <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.18)', marginRight: 8 }}>{formatDateShort(s.created_at)}</span>
                      {/* Hover actions */}
                      <div className="flex items-center gap-2.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <a href={`/country/${s.country_slug}`}
                          style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}
                          onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = '#fff'}
                          onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.4)'}>
                          View
                        </a>
                        <button onClick={() => removeSave(s.id)}
                          style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'rgba(255,255,255,0.25)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                          onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = '#f87171'}
                          onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.25)'}>
                          Remove
                        </button>
                      </div>
                    </div>
                  )
                })}
                {savedCountries.length > 6 && (
                  <div style={{ padding: '12px 22px', fontSize: 11, color: 'rgba(255,255,255,0.18)', letterSpacing: '0.04em' }}>
                    +{savedCountries.length - 6} more saved
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* ── ACCOUNT CARD ── */}
        <div style={{ background: '#0d0d10', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, overflow: 'hidden' }}>
          {/* Head */}
          <div style={{ padding: '18px 22px', borderBottom: '1px solid rgba(255,255,255,0.08)', fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)' }}>
            Account
          </div>

          {/* Google provider row — only for OAuth users */}
          {isGoogleUser && (
            <div className="flex items-center justify-between gap-4 flex-wrap" style={{ padding: '18px 22px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              <div className="flex items-center gap-3.5">
                <div className="flex items-center justify-center flex-shrink-0"
                  style={{ width: 38, height: 38, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#fff', marginBottom: 2 }}>Google</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Connected</div>
                </div>
              </div>
              {setPasswordSent ? (
                <span className="flex items-center gap-1.5" style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.5)' }}>
                  <Check className="w-3.5 h-3.5" /> Check your email
                </span>
              ) : (
                <button onClick={handleSetPassword} disabled={setPasswordLoading}
                  className="inline-flex items-center gap-1.5 transition-all disabled:opacity-50"
                  style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.14)', borderRadius: 8, padding: '8px 14px', fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.7)', cursor: 'pointer' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.3)'; (e.currentTarget as HTMLElement).style.color = '#fff' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.14)'; (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.7)' }}>
                  <KeyRound className="w-3 h-3" />
                  {setPasswordLoading ? 'Sending...' : 'Set a password'}
                </button>
              )}
            </div>
          )}

          {/* Email + action buttons row */}
          <div className="flex items-center justify-between gap-5 flex-wrap" style={{ padding: '18px 22px' }}>
            <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)' }}>{user.email}</span>
            <div className="flex gap-2.5 flex-wrap">
              {!isGoogleUser && (
                <a href="/auth/forgot-password"
                  className="inline-flex items-center gap-1.5 transition-all"
                  style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.14)', borderRadius: 8, padding: '8px 14px', fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.3)'; (e.currentTarget as HTMLElement).style.color = '#fff' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.14)'; (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.7)' }}>
                  <Lock className="w-3 h-3" /> Reset password
                </a>
              )}
              <button onClick={signOut}
                className="inline-flex items-center gap-1.5 transition-all"
                style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.14)', borderRadius: 8, padding: '8px 14px', fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.7)', cursor: 'pointer' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.3)'; (e.currentTarget as HTMLElement).style.color = '#fff' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.14)'; (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.7)' }}>
                <LogOut className="w-3 h-3" /> Sign out
              </button>
              <button onClick={() => { setShowDeleteConfirm(true); setDeleteError(''); setDeleteConfirmText('') }}
                className="inline-flex items-center gap-1.5 transition-all"
                style={{ background: 'transparent', border: '1px solid rgba(248,113,113,0.3)', borderRadius: 8, padding: '8px 14px', fontSize: 12, fontWeight: 600, color: '#f87171', cursor: 'pointer' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(248,113,113,0.6)'; (e.currentTarget as HTMLElement).style.background = 'rgba(248,113,113,0.06)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(248,113,113,0.3)'; (e.currentTarget as HTMLElement).style.background = 'transparent' }}>
                <Trash2 className="w-3 h-3" /> Delete account
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* ── EDIT PROFILE MODAL ── */}
      {editing && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-6"
          style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}
          onClick={e => { if (e.target === e.currentTarget) setEditing(false) }}>
          <div className="w-full" style={{ maxWidth: 480, background: '#111113', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 20, padding: 32, position: 'relative' }}>
            {/* Close */}
            <button onClick={() => setEditing(false)}
              style={{ position: 'absolute', top: 18, right: 18, width: 34, height: 34, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'rgba(255,255,255,0.5)' }}>
              <X className="w-4 h-4" />
            </button>

            <h3 style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: 24, color: '#fff', marginBottom: 24 }}>Edit Profile</h3>

            <div className="space-y-5">
              {/* Name */}
              <div>
                <label style={{ display: 'block', fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: 8 }}>
                  Display name
                </label>
                <input value={editName} onChange={e => setEditName(e.target.value)}
                  style={{ width: '100%', padding: '11px 14px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, fontSize: 14, fontWeight: 500, color: '#fff', outline: 'none', boxSizing: 'border-box' }} />
              </div>

              {/* Job title */}
              <div>
                <label style={{ display: 'block', fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: 8 }}>
                  Job title
                </label>
                <input value={editJobTitle} onChange={e => setEditJobTitle(e.target.value)}
                  placeholder="e.g. Software Engineer, Nurse, Student..."
                  style={{ width: '100%', padding: '11px 14px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, fontSize: 14, fontWeight: 500, color: '#fff', outline: 'none', boxSizing: 'border-box' }} />
              </div>

              {/* Passport */}
              <div>
                <label style={{ display: 'block', fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: 8 }}>
                  Passport
                </label>
                {editPassport && (
                  <div className="flex items-center justify-between mb-2"
                    style={{ padding: '10px 14px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10 }}>
                    <span style={{ fontSize: 14, fontWeight: 500, color: '#fff', display: 'flex', alignItems: 'center', gap: 6 }}>
                      {slugToIso(editPassport) ? <FlagIcon code={slugToIso(editPassport)!} size="sm" /> : <span>{PASSPORT_FLAGS[editPassport]?.flag}</span>} {PASSPORT_FLAGS[editPassport]?.name}
                    </span>
                    <button onClick={() => setEditPassport(null)}
                      style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'rgba(255,255,255,0.35)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                      Clear
                    </button>
                  </div>
                )}
                <div className="relative mb-2">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: 'rgba(255,255,255,0.3)' }} />
                  <input placeholder="Search passport..." value={passportSearch}
                    onChange={e => setPassportSearch(e.target.value)}
                    style={{ width: '100%', paddingLeft: 36, paddingRight: 14, paddingTop: 10, paddingBottom: 10, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, fontSize: 13, color: '#fff', outline: 'none', boxSizing: 'border-box' }} />
                </div>
                <div style={{ maxHeight: 160, overflowY: 'auto', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10 }}>
                  {filteredPassports.slice(0, 20).map(p => (
                    <button key={p.slug} onClick={() => { setEditPassport(p.slug); setPassportSearch('') }}
                      className="w-full flex items-center gap-2.5 text-left transition-colors"
                      style={{
                        padding: '10px 14px',
                        fontSize: 13,
                        background: editPassport === p.slug ? 'rgba(255,255,255,0.07)' : 'transparent',
                        color: editPassport === p.slug ? '#fff' : 'rgba(255,255,255,0.6)',
                        border: 'none',
                        borderBottom: '1px solid rgba(255,255,255,0.04)',
                        cursor: 'pointer',
                        width: '100%',
                      }}>
                      {slugToIso(p.slug) ? <FlagIcon code={slugToIso(p.slug)!} size="sm" /> : <span>{p.flag}</span>}
                      <span style={{ flex: 1, fontWeight: 500 }}>{p.name}</span>
                      {editPassport === p.slug && <Check className="w-3.5 h-3.5" style={{ color: '#fff' }} />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Second Passport */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <label style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)' }}>
                    Second Passport
                  </label>
                  {!showSecondPassportEdit && (
                    <button onClick={() => setShowSecondPassportEdit(true)}
                      style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', background: 'none', border: 'none', cursor: 'pointer' }}>
                      + Add
                    </button>
                  )}
                  {showSecondPassportEdit && (
                    <button onClick={() => { setShowSecondPassportEdit(false); setEditSecondPassport(null); setSecondPassportSearch('') }}
                      style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', background: 'none', border: 'none', cursor: 'pointer' }}>
                      Remove
                    </button>
                  )}
                </div>
                {showSecondPassportEdit && (
                  <>
                    {editSecondPassport && (
                      <div className="flex items-center justify-between mb-2"
                        style={{ padding: '10px 14px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10 }}>
                        <span style={{ fontSize: 14, fontWeight: 500, color: '#fff' }}>
                          {slugToIso(editSecondPassport) ? <FlagIcon code={slugToIso(editSecondPassport)!} size="sm" /> : <span>{PASSPORT_FLAGS[editSecondPassport]?.flag}</span>} {PASSPORT_FLAGS[editSecondPassport]?.name}
                        </span>
                        <button onClick={() => setEditSecondPassport(null)}
                          style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'rgba(255,255,255,0.35)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                          Clear
                        </button>
                      </div>
                    )}
                    <div className="relative mb-2">
                      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: 'rgba(255,255,255,0.3)' }} />
                      <input placeholder="Search second passport..." value={secondPassportSearch}
                        onChange={e => setSecondPassportSearch(e.target.value)}
                        style={{ width: '100%', paddingLeft: 36, paddingRight: 14, paddingTop: 10, paddingBottom: 10, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, fontSize: 13, color: '#fff', outline: 'none', boxSizing: 'border-box' }} />
                    </div>
                    <div style={{ maxHeight: 140, overflowY: 'auto', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10 }}>
                      {filteredSecondPassports.slice(0, 20).map(p => (
                        <button key={p.slug} onClick={() => { setEditSecondPassport(p.slug); setSecondPassportSearch('') }}
                          className="w-full flex items-center gap-2.5 text-left"
                          style={{ padding: '10px 14px', fontSize: 13, background: editSecondPassport === p.slug ? 'rgba(255,255,255,0.07)' : 'transparent', color: editSecondPassport === p.slug ? '#fff' : 'rgba(255,255,255,0.6)', border: 'none', borderBottom: '1px solid rgba(255,255,255,0.04)', cursor: 'pointer', width: '100%' }}>
                          {slugToIso(p.slug) ? <FlagIcon code={slugToIso(p.slug)!} size="sm" /> : <span>{p.flag}</span>}
                          <span style={{ flex: 1, fontWeight: 500 }}>{p.name}</span>
                          {editSecondPassport === p.slug && <Check className="w-3.5 h-3.5" style={{ color: '#fff' }} />}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            {editDualConflict && (
              <div style={{ marginTop: 14, padding: '10px 14px', background: 'rgba(255,200,50,0.05)', border: '1px solid rgba(255,200,50,0.2)', borderRadius: 10 }}>
                <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,200,50,0.8)', marginBottom: 3 }}>⚠ No dual citizenship</p>
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', lineHeight: 1.6 }}>{editDualConflict.message}</p>
              </div>
            )}

            {saveError && <p style={{ fontSize: 12, fontWeight: 600, color: '#f87171', marginTop: 12 }}>{saveError}</p>}

            <div className="flex gap-3 mt-6">
              <button onClick={() => setEditing(false)} disabled={saving}
                style={{ flex: 1, padding: 13, background: 'transparent', border: '1px solid rgba(255,255,255,0.14)', borderRadius: 10, fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.6)', cursor: 'pointer' }}>
                Cancel
              </button>
              <button onClick={saveEdit} disabled={saving}
                style={{ flex: 1, padding: 13, background: '#fff', color: '#0a0a0a', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: 'pointer', opacity: saving ? 0.6 : 1 }}>
                {saving ? 'Saving...' : 'Save changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── DELETE CONFIRM MODAL ── */}
      {showDeleteConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-6"
          style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}
          onClick={e => { if (e.target === e.currentTarget) { setShowDeleteConfirm(false); setDeleteConfirmText('') } }}>
          <div className="w-full" style={{ maxWidth: 420, background: '#111113', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 20, padding: 32, position: 'relative' }}>
            <button onClick={() => { setShowDeleteConfirm(false); setDeleteConfirmText('') }}
              style={{ position: 'absolute', top: 18, right: 18, width: 34, height: 34, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'rgba(255,255,255,0.5)' }}>
              <X className="w-4 h-4" />
            </button>

            <h3 style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: 22, color: '#fff', marginBottom: 16 }}>Delete account?</h3>

            {/* Warning box */}
            <div className="flex items-center gap-3.5 mb-5"
              style={{ padding: 16, background: 'rgba(248,113,113,0.06)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: 10 }}>
              <AlertTriangle className="w-5 h-5 flex-shrink-0" style={{ color: '#f87171' }} />
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', lineHeight: 1.5 }}>
                All your saved countries, country matches, and profile data will be permanently deleted. This cannot be undone.
              </p>
            </div>

            {deleteError && <p style={{ fontSize: 12, fontWeight: 600, color: '#f87171', marginBottom: 12 }}>{deleteError}</p>}

            <div className="mb-5">
              <label style={{ display: 'block', fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: 8 }}>
                Type <strong style={{ color: '#f87171' }}>DELETE</strong> to confirm
              </label>
              <input
                value={deleteConfirmText}
                onChange={e => setDeleteConfirmText(e.target.value)}
                placeholder="DELETE"
                style={{ width: '100%', padding: '11px 14px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, fontSize: 14, fontWeight: 500, color: '#fff', outline: 'none', boxSizing: 'border-box' }} />
            </div>

            <div className="flex gap-3">
              <button onClick={() => { setShowDeleteConfirm(false); setDeleteConfirmText('') }} disabled={deleteLoading}
                style={{ flex: 1, padding: 13, background: 'transparent', border: '1px solid rgba(255,255,255,0.14)', borderRadius: 10, fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.6)', cursor: 'pointer' }}>
                Cancel
              </button>
              <button onClick={deleteAccount} disabled={deleteLoading || deleteConfirmText !== 'DELETE'}
                style={{ flex: 1, padding: 13, background: 'transparent', border: '1px solid rgba(248,113,113,0.4)', borderRadius: 10, fontSize: 14, fontWeight: 600, color: '#f87171', cursor: 'pointer', opacity: (deleteLoading || deleteConfirmText !== 'DELETE') ? 0.4 : 1, transition: 'border-color 0.15s, background 0.15s' }}
                onMouseEnter={e => { if (deleteConfirmText === 'DELETE') { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(248,113,113,0.7)'; (e.currentTarget as HTMLElement).style.background = 'rgba(248,113,113,0.07)' } }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(248,113,113,0.4)'; (e.currentTarget as HTMLElement).style.background = 'transparent' }}>
                {deleteLoading ? 'Deleting...' : 'Yes, delete account'}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  )
}