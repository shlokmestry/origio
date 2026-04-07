// app/api/countries/route.ts
import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { mapRowToCountry } from '@/lib/mappers'

export async function GET() {
  const { data: countries, error: countriesError } = await supabase
    .from('countries')
    .select('*')
    .order('name')

  if (countriesError) {
    console.error('Error fetching countries:', countriesError)
    return NextResponse.json({ error: countriesError.message }, { status: 500 })
  }

  const { data: countryData, error: dataError } = await supabase
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