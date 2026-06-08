'use client'

import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import { FlagIcon } from '@/components/FlagIcon'
import { slugToIso } from '@/lib/flagCodes'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/AuthProvider'
import { getPassportStrength } from '@/lib/wizard'
import { getPlaybook, TRACKS, type Step, type StepStatus, type Track } from '@/lib/playbookSteps'

// ── Persisted state ─────────────────────────────────────────────────────────

interface PlaybookState {
  progress: Record<string, StepStatus>
  notes: Record<string, string>
  costs: Record<string, number>
  moveDate?: string
  updatedAt: number
}

const EMPTY: PlaybookState = { progress: {}, notes: {}, costs: {}, updatedAt: 0 }

// ── Design tokens (sharp corners, hard shadows, teal accent) ───────────────

const S = {
  bg:'#0a0a0a', card:'#111111', border:'#2a2a2a', borderDim:'#1a1a1a',
  dim:'rgba(240,240,232,0.45)', faint:'rgba(240,240,232,0.28)',
  text:'#f0f0e8', accent:'#00ffd5', amber:'#f0b07a', green:'#4ade80',
  serif:"'Cabinet Grotesk', sans-serif", sans:"'Satoshi', sans-serif",
}

// ── Date helpers ────────────────────────────────────────────────────────────

function startByDate(moveDate: string | undefined, daysBefore: number | undefined): Date | null {
  if (!moveDate || daysBefore == null) return null
  const d = new Date(moveDate + 'T00:00:00')
  if (isNaN(d.getTime())) return null
  d.setDate(d.getDate() - daysBefore)
  return d
}

function fmtDate(d: Date): string {
  return d.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })
}

function relativeBucket(daysBefore: number | undefined): string {
  if (daysBefore == null) return 'Anytime'
  if (daysBefore < 0) return 'After arrival'
  if (daysBefore >= 180) return '6+ months before'
  if (daysBefore >= 90) return '3–6 months before'
  if (daysBefore >= 30) return '1–3 months before'
  return 'Final weeks'
}

// ── Main component ─────────────────────────────────────────────────────────

