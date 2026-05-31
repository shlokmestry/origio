'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import {
  Search, Check, X, ArrowRight, ArrowLeft,
  Code2, Bot, BarChart2, Cloud, GitBranch, Shield, LayoutDashboard,
  PenTool, Palette, Stethoscope, Heart, Smile, Pill, Activity, Brain,
  Microscope, TrendingUp, Receipt, Scale, Building, HardHat, Leaf,
  Plane, BookOpen, Users, BarChart, Megaphone, Package, Zap, ChefHat,
  type LucideIcon,
} from 'lucide-react'

// ── Design tokens ─────────────────────────────────────────────────────────────
const C = {
  bg:      '#0a0a0a',
  surface: '#111111',
  border:  '#222222',
  borderMd:'#333333',
  primary: '#f0f0e8',
  muted:   '#555550',
  dim:     '#3a3a38',
  accent:  '#00ffd5',
}
const HEAD = "'Cabinet Grotesk', sans-serif"
const BODY = "'Satoshi', sans-serif"

// ── Countries ─────────────────────────────────────────────────────────────────
const COUNTRIES = [
  { slug: 'united-states',  name: 'United States',   flag: '🇺🇸' },
  { slug: 'united-kingdom', name: 'United Kingdom',  flag: '🇬🇧' },
  { slug: 'canada',         name: 'Canada',          flag: '🇨🇦' },
  { slug: 'australia',      name: 'Australia',       flag: '🇦🇺' },
  { slug: 'germany',        name: 'Germany',         flag: '🇩🇪' },
  { slug: 'france',         name: 'France',          flag: '🇫🇷' },
  { slug: 'netherlands',    name: 'Netherlands',     flag: '🇳🇱' },
  { slug: 'sweden',         name: 'Sweden',          flag: '🇸🇪' },
  { slug: 'norway',         name: 'Norway',          flag: '🇳🇴' },
  { slug: 'denmark',        name: 'Denmark',         flag: '🇩🇰' },
  { slug: 'finland',        name: 'Finland',         flag: '🇫🇮' },
  { slug: 'switzerland',    name: 'Switzerland',     flag: '🇨🇭' },
  { slug: 'singapore',      name: 'Singapore',       flag: '🇸🇬' },
  { slug: 'japan',          name: 'Japan',           flag: '🇯🇵' },
  { slug: 'south-korea',    name: 'South Korea',     flag: '🇰🇷' },
  { slug: 'new-zealand',    name: 'New Zealand',     flag: '🇳🇿' },
  { slug: 'ireland',        name: 'Ireland',         flag: '🇮🇪' },
  { slug: 'portugal',       name: 'Portugal',        flag: '🇵🇹' },
  { slug: 'spain',          name: 'Spain',           flag: '🇪🇸' },
  { slug: 'italy',          name: 'Italy',           flag: '🇮🇹' },
  { slug: 'austria',        name: 'Austria',         flag: '🇦🇹' },
  { slug: 'belgium',        name: 'Belgium',         flag: '🇧🇪' },
  { slug: 'poland',         name: 'Poland',          flag: '🇵🇱' },
  { slug: 'romania',        name: 'Romania',         flag: '🇷🇴' },
  { slug: 'india',          name: 'India',           flag: '🇮🇳' },
  { slug: 'brazil',         name: 'Brazil',          flag: '🇧🇷' },
  { slug: 'uae',            name: 'UAE',             flag: '🇦🇪' },
  { slug: 'china',          name: 'China',           flag: '🇨🇳' },
  { slug: 'mexico',         name: 'Mexico',          flag: '🇲🇽' },
  { slug: 'south-africa',   name: 'South Africa',    flag: '🇿🇦' },
  { slug: 'nigeria',        name: 'Nigeria',         flag: '🇳🇬' },
  { slug: 'philippines',    name: 'Philippines',     flag: '🇵🇭' },
  { slug: 'malaysia',       name: 'Malaysia',        flag: '🇲🇾' },
  { slug: 'turkey',         name: 'Turkey',          flag: '🇹🇷' },
  { slug: 'ukraine',        name: 'Ukraine',         flag: '🇺🇦' },
  { slug: 'ghana',          name: 'Ghana',           flag: '🇬🇭' },
  { slug: 'pakistan',       name: 'Pakistan',        flag: '🇵🇰' },
  { slug: 'indonesia',      name: 'Indonesia',       flag: '🇮🇩' },
  { slug: 'egypt',          name: 'Egypt',           flag: '🇪🇬' },
  { slug: 'argentina',      name: 'Argentina',       flag: '🇦🇷' },
  { slug: 'colombia',       name: 'Colombia',        flag: '🇨🇴' },
  { slug: 'kenya',          name: 'Kenya',           flag: '🇰🇪' },
  { slug: 'thailand',       name: 'Thailand',        flag: '🇹🇭' },
  { slug: 'vietnam',        name: 'Vietnam',         flag: '🇻🇳' },
  { slug: 'greece',         name: 'Greece',          flag: '🇬🇷' },
  { slug: 'czechia',        name: 'Czechia',         flag: '🇨🇿' },
  { slug: 'hungary',        name: 'Hungary',         flag: '🇭🇺' },
]

