'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Globe2, ArrowRight, Search } from 'lucide-react'

// ─── Passport data ────────────────────────────────────────────────────────────

type PassportDesign = {
  name: string
  flag: string
  bgColor: string
  accentColor: string
  textColor: string
  pattern: 'lines' | 'dots' | 'waves' | 'grid'
  emblem: string
  coverText: string
}

const PASSPORTS: Record<string, PassportDesign> = {
  'united-states': { name: 'United States', flag: '🇺🇸', bgColor: '#1a3055', accentColor: '#c8a84b', textColor: '#ffffff', pattern: 'lines', emblem: '🦅', coverText: 'PASSPORT' },
  'united-kingdom': { name: 'United Kingdom', flag: '🇬🇧', bgColor: '#012169', accentColor: '#c8a84b', textColor: '#ffffff', pattern: 'lines', emblem: '👑', coverText: 'PASSPORT' },
  'canada': { name: 'Canada', flag: '🇨🇦', bgColor: '#cc0001', accentColor: '#ffffff', textColor: '#ffffff', pattern: 'lines', emblem: '🍁', coverText: 'PASSPORT' },
  'australia': { name: 'Australia', flag: '🇦🇺', bgColor: '#00205b', accentColor: '#c8a84b', textColor: '#ffffff', pattern: 'dots', emblem: '🦘', coverText: 'PASSPORT' },
  'germany': { name: 'Germany', flag: '🇩🇪', bgColor: '#2a2a2a', accentColor: '#c8a84b', textColor: '#ffffff', pattern: 'lines', emblem: '🦅', coverText: 'REISEPASS' },
  'france': { name: 'France', flag: '🇫🇷', bgColor: '#002395', accentColor: '#c8a84b', textColor: '#ffffff', pattern: 'waves', emblem: '⚜️', coverText: 'PASSEPORT' },
  'netherlands': { name: 'Netherlands', flag: '🇳🇱', bgColor: '#ae1c28', accentColor: '#c8a84b', textColor: '#ffffff', pattern: 'lines', emblem: '👑', coverText: 'PASPOORT' },
  'sweden': { name: 'Sweden', flag: '🇸🇪', bgColor: '#006aa7', accentColor: '#fecc02', textColor: '#ffffff', pattern: 'grid', emblem: '⚜️', coverText: 'PASS' },
  'norway': { name: 'Norway', flag: '🇳🇴', bgColor: '#ef2b2d', accentColor: '#ffffff', textColor: '#ffffff', pattern: 'lines', emblem: '🦁', coverText: 'PASS' },
  'denmark': { name: 'Denmark', flag: '🇩🇰', bgColor: '#c60c30', accentColor: '#ffffff', textColor: '#ffffff', pattern: 'lines', emblem: '👑', coverText: 'PAS' },
  'finland': { name: 'Finland', flag: '🇫🇮', bgColor: '#003580', accentColor: '#ffffff', textColor: '#ffffff', pattern: 'lines', emblem: '🦁', coverText: 'PASSI' },
  'switzerland': { name: 'Switzerland', flag: '🇨🇭', bgColor: '#d52b1e', accentColor: '#ffffff', textColor: '#ffffff', pattern: 'dots', emblem: '✚', coverText: 'PASSEPORT' },
  'singapore': { name: 'Singapore', flag: '🇸🇬', bgColor: '#c8102e', accentColor: '#ffffff', textColor: '#ffffff', pattern: 'lines', emblem: '🦁', coverText: 'PASSPORT' },
  'japan': { name: 'Japan', flag: '🇯🇵', bgColor: '#1a3a6b', accentColor: '#c8a84b', textColor: '#ffffff', pattern: 'waves', emblem: '🌸', coverText: 'パスポート' },
  'south-korea': { name: 'South Korea', flag: '🇰🇷', bgColor: '#003478', accentColor: '#c8a84b', textColor: '#ffffff', pattern: 'lines', emblem: '☯️', coverText: '여권' },
  'new-zealand': { name: 'New Zealand', flag: '🇳🇿', bgColor: '#00205b', accentColor: '#c8a84b', textColor: '#ffffff', pattern: 'dots', emblem: '🌿', coverText: 'PASSPORT' },
  'ireland': { name: 'Ireland', flag: '🇮🇪', bgColor: '#169b62', accentColor: '#c8a84b', textColor: '#ffffff', pattern: 'lines', emblem: '🍀', coverText: 'PASSPORT' },
  'portugal': { name: 'Portugal', flag: '🇵🇹', bgColor: '#006600', accentColor: '#c8a84b', textColor: '#ffffff', pattern: 'lines', emblem: '⚔️', coverText: 'PASSAPORTE' },
  'spain': { name: 'Spain', flag: '🇪🇸', bgColor: '#aa151b', accentColor: '#c8a84b', textColor: '#ffffff', pattern: 'lines', emblem: '👑', coverText: 'PASAPORTE' },
  'italy': { name: 'Italy', flag: '🇮🇹', bgColor: '#009246', accentColor: '#c8a84b', textColor: '#ffffff', pattern: 'lines', emblem: '⭐', coverText: 'PASSAPORTO' },
  'austria': { name: 'Austria', flag: '🇦🇹', bgColor: '#ed2939', accentColor: '#c8a84b', textColor: '#ffffff', pattern: 'lines', emblem: '🦅', coverText: 'REISEPASS' },
  'india': { name: 'India', flag: '🇮🇳', bgColor: '#046A38', accentColor: '#FF9933', textColor: '#ffffff', pattern: 'lines', emblem: '⚖️', coverText: 'PASSPORT' },
  'brazil': { name: 'Brazil', flag: '🇧🇷', bgColor: '#009C3B', accentColor: '#FEDD00', textColor: '#ffffff', pattern: 'dots', emblem: '⭐', coverText: 'PASSAPORTE' },
  'uae': { name: 'UAE', flag: '🇦🇪', bgColor: '#00732f', accentColor: '#c8a84b', textColor: '#ffffff', pattern: 'lines', emblem: '🦅', coverText: 'PASSPORT' },
  'mexico': { name: 'Mexico', flag: '🇲🇽', bgColor: '#006847', accentColor: '#c8a84b', textColor: '#ffffff', pattern: 'lines', emblem: '🦅', coverText: 'PASAPORTE' },
  'china': { name: 'China', flag: '🇨🇳', bgColor: '#de2910', accentColor: '#ffde00', textColor: '#ffffff', pattern: 'lines', emblem: '⭐', coverText: '护照' },
  'pakistan': { name: 'Pakistan', flag: '🇵🇰', bgColor: '#01411C', accentColor: '#ffffff', textColor: '#ffffff', pattern: 'lines', emblem: '🌙', coverText: 'PASSPORT' },
  'nigeria': { name: 'Nigeria', flag: '🇳🇬', bgColor: '#008751', accentColor: '#c8a84b', textColor: '#ffffff', pattern: 'lines', emblem: '🦅', coverText: 'PASSPORT' },
  'ghana': { name: 'Ghana', flag: '🇬🇭', bgColor: '#006b3f', accentColor: '#fcd116', textColor: '#ffffff', pattern: 'lines', emblem: '⭐', coverText: 'PASSPORT' },
  'south-africa': { name: 'South Africa', flag: '🇿🇦', bgColor: '#007A4D', accentColor: '#FFB612', textColor: '#ffffff', pattern: 'lines', emblem: '🦅', coverText: 'PASSPORT' },
  'philippines': { name: 'Philippines', flag: '🇵🇭', bgColor: '#0038a8', accentColor: '#fcd116', textColor: '#ffffff', pattern: 'lines', emblem: '☀️', coverText: 'PASSPORT' },
  'malaysia': { name: 'Malaysia', flag: '🇲🇾', bgColor: '#cc0001', accentColor: '#ffd700', textColor: '#ffffff', pattern: 'lines', emblem: '🌙', coverText: 'PASPORT' },
  'turkey': { name: 'Turkey', flag: '🇹🇷', bgColor: '#e30a17', accentColor: '#ffffff', textColor: '#ffffff', pattern: 'lines', emblem: '🌙', coverText: 'PASAPORT' },
  'poland': { name: 'Poland', flag: '🇵🇱', bgColor: '#dc143c', accentColor: '#ffffff', textColor: '#ffffff', pattern: 'lines', emblem: '🦅', coverText: 'PASZPORT' },
  'ukraine': { name: 'Ukraine', flag: '🇺🇦', bgColor: '#005bbb', accentColor: '#ffd500', textColor: '#ffffff', pattern: 'lines', emblem: '🌾', coverText: 'ПАСПОРТ' },
}

