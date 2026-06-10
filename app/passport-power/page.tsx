import type { Metadata } from "next";
import PassportPowerClient from "./PassportPowerClient";

export const metadata: Metadata = {
  title: "Passport Power",
  description:
    "How powerful is your passport — and how rare? See your visa-free score, global rank, and how few people share your travel document.",
  openGraph: {
    title: "Passport Power — Origio",
    description:
      "See your visa-free score, global rank, and how rare your passport really is.",
    url: "https://findorigio.com/passport-power",
    siteName: "Origio",
  },
};

export default function PassportPowerPage() {
  return <PassportPowerClient />;
}
