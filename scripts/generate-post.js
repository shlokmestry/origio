const SUPABASE_URL = 'https://towrbbimvrsglguprsdk.supabase.co';

const TOPICS = [
  { title: "Software Engineer Salaries in Netherlands 2026", category: "Salary Guides" },
  { title: "Portugal D8 Digital Nomad Visa: Full Guide 2026", category: "Visa Guides" },
  { title: "Amsterdam vs Lisbon: Cost of Living for Tech Workers", category: "City Comparisons" },
  { title: "Nurse Salaries in Australia vs UK 2026", category: "Salary Guides" },
  { title: "Canada Express Entry for Software Engineers 2026", category: "Visa Guides" },
  { title: "Singapore vs Dubai: Which Pays More After Tax", category: "City Comparisons" },
  { title: "Product Manager Salaries in Switzerland 2026", category: "Salary Guides" },
  { title: "EU Blue Card: Complete Guide for Non-EU Tech Workers 2026", category: "Visa Guides" },
  { title: "Barcelona vs Madrid: Cost of Living for Tech Workers 2026", category: "City Comparisons" },
  { title: "Software Engineer Salaries in Canada 2026", category: "Salary Guides" },
];

async function getNextTopic() {
  const week = Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000));
  return TOPICS[week % TOPICS.length];
}

async function generatePost(topic) {
  console.log('Calling Claude API...');

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 4000,
      messages: [{
        role: 'user',
        content: `You are a financial journalist writing for a data-first relocation publication.

TONE RULES — non-negotiable:
- Write like the FT or Bloomberg, not a blog
- Short sentences. Active voice. No filler.
- Never use: "navigating", "thriving", "bustling", "dynamic", "in today's world", "it's worth noting", "comprehensive"
- No intro fluff. Start with the data immediately.
- No conclusion paragraph that summarises what you just said
- Specific numbers always beat vague claims

Topic: ${topic.title}
Category: ${topic.category}

Requirements:
- Min 800 words
- Use H2 headers (## in markdown)
- Include real salary ranges, tax breakdowns, or visa timelines with specific numbers
- Include a markdown table where relevant
- End with 2-3 relevant internal links from: /best-countries-for/software-engineers, /salary-calculator, /wizard, /country/germany, /country/netherlands, /country/portugal, /country/canada, /country/singapore, /country/usa, /country/australia, /country/spain, /country/switzerland
- Write content_md in Markdown format

Return ONLY a valid JSON object. No backticks, no markdown fences, no extra text before or after. Exactly this shape:
{"slug":"url-slug-here","title":"exact title","description":"one sentence 120-150 chars specific not vague","content_md":"full markdown content here"}`
      }]
    })
  });

  console.log('API status:', res.status);
  const data = await res.json();

  if (!res.ok) {
    console.error('API error:', JSON.stringify(data));
    throw new Error(`Claude API error: ${data.error?.message ?? res.status}`);
  }

  if (!data.content || !data.content[0]) {
    throw new Error('No content in Claude response');
  }

  console.log('Stop reason:', data.stop_reason);
  console.log('Tokens used:', data.usage?.input_tokens, 'in /', data.usage?.output_tokens, 'out');

  const text = data.content[0].text;
  console.log('Raw (first 200):', text.substring(0, 200));

  const clean = text
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();

  let parsed;
  try {
    parsed = JSON.parse(clean);
  } catch (e) {
    console.error('JSON parse failed. Full text:', text);
    throw new Error(`Failed to parse JSON: ${e.message}`);
  }

  if (!parsed.slug || !parsed.title || !parsed.description || !parsed.content_md) {
    throw new Error(`Missing fields: ${Object.keys(parsed).join(', ')}`);
  }

  return parsed;
}

async function publishToSupabase(post, category) {
  const url = `${SUPABASE_URL}/rest/v1/blog_posts`;
  console.log('Posting to:', url);

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': process.env.SUPABASE_SERVICE_KEY,
      'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_KEY}`,
      'Prefer': 'return=representation'
    },
    body: JSON.stringify({
      slug: post.slug,
      title: post.title,
      description: post.description,
      category,
      content_md: post.content_md,
      published: true,
      published_at: new Date().toISOString()
    })
  });

  console.log('Supabase status:', res.status);

  const responseText = await res.text();
  console.log('Supabase raw response:', responseText.substring(0, 500));

  if (!res.ok) {
    let body;
    try { body = JSON.parse(responseText); } catch { body = responseText; }
    if (body?.code === '23505') {
      console.log('Slug already exists, skipping:', post.slug);
      return;
    }
    throw new Error(`Supabase insert failed (${res.status}): ${responseText}`);
  }

  console.log('Inserted successfully');
}

async function main() {
  console.log('Script started');
  console.log('ANTHROPIC_API_KEY set:', !!process.env.ANTHROPIC_API_KEY);
  console.log('SUPABASE_SERVICE_KEY set:', !!process.env.SUPABASE_SERVICE_KEY);
  console.log('SUPABASE_SERVICE_KEY length:', process.env.SUPABASE_SERVICE_KEY?.length);

  const topic = await getNextTopic();
  console.log('Topic:', topic.title);

  const post = await generatePost(topic);
  console.log('Generated:', post.slug, '|', post.content_md.length, 'chars');

  await publishToSupabase(post, topic.category);
  console.log('Done');
}

main().catch(e => {
  console.error('Fatal error:', e.message);
  process.exit(1);
});