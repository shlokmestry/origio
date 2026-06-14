/**
 * data-updater.ts
 *
 * Weekly data refresh for Origio country data.
 *
 * Sources:
 *   salary_data      → World Bank GNI per capita × role multipliers × exchange rate
 *   cost_of_living   → Numbeo cost-of-living page (rent, utilities, transport, food)
 *   visa_routes      → Static reference table (visa_difficulty 1–10)
 *   safety_data      → Numbeo quality-of-life page (safety index, crime index)
 *   quality_of_life  → Numbeo quality-of-life page (QOL index, healthcare index)
 *   HDI validation   → Computed from World Bank (life expectancy, schooling, GNI PPP)
 *
 * Updated columns in country_data:
 *   salary_software_engineer … salary_supply_chain_manager (30 roles, annual local currency)
 *   cost_rent_city_centre, cost_rent_outside, cost_utilities_monthly,
 *   cost_transport_monthly, cost_eating_out, cost_groceries_monthly  (monthly local currency)
 *   score_safety, score_crime_rate, score_quality_of_life, score_healthcare  (0–10 scale)
 *   visa_difficulty  (1–10 integer)
 *
 * Validation bounds (applied before any DB write):
 *   salary (USD)      >0, <500 000
 *   rent (USD)        200–5 000
 *   visa_difficulty   1–10
 *   safety index      0–100  (raw Numbeo; stored ÷10)
 *   HDI               0–1    (logged only, not stored)
 *
 * Run with: tsx src/lib/data-updater.ts
 * Log file: logs/updates.log
 *
 * Required env vars (in .env.local or environment):
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import * as https from 'node:https';
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config({ path: path.resolve(process.cwd(), '.env.local') });
config({ path: path.resolve(process.cwd(), '.env') });

// ── Types ─────────────────────────────────────────────────────────────────────

interface CountryConfig {
  slug: string;           // matches countries.slug in DB
  currency: string;
  wbCode: string;         // World Bank 3-letter ISO code
  numbeoCity: string;     // Numbeo representative city (ASCII, spaces ok)
  visaDifficulty: number; // 1=easy … 10=very hard; static reference
}

interface WorldBankResult {
  gniPerCapitaUSD: number | null;
  exchangeRate: number | null;
  lifeExpectancy: number | null;
  expectedSchoolingYears: number | null;
  meanSchoolingYears: number | null;
  gniPppUSD: number | null;
}

interface NumbeoCostResult {
  rentCenterUSD: number | null;
  rentOutsideUSD: number | null;
  utilitiesUSD: number | null;
  transportUSD: number | null;
  eatingOutUSD: number | null;
  groceriesUSD: number | null;
}

interface NumbeoQolResult {
  qualityOfLifeIndex: number | null; // raw 0–250
  safetyIndex: number | null;        // raw 0–100
  crimeIndex: number | null;         // raw 0–100
  healthcareIndex: number | null;    // raw 0–100
}

interface UpdatePayload extends Record<string, unknown> {
  // salary (annual local currency)
  salary_software_engineer?: number;
  salary_ai_ml_engineer?: number;
  salary_cloud_architect?: number;
  salary_doctor?: number;
  salary_dentist?: number;
  salary_lawyer?: number;
  salary_pilot?: number;
  salary_pharmacist?: number;
  salary_data_scientist?: number;
  salary_product_manager?: number;
  salary_devops?: number;
  salary_cybersecurity?: number;
  salary_financial_analyst?: number;
  salary_biomedical_engineer?: number;
  salary_renewable_energy_engineer?: number;
  salary_civil_engineer?: number;
  salary_architect?: number;
  salary_supply_chain_manager?: number;
  salary_sales_manager?: number;
  salary_ux_designer?: number;
  salary_marketing_manager?: number;
  salary_hr_manager?: number;
  salary_physiotherapist?: number;
  salary_psychologist?: number;
  salary_accountant?: number;
  salary_nurse?: number;
  salary_graphic_designer?: number;
  salary_electrician?: number;
  salary_teacher?: number;
  salary_chef?: number;
  // cost (monthly local currency)
  cost_rent_city_centre?: number;
  cost_rent_outside?: number;
  cost_utilities_monthly?: number;
  cost_transport_monthly?: number;
  cost_eating_out?: number;
  cost_groceries_monthly?: number;
  // scores (0–10)
  score_safety?: number;
  score_crime_rate?: number;
  score_quality_of_life?: number;
  score_healthcare?: number;
  // visa
  visa_difficulty?: number;
  // meta
  last_verified: string;
  updated_at: string;
}

interface RunStats {
  updated: number;
  skipped: number;
  errors: string[];
  worldBankHits: number;
  numbeoHits: number;
}

// ── Country configuration ─────────────────────────────────────────────────────
// Slugs must exactly match countries.slug in the DB (45 rows).
// visaDifficulty reflects how hard it is for a typical skilled worker to relocate
// there (1=very welcoming, 10=very restrictive).

const COUNTRIES: CountryConfig[] = [
  { slug: 'argentina',      currency: 'ARS', wbCode: 'ARG', numbeoCity: 'Buenos Aires',     visaDifficulty: 4 },
  { slug: 'australia',      currency: 'AUD', wbCode: 'AUS', numbeoCity: 'Sydney',            visaDifficulty: 6 },
  { slug: 'austria',        currency: 'EUR', wbCode: 'AUT', numbeoCity: 'Vienna',            visaDifficulty: 5 },
  { slug: 'belgium',        currency: 'EUR', wbCode: 'BEL', numbeoCity: 'Brussels',          visaDifficulty: 5 },
  { slug: 'brazil',         currency: 'BRL', wbCode: 'BRA', numbeoCity: 'Sao Paulo',         visaDifficulty: 4 },
  { slug: 'canada',         currency: 'CAD', wbCode: 'CAN', numbeoCity: 'Toronto',           visaDifficulty: 5 },
  { slug: 'colombia',       currency: 'COP', wbCode: 'COL', numbeoCity: 'Bogota',            visaDifficulty: 3 },
  { slug: 'costa-rica',     currency: 'CRC', wbCode: 'CRI', numbeoCity: 'San Jose',          visaDifficulty: 3 },
  { slug: 'croatia',        currency: 'EUR', wbCode: 'HRV', numbeoCity: 'Zagreb',            visaDifficulty: 5 },
  { slug: 'cyprus',         currency: 'EUR', wbCode: 'CYP', numbeoCity: 'Nicosia',           visaDifficulty: 4 },
  { slug: 'czech-republic', currency: 'CZK', wbCode: 'CZE', numbeoCity: 'Prague',            visaDifficulty: 5 },
  { slug: 'denmark',        currency: 'DKK', wbCode: 'DNK', numbeoCity: 'Copenhagen',        visaDifficulty: 6 },
  { slug: 'estonia',        currency: 'EUR', wbCode: 'EST', numbeoCity: 'Tallinn',           visaDifficulty: 4 },
  { slug: 'finland',        currency: 'EUR', wbCode: 'FIN', numbeoCity: 'Helsinki',          visaDifficulty: 5 },
  { slug: 'france',         currency: 'EUR', wbCode: 'FRA', numbeoCity: 'Paris',             visaDifficulty: 5 },
  { slug: 'georgia',        currency: 'GEL', wbCode: 'GEO', numbeoCity: 'Tbilisi',           visaDifficulty: 2 },
  { slug: 'germany',        currency: 'EUR', wbCode: 'DEU', numbeoCity: 'Berlin',            visaDifficulty: 5 },
  { slug: 'greece',         currency: 'EUR', wbCode: 'GRC', numbeoCity: 'Athens',            visaDifficulty: 4 },
  { slug: 'hungary',        currency: 'HUF', wbCode: 'HUN', numbeoCity: 'Budapest',          visaDifficulty: 4 },
  { slug: 'india',          currency: 'INR', wbCode: 'IND', numbeoCity: 'Bangalore',         visaDifficulty: 7 },
  { slug: 'indonesia',      currency: 'IDR', wbCode: 'IDN', numbeoCity: 'Jakarta',           visaDifficulty: 5 },
  { slug: 'ireland',        currency: 'EUR', wbCode: 'IRL', numbeoCity: 'Dublin',            visaDifficulty: 5 },
  { slug: 'italy',          currency: 'EUR', wbCode: 'ITA', numbeoCity: 'Milan',             visaDifficulty: 4 },
  { slug: 'japan',          currency: 'JPY', wbCode: 'JPN', numbeoCity: 'Tokyo',             visaDifficulty: 7 },
  { slug: 'malaysia',       currency: 'MYR', wbCode: 'MYS', numbeoCity: 'Kuala Lumpur',      visaDifficulty: 4 },
  { slug: 'mexico',         currency: 'MXN', wbCode: 'MEX', numbeoCity: 'Mexico City',       visaDifficulty: 3 },
  { slug: 'netherlands',    currency: 'EUR', wbCode: 'NLD', numbeoCity: 'Amsterdam',         visaDifficulty: 5 },
  { slug: 'new-zealand',    currency: 'NZD', wbCode: 'NZL', numbeoCity: 'Auckland',          visaDifficulty: 6 },
  { slug: 'norway',         currency: 'NOK', wbCode: 'NOR', numbeoCity: 'Oslo',              visaDifficulty: 6 },
  { slug: 'panama',         currency: 'USD', wbCode: 'PAN', numbeoCity: 'Panama City',       visaDifficulty: 3 },
  { slug: 'poland',         currency: 'PLN', wbCode: 'POL', numbeoCity: 'Warsaw',            visaDifficulty: 5 },
  { slug: 'portugal',       currency: 'EUR', wbCode: 'PRT', numbeoCity: 'Lisbon',            visaDifficulty: 3 },
  { slug: 'romania',        currency: 'RON', wbCode: 'ROU', numbeoCity: 'Bucharest',         visaDifficulty: 4 },
  { slug: 'serbia',         currency: 'RSD', wbCode: 'SRB', numbeoCity: 'Belgrade',          visaDifficulty: 3 },
  { slug: 'singapore',      currency: 'SGD', wbCode: 'SGP', numbeoCity: 'Singapore',         visaDifficulty: 7 },
  { slug: 'south-africa',   currency: 'ZAR', wbCode: 'ZAF', numbeoCity: 'Cape Town',         visaDifficulty: 5 },
  { slug: 'south-korea',    currency: 'KRW', wbCode: 'KOR', numbeoCity: 'Seoul',             visaDifficulty: 6 },
  { slug: 'spain',          currency: 'EUR', wbCode: 'ESP', numbeoCity: 'Madrid',            visaDifficulty: 4 },
  { slug: 'sweden',         currency: 'SEK', wbCode: 'SWE', numbeoCity: 'Stockholm',         visaDifficulty: 5 },
  { slug: 'switzerland',    currency: 'CHF', wbCode: 'CHE', numbeoCity: 'Zurich',            visaDifficulty: 7 },
  { slug: 'thailand',       currency: 'THB', wbCode: 'THA', numbeoCity: 'Bangkok',           visaDifficulty: 4 },
  { slug: 'uae',            currency: 'AED', wbCode: 'ARE', numbeoCity: 'Dubai',             visaDifficulty: 5 },
  { slug: 'united-kingdom', currency: 'GBP', wbCode: 'GBR', numbeoCity: 'London',            visaDifficulty: 6 },
  { slug: 'usa',            currency: 'USD', wbCode: 'USA', numbeoCity: 'New York',          visaDifficulty: 7 },
  { slug: 'vietnam',        currency: 'VND', wbCode: 'VNM', numbeoCity: 'Ho Chi Minh City',  visaDifficulty: 4 },
];

// ── Validation bounds ─────────────────────────────────────────────────────────

const BOUNDS = {
  salaryUSD:          { min: 0,     max: 500_000 },
  rentUSD:            { min: 200,   max: 5_000   },
  utilitiesUSD:       { min: 10,    max: 1_000   },
  transportUSD:       { min: 5,     max: 500     },
  eatingOutUSD:       { min: 1,     max: 200     },
  groceriesUSD:       { min: 50,    max: 2_000   },
  safetyIndex:        { min: 0,     max: 100     },
  crimeIndex:         { min: 0,     max: 100     },
  qualityOfLifeIndex: { min: 0,     max: 250     },
  healthcareIndex:    { min: 0,     max: 100     },
  visaDifficulty:     { min: 1,     max: 10      },
  hdi:                { min: 0,     max: 1       },
  exchangeRate:       { min: 0.001, max: 100_000 },
  lifeExpectancy:     { min: 40,    max: 100     },
  schoolingYears:     { min: 0,     max: 25      },
  gniPppUSD:          { min: 500,   max: 200_000 },
} as const;

function inBounds(value: number, key: keyof typeof BOUNDS): boolean {
  return value >= BOUNDS[key].min && value <= BOUNDS[key].max;
}

// ── Salary multipliers ────────────────────────────────────────────────────────
// Annual salary as a multiple of GNI per capita for each role.
// Based on cross-country income share data and ILO occupational wage premia.

const SALARY_MULTIPLIERS: Record<string, number> = {
  salary_software_engineer:         2.20,
  salary_ai_ml_engineer:            2.50,
  salary_cloud_architect:           2.40,
  salary_doctor:                    3.00,
  salary_dentist:                   2.50,
  salary_lawyer:                    2.60,
  salary_pilot:                     2.80,
  salary_pharmacist:                2.10,
  salary_data_scientist:            2.30,
  salary_product_manager:           2.20,
  salary_devops:                    2.10,
  salary_cybersecurity:             2.25,
  salary_financial_analyst:         2.00,
  salary_biomedical_engineer:       2.00,
  salary_renewable_energy_engineer: 2.00,
  salary_civil_engineer:            1.90,
  salary_architect:                 1.95,
  salary_supply_chain_manager:      1.75,
  salary_sales_manager:             1.80,
  salary_ux_designer:               1.80,
  salary_marketing_manager:         1.70,
  salary_hr_manager:                1.60,
  salary_physiotherapist:           1.55,
  salary_psychologist:              1.60,
  salary_accountant:                1.50,
  salary_nurse:                     1.40,
  salary_graphic_designer:          1.30,
  salary_electrician:               1.30,
  salary_teacher:                   1.20,
  salary_chef:                      1.00,
};

// ── HTTP helpers ──────────────────────────────────────────────────────────────

function fetchJson(url: string): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const req = https.get(url, {
      headers: { 'User-Agent': 'origio-data-updater/2.0 (+https://findorigio.com)' },
    }, (res) => {
      let data = '';
      res.on('data', (c: Buffer) => { data += c.toString(); });
      res.on('end', () => {
        if (res.statusCode && res.statusCode >= 400) {
          reject(new Error(`HTTP ${res.statusCode}: ${url}`)); return;
        }
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(new Error(`JSON parse error: ${String(e)}`)); }
      });
    });
    req.on('error', reject);
    req.setTimeout(15_000, () => { req.destroy(new Error(`Timeout: ${url}`)); });
  });
}

function fetchHtml(url: string, depth = 0): Promise<string> {
  return new Promise((resolve, reject) => {
    if (depth > 5) { reject(new Error('Too many redirects')); return; }
    const req = https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'identity',
      },
    }, (res) => {
      if (res.statusCode && [301, 302, 303, 307, 308].includes(res.statusCode) && res.headers.location) {
        fetchHtml(res.headers.location, depth + 1).then(resolve).catch(reject);
        return;
      }
      let data = '';
      res.on('data', (c: Buffer) => { data += c.toString(); });
      res.on('end', () => {
        if (res.statusCode && res.statusCode >= 400) {
          reject(new Error(`HTTP ${res.statusCode}: ${url}`)); return;
        }
        resolve(data);
      });
    });
    req.on('error', reject);
    req.setTimeout(25_000, () => { req.destroy(new Error(`Timeout: ${url}`)); });
  });
}

// ── Utilities ─────────────────────────────────────────────────────────────────

// Strip diacritics and replace spaces with hyphens for Numbeo URLs.
function toNumbeoSlug(city: string): string {
  return city
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/\s+/g, '-');
}

// Parse the first number captured in a regex match.
function extractNumber(html: string, pattern: RegExp): number | null {
  const m = html.match(pattern);
  if (!m || !m[1]) return null;
  const v = parseFloat(m[1].replace(/,/g, ''));
  return isNaN(v) ? null : v;
}

// Round to 2 decimal places.
function r2(n: number): number {
  return Math.round(n * 100) / 100;
}

// ── World Bank API ────────────────────────────────────────────────────────────
// Indicators used:
//   NY.GNP.PCAP.CD    – GNI per capita (Atlas, current USD) — salary proxy
//   PA.NUS.FCRF       – Official exchange rate (LCU per USD)
//   SP.DYN.LE00.IN    – Life expectancy at birth
//   SE.SCH.LIFE       – Expected years of schooling
//   BAR.SCHL.15UP     – Mean years of schooling (Barro-Lee, pop 15+)
//   NY.GNP.PCAP.PP.CD – GNI per capita PPP (current international $)

const WB_BASE = 'https://api.worldbank.org/v2/country';

async function fetchWbIndicator(code: string, indicator: string): Promise<number | null> {
  const url = `${WB_BASE}/${code}/indicator/${indicator}?format=json&MRV=5`;
  try {
    const raw = await fetchJson(url) as [unknown, Array<{ value: number | null }>];
    for (const { value } of (raw[1] ?? [])) {
      if (value !== null && value !== undefined) return value;
    }
    return null;
  } catch {
    return null;
  }
}

async function fetchWorldBankData(country: CountryConfig): Promise<WorldBankResult> {
  const [gni, rate, le, eys, mys, gniPpp] = await Promise.all([
    fetchWbIndicator(country.wbCode, 'NY.GNP.PCAP.CD'),
    fetchWbIndicator(country.wbCode, 'PA.NUS.FCRF'),
    fetchWbIndicator(country.wbCode, 'SP.DYN.LE00.IN'),
    fetchWbIndicator(country.wbCode, 'SE.SCH.LIFE'),
    fetchWbIndicator(country.wbCode, 'BAR.SCHL.15UP'),
    fetchWbIndicator(country.wbCode, 'NY.GNP.PCAP.PP.CD'),
  ]);

  return {
    gniPerCapitaUSD:        gni    !== null && inBounds(gni,    'salaryUSD')      ? gni    : null,
    exchangeRate:           rate   !== null && inBounds(rate,   'exchangeRate')   ? rate   : null,
    lifeExpectancy:         le     !== null && inBounds(le,     'lifeExpectancy') ? le     : null,
    expectedSchoolingYears: eys    !== null && inBounds(eys,    'schoolingYears') ? eys    : null,
    meanSchoolingYears:     mys    !== null && inBounds(mys,    'schoolingYears') ? mys    : null,
    gniPppUSD:              gniPpp !== null && inBounds(gniPpp, 'gniPppUSD')      ? gniPpp : null,
  };
}

// ── HDI computation (UN formula) ──────────────────────────────────────────────
// Returns null if any component is missing or result is out of range.
// Logged for validation; not stored — no hdi column exists in country_data.

function computeHDI(
  le: number,
  eys: number,
  mys: number,
  gniPpp: number,
): number | null {
  try {
    const leIdx  = (le - 20) / (85 - 20);
    const edIdx  = ((eys / 18) + (mys / 15)) / 2;
    const incIdx = (Math.log(gniPpp) - Math.log(100)) / (Math.log(75_000) - Math.log(100));
    const hdi    = Math.cbrt(leIdx * edIdx * incIdx);
    return inBounds(hdi, 'hdi') ? r2(hdi * 10) / 10 : null;
  } catch {
    return null;
  }
}

// ── Numbeo cost-of-living scraper ─────────────────────────────────────────────
// All prices displayed in USD (?displayCurrency=USD).
// The page shows price values inside <span> tags within priceValue cells.
// Falls back to currency-symbol patterns for older page structures.

async function fetchNumbeoCostData(country: CountryConfig): Promise<NumbeoCostResult> {
  const citySlug = toNumbeoSlug(country.numbeoCity);
  const url = `https://www.numbeo.com/cost-of-living/in/${citySlug}?displayCurrency=USD`;

  const out: NumbeoCostResult = {
    rentCenterUSD: null, rentOutsideUSD: null, utilitiesUSD: null,
    transportUSD: null, eatingOutUSD: null, groceriesUSD: null,
  };

  let html: string;
  try { html = await fetchHtml(url); }
  catch { return out; }

  // Helper: try <span> pattern first, then $ pattern
  function scrape(itemRe: RegExp): number | null {
    const base = html.match(itemRe);
    if (!base) return null;
    const offset = base.index! + base[0].length;
    const chunk  = html.slice(offset, offset + 600);
    // span-enclosed value
    const spanM = chunk.match(/<span>([\d,]+(?:\.\d+)?)<\/span>/);
    if (spanM) return parseFloat(spanM[1].replace(/,/g, ''));
    // dollar-prefixed value
    const dolM = chunk.match(/(?:\$|＄)\s*([\d,]+(?:\.\d+)?)/);
    if (dolM) return parseFloat(dolM[1].replace(/,/g, ''));
    return null;
  }

  const rentC = scrape(/Apartment\s*\(1\s*bedroom\)\s*in\s*City\s*Centre/i);
  if (rentC !== null && inBounds(rentC, 'rentUSD')) out.rentCenterUSD = rentC;

  const rentO = scrape(/Apartment\s*\(1\s*bedroom\)\s*Outside\s*of\s*Centre/i);
  if (rentO !== null && inBounds(rentO, 'rentUSD')) out.rentOutsideUSD = rentO;

  const util = scrape(/Basic\s*\(Electricity,\s*Heating,\s*Cooling,\s*Water,\s*Garbage\)/i);
  if (util !== null && inBounds(util, 'utilitiesUSD')) out.utilitiesUSD = util;

  const trans = scrape(/Monthly\s*Pass\s*\(Regular\s*Route\)/i);
  if (trans !== null && inBounds(trans, 'transportUSD')) out.transportUSD = trans;

  const eat = scrape(/Meal,\s*Inexpensive\s*Restaurant/i);
  if (eat !== null && inBounds(eat, 'eatingOutUSD')) out.eatingOutUSD = eat;

  // Grocery basket: scrape individual item prices, multiply by monthly quantities.
  const milk    = scrape(/Milk\s*\(regular\),?\s*\(1\s*liter\)/i);
  const bread   = scrape(/Loaf\s*of\s*Fresh\s*White\s*Bread/i);
  const rice    = scrape(/Rice\s*\(white\),?\s*\(1\s*kg\)/i);
  const eggs    = scrape(/Eggs\s*\(regular\)\s*\(12\)/i);
  const chicken = scrape(/Chicken\s*Fillets,?\s*\(1\s*kg\)/i);
  const beef    = scrape(/Beef\s*Round\s*\(1\s*kg\)/i);
  const apples  = scrape(/Apples\s*\(1\s*kg\)/i);
  const tomato  = scrape(/Tomato\s*\(1\s*kg\)/i);
  const potato  = scrape(/Potato\s*\(1\s*kg\)/i);

  const groceryItems = [milk, bread, rice, eggs, chicken, beef, apples, tomato, potato];
  const validItems   = groceryItems.filter(v => v !== null && v > 0).length;

  if (validItems >= 5) {
    const basket = (
      (milk    ?? 0) * 4  +   // 4 L/month
      (bread   ?? 0) * 8  +   // 8 loaves/month
      (rice    ?? 0) * 2  +   // 2 kg/month
      (eggs    ?? 0) * 2  +   // 24 eggs/month
      (chicken ?? 0) * 2  +   // 2 kg/month
      (beef    ?? 0) * 1  +   // 1 kg/month
      (apples  ?? 0) * 2  +   // 2 kg/month
      (tomato  ?? 0) * 2  +   // 2 kg/month
      (potato  ?? 0) * 2      // 2 kg/month
    );
    if (inBounds(basket, 'groceriesUSD')) out.groceriesUSD = r2(basket);
  }

  return out;
}

// ── Numbeo quality-of-life scraper ────────────────────────────────────────────
// Primary: /quality-of-life/in/City  — gives QOL, safety, crime, healthcare.
// Fallback: /crime/in/City            — safety + crime only.

async function fetchNumbeoQolData(country: CountryConfig): Promise<NumbeoQolResult> {
  const citySlug = toNumbeoSlug(country.numbeoCity);
  const out: NumbeoQolResult = {
    qualityOfLifeIndex: null, safetyIndex: null, crimeIndex: null, healthcareIndex: null,
  };

  async function parseScores(html: string): Promise<void> {
    // Each index appears as "Label Index: VALUE" or in a table cell
    const qol    = extractNumber(html, /Quality\s*of\s*Life\s*Index\s*:?\s*[\s\S]{0,200}?(\d{1,3}(?:\.\d+)?)/i);
    const safety = extractNumber(html, /Safety\s*Index\s*:?\s*[\s\S]{0,200}?(\d{1,3}(?:\.\d+)?)/i);
    const crime  = extractNumber(html, /Crime\s*Index\s*:?\s*[\s\S]{0,200}?(\d{1,3}(?:\.\d+)?)/i);
    const health = extractNumber(html, /Health\s*Care\s*Index\s*:?\s*[\s\S]{0,200}?(\d{1,3}(?:\.\d+)?)/i);

    if (qol    !== null && inBounds(qol,    'qualityOfLifeIndex')) out.qualityOfLifeIndex = qol;
    if (safety !== null && inBounds(safety, 'safetyIndex'))        out.safetyIndex        = safety;
    if (crime  !== null && inBounds(crime,  'crimeIndex'))         out.crimeIndex         = crime;
    if (health !== null && inBounds(health, 'healthcareIndex'))    out.healthcareIndex    = health;
  }

  try {
    const qolHtml = await fetchHtml(`https://www.numbeo.com/quality-of-life/in/${citySlug}/`);
    await parseScores(qolHtml);
  } catch { /* try fallback below */ }

  // If QOL page failed or missing safety/crime, try crime page as fallback
  if (out.safetyIndex === null || out.crimeIndex === null) {
    try {
      const crimeHtml = await fetchHtml(`https://www.numbeo.com/crime/in/${citySlug}/`);
      const safety2 = extractNumber(crimeHtml, /Safety\s*Index\s*:?\s*[\s\S]{0,200}?(\d{1,3}(?:\.\d+)?)/i);
      const crime2  = extractNumber(crimeHtml, /Crime\s*Index\s*:?\s*[\s\S]{0,200}?(\d{1,3}(?:\.\d+)?)/i);
      if (out.safetyIndex === null && safety2 !== null && inBounds(safety2, 'safetyIndex')) out.safetyIndex = safety2;
      if (out.crimeIndex  === null && crime2  !== null && inBounds(crime2,  'crimeIndex'))  out.crimeIndex  = crime2;
    } catch { /* keep nulls */ }
  }

  return out;
}

