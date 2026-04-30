// scripts/audit-data.js
// Runs monthly via GitHub Actions
// Uses Claude to verify stored rent/salary values are still accurate
// Costs ~$0.01/month total

const SUPABASE_URL = 'https://towrbbimvrsglguprsdk.supabase.co';

const TO_EUR = {
  EUR: 1, USD: 0.93, GBP: 1.17, AUD: 0.60, CAD: 0.68,
  NZD: 0.56, CHF: 1.04, SGD: 0.68, AED: 0.25,
  NOK: 0.086, SEK: 0.088, DKK: 0.134,
  JPY: 0.0062, INR: 0.011, BRL: 0.18, MYR: 0.20,
};

function toEUR(amount, currency) {
  return Math.round(amount * (TO_EUR[currency] ?? 1));
}

const COUNTRIES = [
  { slug: 'australia',      city: 'Sydney',        currency: 'AUD' },
  { slug: 'austria',        city: 'Vienna',        currency: 'EUR' },
  { slug: 'belgium',        city: 'Brussels',      currency: 'EUR' },
  { slug: 'brazil',         city: 'São Paulo',     currency: 'BRL' },
  { slug: 'canada',         city: 'Toronto',       currency: 'CAD' },
  { slug: 'denmark',        city: 'Copenhagen',    currency: 'DKK' },
  { slug: 'finland',        city: 'Helsinki',      currency: 'EUR' },
  { slug: 'france',         city: 'Paris',         currency: 'EUR' },
  { slug: 'germany',        city: 'Berlin',        currency: 'EUR' },
  { slug: 'ireland',        city: 'Dublin',        currency: 'EUR' },
  { slug: 'italy',          city: 'Milan',         currency: 'EUR' },
  { slug: 'japan',          city: 'Tokyo',         currency: 'JPY' },
  { slug: 'malaysia',       city: 'Kuala Lumpur',  currency: 'MYR' },
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
  { slug: 'usa',            city: 'New York',      currency: 'USD' },
];

async function getSupabaseData() {
  const [dataRes, countriesRes] = await Promise.all([
    fetch(`${SUPABASE_URL}/rest/v1/country_data?select=country_id,cost_rent_city_centre,salary_software_engineer`, {
      headers: {
        'apikey': process.env.SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_KEY}`,
      }
    }),
    fetch(`${SUPABASE_URL}/rest/v1/countries?select=id,slug`, {
      headers: {
        'apikey': process.env.SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_KEY}`,
      }
    }),
  ]);

  if (!dataRes.ok) throw new Error(`Supabase data fetch failed: ${dataRes.status}`);
  if (!countriesRes.ok) throw new Error(`Supabase countries fetch failed: ${countriesRes.status}`);

  const [data, countries] = await Promise.all([dataRes.json(), countriesRes.json()]);

  const slugToData = {};
  for (const country of countries) {
    const d = data.find(x => x.country_id === country.id);
    if (d) slugToData[country.slug] = d;
  }
  return slugToData;
}

async function auditWithClaude(countryList) {
  const dataRows = countryList.map(c =>
    `${c.city} (${c.currency}): rent=${c.storedRent} ${c.currency}/mo (€${c.storedRentEUR}), SWE salary=${c.storedSalary} ${c.currency}/yr`
  ).join('\n');

  const prompt = `You are a relocation data analyst. It is ${new Date().toLocaleString('en-GB', { month: 'long', year: 'numeric' })}.

Below is stored data from a relocation website database. Review each city's 1-bedroom city-centre rent and software engineer salary. Flag any values that are significantly wrong based on your knowledge of current market rates (more than 20% off from realistic values).

STORED DATA:
${dataRows}

Respond ONLY with valid JSON, no markdown:
{
  "flagged": [
    {
      "city": "city name",
      "field": "rent" or "salary",
      "storedValue": number,
      "currency": "currency code",
      "issue": "brief explanation",
      "suggestedValue": number,
      "severity": "high" or "medium"
    }
  ],
  "summary": "one sentence summary of overall data quality"
}

If everything looks reasonable, return {"flagged": [], "summary": "All values look accurate for current market rates."}`;

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!res.ok) throw new Error(`Claude API failed: ${res.status}`);
  const data = await res.json();

  const text = data.content[0].text.trim()
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();

  return JSON.parse(text);
}

