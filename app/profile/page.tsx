'use client'
import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/useAuth'
import {
  Globe2, LogOut, Trash2, Sparkles, Pencil, Check, X,
  ArrowRight, ArrowRightLeft, RefreshCw, Download,
  MapPin, Briefcase, Shield, ChevronRight, Heart, Clock,
  BarChart3, AlertTriangle, Search, Plus
} from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

type CountryInfo = { flag_emoji: string; name: string }
type SavedCountry = {
  id: string
  country_slug: string
  created_at: string
  countries?: CountryInfo | CountryInfo[] | null
}
type TopCountry = { slug: string; name: string; flagEmoji: string; matchPercent: number }
type WizardResult = {
  top_countries: TopCountry[]
  answers: { role: string }
  created_at: string
}
type Profile = {
  passport_slug: string | null
  job_title: string | null
  onboarded: boolean
  is_pro: boolean
}

// ─── Passport data ────────────────────────────────────────────────────────────

const PASSPORT_FLAGS: Record<string, { flag: string; name: string; henleyRank?: number; visaFree?: number }> = {
  'united-states':  { flag: '🇺🇸', name: 'United States',  henleyRank: 8,  visaFree: 186 },
  'united-kingdom': { flag: '🇬🇧', name: 'United Kingdom', henleyRank: 6,  visaFree: 189 },
  'canada':         { flag: '🇨🇦', name: 'Canada',         henleyRank: 7,  visaFree: 188 },
  'australia':      { flag: '🇦🇺', name: 'Australia',      henleyRank: 9,  visaFree: 185 },
  'germany':        { flag: '🇩🇪', name: 'Germany',        henleyRank: 2,  visaFree: 192 },
  'france':         { flag: '🇫🇷', name: 'France',         henleyRank: 3,  visaFree: 191 },
  'netherlands':    { flag: '🇳🇱', name: 'Netherlands',    henleyRank: 3,  visaFree: 191 },
  'sweden':         { flag: '🇸🇪', name: 'Sweden',         henleyRank: 3,  visaFree: 191 },
  'norway':         { flag: '🇳🇴', name: 'Norway',         henleyRank: 5,  visaFree: 190 },
  'denmark':        { flag: '🇩🇰', name: 'Denmark',        henleyRank: 4,  visaFree: 191 },
  'finland':        { flag: '🇫🇮', name: 'Finland',        henleyRank: 3,  visaFree: 191 },
  'switzerland':    { flag: '🇨🇭', name: 'Switzerland',    henleyRank: 3,  visaFree: 191 },
  'singapore':      { flag: '🇸🇬', name: 'Singapore',      henleyRank: 1,  visaFree: 195 },
  'japan':          { flag: '🇯🇵', name: 'Japan',          henleyRank: 1,  visaFree: 193 },
  'south-korea':    { flag: '🇰🇷', name: 'South Korea',    henleyRank: 2,  visaFree: 192 },
  'new-zealand':    { flag: '🇳🇿', name: 'New Zealand',    henleyRank: 10, visaFree: 184 },
  'ireland':        { flag: '🇮🇪', name: 'Ireland',        henleyRank: 6,  visaFree: 188 },
  'portugal':       { flag: '🇵🇹', name: 'Portugal',       henleyRank: 3,  visaFree: 191 },
  'spain':          { flag: '🇪🇸', name: 'Spain',          henleyRank: 3,  visaFree: 191 },
  'italy':          { flag: '🇮🇹', name: 'Italy',          henleyRank: 3,  visaFree: 191 },
  'austria':        { flag: '🇦🇹', name: 'Austria',        henleyRank: 3,  visaFree: 191 },
  'india':          { flag: '🇮🇳', name: 'India',          henleyRank: 82, visaFree: 58  },
  'brazil':         { flag: '🇧🇷', name: 'Brazil',         henleyRank: 20, visaFree: 171 },
  'uae':            { flag: '🇦🇪', name: 'UAE',            henleyRank: 15, visaFree: 179 },
  'mexico':         { flag: '🇲🇽', name: 'Mexico',         henleyRank: 25, visaFree: 162 },
  'china':          { flag: '🇨🇳', name: 'China',          henleyRank: 62, visaFree: 85  },
  'pakistan':       { flag: '🇵🇰', name: 'Pakistan',       henleyRank: 101,visaFree: 33  },
  'nigeria':        { flag: '🇳🇬', name: 'Nigeria',        henleyRank: 93, visaFree: 46  },
  'south-africa':   { flag: '🇿🇦', name: 'South Africa',   henleyRank: 55, visaFree: 107 },
  'philippines':    { flag: '🇵🇭', name: 'Philippines',    henleyRank: 76, visaFree: 67  },
  'malaysia':       { flag: '🇲🇾', name: 'Malaysia',       henleyRank: 12, visaFree: 181 },
  'turkey':         { flag: '🇹🇷', name: 'Turkey',         henleyRank: 53, visaFree: 110 },
  'poland':         { flag: '🇵🇱', name: 'Poland',         henleyRank: 3,  visaFree: 191 },
  'ukraine':        { flag: '🇺🇦', name: 'Ukraine',        henleyRank: 35, visaFree: 148 },
  'ghana':          { flag: '🇬🇭', name: 'Ghana',          henleyRank: 80, visaFree: 68  },
}

