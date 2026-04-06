import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: "#0a0a0f",
          surface: "#111118",
          elevated: "#1a1a24",
        },
        accent: {
          DEFAULT: "#00d4c8",
          dim: "rgba(0, 212, 200, 0.15)",
          glow: "rgba(0, 212, 200, 0.4)",
        },
        text: {
          primary: "#f0f0f5",
          muted: "#8888a0",
        },
        border: {
          DEFAULT: "rgba(255, 255, 255, 0.08)",
          hover: "rgba(255, 255, 255, 0.15)",
        },
        score: {
          high: "#4ade80",
          mid: "#facc15",
          low: "#f87171",
        },
      },
      fontFamily: {
        heading: ["Cabinet Grotesk", "sans-serif"],
        body: ["Satoshi", "sans-serif"],
      },
      animation: {
        "slide-in": "slideIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "slide-out": "slideOut 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "fade-in": "fadeIn 0.6s ease-out forwards",
        "fade-up": "fadeUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "pulse-glow": "pulseGlow 3s ease-in-out infinite",
        float: "float 6s ease-in-out infinite",
      },
      keyframes: {
        slideIn: {
          "0%": { transform: "translateX(100%)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        slideOut: {
          "0%": { transform: "translateX(0)", opacity: "1" },
          "100%": { transform: "translateX(100%)", opacity: "0" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(30px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        pulseGlow: {
          "0%, 100%": { boxShadow: "0 0 20px rgba(0, 212, 200, 0.2)" },
          "50%": { boxShadow: "0 0 40px rgba(0, 212, 200, 0.4)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;