// lib/playbookSteps.ts
// Step generation for the country Playbook.
//
// Two layers:
//   1. COUNTRY_OVERRIDES — hand-verified, country-specific step sets with
//      correct visa routes, local-currency costs and realistic timelines.
//      Australia is the verified exemplar. Add more countries here over time.
//   2. generateSteps()  — generic fallback. Personalised by passport tier,
//      EU free movement and work type. No country-specific assumptions leak in.

export type StepStatus = 'todo' | 'done' | 'blocked'
export type Track = 'papers' | 'money' | 'home' | 'life'

export interface Step {
  id: string
  track: Track
  title: string
  desc: string
  timeEst: string
  costEst?: string        // human-readable, in local currency
  estCost?: number        // numeric estimate in local currency (cost tracker)
  daysBefore?: number     // recommended lead time before move date (negative = after arrival)
  url?: string
  urlLabel?: string
  affiliate?: boolean
}

export interface PlaybookData {
  steps: Step[]
  currency: string        // symbol used by the cost tracker, e.g. '$' or '€'
  verified: boolean       // true when sourced from a hand-checked override
}

// ── Currency ────────────────────────────────────────────────────────────────
// ISO code per country (from the countries table) → display symbol.

const SLUG_CURRENCY: Record<string, string> = {
  argentina:'USD', australia:'AUD', austria:'EUR', belgium:'EUR', brazil:'BRL',
  canada:'CAD', colombia:'COP', 'costa-rica':'CRC', croatia:'EUR', cyprus:'EUR',
  'czech-republic':'CZK', denmark:'DKK', estonia:'EUR', finland:'EUR', france:'EUR',
  georgia:'GEL', germany:'EUR', greece:'EUR', hungary:'HUF', india:'INR',
  indonesia:'IDR', ireland:'EUR', italy:'EUR', japan:'JPY', malaysia:'MYR',
  mexico:'MXN', netherlands:'EUR', 'new-zealand':'NZD', norway:'NOK', panama:'USD',
  poland:'PLN', portugal:'EUR', romania:'RON', serbia:'RSD', singapore:'SGD',
  'south-africa':'ZAR', 'south-korea':'KRW', spain:'EUR', sweden:'SEK',
  switzerland:'CHF', thailand:'THB', uae:'AED', 'united-kingdom':'GBP',
  usa:'USD', vietnam:'VND',
}

const CURRENCY_SYMBOL: Record<string, string> = {
  USD:'$', AUD:'A$', EUR:'€', BRL:'R$', CAD:'C$', COP:'$', CRC:'₡', CZK:'Kč',
  DKK:'kr', GEL:'₾', HUF:'Ft', INR:'₹', IDR:'Rp', JPY:'¥', MYR:'RM', MXN:'$',
  NZD:'NZ$', NOK:'kr', PLN:'zł', RON:'lei', RSD:'дин', SGD:'S$', ZAR:'R',
  KRW:'₩', SEK:'kr', CHF:'CHF', THB:'฿', AED:'AED', GBP:'£', VND:'₫',
}

export function currencyFor(slug: string): string {
  return CURRENCY_SYMBOL[SLUG_CURRENCY[slug] ?? 'EUR'] ?? '€'
}

export const TRACKS: { key: Track; label: string; color: string }[] = [
  { key: 'papers', label: 'Papers',     color: '#f0b07a' },
  { key: 'money',  label: 'Money',      color: '#00ffd5' },
  { key: 'home',   label: 'Home',       color: '#c084fc' },
  { key: 'life',   label: 'Life Admin', color: '#4ade80' },
]

// ── Shared building blocks ────────────────────────────────────────────────
// Tools that are genuinely country-agnostic. Reused by every override.

const WISE: Step = {
  id: 'm1', track: 'money',
  title: 'Open a Wise multi-currency account',
  desc: 'Hold and move money across currencies without the markup banks add.',
  timeEst: '15 min', costEst: 'Free', daysBefore: 90,
  url: 'https://wise.com/invite/ih/origio', urlLabel: 'Open Wise', affiliate: true,
}

