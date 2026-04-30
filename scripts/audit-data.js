// scripts/audit-data.js
// Runs monthly via GitHub Actions
// Fetches live rent data from Numbeo, compares to Supabase, emails drift report

const SUPABASE_URL = 'https://towrbbimvrsglguprsdk.supabase.co';

// Currency conversion to EUR for comparison
const TO_EUR = {
  EUR: 1, USD: 0.93, GBP: 1.17, AUD: 0.60, CAD: 0.68,
  NZD: 0.56, CHF: 1.04, SGD: 0.68, AED: 0.25,
  NOK: 0.086, SEK: 0.088, DKK: 0.134,
  JPY: 0.0062, INR: 0.011, BRL: 0.18, MYR: 0.20,
};

function toEUR(amount, currency) {
  return amount * (TO_EUR[currency] ?? 1);
}

// Numbeo city names mapped to your country slugs
// These are the Numbeo query names for each country's main city
const NUMBEO_CITIES = [
  { slug: 'australia',      city: 'Sydney',        currency: 'AUD' },
  { slug: 'austria',        city: 'Vienna',        currency: 'EUR' },
  { slug: 'belgium',        city: 'Brussels',      currency: 'EUR' },
  { slug: 'brazil',         city: 'Sao-Paulo',     currency: 'BRL' },
  { slug: 'canada',         city: 'Toronto',       currency: 'CAD' },
  { slug: 'denmark',        city: 'Copenhagen',    currency: 'DKK' },
  { slug: 'finland',        city: 'Helsinki',      currency: 'EUR' },
  { slug: 'france',         city: 'Paris',         currency: 'EUR' },
  { slug: 'germany',        city: 'Berlin',        currency: 'EUR' },
  { slug: 'ireland',        city: 'Dublin',        currency: 'EUR' },
  { slug: 'italy',          city: 'Milan',         currency: 'EUR' },
  { slug: 'japan',          city: 'Tokyo',         currency: 'JPY' },
  { slug: 'malaysia',       city: 'Kuala-Lumpur',  currency: 'MYR' },
  { slug: 'netherlands',    city: 'Amsterdam',     currency: 'EUR' },
  { slug: 'new-zealand',    city: 'Auckland',      currency: 'NZD' },
  { slug: 'norway',         city: 'Oslo',          currency: 'NOK' },
  { slug: 'portugal',       city: 'Lisbon',        currency: 'EUR' },
  { slug: 'singapore',      city: 'Singapore',     currency: 'SGD' },
  { slug: 'spain',          city: 'Madrid',        currency: 'EUR' },
  { slug: 'sweden',         city: 'Stockholm',     currency: 'SEK' },
  { slug: 'switzerland',    city: 'Zurich',        currency: 'CHF' },
  { slug: 'uae',            city: 'Dubai',         currency: 'AED' },
  { slug: 'united-kingdom', city: 'London',        currency: 'GBP' },
  { slug: 'usa',            city: 'New-York',      currency: 'USD' },
];

async function fetchNumbeoRent(city) {
  try {
    // Numbeo item 26 = 1 bedroom city centre rent
    const url = `https://www.numbeo.com/api/city_prices?api_key=free&query=${encodeURIComponent(city)}&currency=EUR`;
    // Note: Numbeo free API is rate-limited. We use their HTML endpoint as fallback.
    // For production, consider a Numbeo API key ($50/mo) or use Expatistan
    const res = await fetch(`https://www.numbeo.com/cost-of-living/city_result.jsp?country=&city=${encodeURIComponent(city)}`, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; OrigioBot/1.0)' }
    });
    if (!res.ok) return null;
    const html = await res.text();

    // Parse item 26 (1BR city centre rent) from Numbeo HTML
    // Look for the rent row in the table
    const match = html.match(/Apartment \(1 bedroom\) in City Centre.*?<\/td>\s*<td[^>]*>([\d,\.]+)/s);
    if (match) {
      const rentEUR = parseFloat(match[1].replace(/,/g, ''));
      return isNaN(rentEUR) ? null : rentEUR;
    }
    return null;
  } catch {
    return null;
  }
}

async function getSupabaseData() {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/country_data?select=country_id,cost_rent_city_centre`, {
    headers: {
      'apikey': process.env.SUPABASE_SERVICE_KEY,
      'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_KEY}`,
    }
  });
  if (!res.ok) throw new Error(`Supabase fetch failed: ${res.status}`);
  return res.json();
}

async function getCountrySlugs() {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/countries?select=id,slug`, {
    headers: {
      'apikey': process.env.SUPABASE_SERVICE_KEY,
      'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_KEY}`,
    }
  });
  if (!res.ok) throw new Error(`Countries fetch failed: ${res.status}`);
  return res.json();
}

