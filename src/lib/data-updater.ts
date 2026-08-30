/**
 * data-updater.ts  v3.0
 *
 * Weekly data refresh for Origio country data.
 * Run: npm run update-data  →  tsx src/lib/data-updater.ts
 *
 * ┌────────────────────────────────────────────────────────────────────┐
 * │  Source              → logical section   → country_data columns    │
 * ├──────────────────────┬──────────────────────────────────────────── │
 * │  World Bank API      │  salary_data      (GNI × role multipliers)  │
 * │  UN UNDP HDR API     │  HDI validation   (0–1, logged only)        │
 * │  Wikipedia HTML      │  HDI + GDP fallback (when WB/UNDP fail)     │
 * │  Numbeo HTML         │  cost_of_living, safety_data, quality_of_life│
 * │  Static table        │  visa_routes      (visa_difficulty 1–10)    │
 * └──────────────────────┴──────────────────────────────────────────── ┘
 *
 * DB target: country_data (single wide table — all sections merged here)
 *
 * Validation — invalid data is SKIPPED, old DB value kept:
 *   salary (USD)       >0 and <500,000
 *   rent (USD)         $200–$5,000
 *   visa_difficulty    1–10 (integer)
 *   safety_index       0–100 (raw Numbeo; stored ÷10 → 0–10 scale)
 *   HDI                0–1   (validated & logged; no column in DB yet)
 *
 * Log file: logs/updates.log
 * Env vars: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 *   If unset, falls back to SQL export mode: computed updates are written as
 *   UPDATE statements to logs/pending-updates.sql for later application by
 *   a runner that does hold DB credentials, instead of failing outright.
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
  currency: string;       // ISO 4217
  wbCode: string;         // World Bank / ISO 3166-1 alpha-3
  numbeoCity: string;     // Numbeo representative city
  visaDifficulty: number; // static reference: 1=very welcoming … 10=very restrictive
  wikiTitle: string;      // Wikipedia article title (underscores for spaces)
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

interface WikipediaResult {
  hdi: number | null;           // from country infobox (UNDP-sourced)
  gdpPerCapitaUSD: number | null; // from country infobox (USD)
}

interface UpdatePayload extends Record<string, unknown> {
  // salary_data — annual local currency (30 roles)
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
  // cost_of_living — monthly local currency
  cost_rent_city_centre?: number;
  cost_rent_outside?: number;
  cost_utilities_monthly?: number;
  cost_transport_monthly?: number;
  cost_eating_out?: number;
  cost_groceries_monthly?: number;
  // safety_data / quality_of_life — 0–10 scale
  score_safety?: number;
  score_crime_rate?: number;
  score_quality_of_life?: number;
  score_healthcare?: number;
  // visa_routes
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
  undpHits: number;
  wikipediaHits: number;
}

// ── Country configuration ─────────────────────────────────────────────────────
// 58 countries — slugs must match countries.slug in DB exactly.

const COUNTRIES: CountryConfig[] = [
  { slug: 'argentina',      currency: 'ARS', wbCode: 'ARG', numbeoCity: 'Buenos Aires',    visaDifficulty: 4, wikiTitle: 'Argentina' },
  { slug: 'australia',      currency: 'AUD', wbCode: 'AUS', numbeoCity: 'Sydney',           visaDifficulty: 6, wikiTitle: 'Australia' },
  { slug: 'austria',        currency: 'EUR', wbCode: 'AUT', numbeoCity: 'Vienna',           visaDifficulty: 5, wikiTitle: 'Austria' },
  { slug: 'belgium',        currency: 'EUR', wbCode: 'BEL', numbeoCity: 'Brussels',         visaDifficulty: 5, wikiTitle: 'Belgium' },
  { slug: 'bulgaria',       currency: 'EUR', wbCode: 'BGR', numbeoCity: 'Sofia',            visaDifficulty: 4, wikiTitle: 'Bulgaria' },
  { slug: 'brazil',         currency: 'BRL', wbCode: 'BRA', numbeoCity: 'Sao Paulo',        visaDifficulty: 4, wikiTitle: 'Brazil' },
  { slug: 'canada',         currency: 'CAD', wbCode: 'CAN', numbeoCity: 'Toronto',          visaDifficulty: 5, wikiTitle: 'Canada' },
  { slug: 'chile',          currency: 'CLP', wbCode: 'CHL', numbeoCity: 'Santiago',         visaDifficulty: 3, wikiTitle: 'Chile' },
  { slug: 'colombia',       currency: 'COP', wbCode: 'COL', numbeoCity: 'Bogota',           visaDifficulty: 3, wikiTitle: 'Colombia' },
  { slug: 'costa-rica',     currency: 'CRC', wbCode: 'CRI', numbeoCity: 'San Jose',         visaDifficulty: 3, wikiTitle: 'Costa_Rica' },
  { slug: 'croatia',        currency: 'EUR', wbCode: 'HRV', numbeoCity: 'Zagreb',           visaDifficulty: 5, wikiTitle: 'Croatia' },
  { slug: 'cyprus',         currency: 'EUR', wbCode: 'CYP', numbeoCity: 'Nicosia',          visaDifficulty: 4, wikiTitle: 'Cyprus' },
  { slug: 'czech-republic', currency: 'CZK', wbCode: 'CZE', numbeoCity: 'Prague',           visaDifficulty: 5, wikiTitle: 'Czech_Republic' },
  { slug: 'denmark',        currency: 'DKK', wbCode: 'DNK', numbeoCity: 'Copenhagen',       visaDifficulty: 6, wikiTitle: 'Denmark' },
  { slug: 'estonia',        currency: 'EUR', wbCode: 'EST', numbeoCity: 'Tallinn',          visaDifficulty: 4, wikiTitle: 'Estonia' },
  { slug: 'finland',        currency: 'EUR', wbCode: 'FIN', numbeoCity: 'Helsinki',         visaDifficulty: 5, wikiTitle: 'Finland' },
  { slug: 'france',         currency: 'EUR', wbCode: 'FRA', numbeoCity: 'Paris',            visaDifficulty: 5, wikiTitle: 'France' },
  { slug: 'georgia',        currency: 'GEL', wbCode: 'GEO', numbeoCity: 'Tbilisi',          visaDifficulty: 2, wikiTitle: 'Georgia_(country)' },
  { slug: 'germany',        currency: 'EUR', wbCode: 'DEU', numbeoCity: 'Berlin',           visaDifficulty: 5, wikiTitle: 'Germany' },
  { slug: 'greece',         currency: 'EUR', wbCode: 'GRC', numbeoCity: 'Athens',           visaDifficulty: 4, wikiTitle: 'Greece' },
  { slug: 'hungary',        currency: 'HUF', wbCode: 'HUN', numbeoCity: 'Budapest',         visaDifficulty: 4, wikiTitle: 'Hungary' },
  { slug: 'iceland',        currency: 'ISK', wbCode: 'ISL', numbeoCity: 'Reykjavik',        visaDifficulty: 5, wikiTitle: 'Iceland' },
  { slug: 'india',          currency: 'INR', wbCode: 'IND', numbeoCity: 'Bangalore',        visaDifficulty: 7, wikiTitle: 'India' },
  { slug: 'indonesia',      currency: 'IDR', wbCode: 'IDN', numbeoCity: 'Jakarta',          visaDifficulty: 5, wikiTitle: 'Indonesia' },
  { slug: 'ireland',        currency: 'EUR', wbCode: 'IRL', numbeoCity: 'Dublin',           visaDifficulty: 5, wikiTitle: 'Republic_of_Ireland' },
  { slug: 'israel',         currency: 'ILS', wbCode: 'ISR', numbeoCity: 'Tel Aviv',         visaDifficulty: 6, wikiTitle: 'Israel' },
  { slug: 'italy',          currency: 'EUR', wbCode: 'ITA', numbeoCity: 'Milan',            visaDifficulty: 4, wikiTitle: 'Italy' },
  { slug: 'japan',          currency: 'JPY', wbCode: 'JPN', numbeoCity: 'Tokyo',            visaDifficulty: 7, wikiTitle: 'Japan' },
  { slug: 'luxembourg',     currency: 'EUR', wbCode: 'LUX', numbeoCity: 'Luxembourg',       visaDifficulty: 5, wikiTitle: 'Luxembourg' },
  { slug: 'malaysia',       currency: 'MYR', wbCode: 'MYS', numbeoCity: 'Kuala Lumpur',     visaDifficulty: 4, wikiTitle: 'Malaysia' },
  { slug: 'malta',          currency: 'EUR', wbCode: 'MLT', numbeoCity: 'Valletta',         visaDifficulty: 4, wikiTitle: 'Malta' },
  { slug: 'mexico',         currency: 'MXN', wbCode: 'MEX', numbeoCity: 'Mexico City',      visaDifficulty: 3, wikiTitle: 'Mexico' },
  { slug: 'netherlands',    currency: 'EUR', wbCode: 'NLD', numbeoCity: 'Amsterdam',        visaDifficulty: 5, wikiTitle: 'Netherlands' },
  { slug: 'new-zealand',    currency: 'NZD', wbCode: 'NZL', numbeoCity: 'Auckland',         visaDifficulty: 6, wikiTitle: 'New_Zealand' },
  { slug: 'norway',         currency: 'NOK', wbCode: 'NOR', numbeoCity: 'Oslo',             visaDifficulty: 6, wikiTitle: 'Norway' },
  { slug: 'panama',         currency: 'USD', wbCode: 'PAN', numbeoCity: 'Panama City',      visaDifficulty: 3, wikiTitle: 'Panama' },
  { slug: 'philippines',    currency: 'PHP', wbCode: 'PHL', numbeoCity: 'Manila',           visaDifficulty: 3, wikiTitle: 'Philippines' },
  { slug: 'poland',         currency: 'PLN', wbCode: 'POL', numbeoCity: 'Warsaw',           visaDifficulty: 5, wikiTitle: 'Poland' },
  { slug: 'portugal',       currency: 'EUR', wbCode: 'PRT', numbeoCity: 'Lisbon',           visaDifficulty: 3, wikiTitle: 'Portugal' },
  { slug: 'qatar',          currency: 'QAR', wbCode: 'QAT', numbeoCity: 'Doha',             visaDifficulty: 8, wikiTitle: 'Qatar' },
  { slug: 'romania',        currency: 'RON', wbCode: 'ROU', numbeoCity: 'Bucharest',        visaDifficulty: 4, wikiTitle: 'Romania' },
  { slug: 'saudi-arabia',   currency: 'SAR', wbCode: 'SAU', numbeoCity: 'Riyadh',           visaDifficulty: 8, wikiTitle: 'Saudi_Arabia' },
  { slug: 'serbia',         currency: 'RSD', wbCode: 'SRB', numbeoCity: 'Belgrade',         visaDifficulty: 3, wikiTitle: 'Serbia' },
  { slug: 'singapore',      currency: 'SGD', wbCode: 'SGP', numbeoCity: 'Singapore',        visaDifficulty: 7, wikiTitle: 'Singapore' },
  { slug: 'slovenia',       currency: 'EUR', wbCode: 'SVN', numbeoCity: 'Ljubljana',        visaDifficulty: 4, wikiTitle: 'Slovenia' },
  { slug: 'south-africa',   currency: 'ZAR', wbCode: 'ZAF', numbeoCity: 'Cape Town',        visaDifficulty: 5, wikiTitle: 'South_Africa' },
  { slug: 'south-korea',    currency: 'KRW', wbCode: 'KOR', numbeoCity: 'Seoul',            visaDifficulty: 6, wikiTitle: 'South_Korea' },
  { slug: 'spain',          currency: 'EUR', wbCode: 'ESP', numbeoCity: 'Madrid',           visaDifficulty: 4, wikiTitle: 'Spain' },
  { slug: 'sweden',         currency: 'SEK', wbCode: 'SWE', numbeoCity: 'Stockholm',        visaDifficulty: 5, wikiTitle: 'Sweden' },
  { slug: 'switzerland',    currency: 'CHF', wbCode: 'CHE', numbeoCity: 'Zurich',           visaDifficulty: 7, wikiTitle: 'Switzerland' },
  { slug: 'thailand',       currency: 'THB', wbCode: 'THA', numbeoCity: 'Bangkok',          visaDifficulty: 4, wikiTitle: 'Thailand' },
  { slug: 'uae',            currency: 'AED', wbCode: 'ARE', numbeoCity: 'Dubai',            visaDifficulty: 5, wikiTitle: 'United_Arab_Emirates' },
  { slug: 'united-kingdom', currency: 'GBP', wbCode: 'GBR', numbeoCity: 'London',           visaDifficulty: 6, wikiTitle: 'United_Kingdom' },
  { slug: 'usa',            currency: 'USD', wbCode: 'USA', numbeoCity: 'New York',         visaDifficulty: 7, wikiTitle: 'United_States' },
  { slug: 'vietnam',        currency: 'VND', wbCode: 'VNM', numbeoCity: 'Ho Chi Minh City', visaDifficulty: 4, wikiTitle: 'Vietnam' },
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
// Annual salary as a multiple of GNI per capita. Based on ILO occupational
// wage premia and cross-country income-share data.

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

// ── Market overrides ─────────────────────────────────────────────────────────
// Country pages use a single representative city/country row. For a few launch-
// critical countries we pin known market values so the weekly refresh does not
// drift materially below current central-market rates.

const COUNTRY_MARKET_OVERRIDES: Record<string, Partial<UpdatePayload>> = {
  australia: {
    cost_rent_city_centre: 3000,
  },
  canada: {
    salary_software_engineer: 120000,
  },
  ireland: {
    cost_rent_city_centre: 2700,
  },
  singapore: {
    cost_rent_city_centre: 3500,
  },
  'united-kingdom': {
    cost_rent_city_centre: 2800,
  },
  usa: {
    cost_rent_city_centre: 3300,
  },
};

// ── HTTP helpers ──────────────────────────────────────────────────────────────

function fetchJson(url: string): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const req = https.get(url, {
      headers: { 'User-Agent': 'origio-data-updater/3.0 (+https://findorigio.com)' },
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

function toNumbeoSlug(city: string): string {
  return city
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/\s+/g, '-');
}

function extractNumber(html: string, pattern: RegExp): number | null {
  const m = html.match(pattern);
  if (!m || !m[1]) return null;
  const v = parseFloat(m[1].replace(/,/g, ''));
  return isNaN(v) ? null : v;
}

function r2(n: number): number {
  return Math.round(n * 100) / 100;
}

// ── World Bank API ────────────────────────────────────────────────────────────
// Indicators:
//   NY.GNP.PCAP.CD    – GNI per capita (Atlas, current USD) — salary proxy
//   PA.NUS.FCRF       – Official exchange rate (LCU per USD)
//   SP.DYN.LE00.IN    – Life expectancy at birth (HDI component)
//   SE.SCH.LIFE       – Expected years of schooling (HDI component)
//   BAR.SCHL.15UP     – Mean years of schooling, pop 15+ (HDI component)
//   NY.GNP.PCAP.PP.CD – GNI per capita PPP (HDI income component)

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

// ── UN UNDP Human Development Report API ─────────────────────────────────────
// Fetches official HDI values published by UNDP.
// Primary: bulk endpoint (all 193 countries in one call).
// Fallback: per-country endpoint if bulk fails or country missing.
// HDI indicator code: 137906.

const UNDP_BASE = 'https://hdrapi.undp.org';

async function fetchUndpHdiBulk(): Promise<Map<string, number>> {
  const map = new Map<string, number>();
  try {
    const url = `${UNDP_BASE}/v5/stats/indicators?indicator=137906`;
    const raw = await fetchJson(url);
    // Handle varied response shapes: top-level array or { data: [...] }
    const rows: unknown[] = Array.isArray(raw)
      ? raw
      : Array.isArray((raw as Record<string, unknown>)?.data)
        ? ((raw as Record<string, unknown>).data as unknown[])
        : Array.isArray((raw as Record<string, unknown>)?.value)
          ? ((raw as Record<string, unknown>).value as unknown[])
          : [];

    for (const row of rows) {
      if (!row || typeof row !== 'object') continue;
      const r = row as Record<string, unknown>;
      const iso3 = String(r.iso3 ?? r.countryCode ?? r.country_code ?? '').toUpperCase();
      const val  = Number(r.value ?? r.hdi ?? r.indicatorValue ?? 0);
      if (iso3.length === 3 && inBounds(val, 'hdi')) {
        // Keep entry with highest year if duplicates present
        const existing = map.get(iso3);
        const yr = Number(r.year ?? r.yearCode ?? 0);
        if (!existing || yr > 0) map.set(iso3, val);
      }
    }
  } catch { /* non-fatal; per-country fallback used in main loop */ }
  return map;
}

