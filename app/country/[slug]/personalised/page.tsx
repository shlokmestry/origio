// app/country/[slug]/personalised/page.tsx
import { Metadata } from "next";
import { createClient } from "@supabase/supabase-js";
import { mapRowToCountry } from "@/lib/mappers";
import { CountryWithData } from "@/types";
import PersonalisedReport from "./PersonalisedReport";
import { notFound } from "next/navigation";

function getServerSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

async function getCountry(slug: string): Promise<CountryWithData | null> {
  const supabase = getServerSupabase();
  const { data: c } = await supabase.from("countries").select("*").eq("slug", slug).single();
  if (!c) return null;
  const { data: d } = await supabase.from("country_data").select("*").eq("country_id", c.id).single();
  if (!d) return null;
  return mapRowToCountry(c, d);
}

async function getAllCountries(): Promise<CountryWithData[]> {
  const supabase = getServerSupabase();
  const { data: countries } = await supabase.from("countries").select("*");
  const { data: countryData } = await supabase.from("country_data").select("*");
  if (!countries || !countryData) return [];
  return countries.map((c) => {
    const d = countryData.find((cd) => cd.country_id === c.id);
    return mapRowToCountry(c, d);
  });
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const country = await getCountry(params.slug);
  if (!country) return { title: "Not Found — Origio" };
  return {
    title: `Why ${country.name} could be your country · Origio`,
    description: `Your personalised relocation report for ${country.name} — salary, visa path, cost reality, and how it matches your priorities.`,
  };
}

export async function generateStaticParams() {
  const supabase = getServerSupabase();
  const { data: countries } = await supabase.from("countries").select("slug");
  return (countries ?? []).map((c) => ({ slug: c.slug }));
}

export default async function PersonalisedPage({
  params,
}: {
  params: { slug: string };
}) {
  const [country, allCountries] = await Promise.all([
    getCountry(params.slug),
    getAllCountries(),
  ]);

  if (!country) notFound();

  return <PersonalisedReport country={country} allCountries={allCountries} />;
}