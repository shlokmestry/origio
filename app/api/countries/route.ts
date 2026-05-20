// app/api/countries/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { mapRowToCountry } from '@/lib/mappers'

export const dynamic = 'force-dynamic'

export async function GET() {
  // Initialised inside the handler so env vars are guaranteed to be set at runtime
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
    headers: { 'Cache-Control': 'no-store' },
  })
}