export default function PlaybookPage() {
  const params = useParams()
  const slug = params.slug as string
  const { user, loading: authLoading, isPro } = useAuth()
  const proChecked = !authLoading

  const [countryName, setCountryName] = useState('')
  const [countryFlag, setCountryFlag] = useState('')
  const [answers, setAnswers] = useState<Record<string,string> | null>(null)
  const [answersLoaded, setAnswersLoaded] = useState(false)
  const [activeTrack, setActiveTrack] = useState<Track>('papers')
  const [view, setView] = useState<'tracks' | 'timeline'>('tracks')
  const [openNotes, setOpenNotes] = useState<Record<string, boolean>>({})

  const [state, setState] = useState<PlaybookState>(EMPTY)
  const STORAGE_KEY = `playbook_${slug}`
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Country name + flag
  useEffect(() => {
    const fallback = slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
    setCountryName(fallback)
    ;(async () => {
      try {
        const { data } = await supabase.from('countries').select('name, flag_emoji').eq('slug', slug).single()
        if (data) { setCountryName(data.name ?? fallback); setCountryFlag(data.flag_emoji ?? '') }
      } catch {}
    })()
  }, [slug])

  // Wizard answers
  useEffect(() => {
    try {
      const raw = localStorage.getItem('wizard_answers')
      if (raw) setAnswers(JSON.parse(raw))
    } catch {}
    setAnswersLoaded(true)
  }, [])

  // Load state: localStorage first, then reconcile with Supabase (Pro, signed-in)
  useEffect(() => {
    let local = EMPTY
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) local = { ...EMPTY, ...JSON.parse(raw) }
    } catch {}
    setState(local)

    if (!user || !isPro) return
    let cancelled = false
    ;(async () => {
      try {
        const { data } = await supabase
          .from('playbook_progress')
          .select('state, updated_at')
          .eq('user_id', user.id).eq('country_slug', slug)
          .single()
        if (cancelled || !data?.state) return
        const remote = { ...EMPTY, ...(data.state as PlaybookState), updatedAt: new Date(data.updated_at).getTime() }
        // newest wins
        if (remote.updatedAt > local.updatedAt) {
          setState(remote)
          localStorage.setItem(STORAGE_KEY, JSON.stringify(remote))
        }
      } catch {}
    })()
    return () => { cancelled = true }
  }, [STORAGE_KEY, user, isPro, slug])

  // Persist on change → localStorage immediately, Supabase debounced
  const persist = useCallback((next: PlaybookState) => {
    setState(next)
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)) } catch {}
    if (!user || !isPro) return
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => {
      supabase.from('playbook_progress').upsert({
        user_id: user.id, country_slug: slug,
        state: next, updated_at: new Date(next.updatedAt).toISOString(),
      }).then(() => {})
    }, 700)
  }, [STORAGE_KEY, user, isPro, slug])

  const update = useCallback((patch: Partial<PlaybookState>) => {
    persist({ ...state, ...patch, updatedAt: Date.now() })
  }, [state, persist])

  // Personalisation
  const passportSlug = answers?.passport ?? 'other'
  const personalised = answersLoaded && answers?.passport != null && passportSlug !== 'other'
  const passportTier = getPassportStrength(passportSlug)
  const EU_PASSPORTS = ['ireland','germany','france','netherlands','spain','portugal','sweden','norway','switzerland','austria','belgium','denmark','finland','italy','poland','romania','estonia','hungary','cyprus']
  const isEU = EU_PASSPORTS.includes(passportSlug)
  const workType = answers?.workType ?? 'employee'

  const { steps, currency, verified } = useMemo(
    () => getPlaybook(slug, passportTier, isEU, workType),
    [slug, passportTier, isEU, workType]
  )

  // Derived
  const doneCount = steps.filter(s => state.progress[s.id] === 'done').length
  const pct = steps.length ? Math.round((doneCount / steps.length) * 100) : 0
  const estTotal = steps.reduce((sum, s) => sum + (s.estCost ?? 0), 0)
  const actualTotal = Object.values(state.costs).reduce((a, b) => a + (b || 0), 0)

  const setStatus = (id: string, status: StepStatus) =>
    update({ progress: { ...state.progress, [id]: status } })
  const setNote = (id: string, text: string) =>
    update({ notes: { ...state.notes, [id]: text } })
  const setCost = (id: string, val: number) =>
    update({ costs: { ...state.costs, [id]: val } })

  // ── Gate ────────────────────────────────────────────────────────────────
  if (proChecked && !isPro) {
    return (
      <div style={{ background: S.bg, minHeight: '100vh', fontFamily: S.sans, paddingTop: 52 }}>
        <Nav countries={[]} onCountrySelect={() => {}} />
        <div style={{ maxWidth: 560, margin: '0 auto', padding: 'clamp(80px,10vw,120px) 24px 80px', textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 20 }}>🔒</div>
          <h1 style={{ fontFamily: S.serif, fontSize: 32, color: S.text, marginBottom: 12, fontWeight: 800, letterSpacing: '-0.02em' }}>The Playbook is Pro</h1>
          <p style={{ fontSize: 15, color: S.dim, lineHeight: 1.6, marginBottom: 32 }}>
            Your step-by-step move plan — visa, money, housing and life admin — personalised to your passport and timed to your move date.
          </p>
          <Link href="/pro" style={{ display: 'inline-block', background: S.accent, color: '#000', fontWeight: 800, fontSize: 12, letterSpacing: '0.15em', textTransform: 'uppercase', padding: '14px 32px', textDecoration: 'none' }}>
            Get Pro →
          </Link>
        </div>
        <Footer />
      </div>
    )
  }
  if (!proChecked) {
    return <div style={{ background: S.bg, minHeight: '100vh', paddingTop: 52 }}><Nav countries={[]} onCountrySelect={() => {}} /></div>
  }

  const isoCode = slugToIso(slug)
  const trackSteps = steps.filter(s => s.track === activeTrack)
  const activeMeta = TRACKS.find(t => t.key === activeTrack)!

  // Timeline order: by start date if move date set, else by daysBefore desc
  const timelineSteps = [...steps].sort((a, b) => {
    const ax = a.daysBefore ?? -9999, bx = b.daysBefore ?? -9999
    return bx - ax
  })

  return (
    <div style={{ background: S.bg, color: S.text, minHeight: '100vh', fontFamily: S.sans, paddingTop: 52 }}>
      <Nav countries={[]} onCountrySelect={() => {}} />

      <div style={{ maxWidth: 880, margin: '0 auto', padding: 'clamp(48px,7vw,80px) clamp(20px,4vw,40px) 80px' }}>

        {/* Hero */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 18 }}>
          {isoCode ? <FlagIcon code={isoCode} size="xl" /> : <span style={{ fontSize: 52 }}>{countryFlag}</span>}
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: S.dim, marginBottom: 6 }}>Your Playbook</div>
            <h1 style={{ fontFamily: S.serif, fontSize: 'clamp(28px,4vw,44px)', fontWeight: 800, color: S.text, margin: 0, lineHeight: 1.05, letterSpacing: '-0.03em' }}>Moving to {countryName}</h1>
          </div>
        </div>

        {/* Personalisation badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 28 }}>
          {personalised ? (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 12px', border: `1px solid ${S.accent}40`, background: `${S.accent}10`, fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', color: S.accent, textTransform: 'uppercase' }}>
              ✦ Personalised · {passportSlug.replace(/-/g,' ').replace(/\b\w/g,c=>c.toUpperCase())} passport · {workType}
            </span>
          ) : (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 12px', border: `1px solid ${S.border}`, background: S.card, fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', color: S.dim, textTransform: 'uppercase' }}>
              Generic plan — not personalised
            </span>
          )}
          {verified && (
            <span title="Verified against official government sources" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 12px', border: `1px solid ${S.green}40`, background: `${S.green}10`, fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', color: S.green, textTransform: 'uppercase' }}>
              ✓ Source-verified
            </span>
          )}
        </div>

        {/* Empty state for non-personalised */}
        {answersLoaded && !personalised && (
          <div style={{ border: `1px solid ${S.accent}40`, background: `${S.accent}08`, padding: '16px 20px', marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
            <p style={{ margin: 0, fontSize: 13, color: S.text, lineHeight: 1.5 }}>
              This plan assumes a Tier {passportTier} passport. <span style={{ color: S.dim }}>Take the 2-minute wizard to tune the visa route to your passport.</span>
            </p>
            <Link href="/wizard" style={{ flexShrink: 0, padding: '9px 18px', background: S.accent, color: '#000', fontSize: 12, fontWeight: 700, letterSpacing: '0.04em', textDecoration: 'none', textTransform: 'uppercase' }}>Personalise →</Link>
          </div>
        )}

        {/* Readiness + move date */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 12, marginBottom: 12 }}>
          <div style={{ background: S.card, border: `1px solid ${S.border}`, padding: '20px 24px', boxShadow: '4px 4px 0 #000' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: S.dim }}>Move readiness</span>
              <span style={{ fontFamily: S.serif, fontSize: 26, fontWeight: 800, color: pct === 100 ? S.green : S.text }}>{pct}%</span>
            </div>
            <div style={{ height: 6, background: S.borderDim, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${pct}%`, background: pct === 100 ? S.green : S.accent, transition: 'width 0.4s ease' }} />
            </div>
            <div style={{ display: 'flex', gap: 16, marginTop: 14, flexWrap: 'wrap' }}>
              {TRACKS.map(t => {
                const ts = steps.filter(s => s.track === t.key)
                const td = ts.filter(s => state.progress[s.id] === 'done').length
                return (
                  <div key={t.key} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ width: 7, height: 7, background: t.color, display: 'inline-block' }} />
                    <span style={{ fontSize: 11, color: S.dim }}>{t.label}</span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: td === ts.length ? S.green : S.dim }}>{td}/{ts.length}</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Move date + cost tracker */}
          <div style={{ background: S.card, border: `1px solid ${S.border}`, padding: '20px 24px', boxShadow: '4px 4px 0 #000' }}>
            <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: S.dim, display: 'block', marginBottom: 10 }}>Target move date</label>
            <input
              type="date"
              value={state.moveDate ?? ''}
              onChange={e => update({ moveDate: e.target.value })}
              style={{ width: '100%', background: S.bg, border: `1px solid ${S.border}`, color: S.text, padding: '10px 12px', fontSize: 14, fontFamily: S.sans, colorScheme: 'dark', boxSizing: 'border-box' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 14, fontSize: 12 }}>
              <div>
                <div style={{ color: S.faint, textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: 10, fontWeight: 700, marginBottom: 3 }}>Est. cost</div>
                <div style={{ fontFamily: S.serif, fontSize: 18, fontWeight: 800, color: S.text }}>{currency}{estTotal.toLocaleString()}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ color: S.faint, textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: 10, fontWeight: 700, marginBottom: 3 }}>Spent so far</div>
                <div style={{ fontFamily: S.serif, fontSize: 18, fontWeight: 800, color: actualTotal > 0 ? S.accent : S.dim }}>{currency}{actualTotal.toLocaleString()}</div>
              </div>
            </div>
          </div>
        </div>

        {/* View toggle */}
        <div style={{ display: 'flex', gap: 0, margin: '24px 0 20px', border: `1px solid ${S.border}`, width: 'fit-content' }}>
          {(['tracks','timeline'] as const).map(v => (
            <button key={v} onClick={() => setView(v)} style={{
              padding: '9px 20px', background: view === v ? S.text : 'transparent',
              color: view === v ? '#000' : S.dim, border: 'none', cursor: 'pointer',
              fontFamily: S.sans, fontSize: 12, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
            }}>{v === 'tracks' ? 'By track' : 'Timeline'}</button>
          ))}
        </div>

        {/* TRACKS VIEW */}
        {view === 'tracks' && (
          <>
            <div style={{ display: 'flex', gap: 0, marginBottom: 20, flexWrap: 'wrap', border: `1px solid ${S.border}`, width: 'fit-content' }}>
              {TRACKS.map(t => {
                const ts = steps.filter(s => s.track === t.key)
                const td = ts.filter(s => state.progress[s.id] === 'done').length
                const isActive = activeTrack === t.key
                return (
                  <button key={t.key} onClick={() => setActiveTrack(t.key)} style={{
                    display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px',
                    background: isActive ? S.text : 'transparent', color: isActive ? '#000' : S.dim,
                    border: 'none', borderRight: `1px solid ${S.border}`, cursor: 'pointer',
                    fontFamily: S.sans, fontSize: 12, fontWeight: 700, letterSpacing: '0.04em',
                  }}>
                    <span style={{ width: 7, height: 7, background: t.color, display: 'inline-block' }} />
                    <span>{t.label}</span>
                    <span style={{ fontSize: 10, fontWeight: 800, color: isActive ? S.faint : (td === ts.length && ts.length ? S.green : S.faint) }}>{td}/{ts.length}</span>
                  </button>
                )
              })}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {trackSteps.map((step, i) => (
                <StepCard key={step.id} step={step} index={i} accent={activeMeta.color}
                  state={state} currency={currency}
                  noteOpen={!!openNotes[step.id] || !!state.notes[step.id]}
                  onToggleNote={() => setOpenNotes(p => ({ ...p, [step.id]: !p[step.id] }))}
                  setStatus={setStatus} setNote={setNote} setCost={setCost} />
              ))}
            </div>
          </>
        )}

        {/* TIMELINE VIEW */}
        {view === 'timeline' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {timelineSteps.map((step, i) => {
              const sb = startByDate(state.moveDate, step.daysBefore)
              const meta = TRACKS.find(t => t.key === step.track)!
              return (
                <div key={step.id}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '6px 0', fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: sb ? S.accent : S.faint }}>
                    <span style={{ width: 7, height: 7, background: meta.color, display: 'inline-block' }} />
                    {sb ? `Start by ${fmtDate(sb)}` : relativeBucket(step.daysBefore)}
                  </div>
                  <StepCard step={step} index={i} accent={meta.color}
                    state={state} currency={currency}
                    noteOpen={!!openNotes[step.id] || !!state.notes[step.id]}
                    onToggleNote={() => setOpenNotes(p => ({ ...p, [step.id]: !p[step.id] }))}
                    setStatus={setStatus} setNote={setNote} setCost={setCost} />
                </div>
              )
            })}
          </div>
        )}

        {/* Affiliate disclosure (honest, single line) */}
        <p style={{ marginTop: 28, fontSize: 11, color: S.faint, lineHeight: 1.6 }}>
          Steps marked <span style={{ color: S.amber }}>Vetted</span> use tools we have tested. Some pay Origio a commission — it never costs you more, and keeps the report a one-time price. Always verify official requirements before acting.
        </p>

      </div>
      <Footer />
    </div>
  )
}

// ── Step card ────────────────────────────────────────────────────────────────

function StepCard({
  step, index, accent, state, currency, noteOpen, onToggleNote, setStatus, setNote, setCost,
}: {
  step: Step; index: number; accent: string; state: PlaybookState; currency: string
  noteOpen: boolean; onToggleNote: () => void
  setStatus: (id: string, s: StepStatus) => void
  setNote: (id: string, t: string) => void
  setCost: (id: string, v: number) => void
}) {
  const status = state.progress[step.id] ?? 'todo'
  const done = status === 'done'
  const blocked = status === 'blocked'
  const note = state.notes[step.id] ?? ''
  const cost = state.costs[step.id]

  const borderColor = blocked ? `${S.amber}50` : done ? `${S.green}30` : S.border
  const bg = blocked ? `${S.amber}08` : done ? `${S.green}06` : S.card

  return (
    <div style={{ background: bg, border: `1px solid ${borderColor}`, padding: '18px 22px', transition: 'all 0.2s' }}>
      <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
        {/* Checkbox (sharp) */}
        <button
          onClick={() => setStatus(step.id, done ? 'todo' : 'done')}
          aria-label={done ? 'Mark not done' : 'Mark done'}
          style={{
            width: 22, height: 22, flexShrink: 0, marginTop: 2,
            border: `2px solid ${done ? S.green : 'rgba(240,240,232,0.25)'}`,
            background: done ? S.green : 'transparent', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
          {done && <span style={{ fontSize: 12, color: '#000', fontWeight: 900 }}>✓</span>}
        </button>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 6 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: done ? S.green : S.faint, letterSpacing: '0.1em' }}>{String(index + 1).padStart(2, '0')}</span>
              <span style={{ fontSize: 15, fontWeight: 600, color: done ? S.dim : S.text, textDecoration: done ? 'line-through' : 'none', textDecorationColor: S.faint }}>{step.title}</span>
              {step.affiliate && (
                <span title="We have tested this — may earn a commission, never costs you more" style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', background: `${S.amber}1a`, color: S.amber, padding: '2px 6px' }}>Vetted</span>
              )}
            </div>
            <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
              {step.timeEst && <span style={{ fontSize: 10, fontWeight: 600, color: S.dim, background: S.borderDim, padding: '3px 9px' }}>⏱ {step.timeEst}</span>}
              {step.costEst && <span style={{ fontSize: 10, fontWeight: 600, color: S.dim, background: S.borderDim, padding: '3px 9px' }}>{step.costEst}</span>}
            </div>
          </div>

          <p style={{ fontSize: 13, color: done ? S.faint : S.dim, lineHeight: 1.6, margin: '0 0 10px 0' }}>{step.desc}</p>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            {step.url && (
              <a href={step.url} target={step.url.startsWith('http') ? '_blank' : undefined} rel={step.url.startsWith('http') ? 'noopener noreferrer' : undefined}
                style={{ fontSize: 11, fontWeight: 700, color: accent, letterSpacing: '0.06em', textDecoration: 'none', textTransform: 'uppercase' }}>
                {step.urlLabel ?? 'Open'} →
              </a>
            )}
            <button onClick={() => setStatus(step.id, blocked ? 'todo' : 'blocked')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: blocked ? S.amber : S.faint }}>
              {blocked ? '⚠ Blocked' : 'Block'}
            </button>
            <button onClick={onToggleNote}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: note ? accent : S.faint }}>
              {note ? '✎ Note' : '+ Note'}
            </button>
            {step.estCost != null && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11, color: S.faint }}>
                <span style={{ textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700 }}>Spent</span>
                <span style={{ color: S.dim }}>{currency}</span>
                <input type="number" min={0} placeholder="0" value={cost ?? ''}
                  onChange={e => setCost(step.id, Number(e.target.value) || 0)}
                  style={{ width: 70, background: S.bg, border: `1px solid ${S.border}`, color: S.text, padding: '4px 8px', fontSize: 12, fontFamily: S.sans }} />
              </span>
            )}
          </div>

          {noteOpen && (
            <textarea
              value={note} onChange={e => setNote(step.id, e.target.value)}
              placeholder="Appointment refs, document numbers, links…"
              rows={2}
              style={{ width: '100%', marginTop: 12, background: S.bg, border: `1px solid ${S.border}`, color: S.text, padding: '10px 12px', fontSize: 13, fontFamily: S.sans, resize: 'vertical', boxSizing: 'border-box', outline: 'none' }}
            />
          )}
        </div>
      </div>
    </div>
  )
}
