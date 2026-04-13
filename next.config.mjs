/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  webpack: (config) => {
    config.externals = [...(config.externals || []), { canvas: "canvas" }];
    return config;
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          // Prevent clickjacking — no other site can embed yours in an iframe
          { key: "X-Frame-Options", value: "DENY" },
          // Stop browsers from MIME-sniffing the content-type
          { key: "X-Content-Type-Options", value: "nosniff" },
          // Control how much referrer info is sent with requests
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // Enable DNS prefetching for faster navigation
          { key: "X-DNS-Prefetch-Control", value: "on" },
          // Force HTTPS for 2 years, including subdomains
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          // Disable access to device features you don't need
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          // Content Security Policy — tight defaults, allowing only what Origio needs
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              // Scripts: self + Next.js inline + Google Analytics + GA tag manager
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com",
              // Styles: self + inline (Tailwind/CSS-in-JS) + Google Fonts
              "style-src 'self' 'unsafe-inline' https://api.fontshare.com https://fonts.googleapis.com",
              // Images: self + data URIs + Supabase avatars + Google user content + unpkg (globe textures)
              "img-src 'self' data: blob: https://*.supabase.co https://*.googleusercontent.com https://unpkg.com",
              // Fonts: self + Fontshare + Google Fonts
              "font-src 'self' https://api.fontshare.com https://fonts.gstatic.com",
              // API connections: self + Supabase + Stripe + Google Analytics + Vercel Analytics + unpkg (globe assets)
              "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.stripe.com https://www.google-analytics.com https://vitals.vercel-insights.com https://unpkg.com",
              // Stripe checkout is loaded in a frame
              "frame-src https://js.stripe.com https://hooks.stripe.com",
              // Block all object/embed
              "object-src 'none',",
              // Restrict base URI to self
              "base-uri 'self'",
              // Only allow forms to submit to self and Stripe
              "form-action 'self' https://checkout.stripe.com",
              // Workers for Three.js / globe
              "worker-src 'self' blob:",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

export default nextConfig;