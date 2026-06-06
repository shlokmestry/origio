import { Metadata } from 'next'
import { Suspense } from 'react'
import { createClient } from '@supabase/supabase-js'
import CompareCitiesClient, { type CityData } from './CompareCitiesClient'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Approximate rates to EUR for normalising comparison costs — May 2026
const TO_EUR: Record<string, number> = {
  EUR: 1,    GBP: 1.18,  USD: 0.93,  AED: 0.25,  JPY: 0.0062,
  SGD: 0.70, AUD: 0.60,  CAD: 0.68,  THB: 0.027, MXN: 0.048,
  PLN: 0.23, CZK: 0.041, HUF: 0.0026,RON: 0.20,  BGN: 0.51,
  HRK: 0.13, RSD: 0.0085,TRY: 0.031, BRL: 0.18,  COP: 0.00023,
  IDR: 0.000058,          // Indonesian Rupiah — Bali
  MYR: 0.20,              // Malaysian Ringgit — Kuala Lumpur
  ZAR: 0.050,             // South African Rand — Cape Town
  GEL: 0.34,              // Georgian Lari — Tbilisi
  VND: 0.000037,          // Vietnamese Dong — Da Nang
  ARS: 0.00092,           // Argentine Peso (kept for reference; BA rows use USD)
}

async function getCitiesForCompare(): Promise<CityData[]> {
  const { data, error } = await supabase
    .from('cities')
    .select(`
      slug, name, country_name, flag_emoji, currency,
      city_data (
        cost_rent_city_centre,
        cost_groceries_monthly,
        cost_eating_out,
        cost_utilities_monthly,
        cost_gym_monthly,
        cost_coworking_monthly,
        cost_transport_monthly
      )
    `)
    .order('name', { ascending: true })

  if (error || !data) return []

  return data
    .filter(row => row.city_data?.length > 0)
    .map(row => {
      const cd = (row.city_data as Record<string, number | null>[] | null)?.[0]
      if (!cd) return null
      const rate = TO_EUR[row.currency as string] ?? 1
      const toEur = (v: number | null): number | null => v != null ? Math.round(v * rate) : null

      return {
        slug: row.slug as string,
        code: (row.slug as string).slice(0, 3).toUpperCase(),
        name: row.name as string,
        country: row.country_name as string,
        flag: row.flag_emoji as string,
        currency: row.currency as string,
        costs: {
          rent:      toEur(cd.cost_rent_city_centre),
          groc:      toEur(cd.cost_groceries_monthly),
          dine:      toEur(cd.cost_eating_out),
          util:      toEur(cd.cost_utilities_monthly),
          gym:       toEur(cd.cost_gym_monthly),
          cowork:    toEur(cd.cost_coworking_monthly),
          transport: toEur(cd.cost_transport_monthly),
        },
      } satisfies CityData
    })
    .filter((c): c is CityData => c !== null)
}

export const metadata: Metadata = {
  title: 'Compare Cities — The Math on Paper · Origio',
  description:
    'Compare up to four cities side by side. Rent, groceries, dining, gym, coworking, transport — the real monthly cost of moving.',
  openGraph: {
    title: 'Compare Cities · Origio',
    description: 'The real monthly cost of living, side by side for up to four cities.',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
}

export const revalidate = 3600

export default async function CompareCitiesPage() {
  const allCities = await getCitiesForCompare()
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: '#040407' }} />}>
      <CompareCitiesClient allCities={allCities} />
    </Suspense>
  )
}
