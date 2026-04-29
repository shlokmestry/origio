const TOPICS = [
  { title: "Software Engineer Salaries in Netherlands 2026", category: "Salary Guides" },
  { title: "Portugal D8 Digital Nomad Visa: Full Guide 2026", category: "Visa Guides" },
  { title: "Amsterdam vs Lisbon: Cost of Living for Tech Workers", category: "City Comparisons" },
  { title: "Nurse Salaries in Australia vs UK 2026", category: "Salary Guides" },
  { title: "Canada Express Entry for Software Engineers 2026", category: "Visa Guides" },
  { title: "Singapore vs Dubai: Which Pays More After Tax?", category: "City Comparisons" },
  { title: "Product Manager Salaries in Switzerland 2026", category: "Salary Guides" },
  { title: "EU Blue Card: Complete Guide for Non-EU Tech Workers", category: "Visa Guides" },
];

async function getNextTopic() {
  // rotate based on week number
  const week = Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000))
  return TOPICS[week % TOPICS.length]
}

function toSlug(title) {
  return title.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

async function generatePost(topic) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-opus-4-5',
      max_tokens: 4000,
      messages: [{
        role: 'user',
        content: `Write a data-first relocation guide for professionals.

Topic: ${topic.title}
Category: ${topic.category}

Rules:
- Tone: financial newspaper. Direct, specific, no fluff.
- Include real salary ranges, tax breakdowns, or visa timelines with numbers
- Min 800 words, structured with H2 headers
- End with 2-3 internal links using these paths: /best-countries-for/software-engineers, /salary-calculator, /wizard, /country/[relevant-slug]
- Write in Markdown

Return ONLY valid JSON, no backticks:
{
  "slug": "url-slug-here",
  "title": "exact title",
  "description": "one sentence, 120-150 chars, specific not vague",
  "content_md": "full markdown content"
}`
      }]
    })
  })

  const data = await res.json()
  const text = data.content[0].text
  return JSON.parse(text)
}

async function publishToSupabase(post, category) {
  const res = await fetch(`${process.env.SUPABASE_URL}/rest/v1/blog_posts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': process.env.SUPABASE_SERVICE_KEY,
      'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_KEY}`,
      'Prefer': 'return=minimal'
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
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Supabase insert failed: ${err}`)
  }
}

async function main() {
  const topic = await getNextTopic()
  console.log(`Generating: ${topic.title}`)
  
  const post = await generatePost(topic)
  console.log(`Generated: ${post.slug}`)
  
  await publishToSupabase(post, topic.category)
  console.log('Published ✓')
}

main().catch(e => { console.error(e); process.exit(1) })