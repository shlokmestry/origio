/**
 * data-updater.ts
 *
 * Fetches fresh country data from the World Bank API and Numbeo, validates it,
 * converts salaries/costs to local currency, then upserts into the
 * `country_data` Supabase table.
 *
 * Run with: tsx src/lib/data-updater.ts
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

// Load .env.local if present (for local development)
config({ path: path.resolve(process.cwd(), '.env.local') });
config({ path: path.resolve(process.cwd(), '.env') });

// ── Types ────────────────────────────────────────────────────────────────────

interface CountryConfig {
  slug: string;
  currency: string;
  /** World Bank 3-letter country code */
  wbCode: string;
  /** Numbeo city name for scraping */
  numbeoCity: string;
}

interface WorldBankValue {
  value: number | null;
}

interface UpdatePayload {
  slug: string;
  salaryUSD: number | null;
  rentUSD: number | null;
  safetyScore: number | null;   // 0–10 scale
  exchangeRate: number | null;  // 1 USD = X local currency
  lifeExpectancy: number | null;
  schoolingYears: number | null;
  gniPppUSD: number | null;
}

interface RunStats {
  updated: number;
  skipped: number;
  errors: string[];
}

// ── Country configuration ────────────────────────────────────────────────────
// 37 countries tracked in the system, ordered alphabetically by slug

const COUNTRIES: CountryConfig[] = [
  { slug: 'argentina',      currency: 'ARS', wbCode: 'ARG', numbeoCity: 'Buenos Aires'      },
  { slug: 'australia',      currency: 'AUD', wbCode: 'AUS', numbeoCity: 'Sydney'             },
  { slug: 'austria',        currency: 'EUR', wbCode: 'AUT', numbeoCity: 'Vienna'             },
  { slug: 'belgium',        currency: 'EUR', wbCode: 'BEL', numbeoCity: 'Brussels'           },
  { slug: 'brazil',         currency: 'BRL', wbCode: 'BRA', numbeoCity: 'São Paulo'          },
  { slug: 'canada',         currency: 'CAD', wbCode: 'CAN', numbeoCity: 'Toronto'            },
  { slug: 'chile',          currency: 'CLP', wbCode: 'CHL', numbeoCity: 'Santiago'           },
  { slug: 'colombia',       currency: 'COP', wbCode: 'COL', numbeoCity: 'Bogotá'             },
  { slug: 'costa-rica',     currency: 'CRC', wbCode: 'CRI', numbeoCity: 'San José'           },
  { slug: 'croatia',        currency: 'EUR', wbCode: 'HRV', numbeoCity: 'Zagreb'             },
  { slug: 'czech-republic', currency: 'CZK', wbCode: 'CZE', numbeoCity: 'Prague'             },
  { slug: 'denmark',        currency: 'DKK', wbCode: 'DNK', numbeoCity: 'Copenhagen'         },
  { slug: 'finland',        currency: 'EUR', wbCode: 'FIN', numbeoCity: 'Helsinki'           },
  { slug: 'france',         currency: 'EUR', wbCode: 'FRA', numbeoCity: 'Paris'              },
  { slug: 'georgia',        currency: 'GEL', wbCode: 'GEO', numbeoCity: 'Tbilisi'            },
  { slug: 'germany',        currency: 'EUR', wbCode: 'DEU', numbeoCity: 'Berlin'             },
  { slug: 'greece',         currency: 'EUR', wbCode: 'GRC', numbeoCity: 'Athens'             },
  { slug: 'india',          currency: 'INR', wbCode: 'IND', numbeoCity: 'Bangalore'          },
  { slug: 'indonesia',      currency: 'IDR', wbCode: 'IDN', numbeoCity: 'Jakarta'            },
  { slug: 'ireland',        currency: 'EUR', wbCode: 'IRL', numbeoCity: 'Dublin'             },
  { slug: 'italy',          currency: 'EUR', wbCode: 'ITA', numbeoCity: 'Milan'              },
  { slug: 'japan',          currency: 'JPY', wbCode: 'JPN', numbeoCity: 'Tokyo'              },
  { slug: 'malaysia',       currency: 'MYR', wbCode: 'MYS', numbeoCity: 'Kuala Lumpur'       },
  { slug: 'mexico',         currency: 'MXN', wbCode: 'MEX', numbeoCity: 'Mexico City'        },
  { slug: 'netherlands',    currency: 'EUR', wbCode: 'NLD', numbeoCity: 'Amsterdam'          },
  { slug: 'new-zealand',    currency: 'NZD', wbCode: 'NZL', numbeoCity: 'Auckland'           },
  { slug: 'norway',         currency: 'NOK', wbCode: 'NOR', numbeoCity: 'Oslo'               },
  { slug: 'panama',         currency: 'USD', wbCode: 'PAN', numbeoCity: 'Panama City'        },
  { slug: 'philippines',    currency: 'PHP', wbCode: 'PHL', numbeoCity: 'Manila'             },
  { slug: 'poland',         currency: 'PLN', wbCode: 'POL', numbeoCity: 'Warsaw'             },
  { slug: 'portugal',       currency: 'EUR', wbCode: 'PRT', numbeoCity: 'Lisbon'             },
  { slug: 'singapore',      currency: 'SGD', wbCode: 'SGP', numbeoCity: 'Singapore'          },
  { slug: 'south-korea',    currency: 'KRW', wbCode: 'KOR', numbeoCity: 'Seoul'              },
  { slug: 'spain',          currency: 'EUR', wbCode: 'ESP', numbeoCity: 'Madrid'             },
  { slug: 'sweden',         currency: 'SEK', wbCode: 'SWE', numbeoCity: 'Stockholm'          },
  { slug: 'switzerland',    currency: 'CHF', wbCode: 'CHE', numbeoCity: 'Zurich'             },
  { slug: 'thailand',       currency: 'THB', wbCode: 'THA', numbeoCity: 'Bangkok'            },
  { slug: 'uae',            currency: 'AED', wbCode: 'ARE', numbeoCity: 'Dubai'              },
  { slug: 'united-kingdom', currency: 'GBP', wbCode: 'GBR', numbeoCity: 'London'             },
  { slug: 'united-states',  currency: 'USD', wbCode: 'USA', numbeoCity: 'New York'           },
  { slug: 'vietnam',        currency: 'VND', wbCode: 'VNM', numbeoCity: 'Ho Chi Minh City'   },
];

