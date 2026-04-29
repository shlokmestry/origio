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

function toSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
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
    console.error('API error response:', JSON.stringify(data));
    throw new Error(`Claude API error: ${data.error?.message ?? res.status}`);
  }

  if (!data.content || !data.content[0]) {
    console.error('Unexpected response shape:', JSON.stringify(data));
    throw new Error('No content in Claude response');
  }

  console.log('Stop reason:', data.stop_reason);
  console.log('Input tokens:', data.usage?.input_tokens);
  console.log('Output tokens:', data.usage?.output_tokens);

  const text = data.content[0].text;
  console.log('Raw response (first 200 chars):', text.substring(0, 200));

  // Strip any accidental backticks or markdown fences
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

  // Validate required fields
  if (!parsed.slug || !parsed.title || !parsed.description || !parsed.content_md) {
    console.error('Missing fields in parsed response:', Object.keys(parsed));
    throw new Error('Response missing required fields');
  }

  return parsed;
}

async function publishToSupabase(post, category) {
  console.log('Inserting to Supabase:', post.slug);

  const res = await fetch(`${process.env.SUPABASE_URL}/rest/v1/blog_posts`, {
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

  const body = await res.json();
  console.log('Supabase response:', JSON.stringify(body));

  if (!res.ok) {
    // 23505 = unique violation (slug already exists) — skip gracefully
    if (body?.code === '23505') {
      console.log('Slug already exists, skipping:', post.slug);
      return;
    }
    throw new Error(`Supabase insert failed: ${JSON.stringify(body)}`);
  }

  console.log('Inserted successfully:', body[0]?.slug);
}

async function main() {
  console.log('Script started');
  console.log('SUPABASE_URL set:', !!process.env.SUPABASE_URL);
  console.log('ANTHROPIC_API_KEY set:', !!process.env.ANTHROPIC_API_KEY);
  console.log('SUPABASE_SERVICE_KEY set:', !!process.env.SUPABASE_SERVICE_KEY);

  const topic = await getNextTopic();
  console.log('Topic selected:', topic.title);
  console.log('Category:', topic.category);

  const post = await generatePost(topic);
  console.log('Post generated:', post.slug);
  console.log('Title:', post.title);
  console.log('Content length:', post.content_md.length, 'chars');

  await publishToSupabase(post, topic.category);
  console.log('Done ✓');
}

main().catch(e => {
  console.error('Fatal error:', e.message);
  process.exit(1);
});