const PASSPORT_LIST = Object.entries(PASSPORT_FLAGS).map(([slug, d]) => ({ slug, ...d }))

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getCountryInfo(c: CountryInfo | CountryInfo[] | null | undefined): CountryInfo | null {
  if (!c) return null
  return Array.isArray(c) ? (c[0] ?? null) : c
}
function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}
function formatRelative(d: string) {
  const days = Math.floor((Date.now() - new Date(d).getTime()) / 86400000)
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days}d ago`
  if (days < 30) return `${Math.floor(days / 7)}w ago`
  return `${Math.floor(days / 30)}mo ago`
}
function capPercent(n: number) { return Math.min(n, 99) }
function getMatchColor(pct: number) {
  if (pct >= 85) return '#00d4c8'
  if (pct >= 70) return '#fbbf24'
  return '#f87171'
}
function getMatchLabel(pct: number) {
  if (pct >= 85) return 'Excellent'
  if (pct >= 70) return 'Strong'
  return 'Fair'
}
const RANK_COLORS = ['#fbbf24', '#00d4c8', '#a78bfa']

// ─── Subcomponents ────────────────────────────────────────────────────────────

function StatCard({ label, value, sub, bar }: { label: string; value: string; sub?: string; bar?: number }) {
  return (
    <div className="glass-panel rounded-2xl p-5 tile">
      <p className="text-[11px] font-semibold text-text-muted uppercase tracking-[0.12em] mb-2">{label}</p>
      <div className="flex items-baseline gap-1.5">
        <span className="font-heading text-3xl font-extrabold text-text-primary">{value}</span>
        {sub && <span className="text-xs text-text-muted">{sub}</span>}
      </div>
      {bar !== undefined && (
        <div className="mt-3 h-1 bg-bg-elevated rounded-full overflow-hidden">
          <div className="h-full bg-accent rounded-full transition-all duration-700" style={{ width: `${bar}%` }} />
        </div>
      )}
    </div>
  )
}

function TabButton({ label, active, badge, onClick }: { label: string; active: boolean; badge?: number; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`relative text-sm pb-0.5 transition-colors ${active ? 'text-text-primary font-semibold' : 'text-text-muted hover:text-text-primary'}`}
    >
      {label}
      {badge !== undefined && (
        <span className="ml-1 text-[10px] text-accent bg-accent/10 px-1.5 py-0.5 rounded-full">{badge}</span>
      )}
      {active && (
        <span className="absolute left-0 right-0 -bottom-[13px] h-[2px] bg-accent rounded-full" />
      )}
    </button>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()

  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [savedCountries, setSavedCountries] = useState<SavedCountry[]>([])
  const [wizardResult, setWizardResult] = useState<WizardResult | null>(null)
  const [activeTab, setActiveTab] = useState<'atlas' | 'saved' | 'history' | 'account'>('atlas')

  const [displayName, setDisplayName] = useState('')
  const [editing, setEditing] = useState(false)
  const [editName, setEditName] = useState('')
  const [editJobTitle, setEditJobTitle] = useState('')
  const [editPassport, setEditPassport] = useState<string | null>(null)
  const [passportSearch, setPassportSearch] = useState('')
  const [saving, setSaving] = useState(false)

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)

  useEffect(() => {
    if (authLoading) return
    if (!user) { router.push('/'); return }

    const userId = user.id
    const initialName = user.user_metadata?.full_name ?? user.email?.split('@')[0] ?? ''
    setDisplayName(initialName)
    setEditName(initialName)

    async function loadData() {
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
      } catch {}
      setLoading(false)
    }
    loadData()
  }, [user, authLoading, router])

  const handleSaveProfile = async () => {
    if (!user) return
    setSaving(true)
    const { data: { session } } = await supabase.auth.getSession()
    if (session) {
      await supabase.auth.updateUser({ data: { full_name: editName } })
    }
    await supabase.from('profiles').update({
      job_title: editJobTitle || null,
      passport_slug: editPassport,
    }).eq('id', user.id)
    setDisplayName(editName)
    setProfile(p => p ? { ...p, job_title: editJobTitle || null, passport_slug: editPassport } : p)
    setSaving(false)
    setEditing(false)
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const handleDeleteAccount = async () => {
    if (!user) return
    setDeleteLoading(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { setDeleteLoading(false); return }
      const res = await fetch('/api/delete-account', {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${session.access_token}` },
      })
      if (res.ok) {
        await supabase.auth.signOut()
        window.location.href = '/'
      }
    } catch {}
    setDeleteLoading(false)
  }

  const handleUnsave = async (id: string) => {
    await supabase.from('saved_countries').delete().eq('id', id)
    setSavedCountries(prev => prev.filter(s => s.id !== id))
  }

  const handleExport = () => {
    if (!wizardResult) return
    const lines = [
      `Origio — Country Matches`,
      `Run: ${formatDate(wizardResult.created_at)}`,
      ``,
      ...wizardResult.top_countries.map((c, i) =>
        `${i + 1}. ${c.flagEmoji} ${c.name} — ${capPercent(c.matchPercent)}%`
      ),
    ]
    const blob = new Blob([lines.join('\n')], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'origio-matches.txt'; a.click()
    URL.revokeObjectURL(url)
  }

  // ── Derived state ───────────────────────────────────────────────────────────
  const passportData = profile?.passport_slug ? PASSPORT_FLAGS[profile.passport_slug] : null
  const isPro = profile?.is_pro ?? false
  const topMatch = wizardResult?.top_countries?.[0]
  const initials = displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?'
  const filteredPassports = PASSPORT_LIST.filter(p =>
    p.name.toLowerCase().includes(passportSearch.toLowerCase())
  )

  // ── Loading / auth states ───────────────────────────────────────────────────
  if (loading || authLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-bg-primary">
      <div className="w-8 h-8 border-2 border-accent/20 border-t-accent rounded-full animate-spin" />
    </div>
  )

  if (!user) return null

  return (
    <div className="min-h-screen bg-bg-primary noise-overlay">

      {/* ── Nav ─────────────────────────────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-panel border-b border-border">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Globe2 className="w-5 h-5 text-accent" />
            <span className="font-heading text-xl font-extrabold tracking-tight text-text-primary">Origio</span>
          </Link>
          <div className="flex items-center gap-3">
            {isPro && (
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/10 border border-accent/25 text-accent text-xs font-bold">
                <Sparkles className="w-3 h-3" /> Pro
              </span>
            )}
            <Link href="/" className="text-sm text-text-muted hover:text-text-primary transition-colors">Globe</Link>
            <Link href="/wizard" className="text-sm text-text-muted hover:text-text-primary transition-colors">Quiz</Link>
          </div>
        </div>
      </nav>

      <main className="relative pt-16">

        {/* ── Hero identity section ────────────────────────────────────────── */}
        <section className="relative border-b border-border overflow-hidden">
          {/* Background grid */}
          <div className="absolute inset-0 pointer-events-none" style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
            backgroundSize: '56px 56px',
            maskImage: 'radial-gradient(ellipse 70% 60% at 50% 0%, #000 30%, transparent 75%)',
          }} />
          {/* Ambient color wash */}
          <div className="absolute inset-0 pointer-events-none" style={{
            background: 'radial-gradient(40% 60% at 15% 30%, rgba(251,191,36,0.1), transparent 70%), radial-gradient(50% 70% at 80% 10%, rgba(0,212,200,0.12), transparent 70%)',
          }} />

          <div className="relative max-w-7xl mx-auto px-6 pt-12 pb-0">

            {/* Identity row */}
            <div className="grid lg:grid-cols-[auto,1fr,auto] gap-6 lg:gap-10 items-start mb-10">

              {/* Avatar + identity */}
              <div className="flex items-start gap-5">
                <div style={{
                  background: 'conic-gradient(from 180deg, #00d4c8 0deg, #fbbf24 120deg, #a78bfa 240deg, #00d4c8 360deg)',
                  padding: '2px',
                  borderRadius: '22px',
                }}>
                  <div className="w-20 h-20 rounded-[20px] bg-bg-elevated flex items-center justify-center font-heading text-2xl font-extrabold text-text-primary">
                    {user.user_metadata?.avatar_url ? (
                      <img src={user.user_metadata.avatar_url} alt="" className="w-full h-full rounded-[20px] object-cover" />
                    ) : initials}
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-1">
                    {editing ? (
                      <input
                        value={editName}
                        onChange={e => setEditName(e.target.value)}
                        className="font-heading text-2xl font-extrabold bg-bg-elevated border border-accent/30 rounded-xl px-3 py-1 text-text-primary focus:outline-none focus:border-accent/60"
                        autoFocus
                      />
                    ) : (
                      <h1 className="font-heading text-3xl font-extrabold tracking-tight text-text-primary">{displayName}</h1>
                    )}
                    <button
                      onClick={() => setEditing(e => !e)}
                      className="p-1.5 rounded-lg text-text-muted hover:text-accent hover:bg-accent/10 transition-colors"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <p className="text-sm text-text-muted mb-4">
                    {user.email}
                    {user.created_at && ` · Member since ${formatDate(user.created_at)}`}
                  </p>

                  <div className="flex flex-wrap gap-1.5">
                    {isPro && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-accent/10 border border-accent/25 text-accent text-xs font-bold">
                        <Sparkles className="w-3 h-3" /> Pro
                      </span>
                    )}
                    {passportData && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-bg-elevated border border-border text-text-muted text-xs">
                        {passportData.flag} {passportData.name} passport
                      </span>
                    )}
                    {profile?.job_title && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-bg-elevated border border-border text-text-muted text-xs">
                        <Briefcase className="w-3 h-3" /> {profile.job_title}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Top match hero card */}
              {topMatch && (
                <div className="lg:col-start-2 relative glass-panel rounded-3xl overflow-hidden">
                  <div className="absolute inset-0 pointer-events-none" style={{
                    background: 'radial-gradient(70% 80% at 100% 50%, rgba(251,191,36,0.15), transparent 60%), radial-gradient(60% 80% at 0% 100%, rgba(0,212,200,0.10), transparent 70%)',
                  }} />
                  <div className="relative p-7 grid grid-cols-[1fr,auto] gap-6 items-center">
                    <div>
                      <p className="text-[11px] font-bold text-text-muted uppercase tracking-[0.2em] mb-2">Your top match</p>
                      <div className="flex items-baseline gap-3 mb-2">
                        <span className="text-4xl">{topMatch.flagEmoji}</span>
                        <h2 className="font-heading text-4xl font-extrabold tracking-tight text-text-primary">{topMatch.name}</h2>
                      </div>
                      <p className="text-sm text-text-muted mb-5 max-w-sm">
                        Based on your quiz answers · {wizardResult?.created_at ? formatRelative(wizardResult.created_at) : ''}
                      </p>
                      <div className="flex items-center gap-3">
                        <Link href={`/country/${topMatch.slug}`} className="cta-button px-4 py-2 rounded-xl text-xs inline-flex items-center gap-2">
                          View deep-dive <ArrowRight className="w-3 h-3" />
                        </Link>
                        <Link href="/wizard" className="px-4 py-2 rounded-xl border border-border text-xs text-text-muted hover:text-text-primary hover:border-accent/30 transition-colors inline-flex items-center gap-2">
                          <RefreshCw className="w-3 h-3" /> Retake quiz
                        </Link>
                      </div>
                    </div>
                    {/* Score ring */}
                    <div className="relative w-36 h-36 flex items-center justify-center flex-shrink-0">
                      <svg className="absolute inset-0 w-full h-full" style={{ transform: 'rotate(-90deg)' }}>
                        <circle cx="72" cy="72" r="62" stroke="rgba(255,255,255,0.06)" strokeWidth="5" fill="none" />
                        <circle
                          cx="72" cy="72" r="62"
                          stroke="url(#matchGrad)" strokeWidth="5" fill="none"
                          strokeLinecap="round"
                          strokeDasharray="390"
                          strokeDashoffset={390 - (390 * capPercent(topMatch.matchPercent) / 100)}
                          style={{ filter: 'drop-shadow(0 0 8px rgba(251,191,36,0.5))' }}
                        />
                        <defs>
                          <linearGradient id="matchGrad" x1="0" y1="0" x2="1" y2="1">
                            <stop offset="0%" stopColor="#fbbf24" />
                            <stop offset="100%" stopColor="#00d4c8" />
                          </linearGradient>
                        </defs>
                      </svg>
                      <div className="relative text-center">
                        <div className="font-heading text-[44px] font-extrabold leading-none tracking-tight text-text-primary">
                          {capPercent(topMatch.matchPercent)}<span className="text-xl text-text-muted font-bold">%</span>
                        </div>
                        <div className="text-[10px] font-bold text-accent uppercase tracking-[0.2em] mt-1">
                          {getMatchLabel(topMatch.matchPercent)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* No quiz yet */}
              {!topMatch && (
                <div className="lg:col-start-2 glass-panel rounded-3xl p-8 flex flex-col items-center justify-center text-center gap-4 min-h-[180px]">
                  <Globe2 className="w-10 h-10 text-text-muted" />
                  <div>
                    <p className="font-heading font-bold text-text-primary mb-1">No quiz results yet</p>
                    <p className="text-sm text-text-muted">Answer 8 questions to find your best country matches</p>
                  </div>
                  <Link href="/wizard" className="cta-button px-5 py-2 rounded-xl text-sm inline-flex items-center gap-2">
                    <Sparkles className="w-4 h-4" /> Find My Country
                  </Link>
                </div>
              )}

              {/* Quick actions */}
              <div className="flex flex-col gap-2 lg:col-start-3">
                <button onClick={() => router.push('/wizard')} className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-border hover:border-accent/30 text-xs text-text-muted hover:text-text-primary transition-colors whitespace-nowrap">
                  <RefreshCw className="w-3.5 h-3.5" /> Re-run quiz
                </button>
                <button onClick={handleExport} disabled={!wizardResult} className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-border hover:border-accent/30 text-xs text-text-muted hover:text-text-primary transition-colors whitespace-nowrap disabled:opacity-40">
                  <Download className="w-3.5 h-3.5" /> Export results
                </button>
                <Link href="/compare" className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-border hover:border-accent/30 text-xs text-text-muted hover:text-text-primary transition-colors whitespace-nowrap">
                  <ArrowRightLeft className="w-3.5 h-3.5" /> Compare countries
                </Link>
              </div>
            </div>

            {/* Stat ribbon */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-0">
              <StatCard
                label="Countries explored"
                value={`${Math.min(savedCountries.length * 3, 25)}`}
                sub="/25"
                bar={Math.min(savedCountries.length * 12, 100)}
              />
              <StatCard
                label="Saved countries"
                value={`${savedCountries.length}`}
                sub="shortlist"
              />
              <StatCard
                label="Top match score"
                value={topMatch ? `${capPercent(topMatch.matchPercent)}%` : '—'}
              />
              <StatCard
                label="Passport reach"
                value={passportData?.visaFree ? `${passportData.visaFree}` : '—'}
                sub={passportData?.henleyRank ? `Henley #${passportData.henleyRank}` : 'visa-free'}
              />
            </div>
          </div>
        </section>

        {/* ── Tabs ─────────────────────────────────────────────────────────── */}
        <div className="sticky top-16 z-40 glass-panel border-b border-border">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-center gap-7 h-12 text-sm">
              <TabButton label="Atlas" active={activeTab === 'atlas'} onClick={() => setActiveTab('atlas')} />
              <TabButton label="Saved" active={activeTab === 'saved'} badge={savedCountries.length || undefined} onClick={() => setActiveTab('saved')} />
              <TabButton label="History" active={activeTab === 'history'} onClick={() => setActiveTab('history')} />
              <TabButton label="Account" active={activeTab === 'account'} onClick={() => setActiveTab('account')} />
            </div>
          </div>
        </div>

        {/* ── Tab content ───────────────────────────────────────────────────── */}
        <section className="py-10">
          <div className="max-w-7xl mx-auto px-6">

            {/* ── ATLAS TAB ── */}
            {activeTab === 'atlas' && (
              <div className="grid lg:grid-cols-[1fr,340px] gap-6">

                {/* Left: ranked list */}
                <div className="space-y-6">
                  <div className="glass-panel rounded-2xl overflow-hidden">
                    <div className="flex items-center justify-between px-6 py-5 border-b border-border">
                      <div>
                        <h3 className="font-heading text-sm font-bold text-text-primary">
                          {wizardResult ? 'Your country ranking' : 'No ranking yet'}
                        </h3>
                        <p className="text-xs text-text-muted mt-0.5">
                          {wizardResult
                            ? `Last quiz run ${formatRelative(wizardResult.created_at)}`
                            : 'Take the quiz to get personalised rankings'}
                        </p>
                      </div>
                      <Link href="/wizard" className="text-xs text-accent hover:underline flex items-center gap-1">
                        {wizardResult ? 'Re-run' : 'Take quiz'} <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>

                    {wizardResult?.top_countries?.length ? (
                      <>
                        {/* Podium */}
                        <div className="grid md:grid-cols-3 gap-px bg-border">
                          {wizardResult.top_countries.slice(0, 3).map((c, i) => (
                            <Link href={`/country/${c.slug}`} key={c.slug} className="block bg-bg-surface p-5 relative hover:bg-white/[0.02] transition-colors group">
                              <div className="absolute top-0 left-0 right-0 h-[2px]" style={{
                                background: `linear-gradient(90deg, transparent, ${RANK_COLORS[i]}, transparent)`
                              }} />
                              <div className="flex items-center gap-2 mb-3">
                                <span className="font-heading text-[11px] font-bold uppercase tracking-[0.15em]" style={{ color: RANK_COLORS[i] }}>
                                  0{i + 1} · {['Gold', 'Silver', 'Bronze'][i]}
                                </span>
                              </div>
                              <div className="flex items-baseline gap-3 mb-3">
                                <span className="text-3xl">{c.flagEmoji}</span>
                                <div>
                                  <p className="font-heading font-bold text-text-primary">{c.name}</p>
                                </div>
                              </div>
                              <div className="flex items-baseline justify-between">
                                <span className="font-heading text-2xl font-extrabold" style={{ color: RANK_COLORS[i] }}>
                                  {capPercent(c.matchPercent)}%
                                </span>
                                <ChevronRight className="w-4 h-4 text-text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
                              </div>
                            </Link>
                          ))}
                        </div>

                        {/* Ranked rows — show all if pro, else top 10 teaser */}
                        <div>
                          {wizardResult.top_countries.slice(3).map((c, i) => {
                            const rank = i + 4
                            const pct = capPercent(c.matchPercent)
                            const color = getMatchColor(pct)
                            return (
                              <Link href={`/country/${c.slug}`} key={c.slug}
                                className="flex items-center px-6 py-3 border-t border-border hover:bg-white/[0.02] transition-colors group"
                              >
                                <span className="font-heading text-[11px] font-bold text-text-muted w-8">0{rank}</span>
                                <span className="text-lg mr-3">{c.flagEmoji}</span>
                                <span className="text-sm flex-1 text-text-primary">{c.name}</span>
                                <div className="w-24 mr-4 h-1 bg-bg-elevated rounded-full overflow-hidden">
                                  <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
                                </div>
                                <span className="font-heading text-sm font-bold text-text-primary w-10 text-right">{pct}%</span>
                                <ChevronRight className="w-4 h-4 text-text-muted ml-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                              </Link>
                            )
                          })}
                        </div>

                        {!isPro && (
                          <div className="px-6 py-5 border-t border-border bg-bg-elevated/40 flex items-center justify-between gap-4">
                            <p className="text-xs text-text-muted">Showing top 3 · Pro unlocks all 25 ranked countries</p>
                            <Link href="/pro" className="cta-button px-4 py-2 rounded-xl text-xs inline-flex items-center gap-1.5">
                              <Sparkles className="w-3.5 h-3.5" /> Upgrade — €5
                            </Link>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="px-6 py-12 text-center">
                        <Globe2 className="w-10 h-10 text-text-muted mx-auto mb-3" />
                        <p className="text-sm text-text-muted mb-4">Take the quiz to see your personalised country ranking</p>
                        <Link href="/wizard" className="cta-button px-5 py-2 rounded-xl text-sm inline-flex items-center gap-2">
                          <Sparkles className="w-4 h-4" /> Find My Country
                        </Link>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right sidebar */}
                <aside className="space-y-5">

                  {/* Passport card */}
                  <div className="glass-panel rounded-2xl p-5 relative overflow-hidden">
                    <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full opacity-10 pointer-events-none" style={{ background: 'radial-gradient(circle, #00d4c8, transparent)' }} />
                    <p className="text-[11px] font-bold text-text-muted uppercase tracking-[0.2em] mb-4">Passport</p>
                    {passportData ? (
                      <>
                        <div className="flex items-center gap-3 mb-4">
                          <span className="text-3xl">{passportData.flag}</span>
                          <div>
                            <p className="font-heading font-bold text-text-primary">{passportData.name}</p>
                            {passportData.henleyRank && (
                              <p className="text-[11px] text-text-muted">Henley rank #{passportData.henleyRank}</p>
                            )}
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="text-center p-3 rounded-xl bg-bg-elevated border border-border">
                            <div className="font-heading text-sm font-bold text-score-high">{passportData.visaFree ?? '—'}</div>
                            <div className="text-[10px] text-text-muted">Visa-free</div>
                          </div>
                          <div className="text-center p-3 rounded-xl bg-bg-elevated border border-border">
                            <div className="font-heading text-sm font-bold text-text-primary">#{passportData.henleyRank ?? '—'}</div>
                            <div className="text-[10px] text-text-muted">Global rank</div>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-sm text-text-muted mb-3">No passport set</p>
                        <button onClick={() => { setActiveTab('account'); setEditing(true) }}
                          className="text-xs text-accent hover:underline">
                          Add passport →
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Next actions */}
                  <div className="glass-panel rounded-2xl p-5">
                    <p className="text-[11px] font-bold text-text-muted uppercase tracking-[0.2em] mb-4">Quick actions</p>
                    <div className="space-y-1">
                      {[
                        { icon: RefreshCw, label: 'Re-run quiz', sub: 'Update your matches', href: '/wizard' },
                        { icon: ArrowRightLeft, label: 'Compare countries', sub: 'Side-by-side view', href: '/compare' },
                        { icon: BarChart3, label: 'Explore all countries', sub: 'Browse the globe', href: '/' },
                      ].map(({ icon: Icon, label, sub, href }) => (
                        <Link key={href} href={href}
                          className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/[0.02] border border-transparent hover:border-border transition-all group"
                        >
                          <div className="w-8 h-8 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center flex-shrink-0">
                            <Icon className="w-3.5 h-3.5 text-accent" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-text-primary">{label}</p>
                            <p className="text-[11px] text-text-muted">{sub}</p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-text-muted group-hover:text-accent transition-colors" />
                        </Link>
                      ))}
                    </div>
                  </div>

                  {/* Upgrade nudge (non-pro only) */}
                  {!isPro && (
                    <div className="glass-panel rounded-2xl p-5 relative overflow-hidden" style={{
                      background: 'linear-gradient(135deg, rgba(0,212,200,0.05) 0%, rgba(0,0,0,0) 60%)',
                      border: '1px solid rgba(0,212,200,0.2)',
                    }}>
                      <Sparkles className="w-5 h-5 text-accent mb-3" />
                      <p className="font-heading font-bold text-text-primary text-sm mb-1">Upgrade to Pro</p>
                      <p className="text-[11px] text-text-muted mb-4 leading-relaxed">
                        All 25 countries ranked, unlimited quiz runs, full country deep-dives, comparison tool.
                      </p>
                      <Link href="/pro" className="cta-button px-4 py-2 rounded-xl text-xs inline-flex items-center gap-2 w-full justify-center">
                        <Sparkles className="w-3.5 h-3.5" /> Get Pro — one-time €5
                      </Link>
                    </div>
                  )}
                </aside>
              </div>
            )}

            {/* ── SAVED TAB ── */}
            {activeTab === 'saved' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="font-heading text-lg font-bold text-text-primary">Shortlist</h2>
                    <p className="text-sm text-text-muted">{savedCountries.length} countries saved for deeper research</p>
                  </div>
                  {savedCountries.length >= 2 && (
                    <Link href="/compare" className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border hover:border-accent/30 text-sm text-text-muted hover:text-text-primary transition-colors">
                      <ArrowRightLeft className="w-4 h-4" /> Compare side-by-side
                    </Link>
                  )}
                </div>

                {savedCountries.length === 0 ? (
                  <div className="glass-panel rounded-2xl py-16 flex flex-col items-center gap-4 text-center">
                    <Heart className="w-10 h-10 text-text-muted" />
                    <div>
                      <p className="font-heading font-bold text-text-primary mb-1">No saved countries yet</p>
                      <p className="text-sm text-text-muted">Click the heart on any country to add it to your shortlist</p>
                    </div>
                    <Link href="/" className="cta-button px-5 py-2 rounded-xl text-sm inline-flex items-center gap-2">
                      <Globe2 className="w-4 h-4" /> Browse countries
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                    {savedCountries.map(sc => {
                      const info = getCountryInfo(sc.countries)
                      const matched = wizardResult?.top_countries?.find(t => t.slug === sc.country_slug)
                      return (
                        <div key={sc.id} className="glass-panel rounded-2xl p-4 tile relative group">
                          <button
                            onClick={() => handleUnsave(sc.id)}
                            className="absolute top-3 right-3 p-1.5 rounded-lg text-rose-400/60 hover:text-rose-400 hover:bg-rose-400/10 transition-colors opacity-0 group-hover:opacity-100"
                          >
                            <X className="w-3 h-3" />
                          </button>
                          <Link href={`/country/${sc.country_slug}`} className="block">
                            <span className="text-3xl mb-3 block">
                              {info?.flag_emoji ?? '🌍'}
                            </span>
                            <p className="font-semibold text-sm text-text-primary">
                              {info?.name ?? sc.country_slug}
                            </p>
                            {matched ? (
                              <p className="text-[11px] mt-1" style={{ color: getMatchColor(matched.matchPercent) }}>
                                {capPercent(matched.matchPercent)}% match
                              </p>
                            ) : (
                              <p className="text-[11px] text-text-muted mt-1">{formatRelative(sc.created_at)}</p>
                            )}
                          </Link>
                        </div>
                      )
                    })}
                    <Link href="/" className="glass-panel rounded-2xl p-4 flex flex-col items-center justify-center text-text-muted hover:text-accent hover:border-accent/20 transition-colors border-2 border-dashed border-transparent min-h-[110px]">
                      <Plus className="w-5 h-5 mb-1.5" />
                      <p className="text-xs">Add country</p>
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* ── HISTORY TAB ── */}
            {activeTab === 'history' && (
              <div className="max-w-2xl">
                <div className="mb-6">
                  <h2 className="font-heading text-lg font-bold text-text-primary">Quiz history</h2>
                  <p className="text-sm text-text-muted">Your Find My Country quiz runs</p>
                </div>

                {!wizardResult ? (
                  <div className="glass-panel rounded-2xl py-16 flex flex-col items-center gap-4 text-center">
                    <Clock className="w-10 h-10 text-text-muted" />
                    <div>
                      <p className="font-heading font-bold text-text-primary mb-1">No quiz history yet</p>
                      <p className="text-sm text-text-muted">Take the quiz to see your results saved here</p>
                    </div>
                    <Link href="/wizard" className="cta-button px-5 py-2 rounded-xl text-sm inline-flex items-center gap-2">
                      <Sparkles className="w-4 h-4" /> Find My Country
                    </Link>
                  </div>
                ) : (
                  <div className="glass-panel rounded-2xl overflow-hidden">
                    <div className="flex items-center justify-between px-6 py-5 border-b border-border">
                      <div>
                        <p className="font-heading text-sm font-bold text-text-primary">Latest run</p>
                        <p className="text-[11px] text-text-muted mt-0.5">{formatDate(wizardResult.created_at)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={handleExport} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border hover:border-accent/30 text-xs text-text-muted hover:text-text-primary transition-colors">
                          <Download className="w-3 h-3" /> Export
                        </button>
                        <Link href="/wizard" className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-accent/10 border border-accent/20 text-xs text-accent hover:bg-accent/20 transition-colors">
                          <RefreshCw className="w-3 h-3" /> Re-run
                        </Link>
                      </div>
                    </div>

                    {/* Podium */}
                    <div className="grid grid-cols-3 gap-px bg-border">
                      {wizardResult.top_countries.slice(0, 3).map((c, i) => (
                        <Link href={`/country/${c.slug}`} key={c.slug} className="block bg-bg-surface p-5 hover:bg-white/[0.02] transition-colors">
                          <div className="text-2xl mb-2">{c.flagEmoji}</div>
                          <p className="font-heading font-bold text-sm text-text-primary">{c.name}</p>
                          <p className="font-heading text-lg font-extrabold mt-1" style={{ color: RANK_COLORS[i] }}>
                            {capPercent(c.matchPercent)}%
                          </p>
                        </Link>
                      ))}
                    </div>

                    <div className="px-6 py-4 bg-bg-elevated/40 flex items-center justify-between">
                      <p className="text-xs text-text-muted">
                        {wizardResult.answers?.role ? `Role: ${wizardResult.answers.role}` : 'Custom preferences'}
                      </p>
                      <Link href="/wizard/results" className="text-xs text-accent hover:underline flex items-center gap-1">
                        View full results <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                )}

                {!isPro && (
                  <div className="mt-4 flex items-center gap-3 px-5 py-4 rounded-2xl border border-accent/20 bg-accent/5">
                    <Sparkles className="w-4 h-4 text-accent flex-shrink-0" />
                    <p className="text-sm text-text-muted flex-1">
                      Pro stores unlimited quiz history and lets you compare results over time.
                    </p>
                    <Link href="/pro" className="text-xs text-accent font-semibold hover:underline whitespace-nowrap">
                      Upgrade →
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* ── ACCOUNT TAB ── */}
            {activeTab === 'account' && (
              <div className="max-w-2xl space-y-6">

                {/* Edit profile */}
                <div className="glass-panel rounded-2xl overflow-hidden">
                  <div className="flex items-center justify-between px-6 py-5 border-b border-border">
                    <h3 className="font-heading text-sm font-bold text-text-primary">Profile</h3>
                    {!editing ? (
                      <button onClick={() => setEditing(true)}
                        className="flex items-center gap-1.5 text-xs text-accent hover:underline">
                        <Pencil className="w-3 h-3" /> Edit
                      </button>
                    ) : (
                      <div className="flex items-center gap-2">
                        <button onClick={() => setEditing(false)} className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-white/[0.02] transition-colors">
                          <X className="w-4 h-4" />
                        </button>
                        <button onClick={handleSaveProfile} disabled={saving}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-accent text-bg-primary text-xs font-bold hover:bg-accent/90 transition-colors disabled:opacity-60">
                          {saving ? 'Saving...' : <><Check className="w-3.5 h-3.5" /> Save</>}
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="p-6 space-y-5">
                    <div>
                      <label className="text-[11px] font-semibold text-text-muted uppercase tracking-[0.12em] mb-2 block">Name</label>
                      {editing ? (
                        <input
                          value={editName}
                          onChange={e => setEditName(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl bg-bg-elevated border border-border focus:border-accent/40 focus:outline-none text-sm text-text-primary transition-colors"
                        />
                      ) : (
                        <p className="text-sm text-text-primary">{displayName || '—'}</p>
                      )}
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-text-muted uppercase tracking-[0.12em] mb-2 block">Email</label>
                      <p className="text-sm text-text-muted">{user.email}</p>
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-text-muted uppercase tracking-[0.12em] mb-2 block">Job title</label>
                      {editing ? (
                        <input
                          value={editJobTitle}
                          onChange={e => setEditJobTitle(e.target.value)}
                          placeholder="e.g. Software Engineer"
                          className="w-full px-4 py-2.5 rounded-xl bg-bg-elevated border border-border focus:border-accent/40 focus:outline-none text-sm text-text-primary transition-colors"
                        />
                      ) : (
                        <p className="text-sm text-text-primary">{profile?.job_title || <span className="text-text-muted">Not set</span>}</p>
                      )}
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-text-muted uppercase tracking-[0.12em] mb-2 block">Passport</label>
                      {editing ? (
                        <div className="space-y-2">
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
                            <input
                              value={passportSearch}
                              onChange={e => setPassportSearch(e.target.value)}
                              placeholder="Search passports..."
                              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-bg-elevated border border-border focus:border-accent/40 focus:outline-none text-sm text-text-primary transition-colors"
                            />
                          </div>
                          <div className="max-h-48 overflow-y-auto rounded-xl border border-border bg-bg-elevated">
                            {filteredPassports.map(p => (
                              <button
                                key={p.slug}
                                onClick={() => { setEditPassport(p.slug); setPassportSearch('') }}
                                className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-white/[0.03] transition-colors text-left ${editPassport === p.slug ? 'text-accent' : 'text-text-primary'}`}
                              >
                                <span>{p.flag}</span>
                                <span className="flex-1">{p.name}</span>
                                {editPassport === p.slug && <Check className="w-3.5 h-3.5" />}
                              </button>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-text-primary">
                          {passportData ? `${passportData.flag} ${passportData.name}` : <span className="text-text-muted">Not set</span>}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Subscription */}
                <div className="glass-panel rounded-2xl overflow-hidden">
                  <div className="px-6 py-5 border-b border-border">
                    <h3 className="font-heading text-sm font-bold text-text-primary">Subscription</h3>
                  </div>
                  <div className="p-6">
                    {isPro ? (
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center flex-shrink-0">
                          <Sparkles className="w-5 h-5 text-accent" />
                        </div>
                        <div>
                          <p className="font-heading font-bold text-text-primary">Origio Pro</p>
                          <p className="text-[11px] text-text-muted">One-time purchase · Active forever</p>
                        </div>
                        <span className="ml-auto text-xs px-2.5 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent font-bold">Active</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-bg-elevated border border-border flex items-center justify-center flex-shrink-0">
                          <Globe2 className="w-5 h-5 text-text-muted" />
                        </div>
                        <div>
                          <p className="font-heading font-bold text-text-primary">Free plan</p>
                          <p className="text-[11px] text-text-muted">Top 3 results · Basic features</p>
                        </div>
                        <Link href="/pro" className="ml-auto cta-button px-4 py-2 rounded-xl text-xs inline-flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5" /> Upgrade — €5
                        </Link>
                      </div>
                    )}
                  </div>
                </div>

                {/* Danger zone */}
                <div className="glass-panel rounded-2xl overflow-hidden border border-rose-500/10">
                  <div className="px-6 py-5 border-b border-rose-500/10">
                    <h3 className="font-heading text-sm font-bold text-rose-400">Danger zone</h3>
                  </div>
                  <div className="p-6 space-y-3">
                    <button onClick={handleSignOut}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-text-muted hover:text-text-primary hover:bg-white/[0.02] border border-transparent hover:border-border transition-all"
                    >
                      <LogOut className="w-4 h-4" /> Sign out
                    </button>

                    {!showDeleteConfirm ? (
                      <button onClick={() => setShowDeleteConfirm(true)}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-rose-400 hover:bg-rose-500/5 border border-transparent hover:border-rose-500/20 transition-all"
                      >
                        <Trash2 className="w-4 h-4" /> Delete account
                      </button>
                    ) : (
                      <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-4">
                        <div className="flex items-start gap-3 mb-4">
                          <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-semibold text-rose-400">Delete account permanently?</p>
                            <p className="text-[11px] text-text-muted mt-1">All your data, saved countries, and quiz results will be deleted. This cannot be undone.</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button onClick={() => setShowDeleteConfirm(false)}
                            className="flex-1 py-2 rounded-xl border border-border text-sm text-text-muted hover:text-text-primary transition-colors">
                            Cancel
                          </button>
                          <button onClick={handleDeleteAccount} disabled={deleteLoading}
                            className="flex-1 py-2 rounded-xl bg-rose-500 text-white text-sm font-semibold hover:bg-rose-600 transition-colors disabled:opacity-60">
                            {deleteLoading ? 'Deleting...' : 'Yes, delete'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

          </div>
        </section>
      </main>

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <footer className="border-t border-border mt-10">
        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Globe2 className="w-4 h-4 text-accent" />
            <span className="font-heading text-sm font-bold text-text-primary">Origio</span>
            <span className="text-text-muted text-xs ml-2">© 2026</span>
          </div>
          <div className="flex items-center gap-5 text-xs text-text-muted">
            <Link href="/about" className="hover:text-text-primary transition-colors">About</Link>
            <Link href="/faq" className="hover:text-text-primary transition-colors">FAQ</Link>
            <a href="mailto:hello@findorigio.com" className="hover:text-text-primary transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  )
}