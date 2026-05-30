import { Metadata } from "next";
import { createClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";
import { mapRowToCountry } from "@/lib/mappers";
import { CountryWithData } from "@/types";
import CountryPageClient from "./CountryPageClient";

export const revalidate = 86400

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

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const country = await getCountry(slug);
  if (!country) return { title: "Not Found — Origio" };
  return {
    title: `${country.name} — Relocation Report · Origio`,
    description: `Salaries, visa difficulty, cost of living and quality of life data for ${country.name}.`,
  };
}

export async function generateStaticParams() {
  const supabase = getServerSupabase();
  const { data: countries } = await supabase.from("countries").select("slug");
  return (countries ?? []).map((c) => ({ slug: c.slug }));
}

export default async function CountryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [country, allCountries] = await Promise.all([getCountry(slug), getAllCountries()]);
  if (!country) notFound();
  const otherCountries = allCountries.filter((c) => c.slug !== slug);
  return <CountryPageClient country={country} otherCountries={otherCountries} />;
}