import Link from "next/link";
import { Metadata } from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import styles from "@/app/cities/compare/compare.module.css";

export const metadata: Metadata = {
  title: "Compare Countries & Cities ~ Origio",
  description: "Compare countries for relocation strategy, then compare cities for actual monthly cost.",
  openGraph: {
    title: "Compare Countries & Cities — Origio",
    description: "Country first. City second. Salary, rent, tax, visa friction and monthly burn side by side.",
    type: "website",
  },
};

export default function CompareHubPage() {
  return (
    <div className={styles.page}>
      <Nav countries={[]} />
      <main className={`${styles.folio} ${styles.compareHub}`} style={{ paddingTop: 90 }}>
        <section className={styles.compareHubHero}>
          <p className={styles.compareHubKicker}>SIDE BY SIDE</p>
          <h1 className={styles.compareHubTitle}>Compare Countries & Cities</h1>
          <p className={styles.compareHubSub}>
            Relocation has two decisions. First choose the country: salary, tax, visa friction.
            Then choose the city: rent, groceries, transport, monthly burn.
          </p>
        </section>

        <section className={styles.compareHubGrid}>
          <Link href="/compare/countries" className={styles.compareHubCard}>
            <div className={styles.compareHubCardTop}>
              <span>COUNTRIES</span>
              <strong>Salary · tax · visa</strong>
            </div>
            <div className={styles.comparePreviewTable} aria-hidden>
              {["🇵🇹 Portugal", "🇩🇪 Germany", "🇦🇹 Austria"].map((country, i) => (
                <div key={country} className={styles.comparePreviewRow}>
                  <span>{country}</span>
                  <div>
                    <b style={{ width: `${68 + i * 10}%` }} />
                  </div>
                  <em>{i === 0 ? "€55k" : i === 1 ? "€72k" : "€70k"}</em>
                </div>
              ))}
            </div>
            <p>Stack countries across cost base, salary context, taxes and immigration friction.</p>
            <span className={styles.compareHubButton}>Compare Countries</span>
          </Link>

          <Link href="/compare/cities" className={styles.compareHubCard}>
            <div className={styles.compareHubCardTop}>
              <span>CITIES</span>
              <strong>Rent · burn · tradeoff</strong>
            </div>
            <div className={styles.comparePreviewBars} aria-hidden>
              {[
                ["Lisbon", 48],
                ["Berlin", 56],
                ["London", 92],
              ].map(([city, width]) => (
                <div key={city} className={styles.comparePreviewBarRow}>
                  <span>{city}</span>
                  <div>
                    <b style={{ width: `${width}%` }} />
                    <i style={{ width: `${Number(width) * 0.26}%` }} />
                  </div>
                </div>
              ))}
            </div>
            <p>Compare actual monthly cost across rent, food, utilities, transport and coworking.</p>
            <span className={styles.compareHubButton}>Compare Cities</span>
          </Link>
        </section>
      </main>
      <Footer />
    </div>
  );
}
