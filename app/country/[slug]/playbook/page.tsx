'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import { FlagIcon } from '@/components/FlagIcon'
import { slugToIso } from '@/lib/flagCodes'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/AuthProvider'
import { getPassportStrength } from '@/lib/wizard'

// ── Types ─────────────────────────────────────────────────────────────────────

type StepStatus = 'todo' | 'done'
type Track = 'papers' | 'money' | 'home' | 'life'

interface Step {
  id: string
  track: Track
  title: string
  desc: string
  timeEst: string
  costEst?: string
  url?: string
  urlLabel?: string
  affiliate?: boolean
}

// ── Track metadata ─────────────────────────────────────────────────────────────

const TRACKS: { key: Track; label: string; icon: string; color: string }[] = [
  { key: 'papers', label: 'Papers',    icon: '📋', color: '#f0b07a' },
  { key: 'money',  label: 'Money',     icon: '💳', color: '#00ffd5' },
  { key: 'home',   label: 'Home',      icon: '🏠', color: '#c084fc' },
  { key: 'life',   label: 'Life Admin',icon: '✅', color: '#4ade80' },
]

// ── Per-country resource data ─────────────────────────────────────────────────

const COUNTRY_RESOURCES: Record<string, {
  visaUrl?: string
  visaName?: string
  subreddit?: string
  fbGroup?: string
  bankUrl?: string
  housingUrl?: string
  healthInsurer?: string
}> = {
  portugal:     { visaUrl: 'https://vistos.mne.gov.pt', visaName: 'D8 Digital Nomad Visa', subreddit: 'r/expats_portugal', fbGroup: 'Expats in Portugal', housingUrl: 'https://www.idealista.pt', healthInsurer: 'SafetyWing' },
  germany:      { visaUrl: 'https://www.auswaertiges-amt.de', visaName: 'Freelance Visa', subreddit: 'r/germany', fbGroup: 'Expats in Germany', housingUrl: 'https://www.immobilienscout24.de', healthInsurer: 'SafetyWing' },
  spain:        { visaUrl: 'https://www.exteriores.gob.es', visaName: 'Digital Nomad Visa', subreddit: 'r/spain', fbGroup: 'Expats in Spain', housingUrl: 'https://www.idealista.com', healthInsurer: 'Cigna Global' },
  netherlands:  { visaUrl: 'https://ind.nl', visaName: 'Highly Skilled Migrant Visa', subreddit: 'r/Netherlands', fbGroup: 'Expats in Netherlands', housingUrl: 'https://www.funda.nl', healthInsurer: 'SafetyWing' },
  ireland:      { visaUrl: 'https://www.irishimmigration.ie', visaName: 'Critical Skills Permit', subreddit: 'r/ireland', fbGroup: 'Expats in Ireland', housingUrl: 'https://www.daft.ie', healthInsurer: 'Cigna Global' },
  'united-kingdom': { visaUrl: 'https://www.gov.uk/browse/visas-immigration', visaName: 'Skilled Worker Visa', subreddit: 'r/unitedkingdom', fbGroup: 'Expats in UK', housingUrl: 'https://www.rightmove.co.uk', healthInsurer: 'SafetyWing' },
  singapore:    { visaUrl: 'https://www.mom.gov.sg', visaName: 'Employment Pass', subreddit: 'r/singapore', fbGroup: 'Expats in Singapore', housingUrl: 'https://www.propertyguru.com.sg', healthInsurer: 'Cigna Global' },
  uae:          { visaUrl: 'https://u.ae/en/information-and-services/visa-and-emirates-id', visaName: 'Remote Work Visa', subreddit: 'r/dubai', fbGroup: 'Expats in Dubai', housingUrl: 'https://www.propertyfinder.ae', healthInsurer: 'Cigna Global' },
  thailand:     { visaUrl: 'https://www.thaiembassy.com', visaName: 'LTR Visa', subreddit: 'r/ThailandTourism', fbGroup: 'Expats in Thailand', housingUrl: 'https://www.hipflat.co.th', healthInsurer: 'SafetyWing' },
  japan:        { visaUrl: 'https://www.mofa.go.jp/j_info/visit/visa', visaName: 'Highly Skilled Professional Visa', subreddit: 'r/japanlife', fbGroup: 'Expats in Japan', housingUrl: 'https://www.gaijinpot.com/app/apartment', healthInsurer: 'SafetyWing' },
  canada:       { visaUrl: 'https://www.canada.ca/en/immigration-refugees-citizenship.html', visaName: 'Express Entry', subreddit: 'r/ImmigrationCanada', fbGroup: 'Expats in Canada', housingUrl: 'https://www.realtor.ca', healthInsurer: 'SafetyWing' },
  australia:    { visaUrl: 'https://immi.homeaffairs.gov.au', visaName: 'Skilled Independent Visa (189)', subreddit: 'r/australia', fbGroup: 'Expats in Australia', housingUrl: 'https://www.realestate.com.au', healthInsurer: 'Cigna Global' },
  georgia:      { visaUrl: 'https://www.geoconsul.gov.ge', visaName: 'Remotely from Georgia', subreddit: 'r/tbilisi', fbGroup: 'Expats in Georgia', housingUrl: 'https://www.myhome.ge', healthInsurer: 'SafetyWing' },
  indonesia:    { visaUrl: 'https://molina.imigrasi.go.id', visaName: 'Second Home Visa', subreddit: 'r/Bali', fbGroup: 'Expats in Bali', housingUrl: 'https://www.rumah.com', healthInsurer: 'SafetyWing' },
  'south-africa': { visaUrl: 'https://www.dha.gov.za', visaName: 'Digital Nomad Visa', subreddit: 'r/southafrica', fbGroup: 'Expats in South Africa', housingUrl: 'https://www.property24.com', healthInsurer: 'SafetyWing' },
  estonia:      { visaUrl: 'https://www.politsei.ee/en/instructions/digital-nomad-visa', visaName: 'Digital Nomad Visa', subreddit: 'r/Tallinn', fbGroup: 'Expats in Estonia', housingUrl: 'https://www.kv.ee', healthInsurer: 'SafetyWing' },
  argentina:    { visaUrl: 'https://cancilleria.gob.ar', visaName: 'Rentista Visa', subreddit: 'r/argentina', fbGroup: 'Expats in Buenos Aires', housingUrl: 'https://www.zonaprop.com.ar', healthInsurer: 'SafetyWing' },
}

