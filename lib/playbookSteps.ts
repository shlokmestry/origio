// Verified playbook step data for each country.
// Generic fallback used for the 36 countries without verified overrides.

export type StepStatus = 'todo' | 'done' | 'blocked'
export type Track = 'papers' | 'money' | 'home' | 'life'

export interface Step {
  id: string
  track: Track
  title: string
  desc: string
  timeEst: string
  costEst?: string
  estCost?: number      // numeric for cost tracker (local currency)
  daysBefore?: number   // for timeline view — days before move date
  url?: string
  urlLabel?: string
  affiliate?: boolean
}

export interface PlaybookData {
  steps: Step[]
  currency: string
  verified: boolean
}

export const TRACKS: { key: Track; label: string; icon: string; color: string }[] = [
  { key: 'papers', label: 'Papers',     icon: '📋', color: '#f0b07a' },
  { key: 'money',  label: 'Money',      icon: '💳', color: '#00ffd5' },
  { key: 'home',   label: 'Home',       icon: '🏠', color: '#c084fc' },
  { key: 'life',   label: 'Life Admin', icon: '✅', color: '#4ade80' },
]

// ── Currency maps ─────────────────────────────────────────────────────────────

const SLUG_CURRENCY: Record<string, string> = {
  'australia': 'AUD', 'austria': 'EUR', 'belgium': 'EUR', 'brazil': 'BRL',
  'canada': 'CAD', 'chile': 'CLP', 'colombia': 'COP', 'costa-rica': 'CRC',
  'croatia': 'EUR', 'cyprus': 'EUR', 'czech-republic': 'CZK', 'denmark': 'DKK',
  'estonia': 'EUR', 'finland': 'EUR', 'france': 'EUR', 'georgia': 'GEL',
  'germany': 'EUR', 'greece': 'EUR', 'hungary': 'HUF', 'india': 'INR',
  'indonesia': 'IDR', 'ireland': 'EUR', 'italy': 'EUR', 'japan': 'JPY',
  'malta': 'EUR', 'mexico': 'MXN', 'netherlands': 'EUR', 'new-zealand': 'NZD',
  'norway': 'NOK', 'panama': 'USD', 'poland': 'PLN', 'portugal': 'EUR',
  'romania': 'RON', 'singapore': 'SGD', 'south-africa': 'ZAR', 'spain': 'EUR',
  'sweden': 'SEK', 'switzerland': 'CHF', 'thailand': 'THB', 'turkey': 'TRY',
  'uae': 'AED', 'united-kingdom': 'GBP', 'united-states': 'USD', 'uruguay': 'UYU',
  'vietnam': 'VND',
}

const CURRENCY_SYMBOL: Record<string, string> = {
  'AUD': 'A$', 'EUR': '€', 'BRL': 'R$', 'CAD': 'C$', 'CLP': 'CLP$',
  'COP': 'COP$', 'CRC': '₡', 'CZK': 'Kč', 'DKK': 'kr', 'GEL': '₾',
  'GBP': '£', 'HUF': 'Ft', 'IDR': 'Rp', 'INR': '₹', 'JPY': '¥',
  'MXN': 'MX$', 'NOK': 'kr', 'NZD': 'NZ$', 'PLN': 'zł', 'RON': 'lei',
  'SEK': 'kr', 'SGD': 'S$', 'THB': '฿', 'TRY': '₺', 'AED': 'AED',
  'USD': '$', 'UYU': '$U', 'VND': '₫', 'ZAR': 'R', 'CHF': 'CHF',
}

export function currencyFor(slug: string): string {
  const iso = SLUG_CURRENCY[slug] ?? 'EUR'
  return CURRENCY_SYMBOL[iso] ?? iso
}

// ── Shared steps ──────────────────────────────────────────────────────────────

const WISE: Step = {
  id: 'm_wise', track: 'money',
  title: 'Open a Wise multi-currency account',
  desc: 'Hold, send and receive money in 40+ currencies with real exchange rates and low fees.',
  timeEst: '15 min', costEst: 'Free',
  url: 'https://wise.com/invite/ih/origio', urlLabel: 'Open Wise account', affiliate: true,
  daysBefore: 90,
}

const SAFETYWING = (currency: string): Step => ({
  id: 'l_sw', track: 'life',
  title: 'Get travel health insurance before you leave',
  desc: "Don't arrive uninsured. SafetyWing covers 180+ countries and is built for remote workers.",
  timeEst: '20 min', costEst: `~${currency}50/mo`,
  url: 'https://safetywing.com/?referenceID=origio', urlLabel: 'Get SafetyWing', affiliate: true,
  daysBefore: 30,
})

// ── Verified country overrides ─────────────────────────────────────────────────

type Override = (workType: string, isEU: boolean) => PlaybookData