// ── Salary computation ────────────────────────────────────────────────────────

function computeSalaries(
  gniPerCapitaUSD: number,
  exchangeRate: number | null,
  usdCurrency: boolean,   // true for Panama, USA
): Record<string, number> {
  const result: Record<string, number> = {};
  for (const [col, mult] of Object.entries(SALARY_MULTIPLIERS)) {
    const annualUSD = gniPerCapitaUSD * mult;
    if (!inBounds(annualUSD, 'salaryUSD')) continue;

    if (usdCurrency || exchangeRate === null) {
      result[col] = Math.round(annualUSD);
    } else {
      result[col] = Math.round(annualUSD * exchangeRate);
    }
  }
  return result;
}

// ── Supabase ──────────────────────────────────────────────────────────────────

type AnySupabaseClient = any;

async function getCountryId(
  supabase: AnySupabaseClient,
  slug: string,
): Promise<string | null> {
  const { data, error } = await supabase
    .from('countries')
    .select('id')
    .eq('slug', slug)
    .maybeSingle();
  if (error || !data) return null;
  return (data as { id: string }).id;
}

async function updateCountryData(
  supabase: AnySupabaseClient,
  slug: string,
  payload: UpdatePayload,
): Promise<void> {
  const countryId = await getCountryId(supabase, slug);
  if (!countryId) throw new Error(`Country not found in DB for slug "${slug}"`);

  const { error } = await supabase
    .from('country_data')
    .update(payload as Record<string, unknown>)
    .eq('country_id', countryId);

  if (error) throw new Error(`DB update failed for "${slug}": ${error.message}`);
}

