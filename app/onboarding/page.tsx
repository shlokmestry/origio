'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { ArrowRight, Search, Check } from 'lucide-react'

type PassportDesign = {
  name: string; flag: string; bgColor: string; accentColor: string
  textColor: string; pattern: 'lines' | 'dots' | 'waves' | 'grid'; emblem: string; coverText: string
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
  'ireland': { name: 'Ireland', flag: '🇮🇪', bgColor: '#169b62', accentColor: '#c8a84b', textColor: '#ffffff', pattern: 'waves', emblem: '☘️', coverText: 'PAS' },
  'portugal': { name: 'Portugal', flag: '🇵🇹', bgColor: '#006600', accentColor: '#c8a84b', textColor: '#ffffff', pattern: 'lines', emblem: '⚔️', coverText: 'PASSAPORTE' },
  'spain': { name: 'Spain', flag: '🇪🇸', bgColor: '#c60b1e', accentColor: '#c8a84b', textColor: '#ffffff', pattern: 'lines', emblem: '👑', coverText: 'PASAPORTE' },
  'italy': { name: 'Italy', flag: '🇮🇹', bgColor: '#009246', accentColor: '#c8a84b', textColor: '#ffffff', pattern: 'waves', emblem: '⭐', coverText: 'PASSAPORTO' },
  'austria': { name: 'Austria', flag: '🇦🇹', bgColor: '#ed2939', accentColor: '#c8a84b', textColor: '#ffffff', pattern: 'lines', emblem: '🦅', coverText: 'REISEPASS' },
  'india': { name: 'India', flag: '🇮🇳', bgColor: '#003580', accentColor: '#ff9933', textColor: '#ffffff', pattern: 'dots', emblem: '☸️', coverText: 'PASSPORT' },
  'brazil': { name: 'Brazil', flag: '🇧🇷', bgColor: '#009c3b', accentColor: '#ffdf00', textColor: '#ffffff', pattern: 'lines', emblem: '⭐', coverText: 'PASSAPORTE' },
  'uae': { name: 'UAE', flag: '🇦🇪', bgColor: '#00732f', accentColor: '#c8a84b', textColor: '#ffffff', pattern: 'lines', emblem: '🦅', coverText: 'PASSPORT' },
  'china': { name: 'China', flag: '🇨🇳', bgColor: '#de2910', accentColor: '#ffde00', textColor: '#ffffff', pattern: 'lines', emblem: '⭐', coverText: '护照' },
  'mexico': { name: 'Mexico', flag: '🇲🇽', bgColor: '#006847', accentColor: '#c8a84b', textColor: '#ffffff', pattern: 'dots', emblem: '🦅', coverText: 'PASAPORTE' },
  'south-africa': { name: 'South Africa', flag: '🇿🇦', bgColor: '#007A4D', accentColor: '#FFB612', textColor: '#ffffff', pattern: 'lines', emblem: '🦅', coverText: 'PASSPORT' },
  'nigeria': { name: 'Nigeria', flag: '🇳🇬', bgColor: '#008751', accentColor: '#c8a84b', textColor: '#ffffff', pattern: 'lines', emblem: '🦅', coverText: 'PASSPORT' },
  'philippines': { name: 'Philippines', flag: '🇵🇭', bgColor: '#0038a8', accentColor: '#fcd116', textColor: '#ffffff', pattern: 'lines', emblem: '☀️', coverText: 'PASSPORT' },
  'malaysia': { name: 'Malaysia', flag: '🇲🇾', bgColor: '#cc0001', accentColor: '#ffd700', textColor: '#ffffff', pattern: 'lines', emblem: '🌙', coverText: 'PASPORT' },
  'turkey': { name: 'Turkey', flag: '🇹🇷', bgColor: '#e30a17', accentColor: '#ffffff', textColor: '#ffffff', pattern: 'lines', emblem: '🌙', coverText: 'PASAPORT' },
  'poland': { name: 'Poland', flag: '🇵🇱', bgColor: '#dc143c', accentColor: '#ffffff', textColor: '#ffffff', pattern: 'lines', emblem: '🦅', coverText: 'PASZPORT' },
  'ukraine': { name: 'Ukraine', flag: '🇺🇦', bgColor: '#005bbb', accentColor: '#ffd500', textColor: '#ffffff', pattern: 'lines', emblem: '🌾', coverText: 'ПАСПОРТ' },
  'ghana': { name: 'Ghana', flag: '🇬🇭', bgColor: '#006b3f', accentColor: '#fcd116', textColor: '#ffffff', pattern: 'lines', emblem: '⭐', coverText: 'PASSPORT' },
  'pakistan': { name: 'Pakistan', flag: '🇵🇰', bgColor: '#01411c', accentColor: '#ffffff', textColor: '#ffffff', pattern: 'lines', emblem: '🌙', coverText: 'PASSPORT' },
}

