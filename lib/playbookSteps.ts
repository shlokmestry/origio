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

const OVERRIDES: Record<string, (workType: string, isEU: boolean) => PlaybookData> = {
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

  // INDIA — inbound foreign professional (Employment Visa). Verified against
  // MHA / e-FRRO / Income Tax Dept. Costs in INR.
  india: (workType) => ({
    currency: '₹', verified: true,
    steps: [
      // PAPERS
      { id:'p1', track:'papers', title:'Confirm your Employment Visa route', desc:'India\'s "E" visa is for skilled professionals with an Indian employment contract paying at least ₹16.25 lakh/year (some roles exempt). Other routes exist for business and research.', timeEst:'2–3 hours', daysBefore:180, url:'https://indianvisaonline.gov.in', urlLabel:'Indian Visa Online' },
      { id:'p2', track:'papers', title:'Gather your visa documents', desc:'Passport, the signed employment contract / appointment letter from your Indian employer, proof of qualifications and the employer\'s registration papers.', timeEst:'1–2 weeks', daysBefore:150 },
      { id:'p3', track:'papers', title:'Apply for the Employment Visa', desc:'Apply at your local Indian mission. The fee depends on your nationality and visa length — check your home-country consulate.', timeEst:'2–3 weeks', costEst:'Fee varies by nationality', daysBefore:120 },
      { id:'p4', track:'papers', title:'Register with the FRRO within 14 days', desc:'Any visa valid over 180 days requires online registration at the e-FRRO portal within 14 days of arrival. No in-person visit unless summoned.', timeEst:'1–3 weeks', daysBefore:-7, url:'https://indianfrro.gov.in/eservices/home.jsp', urlLabel:'e-FRRO portal' },
      // MONEY
      WISE,
      { id:'m2', track:'money', title:'Apply for a PAN card', desc:'The PAN is your tax ID and is required to open a bank account and file tax. Foreigners apply on Form 49AA. Costs about ₹110 for an Indian address, ₹1,020 for an overseas one.', timeEst:'2–3 weeks', costEst:'₹110–1,020', estCost:1020, daysBefore:60, url:'https://www.protean-tinpan.com', urlLabel:'Apply for PAN (49AA)' },
      { id:'m3', track:'money', title:'Open an Indian bank account', desc:'Bring your passport, long-term visa, FRRO registration, PAN and proof of address. Long-stay workers can open a resident savings account; non-residents use NRE/NRO accounts.', timeEst:'1–3 days', daysBefore:-3 },
      { id:'m4', track:'money', title:'Set up UPI for everyday payments', desc:'India runs on UPI — link an app like Google Pay, PhonePe or Paytm to your Indian account and an Indian SIM. It is used everywhere, from rent to street vendors.', timeEst:'30 min', daysBefore:-1 },
      { id:'m5', track:'money', title:'Understand your tax residency', desc:'You become an Indian tax resident at 182 days in the April–March tax year (120 days if your Indian income tops ₹15 lakh). Check your home country\'s tax treaty.', timeEst:'2–3 hours', daysBefore:30 },
      // HOME
      { id:'h1', track:'home', title:'Research neighbourhoods', desc:'Compare areas on commute, safety and amenities before committing.', timeEst:'2–4 hours', daysBefore:45, url:'/country/india', urlLabel:'City guide' },
      { id:'h2', track:'home', title:'Browse rentals', desc:'NoBroker (broker-free), MagicBricks and 99acres are the main sites. Deposits vary wildly by city — 1–2 months in Delhi but 5–10 months in Bengaluru.', timeEst:'Ongoing', daysBefore:30, url:'https://www.nobroker.in', urlLabel:'NoBroker' },
      { id:'h3', track:'home', title:'Book a short stay for week one', desc:'Land somewhere before you sign a lease so you can view places in person.', timeEst:'1 hour', daysBefore:14, url:'https://www.booking.com', urlLabel:'Find short-stay', affiliate:true },
      // LIFE ADMIN
      { id:'l1', track:'life', title:'Get private health insurance', desc:'Foreign residents rely on the private system from day one. Buy a local plan or an international policy. Private hospitals (Apollo, Fortis, Max) are world-class and English-speaking.', timeEst:'1 hour', daysBefore:30, url:'https://safetywing.com/?referenceID=origio', urlLabel:'Get SafetyWing', affiliate:true },
      { id:'l2', track:'life', title:'Get an Indian SIM on arrival', desc:'A local SIM (Jio, Airtel) is needed for UPI, OTPs and almost every app. Bring your passport, visa and a passport photo.', timeEst:'1 hour', daysBefore:-1 },
      { id:'l3', track:'life', title:'Deregister tax in your home country', desc:'Notify your home tax authority that you have left, or risk being taxed in both places.', timeEst:'1–2 hours', daysBefore:14 },
      { id:'l4', track:'life', title:'Join the community', desc:'City subreddits (r/bangalore, r/mumbai, r/delhi) and InterNations groups are active for local logistics.', timeEst:'10 min', daysBefore:0, url:'https://reddit.com/r/india', urlLabel:'Open r/india' },
    ],
  }),

  // IRELAND — verified against citizensinformation.ie / enterprise.gov.ie /
  // revenue.ie. Branches on EU free movement. Costs in EUR.
  ireland: (workType, isEU) => ({
    currency: '€', verified: true,
    steps: [
      // PAPERS
      ...(isEU
        ? [{ id:'p1', track:'papers' as Track, title:'No permit needed — you have free movement', desc:'As an EU/EEA/Swiss citizen you can live and work in Ireland with no visa, registration or IRP. You only need a PPS number for work and tax.', timeEst:'—', daysBefore:0 }]
        : [
          { id:'p1', track:'papers' as Track, title:'Secure an employment permit', desc:'Most skilled workers use the Critical Skills permit (≈€38,000+, eligible roles, route to Stamp 4) or the General permit (≈€34,000+). Thresholds rose from 1 March 2026 — verify the current figure.', timeEst:'4–10 weeks', daysBefore:180, url:'https://enterprise.gov.ie/en/what-we-do/workplace-and-skills/employment-permits/', urlLabel:'Employment permits' },
          { id:'p2', track:'papers' as Track, title:'Register your immigration permission (IRP)', desc:'Non-EEA nationals staying over 90 days must register and get an IRP card. Book the appointment early — slots are scarce.', timeEst:'1 day + 10 days post', costEst:'€300', estCost:300, daysBefore:-30, url:'https://www.irishimmigration.ie/registering-your-immigration-permission/', urlLabel:'Register IRP' },
        ]),
      { id:'p3', track:'papers', title:'Get a PPS number', desc:'Your PPS number unlocks work, tax, healthcare and (in practice) banking. Apply via MyWelfare with a MyGovID account, an Irish address and a reason such as a job offer. An in-person Intreo appointment is required.', timeEst:'2–3 weeks', daysBefore:-14, url:'https://services.mywelfare.ie', urlLabel:'Apply on MyWelfare' },
      // MONEY
      WISE,
      { id:'m2', track:'money', title:'Open an Irish bank account', desc:'AIB and Bank of Ireland need photo ID plus proof of an Irish address (non-residents need two proofs) — the usual blocker for newcomers. Revolut and N26 onboard fast with lighter requirements.', timeEst:'1–3 days', daysBefore:-7 },
      { id:'m3', track:'money', title:'Register for tax with Revenue', desc:'Set up your tax record in Revenue\'s myAccount once you have a PPS number and a job, so you are taxed correctly from your first payslip.', timeEst:'30 min', daysBefore:-7, url:'https://www.revenue.ie', urlLabel:'Revenue myAccount' },
      // HOME
      { id:'h1', track:'home', title:'Research neighbourhoods', desc:'Compare commute, rent and amenities before you commit.', timeEst:'2–4 hours', daysBefore:60, url:'/country/ireland', urlLabel:'City guide' },
      { id:'h2', track:'home', title:'Hunt on Daft.ie', desc:'Daft.ie is the dominant rental site. Supply is at record lows — Dublin places let within about a week and average rents top €2,000, so set alerts and move fast. Deposit is usually one month plus first month upfront.', timeEst:'Ongoing', daysBefore:45, url:'https://www.daft.ie/property-for-rent/ireland', urlLabel:'Daft.ie' },
      { id:'h3', track:'home', title:'Book a short stay for week one', desc:'Land somewhere before your lease starts — viewings are far easier on the ground.', timeEst:'1 hour', daysBefore:21, url:'https://www.booking.com', urlLabel:'Find short-stay', affiliate:true },
      // LIFE ADMIN
      { id:'l1', track:'life', title:'Sort health cover', desc:'Public HSE care needs you to be "ordinarily resident" (intending to stay 1+ year). Many take private cover too — VHI, Laya or Irish Life Health, roughly €1,900/year.', timeEst:'1 hour', daysBefore:30 },
      { id:'l2', track:'life', title:'Deregister tax in your home country', desc:'Tell your home tax authority you have left to avoid double taxation.', timeEst:'1–2 hours', daysBefore:14 },
      { id:'l3', track:'life', title:'Join the community', desc:'r/ireland and r/MoveToIreland answer the practical relocation questions guides miss.', timeEst:'10 min', daysBefore:0, url:'https://reddit.com/r/MoveToIreland', urlLabel:'Open r/MoveToIreland' },
    ],
  }),

  // GERMANY — verified against make-it-in-germany.com / iamexpat / allaboutberlin.
  // Branches on EU free movement. Costs in EUR.
  germany: (workType, isEU) => ({
    currency: '€', verified: true,
    steps: [
      // PAPERS
      ...(isEU
        ? [{ id:'p1', track:'papers' as Track, title:'No permit needed — you have free movement', desc:'As an EU/EEA/Swiss citizen you can work in Germany with no visa or permit. You still must do the Anmeldung, take out health insurance and get a tax ID.', timeEst:'—', daysBefore:0 }]
        : [
          { id:'p1', track:'papers' as Track, title:'Secure a visa or permit', desc:'Options: the EU Blue Card (≈€48,300, or ≈€43,759 in shortage fields like IT/STEM), the Skilled Worker visa (≈€43,470, recognised qualification), or the points-based Opportunity Card to job-hunt on the ground. Figures rise yearly.', timeEst:'4–12 weeks', daysBefore:180, url:'https://www.make-it-in-germany.com/en/visa-residence', urlLabel:'Make it in Germany' },
          { id:'p3', track:'papers' as Track, title:'Convert to a residence permit', desc:'After entering on a national D-visa, book the Ausländerbehörde about six weeks before it expires to get your electronic residence permit (eAT). A Fiktionsbescheinigung bridges the wait.', timeEst:'4–12 weeks', daysBefore:-30 },
        ]),
      { id:'p2', track:'papers', title:'Do your Anmeldung within 14 days', desc:'Register your address at the Bürgeramt within two weeks of moving in. The Meldebescheinigung you receive is the key that unlocks your bank account, tax ID and residence permit.', timeEst:'1 hour + booking', daysBefore:-14 },
      // MONEY
      WISE,
      { id:'m2', track:'money', title:'Open a bank account', desc:'Traditional banks (Sparkasse, Deutsche Bank) need your Anmeldung first. Neo-banks N26 and Revolut open in minutes with just a passport — useful before you have registered. Germany is still cash- and girocard-heavy.', timeEst:'15 min–1 day', daysBefore:-10 },
      { id:'m3', track:'money', title:'Get a SCHUFA credit report', desc:'SCHUFA is Germany\'s credit score. Landlords almost always ask for a SCHUFA-BonitätsCheck with rental applications, and banks check it for credit. A rental-ready report costs about €29.95.', timeEst:'1–3 days', costEst:'€29.95', estCost:30, daysBefore:30 },
      { id:'m4', track:'money', title:'Wait for your tax ID (Steuer-ID)', desc:'Your Steuer-ID is issued automatically by post 2–6 weeks after your Anmeldung — no application needed. Your employer needs it to tax you correctly.', timeEst:'2–6 weeks (passive)', daysBefore:-14 },
      // HOME
      { id:'h1', track:'home', title:'Research neighbourhoods', desc:'Compare commute, rent and Kiez feel before you commit.', timeEst:'2–4 hours', daysBefore:60, url:'/country/germany', urlLabel:'City guide' },
      { id:'h2', track:'home', title:'Hunt on ImmoScout24 and WG-Gesucht', desc:'ImmobilienScout24 for whole flats, WG-Gesucht for shared flats (WG). Prepare a Bewerbungsmappe: ID, SCHUFA, last three payslips and a rent-debt-free letter. The Kaution deposit can be up to three months\' cold rent.', timeEst:'Ongoing', daysBefore:45, url:'https://www.immobilienscout24.de', urlLabel:'ImmoScout24' },
      { id:'h3', track:'home', title:'Book a short stay for week one', desc:'You need an address to do your Anmeldung — land in temporary housing first if needed.', timeEst:'1 hour', daysBefore:21, url:'https://www.booking.com', urlLabel:'Find short-stay', affiliate:true },
      // LIFE ADMIN
      { id:'l1', track:'life', title:'Take out health insurance', desc:'Health cover is legally mandatory and often required for your visa and Anmeldung. Most employees join a public Krankenkasse (TK, AOK); private (PKV) is mainly for high earners (over €73,800) and the self-employed.', timeEst:'1 hour', daysBefore:30 },
      { id:'l2', track:'life', title:'Deregister tax in your home country', desc:'Notify your home tax authority you have left to avoid double taxation.', timeEst:'1–2 hours', daysBefore:14 },
      { id:'l3', track:'life', title:'Join the community', desc:'r/germany and the Toytown Germany forum answer the bureaucracy questions guides miss.', timeEst:'10 min', daysBefore:0, url:'https://reddit.com/r/germany', urlLabel:'Open r/germany' },
    ],
  }),

  // PORTUGAL — verified against vistos.mne.gov.pt / AIMA / portaldasfinancas.
  // Branches on EU free movement. Costs in EUR.
  portugal: (workType, isEU) => ({
    currency: '€', verified: true,
    steps: [
      // PAPERS
      ...(isEU
        ? [{ id:'p1', track:'papers' as Track, title:'Register for a CRUE after 3 months', desc:'As an EU/EEA/Swiss citizen you may live and work freely. For stays over three months, register at your local Câmara Municipal for a CRUE certificate (about €15). You still need a NIF first.', timeEst:'1 hour', costEst:'≈€15', estCost:15, daysBefore:-60, url:'https://www.portaldasfinancas.gov.pt', urlLabel:'Finanças' }]
        : [
          { id:'p1', track:'papers' as Track, title:'Apply for your visa at the consulate', desc:'Common routes: the D8 digital nomad visa (foreign income of about €3,680/month), the D7 (passive income) or an employer-sponsored work visa. Apply before you travel via the official portal.', timeEst:'4–12 weeks', daysBefore:180, url:'https://vistos.mne.gov.pt', urlLabel:'Visa portal' },
          { id:'p4', track:'papers' as Track, title:'Attend your AIMA residence appointment', desc:'AIMA (which replaced SEF) issues your residence permit after arrival. There is a large backlog and a strict complete-documents rule — bring everything, as incomplete files are rejected outright.', timeEst:'Varies (backlog)', daysBefore:-30, url:'https://aima.gov.pt', urlLabel:'AIMA' },
        ]),
      { id:'p2', track:'papers', title:'Get a NIF (tax number) first', desc:'The NIF is needed for almost everything — renting, banking, utilities and contracts. Non-EU non-residents usually need a fiscal representative to obtain one.', timeEst:'1 day–2 weeks', costEst:'Rep fee may apply', daysBefore:150, url:'https://www.portaldasfinancas.gov.pt', urlLabel:'Portal das Finanças' },
      { id:'p3', track:'papers', title:'Get a NISS (social security number)', desc:'If you will work — including D8 remote workers — you need a NISS. It is now also required for AIMA residence applications.', timeEst:'1–2 weeks', daysBefore:-14 },
      // MONEY
      WISE,
      { id:'m2', track:'money', title:'Open a Portuguese bank account', desc:'Millennium BCP, Novobanco and Caixa Geral need your NIF, passport and proof of address. Some let you open remotely before arrival. Revolut is widely used as a fast everyday option.', timeEst:'1 day', daysBefore:-7 },
      { id:'m3', track:'money', title:'Set up MB WAY', desc:'MB WAY is Portugal\'s dominant mobile payment app — instant transfers, virtual cards and bill payments tied to your local account on the Multibanco network.', timeEst:'15 min', daysBefore:-3 },
      // HOME
      { id:'h1', track:'home', title:'Research neighbourhoods', desc:'Compare commute, rent and lifestyle before you commit.', timeEst:'2–4 hours', daysBefore:60, url:'/country/portugal', urlLabel:'City guide' },
      { id:'h2', track:'home', title:'Hunt on Idealista', desc:'Idealista.pt and Imovirtual are the main rental sites. Expect to pay the first month plus one to two months\' deposit upfront; the landlord must register the lease with the tax authority.', timeEst:'Ongoing', daysBefore:45, url:'https://www.idealista.pt', urlLabel:'Idealista' },
      { id:'h3', track:'home', title:'Book a short stay for week one', desc:'Land somewhere before you sign so you can view places in person.', timeEst:'1 hour', daysBefore:21, url:'https://www.booking.com', urlLabel:'Find short-stay', affiliate:true },
      // LIFE ADMIN
      { id:'l1', track:'life', title:'Register with the SNS', desc:'Register at your local Centro de Saúde for the public health system — you need your NIF and NISS. Many add private insurance (about €30–100/month) to skip waiting lists.', timeEst:'1 hour', daysBefore:30 },
      { id:'l2', track:'life', title:'Check the IFICI tax regime', desc:'The old NHR is closed to new arrivals. Its replacement, IFICI ("NHR 2.0"), gives a 20% flat rate on income from qualifying high-skill roles — register by 15 January of the year after you become resident. Confirm eligibility with an adviser.', timeEst:'1–2 hours', daysBefore:0 },
      { id:'l3', track:'life', title:'Join the community', desc:'r/Portugal and r/PortugalExpats answer the practical relocation questions.', timeEst:'10 min', daysBefore:0, url:'https://reddit.com/r/PortugalExpats', urlLabel:'Open r/PortugalExpats' },
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
  if (override) return override(workType, isEU)

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