async function fetchUndpHdiForCountry(iso3: string): Promise<number | null> {
  try {
    const url = `${UNDP_BASE}/v5/stats/country/${iso3}`;
    const raw = await fetchJson(url) as Record<string, unknown>;
    const indicators: unknown[] = Array.isArray(raw.indicators)
      ? raw.indicators
      : Array.isArray(raw.data)
        ? raw.data
        : [];
    for (const item of indicators) {
      if (!item || typeof item !== 'object') continue;
      const i = item as Record<string, unknown>;
      const id   = Number(i.indicatorId ?? i.indicator_id ?? i.id ?? 0);
      const code = String(i.indicatorCode ?? i.code ?? '').toLowerCase();
      if (id === 137906 || code === 'hdi' || code === '137906') {
        const val = Number(i.value ?? i.hdi ?? i.indicatorValue ?? 0);
        if (inBounds(val, 'hdi')) return r2(val);
      }
    }
  } catch { /* non-fatal */ }
  return null;
}

// ── HDI computation (UN formula, World Bank components) ───────────────────────
// Used when UNDP API and Wikipedia both fail.
// Formula from UNDP Technical Notes (2010 revision).

function computeHdiFromWB(
  le: number,
  eys: number,
  mys: number,
  gniPpp: number,
): number | null {
  try {
    const leIdx  = (le - 20) / (85 - 20);
    const edIdx  = ((eys / 18) + (mys / 15)) / 2;
    const incIdx = (Math.log(gniPpp) - Math.log(100)) / (Math.log(75_000) - Math.log(100));
    if (leIdx <= 0 || edIdx <= 0 || incIdx <= 0) return null;
    const hdi = Math.cbrt(leIdx * edIdx * incIdx);
    return inBounds(hdi, 'hdi') ? r2(hdi) : null;
  } catch {
    return null;
  }
}