const OVERRIDES: Record<string, Override> = {

  // ── Australia ─────────────────────────────────────────────────────────────
  australia: (workType) => ({
    currency: 'A$', verified: true,
    steps: [
      { id:'p1', track:'papers', title:'Check your visa subclass', desc:'Skilled workers: subclass 189 (independent) or 190 (state-nominated). WHV (417/462) for under-35. All via ImmiAccount.', timeEst:'2–4 hrs', costEst:'A$4,240 (189 primary)', estCost:4240, daysBefore:180, url:'https://immi.homeaffairs.gov.au', urlLabel:'ImmiAccount' },
      { id:'p2', track:'papers', title:'Get skills assessed', desc:'Most occupations need a skills assessment from the relevant authority (e.g. Engineers Australia, ACS, VETASSESS) before you can lodge an EOI.', timeEst:'3–6 months', costEst:'A$300–700', estCost:500, daysBefore:270 },
      { id:'p3', track:'papers', title:'Submit Expression of Interest (SkillSelect)', desc:'Once skilled assessed, submit your EOI. Invitations are issued in monthly rounds based on points score.', timeEst:'30 min', costEst:'Free', daysBefore:120 },
      { id:'p4', track:'papers', title:'Lodge visa application within 60 days of invite', desc:'60-day window to submit full application on ImmiAccount. Include health exams (HAP ID), police checks, and all docs.', timeEst:'2–4 weeks prep', daysBefore:90 },
      { id:'p5', track:'papers', title:'Get a Tax File Number (TFN)', desc:"Apply online via the ATO website on or after arrival. Takes 28 days. You'll need this for employment and banking.", timeEst:'10 min apply / 28 day wait', costEst:'Free', daysBefore:-7, url:'https://www.ato.gov.au/individuals-and-families/tax-file-number', urlLabel:'Apply for TFN' },
      WISE,
      { id:'m2', track:'money', title:'Open an Australian bank account', desc:'ANZ, Commonwealth, Westpac and NAB all offer arrival accounts. CBA and ANZ let you open before landing (bring passport + TFN).', timeEst:'1 hr on arrival', daysBefore:-3 },
      { id:'m3', track:'money', title:'Understand your tax residency', desc:"You're an Australian tax resident if you intend to stay. Residents pay 0% on first A$18,200 income. File your first return by Oct 31.", timeEst:'2 hrs reading', daysBefore:30 },
      { id:'m4', track:'money', title:'Set up superannuation', desc:"Your employer must pay 11% super (2024). Choose a fund — if you don't, they pick one for you.", timeEst:'30 min', costEst:'Free', daysBefore:-14 },
      { id:'h1', track:'home', title:'Book first 2 weeks in serviced accommodation', desc:'Melbourne and Sydney rentals go fast. Land somewhere stable, then hunt long-term from inside the city.', timeEst:'1 hr', daysBefore:30 },
      { id:'h2', track:'home', title:'Browse long-term rentals on REA or Domain', desc:'Realestate.com.au and Domain.com.au are the two main platforms. Expect to pay 4 weeks bond + 2 weeks in advance.', timeEst:'Ongoing', daysBefore:45, url:'https://www.realestate.com.au', urlLabel:'realestate.com.au' },
      { id:'h3', track:'home', title:'Get a rental reference letter', desc:'Most agents require employer references or previous landlord letters. Prepare these before you look.', timeEst:'1–2 days', daysBefore:60 },
      { id:'l1', track:'life', title:'Enrol in Medicare on arrival', desc:"If you're a permanent resident or citizen of a reciprocal country (UK, NZ, IE, etc.), enrol at a Medicare office within 30 days.", timeEst:'1 hr on arrival', costEst:'Free', daysBefore:-7, url:'https://www.servicesaustralia.gov.au/medicare', urlLabel:'Medicare info' },
      SAFETYWING('A$'),
      { id:'l3', track:'life', title:'Transfer or get an Australian driving licence', desc:'Most states let you drive on a foreign licence for 3 months, then convert (no test required from many countries).', timeEst:'1 hr at transport office', costEst:'A$30–50', daysBefore:60 },
      { id:'l4', track:'life', title:'Join the expat community', desc:'r/australia and r/expats are active. Facebook groups "British Expats in Australia" / "South Africans in Australia" etc. are city-specific.', timeEst:'10 min' },
    ],
  }),

  // ── India ─────────────────────────────────────────────────────────────────
  india: (workType) => ({
    currency: '₹', verified: true,
    steps: [
      { id:'p1', track:'papers', title:'Apply for an Employment Visa (e-Visa or Consulate)', desc:'Employment visas require a job offer letter from an Indian company. Apply at the Indian consulate in your country — e-visa is NOT available for employment.', timeEst:'3–5 weeks', costEst:'USD 80–160', daysBefore:90, url:'https://indianvisaonline.gov.in', urlLabel:'Indian Visa Online' },
      { id:'p2', track:'papers', title:'Register with FRRO within 14 days of arrival', desc:'All foreign nationals staying >180 days must register at the FRRO (Foreigners Regional Registration Office) within 14 days. Do this online first.', timeEst:'1–3 days', costEst:'Free', daysBefore:-10, url:'https://indianfrro.gov.in', urlLabel:'FRRO Online' },
      { id:'p3', track:'papers', title:'Get an Aadhaar card (long stays)', desc:'Technically for residents with 182+ days in India, Aadhaar is increasingly required for banking, SIM, and services.', timeEst:'2–4 weeks', costEst:'Free', daysBefore:-30 },
      { id:'p4', track:'papers', title:'Get a PAN card for tax and banking', desc:"Required for income tax, banking transactions over ₹50,000, and many contracts. Apply online at NSDL or UTI.", timeEst:'15 min online / 2 week delivery', costEst:'₹110', estCost:110, daysBefore:-14, url:'https://www.tin-nsdl.com', urlLabel:'NSDL PAN' },
      WISE,
      { id:'m2', track:'money', title:'Open an NRO or resident bank account', desc:'HDFC, ICICI, Axis, and SBI are expat-friendly. Bring visa, FRRO registration, and employer letter. NRO account is for Indian income; resident if you live here full-time.', timeEst:'1–2 days', daysBefore:-7 },
      { id:'m3', track:'money', title:'Understand your tax filing obligation', desc:'Resident status kicks in at 182 days. India-sourced income is taxed even as a non-resident. Most employers handle TDS deduction.', timeEst:'2 hrs reading', daysBefore:30 },
      { id:'m4', track:'money', title:'Set up UPI (BHIM/PhonePe/GPay)', desc:'India is largely cashless via UPI. Link your Indian bank account to PhonePe or GPay for everyday payments.', timeEst:'20 min', costEst:'Free', daysBefore:-3 },
      { id:'h1', track:'home', title:'Book a serviced apartment for month 1', desc:'Airbnb/OYO for week 1, then move to a furnished service apartment. Gives you time to find a longer-term rental in the right neighbourhood.', timeEst:'1 hr', daysBefore:30 },
      { id:'h2', track:'home', title:'Browse rentals on 99acres or MagicBricks', desc:'Main platforms for long-term rentals. Expect a 2–3 month deposit (advance rent) standard in most cities.', timeEst:'Ongoing', daysBefore:45, url:'https://www.99acres.com', urlLabel:'99acres' },
      { id:'h3', track:'home', title:'Hire a reputable broker', desc:"Mumbai and Bangalore rental markets move fast. A local broker (brokerage: 1 month's rent) significantly speeds up the process.", timeEst:'1–2 days', daysBefore:45 },
      { id:'l1', track:'life', title:'Get comprehensive health insurance', desc:'Public hospitals are under-resourced. Expat packages from Cigna Global, BUPA, or AXA are recommended. Your employer may provide.', timeEst:'2 hrs comparing', costEst:'~₹20,000–60,000/yr', daysBefore:30 },
      SAFETYWING('₹'),
      { id:'l3', track:'life', title:'Get a local SIM card', desc:'Airtel and Jio are the main providers. Bring your passport and visa — activation takes 24 hours. Jio plans from ₹239/mo.', timeEst:'1 hr', costEst:'₹100–250/mo', daysBefore:-1 },
      { id:'l4', track:'life', title:'Join expat communities', desc:'InterNations India, r/indiasocial (expat tag), and Facebook groups "Expats in Bangalore/Mumbai/Hyderabad" are active.', timeEst:'10 min' },
    ],
  }),

  // ── Ireland ───────────────────────────────────────────────────────────────
  ireland: (workType, isEU) => ({
    currency: '€', verified: true,
    steps: isEU ? [
      { id:'p1', track:'papers', title:'Register at your local INTREO/council office', desc:'EU citizens can live and work freely. Register your address with the local council within 90 days. Keep proof of registration.', timeEst:'2 hrs', costEst:'Free', daysBefore:60 },
      { id:'p2', track:'papers', title:'Apply for a PPS Number (PPSN)', desc:'Your PPS is your tax/social insurance number — needed for work, tax, benefits, and banking. Apply at your nearest INTREO office with proof of address and right to work.', timeEst:'1 hr', costEst:'Free', daysBefore:-7, url:'https://www.gov.ie/en/service/12e6f5-get-a-personal-public-service-pps-number/', urlLabel:'Gov.ie PPS info' },
      WISE,
      { id:'m2', track:'money', title:'Open an Irish bank account', desc:'Bank of Ireland, AIB, and PTSB are the main banks. N26 and Revolut are fully functional for day-to-day. Traditional banks need proof of address (rental contract).', timeEst:'1–3 days', daysBefore:-7 },
      { id:'m3', track:'money', title:'Understand the PAYE tax system', desc:"Ireland's PAYE withholding starts at 20% (up to €40,000) then 40%. Register your employer with Revenue and claim your tax credits online.", timeEst:'30 min', url:'https://www.revenue.ie', urlLabel:'Revenue.ie' },
      { id:'h1', track:'home', title:'Book short-stay for arrival week', desc:"Dublin rentals are extremely competitive. Don't arrive without somewhere booked — the market is tight and moves in hours.", timeEst:'1 hr', daysBefore:45 },
      { id:'h2', track:'home', title:'Browse rentals on Daft.ie', desc:'Daft.ie is the dominant platform. Cork and Galway are cheaper than Dublin. Budget €1,400–2,200/mo for a Dublin 1-bed.', timeEst:'Ongoing', url:'https://www.daft.ie', urlLabel:'Daft.ie', daysBefore:60 },
      { id:'l1', track:'life', title:'Register with a GP', desc:'Ireland has a two-tier health system (public + private). Register with a GP early — lists fill up. Consider private health insurance (VHI, Laya, Irish Life) from month 1.', timeEst:'1–2 days', daysBefore:-14 },
      SAFETYWING('€'),
      { id:'l3', track:'life', title:'Join expat communities', desc:'InterNations Dublin is active. Facebook groups "Expats in Ireland" and r/ireland are good for practical advice.', timeEst:'10 min' },
    ] : [
      { id:'p1', track:'papers', title:'Obtain a Critical Skills Employment Permit', desc:'For salary ≥€32,000 (critical skills list) or ≥€64,000 (any occupation). Employer applies on your behalf via DETE online portal.', timeEst:'8–12 weeks processing', costEst:'€1,000 employer fee', daysBefore:120, url:'https://enterprise.gov.ie/en/what-we-do/workplace-and-skills/employment-permits/', urlLabel:'DETE permits portal' },
      { id:'p2', track:'papers', title:'Apply for an Irish Residence Permit (IRP)', desc:'On arrival, register at your local immigration office within 90 days. Bring permit approval, passport, proof of address, and €300 fee.', timeEst:'1–2 months (appointment queue)', costEst:'€300', estCost:300, daysBefore:60, url:'https://www.irishimmigration.ie', urlLabel:'Immigration Ireland' },
      { id:'p3', track:'papers', title:'Get your PPS Number', desc:"Apply at an INTREO office after arrival. Bring passport, IRP card, and proof of address. You can't start employment without this.", timeEst:'1 hr', costEst:'Free', daysBefore:-7 },
      WISE,
      { id:'m2', track:'money', title:'Open an Irish bank account', desc:'Bank of Ireland and AIB accept new arrivals. N26 and Revolut are quick digital alternatives. Traditional banks need your PPSN and IRP.', timeEst:'1–3 days', daysBefore:-7 },
      { id:'m3', track:'money', title:'Register with Revenue for PAYE', desc:'Register your employment with Revenue.ie and claim personal tax credits (€1,875/yr standard). Avoid paying emergency tax.', timeEst:'30 min', url:'https://www.revenue.ie' },
      { id:'h1', track:'home', title:'Book short-stay for arrival week', desc:'Dublin is one of Europe\'s tightest rental markets. Sort a 2-week base before searching long-term.', timeEst:'1 hr', daysBefore:45 },
      { id:'h2', track:'home', title:'Browse rentals on Daft.ie', desc:'Dublin 1-bed: €1,400–2,200+/mo. Cork and Galway are 30–40% cheaper. Act fast when you find something.', timeEst:'Ongoing', url:'https://www.daft.ie', urlLabel:'Daft.ie', daysBefore:60 },
      { id:'l1', track:'life', title:'Get health insurance', desc:'Non-EEA workers on Critical Skills permits can access public health care, but private insurance (Laya, VHI, Irish Life) significantly reduces wait times.', timeEst:'2 hrs', costEst:'€100–180/mo', daysBefore:30 },
      SAFETYWING('€'),
      { id:'l3', track:'life', title:'Join expat communities', desc:'InterNations Dublin, r/ireland, and Facebook groups "Expats in Ireland" are active.', timeEst:'10 min' },
    ],
  }),

  // ── Germany ───────────────────────────────────────────────────────────────
  germany: (workType, isEU) => ({
    currency: '€', verified: true,
    steps: isEU ? [
      { id:'p1', track:'papers', title:'Register your address (Anmeldung)', desc:'Required by law within 2 weeks of moving in. Go to your local Bürgeramt with your rental contract and passport. You\'ll get a Meldebescheinigung — keep it, you\'ll need it for everything.', timeEst:'30 min (book slot online)', costEst:'Free', daysBefore:0, url:'https://service.berlin.de/dienstleistung/120686/', urlLabel:'Berlin Bürgeramt (example)' },
      { id:'p2', track:'papers', title:'Get a Steueridentifikationsnummer (tax ID)', desc:'Sent automatically by post after Anmeldung — takes 2–4 weeks. You need it to be paid by an employer. Keep the letter safe.', timeEst:'2–4 weeks wait', costEst:'Free', daysBefore:-14 },
      WISE,
      { id:'m2', track:'money', title:'Open a German bank account', desc:'Deutsche Bank, ING, and DKB work well for new arrivals. N26 and Revolut are instant alternatives. Most traditional banks need Anmeldung confirmation.', timeEst:'1–3 days', daysBefore:-7 },
      { id:'m3', track:'money', title:'Understand German tax brackets', desc:"Germany's income tax starts at 14% (€11,604+ in 2024) and tops out at 45%. Church tax (8–9%) applies if registered. File a return via ELSTER annually.", timeEst:'2 hrs reading', url:'https://www.elster.de' },
      { id:'h1', track:'home', title:'Find accommodation on ImmobilienScout24', desc:'IS24 and ImmoWelt are the main platforms. Berlin average: €1,200–1,800/mo for a 1-bed. Munich averages €1,600–2,400.', timeEst:'Ongoing', url:'https://www.immobilienscout24.de', urlLabel:'ImmobilienScout24', daysBefore:60 },
      { id:'h2', track:'home', title:'Book mid-term furnished rental first', desc:'Housinganywhere and WG-Gesucht are good for furnished rooms/flats. Living in the city helps you compete for permanent rentals.', timeEst:'2 hrs', url:'https://www.wg-gesucht.de', urlLabel:'WG-Gesucht', daysBefore:45 },
      { id:'l1', track:'life', title:'Register for public health insurance (Krankenkasse)', desc:'Mandatory if employed. Join TK, AOK, or Barmer — they\'re all equivalent in coverage, differ in extra services. Costs ~14.6% salary split employer/employee.', timeEst:'30 min', costEst:'~7.3% of salary', daysBefore:0 },
      SAFETYWING('€'),
      { id:'l3', track:'life', title:'Join the expat community', desc:'r/germany and r/berlin (or r/munich etc.) are extremely helpful. Toytown Germany forum is good for older threads on bureaucracy.', timeEst:'10 min' },
    ] : [
      { id:'p1', track:'papers', title:'Get a job offer or freelance client in Germany', desc:'Without EU free movement, you need either an employment contract (for Skilled Worker / Blaukarte) or proven freelance income. Both require applying at the German embassy in your country.', timeEst:'Varies', daysBefore:180 },
      { id:'p2', track:'papers', title:'Apply for a Skilled Worker Visa or EU Blue Card', desc:'Skilled Worker Visa (§18a/b AufenthG): requires recognised qualification + offer ≥€43,800. EU Blue Card: ≥€45,300 (or €35,100 for shortage occupations in 2024).', timeEst:'6–12 weeks', costEst:'€75 visa fee', estCost:75, daysBefore:120, url:'https://www.auswaertiges-amt.de', urlLabel:'German Foreign Office' },
      { id:'p3', track:'papers', title:'Anmeldung within 2 weeks of arrival', desc:'Register at the Bürgeramt with rental contract and passport. Essential for bank account, tax ID, and everything else.', timeEst:'30 min', costEst:'Free', daysBefore:0 },
      { id:'p4', track:'papers', title:'Apply for your residence permit at the Ausländerbehörde', desc:'Within 90 days of arrival, convert your entry visa to a residence/work permit at the local Ausländerbehörde.', timeEst:'1–4 months (appointment)', costEst:'€100', estCost:100, daysBefore:-14 },
      WISE,
      { id:'m2', track:'money', title:'Open a German bank account', desc:'DKB, ING, and Deutsche Bank work well. Bring Anmeldung, passport, and employer letter. N26 is faster but has limited ATM access.', timeEst:'1–3 days', daysBefore:-7 },
      { id:'m3', track:'money', title:'Receive your Steueridentifikationsnummer', desc:'Posted automatically 2–4 weeks after Anmeldung. Give this to your employer — without it, you pay emergency tax (highest bracket).', timeEst:'2–4 weeks wait', daysBefore:-14 },
      { id:'h1', track:'home', title:'Find accommodation on ImmobilienScout24', desc:'Cold market: landlords expect Schufa credit check, last 3 payslips, and income proof. Berlin averages €1,200–1,800/mo for a 1-bed. Munich: €1,600–2,400.', timeEst:'Ongoing', url:'https://www.immobilienscout24.de', daysBefore:60 },
      { id:'l1', track:'life', title:'Register for public health insurance (GKV)', desc:'Statutory (public) health insurance is mandatory if salary <€69,300/yr. Join TK, AOK, or Barmer. Costs ~7.3% of gross salary.', timeEst:'30 min', costEst:'~7.3% of salary', daysBefore:-7 },
      SAFETYWING('€'),
    ],
  }),

  // ── Portugal ──────────────────────────────────────────────────────────────
  portugal: (workType, isEU) => ({
    currency: '€', verified: true,
    steps: isEU ? [
      { id:'p1', track:'papers', title:'Register as an EU resident (EURES / SEF)', desc:'Within 3 months: submit EU citizen registration at your local Câmara Municipal or SEF office. Bring passport, proof of income/employment, and NHR registration if applicable.', timeEst:'1–2 hrs', costEst:'€15', estCost:15, daysBefore:60, url:'https://eportugal.gov.pt', urlLabel:'ePortugal' },
      { id:'p2', track:'papers', title:'Get your NIF (tax number)', desc:"Apply at the local Finanças office on day one. Bring passport. Takes 1 hour. Without an NIF you can't open a bank account, sign a lease, or buy a SIM.", timeEst:'1 hr', costEst:'Free', daysBefore:0, url:'https://www.portaldasfinancas.gov.pt' },
      WISE,
      { id:'m2', track:'money', title:'Open a Portuguese bank account', desc:'Millennium BCP, Novo Banco, and ActivoBank are expat-friendly. Santander and BPI also work. Bring NIF, passport, and proof of address.', timeEst:'1–2 hrs', daysBefore:-7 },
      { id:'m3', track:'money', title:'Apply for NHR tax status (if eligible)', desc:'New residents who have not been tax resident in Portugal for 5 years can apply for NHR. Now replaced with IFICI regime (2024+) but legacy NHR ends 2024 — check your eligibility.', timeEst:'2–4 hrs', url:'https://www.portaldasfinancas.gov.pt' },
      { id:'h1', track:'home', title:'Browse rentals on Idealista', desc:'Idealista.pt is the main platform. Lisbon 1-bed: €1,200–1,800/mo. Porto is 20–30% cheaper. Competition is high — expect to pay 2 months deposit.', timeEst:'Ongoing', url:'https://www.idealista.pt', urlLabel:'Idealista.pt', daysBefore:60 },
      { id:'l1', track:'life', title:'Register with a health centre (USF)', desc:'EU citizens can use public healthcare (SNS). Register at your local centro de saúde with your residency card and EHIC card from your home country.', timeEst:'1–2 hrs', costEst:'Free', daysBefore:-7 },
      SAFETYWING('€'),
      { id:'l3', track:'life', title:'Join expat communities', desc:'r/expats_portugal, Facebook groups "Expats in Lisbon/Porto", and InterNations Portugal are all active.', timeEst:'10 min' },
    ] : [
      { id:'p1', track:'papers', title:'Apply for a D8 Digital Nomad Visa or D7 Passive Income Visa', desc:'D8: for remote workers earning ≥€3,040/mo (4× Portuguese minimum wage). D7: passive or self-employed income. Both applied at the Portuguese consulate in your country.', timeEst:'6–10 weeks', costEst:'€90 visa fee', estCost:90, daysBefore:150, url:'https://vistos.mne.gov.pt', urlLabel:'Consular visa portal' },
      { id:'p2', track:'papers', title:'Get your NIF before you arrive', desc:"Apply at a Portuguese consulate or via proxy service. Without an NIF you can't open a bank account or sign a lease even after arrival.", timeEst:'1–4 weeks', costEst:'€150–300 via proxy', daysBefore:120 },
      { id:'p3', track:'papers', title:'Apply for your residence permit (AIMA)', desc:'After entry, apply within 4 months at AIMA (formerly SEF). Bring: passport, visa, NIF, proof of accommodation, health insurance, clean criminal record.', timeEst:'3–9 months processing', costEst:'€320', estCost:320, daysBefore:30, url:'https://www.aima.gov.pt' },
      WISE,
      { id:'m2', track:'money', title:'Open a Portuguese bank account', desc:'Novo Banco and Millennium BCP are most accessible for non-residents. Bring NIF, passport, and proof of address or rental contract.', timeEst:'1–3 days', daysBefore:-7 },
      { id:'m3', track:'money', title:'Apply for NHR/IFICI tax status (if eligible)', desc:"NHR offered 10 years of 20% flat tax on Portuguese income. IFICI replaced it in 2024 — applies to tech, research, and highly-qualified workers. Apply within 90 days of tax residency.", timeEst:'2–4 hrs', url:'https://www.portaldasfinancas.gov.pt' },
      { id:'h1', track:'home', title:'Browse rentals on Idealista or Uniplaces', desc:'Idealista.pt for all rentals. Lisbon 1-bed: €1,200–1,800/mo centre. Porto 20% cheaper. Budget 2 months deposit + 1 month rent upfront.', timeEst:'Ongoing', url:'https://www.idealista.pt', daysBefore:60 },
      { id:'l1', track:'life', title:'Get private health insurance', desc:'Required for visa application. SafetyWing or Cigna Global from €50–100/mo. After residence permit, you can access SNS (public).', timeEst:'2 hrs', costEst:'€50–120/mo', daysBefore:150 },
      SAFETYWING('€'),
    ],
  }),

  // ── Netherlands ───────────────────────────────────────────────────────────
  netherlands: (workType, isEU) => ({
    currency: '€', verified: true,
    steps: isEU ? [
      { id:'p1', track:'papers', title:'Register at the municipality (DigiD / BRP)', desc:'EU citizens register at the local municipality (gemeente). Book a BRP appointment to get your BSN (citizen service number). Bring passport and rental contract.', timeEst:'1–2 hrs', costEst:'Free', daysBefore:0, url:'https://www.rijksoverheid.nl' },
      { id:'p2', track:'papers', title:'Get a DigiD account', desc:'Your digital identity for all Dutch government services — tax, healthcare, benefits. Activate via DigiD.nl using your BSN. Takes 5 days for the activation letter.', timeEst:'10 min + 5 day wait', costEst:'Free', daysBefore:-14, url:'https://www.digid.nl' },
      WISE,
      { id:'m2', track:'money', title:'Open a Dutch bank account (iDEAL-compatible)', desc:'ING, ABN AMRO, and Rabobank are the main banks. Bring BSN and passport. Almost all Dutch payments use iDEAL — get a Dutch account before signing anything.', timeEst:'1–3 days', daysBefore:-7 },
      { id:'m3', track:'money', title:'Get mandatory basic health insurance (basisverzekering)', desc:'Everyone in NL must have basic Dutch health insurance within 4 months of arrival. Costs ~€140–160/mo (2024). Apply via Zorgwijzer.nl to compare.', timeEst:'1 hr', costEst:'€140–160/mo', estCost:150, daysBefore:-30, url:'https://www.zorgwijzer.nl' },
      { id:'h1', track:'home', title:'Browse rentals on Funda or Pararius', desc:'Funda is the main platform for buy and rent. Pararius focuses on rentals. Amsterdam average: €1,600–2,400/mo for a 1-bed. Rotterdam and The Hague are cheaper.', timeEst:'Ongoing', url:'https://www.funda.nl', urlLabel:'Funda.nl', daysBefore:60 },
      { id:'l1', track:'life', title:'Register with a GP (Huisarts)', desc:'Dutch healthcare requires registering with a local GP. Ask neighbours or use the Zorgwijzer tool to find one accepting patients.', timeEst:'1–2 days', daysBefore:-14 },
      SAFETYWING('€'),
    ] : [
      { id:'p1', track:'papers', title:'Get a job offer meeting the Highly Skilled Migrant threshold', desc:'Highly Skilled Migrant (Kennismigrant) visa: employer must be IND-recognised sponsor. Salary threshold: €4,171/mo (under 30) or €5,688/mo (30+) in 2024.', timeEst:'Employer-led', costEst:'€350 IND fee (employer pays)', daysBefore:120, url:'https://ind.nl/en/work/working-in-the-netherlands', urlLabel:'IND work permits' },
      { id:'p2', track:'papers', title:'Employer applies to IND on your behalf', desc:'Your employer submits the application via IND online. Processing: 2 weeks (premium) or 90 days (standard). You receive an MVV sticker in your passport.', timeEst:'2–12 weeks', daysBefore:90 },
      { id:'p3', track:'papers', title:'Collect residence permit (VVR) after arrival', desc:'Within 3 days of arrival, register at the IND desk to collect your biometric residence card (VVR). Bring your MVV passport.', timeEst:'1–2 hrs', costEst:'€67', estCost:67, daysBefore:0, url:'https://ind.nl' },
      { id:'p4', track:'papers', title:'Register at gemeente for BSN', desc:'Municipal registration within 5 days of arrival. BSN is required for bank, tax, insurance, and employment. Bring: passport, VVR, rental contract.', timeEst:'1–2 hrs', costEst:'Free', daysBefore:-3 },
      WISE,
      { id:'m2', track:'money', title:'Open an iDEAL-compatible bank account', desc:'ING, ABN AMRO, or Rabobank. Bring BSN and passport. iDEAL is used for virtually all Dutch online and in-person payments — essential from day 1.', timeEst:'1–2 days', daysBefore:-7 },
      { id:'m3', track:'money', title:'Apply for the 30% ruling (tax break)', desc:'Expats with specific expertise may get 30% of salary tax-free for 5 years. Apply within 4 months of starting work via the Belastingdienst. Employer submits the request.', timeEst:'1–4 months processing', daysBefore:-30, url:'https://www.belastingdienst.nl' },
      { id:'m4', track:'money', title:'Get mandatory health insurance (basisverzekering)', desc:'Required for all residents. ~€140–160/mo (2024). Apply within 4 months of arrival via Zorgwijzer.nl. Employer may top up with supplementary coverage.', timeEst:'1 hr', costEst:'€140–160/mo', estCost:150, daysBefore:-30, url:'https://www.zorgwijzer.nl' },
      { id:'h1', track:'home', title:'Browse rentals on Funda and Pararius', desc:'Funda.nl and Pararius.nl. Amsterdam 1-bed: €1,600–2,400/mo. Rotterdam ~€1,200–1,600. The Hague ~€1,200–1,700. Market moves fast — have bank proof ready.', timeEst:'Ongoing', url:'https://www.funda.nl', daysBefore:60 },
      { id:'l1', track:'life', title:'Register with a GP and sort DigiD', desc:'Register with a local huisarts within 2 weeks. Apply for DigiD online (BSN required) — you need it for all Dutch government portals and tax filing.', timeEst:'2 hrs', daysBefore:-14 },
      SAFETYWING('€'),
    ],
  }),

  // ── United Kingdom ────────────────────────────────────────────────────────
  'united-kingdom': (workType) => ({
    currency: '£', verified: true,
    steps: [
      { id:'p1', track:'papers', title:'Get a Skilled Worker visa via employer sponsor', desc:'Salary threshold: £41,700 (2024 increase) or going rate for occupation, whichever is higher. Employer must have a sponsor licence and issue a Certificate of Sponsorship (CoS).', timeEst:'Employer assigns CoS; your visa processing 3–8 weeks', costEst:'£827 visa fee + IHS', daysBefore:120, url:'https://www.gov.uk/skilled-worker-visa', urlLabel:'GOV.UK Skilled Worker' },
      { id:'p2', track:'papers', title:'Pay the Immigration Health Surcharge (IHS)', desc:'You pay £1,035/yr upfront as part of the visa application. Cover starts on your visa start date — gives full NHS access.', timeEst:'Paid online during visa application', costEst:'£1,035/yr', estCost:1035, daysBefore:120 },
      { id:'p3', track:'papers', title:'Prove your English language ability', desc:'Required for Skilled Worker visa (B1 level). IELTS SELT or accepted qualifications. Not needed if from an English-speaking country or have an English-medium degree.', timeEst:'2–4 weeks (IELTS)', costEst:'£150–200', daysBefore:150 },
      { id:'p4', track:'papers', title:'Collect your eVisa and BRP (or digital status)', desc:"New arrivals get a digital eVisa (no physical BRP from 2025). Access via the UKVI online service. Share a 'view and prove' link for landlords and employers.", timeEst:'On arrival', costEst:'Free', daysBefore:0, url:'https://www.gov.uk/view-prove-immigration-status' },
      { id:'p5', track:'papers', title:'Apply for National Insurance number (NINo)', desc:'Apply online at GOV.UK after arrival. Required to pay the correct tax and build NI record (for future state pension). Takes 2–4 weeks.', timeEst:'30 min apply / 2–4 wks wait', costEst:'Free', daysBefore:-7, url:'https://www.gov.uk/apply-national-insurance-number' },
      WISE,
      { id:'m2', track:'money', title:'Open a UK bank account', desc:'HSBC, Barclays, and NatWest accept new arrivals with passport + visa + proof of address. Monzo and Starling open in minutes — great as a bridge account.', timeEst:'1–3 days', daysBefore:-7 },
      { id:'m3', track:'money', title:'Register with HMRC as a new employee', desc:"Your employer should handle PAYE. Check your tax code via HMRC's personal tax account — if it shows 'emergency tax code' (e.g. 1257L W1), call HMRC to correct it.", timeEst:'30 min', url:'https://www.gov.uk/personal-tax-account', urlLabel:'HMRC personal tax account' },
      { id:'h1', track:'home', title:'Browse rentals on Rightmove or SpareRoom', desc:'Rightmove for all rentals. SpareRoom for rooms and flat shares. London 1-bed: £1,600–2,500/mo. Manchester/Leeds/Bristol: £900–1,400/mo. Deposit capped at 5 weeks rent.', timeEst:'Ongoing', url:'https://www.rightmove.co.uk', urlLabel:'Rightmove', daysBefore:60 },
      { id:'h2', track:'home', title:'Know your tenant rights', desc:"Deposit capped at 5 weeks (Tenant Fees Act 2019). Landlord must protect your deposit in a government scheme (DPS, MyDeposits, TDS). Get a written tenancy agreement.", timeEst:'1 hr reading', daysBefore:45 },
      { id:'l1', track:'life', title:'NHS is covered — register with a GP', desc:'Your IHS payment covers full NHS access. Register with a local GP on arrival — GP lists can fill up. Walk-in centres are an alternative while waiting.', timeEst:'30 min', costEst:'Free (IHS already paid)', daysBefore:-7 },
      SAFETYWING('£'),
      { id:'l3', track:'life', title:'Join expat communities', desc:'r/unitedkingdom, r/london (or r/Manchester etc.), and InterNations UK. Meetup.com has active expat groups in every major city.', timeEst:'10 min' },
    ],
  }),

  // ── Canada ────────────────────────────────────────────────────────────────
  canada: () => ({
    currency: 'C$', verified: true,
    steps: [
      { id:'p1', track:'papers', title:'Check your Express Entry CRS score', desc:'Express Entry draws are held every 2 weeks. CRS score of 470+ (2024 average). Calculate via IRCC\'s CRS tool. Improve score with: Canadian job offer (+50–200 pts), provincial nomination (+600 pts), or language score improvement.', timeEst:'30 min', costEst:'Free', daysBefore:365, url:'https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry.html', urlLabel:'IRCC Express Entry' },
      { id:'p2', track:'papers', title:'Get language test (IELTS or CELPIP)', desc:'Minimum CLB 7 for FSW (about IELTS 6.0). Higher scores improve CRS dramatically. IELTS General: 4 skills scored. Book 6–8 weeks ahead.', timeEst:'3 hrs test / 2 wks result', costEst:'C$310–390', estCost:350, daysBefore:270 },
      { id:'p3', track:'papers', title:'Get ECA (Educational Credential Assessment)', desc:'WES Canada is the gold standard. Submit university transcripts + degree certificates. Takes 7–15 weeks standard, 5 days rush.', timeEst:'7–15 weeks', costEst:'C$300–340', estCost:320, daysBefore:270, url:'https://www.wes.org/ca/', urlLabel:'WES Canada' },
      { id:'p4', track:'papers', title:'Submit ITA application (PR) within 60 days', desc:'Once invited, you have 60 days to submit full application via IRCC portal. Documents: passport, police certificates, medicals, ECA, language, employment records.', timeEst:'3–6 months processing', costEst:'C$1,365 (principal applicant)', estCost:1365, daysBefore:90 },
      { id:'p5', track:'papers', title:'Apply for Social Insurance Number (SIN)', desc:'Apply online or at Service Canada after landing. Free. Required for employment, CRA tax filings, and government benefits. Protect it — treat like a SSN.', timeEst:'15 min', costEst:'Free', daysBefore:-3, url:'https://www.canada.ca/en/employment-social-development/services/sin.html' },
      WISE,
      { id:'m2', track:'money', title:"Open a newcomer bank account", desc:'RBC, Scotiabank, TD, and BMO all have free newcomer accounts for first year. RBC and Scotiabank have dedicated immigration partnerships. Bring passport, SIN, and landing documents.', timeEst:'1 hr', daysBefore:-7 },
      { id:'m3', track:'money', title:'Set up Interac e-Transfer', desc:"Canada's payment network for personal transfers and many bill payments. Link your bank account — it's free with all major banks and used universally.", timeEst:'10 min', costEst:'Free', daysBefore:-3 },
      { id:'m4', track:'money', title:'Register with CRA for a tax account', desc:'File your first T1 return by April 30. Use your SIN to register at CRA My Account. As a new resident, you may be entitled to GST/HST credit and CCB (if applicable).', timeEst:'1 hr', url:'https://www.canada.ca/en/revenue-agency/services/e-services/e-services-individuals/account-individuals.html' },
      { id:'h1', track:'home', title:'Browse rentals on Rentals.ca or Kijiji', desc:'Rentals.ca, Kijiji Rentals, and Facebook Marketplace for long-term. Toronto 1-bed: C$2,200–2,800/mo. Vancouver: C$2,400–3,200. Calgary and Ottawa: C$1,600–2,000.', timeEst:'Ongoing', url:'https://rentals.ca', urlLabel:'Rentals.ca', daysBefore:60 },
      { id:'h2', track:'home', title:'Understand deposit rules', desc:"Most provinces allow first + last month's rent upfront (Ontario, BC). No damage deposit in Ontario. Landlord cannot demand more than this by law.", timeEst:'30 min reading', daysBefore:45 },
      { id:'l1', track:'life', title:'Apply for provincial health insurance', desc:"Each province has its own health plan. Most have a 3-month waiting period (BC, Ontario, New Brunswick). Get gap travel insurance for the wait.", timeEst:'30 min', costEst:'Free (provincial)', daysBefore:-7, url:'https://www.canada.ca/en/health-canada/services/health-care-system/provincial-territorial-health-plans.html' },
      SAFETYWING('C$'),
      { id:'l3', track:'life', title:'Get a Canadian driving licence', desc:'You can use a foreign licence for 60–90 days (varies by province). Exchange or write a knowledge test within the first 3 months. No road test required from many countries.', timeEst:'1–2 hrs', costEst:'C$30–90', daysBefore:60 },
    ],
  }),

  // ── UAE ───────────────────────────────────────────────────────────────────
  uae: () => ({
    currency: 'AED', verified: true,
    steps: [
      { id:'p1', track:'papers', title:'Get an employer-sponsored Entry Permit', desc:'UAE residency is employer-sponsored. Your company applies for an Employment Entry Permit via MOHRE/GDRFA. You then enter on that permit. Freelancers and remote workers can use the Freelance Permit (Ministry of Economy) or Green Visa.', timeEst:'2–4 weeks', daysBefore:60, url:'https://u.ae/en/information-and-services/visa-and-emirates-id', urlLabel:'UAE Visa & ID portal' },
      { id:'p2', track:'papers', title:'Get a medical fitness test (on arrival)', desc:'Mandatory health screening at an authorised clinic. Tests for TB, HIV, Hepatitis B/C. Usually arranged by employer. Required to activate residency.', timeEst:'Half day (on arrival)', costEst:'AED 300–500', estCost:400, daysBefore:0 },
      { id:'p3', track:'papers', title:'Apply for Emirates ID', desc:'Apply online via ICP Smart Services or through employer. Biometrics taken at typing centre. Takes 3–7 working days. Required for banking, SIM, driving licence, and virtually everything.', timeEst:'3–7 working days', costEst:'AED 370', estCost:370, daysBefore:0, url:'https://icp.gov.ae' },
      { id:'p4', track:'papers', title:'Receive UAE Residence Visa stamp', desc:'Once medical clears and Emirates ID is processed, GDRFA stamps your passport with the residence visa. Valid 2–3 years, renewable. Keep passport accessible.', timeEst:'1–5 working days', daysBefore:-7 },
      WISE,
      { id:'m2', track:'money', title:'Open a UAE bank account', desc:'Emirates NBD, FAB (First Abu Dhabi), ADCB, and Mashreq Bank are expat-friendly. Bring: Emirates ID, salary certificate, passport, and company letter. Salary must be transferred to this account.', timeEst:'1–3 days', daysBefore:-7 },
      { id:'m3', track:'money', title:'No income tax — but understand what is taxed', desc:"UAE has no personal income tax. VAT is 5% on most goods/services. Corporate tax (9%) was introduced in 2023 for businesses. Keep records if you're a freelancer.", timeEst:'1 hr reading', daysBefore:30 },
      { id:'h1', track:'home', title:'Register your tenancy with Ejari', desc:"All tenancy contracts in Dubai must be registered with Ejari (~AED 220–250). Your landlord or agent handles this. Required for utilities, residency registration, and car insurance.", timeEst:'1–2 hrs (with agent)', costEst:'AED 220–250', estCost:235, daysBefore:-3, url:'https://ejari.ae' },
      { id:'h2', track:'home', title:'Browse rentals on Bayut or Property Finder', desc:'Bayut.com and PropertyFinder.ae are the main platforms. Dubai 1-bed: AED 60,000–120,000/yr. Abu Dhabi: AED 55,000–95,000/yr. Cheque payments are standard (1–4 cheques for full year).', timeEst:'Ongoing', url:'https://www.bayut.com', urlLabel:'Bayut', daysBefore:60 },
      { id:'l1', track:'life', title:'Get mandatory health insurance (employer or self)', desc:"In Dubai, employer is legally required to provide basic health insurance. In Abu Dhabi, mandatory health insurance for all residents (Thiqa or private). Cigna/AXA are popular private options.", timeEst:'Employer-provided or 2 hrs to compare', costEst:'AED 3,000–8,000/yr', daysBefore:0 },
      { id:'l2', track:'life', title:'Transfer or get a UAE driving licence', desc:'Many nationalities can exchange their driving licence directly (no test). UK, US, EU, AUS — go to RTA with Emirates ID, passport, and existing licence. Fee ~AED 200.', timeEst:'2 hrs', costEst:'AED 200', estCost:200, daysBefore:30, url:'https://www.rta.ae' },
      SAFETYWING('AED'),
      { id:'l4', track:'life', title:'Understand UAE cultural norms', desc:"UAE is a Muslim-majority country. Alcohol is permitted in licensed venues only. Ramadan hours apply. Dress modestly in public areas (malls, souks, government buildings).", timeEst:'30 min reading', daysBefore:30 },
    ],
  }),

  // ── Singapore ────────────────────────────────────────────────────────────
  singapore: () => ({
    currency: 'S$', verified: true,
    steps: [
      { id:'p1', track:'papers', title:'Get an Employment Pass (EP) or ONE Pass', desc:'EP (employer-sponsored): minimum S$5,600/mo (S$6,200+ for financial services in 2024). COMPASS framework applies — employer must score ≥40 pts across criteria. ONE Pass: S$30,000+/mo or outstanding individual — self-applied, 5 yrs duration.', timeEst:'3–8 weeks processing', costEst:'S$105 (EP)', estCost:105, daysBefore:90, url:'https://www.mom.gov.sg/passes-and-permits', urlLabel:'MOM passes portal' },
      { id:'p2', track:'papers', title:'Complete COMPASS requirements (EP holders)', desc:"COMPASS (Complementarity Assessment Framework) scores your employer on: salary, qualification, skills, firm diversity. Employer must disclose. MOM's EP eligibility checker takes 1 min.", timeEst:'15 min check', daysBefore:120, url:'https://www.mom.gov.sg/compass', urlLabel:'COMPASS checker' },
      { id:'p3', track:'papers', title:'Register your address with ICA (in-person)', desc:'Within 2 weeks of arrival, register your Singapore address with the Immigration & Checkpoints Authority. Bring passport and EP/pass card.', timeEst:'1–2 hrs', costEst:'Free', daysBefore:-10, url:'https://www.ica.gov.sg' },
      WISE,
      { id:'m2', track:'money', title:'Open a Singapore bank account', desc:'DBS, OCBC, and UOB are the main banks. All expat-friendly. DBS MyAccount can be opened online. Bring EP card, passport, and proof of address. MAS-regulated, very stable.', timeEst:'1–3 days', daysBefore:-7 },
      { id:'m3', track:'money', title:'Set up PayNow (Singapore instant payments)', desc:"Singapore's equivalent of faster payments. Link your NRIC/FIN or mobile number to your DBS/OCBC/UOB account. Free, instant 24/7 transfers to any Singapore bank.", timeEst:'10 min', costEst:'Free', daysBefore:-3 },
      { id:'m4', track:'money', title:'Understand Singapore tax (territorial, flat rate)', desc:"Singapore taxes only income earned in Singapore. Tax rates: 0% up to S$20,000, 2–24% above. File returns annually via myTax Portal. No capital gains or inheritance tax.", timeEst:'1 hr', url:'https://mytax.iras.gov.sg' },
      { id:'h1', track:'home', title:'Browse rentals on PropertyGuru or 99.co', desc:'PropertyGuru.com.sg and 99.co are the main platforms. 1-bed in central Singapore: S$3,500–5,500/mo. Outer areas: S$2,200–3,500. Standard deposit: 1–2 months.', timeEst:'Ongoing', url:'https://www.propertyguru.com.sg', urlLabel:'PropertyGuru', daysBefore:60 },
      { id:'h2', track:'home', title:'Use a HDB unit for lower cost (if eligible)', desc:'EP holders can rent HDB flats — cheaper than private condos. Must be rented from a Singaporean/PR owner. Eligibility rules apply.', timeEst:'Ongoing', daysBefore:60, url:'https://www.hdb.gov.sg' },
      { id:'l1', track:'life', title:'Understand healthcare: foreigner rates apply', desc:"Singapore has excellent healthcare but foreigners pay 2–3× Singapore citizen rates at polyclinics and hospitals. Employer typically provides group health insurance. Get it on day 1.", timeEst:'1 hr to review employer plan', daysBefore:0 },
      { id:'l2', track:'life', title:'Get a Singapore mobile plan', desc:'Singtel, StarHub, and M1 are the main providers. SIM-only plans from S$18–40/mo. Bring passport and EP card. eSIM options available online.', timeEst:'30 min', costEst:'S$18–40/mo', daysBefore:-1 },
      SAFETYWING('S$'),
      { id:'l4', track:'life', title:'Join expat communities', desc:'r/singapore (very active), InterNations Singapore, and Facebook groups "Expats in Singapore" are all active. Many employer-linked communities too.', timeEst:'10 min' },
    ],
  }),

  // DENMARK — newtodenmark.dk verified. Pay Limit scheme + expat tax regime. 2025.
  denmark: (workType, isEU) => ({
    currency: 'kr', verified: true,
    steps: isEU ? [
      { id:'p1', track:'papers', title:'Register at the municipality (CPR number)', desc:'EU citizens register at the local municipality within 30 days. You will receive a CPR number (Civil Registration Number) — your key ID for everything in Denmark.', timeEst:'1–2 hours', costEst:'Free', daysBefore:0, url:'https://www.newtodenmark.dk', urlLabel:'New to Denmark' },
      WISE,
      { id:'m2', track:'money', title:'Open a Danish bank account', desc:'Danske Bank, Nordea, and Jyske Bank are the main options. All require a CPR number. Set up MobilePay (the dominant payment app in Denmark) immediately after.', timeEst:'1–2 days', daysBefore:-7 },
      { id:'m3', track:'money', title:'Set up MobilePay', desc:"Denmark is nearly cashless. MobilePay is how Danes split bills, pay rent, and send money. Link it to your Danish bank account via your phone number.", timeEst:'10 min', costEst:'Free', daysBefore:-3 },
      { id:'m4', track:'money', title:'Understand Danish income tax (38–56%)', desc:'Danish tax is high but covers healthcare, childcare, and university. Register with Skat.dk to get your preliminary income assessment (forskudsopgørelse) and ensure the right tax rate is applied.', timeEst:'1 hour', url:'https://skat.dk/en-us', urlLabel:'Skat.dk' },
      { id:'h1', track:'home', title:'Browse rentals on BoligPortal or Lejebolig', desc:'BoligPortal.dk and Lejebolig.dk are the main platforms. Copenhagen 1-bed averages DKK 14,000/mo (~€1,875). Expect 3 months deposit + 1–3 months prepaid rent upfront.', timeEst:'Ongoing', daysBefore:60, url:'https://www.boligportal.dk', urlLabel:'BoligPortal' },
      { id:'l1', track:'life', title:'Healthcare is automatic with CPR', desc:'Once CPR-registered, you get a yellow health insurance card and full access to the Danish public healthcare system. No private insurance required. Card arrives by post in ~2 weeks.', timeEst:'Automatic', costEst:'Free', daysBefore:-7 },
      SAFETYWING('€'),
    ] : [
      { id:'p1', track:'papers', title:'Apply via the Pay Limit Scheme or Positive List', desc:'Pay Limit: DKK 514,000/yr salary required (DKK 300,000 for certified employers). Positive List: DKK 448,000+. Fast-track scheme available for certified employers (~1 month processing). Fee: DKK 6,055 (~€810).', timeEst:'1–3 months', costEst:'DKK 6,055', estCost:6055, daysBefore:120, url:'https://www.newtodenmark.dk', urlLabel:'New to Denmark' },
      { id:'p2', track:'papers', title:'Get your CPR number on arrival', desc:'Register at the local municipality after your residence permit is issued. CPR is required for banking, healthcare, tax, and virtually everything. Processing takes 1–2 weeks.', timeEst:'1–2 weeks', costEst:'Free', daysBefore:0 },
      WISE,
      { id:'m2', track:'money', title:'Open a Danish bank account + MobilePay', desc:'Danske Bank, Nordea, or Jyske Bank. All need CPR. Set up MobilePay immediately — it is used universally for payments, rent splits, and transfers.', timeEst:'1–2 days', daysBefore:-7 },
      { id:'m3', track:'money', title:'Consider the expatriate flat-tax scheme (27%)', desc:'Qualifying employees earning ≥ DKK 65,400/mo gross can pay a flat 27% rate for up to 84 months. Apply when your employer registers you with Skat. Worth checking eligibility — standard rate is 38–56%.', timeEst:'30 min to check', url:'https://skat.dk/en-us', urlLabel:'Skat.dk' },
      { id:'h1', track:'home', title:'Browse BoligPortal or Lejebolig', desc:'BoligPortal.dk and Lejebolig.dk are the main platforms. Copenhagen 1-bed: DKK 12,500–16,500/mo (~€1,650–2,200). Budget 3 months deposit + 1–3 months prepaid rent upfront.', timeEst:'Ongoing', daysBefore:60, url:'https://www.boligportal.dk', urlLabel:'BoligPortal' },
      { id:'l1', track:'life', title:'Healthcare via CPR registration', desc:'Once CPR-registered as a resident, you get the yellow health card and full public healthcare access at no cost. Coverage starts with CPR — no waiting period for residence permit holders.', timeEst:'Automatic', costEst:'Free', daysBefore:-7 },
      SAFETYWING('€'),
    ],
  }),

  // FINLAND — migri.fi verified. Work permit + Kela health card. 2025.
  finland: (workType, isEU) => ({
    currency: '€', verified: true,
    steps: isEU ? [
      { id:'p1', track:'papers', title:'Register your right of residence (Maistraatti)', desc:'EU citizens register their right of residence at the Digital and Population Data Services Agency (DVV). You will receive a Finnish personal identity code, which is required for everything including tax, banking, and healthcare.', timeEst:'1–2 hours', costEst:'Free', daysBefore:0, url:'https://dvv.fi/en', urlLabel:'DVV Finland' },
      WISE,
      { id:'m2', track:'money', title:'Open a Finnish bank account', desc:'Nordea, OP (Osuuspankki), and Danske Bank are expat-friendly. All require your Finnish identity code. Set up MobilePay or Pivo (the Finnish mobile payment apps) right after.', timeEst:'1–2 days', daysBefore:-7 },
      { id:'m3', track:'money', title:'Get your tax card from Vero', desc:'Register with the Finnish Tax Administration (Vero) and get your tax card (verokortti). Without it your employer withholds at maximum rate. Takes a few days online.', timeEst:'30 min', url:'https://www.vero.fi/en/', urlLabel:'Vero.fi' },
      { id:'h1', track:'home', title:'Browse Lumo, SATO or HousingAnywhere', desc:'Lumo.fi and SATO.fi are large Finnish rental operators with no deposit required. HousingAnywhere for furnished mid-term. Helsinki 1-bed: €1,150–1,500/mo.', timeEst:'Ongoing', daysBefore:60, url:'https://www.lumo.fi/en', urlLabel:'Lumo.fi' },
      { id:'l1', track:'life', title:'Register with Kela for healthcare', desc:'After establishing residence, register with Kela (Social Insurance Institute) for your health insurance card. Takes a few weeks. Once registered, healthcare is essentially free.', timeEst:'30 min apply / 2–4 wks card', costEst:'Free', daysBefore:-14, url:'https://www.kela.fi', urlLabel:'Kela.fi' },
      SAFETYWING('€'),
    ] : [
      { id:'p1', track:'papers', title:'Apply for a work residence permit via Migri', desc:'Income requirement: €1,210–1,463/mo net (Helsinki area / without collective agreement). EU Blue Card: €3,827/mo. Apply via EnterFinland.fi. Processing: 1–3 months.', timeEst:'1–3 months', daysBefore:120, url:'https://migri.fi/en/residence-permit', urlLabel:'Migri.fi' },
      { id:'p2', track:'papers', title:'Register and get your Finnish identity code', desc:'After permit approval, register at DVV to get your Finnish identity code (henkilötunnus). Required for tax, banking, and healthcare. Do this immediately on arrival.', timeEst:'1–2 hours', costEst:'Free', daysBefore:0, url:'https://dvv.fi/en' },
      WISE,
      { id:'m2', track:'money', title:'Open a bank account + get tax card', desc:'Nordea, OP, or Danske Bank. Bring identity code and permit. Apply for your tax card (verokortti) via Vero.fi to avoid emergency tax deductions. Consider the 25% Key Employee flat rate if eligible.', timeEst:'1–2 days', daysBefore:-7, url:'https://www.vero.fi/en/', urlLabel:'Vero.fi' },
      { id:'h1', track:'home', title:'Browse Lumo, SATO or HousingAnywhere', desc:'Lumo.fi and SATO.fi are Finnish rental operators — no deposit required on their properties. Helsinki 1-bed: €1,150–1,500/mo. Central areas higher; suburbs more affordable.', timeEst:'Ongoing', daysBefore:60, url:'https://www.lumo.fi/en', urlLabel:'Lumo.fi' },
      { id:'l1', track:'life', title:'Register with Kela for public health cover', desc:'Register with Kela after establishing residence. Takes 2–4 weeks for the card. Once registered, healthcare is low-cost. Private insurance (~€30–100/mo) is recommended during the waiting period.', timeEst:'30 min apply / 2–4 wks', costEst:'Free once registered', daysBefore:-14, url:'https://www.kela.fi', urlLabel:'Kela.fi' },
      SAFETYWING('€'),
    ],
  }),

  // FRANCE — france-visas.gouv.fr verified. Talent Passport + impatriate regime. 2025.
  france: (workType, isEU) => ({
    currency: '€', verified: true,
    steps: isEU ? [
      { id:'p1', track:'papers', title:'Register your address and get a Numéro Fiscal', desc:'EU citizens need no visa. Register your address at the local tax office (Centre des Finances Publiques) to get your Numéro Fiscal (13-digit tax ID). Required for banking, housing, and employment.', timeEst:'1 hour', costEst:'Free', daysBefore:0 },
      WISE,
      { id:'m2', track:'money', title:'Open a French bank account', desc:'Crédit Agricole, Société Générale, and BNP Paribas are expat-accessible. Bring Numéro Fiscal, passport, and proof of address. Card payments are standard everywhere.', timeEst:'1–3 days', daysBefore:-7 },
      { id:'m3', track:'money', title:'Check eligibility for the Impatriate Regime', desc:"Foreign-recruited employees can exempt 30% of net salary from income tax for a limited period under Article 155B. Requires employer sponsorship and prior non-residency in France. Worth confirming with your employer.", timeEst:'1 hour', url:'https://www.impots.gouv.fr', urlLabel:'Impots.gouv.fr' },
      { id:'h1', track:'home', title:'Browse SeLoger or Leboncoin', desc:'SeLoger.com is the dominant platform. Leboncoin.fr also has strong listings. Paris 1-bed: €1,300–2,200+/mo depending on arrondissement. Deposit: 1 month. Many landlords require a French "garant" (guarantor).', timeEst:'Ongoing', daysBefore:60, url:'https://www.seloger.com', urlLabel:'SeLoger' },
      { id:'l1', track:'life', title:'Register at CPAM for Carte Vitale', desc:"After 3 months legal residence, register at your local CPAM (health insurance fund) for France's public healthcare card (Carte Vitale). Takes 4–8 months for the physical card. Get private insurance (€30–40/mo) while you wait.", timeEst:'30 min apply / 4–8 months card', daysBefore:-60, url:'https://www.ameli.fr', urlLabel:'Ameli.fr' },
      SAFETYWING('€'),
    ] : [
      { id:'p1', track:'papers', title:'Apply for Talent Passport (Passeport Talent)', desc:'Qualified employee: €39,582 gross/yr minimum. EU Blue Card: €59,373+/yr (2025). Up to 4-year permit. Apply via france-visas.gouv.fr. Processing: 4–8 weeks.', timeEst:'4–8 weeks', costEst:'€99–229 visa fee', daysBefore:120, url:'https://france-visas.gouv.fr/en/talents-internationaux-et-attractivite-economique', urlLabel:'France-Visas portal' },
      { id:'p2', track:'papers', title:'Get your Numéro Fiscal and Titre de Séjour', desc:'On arrival, register at the tax office for your Numéro Fiscal (free). Then apply for your Titre de Séjour (residence permit) at the local Préfecture within 3 months.', timeEst:'1–3 months total', costEst:'€225 residence permit', daysBefore:60 },
      WISE,
      { id:'m2', track:'money', title:'Open a French bank account', desc:'BNP Paribas, Société Générale, or Crédit Agricole. Bring Numéro Fiscal, passport, and Titre de Séjour. Alternatively, N26 or Revolut as a bridge account while waiting.', timeEst:'1–3 days', daysBefore:-7 },
      { id:'m3', track:'money', title:'Apply for the Impatriate Regime (30% exemption)', desc:'Foreign-recruited employees can exempt 30% of net remuneration from income tax under Article 155B. Requires employer sponsorship and prior non-residency. Apply within the year you arrive.', timeEst:'2 hours', url:'https://www.impots.gouv.fr', urlLabel:'Impots.gouv.fr' },
      { id:'h1', track:'home', title:'Browse SeLoger or Leboncoin', desc:'SeLoger.com is the dominant platform. Paris 1-bed: €1,300–2,200+/mo by arrondissement. Deposit: 1 month. Many landlords require a French "garant" — use a guarantor service (e.g. Visale) if you lack one.', timeEst:'Ongoing', daysBefore:60, url:'https://www.seloger.com', urlLabel:'SeLoger' },
      { id:'l1', track:'life', title:'Get private insurance, then register for Carte Vitale', desc:'Private health insurance (€30–40/mo) required for visa application and covers the 3-month wait for public coverage. After 3 months residence, register at CPAM for the Carte Vitale (takes 4–8 months for physical card).', timeEst:'Private: 2 hrs; CPAM: after 3 months', costEst:'€30–40/mo (private)', daysBefore:150, url:'https://www.ameli.fr', urlLabel:'Ameli.fr' },
      SAFETYWING('€'),
    ],
  }),

  // GREECE — aade.gr verified. Digital nomad permit + 50% tax reduction regime. 2025.
  greece: (workType, isEU) => ({
    currency: '€', verified: true,
    steps: isEU ? [
      { id:'p1', track:'papers', title:'Get your AFM tax number at the DOY', desc:'Apply at your local tax office (DOY) or via the myAADE online portal for your AFM (Αριθμός Φορολογικού Μητρώου — Tax Registry Number). Free, takes 2–3 days. Required for banking, leases, and everything else.', timeEst:'2–3 days', costEst:'Free', daysBefore:0, url:'https://www.aade.gr/en', urlLabel:'AADE portal' },
      { id:'p2', track:'papers', title:'Get your AMKA social security number', desc:'Apply at a KEP (Citizen Service Centre) with passport, AFM, and proof of address. AMKA is required to access public healthcare and social security. Takes 2–3 days.', timeEst:'2–3 days', costEst:'Free', daysBefore:-7 },
      WISE,
      { id:'m2', track:'money', title:'Open a Greek bank account', desc:'Alpha Bank, Eurobank, National Bank of Greece (NBG), and Piraeus Bank all work for EU residents. Bring AFM, passport, and proof of address.', timeEst:'1–2 days', daysBefore:-7 },
      { id:'m3', track:'money', title:'Consider the 50% tax reduction regime', desc:"New residents who haven't been Greek tax residents for most of the prior 5 years can apply for a 50% income tax reduction for up to 7 years. Apply at AADE within your first tax year.", timeEst:'2 hours', url:'https://www.aade.gr/en', urlLabel:'AADE portal' },
      { id:'h1', track:'home', title:'Browse Spitogatos or xe.gr', desc:'Spitogatos.gr/en and xe.gr/en are the main platforms. Athens 1-bed: €550–1,100/mo depending on neighbourhood. Deposit: typically 1–2 months.', timeEst:'Ongoing', daysBefore:60, url:'https://www.spitogatos.gr/en', urlLabel:'Spitogatos' },
      { id:'l1', track:'life', title:'Register with EFKA for public healthcare', desc:'Register with EFKA (social security) using your AMKA. After 50 days of contributions, you get full public healthcare access. Private insurance (~€30–80/mo) recommended in the meantime.', timeEst:'1 hour', daysBefore:-14, url:'https://www.efka.gov.gr' },
      SAFETYWING('€'),
    ] : [
      { id:'p1', track:'papers', title:'Apply for Digital Nomad Residence Permit', desc:'Income requirement: €3,500/mo after tax (+ 20% per spouse, +15% per child). Apply via the Greek consulate in your home country — in-country applications were abolished in Feb 2026. Processing: 30–45 days.', timeEst:'30–45 days', costEst:'€100–150', estCost:125, daysBefore:120 },
      { id:'p2', track:'papers', title:'Get AFM tax number + AMKA on arrival', desc:'AFM at the local DOY or myAADE online (2–3 days). AMKA at a KEP centre with AFM + passport (2–3 days). Both are free and required for banking, leases, and healthcare.', timeEst:'1 week', costEst:'Free', daysBefore:0, url:'https://www.aade.gr/en', urlLabel:'AADE portal' },
      WISE,
      { id:'m2', track:'money', title:'Open a Greek bank account', desc:'Alpha Bank, Eurobank, NBG, and Piraeus. Bring AFM, AMKA, passport, and proof of address. Card payments are standard; cash is still used at smaller establishments.', timeEst:'1–2 days', daysBefore:-7 },
      { id:'m3', track:'money', title:'Apply for the 50% income tax reduction', desc:'Non-Greek-resident newcomers can halve their Greek income tax for up to 7 years by registering with AADE. Apply during your first tax year of residency. Requires commitment to reside in Greece ≥2 years.', timeEst:'2 hours', url:'https://www.aade.gr/en', urlLabel:'AADE portal' },
      { id:'h1', track:'home', title:'Browse Spitogatos or xe.gr', desc:'Spitogatos.gr/en and xe.gr/en are the main platforms. Athens 1-bed: €550–1,100/mo. Psyrri and Monastiraki: higher. Suburbs: lower. Deposit typically 1–2 months.', timeEst:'Ongoing', daysBefore:60, url:'https://www.spitogatos.gr/en', urlLabel:'Spitogatos' },
      { id:'l1', track:'life', title:'Get AMKA and register with EFKA', desc:'Once registered with EFKA using your AMKA and 50 days of contributions, you access public healthcare. Private insurance (€30–210/mo) strongly recommended until then.', timeEst:'1 hour', costEst:'Private: €30–210/mo', daysBefore:-14 },
      SAFETYWING('€'),
    ],
  }),

  // HUNGARY — enterhungary.gov.hu verified. Flat 15% tax + White Card nomad visa. 2025.
  hungary: (workType, isEU) => ({
    currency: 'Ft', verified: true,
    steps: isEU ? [
      { id:'p1', track:'papers', title:'Register at the local government office', desc:'EU citizens register at the local government office (Okmányiroda) within 93 days. Bring passport and proof of address. You receive a registration certificate (Regisztrációs Igazolás) — needed for banking and tax ID.', timeEst:'1–2 hours', costEst:'Free', daysBefore:0, url:'https://enterhungary.gov.hu/eh/', urlLabel:'Enter Hungary' },
      { id:'p2', track:'papers', title:'Get your tax ID (Adóazonosító Jel)', desc:'Submit Form T34 to the Hungarian Tax Authority (NAV). Required before receiving income. Free, usually issued immediately.', timeEst:'1 day', costEst:'Free', daysBefore:-7, url:'https://nav.gov.hu/en', urlLabel:'NAV Hungary' },
      WISE,
      { id:'m2', track:'money', title:'Open a Hungarian bank account', desc:'OTP Bank is the largest in Hungary. Erste, Raiffeisen, and CIB are also expat-friendly. Bring your registration certificate and tax ID. Hungary has a flat 15% income tax — one of the lowest in Europe.', timeEst:'1–2 days', daysBefore:-7 },
      { id:'h1', track:'home', title:'Browse HousingAnywhere or Rentola', desc:'HousingAnywhere.com and Rentola.hu. Budapest 1-bed in the 5th–7th districts: HUF 260,000–350,000/mo (~€670–900). Deposit: 2–3 months rent.', timeEst:'Ongoing', daysBefore:60, url:'https://housinganywhere.com', urlLabel:'HousingAnywhere' },
      { id:'l1', track:'life', title:'Register with NEAK for public healthcare', desc:'Get your TAJ Card (Társadalombiztosítási Azonosító Jel) via your employer or NEAK. Required for public healthcare access. Takes 2–4 weeks.', timeEst:'1 hour + 2–4 weeks', costEst:'Free', daysBefore:-14 },
      SAFETYWING('€'),
    ] : [
      { id:'p1', track:'papers', title:'Apply for White Card (Digital Nomad) or Work Permit', desc:'White Card: €3,000/mo net income, 1-year validity. Work Permit: employer-sponsored, ~€750/mo minimum. Both via Enter Hungary portal. Note: Cultural Knowledge Exam now required for most non-EU nationals (effective Jan 2025).', timeEst:'~30 days', daysBefore:90, url:'https://enterhungary.gov.hu/eh/', urlLabel:'Enter Hungary' },
      { id:'p2', track:'papers', title:'Get tax ID (Adóazonosító Jel) on arrival', desc:'Submit Form T34 to NAV (Hungarian Tax Authority). Free, usually issued same day. Required before any employment or banking.', timeEst:'1 day', costEst:'Free', daysBefore:0, url:'https://nav.gov.hu/en', urlLabel:'NAV Hungary' },
      WISE,
      { id:'m2', track:'money', title:'Open a bank account (Hungary has 15% flat income tax)', desc:'OTP Bank, Erste, or Raiffeisen. Bring tax ID and residence permit. Hungary\'s 15% flat personal income tax makes it one of the most tax-efficient countries in Europe.', timeEst:'1–2 days', daysBefore:-7 },
      { id:'h1', track:'home', title:'Browse HousingAnywhere or Rentola', desc:'HousingAnywhere.com and Rentola.hu. Budapest 5th–7th district 1-bed: HUF 260,000–350,000/mo (~€670–900). Outer districts: HUF 190,000–250,000. Deposit: 2–3 months.', timeEst:'Ongoing', daysBefore:60, url:'https://housinganywhere.com', urlLabel:'HousingAnywhere' },
      { id:'l1', track:'life', title:'Get TAJ Card via NEAK or employer', desc:'Non-EU citizens without employer sponsorship may need to pay voluntary NEAK contributions (~€150–200/mo) for public healthcare. Private insurance (€40–80/mo) is the simpler option initially.', timeEst:'1–2 hours', costEst:'€40–80/mo private', daysBefore:-14 },
      SAFETYWING('€'),
    ],
  }),

  // ITALY — agenziaentrate.gov.it verified. Codice Fiscale + SSN. 2025.
  italy: (workType, isEU) => ({
    currency: '€', verified: true,
    steps: isEU ? [
      { id:'p1', track:'papers', title:'Get your Codice Fiscale at the Agenzia delle Entrate', desc:'Your 16-character Italian tax code (Codice Fiscale) is required for banking, leasing, mobile contracts, and employment. Apply in person at the Agenzia delle Entrate with your passport. Free, issued same day.', timeEst:'1 hour', costEst:'Free', daysBefore:0, url:'https://www.agenziaentrate.gov.it/en', urlLabel:'Agenzia delle Entrate' },
      { id:'p2', track:'papers', title:'Register at the Comune (Residenza Anagrafica)', desc:'Within 20 days of arrival, register your address at the local comune (Ufficio Anagrafe). Required for residency, healthcare, and a driving licence. Bring Codice Fiscale, passport, and proof of address.', timeEst:'1 hour', costEst:'Free', daysBefore:0 },
      WISE,
      { id:'m2', track:'money', title:'Open an Italian bank account', desc:'Intesa Sanpaolo and UniCredit are the largest banks and accept new EU residents. ING Direct Italia is a good digital option. Bring Codice Fiscale, passport, and proof of address.', timeEst:'1–2 days', daysBefore:-7 },
      { id:'h1', track:'home', title:'Browse Idealista or HousingAnywhere', desc:'Idealista.it is the main platform. Rome 1-bed: €1,050–1,700/mo. Milan 1-bed: €1,400–1,800/mo. Deposit: 1–2 months. Ensure your contract is a registered contratto di locazione.', timeEst:'Ongoing', daysBefore:60, url:'https://www.idealista.it/en/', urlLabel:'Idealista Italy' },
      { id:'l1', track:'life', title:'Register at the local ASL for Tessera Sanitaria', desc:'After residency registration, go to your local ASL (Azienda Sanitaria Locale) with Codice Fiscale, comune registration, and passport. Get your Tessera Sanitaria health card (free) — temporary paper version issued same day.', timeEst:'1 hour', costEst:'Free', daysBefore:-14 },
      SAFETYWING('€'),
    ] : [
      { id:'p1', track:'papers', title:'Apply for Elective Residence Visa or Work Visa', desc:'Elective Residence: passive income only, €28,000+/yr. Work Visa: employer-sponsored. Apply at the Italian consulate. Processing: 30–60 days. On arrival, register your Permesso di Soggiorno at the Questura within 8 days.', timeEst:'30–60 days', costEst:'€100–200 visa + €72 permit', daysBefore:120, url:'https://questure.poliziadistato.it/stranieri/', urlLabel:'Questura (police)' },
      { id:'p2', track:'papers', title:'Get Codice Fiscale + register at the Comune', desc:'Codice Fiscale at the Agenzia delle Entrate on arrival (free, same day). Then register your address at the local Ufficio Anagrafe within 20 days. Both are required before banking or healthcare.', timeEst:'1 day', costEst:'Free', daysBefore:0, url:'https://www.agenziaentrate.gov.it/en' },
      WISE,
      { id:'m2', track:'money', title:'Open an Italian bank account', desc:'Intesa Sanpaolo, UniCredit, or ING Direct Italia. Bring Codice Fiscale, Permesso di Soggiorno, passport, and proof of address. Cards are widely accepted; some smaller places are cash only.', timeEst:'1–2 days', daysBefore:-7 },
      { id:'h1', track:'home', title:'Browse Idealista or HousingAnywhere', desc:'Idealista.it is the dominant platform. Rome 1-bed: €1,050–1,700/mo. Milan: €1,400–1,800/mo. Deposit: 1–2 months. Use a registered contratto di locazione — it legally protects your deposit.', timeEst:'Ongoing', daysBefore:60, url:'https://www.idealista.it/en/', urlLabel:'Idealista Italy' },
      { id:'l1', track:'life', title:'Register at the ASL for the SSN health card', desc:'Once you have your Permesso di Soggiorno and comune registration, go to your local ASL to register for the SSN (public healthcare). Tessera Sanitaria issued immediately (paper); card arrives in 2–4 weeks. Free.', timeEst:'1 hour', costEst:'Free', daysBefore:-14 },
      SAFETYWING('€'),
    ],
  }),
}

