import type { Metadata } from "next";
import "./globals.css";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/next";
import { AuthProvider } from "@/lib/AuthProvider"

export const metadata: Metadata = {
  title: {
    default: "Origio ~ Find Where You Belong",
    template: "%s | Origio",
  },
  description:
    "Explore opportunities, salaries, visas and life quality across every country — personalised to you.",
  keywords: [
    "move abroad", "relocation", "salary comparison", "visa",
    "cost of living", "quality of life", "immigration", "expat",
    "work abroad", "best countries to live", "relocation guide",
  ],
  metadataBase: new URL("https://findorigio.com"),
  verification: {
    google: "4UQHcaX5pSsG7ShIUnxTdO3f0w9oAVKgu3t3ifstmIo",
  },
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
    shortcut: '/favicon.ico',
  },
  openGraph: {
    title: "Origio ~ Find Where You Belong",
    description: "Explore opportunities, salaries, visas and life quality across every country.",
    type: "website",
    url: "https://findorigio.com",
    siteName: "Origio",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Origio ~ Find Where You Belong",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Origio ~ Find Where You Belong",
    description: "Explore opportunities, salaries, visas and life quality across every country.",
    images: ["/og-image.png"],
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
        <AuthProvider>{children}</AuthProvider>

        {/* Vercel Analytics */}
        <Analytics />

        {/* Google Analytics GA4 */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-FE07VSDBZ2"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-FE07VSDBZ2');
          `}
        </Script>
      </body>
    </html>
  );
}