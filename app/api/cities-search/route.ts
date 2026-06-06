import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export const revalidate = 3600

export async function GET() {
  const { data, error } = await supabase
    .from('cities')
    .select('slug, name, country_name, flag_emoji, city_data(move_score)')
    .order('name', { ascending: true })

  if (error || !data) return NextResponse.json([])

  const result = data.map(row => ({
    slug: row.slug,
    name: row.name,
    countryName: row.country_name,
    flagEmoji: row.flag_emoji,
    moveScore: (row.city_data as any)?.[0]?.move_score ?? null,
  }))

  return NextResponse.json(result)
}
