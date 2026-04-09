import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Origio — Find Where You Belong",
    template: "%s | Origio",
  },
  description:
    "Explore opportunities, salaries, visas and life quality across every country — personalised to you.",
  keywords: [
    "move abroad", "relocation", "salary comparison", "visa",
    "cost of living", "quality of life", "immigration", "expat",
    "work abroad", "best countries to live", "relocation guide",
  ],
  metadataBase: new URL("https://origio-one.vercel.app"),
  openGraph: {
    title: "Origio — Find Where You Belong",
    description: "Explore opportunities, salaries, visas and life quality across every country.",
    type: "website",
    url: "https://origio-one.vercel.app",
    siteName: "Origio",
  },
  twitter: {
    card: "summary_large_image",
    title: "Origio — Find Where You Belong",
    description: "Explore opportunities, salaries, visas and life quality across every country.",
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