// ── Validation bounds ────────────────────────────────────────────────────────

const BOUNDS = {
  salaryUSD:     { min: 0,   max: 500_000 },
  rentUSD:       { min: 200, max: 5_000   },
  safetyScore:   { min: 0,   max: 100     }, // raw Numbeo 0–100 before dividing
  exchangeRate:  { min: 0,   max: 100_000 },
  lifeExpectancy:{ min: 40,  max: 100     },
  schoolingYears:{ min: 0,   max: 25      },
  gniPppUSD:     { min: 0,   max: 200_000 },
};

function inBounds(value: number, key: keyof typeof BOUNDS): boolean {
  return value >= BOUNDS[key].min && value <= BOUNDS[key].max;
}

// ── HTTP helpers ─────────────────────────────────────────────────────────────

function fetchJson(url: string): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const req = https.get(url, {
      headers: { 'User-Agent': 'origio-data-updater/1.0 (+https://origio.app)' },
    }, (res) => {
      let data = '';
      res.on('data', (chunk: Buffer) => { data += chunk.toString(); });
      res.on('end', () => {
        if (res.statusCode && res.statusCode >= 400) {
          reject(new Error(`HTTP ${res.statusCode} for ${url}`));
          return;
        }
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(new Error(`JSON parse error for ${url}: ${String(e)}`)); }
      });
    });
    req.on('error', reject);
    req.setTimeout(15_000, () => { req.destroy(new Error(`Timeout fetching ${url}`)); });
  });
}

function fetchHtml(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const req = https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; origio-bot/1.0)',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'en-US,en;q=0.9',
      },
    }, (res) => {
      // Follow redirects (up to 5)
      if (res.statusCode && [301, 302, 303, 307, 308].includes(res.statusCode) && res.headers.location) {
        fetchHtml(res.headers.location).then(resolve).catch(reject);
        return;
      }
      let data = '';
      res.on('data', (chunk: Buffer) => { data += chunk.toString(); });
      res.on('end', () => {
        if (res.statusCode && res.statusCode >= 400) {
          reject(new Error(`HTTP ${res.statusCode} for ${url}`));
          return;
        }
        resolve(data);
      });
    });
    req.on('error', reject);
    req.setTimeout(20_000, () => { req.destroy(new Error(`Timeout fetching ${url}`)); });
  });
}

// ── World Bank API ────────────────────────────────────────────────────────────

const WB_BASE = 'https://api.worldbank.org/v2/country';
const WB_YEAR_RANGE = 'MRV=5'; // most recent 5 data points — pick first non-null

