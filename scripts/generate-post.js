async function generatePost(topic) {
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
        content: `Write a data-first relocation guide for professionals.

Topic: ${topic.title}
Category: ${topic.category}

Rules:
- Tone: financial newspaper. Direct, specific, no fluff.
- Include real salary ranges, tax breakdowns, or visa timelines with numbers
- Min 800 words, structured with H2 headers
- End with 2-3 internal links using these paths: /best-countries-for/software-engineers, /salary-calculator, /wizard, /country/[relevant-slug]
- Write in Markdown

Return ONLY valid JSON, no backticks, no markdown fences:
{
  "slug": "url-slug-here",
  "title": "exact title",
  "description": "one sentence, 120-150 chars, specific not vague",
  "content_md": "full markdown content"
}`
      }]
    })
  })

  // Log status for debugging
  console.log('API status:', res.status)
  
  const data = await res.json()
  
  // Log full response for debugging
  console.log('API response:', JSON.stringify(data, null, 2))

  if (!res.ok) {
    throw new Error(`Claude API error: ${data.error?.message ?? res.status}`)
  }

  if (!data.content || !data.content[0]) {
    throw new Error(`Unexpected response shape: ${JSON.stringify(data)}`)
  }

  const text = data.content[0].text
  
  // Strip any accidental backticks
  const clean = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
  
  return JSON.parse(clean)
}