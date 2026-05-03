// app/country/[slug]/page.tsx
import SimpleNav from "@/components/SimpleNav";
import Link from "next/link";
import { Metadata } from "next";
import { createClient } from "@supabase/supabase-js";
import { mapRowToCountry } from "@/lib/mappers";
import { CountryWithData } from "@/types";
import CountryPageClient from "./CountryPageClient";

// Use the plain server-side client (not createBrowserClient) so it works
// correctly at build time during static generation — no browser APIs needed.
function getServerSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}




async function getAllCountries(): Promise<CountryWithData[]> {
  const supabase = getServerSupabase();
  const { data: countries } = await supabase.from('countries').select('*')
  const { data: countryData } = await supabase.from('country_data').select('*')
  if (!countries || !countryData) return []
  return countries.map((c) => {
    const d = countryData.find((cd) => cd.country_id === c.id)
    return mapRowToCountry(c, d)
  })
}

async function getCountry(slug: string): Promise<CountryWithData | null> {
  const supabase = getServerSupabase();
  const { data: c } = await supabase
    .from('countries').select('*').eq('slug', slug).single()
  if (!c) return null
  const { data: d } = await supabase
    .from('country_data').select('*').eq('country_id', c.id).single()
  if (!d) return null
  return mapRowToCountry(c, d)
}

export async function generateStaticParams() {
  const supabase = getServerSupabase();
  const { data: countries } = await supabase.from('countries').select('slug')
  return (countries ?? []).map((c) => ({ slug: c.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const country = await getCountry(slug)
  if (!country) return { title: "Country Not Found — Origio" }

  const title = `Move to ${country.name} — Salary, Visa, Cost of Living | Origio`
  const description = `Everything you need to know about moving to ${country.name}. Move Score ${country.data.moveScore}/10 · Quality of life ${country.data.scoreQualityOfLife}/10 · Visa difficulty ${country.data.visaDifficulty}/5. Compare salaries, costs and visas.`

  return {
    title,
    description,
    openGraph: { title, description, type: "website" },
  }
}

export default async function CountryPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const [country, allCountries] = await Promise.all([
    getCountry(slug),
    getAllCountries(),
  ])

  if (!country) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-heading text-4xl font-extrabold mb-4">Country Not Found</h1>
          <p className="text-text-muted mb-8">The country you are looking for does not exist.</p>
          <Link href="/" className="cta-button px-6 py-3 rounded-2xl inline-block">
            Back to Globe
          </Link>
        </div>
      </div>
    )
  }

  const otherCountries = allCountries.filter((c) => c.slug !== slug)
  return <CountryPageClient country={country} otherCountries={otherCountries} />
}