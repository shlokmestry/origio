import { createClient } from "@supabase/supabase-js";
import { Metadata } from "next";
import CityPageClient from "./CityPageClient";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Props {
  params: Promise<{ slug: string }>;
}

async function getCityData(slug: string) {
  const { data: city, error: cityError } = await supabase
    .from("cities")
    .select(
      `
      *,
      city_data (
        *
      )
    `
    )
    .eq("slug", slug)
    .single();

  if (cityError || !city) {
    throw new Error(`City not found: ${slug}`);
  }

  return {
    ...city,
    data: city.city_data[0] || null,
  };
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params;
  const city = await getCityData(params.slug);

  return {
    title: `${city.name} — Cost of Living, Salaries & Expat Guide · Origio`,
    description: `A 24-hour field dispatch from ${city.name}, ${city.countryName}: cost of living, salaries by role, neighbourhoods, visa routes and what it actually feels like to live there.`,
    openGraph: {
      title: `${city.name} — Origio Dispatch`,
      description: `Cost of living, salaries, visa difficulty & what it's like to live in ${city.name}.`,
      images: [
        {
          url: city.coverImageUrl || `/og-city-${params.slug}.png`,
          width: 1200,
          height: 630,
          alt: city.name,
        },
      ],
    },
  };
}

export async function generateStaticParams() {
  const { data: cities } = await supabase
    .from("cities")
    .select("slug")
    .limit(50);

  return (cities || []).map((city) => ({
    slug: city.slug,
  }));
}

export const revalidate = 3600; // Revalidate every hour

export default async function CityPage(props: Props) {
  const params = await props.params;
  const city = await getCityData(params.slug);

  return <CityPageClient city={city} />;
}