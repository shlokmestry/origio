import { Metadata } from 'next'
import { Suspense } from 'react'
import { createClient } from '@supabase/supabase-js'
import CompareCitiesClient, { type CityData } from './CompareCitiesClient'
import { TO_EUR } from '@/lib/exchangeRates'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

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

const BASE_TITLE = 'City vs City — Compare Cost of Living · Origio'
const BASE_DESCRIPTION =
  'Compare cities side by side. Rent, groceries, dining, gym, coworking, transport — estimated monthly cost of moving.'

export async function generateMetadata(
  { searchParams }: { searchParams: Promise<{ cities?: string }> }
): Promise<Metadata> {
  const { cities } = await searchParams
  const slugs = (cities ?? '').split(',').map((s) => s.trim()).filter(Boolean).slice(0, 2)

  if (slugs.length < 2) {
    return {
      title: BASE_TITLE,
      description: BASE_DESCRIPTION,
      openGraph: {
        title: 'Compare Cities · Origio',
        description: BASE_DESCRIPTION,
        images: [{ url: '/og-image.png', width: 1200, height: 630 }],
      },
    }
  }

  const ogUrl = `/api/og/compare?cities=${encodeURIComponent(slugs.join(','))}`
  const { data: names } = await supabase.from('cities').select('slug, name').in('slug', slugs)
  const nameA = names?.find((c) => c.slug === slugs[0])?.name ?? slugs[0]
  const nameB = names?.find((c) => c.slug === slugs[1])?.name ?? slugs[1]
  const title = `${nameA} vs ${nameB} — Cost of Living Compared · Origio`
  return {
    title,
    description: BASE_DESCRIPTION,
    openGraph: {
      title,
      description: BASE_DESCRIPTION,
      images: [{ url: ogUrl, width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: BASE_DESCRIPTION,
      images: [ogUrl],
    },
  }
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