// ── Wikipedia country data scraper ───────────────────────────────────────────
// Scrapes the country infobox for:
//   - HDI   (UNDP-sourced data displayed on Wikipedia; pattern: "0.XXX")
//   - GDP per capita in USD (fallback salary proxy when WB GNI unavailable)
// Used only when primary sources (UNDP API / World Bank) fail.

async function fetchWikipediaCountryData(wikiTitle: string): Promise<WikipediaResult> {
  const out: WikipediaResult = { hdi: null, gdpPerCapitaUSD: null };
  try {
    const encoded = wikiTitle.replace(/_/g, ' ');
    const url     = `https://en.wikipedia.org/wiki/${encodeURIComponent(encoded)}`;
    const html    = await fetchHtml(url);

    // HDI from infobox — always a 3-decimal fraction (e.g. 0.942)
    // Pattern: "Human Development Index" ... "0.XXX" within 800 chars
    const hdiM = html.match(
      /[Hh]uman\s+[Dd]evelopment\s+[Ii]ndex[\s\S]{0,800}?\b(0\.\d{3})\b/
    );
    if (hdiM) {
      const v = parseFloat(hdiM[1]);
      if (inBounds(v, 'hdi')) out.hdi = r2(v);
    }

    // GDP per capita from infobox: look for "per capita" near "US$X,XXX" or "$X,XXX"
    const gdpM = html.match(
      /[Gg][Dd][Pp][\s\S]{0,150}[Pp]er\s+[Cc]apita[\s\S]{0,400}?(?:US\$|\$|USD\s?)([\d]{1,3}(?:,\d{3})+|\d{4,6})/
    );
    if (gdpM) {
      const v = parseFloat(gdpM[1].replace(/,/g, ''));
      if (v > 500 && inBounds(v, 'salaryUSD')) out.gdpPerCapitaUSD = v;
    }
  } catch { /* non-fatal; keep nulls */ }
  return out;
}