const PASSPORT_LIST = Object.entries(PASSPORTS).map(([slug, d]) => ({ slug, ...d }))

function PassportSVG({ design, small }: { design: PassportDesign; small?: boolean }) {
  const pid = `p-${design.name.replace(/\W/g, '')}`
  const patterns: Record<string, JSX.Element> = {
    lines: <pattern id={pid} x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse"><line x1="0" y1="0" x2="0" y2="20" stroke={design.accentColor} strokeWidth="0.4" opacity="0.15" /></pattern>,
    dots: <pattern id={pid} x="0" y="0" width="16" height="16" patternUnits="userSpaceOnUse"><circle cx="8" cy="8" r="1" fill={design.accentColor} opacity="0.2" /></pattern>,
    waves: <pattern id={pid} x="0" y="0" width="40" height="20" patternUnits="userSpaceOnUse"><path d="M0 10 Q10 0 20 10 Q30 20 40 10" stroke={design.accentColor} strokeWidth="0.5" fill="none" opacity="0.15" /></pattern>,
    grid: <pattern id={pid} x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse"><line x1="0" y1="0" x2="0" y2="20" stroke={design.accentColor} strokeWidth="0.3" opacity="0.12" /><line x1="0" y1="0" x2="20" y2="0" stroke={design.accentColor} strokeWidth="0.3" opacity="0.12" /></pattern>,
  }
  return (
    <svg viewBox="0 0 200 280" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>{patterns[design.pattern]}</defs>
      <rect x="0" y="0" width="200" height="280" rx="4" fill={design.bgColor} />
      <rect x="0" y="0" width="200" height="280" rx="4" fill={`url(#${pid})`} />
      <rect x="0" y="0" width="200" height="4" fill={design.accentColor} opacity="0.5" />
      <rect x="0" y="276" width="200" height="4" fill={design.accentColor} opacity="0.5" />
      <circle cx="100" cy="110" r="36" fill={design.accentColor} opacity="0.1" />
      <circle cx="100" cy="110" r="32" fill="none" stroke={design.accentColor} strokeWidth="0.8" opacity="0.35" />
      <text x="100" y="120" textAnchor="middle" fontSize="30" fill={design.textColor} opacity="0.9">{design.emblem}</text>
      <text x="100" y="168" textAnchor="middle" fontSize={small ? "7" : "8"} fill={design.accentColor} opacity="0.8" letterSpacing="3" fontFamily="serif" fontWeight="bold">{design.name.toUpperCase()}</text>
      <text x="100" y="186" textAnchor="middle" fontSize="10" fill={design.textColor} opacity="0.65" letterSpacing="4" fontFamily="serif">{design.coverText}</text>
      <text x="100" y="225" textAnchor="middle" fontSize="22" opacity="0.9">{design.flag}</text>
      <rect x="10" y="248" width="180" height="3" rx="0" fill={design.accentColor} opacity="0.1" />
      <rect x="10" y="255" width="180" height="3" rx="0" fill={design.accentColor} opacity="0.1" />
      <rect x="10" y="262" width="120" height="3" rx="0" fill={design.accentColor} opacity="0.1" />
    </svg>
  )
}

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
      supabase.from('profiles').select('onboarded').eq('id', data.user.id).single()
        .then(({ data: p }) => { if (p?.onboarded) router.push('/profile') })
    })
  }, [router])

  const filteredPassports = PASSPORT_LIST.filter(p =>
    p.name.toLowerCase().includes(passportSearch.toLowerCase())
  )
  const selectedPassport = passportSlug ? PASSPORTS[passportSlug] : null

  const handleFinish = async () => {
    if (!userId || jobTitle.trim().length < 2) return
    setSaving(true)
    await supabase.from('profiles').upsert({
      id: userId, passport_slug: passportSlug,
      job_title: jobTitle.trim(), onboarded: true,
    }, { onConflict: 'id' })
    router.push('/profile')
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-text-primary flex flex-col">

      {/* Logo */}
      <div className="flex items-center justify-center gap-2.5 pt-10 pb-8">
        <div className="w-4 h-4 bg-accent border-2 border-text-primary" />
        <span className="font-heading text-xl font-extrabold uppercase tracking-tight">Origio</span>
      </div>

      {/* Progress */}
      <div className="flex items-center justify-center gap-0 mb-10">
        <div className={`h-1.5 w-20 border-r border-[#0a0a0a] transition-all ${step >= 1 ? 'bg-accent' : 'bg-[#2a2a2a]'}`} />
        <div className={`h-1.5 w-20 transition-all ${step >= 2 ? 'bg-accent' : 'bg-[#2a2a2a]'}`} />
      </div>

      <div className="flex-1 flex items-start justify-center px-4 pb-12">
        <div className="w-full max-w-lg">

          {/* Step 1 — Passport */}
          {step === 1 && (
            <div className="animate-fade-up" style={{ opacity: 0, animationFillMode: 'forwards' }}>
              <p className="text-[9px] font-bold text-text-muted uppercase tracking-widest mb-3">step 1 of 2</p>
              <h1 className="font-heading text-3xl sm:text-4xl font-extrabold uppercase tracking-tight mb-2">
                Which passport do you hold?
              </h1>
              <p className="text-text-muted text-sm mb-8 font-medium">
                This helps us show you the most relevant visa routes and options.
              </p>

              <div className="flex gap-6">
                {/* Selector */}
                <div className="flex-1">
                  <div className="relative mb-2">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                    <input placeholder="Search country..." value={passportSearch}
                      onChange={e => setPassportSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-[#1a1a1a] border-2 border-[#2a2a2a] focus:border-accent text-sm text-text-primary placeholder:text-text-muted outline-none transition-colors font-medium" />
                  </div>
                  <div className="border-2 border-[#2a2a2a] max-h-72 overflow-y-auto">
                    {filteredPassports.map(p => (
                      <button key={p.slug} onClick={() => setPassportSlug(p.slug)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm text-left transition-colors border-b border-[#1a1a1a] last:border-0 ${
                          passportSlug === p.slug
                            ? 'bg-accent/10 text-text-primary'
                            : 'hover:bg-[#1a1a1a] text-text-muted hover:text-text-primary'
                        }`}>
                        <span className="text-lg">{p.flag}</span>
                        <span className="flex-1 font-medium">{p.name}</span>
                        {passportSlug === p.slug && <Check className="w-3.5 h-3.5 text-accent" />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Passport preview */}
                <div className="w-32 flex-shrink-0 flex flex-col items-center pt-1">
                  {selectedPassport ? (
                    <div className="w-full animate-fade-in">
                      <PassportSVG design={selectedPassport} small />
                      <p className="text-center text-[10px] font-bold text-text-muted mt-2 uppercase tracking-wide">{selectedPassport.name}</p>
                    </div>
                  ) : (
                    <div className="w-full h-44 border-2 border-dashed border-[#2a2a2a] flex flex-col items-center justify-center gap-2 p-3">
                      <span className="text-3xl opacity-20">🛂</span>
                      <p className="text-[10px] font-bold text-text-muted text-center uppercase tracking-wide">Select to preview</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between mt-8">
                <button onClick={() => { setPassportSlug(null); setStep(2) }}
                  className="text-xs font-bold text-text-muted hover:text-text-primary transition-colors uppercase tracking-wide">
                 I'll do this later
                </button>
                <button onClick={() => setStep(2)}
                  className="cta-button px-6 py-3 text-sm font-bold uppercase tracking-wide flex items-center gap-2">
                  Next <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 2 — Job */}
          {step === 2 && (
            <div className="animate-fade-up" style={{ opacity: 0, animationFillMode: 'forwards' }}>
             <p className="text-[9px] font-bold text-text-muted uppercase tracking-widest mb-3">step 2 of 2</p>
              <h1 className="font-heading text-3xl sm:text-4xl font-extrabold uppercase tracking-tight mb-2">
                What do you do?
              </h1>
              <p className="text-text-muted text-sm mb-8 font-medium">
                Tell us your job, field, or if you&apos;re a student — anything works.
              </p>

              <input
                type="text"
                placeholder="e.g. Software Engineer, Student, Marketing Manager..."
                value={jobTitle}
                onChange={e => setJobTitle(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && jobTitle.trim().length >= 2) handleFinish() }}
                autoFocus
                className="w-full px-4 py-4 bg-[#1a1a1a] border-2 border-[#2a2a2a] focus:border-accent text-base text-text-primary placeholder:text-text-muted outline-none transition-colors mb-2 font-medium"
              />

              {jobTitle.length > 0 && jobTitle.trim().length < 2 && (
                <p className="text-xs font-bold text-rose-400 mb-6 uppercase tracking-wide">Please enter at least 2 characters</p>
              )}

              <div className="flex items-center justify-between mt-8">
                <button onClick={() => setStep(1)}
                  className="ghost-button px-5 py-3 text-sm font-bold uppercase tracking-wide">
                  Back
                </button>
                <button onClick={handleFinish}
                  disabled={saving || jobTitle.trim().length < 2}
                  className="cta-button px-8 py-3 text-sm font-bold uppercase tracking-wide disabled:opacity-40 disabled:transform-none disabled:shadow-none">
                  {saving ? 'Saving...' : 'Finish Setup'}
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}