// ── Logging ───────────────────────────────────────────────────────────────────

const LOG_FILE = path.resolve(process.cwd(), 'logs', 'updates.log');

function appendLog(message: string): void {
  const line = `[${new Date().toISOString()}] ${message}\n`;
  process.stdout.write(line);
  try {
    fs.mkdirSync(path.dirname(LOG_FILE), { recursive: true });
    fs.appendFileSync(LOG_FILE, line, 'utf8');
  } catch { /* non-fatal — no log dir in some CI envs */ }
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey  = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    appendLog('ERROR: Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  });

  const stats: RunStats = { updated: 0, skipped: 0, errors: [], worldBankHits: 0, numbeoHits: 0 };
  const runStart = Date.now();

  appendLog(`=== data-updater v2.0 started — ${COUNTRIES.length} countries ===`);
  appendLog(`Sources: World Bank API (salary/HDI), Numbeo (costs/scores), static (visa_difficulty)`);

  for (const country of COUNTRIES) {
    appendLog(`\nProcessing ${country.slug} (${country.wbCode}, ${country.currency})...`);

    try {
      // Fetch all sources in parallel per country
      const [wbData, costData, qolData] = await Promise.all([
        fetchWorldBankData(country),
        fetchNumbeoCostData(country),
        fetchNumbeoQolData(country),
      ]);

      const now     = new Date();
      const today   = now.toISOString().slice(0, 10);
      const payload: UpdatePayload = {
        last_verified: today,
        updated_at:    now.toISOString(),
      };
      const sourceNotes: string[] = [];
      const usdCurrency = country.currency === 'USD';

      // ── salary_data: World Bank GNI × role multipliers ────────────
      if (wbData.gniPerCapitaUSD !== null) {
        const salaries = computeSalaries(wbData.gniPerCapitaUSD, wbData.exchangeRate, usdCurrency);
        const count    = Object.keys(salaries).length;
        if (count > 0) {
          Object.assign(payload, salaries);
          stats.worldBankHits++;
          sourceNotes.push(
            `salary[${count} roles, gni=$${Math.round(wbData.gniPerCapitaUSD).toLocaleString()}, ` +
            `rate=${wbData.exchangeRate !== null ? wbData.exchangeRate.toFixed(3) : 'USD'}]`,
          );
        }
      } else {
        appendLog(`  salary: no GNI data from World Bank — keeping existing`);
        stats.skipped++;
      }

      // ── HDI validation (computed, logged only) ────────────────────
      if (
        wbData.lifeExpectancy         !== null &&
        wbData.expectedSchoolingYears !== null &&
        wbData.meanSchoolingYears     !== null &&
        wbData.gniPppUSD              !== null
      ) {
        const hdi = computeHDI(
          wbData.lifeExpectancy,
          wbData.expectedSchoolingYears,
          wbData.meanSchoolingYears,
          wbData.gniPppUSD,
        );
        if (hdi !== null) {
          appendLog(
            `  HDI=${hdi} [valid 0–1] ` +
            `(le=${wbData.lifeExpectancy.toFixed(1)}, ` +
            `eys=${wbData.expectedSchoolingYears.toFixed(1)}, ` +
            `mys=${wbData.meanSchoolingYears.toFixed(1)}, ` +
            `gniPpp=$${Math.round(wbData.gniPppUSD).toLocaleString()})`,
          );
        } else {
          appendLog(`  HDI: components found but result out of 0–1 bounds — skip`);
        }
      }

      // ── cost_of_living: Numbeo costs in local currency ────────────
      const exRate   = wbData.exchangeRate;
      const toLocal  = (usd: number): number =>
        (!usdCurrency && exRate !== null && exRate > 0)
          ? Math.round(usd * exRate)
          : Math.round(usd);

      const costFields: Array<[keyof UpdatePayload, number | null, keyof typeof BOUNDS, string]> = [
        ['cost_rent_city_centre',  costData.rentCenterUSD,  'rentUSD',      'rent_center'],
        ['cost_rent_outside',      costData.rentOutsideUSD, 'rentUSD',      'rent_outside'],
        ['cost_utilities_monthly', costData.utilitiesUSD,   'utilitiesUSD', 'utilities'],
        ['cost_transport_monthly', costData.transportUSD,   'transportUSD', 'transport'],
        ['cost_eating_out',        costData.eatingOutUSD,   'eatingOutUSD', 'eating_out'],
        ['cost_groceries_monthly', costData.groceriesUSD,   'groceriesUSD', 'groceries'],
      ];

      let costCount = 0;
      for (const [field, valueUSD, bound, label] of costFields) {
        if (valueUSD !== null && inBounds(valueUSD, bound)) {
          (payload as Record<string, unknown>)[field as string] = toLocal(valueUSD);
          sourceNotes.push(`${label}=$${valueUSD.toFixed(2)}`);
          costCount++;
        }
      }
      if (costCount > 0) stats.numbeoHits++;

      // ── safety_data / quality_of_life: Numbeo scores ──────────────
      // Raw 0–100 validated; stored ÷10 to give 0–10 scale.
      // Quality-of-life raw is 0–250; stored ÷20 to give 0–10, capped at 10.

      if (qolData.safetyIndex !== null) {
        payload.score_safety = r2(qolData.safetyIndex / 10);
        sourceNotes.push(`safety(raw=${qolData.safetyIndex}→${payload.score_safety})`);
      }
      if (qolData.crimeIndex !== null) {
        payload.score_crime_rate = r2(qolData.crimeIndex / 10);
        sourceNotes.push(`crime(raw=${qolData.crimeIndex}→${payload.score_crime_rate})`);
      }
      if (qolData.qualityOfLifeIndex !== null) {
        payload.score_quality_of_life = Math.min(r2(qolData.qualityOfLifeIndex / 20), 10);
        sourceNotes.push(`qol(raw=${qolData.qualityOfLifeIndex}→${payload.score_quality_of_life})`);
      }
      if (qolData.healthcareIndex !== null) {
        payload.score_healthcare = r2(qolData.healthcareIndex / 10);
        sourceNotes.push(`healthcare(raw=${qolData.healthcareIndex}→${payload.score_healthcare})`);
      }

      // ── visa_routes: static reference, validated ──────────────────
      if (inBounds(country.visaDifficulty, 'visaDifficulty')) {
        payload.visa_difficulty = country.visaDifficulty;
        sourceNotes.push(`visa_difficulty=${country.visaDifficulty}[static]`);
      }

      // Only write to DB if there is at least one meaningful field beyond timestamps
      const substantiveKeys = Object.keys(payload).filter(
        k => k !== 'last_verified' && k !== 'updated_at',
      );
      if (substantiveKeys.length > 0) {
        await updateCountryData(supabase, country.slug, payload);
        appendLog(`  ✓ updated ${substantiveKeys.length} fields — ${sourceNotes.join(' | ')}`);
        stats.updated++;
      } else {
        appendLog(`  – no new data — skipping DB write`);
        stats.skipped++;
      }

    } catch (err) {
      const msg = `${country.slug}: ${String(err)}`;
      appendLog(`  ERROR ${msg}`);
      stats.errors.push(msg);
    }
  }

  // ── Run summary ───────────────────────────────────────────────────────────
  const elapsed = ((Date.now() - runStart) / 1_000).toFixed(1);
  appendLog('\n' + '='.repeat(70));
  appendLog(`Run complete at ${new Date().toISOString()}`);
  appendLog(`Elapsed:      ${elapsed}s`);
  appendLog(`Countries:    ${COUNTRIES.length} total`);
  appendLog(`Updated:      ${stats.updated} rows`);
  appendLog(`Skipped:      ${stats.skipped} (no data)`);
  appendLog(`Errors:       ${stats.errors.length}`);
  appendLog(`World Bank:   ${stats.worldBankHits} salary datasets`);
  appendLog(`Numbeo:       ${stats.numbeoHits} cost datasets`);
  appendLog(`Visa table:   static (${COUNTRIES.length} entries)`);
  if (stats.errors.length > 0) {
    appendLog('Error detail:');
    stats.errors.forEach(e => appendLog(`  • ${e}`));
  }
  appendLog('='.repeat(70));

  if (stats.errors.length > 0) process.exit(1);
}

main().catch((err) => {
  appendLog(`FATAL: ${String(err)}`);
  process.exit(1);
});