const SAFETYWING: Step = {
  id: 'l1', track: 'life',
  title: 'Arrange health cover before you fly',
  desc: 'Do not arrive uninsured. SafetyWing covers 180+ countries and suits movers.',
  timeEst: '20 min', costEst: '~€50/mo', daysBefore: 30,
  url: 'https://safetywing.com/?referenceID=origio', urlLabel: 'Get SafetyWing', affiliate: true,
}

// ── Per-country resource data (links used by the generic generator) ────────

export const COUNTRY_RESOURCES: Record<string, {
  visaUrl?: string; visaName?: string; subreddit?: string; fbGroup?: string
  housingUrl?: string; housingLabel?: string
}> = {
  portugal:     { visaUrl: 'https://vistos.mne.gov.pt', visaName: 'D8 Digital Nomad Visa', subreddit: 'r/expats_portugal', housingUrl: 'https://www.idealista.pt', housingLabel: 'Idealista' },
  germany:      { visaUrl: 'https://www.auswaertiges-amt.de', visaName: 'Freelance Visa', subreddit: 'r/germany', housingUrl: 'https://www.immobilienscout24.de', housingLabel: 'ImmoScout24' },
  spain:        { visaUrl: 'https://www.exteriores.gob.es', visaName: 'Digital Nomad Visa', subreddit: 'r/spain', housingUrl: 'https://www.idealista.com', housingLabel: 'Idealista' },
  netherlands:  { visaUrl: 'https://ind.nl', visaName: 'Highly Skilled Migrant Visa', subreddit: 'r/Netherlands', housingUrl: 'https://www.funda.nl', housingLabel: 'Funda' },
  ireland:      { visaUrl: 'https://www.irishimmigration.ie', visaName: 'Critical Skills Permit', subreddit: 'r/ireland', housingUrl: 'https://www.daft.ie', housingLabel: 'Daft.ie' },
  'united-kingdom': { visaUrl: 'https://www.gov.uk/browse/visas-immigration', visaName: 'Skilled Worker Visa', subreddit: 'r/unitedkingdom', housingUrl: 'https://www.rightmove.co.uk', housingLabel: 'Rightmove' },
  singapore:    { visaUrl: 'https://www.mom.gov.sg', visaName: 'Employment Pass', subreddit: 'r/singapore', housingUrl: 'https://www.propertyguru.com.sg', housingLabel: 'PropertyGuru' },
  uae:          { visaUrl: 'https://u.ae/en/information-and-services/visa-and-emirates-id', visaName: 'Remote Work Visa', subreddit: 'r/dubai', housingUrl: 'https://www.propertyfinder.ae', housingLabel: 'Property Finder' },
  thailand:     { visaUrl: 'https://www.thaiembassy.com', visaName: 'LTR Visa', subreddit: 'r/ThailandTourism', housingUrl: 'https://www.hipflat.co.th', housingLabel: 'Hipflat' },
  japan:        { visaUrl: 'https://www.mofa.go.jp/j_info/visit/visa', visaName: 'Highly Skilled Professional Visa', subreddit: 'r/japanlife', housingUrl: 'https://www.gaijinpot.com/app/apartment', housingLabel: 'GaijinPot' },
  canada:       { visaUrl: 'https://www.canada.ca/en/immigration-refugees-citizenship.html', visaName: 'Express Entry', subreddit: 'r/ImmigrationCanada', housingUrl: 'https://www.realtor.ca', housingLabel: 'Realtor.ca' },
  georgia:      { visaUrl: 'https://www.geoconsul.gov.ge', visaName: 'Remotely from Georgia', subreddit: 'r/tbilisi', housingUrl: 'https://www.myhome.ge', housingLabel: 'MyHome' },
  indonesia:    { visaUrl: 'https://molina.imigrasi.go.id', visaName: 'Second Home Visa', subreddit: 'r/Bali', housingUrl: 'https://www.rumah.com', housingLabel: 'Rumah' },
  'south-africa': { visaUrl: 'https://www.dha.gov.za', visaName: 'Digital Nomad Visa', subreddit: 'r/southafrica', housingUrl: 'https://www.property24.com', housingLabel: 'Property24' },
  estonia:      { visaUrl: 'https://www.politsei.ee/en/instructions/digital-nomad-visa', visaName: 'Digital Nomad Visa', subreddit: 'r/Tallinn', housingUrl: 'https://www.kv.ee', housingLabel: 'KV.ee' },
  argentina:    { visaUrl: 'https://cancilleria.gob.ar', visaName: 'Rentista Visa', subreddit: 'r/argentina', housingUrl: 'https://www.zonaprop.com.ar', housingLabel: 'Zonaprop' },
}