// ── Numbeo cost-of-living scraper ─────────────────────────────────────────────
// Source: cost_of_living — columns: cost_rent_*, cost_utilities_monthly,
//   cost_transport_monthly, cost_eating_out, cost_groceries_monthly

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

  function scrape(itemRe: RegExp): number | null {
    const base = html.match(itemRe);
    if (!base) return null;
    const offset = base.index! + base[0].length;
    const chunk  = html.slice(offset, offset + 600);
    const spanM  = chunk.match(/<span>([\d,]+(?:\.\d+)?)<\/span>/);
    if (spanM) return parseFloat(spanM[1].replace(/,/g, ''));
    const dolM  = chunk.match(/(?:\$|＄)\s*([\d,]+(?:\.\d+)?)/);
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

  // Grocery basket: scrape individual items, multiply by monthly quantities
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
  if (groceryItems.filter(v => v !== null && v > 0).length >= 5) {
    const basket =
      (milk    ?? 0) * 4  +
      (bread   ?? 0) * 8  +
      (rice    ?? 0) * 2  +
      (eggs    ?? 0) * 2  +
      (chicken ?? 0) * 2  +
      (beef    ?? 0) * 1  +
      (apples  ?? 0) * 2  +
      (tomato  ?? 0) * 2  +
      (potato  ?? 0) * 2;
    if (inBounds(basket, 'groceriesUSD')) out.groceriesUSD = r2(basket);
  }

  return out;
}

