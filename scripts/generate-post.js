const SUPABASE_URL = 'https://towrbbimvrsglguprsdk.supabase.co';

const TOPICS = [
  // Salary Guides — Software Engineers
  { title: "Software Engineer Salaries in Netherlands 2026", category: "Salary Guides" },
  { title: "Software Engineer Salaries in Canada 2026", category: "Salary Guides" },
  { title: "Software Engineer Salaries in Switzerland 2026", category: "Salary Guides" },
  { title: "Software Engineer Salaries in Australia 2026", category: "Salary Guides" },
  { title: "Software Engineer Salaries in Singapore 2026", category: "Salary Guides" },
  { title: "Software Engineer Salaries in Sweden 2026", category: "Salary Guides" },
  { title: "Software Engineer Salaries in UAE 2026", category: "Salary Guides" },
  { title: "Software Engineer Salaries in France 2026", category: "Salary Guides" },
  { title: "Software Engineer Salaries in Spain 2026", category: "Salary Guides" },
  { title: "Software Engineer Salaries in Ireland 2026", category: "Salary Guides" },
  { title: "Software Engineer Salaries in Norway 2026", category: "Salary Guides" },
  { title: "Software Engineer Salaries in Denmark 2026", category: "Salary Guides" },
  { title: "Software Engineer Salaries in Portugal 2026", category: "Salary Guides" },
  { title: "Software Engineer Salaries in New Zealand 2026", category: "Salary Guides" },
  { title: "Software Engineer Salaries in Japan 2026", category: "Salary Guides" },

  // Salary Guides — Other Roles
  { title: "Product Manager Salaries in Switzerland 2026", category: "Salary Guides" },
  { title: "Product Manager Salaries in Germany 2026", category: "Salary Guides" },
  { title: "Product Manager Salaries in UK vs USA 2026", category: "Salary Guides" },
  { title: "Nurse Salaries in Australia vs UK 2026", category: "Salary Guides" },
  { title: "Nurse Salaries in Canada vs Ireland 2026", category: "Salary Guides" },
  { title: "Nurse Salaries in UAE vs Norway 2026", category: "Salary Guides" },
  { title: "Teacher Salaries in UAE vs Singapore 2026", category: "Salary Guides" },
  { title: "Teacher Salaries in Australia vs New Zealand 2026", category: "Salary Guides" },
  { title: "Accountant Salaries in Switzerland vs Germany 2026", category: "Salary Guides" },
  { title: "Marketing Manager Salaries in Netherlands vs UK 2026", category: "Salary Guides" },
  { title: "Data Scientist Salaries in USA vs Canada 2026", category: "Salary Guides" },
  { title: "UX Designer Salaries in Germany vs Netherlands 2026", category: "Salary Guides" },
  { title: "DevOps Engineer Salaries in Singapore vs Australia 2026", category: "Salary Guides" },

  // Visa Guides
  { title: "Portugal D8 Digital Nomad Visa: Full Guide 2026", category: "Visa Guides" },
  { title: "Canada Express Entry for Software Engineers 2026", category: "Visa Guides" },
  { title: "EU Blue Card: Complete Guide for Non-EU Tech Workers 2026", category: "Visa Guides" },
  { title: "Australia Skilled Worker Visa: Full Breakdown 2026", category: "Visa Guides" },
  { title: "Netherlands Highly Skilled Migrant Visa Guide 2026", category: "Visa Guides" },
  { title: "Singapore Employment Pass: Full Guide 2026", category: "Visa Guides" },
  { title: "UAE Golden Visa for Tech Workers 2026", category: "Visa Guides" },
  { title: "Germany Job Seeker Visa: Full Guide 2026", category: "Visa Guides" },
  { title: "New Zealand Skilled Migrant Visa Guide 2026", category: "Visa Guides" },
  { title: "Sweden Work Permit for Tech Workers 2026", category: "Visa Guides" },
  { title: "Norway Skilled Worker Visa Guide 2026", category: "Visa Guides" },
  { title: "Ireland Critical Skills Employment Permit 2026", category: "Visa Guides" },
  { title: "Spain Digital Nomad Visa: Full Breakdown 2026", category: "Visa Guides" },
  { title: "Japan Engineer Visa for Tech Workers 2026", category: "Visa Guides" },
  { title: "Switzerland Work Permit for Non-EU Engineers 2026", category: "Visa Guides" },

  // City Comparisons
  { title: "Amsterdam vs Lisbon: Cost of Living for Tech Workers 2026", category: "City Comparisons" },
  { title: "Singapore vs Dubai: Which Pays More After Tax 2026", category: "City Comparisons" },
  { title: "Barcelona vs Madrid: Cost of Living for Tech Workers 2026", category: "City Comparisons" },
  { title: "Sydney vs Melbourne: Cost of Living for Tech Workers 2026", category: "City Comparisons" },
  { title: "Toronto vs Vancouver: Cost of Living for Tech Workers 2026", category: "City Comparisons" },
  { title: "London vs Amsterdam: Which Pays More After Tax 2026", category: "City Comparisons" },
  { title: "Stockholm vs Copenhagen: Cost of Living for Tech Workers 2026", category: "City Comparisons" },
  { title: "Zurich vs Munich: Cost of Living for Tech Workers 2026", category: "City Comparisons" },
  { title: "Paris vs Berlin: Cost of Living for Tech Workers 2026", category: "City Comparisons" },
  { title: "Singapore vs Sydney: Which Is Better for Tech Workers 2026", category: "City Comparisons" },
  { title: "Dubai vs Zurich: Tax-Free Salary vs High Salary 2026", category: "City Comparisons" },
  { title: "Tokyo vs Singapore: Cost of Living for Tech Workers 2026", category: "City Comparisons" },
  { title: "Oslo vs Stockholm: Cost of Living for Tech Workers 2026", category: "City Comparisons" },
  { title: "Lisbon vs Madrid: Best City for Tech Expats 2026", category: "City Comparisons" },
  { title: "Auckland vs Sydney: Cost of Living for Tech Workers 2026", category: "City Comparisons" },
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
- End with 2-3 relevant internal links from: /best-countries-for/software-engineers, /salary-calculator, /wizard, /country/germany, /country/netherlands, /country/portugal, /country/canada, /country/singapore, /country/usa, /country/australia, /country/spain, /country/switzerland, /country/sweden, /country/norway, /country/denmark, /country/ireland, /country/france, /country/japan, /country/new-zealand, /country/uae, /country/belgium, /country/austria, /country/finland, /country/italy, /country/malaysia, /country/brazil, /country/india
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
  console.log('Total topics in rotation:', TOPICS.length);

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