// ── Job roles ─────────────────────────────────────────────────────────────────
const JOB_ROLES: { key: string; label: string; icon: LucideIcon }[] = [
  { key: 'softwareEngineer',        label: 'Software Engineer',     icon: Code2 },
  { key: 'aiMlEngineer',            label: 'AI / ML Engineer',      icon: Bot },
  { key: 'dataScientist',           label: 'Data Scientist',        icon: BarChart2 },
  { key: 'cloudArchitect',          label: 'Cloud Architect',       icon: Cloud },
  { key: 'devOps',                  label: 'DevOps Engineer',       icon: GitBranch },
  { key: 'cybersecurity',           label: 'Cybersecurity',         icon: Shield },
  { key: 'productManager',          label: 'Product Manager',       icon: LayoutDashboard },
  { key: 'uxDesigner',              label: 'UX Designer',           icon: PenTool },
  { key: 'graphicDesigner',         label: 'Graphic Designer',      icon: Palette },
  { key: 'doctor',                  label: 'Doctor',                icon: Stethoscope },
  { key: 'nurse',                   label: 'Nurse',                 icon: Heart },
  { key: 'dentist',                 label: 'Dentist',               icon: Smile },
  { key: 'pharmacist',              label: 'Pharmacist',            icon: Pill },
  { key: 'physiotherapist',         label: 'Physiotherapist',       icon: Activity },
  { key: 'psychologist',            label: 'Psychologist',          icon: Brain },
  { key: 'biomedicalEngineer',      label: 'Biomedical Engineer',   icon: Microscope },
  { key: 'financialAnalyst',        label: 'Financial Analyst',     icon: TrendingUp },
  { key: 'accountant',              label: 'Accountant',            icon: Receipt },
  { key: 'lawyer',                  label: 'Lawyer',                icon: Scale },
  { key: 'architect',               label: 'Architect',             icon: Building },
  { key: 'civilEngineer',           label: 'Civil Engineer',        icon: HardHat },
  { key: 'renewableEnergyEngineer', label: 'Renewable Energy Eng.', icon: Leaf },
  { key: 'pilot',                   label: 'Pilot',                 icon: Plane },
  { key: 'teacher',                 label: 'Teacher',               icon: BookOpen },
  { key: 'hrManager',               label: 'HR Manager',            icon: Users },
  { key: 'salesManager',            label: 'Sales Manager',         icon: BarChart },
  { key: 'marketingManager',        label: 'Marketing Manager',     icon: Megaphone },
  { key: 'supplyChainManager',      label: 'Supply Chain Manager',  icon: Package },
  { key: 'electrician',             label: 'Electrician',           icon: Zap },
  { key: 'chef',                    label: 'Chef',                  icon: ChefHat },
]