// ── Generic fallback ──────────────────────────────────────────────────────────

function genericSteps(slug: string, passportTier: number, isEU: boolean, workType: string): Step[] {
  const currency = currencyFor(slug)
  const isDestEU = ['portugal','germany','spain','netherlands','ireland','france','italy','sweden','belgium','austria','denmark','finland','norway','switzerland','estonia','hungary','cyprus','romania','greece','croatia','malta'].includes(slug)
  const easyVisa = isEU && isDestEU

  const steps: Step[] = []

  if (easyVisa) {
    steps.push({ id:'p1', track:'papers', title:'Register as EU resident', desc:'Within 3 months of arrival, register at the local town hall. Bring your passport and proof of address.', timeEst:'2 hrs', costEst:'Free', daysBefore:60 })
    steps.push({ id:'p2', track:'papers', title:'Get a local tax number', desc:"You'll need this for housing, banking, and employment. Done at the tax office soon after arrival.", timeEst:'1–3 hrs', costEst:'Free', daysBefore:0 })
    steps.push({ id:'p3', track:'papers', title:'Obtain residence card / ID', desc:'Required for most admin tasks after the first 3 months of free movement.', timeEst:'1–4 weeks', daysBefore:-14 })
  } else if (passportTier <= 2) {
    steps.push({ id:'p1', track:'papers', title:'Research visa options', desc:'Check which visa routes are available for your passport. Book time with an immigration lawyer if uncertain.', timeEst:'2–4 hrs', daysBefore:180 })
    steps.push({ id:'p2', track:'papers', title:'Gather required documents', desc:'Typically: passport, proof of income, health insurance, clean criminal record, passport photos. Start early.', timeEst:'2–4 weeks', daysBefore:120 })
    steps.push({ id:'p3', track:'papers', title:'Get documents translated and notarised', desc:'Official translations are required. Use a sworn translator.', timeEst:'1–2 weeks', costEst:'Translation fees apply', daysBefore:90 })
    steps.push({ id:'p4', track:'papers', title:'Book your visa appointment', desc:'Embassy slots fill up weeks in advance. Book as soon as documents are ready.', timeEst:'Book now', costEst:'Visa fee applies', daysBefore:90 })
    steps.push({ id:'p5', track:'papers', title:'Submit application and wait', desc:'Processing times vary. Track your application status online.', timeEst:'4–12 weeks', daysBefore:60 })
  } else {
    steps.push({ id:'p1', track:'papers', title:'Check visa routes for your passport tier', desc:`Tier ${passportTier} passports may have limited routes. Check if a sponsored job offer, investor visa, or specific route is available.`, timeEst:'1 day', daysBefore:180 })
    steps.push({ id:'p2', track:'papers', title:'Consult an immigration lawyer', desc:'A local immigration lawyer significantly reduces rejection risk and identifies options you might miss.', timeEst:'1–2 weeks', costEst:'Consultation fee applies', daysBefore:150 })
    steps.push({ id:'p3', track:'papers', title:'Apostille and translate all documents', desc:'Allow 3–6 weeks. Budget for certified translations.', timeEst:'3–6 weeks', costEst:'Translation + apostille fees', daysBefore:120 })
    steps.push({ id:'p4', track:'papers', title:'Submit visa application', desc:"In person at the destination country's embassy. Bring originals and copies of everything.", timeEst:'1 day', costEst:'Visa fee applies', daysBefore:90 })
    steps.push({ id:'p5', track:'papers', title:'Await decision — plan contingency', desc:'Have a backup plan in case of rejection.', timeEst:'6–16 weeks', daysBefore:60 })
  }

  steps.push({ ...WISE, daysBefore: 90 })
  steps.push({ id:'m2', track:'money', title:'Set your move budget', desc:'Calculate upfront costs: visa + flights + first month rent + deposit + 3-month buffer.', timeEst:'30 min', url:'/move-budget', urlLabel:'Move Budget calculator', daysBefore:90 })
  steps.push({ id:'m3', track:'money', title:'Research tax obligations', desc:"Understand whether you'll be taxed as a resident, tax treaties, and when tax residency kicks in.", timeEst:'2–4 hrs', daysBefore:60 })
  steps.push({ id:'m4', track:'money', title:'Notify your current bank', desc:"Tell them you're moving abroad. Some banks close accounts for non-residents.", timeEst:'30 min', daysBefore:45 })
  if (workType === 'freelancer' || workType === 'owner') {
    steps.push({ id:'m5', track:'money', title:'Register as self-employed / open local company', desc:'Most countries require registration within 30–90 days of starting work.', timeEst:'1–4 weeks', costEst:'Registration fee applies', daysBefore:30 })
  }
  steps.push({ id:'m6', track:'money', title:'Open a local bank account', desc:'Do this in the first week of arrival. Bring rental contract, residency, and tax number.', timeEst:'1–3 days', daysBefore:-7 })

  steps.push({ id:'h1', track:'home', title:'Research neighbourhoods', desc:'Read about areas before committing. Check walkability, expat presence, and coworking access.', timeEst:'2–4 hrs', url:`/country/${slug}`, urlLabel:'City guide', daysBefore:90 })
  steps.push({ id:'h2', track:'home', title:'Browse mid-term furnished rentals', desc:'1–3 month furnished rentals give you time to find a long-term place without being locked in.', timeEst:'3–5 hrs', url:'https://www.spotahome.com', urlLabel:'Browse Spotahome', affiliate:true, daysBefore:60 })
  steps.push({ id:'h3', track:'home', title:'Book short-stay for first 2 weeks', desc:'Land somewhere before your long-term rental starts.', timeEst:'1 hr', url:'https://www.booking.com', urlLabel:'Find short-stay', affiliate:true, daysBefore:30 })
  steps.push({ id:'h4', track:'home', title:'Arrange mail forwarding', desc:"Set up forwarding from your previous address. Bank letters, government docs, and parcels will keep coming for months.", timeEst:'30 min', daysBefore:14 })

  steps.push(SAFETYWING(currency))
  steps.push({ id:'l2', track:'life', title:'Notify your tax authority of departure', desc:'Failing to deregister can leave you liable for tax in both countries.', timeEst:'1–2 hrs', daysBefore:30 })
  steps.push({ id:'l3', track:'life', title:'Get an international driving permit (IDP)', desc:"From your current country's motoring authority before you leave.", timeEst:'1–2 weeks', costEst:'Fee applies', daysBefore:30 })
  steps.push({ id:'l4', track:'life', title:'Download offline maps and translation', desc:'Maps.me or Google Maps offline. DeepL for translations.', timeEst:'15 min', costEst:'Free', daysBefore:7 })
  steps.push({ id:'l5', track:'life', title:'Cancel or pause home-address subscriptions', desc:"Gym memberships, local delivery apps, car insurance — many charge while you're away.", timeEst:'1 hr', daysBefore:7 })

  return steps
}

// ── Public API ─────────────────────────────────────────────────────────────────

export function getPlaybook(
  slug: string,
  passportTier: number,
  isEU: boolean,
  workType: string,
): PlaybookData {
  const override = OVERRIDES[slug]
  if (override) return override(workType, isEU)
  return {
    steps: genericSteps(slug, passportTier, isEU, workType),
    currency: currencyFor(slug),
    verified: false,
  }
}
