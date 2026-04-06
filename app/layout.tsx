import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Origio — Find Where You Belong",
  description:
    "Explore opportunities, salaries, visas and life quality across every country — personalised to you.",
  keywords: [
    "move abroad",
    "relocation",
    "salary comparison",
    "visa",
    "cost of living",
    "quality of life",
    "immigration",
  ],
  openGraph: {
    title: "Origio — Find Where You Belong",
    description:
      "Explore opportunities, salaries, visas and life quality across every country.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-bg-primary text-text-primary font-body antialiased noise-overlay">
        {children}
      </body>
    </html>
  );
}