async function sendReport(issues, checked, month) {
  const hasIssues = issues.length > 0;

  const issueRows = issues.map(i => `
    <tr style="border-bottom:1px solid #1a1a1a;">
      <td style="padding:12px 16px;font-weight:700;color:#f0f0e8;">${i.country}</td>
      <td style="padding:12px 16px;color:#888880;">${i.stored} EUR/mo</td>
      <td style="padding:12px 16px;color:#888880;">${i.live} EUR/mo</td>
      <td style="padding:12px 16px;font-weight:700;color:${i.drift > 0 ? '#ef4444' : '#4ade80'};">
        ${i.drift > 0 ? '+' : ''}${i.drift}%
      </td>
      <td style="padding:12px 16px;color:#facc15;font-size:11px;">${i.action}</td>
    </tr>
  `).join('');

  const html = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="margin:0;padding:0;background:#0a0a0a;font-family:system-ui,sans-serif;">
      <div style="max-width:700px;margin:0 auto;padding:40px 24px;">

        <div style="margin-bottom:32px;">
          <span style="font-size:11px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:#00ffd5;">Origio · Monthly Data Audit</span>
        </div>

        <h1 style="font-size:24px;font-weight:800;color:#f0f0e8;margin:0 0 8px;text-transform:uppercase;">
          ${hasIssues ? '⚠️ Data Drift Detected' : '✅ All Data Looks Good'}
        </h1>
        <p style="font-size:13px;color:#888880;margin:0 0 32px;">
          ${month} audit — checked ${checked} countries against Numbeo live data.
          ${hasIssues ? `<strong style="color:#facc15;">${issues.length} countries need attention.</strong>` : 'No significant drift found.'}
        </p>

        ${hasIssues ? `
        <table style="width:100%;border-collapse:collapse;border:1px solid #1a1a1a;margin-bottom:32px;">
          <thead>
            <tr style="background:#111;border-bottom:2px solid #00ffd5;">
              <th style="padding:10px 16px;text-align:left;font-size:10px;letter-spacing:0.15em;text-transform:uppercase;color:#444;">Country</th>
              <th style="padding:10px 16px;text-align:left;font-size:10px;letter-spacing:0.15em;text-transform:uppercase;color:#444;">Stored</th>
              <th style="padding:10px 16px;text-align:left;font-size:10px;letter-spacing:0.15em;text-transform:uppercase;color:#444;">Live (Numbeo)</th>
              <th style="padding:10px 16px;text-align:left;font-size:10px;letter-spacing:0.15em;text-transform:uppercase;color:#444;">Drift</th>
              <th style="padding:10px 16px;text-align:left;font-size:10px;letter-spacing:0.15em;text-transform:uppercase;color:#444;">Action</th>
            </tr>
          </thead>
          <tbody style="background:#0a0a0a;">
            ${issueRows}
          </tbody>
        </table>

        <div style="border-left:2px solid #facc15;padding-left:16px;margin-bottom:32px;">
          <p style="font-size:13px;color:#888880;margin:0;line-height:1.6;">
            To fix: Go to <a href="https://supabase.com/dashboard/project/towrbbimvrsglguprsdk/editor" style="color:#00ffd5;">Supabase SQL editor</a> and update the flagged values.
          </p>
        </div>
        ` : `
        <div style="border:1px solid #1a1a1a;padding:24px;margin-bottom:32px;">
          <p style="font-size:13px;color:#888880;margin:0;line-height:1.6;">
            All ${checked} countries checked. No rent values have drifted more than 15% from Numbeo live data. No action needed.
          </p>
        </div>
        `}

        <p style="font-size:11px;color:#333;margin:48px 0 0;">
          Origio automated audit · Runs 1st of every month<br>
          <a href="https://github.com/shlokmestry/origio/actions" style="color:#333;">View workflow logs</a>
        </p>

      </div>
    </body>
    </html>
  `;

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: 'Origio Audit <hello@findorigio.com>',
      to: 'hello@findorigio.com',
      subject: hasIssues
        ? `⚠️ ${issues.length} countries need data update — Origio ${month}`
        : `✅ Data audit passed — Origio ${month}`,
      html,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Resend failed: ${err}`);
  }
  console.log('Report sent to hello@findorigio.com');
}

async function main() {
  console.log('Starting monthly data audit...');

  const month = new Date().toLocaleString('en-GB', { month: 'long', year: 'numeric' });

  // Get Supabase data
  const [countryData, countries] = await Promise.all([
    getSupabaseData(),
    getCountrySlugs(),
  ]);

  // Build slug → country_data map
  const slugToData = {};
  for (const country of countries) {
    const data = countryData.find(d => d.country_id === country.id);
    if (data) slugToData[country.slug] = data;
  }

  const issues = [];
  let checked = 0;

  for (const entry of NUMBEO_CITIES) {
    const stored = slugToData[entry.slug];
    if (!stored) {
      console.log(`No data found for ${entry.slug}, skipping`);
      continue;
    }

    console.log(`Checking ${entry.city}...`);

    const liveRentEUR = await fetchNumbeoRent(entry.city);

    if (!liveRentEUR) {
      console.log(`Could not fetch live data for ${entry.city}`);
      continue;
    }

    // Convert stored value to EUR for comparison
    const storedRentEUR = toEUR(stored.cost_rent_city_centre, entry.currency);

    const drift = Math.round(((liveRentEUR - storedRentEUR) / storedRentEUR) * 100);
    checked++;

    console.log(`${entry.city}: stored=${storedRentEUR.toFixed(0)} EUR, live=${liveRentEUR.toFixed(0)} EUR, drift=${drift}%`);

    // Flag if drift > 15% in either direction
    if (Math.abs(drift) > 15) {
      const newValue = Math.round(liveRentEUR / TO_EUR[entry.currency]);
      issues.push({
        country: entry.city,
        slug: entry.slug,
        stored: storedRentEUR.toFixed(0),
        live: liveRentEUR.toFixed(0),
        drift,
        action: `Update to ~${newValue} ${entry.currency}`,
      });
    }

    // Rate limit — be polite to Numbeo
    await new Promise(r => setTimeout(r, 2000));
  }

  console.log(`Checked ${checked} countries, found ${issues.length} issues`);

  await sendReport(issues, checked, month);
  console.log('Done');
}

main().catch(e => {
  console.error('Fatal error:', e.message);
  process.exit(1);
});