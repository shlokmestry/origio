import type { Metadata } from "next";
import PassportPowerClient from "./PassportPowerClient";

export const metadata: Metadata = {
  title: "Global Passport Index — Origio",
  description:
    "192 destinations or 23. One number determines where you can go, live, and build. See where your passport ranks.",
  alternates: {
    canonical: "https://findorigio.com/passport-power",
  },
  openGraph: {
    title: "Global Passport Index — Origio",
    description:
      "192 destinations or 23. One number determines where you can go, live, and build. See where your passport ranks.",
    url: "https://findorigio.com/passport-power",
    siteName: "Origio",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Global Passport Index — Origio",
    description:
      "192 destinations or 23. One number determines where you can go, live, and build. See where your passport ranks.",
  },
};

export default function PassportPowerPage() {
  return <PassportPowerClient />;
}