async function fetchWorldBankIndicator(
  countryCode: string,
  indicator: string
): Promise<number | null> {
  const url = `${WB_BASE}/${countryCode}/indicator/${indicator}?format=json&${WB_YEAR_RANGE}`;
  try {
    const raw = await fetchJson(url) as [unknown, WorldBankValue[]];
    const values = raw[1] ?? [];
    for (const entry of values) {
      if (entry.value !== null && entry.value !== undefined) {
        return entry.value;
      }
    }
    return null;
  } catch {
    return null;
  }
}

// Indicators:
//   NY.GNP.PCAP.CD    — GNI per capita (Atlas method, current USD) ≈ annual salary proxy
//   PA.NUS.FCRF       — Official exchange rate (LCU per USD)
//   SP.DYN.LE00.IN    — Life expectancy at birth
//   SE.SCH.LIFE       — Expected years of schooling
//   NY.GNP.PCAP.PP.CD — GNI per capita PPP (current international $)

async function fetchWorldBankData(country: CountryConfig): Promise<{
  salaryUSD: number | null;
  exchangeRate: number | null;
  lifeExpectancy: number | null;
  schoolingYears: number | null;
  gniPppUSD: number | null;
}> {
  const [salaryUSD, exchangeRate, lifeExpectancy, schoolingYears, gniPppUSD] = await Promise.all([
    fetchWorldBankIndicator(country.wbCode, 'NY.GNP.PCAP.CD'),
    fetchWorldBankIndicator(country.wbCode, 'PA.NUS.FCRF'),
    fetchWorldBankIndicator(country.wbCode, 'SP.DYN.LE00.IN'),
    fetchWorldBankIndicator(country.wbCode, 'SE.SCH.LIFE'),
    fetchWorldBankIndicator(country.wbCode, 'NY.GNP.PCAP.PP.CD'),
  ]);

  return {
    salaryUSD:      salaryUSD      !== null && inBounds(salaryUSD, 'salaryUSD')           ? salaryUSD      : null,
    exchangeRate:   exchangeRate   !== null && inBounds(exchangeRate, 'exchangeRate')      ? exchangeRate   : null,
    lifeExpectancy: lifeExpectancy !== null && inBounds(lifeExpectancy, 'lifeExpectancy')  ? lifeExpectancy : null,
    schoolingYears: schoolingYears !== null && inBounds(schoolingYears, 'schoolingYears')  ? schoolingYears : null,
    gniPppUSD:      gniPppUSD      !== null && inBounds(gniPppUSD, 'gniPppUSD')            ? gniPppUSD      : null,
  };
}

// ── Numbeo scraper ────────────────────────────────────────────────────────────

/**
 * Scrape Numbeo cost-of-living and safety pages for a city.
 * Returns values in USD (Numbeo shows USD by default).
 */
async function fetchNumbeoData(country: CountryConfig): Promise<{
  rentUSD: number | null;
  safetyRaw: number | null; // 0–100
}> {
  const cityEncoded = encodeURIComponent(country.numbeoCity);

  // ── Rent (cost of living page) ───────────────────────────────────
  let rentUSD: number | null = null;
  try {
    const costUrl = `https://www.numbeo.com/cost-of-living/in/${cityEncoded.replace(/%20/g, '-')}?displayCurrency=USD`;
    const html = await fetchHtml(costUrl);

    // Numbeo table row: "Apartment (1 bedroom) in City Centre"
    // The value cell contains something like "1,234.56"
    const rentMatch = html.match(
      /Apartment\s*\(1\s*bedroom\)\s*in\s*City\s+Centre[\s\S]{0,300}?[\$＄]\s*([\d,]+(?:\.\d+)?)/i
    );
    if (rentMatch) {
      const val = parseFloat(rentMatch[1].replace(/,/g, ''));
      if (!isNaN(val) && inBounds(val, 'rentUSD')) {
        rentUSD = val;
      }
    }
  } catch {
    // Silently fall through — will keep existing DB value
  }

  // ── Safety index ─────────────────────────────────────────────────
  let safetyRaw: number | null = null;
  try {
    const safetyUrl = `https://www.numbeo.com/crime/in/${cityEncoded.replace(/%20/g, '-')}/`;
    const html = await fetchHtml(safetyUrl);

    // Numbeo safety page: "Safety Index: 67.53"
    const safetyMatch = html.match(/Safety\s+Index[\s\S]{0,200}?(\d{1,3}(?:\.\d+)?)/i);
    if (safetyMatch) {
      const val = parseFloat(safetyMatch[1]);
      if (!isNaN(val) && inBounds(val, 'safetyScore')) {
        safetyRaw = val;
      }
    }
  } catch {
    // Silently fall through
  }

  return { rentUSD, safetyRaw };
}