const NO_DUAL: Record<string, string> = {
  'india':       'India does not recognise dual citizenship.',
  'china':       'China does not recognise dual citizenship.',
  'japan':       'Japan requires citizens to choose one nationality by age 22.',
  'singapore':   'Singapore does not allow dual citizenship.',
  'uae':         'The UAE does not permit dual citizenship for its nationals.',
  'indonesia':   'Indonesia does not permit dual citizenship for adults.',
  'malaysia':    'Malaysia does not allow dual citizenship.',
  'south-korea': 'South Korea generally does not permit dual citizenship for adults.',
}

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [userId, setUserId] = useState<string | null>(null)

  // Step 1
  const [passportSearch, setPassportSearch] = useState('')
  const [passportSlug, setPassportSlug] = useState<string | null>(null)
  const [showSecond, setShowSecond] = useState(false)
  const [secondSearch, setSecondSearch] = useState('')
  const [secondSlug, setSecondSlug] = useState<string | null>(null)

  // Step 2
  const [roleSearch, setRoleSearch] = useState('')
  const [selectedRole, setSelectedRole] = useState<string | null>(null)
  const [customJob, setCustomJob] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) { router.push('/profile'); return }
      setUserId(data.user.id)
      supabase.from('profiles').select('onboarded').eq('id', data.user.id).single()
        .then(({ data: p }) => { if (p?.onboarded) router.push('/profile') })
    })
  }, [router])

  const filtered = COUNTRIES.filter(c =>
    c.name.toLowerCase().includes(passportSearch.toLowerCase()) && c.slug !== secondSlug
  )
  const filteredSecond = COUNTRIES.filter(c =>
    c.name.toLowerCase().includes(secondSearch.toLowerCase()) && c.slug !== passportSlug
  )
  const filteredRoles = JOB_ROLES.filter(r =>
    r.label.toLowerCase().includes(roleSearch.toLowerCase())
  )

  const selectedCountry = passportSlug ? COUNTRIES.find(c => c.slug === passportSlug) : null
  const secondCountry = secondSlug ? COUNTRIES.find(c => c.slug === secondSlug) : null

  const dualWarn = (() => {
    if (!passportSlug || !secondSlug) return null
    if (NO_DUAL[passportSlug]) return NO_DUAL[passportSlug]
    if (NO_DUAL[secondSlug]) return NO_DUAL[secondSlug]
    return null
  })()

  const jobTitle = selectedRole
    ? (JOB_ROLES.find(r => r.key === selectedRole)?.label ?? customJob)
    : customJob

  const canFinish = userId && jobTitle.trim().length >= 2

  const handleFinish = async () => {
    if (!canFinish) return
    setSaving(true)
    await supabase.from('profiles').upsert({
      id: userId, passport_slug: passportSlug,
      second_passport_slug: secondSlug,
      job_title: jobTitle.trim(), onboarded: true,
    }, { onConflict: 'id' })
    router.push('/profile')
  }

  return (
    <div style={{ minHeight: '100vh', background: C.bg, color: C.primary, fontFamily: BODY }}>
      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .ob-step { animation: slideIn 0.35s cubic-bezier(0.22,1,0.36,1) both; }
        .country-chip:hover { background: rgba(240,240,232,0.08) !important; }
        .country-chip.selected { background: ${C.primary} !important; color: ${C.bg} !important; }
        .country-chip.selected span { color: ${C.bg} !important; }
        .role-tile:hover { background: rgba(240,240,232,0.07) !important; border-color: rgba(240,240,232,0.18) !important; }
        .role-tile.selected { background: ${C.primary} !important; border-color: ${C.primary} !important; }
        .role-tile.selected .role-label { color: ${C.bg} !important; }
        input:focus { outline: none; border-color: rgba(240,240,232,0.3) !important; }
        ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(240,240,232,0.12); border-radius: 2px; }
      `}</style>

      {/* ── Header bar ── */}
      <div style={{ borderBottom: `1px solid ${C.border}`, padding: '0 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 56 }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/origiologo1.png" alt="Origio" style={{ height: 18, width: 'auto', display: 'block' }} />
        </div>

        {/* Step indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          {[1, 2].map(n => (
            <div key={n} style={{
              height: 2, width: 32, borderRadius: 1, transition: 'background 0.3s',
              background: step >= n ? C.primary : C.dim,
            }} />
          ))}
        </div>

        <div style={{ width: 80 }} /> {/* spacer */}
      </div>

      {/* ── Main content ── */}
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '60px 40px 80px' }}>

        {/* ══ STEP 1: Passport ══════════════════════════════════════════════ */}
        {step === 1 && (
          <div className="ob-step">
            {/* Step label */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
              <span style={{ fontFamily: HEAD, fontSize: 72, fontWeight: 800, lineHeight: 1, letterSpacing: '-0.05em', color: C.dim }}>01</span>
              <div style={{ height: 1, flex: 1, background: C.border }} />
              <span style={{ fontFamily: BODY, fontSize: 10, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: C.muted }}>of 02</span>
            </div>

            <h1 style={{ fontFamily: HEAD, fontSize: 'clamp(36px, 5vw, 52px)', fontWeight: 800, letterSpacing: '-0.03em', textTransform: 'uppercase', color: C.primary, margin: '0 0 8px', lineHeight: 0.92 }}>
              Which passport<br />do you hold?
            </h1>
            <p style={{ fontSize: 14, color: C.muted, marginBottom: 36, lineHeight: 1.6 }}>
              We use this to calculate your visa options across all 37 countries.
            </p>

            {/* Selected passport display */}
            {selectedCountry && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 20px', background: C.surface, border: `1px solid ${C.borderMd}`, borderRadius: 0, marginBottom: 20 }}>
                <span style={{ fontSize: 28, lineHeight: 1 }}>{selectedCountry.flag}</span>
                <div style={{ flex: 1 }}>
                  <p style={{ fontFamily: HEAD, fontSize: 18, fontWeight: 800, letterSpacing: '-0.02em', color: C.primary, margin: 0 }}>{selectedCountry.name}</p>
                  <p style={{ fontFamily: BODY, fontSize: 11, color: C.muted, margin: 0, marginTop: 2 }}>Primary passport selected</p>
                </div>
                <button onClick={() => setPassportSlug(null)} style={{ width: 28, height: 28, background: C.dim, border: 'none', borderRadius: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.muted, transition: 'background 0.15s' }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = C.borderMd}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = C.dim}>
                  <X size={12} />
                </button>
              </div>
            )}

            {/* Search */}
            <div style={{ position: 'relative', marginBottom: 16 }}>
              <Search size={14} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: C.muted, pointerEvents: 'none' }} />
              <input
                type="text"
                placeholder="Search country..."
                value={passportSearch}
                onChange={e => setPassportSearch(e.target.value)}
                style={{ width: '100%', background: C.surface, border: `1px solid ${C.border}`, borderRadius: 0, padding: '12px 16px 12px 40px', fontSize: 14, fontWeight: 500, color: C.primary, fontFamily: BODY, boxSizing: 'border-box', transition: 'border-color 0.15s' }}
              />
            </div>

            {/* Country grid */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, maxHeight: 300, overflowY: 'auto', padding: '2px 0' }}>
              {filtered.map(c => {
                const sel = passportSlug === c.slug
                return (
                  <button key={c.slug}
                    className={`country-chip${sel ? ' selected' : ''}`}
                    onClick={() => { setPassportSlug(c.slug); setPassportSearch('') }}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 14px', background: 'transparent', border: `1px solid ${sel ? C.primary : C.border}`, borderRadius: 0, cursor: 'pointer', transition: 'all 0.12s', fontFamily: BODY }}>
                    <span style={{ fontSize: 18, lineHeight: 1 }}>{c.flag}</span>
                    <span style={{ fontSize: 13, fontWeight: sel ? 700 : 500, color: sel ? C.bg : C.primary, whiteSpace: 'nowrap' }}>{c.name}</span>
                    {sel && <Check size={11} style={{ color: C.bg, marginLeft: 2 }} />}
                  </button>
                )
              })}
              {filtered.length === 0 && (
                <p style={{ fontSize: 13, color: C.muted, padding: '20px 0' }}>No countries found.</p>
              )}
            </div>

            {/* Second passport */}
            {passportSlug && (
              <div style={{ marginTop: 24, borderTop: `1px solid ${C.border}`, paddingTop: 24 }}>
                {!showSecond ? (
                  <button onClick={() => setShowSecond(true)}
                    style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.muted, background: 'none', border: `1px dashed ${C.border}`, padding: '10px 18px', cursor: 'pointer', transition: 'all 0.15s', borderRadius: 0, fontFamily: BODY }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = C.borderMd; (e.currentTarget as HTMLElement).style.color = C.primary }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = C.border; (e.currentTarget as HTMLElement).style.color = C.muted }}>
                    + Add second passport
                  </button>
                ) : (
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                      <span style={{ fontFamily: BODY, fontSize: 10, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: C.muted }}>Second passport</span>
                      <button onClick={() => { setShowSecond(false); setSecondSlug(null); setSecondSearch('') }}
                        style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.muted, background: 'none', border: 'none', cursor: 'pointer', fontFamily: BODY }}
                        onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = C.primary}
                        onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = C.muted}>
                        Remove
                      </button>
                    </div>

                    {secondCountry && (
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 14px', background: C.surface, border: `1px solid ${C.borderMd}`, borderRadius: 0, marginBottom: 12 }}>
                        <span style={{ fontSize: 18 }}>{secondCountry.flag}</span>
                        <span style={{ fontSize: 13, fontWeight: 600, color: C.primary }}>{secondCountry.name}</span>
                        <button onClick={() => setSecondSlug(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.muted, display: 'flex', padding: 2 }}>
                          <X size={11} />
                        </button>
                      </div>
                    )}

                    <div style={{ position: 'relative', marginBottom: 12 }}>
                      <Search size={13} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: C.muted, pointerEvents: 'none' }} />
                      <input type="text" placeholder="Search country..." value={secondSearch} onChange={e => setSecondSearch(e.target.value)}
                        style={{ width: '100%', background: C.surface, border: `1px solid ${C.border}`, borderRadius: 0, padding: '10px 14px 10px 36px', fontSize: 13, color: C.primary, fontFamily: BODY, boxSizing: 'border-box' }} />
                    </div>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, maxHeight: 200, overflowY: 'auto' }}>
                      {filteredSecond.map(c => {
                        const sel = secondSlug === c.slug
                        return (
                          <button key={c.slug}
                            className={`country-chip${sel ? ' selected' : ''}`}
                            onClick={() => { setSecondSlug(c.slug); setSecondSearch('') }}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 12px', background: 'transparent', border: `1px solid ${sel ? C.primary : C.border}`, borderRadius: 0, cursor: 'pointer', transition: 'all 0.12s', fontFamily: BODY }}>
                            <span style={{ fontSize: 15 }}>{c.flag}</span>
                            <span style={{ fontSize: 12, fontWeight: sel ? 700 : 500, color: sel ? C.bg : C.primary }}>{c.name}</span>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Dual citizenship warning */}
            {dualWarn && (
              <div style={{ marginTop: 16, padding: '12px 16px', background: 'rgba(250,204,21,0.05)', border: '1px solid rgba(250,204,21,0.2)', borderRadius: 0 }}>
                <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(250,204,21,0.9)', margin: '0 0 4px' }}>⚠ Dual citizenship note</p>
                <p style={{ fontSize: 12, color: 'rgba(250,204,21,0.6)', lineHeight: 1.6, margin: 0 }}>{dualWarn}</p>
              </div>
            )}

            {/* Actions */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 48, borderTop: `1px solid ${C.border}`, paddingTop: 32 }}>
              <button onClick={() => { setPassportSlug(null); setStep(2) }}
                style={{ fontFamily: BODY, fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: C.muted, background: 'none', border: 'none', cursor: 'pointer', padding: '8px 0', transition: 'color 0.15s' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = C.primary}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = C.muted}>
                Skip for now
              </button>
              <button onClick={() => setStep(2)}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: C.primary, color: C.bg, border: 'none', borderRadius: 100, padding: '13px 28px', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: BODY, transition: 'background 0.15s' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#dcdcd4'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = C.primary}>
                Continue <ArrowRight size={14} />
              </button>
            </div>
          </div>
        )}

        {/* ══ STEP 2: Job Role ══════════════════════════════════════════════ */}
        {step === 2 && (
          <div className="ob-step">
            {/* Step label */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
              <span style={{ fontFamily: HEAD, fontSize: 72, fontWeight: 800, lineHeight: 1, letterSpacing: '-0.05em', color: C.dim }}>02</span>
              <div style={{ height: 1, flex: 1, background: C.border }} />
              <span style={{ fontFamily: BODY, fontSize: 10, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: C.muted }}>of 02</span>
            </div>

            <h1 style={{ fontFamily: HEAD, fontSize: 'clamp(36px, 5vw, 52px)', fontWeight: 800, letterSpacing: '-0.03em', textTransform: 'uppercase', color: C.primary, margin: '0 0 8px', lineHeight: 0.92 }}>
              What do<br />you do?
            </h1>
            <p style={{ fontSize: 14, color: C.muted, marginBottom: 32, lineHeight: 1.6 }}>
              We show you local salaries for your role. Pick yours or type a custom one below.
            </p>

            {/* Search roles */}
            <div style={{ position: 'relative', marginBottom: 20 }}>
              <Search size={14} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: C.muted, pointerEvents: 'none' }} />
              <input
                type="text"
                placeholder="Filter roles..."
                value={roleSearch}
                onChange={e => setRoleSearch(e.target.value)}
                style={{ width: '100%', background: C.surface, border: `1px solid ${C.border}`, borderRadius: 0, padding: '12px 16px 12px 40px', fontSize: 14, fontWeight: 500, color: C.primary, fontFamily: BODY, boxSizing: 'border-box', transition: 'border-color 0.15s' }}
              />
            </div>

            {/* Role grid — 3 columns */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6, marginBottom: 24 }}>
              {filteredRoles.map(r => {
                const sel = selectedRole === r.key
                const Icon = r.icon
                return (
                  <button key={r.key}
                    className={`role-tile${sel ? ' selected' : ''}`}
                    onClick={() => { setSelectedRole(sel ? null : r.key); setCustomJob('') }}
                    style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', padding: '14px 16px', background: 'transparent', border: `1px solid ${sel ? C.primary : C.border}`, borderRadius: 0, cursor: 'pointer', transition: 'all 0.12s', textAlign: 'left', fontFamily: BODY, gap: 8 }}>
                    <Icon size={18} color={sel ? C.bg : C.muted} strokeWidth={1.75} />
                    <span className="role-label" style={{ fontSize: 12, fontWeight: 600, color: sel ? C.bg : C.primary, lineHeight: 1.3 }}>{r.label}</span>
                  </button>
                )
              })}
              {filteredRoles.length === 0 && (
                <div style={{ gridColumn: '1/-1', padding: '20px 0' }}>
                  <p style={{ fontSize: 13, color: C.muted }}>No roles matched. Use the field below.</p>
                </div>
              )}
            </div>

            {/* Custom / override input */}
            <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 20, marginBottom: 4 }}>
              <p style={{ fontFamily: BODY, fontSize: 10, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: C.muted, marginBottom: 10 }}>
                {selectedRole ? 'Override with custom title' : 'Or type your own'}
              </p>
              <input
                type="text"
                placeholder={selectedRole ? JOB_ROLES.find(r => r.key === selectedRole)?.label ?? '' : 'e.g. Freelancer, Student, Product Designer...'}
                value={customJob}
                onChange={e => { setCustomJob(e.target.value); if (e.target.value) setSelectedRole(null) }}
                onKeyDown={e => { if (e.key === 'Enter' && canFinish) handleFinish() }}
                style={{ width: '100%', background: C.surface, border: `1px solid ${C.border}`, borderRadius: 0, padding: '12px 16px', fontSize: 14, fontWeight: 500, color: C.primary, fontFamily: BODY, boxSizing: 'border-box', transition: 'border-color 0.15s' }}
              />
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 48, borderTop: `1px solid ${C.border}`, paddingTop: 32 }}>
              <button onClick={() => setStep(1)}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: BODY, fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: C.muted, background: 'none', border: 'none', cursor: 'pointer', padding: '8px 0', transition: 'color 0.15s' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = C.primary}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = C.muted}>
                <ArrowLeft size={13} /> Back
              </button>
              <button onClick={handleFinish} disabled={saving || !canFinish}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: canFinish ? C.primary : C.dim, color: canFinish ? C.bg : C.muted, border: 'none', borderRadius: 100, padding: '13px 32px', fontSize: 13, fontWeight: 700, cursor: canFinish ? 'pointer' : 'default', fontFamily: BODY, transition: 'background 0.15s, color 0.15s' }}
                onMouseEnter={e => { if (canFinish && !saving) (e.currentTarget as HTMLElement).style.background = '#dcdcd4' }}
                onMouseLeave={e => { if (canFinish) (e.currentTarget as HTMLElement).style.background = C.primary }}>
                {saving ? 'Saving...' : 'Finish setup'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