async function sendReport(audit, month) {
  const { flagged, summary } = audit;
  const hasIssues = flagged.length > 0;
  const highSeverity = flagged.filter(f => f.severity === 'high');
  const mediumSeverity = flagged.filter(f => f.severity === 'medium');

  const flaggedRows = flagged.map(f => `
    <tr style="border-bottom:1px solid #1a1a1a;">
      <td style="padding:12px 16px;font-weight:700;color:#f0f0e8;">${f.city}</td>
      <td style="padding:12px 16px;color:#888880;text-transform:capitalize;">${f.field}</td>
      <td style="padding:12px 16px;color:#888880;">${f.storedValue.toLocaleString()} ${f.currency}</td>
      <td style="padding:12px 16px;color:#facc15;">${f.suggestedValue.toLocaleString()} ${f.currency}</td>
      <td style="padding:12px 16px;color:#888880;font-size:11px;">${f.issue}</td>
      <td style="padding:12px 16px;">
        <span style="font-size:10px;font-weight:700;padding:2px 8px;background:${f.severity === 'high' ? '#ef444420' : '#facc1520'};color:${f.severity === 'high' ? '#ef4444' : '#facc15'};">
          ${f.severity.toUpperCase()}
        </span>
      </td>
    </tr>
  `).join('');

  const sqlFixes = flagged.map(f =>
    `-- ${f.city} ${f.field}\nUPDATE country_data SET ${f.field === 'rent' ? 'cost_rent_city_centre' : 'salary_software_engineer'} = ${f.suggestedValue}\nWHERE country_id = (SELECT id FROM countries WHERE slug = '${f.city.toLowerCase().replace(/\s+/g, '-')}');`
  ).join('\n\n');

  const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:system-ui,sans-serif;">
<div style="max-width:720px;margin:0 auto;padding:40px 24px;">

  <div style="margin-bottom:32px;">
    <span style="font-size:11px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:#00ffd5;">Origio · Monthly Data Audit · ${month}</span>
  </div>

  <h1 style="font-size:24px;font-weight:800;color:#f0f0e8;margin:0 0 8px;text-transform:uppercase;">
    ${hasIssues ? `⚠️ ${flagged.length} Issue${flagged.length > 1 ? 's' : ''} Found` : '✅ All Data Looks Accurate'}
  </h1>

  <p style="font-size:13px;color:#888880;margin:0 0 32px;line-height:1.6;">
    ${summary}
    ${hasIssues ? `<br><br><strong style="color:#facc15;">${highSeverity.length} high severity, ${mediumSeverity.length} medium severity.</strong>` : ''}
  </p>

  ${hasIssues ? `
  <table style="width:100%;border-collapse:collapse;border:1px solid #1a1a1a;margin-bottom:24px;font-size:12px;">
    <thead>
      <tr style="background:#111;border-bottom:2px solid #00ffd5;">
        <th style="padding:10px 16px;text-align:left;font-size:10px;text-transform:uppercase;color:#444;">City</th>
        <th style="padding:10px 16px;text-align:left;font-size:10px;text-transform:uppercase;color:#444;">Field</th>
        <th style="padding:10px 16px;text-align:left;font-size:10px;text-transform:uppercase;color:#444;">Stored</th>
        <th style="padding:10px 16px;text-align:left;font-size:10px;text-transform:uppercase;color:#444;">Suggested</th>
        <th style="padding:10px 16px;text-align:left;font-size:10px;text-transform:uppercase;color:#444;">Issue</th>
        <th style="padding:10px 16px;text-align:left;font-size:10px;text-transform:uppercase;color:#444;">Severity</th>
      </tr>
    </thead>
    <tbody style="background:#0a0a0a;">${flaggedRows}</tbody>
  </table>

  <div style="border:1px solid #1a1a1a;background:#111;padding:20px;margin-bottom:32px;">
    <p style="font-size:10px;font-weight:700;color:#444;text-transform:uppercase;margin:0 0 12px;">SQL fixes — verify country slugs before running</p>
    <pre style="font-size:11px;color:#888880;margin:0;white-space:pre-wrap;font-family:monospace;">${sqlFixes}</pre>
  </div>

  <a href="https://supabase.com/dashboard/project/towrbbimvrsglguprsdk/editor"
    style="display:inline-block;background:#00ffd5;color:#0a0a0a;font-size:11px;font-weight:800;letter-spacing:0.15em;text-transform:uppercase;padding:12px 24px;text-decoration:none;">
    Open Supabase Editor →
  </a>
  ` : `
  <div style="border:1px solid #1a1a1a;padding:24px;margin-bottom:32px;">
    <p style="font-size:13px;color:#888880;margin:0;line-height:1.6;">
      24 countries reviewed by Claude. No significant data issues detected. No action needed this month.
    </p>
  </div>
  `}

  <p style="font-size:11px;color:#333;margin:48px 0 0;line-height:1.8;">
    Origio automated audit · Runs 1st of every month<br>
    Reviewed by Claude Haiku · ~$0.01/month<br>
    <a href="https://github.com/shlokmestry/origio/actions" style="color:#444;">View workflow logs</a>
  </p>

</div>
</body></html>`;

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
        ? `⚠️ ${flagged.length} data issue${flagged.length > 1 ? 's' : ''} found — Origio ${month}`
        : `✅ Data audit passed — Origio ${month}`,
      html,
    }),
  });

  if (!res.ok) throw new Error(`Resend failed: ${await res.text()}`);
  console.log('Report sent to hello@findorigio.com');
}

async function main() {
  console.log('Starting monthly data audit...');
  console.log('ANTHROPIC_API_KEY set:', !!process.env.ANTHROPIC_API_KEY);
  console.log('SUPABASE_SERVICE_KEY set:', !!process.env.SUPABASE_SERVICE_KEY);
  console.log('RESEND_API_KEY set:', !!process.env.RESEND_API_KEY);

  const month = new Date().toLocaleString('en-GB', { month: 'long', year: 'numeric' });

  console.log('Fetching Supabase data...');
  const slugToData = await getSupabaseData();

  const countryList = COUNTRIES
    .filter(c => slugToData[c.slug])
    .map(c => ({
      ...c,
      storedRent: slugToData[c.slug].cost_rent_city_centre,
      storedRentEUR: toEUR(slugToData[c.slug].cost_rent_city_centre, c.currency),
      storedSalary: slugToData[c.slug].salary_software_engineer,
    }));

  console.log(`Sending ${countryList.length} countries to Claude for review...`);
  const audit = await auditWithClaude(countryList);

  console.log('Claude summary:', audit.summary);
  console.log('Issues found:', audit.flagged.length);
  audit.flagged.forEach(f => console.log(`  - ${f.city} ${f.field}: ${f.issue}`));

  await sendReport(audit, month);
  console.log('Done');
}

main().catch(e => {
  console.error('Fatal error:', e.message);
  process.exit(1);
});