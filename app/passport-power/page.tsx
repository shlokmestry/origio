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
    images: [
      {
        url: "https://findorigio.com/passport-power/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Global Passport Index — Origio",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Global Passport Index — Origio",
    description:
      "192 destinations or 23. One number determines where you can go, live, and build. See where your passport ranks.",
    images: ["https://findorigio.com/passport-power/opengraph-image"],
  },
};

export default function PassportPowerPage() {
  return <PassportPowerClient />;
}
