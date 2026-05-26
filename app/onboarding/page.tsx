'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { ArrowRight, ArrowLeft, Search, Check, X } from 'lucide-react'

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

const JOB_SUGGESTIONS = [
  'Software Engineer', 'Nurse', 'Teacher', 'Designer', 'Marketing',
  'Accountant', 'Student', 'Freelancer', 'Consultant', 'Doctor',
]

const S = {
  bg: '#050508',
  card: '#0d0d10',
  border: 'rgba(255,255,255,0.08)',
  borderMd: 'rgba(255,255,255,0.14)',
  borderInput: 'rgba(255,255,255,0.10)',
  dim: 'rgba(255,255,255,0.38)',
  dimmer: 'rgba(255,255,255,0.18)',
  serif: "'Cabinet Grotesk', sans-serif",
  sans: "'Satoshi', sans-serif",
}

function PassportSVG({ design }: { design: PassportDesign }) {
  const pid = `p-${design.name.replace(/\W/g, '')}`
  const patterns: Record<string, React.ReactElement> = {
    lines: <pattern id={pid} x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse"><line x1="0" y1="0" x2="0" y2="20" stroke={design.accentColor} strokeWidth="0.4" opacity="0.15" /></pattern>,
    dots: <pattern id={pid} x="0" y="0" width="16" height="16" patternUnits="userSpaceOnUse"><circle cx="8" cy="8" r="1" fill={design.accentColor} opacity="0.2" /></pattern>,
    waves: <pattern id={pid} x="0" y="0" width="40" height="20" patternUnits="userSpaceOnUse"><path d="M0 10 Q10 0 20 10 Q30 20 40 10" stroke={design.accentColor} strokeWidth="0.5" fill="none" opacity="0.15" /></pattern>,
    grid: <pattern id={pid} x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse"><line x1="0" y1="0" x2="0" y2="20" stroke={design.accentColor} strokeWidth="0.3" opacity="0.12" /><line x1="0" y1="0" x2="20" y2="0" stroke={design.accentColor} strokeWidth="0.3" opacity="0.12" /></pattern>,
  }
  return (
    <svg viewBox="0 0 200 280" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
      <defs>{patterns[design.pattern]}</defs>
      <rect x="0" y="0" width="200" height="280" rx="6" fill={design.bgColor} />
      <rect x="0" y="0" width="200" height="280" rx="6" fill={`url(#${pid})`} />
      <rect x="0" y="0" width="200" height="4" fill={design.accentColor} opacity="0.5" />
      <rect x="0" y="276" width="200" height="4" fill={design.accentColor} opacity="0.5" />
      <circle cx="100" cy="110" r="36" fill={design.accentColor} opacity="0.1" />
      <circle cx="100" cy="110" r="32" fill="none" stroke={design.accentColor} strokeWidth="0.8" opacity="0.35" />
      <text x="100" y="120" textAnchor="middle" fontSize="30" fill={design.textColor} opacity="0.9">{design.emblem}</text>
      <text x="100" y="168" textAnchor="middle" fontSize="7" fill={design.accentColor} opacity="0.8" letterSpacing="3" fontFamily="Cabinet Grotesk, sans-serif" fontWeight="bold">{design.name.toUpperCase()}</text>
      <text x="100" y="186" textAnchor="middle" fontSize="10" fill={design.textColor} opacity="0.65" letterSpacing="4" fontFamily="Cabinet Grotesk, sans-serif">{design.coverText}</text>
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
  const [secondPassportSlug, setSecondPassportSlug] = useState<string | null>(null)
  const [secondPassportSearch, setSecondPassportSearch] = useState('')
  const [showSecondPassport, setShowSecondPassport] = useState(false)
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
    p.name.toLowerCase().includes(passportSearch.toLowerCase()) && p.slug !== secondPassportSlug
  )
  const filteredSecondPassports = PASSPORT_LIST.filter(p =>
    p.name.toLowerCase().includes(secondPassportSearch.toLowerCase()) && p.slug !== passportSlug
  )
  const selectedPassport = passportSlug ? PASSPORTS[passportSlug] : null
  const selectedSecondPassport = secondPassportSlug ? PASSPORTS[secondPassportSlug] : null

  const NO_DUAL_SLUGS: Record<string, string> = {
    'india': 'India does not recognise dual citizenship. If you hold another passport, you are no longer an Indian citizen — you may hold OCI (Overseas Citizen of India) instead.',
    'china': 'China does not recognise dual citizenship. Naturalising elsewhere means renouncing Chinese citizenship.',
    'japan': 'Japan requires citizens to choose one nationality by age 22. Holding another passport means you have renounced Japanese citizenship.',
    'singapore': 'Singapore does not allow dual citizenship. Acquiring another nationality automatically terminates Singapore citizenship.',
    'uae': 'The UAE does not permit dual citizenship for its nationals. Naturalisation elsewhere requires renouncing UAE citizenship.',
    'indonesia': 'Indonesia does not permit dual citizenship for adults. A second passport means Indonesian citizenship has been relinquished.',
    'malaysia': 'Malaysia does not allow dual citizenship. Acquiring another nationality results in automatic loss of Malaysian citizenship.',
    'south-korea': 'South Korea generally does not permit dual citizenship for adults. Exceptions apply in limited circumstances.',
  }

  const dualConflictWarning = (() => {
    if (!passportSlug || !secondPassportSlug) return null
    if (NO_DUAL_SLUGS[passportSlug]) return { country: PASSPORTS[passportSlug]?.name, message: NO_DUAL_SLUGS[passportSlug] }
    if (NO_DUAL_SLUGS[secondPassportSlug]) return { country: PASSPORTS[secondPassportSlug]?.name, message: NO_DUAL_SLUGS[secondPassportSlug] }
    return null
  })()

  const handleFinish = async () => {
    if (!userId || jobTitle.trim().length < 2) return
    setSaving(true)
    await supabase.from('profiles').upsert({
      id: userId, passport_slug: passportSlug,
      second_passport_slug: secondPassportSlug,
      job_title: jobTitle.trim(), onboarded: true,
    }, { onConflict: 'id' })
    router.push('/profile')
  }

  return (
    <div style={{ minHeight: '100vh', background: S.bg, color: '#fff', fontFamily: S.sans, display: 'flex', flexDirection: 'column' }}>

      {/* ── Logo ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '40px 0 32px' }}>
        <div style={{ width: 14, height: 14, background: '#fff', borderRadius: 3 }} />
        <span style={{ fontSize: 13, fontWeight: 800, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#fff' }}>Origio</span>
      </div>

      {/* ── Progress dots ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, marginBottom: 56 }}>
        {[1, 2].map(n => (
          <div key={n} style={{
            height: 2, width: 48, borderRadius: 2, transition: 'background 0.4s ease',
            background: step > n ? 'rgba(255,255,255,0.85)' : step === n ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.10)',
          }} />
        ))}
      </div>

      {/* ── Stage ── */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '0 24px 80px' }}>
        <div style={{ width: '100%', maxWidth: 520 }}>

          {/* ── Step 1: Passport ── */}
          {step === 1 && (
            <div style={{ animation: 'fadeUp 0.4s cubic-bezier(0.22,1,0.36,1) both' }}>
              <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: S.dim, marginBottom: 14 }}>
                Step 1 of 2
              </p>
              <h1 style={{ fontFamily: S.serif, fontSize: 'clamp(28px,5vw,40px)', fontWeight: 400, lineHeight: 1.08, color: '#fff', marginBottom: 10 }}>
                Which passport do you hold?
              </h1>
              <p style={{ fontSize: 13, fontWeight: 500, color: S.dim, lineHeight: 1.6, marginBottom: 28 }}>
                This helps us show you the most relevant visa routes and options.
              </p>

              <div style={{ display: 'flex', gap: 20 }}>
                {/* Left: search + list */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  {/* Selected pill */}
                  {selectedPassport && (
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '9px 14px', background: 'rgba(255,255,255,0.06)', border: `1px solid rgba(255,255,255,0.16)`, borderRadius: 100, marginBottom: 10 }}>
                      <span style={{ fontSize: 18 }}>{selectedPassport.flag}</span>
                      <span style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>{selectedPassport.name}</span>
                      <button onClick={() => setPassportSlug(null)}
                        style={{ width: 18, height: 18, borderRadius: '50%', background: 'rgba(255,255,255,0.12)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <X style={{ width: 9, height: 9, color: 'rgba(255,255,255,0.7)' }} />
                      </button>
                    </div>
                  )}

                  {/* Search input */}
                  <div style={{ position: 'relative', marginBottom: 8 }}>
                    <Search style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', width: 15, height: 15, color: S.dimmer, pointerEvents: 'none' }} />
                    <input
                      type="text"
                      placeholder="Search country..."
                      value={passportSearch}
                      onChange={e => setPassportSearch(e.target.value)}
                      style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: `1px solid ${S.borderInput}`, borderRadius: 12, padding: '13px 16px 13px 42px', fontSize: 14, fontWeight: 500, color: '#fff', outline: 'none', fontFamily: S.sans, boxSizing: 'border-box', transition: 'border-color 0.2s' }}
                      onFocus={e => (e.target as HTMLElement).style.borderColor = 'rgba(255,255,255,0.35)'}
                      onBlur={e => (e.target as HTMLElement).style.borderColor = S.borderInput}
                    />
                  </div>

                  {/* Country list */}
                  <div style={{ border: `1px solid ${S.border}`, borderRadius: 12, overflow: 'hidden', maxHeight: 240, overflowY: 'auto', background: S.card }}>
                    {filteredPassports.map(p => (
                      <button key={p.slug} onClick={() => { setPassportSlug(p.slug); setPassportSearch('') }}
                        style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '11px 16px', background: passportSlug === p.slug ? 'rgba(255,255,255,0.07)' : 'transparent', border: 'none', borderBottom: `1px solid rgba(255,255,255,0.04)`, cursor: 'pointer', textAlign: 'left', transition: 'background 0.12s' }}
                        onMouseEnter={e => { if (passportSlug !== p.slug) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)' }}
                        onMouseLeave={e => { if (passportSlug !== p.slug) (e.currentTarget as HTMLElement).style.background = 'transparent' }}>
                        <span style={{ fontSize: 18, lineHeight: 1, flexShrink: 0 }}>{p.flag}</span>
                        <span style={{ fontSize: 14, fontWeight: 500, color: passportSlug === p.slug ? '#fff' : 'rgba(255,255,255,0.75)', flex: 1 }}>{p.name}</span>
                        {passportSlug === p.slug && (
                          <span style={{ width: 16, height: 16, borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <Check style={{ width: 9, height: 9, color: '#0a0a0a' }} />
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Right: passport preview */}
                <div style={{ width: 110, flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 4 }}>
                  {selectedPassport ? (
                    <div style={{ width: '100%' }}>
                      <PassportSVG design={selectedPassport} />
                    </div>
                  ) : (
                    <div style={{ width: '100%', aspectRatio: '200/280', border: `1px dashed rgba(255,255,255,0.12)`, borderRadius: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                      <span style={{ fontSize: 28, opacity: 0.2 }}>🛂</span>
                      <p style={{ fontSize: 10, fontWeight: 700, color: S.dimmer, textAlign: 'center', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Select to preview</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Second passport toggle */}
              {passportSlug && (
                <div style={{ marginTop: 20 }}>
                  {!showSecondPassport ? (
                    <button onClick={() => setShowSecondPassport(true)}
                      style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.06em', color: S.dim, background: 'rgba(255,255,255,0.04)', border: `1px dashed rgba(255,255,255,0.14)`, borderRadius: 10, padding: '10px 16px', cursor: 'pointer', width: '100%', textAlign: 'left', transition: 'border-color 0.15s, color 0.15s' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.28)'; (e.currentTarget as HTMLElement).style.color = '#fff' }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.14)'; (e.currentTarget as HTMLElement).style.color = S.dim }}>
                      + Add second passport
                    </button>
                  ) : (
                    <div style={{ border: `1px solid rgba(255,255,255,0.10)`, borderRadius: 12, padding: 14 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: S.dim }}>Second Passport</span>
                        <button onClick={() => { setShowSecondPassport(false); setSecondPassportSlug(null); setSecondPassportSearch('') }}
                          style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: S.dimmer, background: 'none', border: 'none', cursor: 'pointer' }}>
                          Remove
                        </button>
                      </div>
                      {selectedSecondPassport && (
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '7px 12px', background: 'rgba(255,255,255,0.06)', border: `1px solid rgba(255,255,255,0.12)`, borderRadius: 100, marginBottom: 8 }}>
                          <span style={{ fontSize: 16 }}>{selectedSecondPassport.flag}</span>
                          <span style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>{selectedSecondPassport.name}</span>
                          <button onClick={() => setSecondPassportSlug(null)}
                            style={{ width: 16, height: 16, borderRadius: '50%', background: 'rgba(255,255,255,0.12)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <X style={{ width: 8, height: 8, color: 'rgba(255,255,255,0.7)' }} />
                          </button>
                        </div>
                      )}
                      <div style={{ position: 'relative', marginBottom: 6 }}>
                        <Search style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 13, height: 13, color: S.dimmer, pointerEvents: 'none' }} />
                        <input type="text" placeholder="Search country..." value={secondPassportSearch}
                          onChange={e => setSecondPassportSearch(e.target.value)}
                          style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: `1px solid ${S.borderInput}`, borderRadius: 10, padding: '11px 14px 11px 36px', fontSize: 13, fontWeight: 500, color: '#fff', outline: 'none', fontFamily: S.sans, boxSizing: 'border-box' }} />
                      </div>
                      <div style={{ border: `1px solid ${S.border}`, borderRadius: 10, overflow: 'hidden', maxHeight: 180, overflowY: 'auto', background: S.card }}>
                        {filteredSecondPassports.map(p => (
                          <button key={p.slug} onClick={() => { setSecondPassportSlug(p.slug); setSecondPassportSearch('') }}
                            style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '9px 14px', background: secondPassportSlug === p.slug ? 'rgba(255,255,255,0.07)' : 'transparent', border: 'none', borderBottom: `1px solid rgba(255,255,255,0.04)`, cursor: 'pointer', textAlign: 'left' }}>
                            <span style={{ fontSize: 16 }}>{p.flag}</span>
                            <span style={{ fontSize: 13, fontWeight: 500, color: secondPassportSlug === p.slug ? '#fff' : 'rgba(255,255,255,0.75)', flex: 1 }}>{p.name}</span>
                            {secondPassportSlug === p.slug && (
                              <span style={{ width: 14, height: 14, borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Check style={{ width: 8, height: 8, color: '#0a0a0a' }} />
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Dual citizenship conflict warning */}
              {dualConflictWarning && (
                <div style={{ marginTop: 16, padding: '12px 16px', background: 'rgba(255,200,50,0.06)', border: '1px solid rgba(255,200,50,0.22)', borderRadius: 10 }}>
                  <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,200,50,0.85)', marginBottom: 4 }}>
                    ⚠ {dualConflictWarning.country} — No Dual Citizenship
                  </p>
                  <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}>
                    {dualConflictWarning.message}
                  </p>
                </div>
              )}

              {/* Actions */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 36 }}>
                <button onClick={() => { setPassportSlug(null); setStep(2) }}
                  style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: S.dim, background: 'none', border: 'none', cursor: 'pointer', padding: '8px 0', transition: 'color 0.15s' }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = '#fff'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = S.dim}>
                  Skip for now
                </button>
                <button onClick={() => setStep(2)}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#fff', color: '#0a0a0a', border: 'none', borderRadius: 100, padding: '13px 28px', fontSize: 13, fontWeight: 700, cursor: 'pointer', boxShadow: '0 2px 16px rgba(255,255,255,0.10)', transition: 'background 0.15s, transform 0.1s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#ebebeb'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#fff'; (e.currentTarget as HTMLElement).style.transform = 'translateY(0)' }}>
                  Continue <ArrowRight style={{ width: 14, height: 14 }} />
                </button>
              </div>
            </div>
          )}

          {/* ── Step 2: Job title ── */}
          {step === 2 && (
            <div style={{ animation: 'fadeUp 0.4s cubic-bezier(0.22,1,0.36,1) both' }}>
              <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: S.dim, marginBottom: 14 }}>
                Step 2 of 2
              </p>
              <h1 style={{ fontFamily: S.serif, fontSize: 'clamp(28px,5vw,40px)', fontWeight: 400, lineHeight: 1.08, color: '#fff', marginBottom: 10 }}>
                What do you do?
              </h1>
              <p style={{ fontSize: 13, fontWeight: 500, color: S.dim, lineHeight: 1.6, marginBottom: 28 }}>
                Tell us your job, field, or if you're a student — anything works.
              </p>

              {/* Job input */}
              <input
                type="text"
                placeholder="e.g. Software Engineer, Student, Marketing Manager..."
                value={jobTitle}
                onChange={e => setJobTitle(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && jobTitle.trim().length >= 2) handleFinish() }}
                autoFocus
                style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: `1px solid ${S.borderInput}`, borderRadius: 12, padding: '14px 16px', fontSize: 15, fontWeight: 500, color: '#fff', outline: 'none', fontFamily: S.sans, boxSizing: 'border-box', transition: 'border-color 0.2s, background 0.2s' }}
                onFocus={e => { (e.target as HTMLElement).style.borderColor = 'rgba(255,255,255,0.35)'; (e.target as HTMLElement).style.background = 'rgba(255,255,255,0.06)' }}
                onBlur={e => { (e.target as HTMLElement).style.borderColor = S.borderInput; (e.target as HTMLElement).style.background = 'rgba(255,255,255,0.04)' }}
              />

              {jobTitle.length > 0 && jobTitle.trim().length < 2 && (
                <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'rgba(255,90,90,0.85)', marginTop: 10 }}>
                  Please enter at least 2 characters
                </p>
              )}

              {/* Job suggestion pills */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginTop: 14 }}>
                {JOB_SUGGESTIONS.map(s => (
                  <button key={s} onClick={() => setJobTitle(s)}
                    style={{ fontSize: 12, fontWeight: 600, color: S.dim, border: `1px solid ${S.border}`, borderRadius: 100, padding: '5px 13px', background: 'transparent', cursor: 'pointer', transition: 'color 0.15s, border-color 0.15s, background 0.15s' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#fff'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.28)'; (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = S.dim; (e.currentTarget as HTMLElement).style.borderColor = S.border; (e.currentTarget as HTMLElement).style.background = 'transparent' }}>
                    {s}
                  </button>
                ))}
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 36 }}>
                <button onClick={() => setStep(1)}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: S.dim, background: 'none', border: 'none', cursor: 'pointer', padding: '8px 0', transition: 'color 0.15s' }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = '#fff'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = S.dim}>
                  <ArrowLeft style={{ width: 13, height: 13 }} /> Back
                </button>
                <button onClick={handleFinish} disabled={saving || jobTitle.trim().length < 2}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#fff', color: '#0a0a0a', border: 'none', borderRadius: 100, padding: '13px 32px', fontSize: 13, fontWeight: 700, cursor: jobTitle.trim().length >= 2 ? 'pointer' : 'default', opacity: (saving || jobTitle.trim().length < 2) ? 0.28 : 1, boxShadow: '0 2px 16px rgba(255,255,255,0.10)', transition: 'background 0.15s, transform 0.1s, opacity 0.2s' }}
                  onMouseEnter={e => { if (jobTitle.trim().length >= 2 && !saving) { (e.currentTarget as HTMLElement).style.background = '#ebebeb'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)' } }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#fff'; (e.currentTarget as HTMLElement).style.transform = 'translateY(0)' }}>
                  {saving ? 'Saving...' : 'Finish setup'}
                </button>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Fade-up keyframe */}
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}