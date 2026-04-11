import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { rolePages } from "@/lib/seo-role-pages";

type Props = {
  params: Promise<{ role: string }>;
};

export async function generateStaticParams() {
  return rolePages.map((page) => ({
    role: page.slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { role } = await params;
  const page = rolePages.find((item) => item.slug === role);

  if (!page) {
    return {
      title: "Page Not Found",
    };
  }

  return {
    title: page.title,
    description: page.metaDescription,
    alternates: {
      canonical: `https://origio.app/best-countries-for/${page.slug}`,
    },
    openGraph: {
      title: page.title,
      description: page.metaDescription,
      url: `https://origio.app/best-countries-for/${page.slug}`,
      siteName: "Origio",
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: page.title,
      description: page.metaDescription,
    },
  };
}

export default async function RoleSeoPage({ params }: Props) {
  const { role } = await params;
  const page = rolePages.find((item) => item.slug === role);

  if (!page) notFound();

  return (
    <main className="min-h-screen bg-bg-primary">
      <section className="max-w-5xl mx-auto px-4 py-12 md:py-16">
        <div className="max-w-3xl mb-10">
          <p className="text-sm text-accent font-semibold mb-3">
            Career relocation guide
          </p>
          <h1 className="font-heading text-4xl md:text-5xl font-extrabold text-text-primary mb-4">
            {page.title}
          </h1>
          <p className="text-text-muted text-base md:text-lg leading-7">
            {page.intro}
          </p>
        </div>

        <div className="grid gap-4 md:gap-5">
          {page.countries.map((country, index) => (
            <article
              key={country.slug}
              className="rounded-2xl border border-border bg-surface p-5 md:p-6"
            >
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                <div>
                  <p className="text-xs uppercase tracking-wider text-text-muted mb-2">
                    Rank #{index + 1}
                  </p>
                  <h2 className="font-heading text-2xl font-bold text-text-primary">
                    {country.name}
                  </h2>
                  <p className="text-text-muted mt-2 max-w-2xl">
                    {country.why}
                  </p>
                </div>

                <Link
                  href="/salary-calculator"
                  className="inline-flex items-center justify-center rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition"
                >
                  Check take-home pay
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                <div className="rounded-xl bg-bg-secondary p-4">
                  <p className="text-xs uppercase tracking-wider text-text-muted mb-1">
                    Typical salary
                  </p>
                  <p className="text-sm font-semibold text-text-primary">
                    {country.salary}
                  </p>
                </div>

                <div className="rounded-xl bg-bg-secondary p-4">
                  <p className="text-xs uppercase tracking-wider text-text-muted mb-1">
                    Tax
                  </p>
                  <p className="text-sm font-semibold text-text-primary">
                    {country.tax}
                  </p>
                </div>

                <div className="rounded-xl bg-bg-secondary p-4">
                  <p className="text-xs uppercase tracking-wider text-text-muted mb-1">
                    Visa path
                  </p>
                  <p className="text-sm font-semibold text-text-primary">
                    {country.visa}
                  </p>
                </div>

                <div className="rounded-xl bg-bg-secondary p-4">
                  <p className="text-xs uppercase tracking-wider text-text-muted mb-1">
                    Language
                  </p>
                  <p className="text-sm font-semibold text-text-primary">
                    {country.language}
                  </p>
                </div>

                <div className="rounded-xl bg-bg-secondary p-4">
                  <p className="text-xs uppercase tracking-wider text-text-muted mb-1">
                    Quality of life
                  </p>
                  <p className="text-sm font-semibold text-text-primary">
                    {country.qualityOfLife}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 pb-16">
        <div className="rounded-2xl border border-border bg-surface p-6 md:p-8">
          <h2 className="font-heading text-2xl font-bold text-text-primary mb-6">
            FAQs
          </h2>

          <div className="space-y-5">
            {page.faqs.map((faq) => (
              <div key={faq.question}>
                <h3 className="text-base font-semibold text-text-primary mb-2">
                  {faq.question}
                </h3>
                <p className="text-text-muted leading-7">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}