// ── Supabase upsert ───────────────────────────────────────────────────────────

interface SupabaseUpdateFields {
  score_safety?: number;        // 0–10
  cost_rent_city_centre?: number; // local currency
  last_verified: string;
}

async function upsertCountryData(
  supabase: ReturnType<typeof createClient>,
  slug: string,
  fields: SupabaseUpdateFields
): Promise<void> {
  // First find the country id
  const { data: country, error: countryErr } = await supabase
    .from('countries')
    .select('id')
    .eq('slug', slug)
    .single();

  if (countryErr || !country) {
    throw new Error(`Country not found for slug "${slug}": ${countryErr?.message ?? 'no row'}`);
  }

  const { error } = await supabase
    .from('country_data')
    .update(fields)
    .eq('country_id', country.id);

  if (error) {
    throw new Error(`Upsert failed for "${slug}": ${error.message}`);
  }
}

// ── Logging ───────────────────────────────────────────────────────────────────

const LOG_FILE = path.resolve(process.cwd(), 'logs', 'updates.log');

function appendLog(message: string): void {
  const timestamp = new Date().toISOString();
  const line = `[${timestamp}] ${message}\n`;
  process.stdout.write(line);
  try {
    fs.mkdirSync(path.dirname(LOG_FILE), { recursive: true });
    fs.appendFileSync(LOG_FILE, line, 'utf8');
  } catch {
    // Non-fatal — logs directory might not be writable in some CI envs
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    appendLog('ERROR: Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars.');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });

  const stats: RunStats = { updated: 0, skipped: 0, errors: [] };
  const runStart = Date.now();

  appendLog(`=== data-updater run started — ${COUNTRIES.length} countries ===`);

  for (const country of COUNTRIES) {
    appendLog(`Processing ${country.slug} (${country.wbCode})...`);

    try {
      // ── Fetch data in parallel ──────────────────────────────────
      const [wbData, numbeoData] = await Promise.all([
        fetchWorldBankData(country),
        fetchNumbeoData(country),
      ]);

      const fields: SupabaseUpdateFields = {
        last_verified: new Date().toISOString().slice(0, 10),
      };

      // ── Safety score (0–10): divide Numbeo 0–100 by 10 ─────────
      if (numbeoData.safetyRaw !== null) {
        fields.score_safety = Math.round((numbeoData.safetyRaw / 10) * 100) / 100;
        appendLog(`  safety_raw=${numbeoData.safetyRaw} → score_safety=${fields.score_safety}`);
      } else {
        appendLog(`  safety: no valid data — keeping existing`);
        stats.skipped++;
      }

      // ── Rent: convert USD → local currency ─────────────────────
      if (numbeoData.rentUSD !== null) {
        // Use World Bank exchange rate if available, otherwise leave in USD (for USD countries)
        const exRate = wbData.exchangeRate; // LCU per USD
        const rentLocal = exRate !== null && exRate > 0
          ? Math.round(numbeoData.rentUSD * exRate)
          : numbeoData.rentUSD; // Panama/USD countries — keep as-is
        fields.cost_rent_city_centre = rentLocal;
        appendLog(`  rent_usd=${numbeoData.rentUSD}, exRate=${exRate ?? 'N/A'} → cost_rent_city_centre=${rentLocal}`);
      } else {
        appendLog(`  rent: no valid data — keeping existing`);
        stats.skipped++;
      }

      // Only upsert if we have at least one new field (besides last_verified)
      const hasNewData = fields.score_safety !== undefined || fields.cost_rent_city_centre !== undefined;
      if (hasNewData) {
        await upsertCountryData(supabase, country.slug, fields);
        appendLog(`  ✓ updated ${country.slug}`);
        stats.updated++;
      } else {
        appendLog(`  – no new data for ${country.slug}, skipping DB write`);
        stats.skipped++;
      }

    } catch (err) {
      const msg = `ERROR processing ${country.slug}: ${String(err)}`;
      appendLog(`  ${msg}`);
      stats.errors.push(msg);
    }
  }

  const elapsed = ((Date.now() - runStart) / 1000).toFixed(1);
  appendLog(
    `=== run complete in ${elapsed}s — ` +
    `updated=${stats.updated}, skipped=${stats.skipped}, errors=${stats.errors.length} ===`
  );

  if (stats.errors.length > 0) {
    appendLog('Errors:');
    stats.errors.forEach((e) => appendLog(`  ${e}`));
    process.exit(1);
  }
}

main().catch((err) => {
  appendLog(`FATAL: ${String(err)}`);
  process.exit(1);
});