// ── Step generator ─────────────────────────────────────────────────────────────

function generateSteps(
  slug: string,
  passportTier: number,
  isEU: boolean,
  workType: string
): Step[] {
  const res = COUNTRY_RESOURCES[slug] ?? {}
  const isDestEU = ['portugal','germany','spain','netherlands','ireland','france','italy','sweden','belgium','austria','denmark','finland','norway','switzerland','estonia','hungary','cyprus','romania'].includes(slug)
  const easyVisa = isEU && isDestEU // free movement, no visa needed

  const steps: Step[] = []

  // ── PAPERS track ──────────────────────────────────────────────────────────

  if (easyVisa) {
    steps.push({ id:'p1', track:'papers', title:'Register as EU resident', desc:'Within 3 months of arrival, register at the local town hall (câmara, Rathaus, gemeente, etc.).', timeEst:'2 hours', costEst:'Free', url: res.visaUrl, urlLabel:'Official site' })
    steps.push({ id:'p2', track:'papers', title:'Get a local tax number', desc:"You'll need this for housing, banking, and employment. Usually done at the tax office on day one.", timeEst:'1–3 hours', costEst:'Free' })
    steps.push({ id:'p3', track:'papers', title:'Obtain an ID card or residence card', desc:'Required for most admin tasks after the first 3 months.', timeEst:'1–4 weeks' })
  } else if (passportTier <= 2) {
    steps.push({ id:'p1', track:'papers', title:`Research your visa options`, desc:`For your passport, check what visa routes are available. The ${res.visaName ?? 'main route'} is commonly used.`, timeEst:'2–4 hours', url: res.visaUrl, urlLabel:'Official visa portal' })
    steps.push({ id:'p2', track:'papers', title:'Gather required documents', desc:'Typically: passport, proof of income, health insurance, clean criminal record, passport photos. Start early — apostilles take time.', timeEst:'2–4 weeks' })
    steps.push({ id:'p3', track:'papers', title:'Get documents translated and notarised', desc:'Official translations are required for most visa applications. Use a sworn translator.', timeEst:'1–2 weeks', costEst:'€100–300' })
    steps.push({ id:'p4', track:'papers', title:'Book your visa appointment', desc:'Embassy slots fill up weeks in advance. Book as soon as your documents are ready.', timeEst:'Book now', costEst:'€50–200 visa fee' })
    steps.push({ id:'p5', track:'papers', title:'Submit application and wait', desc:'Processing times vary by country and visa type. Track your application status online.', timeEst:'4–12 weeks wait' })
  } else {
    // Tier 3–4
    steps.push({ id:'p1', track:'papers', title:`Research visa options for your passport`, desc:`Tier ${passportTier} passports may have limited routes. Check if a sponsored job offer, investor visa, or specific nomad visa is available.`, timeEst:'1 day', url: res.visaUrl, urlLabel:'Immigration authority' })
    steps.push({ id:'p2', track:'papers', title:'Consult an immigration lawyer', desc:'For Tier 3–4 passports, a local immigration lawyer significantly reduces rejection risk and identifies options you might miss.', timeEst:'1–2 weeks', costEst:'€200–800 consultation' })
    steps.push({ id:'p3', track:'papers', title:'Prepare and apostille all documents', desc:'Allow extra time — apostilles from some countries take 2–4 weeks. Budget for certified translations.', timeEst:'3–6 weeks', costEst:'€200–500' })
    steps.push({ id:'p4', track:'papers', title:'Submit visa application', desc:'Do this in person at the destination country\'s embassy. Bring originals and copies of everything.', timeEst:'1 day', costEst:'€100–350 fee' })
    steps.push({ id:'p5', track:'papers', title:'Await decision and plan contingency', desc:'Have a backup plan in case of rejection — consider temporary bases while re-applying.', timeEst:'6–16 weeks wait' })
  }

  // ── MONEY track ───────────────────────────────────────────────────────────

  steps.push({ id:'m1', track:'money', title:'Open a Wise multi-currency account', desc:'Send and receive money without hidden fees. Essential for moving abroad.', timeEst:'15 minutes', costEst:'Free', url:'https://wise.com/invite/ih/origio', urlLabel:'Open Wise account', affiliate:true })
  steps.push({ id:'m2', track:'money', title:'Set your move budget target', desc:'Calculate upfront costs: visa + flights + first month rent + deposit + 3-month buffer. Check the Move Budget tool.', timeEst:'30 minutes', url:'/move-budget', urlLabel:'Move Budget calculator' })
  steps.push({ id:'m3', track:'money', title:'Research tax obligations', desc:'Understand whether you\'ll be taxed as a resident, whether your home country has a tax treaty, and when tax residency kicks in.', timeEst:'2–4 hours' })
  steps.push({ id:'m4', track:'money', title:'Notify your current bank', desc:'Tell them you\'re moving abroad. Some banks close accounts for non-residents. Plan your banking bridge.', timeEst:'30 minutes' })
  if (workType === 'freelancer' || workType === 'owner') {
    steps.push({ id:'m5', track:'money', title:'Register as self-employed / open local company', desc:'Most countries require local registration within 30–90 days of starting work. Research the NHR, autónomo, or equivalent scheme.', timeEst:'1–4 weeks', costEst:'€100–500' })
  }
  steps.push({ id:'m6', track:'money', title:'Open a local bank account', desc:'Do this in the first week of arrival. Bring your rental contract, residency registration, and tax number.', timeEst:'1–3 days (on arrival)' })

  // ── HOME track ────────────────────────────────────────────────────────────

  steps.push({ id:'h1', track:'home', title:'Research neighbourhoods', desc:'Read about the different areas before committing. Check walkability, expat presence, and proximity to coworking.', timeEst:'2–4 hours', url:`/country/${slug}`, urlLabel:'City guide' })
  steps.push({ id:'h2', track:'home', title:'Browse mid-term rentals (furnished)', desc:'1–3 month furnished rentals give you time to find a long-term place without being locked in.', timeEst:'3–5 hours', url:'https://www.spotahome.com', urlLabel:'Browse on Spotahome', affiliate:true })
  steps.push({ id:'h3', track:'home', title:'Book short-stay for first 2 weeks', desc:'Land somewhere before your rental starts. Airbnb or a serviced apartment gives you flexibility on arrival.', timeEst:'1 hour', url:'https://www.booking.com', urlLabel:'Find short-stay', affiliate:true })
  if (res.housingUrl) {
    steps.push({ id:'h4', track:'home', title:'Browse long-term housing platforms', desc:'Start browsing the local housing market 6–8 weeks before arrival to understand prices and move fast when ready.', timeEst:'Ongoing', url: res.housingUrl, urlLabel:'Local rentals' })
  }
  steps.push({ id:'h5', track:'home', title:'Arrange mail forwarding or PO box', desc:"Set up mail forwarding from your previous address. You'll get bank letters, government documents, and parcels there for months.", timeEst:'30 minutes' })

  // ── LIFE ADMIN track ──────────────────────────────────────────────────────

  steps.push({ id:'l1', track:'life', title:'Sort health insurance before you leave', desc:"Don't arrive uninsured. SafetyWing covers 180+ countries and is designed for nomads.", timeEst:'20 minutes', costEst:'~€50/mo', url:'https://safetywing.com/?referenceID=origio', urlLabel:'Get SafetyWing', affiliate:true })
  steps.push({ id:'l2', track:'life', title:'Notify your tax authority of departure', desc:'HMRC (UK), IRS (US), Finanzamt (DE), etc. Failing to deregister properly can leave you liable for tax in both countries.', timeEst:'1–2 hours' })
  steps.push({ id:'l3', track:'life', title:'Get an international driving licence', desc:"If you plan to drive, get an IDP from your current country's motoring authority before you leave.", timeEst:'1–2 weeks', costEst:'€15–30' })
  if (res.subreddit || res.fbGroup) {
    const community = res.subreddit ? `Join ${res.subreddit}` : `Find the ${res.fbGroup} Facebook group`
    steps.push({ id:'l4', track:'life', title:'Join the expat community', desc:`${community} — locals answer practical questions, share housing leads, and run meetups.`, timeEst:'10 minutes', url: res.subreddit ? `https://reddit.com/${res.subreddit}` : undefined, urlLabel: res.subreddit ? `Open ${res.subreddit}` : undefined })
  }
  steps.push({ id:'l5', track:'life', title:'Download offline maps and translation', desc:'Maps.me or Google Maps offline for the city. DeepL for quick translations. Google Translate camera mode for signs and menus.', timeEst:'15 minutes', costEst:'Free' })
  steps.push({ id:'l6', track:'life', title:'Cancel or pause subscriptions tied to your home address', desc:'Gym memberships, local delivery apps, car insurance. Many charge you while you\'re not using them.', timeEst:'1 hour' })

  return steps
}

