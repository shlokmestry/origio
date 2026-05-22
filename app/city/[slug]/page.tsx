import { createClient } from "@supabase/supabase-js";
import { Metadata } from "next";
import CityPageClient from "./CityPageClient";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export type NearbyCity = {
  slug: string;
  name: string;
  flag_emoji: string;
  tagline: string | null;
  city_data: Array<{ move_score: number | null }>;
};

export type CityFull = {
  id: string;
  slug: string;
  name: string;
  country_slug: string;
  country_name: string;
  flag_emoji: string;
  continent: string;
  language: string;
  currency: string;
  timezone: string;
  population: string | null;
  cover_image_url: string | null;
  monument_name: string | null;
  monument_image_url: string | null;
  tagline: string | null;
  latitude: number | null;
  longitude: number | null;
  city_data: CityDataRow[];
  nearby?: NearbyCity[];
};

export type CityDataRow = {
  cost_rent_city_centre: number | null;
  cost_rent_outside: number | null;
  cost_groceries_monthly: number | null;
  cost_transport_monthly: number | null;
  cost_eating_out: number | null;
  cost_utilities_monthly: number | null;
  cost_gym_monthly: number | null;
  cost_coworking_monthly: number | null;
  salary_software_engineer: number | null;
  score_quality_of_life: number | null;
  score_safety: number | null;
  score_healthcare: number | null;
  score_internet_speed: number | null;
  score_walkability: number | null;
  score_nightlife: number | null;
  score_expat_friendliness: number | null;
  climate_summer_avg_c: number | null;
  climate_winter_avg_c: number | null;
  climate_rainy_days_per_year: number | null;
  climate_description: string | null;
  neighbourhoods: Array<{
    name: string;
    vibe: string;
    avgRent: number;
    goodFor: string[];
  }> | null;
  visa_notes: string | null;
  visa_official_url: string | null;
  income_tax_rate_mid: number | null;
  local_tax_note: string | null;
  move_score: number | null;
  last_verified: string | null;
  data_sources: string | null;
};

async function getCityData(slug: string): Promise<CityFull> {
  const { data, error } = await supabase
    .from("cities")
    .select(`*, city_data (*)`)
    .eq("slug", slug)
    .single();

  if (error || !data) {
    throw new Error(`City not found: ${slug}`);
  }

  const city = data as CityFull;

  // Fetch nearby cities if we have coordinates
  if (city.latitude != null && city.longitude != null) {
    const { data: allCities } = await supabase
      .from("cities")
      .select("slug, name, flag_emoji, tagline, latitude, longitude, city_data(move_score)")
      .neq("slug", slug);

    if (allCities) {
      const withDist = (allCities as Array<{
        slug: string; name: string; flag_emoji: string; tagline: string | null;
        latitude: number | null; longitude: number | null;
        city_data: Array<{ move_score: number | null }>;
      }>)
        .filter(c => c.latitude != null && c.longitude != null)
        .map(c => {
          const dLat = (c.latitude! - city.latitude!) * (Math.PI / 180);
          const dLon = (c.longitude! - city.longitude!) * (Math.PI / 180);
          const a = Math.sin(dLat/2)**2 + Math.cos(city.latitude! * Math.PI/180) * Math.cos(c.latitude! * Math.PI/180) * Math.sin(dLon/2)**2;
          const km = 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
          return { ...c, km };
        })
        .sort((a, b) => a.km - b.km)
        .slice(0, 3);

      city.nearby = withDist;
    }
  }

  return city;
}

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { slug } = await props.params;
  const city = await getCityData(slug);

  return {
    title: `${city.name} — Cost of Living, Salaries & Expat Guide · Origio`,
    description: `A 24-hour field dispatch from ${city.name}, ${city.country_name}: cost of living, salaries, neighbourhoods, and visa routes.`,
    openGraph: {
      title: `${city.name} — Origio Dispatch`,
      description: `Cost of living, salaries, visa difficulty & expat life in ${city.name}.`,
      images: city.cover_image_url
        ? [{ url: city.cover_image_url, width: 1200, height: 630, alt: city.name }]
        : [],
    },
  };
}

export async function generateStaticParams() {
  const { data } = await supabase.from("cities").select("slug").limit(50);
  return (data ?? []).map((c) => ({ slug: c.slug }));
}

export const revalidate = 3600;

export default async function CityPage(props: Props) {
  const { slug } = await props.params;
  const city = await getCityData(slug);
  return <CityPageClient city={city} />;
}