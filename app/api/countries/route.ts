// app/api/countries/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { mapRowToCountry } from '@/lib/mappers'
import { rateLimit } from '@/lib/rate-limit'

// Country data changes at most daily — allow CDN/edge caching for 1hr,
// stale-while-revalidate for another hour so DB is never hammered.
export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const limited = await rateLimit(request, { name: 'countries', maxRequests: 30, windowSeconds: 60 })
  if (limited) return limited

  const supabaseServer = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { data: countries, error: countriesError } = await supabaseServer
    .from('countries')
    .select('*')
    .order('name')

  if (countriesError) {
    console.error('Error fetching countries:', countriesError)
    return NextResponse.json({ error: countriesError.message }, { status: 500 })
  }

  const { data: countryData, error: dataError } = await supabaseServer
    .from('country_data')
    .select('*')

  if (dataError) {
    console.error('Error fetching country_data:', dataError)
    return NextResponse.json({ error: dataError.message }, { status: 500 })
  }

  const merged = countries.map((c) => {
    const d = countryData.find((cd) => cd.country_id === c.id)
    return mapRowToCountry(c, d)
  })

  return NextResponse.json(merged, {
    headers: {
      'Cache-Control': 's-maxage=3600, stale-while-revalidate=3600',
    },
  })
}
