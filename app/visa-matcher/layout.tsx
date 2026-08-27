import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Visa Matcher — See Where Your Passport Can Take You · Origio",
  description:
    "Select your passport and instantly see which of 58 countries are visa-free, easy, moderate, or restricted for you. Powered by real immigration data.",
  keywords: [
    "visa matcher",
    "passport visa access",
    "visa-free countries",
    "where can I move",
    "immigration routes",
    "expat visa guide",
  ],
  openGraph: {
    title: "Visa Matcher — Where Can You Actually Move? · Origio",
    description:
      "Pick your passport. See 58 countries ranked by visa difficulty — adjusted for your specific passport tier.",
    url: "https://findorigio.com/visa-matcher",
    siteName: "Origio",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Visa Matcher — Where Can You Actually Move? · Origio",
    description:
      "Pick your passport. See 58 countries ranked by visa difficulty — adjusted for your specific passport tier.",
  },
};

export default function VisaMatcherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
