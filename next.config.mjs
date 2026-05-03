/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  staticPageGenerationTimeout: 120,

  // MapLibre GL uses browser APIs — exclude from server bundle
  serverExternalPackages: ["maplibre-gl"],

  webpack: (config) => {
    config.externals = [...(config.externals || []), { canvas: "canvas" }];
    return config;
  },

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-DNS-Prefetch-Control", value: "on" },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              // Scripts
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com",
              // Styles — added MapTiler for map styles
              "style-src 'self' 'unsafe-inline' https://api.fontshare.com https://fonts.googleapis.com https://api.maptiler.com",
              // Images — added MapTiler tile domains
              "img-src 'self' data: blob: https://*.supabase.co https://*.googleusercontent.com https://unpkg.com https://api.maptiler.com https://*.maptiler.com https://*.maptiles.io",
              // Fonts
              "font-src 'self' https://api.fontshare.com https://fonts.gstatic.com",
              // Connections — added MapTiler tile + API endpoints
              "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.stripe.com https://www.google-analytics.com https://www.googletagmanager.com https://vitals.vercel-insights.com https://unpkg.com https://api.maptiler.com https://*.maptiler.com https://*.maptiles.io",
              // Stripe
              "frame-src https://js.stripe.com https://hooks.stripe.com",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self' https://checkout.stripe.com",
              // Workers — MapLibre uses web workers for tile processing
              "worker-src 'self' blob:",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

export default nextConfig;