// ── Verified country overrides ─────────────────────────────────────────────
// Hand-checked against official government sources. Costs in local currency.

const OVERRIDES: Record<string, (workType: string) => PlaybookData> = {
  // AUSTRALIA — skilled migration reality (subclass 189 points-tested route).
  // Verified: immi.homeaffairs.gov.au. Fees & timelines current as of 2025.
  australia: (workType) => ({
    currency: 'A$', verified: true,
    steps: [
      // PAPERS
      { id:'p1', track:'papers', title:'Check your visa pathway', desc:'The Skilled Independent visa (189) is points-tested — no sponsor needed, but you need 65+ points and an in-demand occupation. Confirm yours is on the skilled list.', timeEst:'2–3 hours', daysBefore:365, url:'https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/skilled-independent-189', urlLabel:'Official 189 page' },
      { id:'p2', track:'papers', title:'Get a skills assessment', desc:'Your occupation\'s assessing authority (VETASSESS, Engineers Australia, ACS, etc.) must verify your qualifications before you can apply.', timeEst:'2–4 months', costEst:'A$300–1,000', estCost:800, daysBefore:330, url:'https://immi.homeaffairs.gov.au/visas/working-in-australia/skills-assessment', urlLabel:'Find your authority' },
      { id:'p3', track:'papers', title:'Sit an English test', desc:'IELTS, PTE Academic or equivalent. Higher scores earn more points — worth retaking to climb the ranking.', timeEst:'2–4 weeks', costEst:'A$375–450', estCost:420, daysBefore:300 },
      { id:'p4', track:'papers', title:'Submit an Expression of Interest', desc:'Lodge an EOI through SkillSelect with your points claim. You are then ranked against other applicants.', timeEst:'1 day', costEst:'Free', daysBefore:270, url:'https://immi.homeaffairs.gov.au/visas/working-in-australia/skillselect', urlLabel:'SkillSelect' },
      { id:'p5', track:'papers', title:'Receive invitation and lodge online', desc:'If invited, you apply entirely online via ImmiAccount — there is no embassy interview. Current processing runs long.', timeEst:'12–24+ months', costEst:'A$4,765 main applicant', estCost:4765, daysBefore:240, url:'https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/skilled-independent-189', urlLabel:'ImmiAccount' },
      { id:'p6', track:'papers', title:'Complete health and character checks', desc:'A medical exam with a panel physician and police certificates for every country you have lived in 12+ months.', timeEst:'2–4 weeks', costEst:'A$300–500', estCost:400, daysBefore:200 },
      // MONEY
      WISE,
      { id:'m2', track:'money', title:'Apply for a Tax File Number', desc:'Your TFN is needed for work, banking and tax. Apply free online through the ATO once you have arrived.', timeEst:'10 min', costEst:'Free', daysBefore:-7, url:'https://www.ato.gov.au/individuals/tax-file-number/', urlLabel:'Apply for a TFN' },
      { id:'m3', track:'money', title:'Set up superannuation', desc:'Employers must pay 11.5% of your wage into a super fund. Pick a fund or use your employer\'s default on day one.', timeEst:'30 min', daysBefore:-7 },
      { id:'m4', track:'money', title:'Understand your tax residency', desc:'You become an Australian tax resident under the 183-day rule. Check whether your home country has a tax treaty with Australia to avoid double taxation.', timeEst:'2–3 hours', daysBefore:60 },
      { id:'m5', track:'money', title:'Open a local bank account', desc:'CommBank, ANZ, NAB and Westpac let you open an account from overseas before you land, then activate on arrival.', timeEst:'30 min', daysBefore:30 },
      { id:'m6', track:'money', title:'Tell your current bank you are leaving', desc:'Some providers close or restrict accounts for non-residents. Keep one home account open as a bridge.', timeEst:'30 min', daysBefore:14 },
      // HOME
      { id:'h1', track:'home', title:'Research suburbs', desc:'Compare areas on commute, rent and lifestyle before you commit to a lease.', timeEst:'2–4 hours', daysBefore:60, url:'/country/australia', urlLabel:'City guide' },
      { id:'h2', track:'home', title:'Browse rentals', desc:'realestate.com.au and Domain are the two dominant listing sites. Inspections book out fast in capital cities.', timeEst:'Ongoing', daysBefore:45, url:'https://www.realestate.com.au', urlLabel:'realestate.com.au' },
      { id:'h3', track:'home', title:'Find a flatshare', desc:'Flatmates.com.au is the standard for shared housing — cheaper and faster than a solo lease while you settle in.', timeEst:'Ongoing', daysBefore:45, url:'https://flatmates.com.au', urlLabel:'Flatmates.com.au' },
      { id:'h4', track:'home', title:'Book a short stay for week one', desc:'Land somewhere before your lease starts. Two weeks of flexibility makes inspections far easier.', timeEst:'1 hour', daysBefore:21, url:'https://www.booking.com', urlLabel:'Find short-stay', affiliate:true },
      { id:'h5', track:'home', title:'Redirect your mail', desc:'Australia Post mail redirection catches bank letters and government documents during the move.', timeEst:'30 min', daysBefore:7, url:'https://auspost.com.au/receiving/redirect-hold-mail', urlLabel:'Australia Post' },
      // LIFE ADMIN
      { id:'l2', track:'life', title:'Sort health cover for your visa', desc:'Medicare access depends on your visa and any reciprocal agreement your country holds. If you are not eligible, you must hold Overseas Visitor Health Cover.', timeEst:'1 hour', daysBefore:30, url:'https://www.servicesaustralia.gov.au/medicare', urlLabel:'Medicare eligibility' },
      { id:'l3', track:'life', title:'Enrol in Medicare on arrival', desc:'If eligible, enrol at a Services Australia centre in your first week to unlock subsidised healthcare.', timeEst:'1 hour', daysBefore:-7 },
      { id:'l4', track:'life', title:'Deregister tax in your home country', desc:'Notify your home tax authority (HMRC, IRS, etc.) that you have left. Failing to deregister can leave you taxed in both countries.', timeEst:'1–2 hours', daysBefore:14 },
      { id:'l5', track:'life', title:'Sort your driving licence', desc:'You can drive on a valid overseas licence for a period, then must convert to a state licence. Get an International Driving Permit before you leave as a backstop.', timeEst:'1–2 weeks', daysBefore:30 },
      { id:'l6', track:'life', title:'Join the community', desc:'r/australia and local Facebook groups answer the practical questions guides miss — housing leads, job tips, meetups.', timeEst:'10 min', daysBefore:0, url:'https://reddit.com/r/australia', urlLabel:'Open r/australia' },
    ],
  }),
}