// ── Numbeo quality-of-life scraper ────────────────────────────────────────────
// Source: safety_data + quality_of_life — columns: score_safety, score_crime_rate,
//   score_quality_of_life, score_healthcare

async function fetchNumbeoQolData(country: CountryConfig): Promise<NumbeoQolResult> {
  const citySlug = toNumbeoSlug(country.numbeoCity);
  const out: NumbeoQolResult = {
    qualityOfLifeIndex: null, safetyIndex: null, crimeIndex: null, healthcareIndex: null,
  };

  async function parseScores(html: string): Promise<void> {
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
  } catch { /* try fallback */ }

  if (out.safetyIndex === null || out.crimeIndex === null) {
    try {
      const crimeHtml = await fetchHtml(`https://www.numbeo.com/crime/in/${citySlug}/`);
      const s2 = extractNumber(crimeHtml, /Safety\s*Index\s*:?\s*[\s\S]{0,200}?(\d{1,3}(?:\.\d+)?)/i);
      const c2 = extractNumber(crimeHtml, /Crime\s*Index\s*:?\s*[\s\S]{0,200}?(\d{1,3}(?:\.\d+)?)/i);
      if (out.safetyIndex === null && s2 !== null && inBounds(s2, 'safetyIndex')) out.safetyIndex = s2;
      if (out.crimeIndex  === null && c2 !== null && inBounds(c2, 'crimeIndex'))  out.crimeIndex  = c2;
    } catch { /* keep nulls */ }
  }

  return out;
}

