import { createClient } from '@supabase/supabase-js'
import { mapRowToCity } from '@/lib/mappers'
import { City } from '@/types'
import CitiesIndexClient from './CitiesIndexClient'

export const revalidate = 3600

export const metadata = {
  title: 'Cities ~ Cost of Living, Salaries & Expat Guides · Origio',
  description: 'Compare rent, salaries, climate and visa routes across 60 global cities. Real data for professionals considering a move abroad.',
  openGraph: {
    title: 'Cities · Origio — Cost of Living & Expat Guides',
    description: 'Compare rent, salaries, healthcare, nightlife and visa routes across 60 global cities. Real data for professionals considering a move abroad.',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cities · Origio — Cost of Living & Expat Guides',
    description: 'Compare rent, salaries, healthcare and visa routes across 60 global cities.',
  },
  keywords: ['cost of living', 'expat guide', 'rent abroad', 'remote work cities', 'digital nomad', 'city comparison', 'move abroad', 'salaries abroad'],
}

async function getCities(): Promise<City[]> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { data, error } = await supabase
    .from('cities')
    .select(`
      *,
      city_data (*)
    `)
    .order('name', { ascending: true })

  if (error) {
    console.error('Failed to fetch cities:', error)
    return []
  }

  return (data ?? []).map(mapRowToCity) as City[]
}

export default async function CitiesPage() {
  const cities = await getCities()
  return <CitiesIndexClient cities={cities} />
}