// ── Readiness score ────────────────────────────────────────────────────────────

function readinessPct(steps: Step[], progress: Record<string, StepStatus>): number {
  if (!steps.length) return 0
  const done = steps.filter(s => progress[s.id] === 'done').length
  return Math.round((done / steps.length) * 100)
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function PlaybookPage() {
  const params = useParams()
  const slug = params.slug as string
  const { user } = useAuth()

  const [isPro, setIsPro] = useState(false)
  const [proChecked, setProChecked] = useState(false)
  const [countryName, setCountryName] = useState('')
  const [countryFlag, setCountryFlag] = useState('')
  const [answers, setAnswers] = useState<Record<string,string> | null>(null)
  const [activeTrack, setActiveTrack] = useState<Track>('papers')
  const [progress, setProgress] = useState<Record<string, StepStatus>>({})

  const STORAGE_KEY = `playbook_${slug}`

  // Load Pro status
  useEffect(() => {
    async function check() {
      if (!user) { setProChecked(true); return }
      const { data } = await supabase.from('profiles').select('is_pro').eq('id', user.id).single()
      setIsPro(data?.is_pro ?? false)
      setProChecked(true)
    }
    check()
  }, [user])

  // Load country name + flag from Supabase
  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('countries')
        .select('name, flag_emoji')
        .eq('slug', slug)
        .single()
      if (data) {
        setCountryName(data.name ?? slug)
        setCountryFlag(data.flag_emoji ?? '')
      } else {
        setCountryName(slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()))
      }
    }
    load()
  }, [slug])

  // Load wizard answers for personalisation
  useEffect(() => {
    try {
      const raw = localStorage.getItem('wizard_answers')
      if (raw) setAnswers(JSON.parse(raw))
    } catch {}
  }, [])

  // Load progress from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) setProgress(JSON.parse(raw))
    } catch {}
  }, [STORAGE_KEY])

  const passportSlug = answers?.passport ?? 'other'
  const passportTier = getPassportStrength(passportSlug)
  const EU_PASSPORTS = ['ireland','germany','france','netherlands','spain','portugal','sweden','norway','switzerland','austria','belgium','denmark','finland','italy','poland','romania','estonia','hungary','cyprus']
  const isEU = EU_PASSPORTS.includes(passportSlug)
  const workType = answers?.workType ?? 'employee'

  const steps = useMemo(
    () => generateSteps(slug, passportTier, isEU, workType),
    [slug, passportTier, isEU, workType]
  )

  const pct = readinessPct(steps, progress)
  const trackSteps = steps.filter(s => s.track === activeTrack)
  const activeMeta = TRACKS.find(t => t.key === activeTrack)!

  function toggleStep(id: string) {
    setProgress(prev => {
      const next = { ...prev, [id]: prev[id] === 'done' ? 'todo' : 'done' }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      return next
    })
  }

  // Styles
  const S = {
    bg: '#0a0a0a', card: '#111111', border: 'rgba(255,255,255,0.07)',
    dim: 'rgba(255,255,255,0.45)', serif: "'Cabinet Grotesk', sans-serif",
    sans: "'Satoshi', sans-serif",
  }

  // Not pro — show gate
  if (proChecked && !isPro) {
    return (
      <div style={{ background: S.bg, minHeight: '100vh', fontFamily: S.sans }}>
        <Nav countries={[]} onCountrySelect={() => {}} />
        <div style={{ maxWidth: 560, margin: '0 auto', padding: 'clamp(100px,12vw,130px) 24px 80px', textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 20 }}>🔒</div>
          <h1 style={{ fontFamily: S.serif, fontSize: 32, color: '#fff', marginBottom: 12, fontWeight: 400 }}>The Playbook is Pro</h1>
          <p style={{ fontSize: 15, color: S.dim, lineHeight: 1.6, marginBottom: 32 }}>
            Your step-by-step move plan — visa, money, housing, and life admin — personalised to your passport and situation. One-time €4.99.
          </p>
          <Link href="/pro" style={{ display: 'inline-block', background: '#fff', color: '#0a0a0a', fontWeight: 800, fontSize: 12, letterSpacing: '0.15em', textTransform: 'uppercase', padding: '14px 32px', textDecoration: 'none' }}>
            Get Pro · €4.99 forever →
          </Link>
          <p style={{ marginTop: 24, fontSize: 12, color: 'rgba(255,255,255,0.2)' }}>
            <Link href={`/country/${slug}/personalised`} style={{ color: 'rgba(255,255,255,0.35)', textDecoration: 'none' }}>← Back to your report</Link>
          </p>
        </div>
        <Footer />
      </div>
    )
  }

  if (!proChecked) {
    return (
      <div style={{ background: S.bg, minHeight: '100vh' }}>
        <Nav countries={[]} onCountrySelect={() => {}} />
      </div>
    )
  }

  const isoCode = slugToIso(slug)

  return (
    <div style={{ background: S.bg, color: '#fff', minHeight: '100vh', fontFamily: S.sans }}>
      <Nav countries={[]} onCountrySelect={() => {}} />

      <div style={{ maxWidth: 860, margin: '0 auto', padding: 'clamp(90px,10vw,110px) clamp(20px,4vw,40px) 80px' }}>

        {/* Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: S.dim, marginBottom: 48 }}>
          <Link href="/wizard/results" style={{ color: S.dim, textDecoration: 'none' }}>Results</Link>
          <span style={{ color: 'rgba(255,255,255,0.2)' }}>/</span>
          <Link href={`/country/${slug}/personalised`} style={{ color: S.dim, textDecoration: 'none' }}>{countryName}</Link>
          <span style={{ color: 'rgba(255,255,255,0.2)' }}>/</span>
          <span style={{ color: 'rgba(255,255,255,0.7)' }}>The Playbook</span>
        </div>

        {/* Hero */}
        <div style={{ marginBottom: 48 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
            {isoCode ? <FlagIcon code={isoCode} size="xl" /> : <span style={{ fontSize: 52 }}>{countryFlag}</span>}
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: S.dim, marginBottom: 6 }}>Your Playbook</div>
              <h1 style={{ fontFamily: S.serif, fontSize: 'clamp(28px,4vw,42px)', fontWeight: 400, color: '#fff', margin: 0, lineHeight: 1.1 }}>Moving to {countryName}</h1>
            </div>
          </div>

          {/* Readiness bar */}
          <div style={{ background: S.card, border: `1px solid ${S.border}`, borderRadius: 14, padding: '20px 24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: S.dim }}>Move readiness</span>
              <span style={{ fontFamily: S.serif, fontSize: 24, color: pct === 100 ? '#4ade80' : '#fff' }}>{pct}%</span>
            </div>
            <div style={{ height: 6, background: 'rgba(255,255,255,0.07)', borderRadius: 100, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${pct}%`, background: pct === 100 ? '#4ade80' : '#00ffd5', borderRadius: 100, transition: 'width 0.4s ease' }} />
            </div>
            <div style={{ display: 'flex', gap: 16, marginTop: 14, flexWrap: 'wrap' }}>
              {TRACKS.map(t => {
                const ts = steps.filter(s => s.track === t.key)
                const td = ts.filter(s => progress[s.id] === 'done').length
                return (
                  <div key={t.key} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 11 }}>{t.icon}</span>
                    <span style={{ fontSize: 11, color: S.dim }}>{t.label}</span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: td === ts.length ? '#4ade80' : 'rgba(255,255,255,0.55)' }}>{td}/{ts.length}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Track tabs */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 24, flexWrap: 'wrap' }}>
          {TRACKS.map(t => {
            const ts = steps.filter(s => s.track === t.key)
            const td = ts.filter(s => progress[s.id] === 'done').length
            const isActive = activeTrack === t.key
            return (
              <button
                key={t.key}
                onClick={() => setActiveTrack(t.key)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '10px 18px',
                  background: isActive ? '#fff' : S.card,
                  border: `1px solid ${isActive ? '#fff' : S.border}`,
                  borderRadius: 100,
                  color: isActive ? '#0a0a0a' : S.dim,
                  fontFamily: S.sans,
                  fontSize: 12, fontWeight: 700,
                  letterSpacing: '0.06em',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                <span>{t.icon}</span>
                <span>{t.label}</span>
                <span style={{
                  fontSize: 10, fontWeight: 800,
                  background: isActive ? '#0a0a0a' : (td === ts.length && ts.length > 0 ? '#4ade80' : 'rgba(255,255,255,0.12)'),
                  color: isActive ? '#fff' : (td === ts.length && ts.length > 0 ? '#0a0a0a' : S.dim),
                  borderRadius: 100, padding: '2px 7px',
                }}>
                  {td}/{ts.length}
                </span>
              </button>
            )
          })}
        </div>

        {/* Steps */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {trackSteps.map((step, i) => {
            const done = progress[step.id] === 'done'
            return (
              <div
                key={step.id}
                style={{
                  background: done ? 'rgba(74,222,128,0.04)' : S.card,
                  border: `1px solid ${done ? 'rgba(74,222,128,0.2)' : S.border}`,
                  borderRadius: 14,
                  padding: '20px 24px',
                  transition: 'all 0.2s',
                }}
              >
                <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                  {/* Checkbox */}
                  <button
                    onClick={() => toggleStep(step.id)}
                    style={{
                      width: 22, height: 22, borderRadius: 6, flexShrink: 0, marginTop: 2,
                      border: `2px solid ${done ? '#4ade80' : 'rgba(255,255,255,0.2)'}`,
                      background: done ? '#4ade80' : 'transparent',
                      cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all 0.15s',
                    }}
                    aria-label={done ? 'Mark as not done' : 'Mark as done'}
                  >
                    {done && <span style={{ fontSize: 12, color: '#0a0a0a', fontWeight: 900 }}>✓</span>}
                  </button>

                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 6 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontSize: 10, fontWeight: 700, color: done ? '#4ade80' : 'rgba(255,255,255,0.2)', letterSpacing: '0.1em' }}>
                          {String(i + 1).padStart(2, '0')}
                        </span>
                        <span style={{
                          fontSize: 15, fontWeight: 600, color: done ? 'rgba(255,255,255,0.45)' : '#fff',
                          textDecoration: done ? 'line-through' : 'none',
                          textDecorationColor: 'rgba(255,255,255,0.25)',
                        }}>
                          {step.title}
                        </span>
                        {step.affiliate && (
                          <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', background: 'rgba(240,176,122,0.15)', color: '#f0b07a', borderRadius: 4, padding: '2px 6px' }}>
                            partner
                          </span>
                        )}
                      </div>
                      <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                        {step.timeEst && (
                          <span style={{ fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.05)', borderRadius: 100, padding: '3px 10px' }}>
                            ⏱ {step.timeEst}
                          </span>
                        )}
                        {step.costEst && (
                          <span style={{ fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.05)', borderRadius: 100, padding: '3px 10px' }}>
                            {step.costEst}
                          </span>
                        )}
                      </div>
                    </div>
                    <p style={{ fontSize: 13, color: done ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.55)', lineHeight: 1.6, margin: '0 0 10px 0' }}>
                      {step.desc}
                    </p>
                    {step.url && (
                      <a
                        href={step.url}
                        target={step.url.startsWith('http') ? '_blank' : undefined}
                        rel={step.url.startsWith('http') ? 'noopener noreferrer' : undefined}
                        style={{ fontSize: 11, fontWeight: 700, color: activeMeta.color, letterSpacing: '0.06em', textDecoration: 'none', textTransform: 'uppercase' }}
                      >
                        {step.urlLabel ?? 'Open →'} →
                      </a>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Personalisation note */}
        <div style={{ marginTop: 32, padding: '16px 20px', background: 'rgba(255,255,255,0.03)', border: `1px solid ${S.border}`, borderRadius: 12 }}>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', margin: 0, lineHeight: 1.6 }}>
            Playbook personalised for{' '}
            <span style={{ color: 'rgba(255,255,255,0.55)' }}>
              {passportSlug !== 'other' ? passportSlug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : 'your'} passport
            </span>
            {' '}·{' '}
            <span style={{ color: 'rgba(255,255,255,0.55)' }}>{workType}</span>.
            {' '}Steps are indicative — always verify official requirements before acting.
          </p>
        </div>

      </div>
      <Footer />
    </div>
  )
}