// ── Generic generator (fallback for countries without an override) ─────────

const EU_DEST = ['portugal','germany','spain','netherlands','ireland','france','italy','sweden','belgium','austria','denmark','finland','norway','switzerland','estonia','hungary','cyprus','romania']

export function getPlaybook(
  slug: string,
  passportTier: number,
  isEU: boolean,
  workType: string,
): PlaybookData {
  const override = OVERRIDES[slug]
  if (override) return override(workType)

  const res = COUNTRY_RESOURCES[slug] ?? {}
  const easyVisa = isEU && EU_DEST.includes(slug) // free movement, no visa
  const steps: Step[] = []

  // PAPERS
  if (easyVisa) {
    steps.push({ id:'p1', track:'papers', title:'Register as an EU resident', desc:'Within 3 months of arrival, register at your local town hall.', timeEst:'2 hours', costEst:'Free', daysBefore:-30, url:res.visaUrl, urlLabel:'Official site' })
    steps.push({ id:'p2', track:'papers', title:'Get a local tax number', desc:'Needed for housing, banking and work. Usually issued at the tax office.', timeEst:'1–3 hours', costEst:'Free', daysBefore:-7 })
    steps.push({ id:'p3', track:'papers', title:'Obtain a residence card', desc:'Required for most admin once you pass the 3-month mark.', timeEst:'1–4 weeks', daysBefore:-60 })
  } else if (passportTier <= 2) {
    steps.push({ id:'p1', track:'papers', title:'Research your visa options', desc:`Check the routes open to your passport. The ${res.visaName ?? 'main route'} is commonly used.`, timeEst:'2–4 hours', daysBefore:180, url:res.visaUrl, urlLabel:'Official visa portal' })
    steps.push({ id:'p2', track:'papers', title:'Gather required documents', desc:'Passport, proof of income, health insurance, clean record, photos. Start early — apostilles take time.', timeEst:'2–4 weeks', daysBefore:150 })
    steps.push({ id:'p3', track:'papers', title:'Translate and notarise documents', desc:'Most applications need official translations by a sworn translator.', timeEst:'1–2 weeks', costEst:'Translation fees apply', daysBefore:120 })
    steps.push({ id:'p4', track:'papers', title:'Lodge your application', desc:'Many routes are online; some require an appointment at the nearest consulate. Check which applies and book early.', timeEst:'Varies', costEst:'Visa fee applies', daysBefore:90 })
    steps.push({ id:'p5', track:'papers', title:'Track the decision', desc:'Processing times vary by route. Monitor your application status online.', timeEst:'4–12 weeks', daysBefore:60 })
  } else {
    steps.push({ id:'p1', track:'papers', title:'Research visa options for your passport', desc:`A Tier ${passportTier} passport has fewer routes. Look for sponsored work, investor or specific nomad visas.`, timeEst:'1 day', daysBefore:240, url:res.visaUrl, urlLabel:'Immigration authority' })
    steps.push({ id:'p2', track:'papers', title:'Consult an immigration lawyer', desc:'For a Tier 3–4 passport a local lawyer cuts rejection risk and finds routes you would miss.', timeEst:'1–2 weeks', costEst:'Lawyer fees apply', daysBefore:210 })
    steps.push({ id:'p3', track:'papers', title:'Prepare and apostille documents', desc:'Apostilles can take 2–4 weeks. Budget for certified translations too.', timeEst:'3–6 weeks', costEst:'Apostille + translation fees', daysBefore:150 })
    steps.push({ id:'p4', track:'papers', title:'Lodge your application', desc:'Submit online or at the nearest consulate, depending on the route. Bring originals and copies of everything.', timeEst:'Varies', costEst:'Visa fee applies', daysBefore:90 })
    steps.push({ id:'p5', track:'papers', title:'Await the decision and plan a fallback', desc:'Have a contingency if refused — a temporary base while you re-apply.', timeEst:'6–16 weeks', daysBefore:60 })
  }

  // MONEY
  steps.push(WISE)
  steps.push({ id:'m2', track:'money', title:'Set your move budget', desc:'Visa + flights + first month rent + deposit + a 3-month buffer. Run the numbers in Move Budget.', timeEst:'30 min', daysBefore:120, url:'/move-budget', urlLabel:'Move Budget' })
  steps.push({ id:'m3', track:'money', title:'Research your tax position', desc:'Will you be taxed as a resident? Does your home country have a tax treaty? When does residency start?', timeEst:'2–4 hours', daysBefore:90 })
  steps.push({ id:'m4', track:'money', title:'Tell your current bank you are leaving', desc:'Some banks close accounts for non-residents. Keep a home account as a bridge.', timeEst:'30 min', daysBefore:30 })
  if (workType === 'freelancer' || workType === 'owner') {
    steps.push({ id:'m5', track:'money', title:'Register as self-employed', desc:'Most countries require you to register under the local self-employment scheme within 30–90 days of starting work.', timeEst:'1–4 weeks', costEst:'Registration fee may apply', daysBefore:-30 })
  }
  steps.push({ id:'m6', track:'money', title:'Open a local bank account', desc:'Do this in your first week. Bring your lease, residency registration and tax number.', timeEst:'1–3 days', daysBefore:-7 })

  // HOME
  steps.push({ id:'h1', track:'home', title:'Research neighbourhoods', desc:'Check walkability, expat presence and commute before you commit.', timeEst:'2–4 hours', daysBefore:60, url:`/country/${slug}`, urlLabel:'City guide' })
  steps.push({ id:'h2', track:'home', title:'Browse furnished mid-term rentals', desc:'A 1–3 month furnished let buys time to find a long-term place without being locked in.', timeEst:'3–5 hours', daysBefore:45, url:'https://www.spotahome.com', urlLabel:'Browse on Spotahome', affiliate:true })
  steps.push({ id:'h3', track:'home', title:'Book a short stay for week one', desc:'Land somewhere before your rental starts. Airbnb or a serviced flat gives you flexibility.', timeEst:'1 hour', daysBefore:21, url:'https://www.booking.com', urlLabel:'Find short-stay', affiliate:true })
  if (res.housingUrl) {
    steps.push({ id:'h4', track:'home', title:'Browse long-term housing', desc:'Start scanning the local market 6–8 weeks out to learn prices and move fast when ready.', timeEst:'Ongoing', daysBefore:45, url:res.housingUrl, urlLabel:res.housingLabel ?? 'Local rentals' })
  }
  steps.push({ id:'h5', track:'home', title:'Redirect your mail', desc:'Bank letters, government documents and parcels will chase your old address for months.', timeEst:'30 min', daysBefore:7 })

  // LIFE ADMIN
  steps.push(SAFETYWING)
  steps.push({ id:'l2', track:'life', title:'Deregister tax in your home country', desc:'Notify your home tax authority (HMRC, IRS, Finanzamt, etc.) that you have left, or risk being taxed twice.', timeEst:'1–2 hours', daysBefore:14 })
  steps.push({ id:'l3', track:'life', title:'Sort your driving licence', desc:'If you will drive, get an International Driving Permit from your current authority before you leave. Fees vary by country.', timeEst:'1–2 weeks', daysBefore:30 })
  if (res.subreddit) {
    steps.push({ id:'l4', track:'life', title:'Join the community', desc:`${res.subreddit} answers the practical questions guides miss — housing leads, meetups, local tips.`, timeEst:'10 min', daysBefore:0, url:`https://reddit.com/${res.subreddit}`, urlLabel:`Open ${res.subreddit}` })
  }
  steps.push({ id:'l5', track:'life', title:'Download offline maps and translation', desc:'Offline maps for the city, plus DeepL or Google Translate camera mode for signs and menus.', timeEst:'15 min', costEst:'Free', daysBefore:7 })
  steps.push({ id:'l6', track:'life', title:'Cancel subscriptions tied to home', desc:'Gym, delivery apps, car insurance — many keep charging while you are gone.', timeEst:'1 hour', daysBefore:14 })

  return { steps, currency: currencyFor(slug), verified: false }
}