// ── Salary computation ────────────────────────────────────────────────────────

function computeSalaries(
  gniPerCapitaUSD: number,
  exchangeRate: number | null,
  usdCurrency: boolean,
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

// eslint-disable-next-line
type AnySupabaseClient = any;

async function getCountryId(supabase: AnySupabaseClient, slug: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('countries')
    .select('id')
    .eq('slug', slug)
    .maybeSingle();
  if (error || !data) return null;
  return (data as { id: string }).id;
}

// ── SQL export fallback ────────────────────────────────────────────────────────
// When SUPABASE_SERVICE_ROLE_KEY isn't available in the running environment
// (e.g. an ephemeral CI/agent sandbox with no persisted secrets), the computed
// updates are written as plain SQL instead of being applied over supabase-js,
// so a session/pipeline holding real DB credentials can apply them afterward.

let SQL_EXPORT_MODE = false;
const SQL_EXPORT_FILE = path.resolve(process.cwd(), 'logs', 'pending-updates.sql');

function sqlValue(v: unknown): string {
  if (v === null || v === undefined) return 'NULL';
  if (typeof v === 'number') return Number.isFinite(v) ? String(v) : 'NULL';
  return `'${String(v).replace(/'/g, "''")}'`;
}

function initSqlExport(): void {
  fs.mkdirSync(path.dirname(SQL_EXPORT_FILE), { recursive: true });
  fs.writeFileSync(
    SQL_EXPORT_FILE,
    `-- Origio country_data updates — generated ${new Date().toISOString()}\n` +
    `-- Apply against the Supabase project (e.g. via the Supabase SQL editor,\n` +
    `-- psql, or the Supabase MCP execute_sql tool) once real credentials are available.\n\n`,
    'utf8',
  );
}

function appendSqlExport(slug: string, payload: UpdatePayload): void {
  const setClause = Object.entries(payload)
    .map(([col, val]) => `${col} = ${sqlValue(val)}`)
    .join(', ');
  const stmt =
    `UPDATE country_data SET ${setClause} ` +
    `WHERE country_id = (SELECT id FROM countries WHERE slug = ${sqlValue(slug)});\n`;
  fs.appendFileSync(SQL_EXPORT_FILE, stmt, 'utf8');
}

async function updateCountryData(
  supabase: AnySupabaseClient,
  slug: string,
  payload: UpdatePayload,
): Promise<void> {
  if (SQL_EXPORT_MODE) {
    appendSqlExport(slug, payload);
    return;
  }
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
  } catch { /* non-fatal in CI environments without a writable log dir */ }
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey  = process.env.SUPABASE_SERVICE_ROLE_KEY;

  let supabase: AnySupabaseClient = null;
  if (!supabaseUrl || !serviceKey) {
    SQL_EXPORT_MODE = true;
    initSqlExport();
    appendLog('WARNING: Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    appendLog(`  Running in SQL export mode — updates will be written to ${SQL_EXPORT_FILE} instead of applied directly.`);
  } else {
    supabase = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false },
    });
  }

  const stats: RunStats = {
    updated: 0, skipped: 0, errors: [],
    worldBankHits: 0, numbeoHits: 0, undpHits: 0, wikipediaHits: 0,
  };
  const runStart = Date.now();

  appendLog(`=== data-updater v3.0 started — ${COUNTRIES.length} countries ===`);
  appendLog('Sources: World Bank (salary), UNDP HDR (HDI), Wikipedia (fallback), Numbeo (costs/scores), static (visa)');

  // ── Pre-fetch UNDP HDI for all countries (one HTTP call) ─────────────────
  appendLog('\nFetching UNDP HDI bulk data...');
  const undpHdiMap = await fetchUndpHdiBulk();
  appendLog(`  UNDP HDI: ${undpHdiMap.size} countries loaded`);

  // ── Process each country ─────────────────────────────────────────────────
  for (const country of COUNTRIES) {
    appendLog(`\nProcessing ${country.slug} (${country.wbCode}, ${country.currency})...`);

    try {
      // Fetch all four sources in parallel per country
      const [wbData, costData, qolData, wikiData] = await Promise.all([
        fetchWorldBankData(country),
        fetchNumbeoCostData(country),
        fetchNumbeoQolData(country),
        fetchWikipediaCountryData(country.wikiTitle),
      ]);

      const now   = new Date();
      const today = now.toISOString().slice(0, 10);
      const payload: UpdatePayload = { last_verified: today, updated_at: now.toISOString() };
      const sourceNotes: string[] = [];
      const usdCurrency = country.currency === 'USD';

      // ── salary_data: World Bank GNI × role multipliers ─────────────────
      // Fallback: Wikipedia GDP per capita when WB GNI unavailable.
      let gniForSalary = wbData.gniPerCapitaUSD;
      let salarySource = 'World Bank GNI';
      if (gniForSalary === null && wikiData.gdpPerCapitaUSD !== null) {
        gniForSalary = wikiData.gdpPerCapitaUSD;
        salarySource = 'Wikipedia GDP/capita (fallback)';
        stats.wikipediaHits++;
        appendLog(`  salary: WB GNI unavailable — using Wikipedia GDP/capita $${wikiData.gdpPerCapitaUSD.toLocaleString()}`);
      }

      if (gniForSalary !== null) {
        const salaries = computeSalaries(gniForSalary, wbData.exchangeRate, usdCurrency);
        const count    = Object.keys(salaries).length;
        if (count > 0) {
          Object.assign(payload, salaries);
          stats.worldBankHits++;
          sourceNotes.push(
            `salary[${count} roles, gni=$${Math.round(gniForSalary).toLocaleString()}, ` +
            `src=${salarySource}, ` +
            `rate=${wbData.exchangeRate !== null ? wbData.exchangeRate.toFixed(3) : 'USD'}]`,
          );
        }
      } else {
        appendLog(`  salary: no GNI/GDP data from any source — keeping existing`);
        stats.skipped++;
      }

      // ── HDI validation: UNDP API → WB computed → Wikipedia ────────────
      // HDI 0–1 required; no DB column exists — logged only.
      let hdi: number | null = undpHdiMap.get(country.wbCode) ?? null;
      let hdiSource = hdi !== null ? 'UNDP HDR API (bulk)' : null;

      // Per-country UNDP fallback if missing from bulk
      if (hdi === null) {
        hdi = await fetchUndpHdiForCountry(country.wbCode);
        if (hdi !== null) {
          hdiSource = 'UNDP HDR API (per-country)';
          stats.undpHits++;
        }
      }

      // WB components fallback
      if (
        hdi === null &&
        wbData.lifeExpectancy         !== null &&
        wbData.expectedSchoolingYears !== null &&
        wbData.meanSchoolingYears     !== null &&
        wbData.gniPppUSD              !== null
      ) {
        hdi = computeHdiFromWB(
          wbData.lifeExpectancy,
          wbData.expectedSchoolingYears,
          wbData.meanSchoolingYears,
          wbData.gniPppUSD,
        );
        if (hdi !== null) hdiSource = 'World Bank (computed)';
      }

      // Wikipedia tertiary fallback
      if (hdi === null && wikiData.hdi !== null) {
        hdi = wikiData.hdi;
        hdiSource = 'Wikipedia (infobox)';
        stats.wikipediaHits++;
      }

      if (hdi !== null && hdiSource !== null) {
        appendLog(
          `  HDI=${hdi} [0–1 ✓] source=${hdiSource}` +
          (wbData.lifeExpectancy !== null ? ` le=${wbData.lifeExpectancy.toFixed(1)}` : ''),
        );
      } else {
        appendLog(`  HDI: no valid data from any source`);
      }

      // ── cost_of_living: Numbeo → local currency via WB exchange rate ──
      const exRate  = wbData.exchangeRate;
      const toLocal = (usd: number): number =>
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

      // ── safety_data + quality_of_life: Numbeo scores → 0–10 scale ─────
      // Raw safety/crime/healthcare 0–100 stored as ÷10.
      // Raw QoL 0–250 stored as ÷20, capped at 10.
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

      // ── launch-critical country overrides ─────────────────────────────
      const marketOverrides = COUNTRY_MARKET_OVERRIDES[country.slug];
      if (marketOverrides) {
        Object.assign(payload, marketOverrides);
        sourceNotes.push(`market_override=${Object.keys(marketOverrides).join(',')}`);
      }

      // ── visa_routes: static reference, validated ───────────────────────
      if (inBounds(country.visaDifficulty, 'visaDifficulty')) {
        payload.visa_difficulty = country.visaDifficulty;
        sourceNotes.push(`visa_difficulty=${country.visaDifficulty}[static]`);
      }

      // ── Write to DB if any substantive field is populated ──────────────
      const substantiveKeys = Object.keys(payload).filter(
        k => k !== 'last_verified' && k !== 'updated_at',
      );
      if (substantiveKeys.length > 0) {
        await updateCountryData(supabase, country.slug, payload);
        const verb = SQL_EXPORT_MODE ? 'queued (SQL export, not yet applied)' : 'updated';
        appendLog(`  ✓ ${verb} ${substantiveKeys.length} fields — ${sourceNotes.join(' | ')}`);
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
  appendLog(`Elapsed:       ${elapsed}s`);
  appendLog(`Countries:     ${COUNTRIES.length} total`);
  appendLog(`${SQL_EXPORT_MODE ? 'Queued:       ' : 'Updated:      '} ${stats.updated} rows`);
  appendLog(`Skipped:       ${stats.skipped} (no data)`);
  appendLog(`Errors:        ${stats.errors.length}`);
  appendLog(`World Bank:    ${stats.worldBankHits} salary datasets`);
  appendLog(`UNDP HDR:      ${undpHdiMap.size} HDI values preloaded + ${stats.undpHits} per-country`);
  appendLog(`Numbeo:        ${stats.numbeoHits} cost/score datasets`);
  appendLog(`Wikipedia:     ${stats.wikipediaHits} fallback uses`);
  appendLog(`Visa table:    static (${COUNTRIES.length} entries)`);
  if (SQL_EXPORT_MODE) {
    appendLog(`SQL export:    ${stats.updated} statements written to ${SQL_EXPORT_FILE} (not yet applied to DB)`);
  }
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