const PASSPORT_LIST = Object.entries(PASSPORTS).map(([slug, d]) => ({ slug, ...d }))

// ─── Passport SVG ─────────────────────────────────────────────────────────────

function PassportSVG({ design, small }: { design: PassportDesign; small?: boolean }) {
  const pid = `p-${design.name.replace(/\W/g, '')}`
  const patterns: Record<string, JSX.Element> = {
    lines: <pattern id={pid} x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse"><line x1="0" y1="0" x2="0" y2="20" stroke={design.accentColor} strokeWidth="0.4" opacity="0.15" /></pattern>,
    dots: <pattern id={pid} x="0" y="0" width="16" height="16" patternUnits="userSpaceOnUse"><circle cx="8" cy="8" r="1" fill={design.accentColor} opacity="0.2" /></pattern>,
    waves: <pattern id={pid} x="0" y="0" width="40" height="20" patternUnits="userSpaceOnUse"><path d="M0 10 Q10 0 20 10 Q30 20 40 10" stroke={design.accentColor} strokeWidth="0.5" fill="none" opacity="0.15" /></pattern>,
    grid: <pattern id={pid} x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse"><line x1="0" y1="0" x2="0" y2="20" stroke={design.accentColor} strokeWidth="0.3" opacity="0.12" /><line x1="0" y1="0" x2="20" y2="0" stroke={design.accentColor} strokeWidth="0.3" opacity="0.12" /></pattern>,
  }
  return (
    <svg viewBox="0 0 200 280" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-2xl">
      <defs>{patterns[design.pattern]}</defs>
      <rect x="0" y="0" width="200" height="280" rx="8" fill={design.bgColor} />
      <rect x="0" y="0" width="200" height="280" rx="8" fill={`url(#${pid})`} />
      <rect x="0" y="0" width="200" height="5" fill={design.accentColor} opacity="0.5" />
      <rect x="0" y="275" width="200" height="5" fill={design.accentColor} opacity="0.5" />
      <rect x="0" y="0" width="5" height="280" fill={design.accentColor} opacity="0.25" />
      <circle cx="100" cy="110" r="36" fill={design.accentColor} opacity="0.1" />
      <circle cx="100" cy="110" r="32" fill="none" stroke={design.accentColor} strokeWidth="0.8" opacity="0.35" />
      <text x="100" y="120" textAnchor="middle" fontSize="30" fill={design.textColor} opacity="0.9">{design.emblem}</text>
      <text x="100" y="168" textAnchor="middle" fontSize={small ? "7" : "8"} fill={design.accentColor} opacity="0.8" letterSpacing="3" fontFamily="serif" fontWeight="bold">{design.name.toUpperCase()}</text>
      <text x="100" y="186" textAnchor="middle" fontSize="10" fill={design.textColor} opacity="0.65" letterSpacing="4" fontFamily="serif">{design.coverText}</text>
      <text x="100" y="225" textAnchor="middle" fontSize="22" opacity="0.9">{design.flag}</text>
      <rect x="10" y="248" width="180" height="3" rx="1" fill={design.accentColor} opacity="0.1" />
      <rect x="10" y="255" width="180" height="3" rx="1" fill={design.accentColor} opacity="0.1" />
      <rect x="10" y="262" width="120" height="3" rx="1" fill={design.accentColor} opacity="0.1" />
    </svg>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [userId, setUserId] = useState<string | null>(null)

  const [passportSearch, setPassportSearch] = useState('')
  const [passportSlug, setPassportSlug] = useState<string | null>(null)

  const [jobTitle, setJobTitle] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) { router.push('/profile'); return }
      setUserId(data.user.id)
      // If already onboarded, skip to profile
      supabase.from('profiles').select('onboarded').eq('id', data.user.id).single().then(({ data: p }) => {
        if (p?.onboarded) router.push('/profile')
      })
    })
  }, [router])

  const filteredPassports = PASSPORT_LIST.filter(p =>
    p.name.toLowerCase().includes(passportSearch.toLowerCase())
  )

  const selectedPassport = passportSlug ? PASSPORTS[passportSlug] : null

  const handleFinish = async () => {
    if (!userId || !jobTitle.trim()) return
    setSaving(true)
    await supabase.from('profiles').upsert({
      id: userId,
      passport_slug: passportSlug,
      job_title: jobTitle.trim(),
      onboarded: true,
    }, { onConflict: 'id' })
    router.push('/profile')
  }

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col">
      {/* Logo */}
      <div className="flex items-center justify-center gap-2 pt-10 pb-8">
        <Globe2 className="w-6 h-6 text-accent" />
        <span className="font-heading text-xl font-extrabold text-text-primary">Origio</span>
      </div>

      {/* Progress */}
      <div className="flex items-center justify-center gap-2 mb-10">
        <div className={`h-1 w-16 rounded-full transition-all ${step >= 1 ? 'bg-accent' : 'bg-border'}`} />
        <div className={`h-1 w-16 rounded-full transition-all ${step >= 2 ? 'bg-accent' : 'bg-border'}`} />
      </div>

      <div className="flex-1 flex items-start justify-center px-4">
        <div className="w-full max-w-lg">

          {/* ── Step 1: Passport ── */}
          {step === 1 && (
            <div className="animate-fade-up" style={{ opacity: 0, animationFillMode: 'forwards' }}>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent mb-3">Step 1 of 2</p>
              <h1 className="font-heading text-3xl sm:text-4xl font-extrabold text-text-primary mb-2">
                Which passport do you hold?
              </h1>
              <p className="text-text-muted text-sm mb-8">
                This helps us show you the most relevant visa routes and options.
              </p>

              <div className="flex gap-6">
                {/* Selector */}
                <div className="flex-1">
                  <div className="relative mb-3">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                    <input
                      placeholder="Search country..."
                      value={passportSearch}
                      onChange={e => setPassportSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-bg-elevated border border-border rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:border-accent/40 focus:outline-none focus:ring-1 focus:ring-accent/20 transition-colors"
                    />
                  </div>
                  <div className="grid grid-cols-1 gap-1.5 max-h-72 overflow-y-auto pr-1">
                    {filteredPassports.map(p => (
                      <button
                        key={p.slug}
                        onClick={() => setPassportSlug(p.slug)}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-left transition-all border ${
                          passportSlug === p.slug
                            ? 'border-accent/50 bg-accent/10 text-text-primary'
                            : 'border-border bg-bg-elevated hover:border-accent/20 hover:bg-accent/5 text-text-muted hover:text-text-primary'
                        }`}
                      >
                        <span className="text-lg">{p.flag}</span>
                        <span>{p.name}</span>
                        {passportSlug === p.slug && (
                          <span className="ml-auto text-accent text-xs">✓</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Passport preview */}
                <div className="w-32 flex-shrink-0 flex flex-col items-center pt-1">
                  {selectedPassport ? (
                    <div className="w-full animate-fade-in">
                      <PassportSVG design={selectedPassport} small />
                      <p className="text-center text-xs text-text-muted mt-2">{selectedPassport.name}</p>
                    </div>
                  ) : (
                    <div className="w-full h-44 rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-2 p-3">
                      <span className="text-3xl opacity-20">🛂</span>
                      <p className="text-xs text-text-muted text-center">Select to preview</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between mt-8">
                <button
                  onClick={() => { setPassportSlug(null); setStep(2) }}
                  className="text-sm text-text-muted hover:text-text-primary transition-colors"
                >
                  Skip for now
                </button>
                <button
                  onClick={() => setStep(2)}
                  className="cta-button px-6 py-3 rounded-xl text-sm flex items-center gap-2"
                >
                  Next <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ── Step 2: Job ── */}
          {step === 2 && (
            <div className="animate-fade-up" style={{ opacity: 0, animationFillMode: 'forwards' }}>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent mb-3">Step 2 of 2</p>
              <h1 className="font-heading text-3xl sm:text-4xl font-extrabold text-text-primary mb-2">
                What do you do?
              </h1>
              <p className="text-text-muted text-sm mb-8">
                Tell us your job, field, or if you're a student — anything works.
              </p>

              <input
                type="text"
                placeholder="e.g. Software Engineer, Student, Marketing Manager..."
                value={jobTitle}
                onChange={e => setJobTitle(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && jobTitle.trim()) handleFinish() }}
                autoFocus
                className="w-full px-4 py-4 bg-bg-elevated border border-border rounded-2xl text-base text-text-primary placeholder:text-text-muted focus:border-accent/40 focus:outline-none focus:ring-1 focus:ring-accent/20 transition-colors mb-3"
              />
              <p className="text-xs text-text-muted mb-10">Free text — write whatever describes you best.</p>

              <div className="flex items-center justify-between">
                <button onClick={() => setStep(1)} className="text-sm text-text-muted hover:text-text-primary transition-colors">
                  ← Back
                </button>
                <button
                  onClick={handleFinish}
                  disabled={!jobTitle.trim() || saving}
                  className="cta-button px-6 py-3 rounded-xl text-sm flex items-center gap-2 disabled:opacity-40"
                >
                  {saving ? 'Saving...' : 'Go to my profile'} <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}