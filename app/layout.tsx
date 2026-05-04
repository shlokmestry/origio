import type { Metadata } from "next";
import "./globals.css";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/next";
import { AuthProvider } from "@/lib/AuthProvider"

export const metadata: Metadata = {
  title: {
    default: "Origio — Country rankings for professionals moving abroad",
    template: "%s | Origio",
  },
  description:
    "Salary after tax. Visa routes. Cost of living. 25 countries ranked for your job and passport.",
  keywords: [
    "move abroad", "work abroad", "visa routes", "salary comparison",
    "cost of living abroad", "immigration", "relocation",
    "take home pay abroad", "country comparison",
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
    title: "Origio — Country rankings for professionals moving abroad",
    description: "Salary after tax. Visa routes. Cost of living. 25 countries ranked for your job and passport.",
    type: "website",
    url: "https://findorigio.com",
    siteName: "Origio",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Origio — Country rankings for professionals moving abroad" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Origio — Country rankings for professionals moving abroad",
    description: "Salary after tax. Visa routes. Cost of living. 25 countries ranked for your job and passport.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        {/* DM Serif Display — serif headline font */}
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-bg-primary text-text-primary font-body antialiased noise-overlay">
        <AuthProvider>{children}</AuthProvider>
        <Analytics />
        <Script src="https://www.googletagmanager.com/gtag/js?id=G-FE07VSDBZ2" strategy="afterInteractive" />
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