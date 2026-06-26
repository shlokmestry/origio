import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Salary Calculator — Compare Take-Home Pay in 45 Countries · Origio",
  description:
    "Calculate your real take-home salary after tax in 45 countries. Compare net pay for 20 roles across the UK, US, Germany, Singapore, UAE and more.",
  keywords: [
    "salary calculator",
    "take-home pay calculator",
    "international salary comparison",
    "net salary after tax",
    "expat salary",
    "salary by country",
    "income tax calculator",
  ],
  openGraph: {
    title: "Salary Calculator — Take-Home Pay in 45 Countries · Origio",
    description:
      "See your real net salary after tax in 45 countries. 20 roles, real market rates, accurate tax calculations.",
    url: "https://findorigio.com/salary-calculator",
    siteName: "Origio",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Salary Calculator — Take-Home Pay in 45 Countries · Origio",
    description:
      "See your real net salary after tax in 45 countries. 20 roles, real market rates, accurate tax calculations.",
  },
};

export default function SalaryCalculatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
