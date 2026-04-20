import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      borderRadius: {
        none: "0",
        sm: "0",
        DEFAULT: "0",
        md: "0",
        lg: "0",
        xl: "0",
        "2xl": "0",
        "3xl": "0",
        full: "9999px",
      },
      colors: {
        bg: {
          primary: "#0a0a0a",
          surface: "#111111",
          elevated: "#1a1a1a",
        },
        accent: {
          DEFAULT: "#00ffd5",
          dim: "rgba(0, 255, 213, 0.12)",
          glow: "rgba(0, 255, 213, 0.3)",
        },
        text: {
          primary: "#f0f0e8",
          muted: "#666660",
        },
        border: {
          DEFAULT: "#2a2a2a",
          hover: "#444440",
        },
        score: {
          high: "#00ffd5",
          mid: "#facc15",
          low: "#f87171",
        },
      },
      fontFamily: {
        heading: ["Cabinet Grotesk", "sans-serif"],
        body: ["Satoshi", "sans-serif"],
      },
      boxShadow: {
        brutal: "4px 4px 0 #f0f0e8",
        "brutal-sm": "3px 3px 0 #f0f0e8",
        "brutal-accent": "4px 4px 0 #00ffd5",
        "brutal-lg": "6px 6px 0 #f0f0e8",
      },
      animation: {
        "slide-in": "slideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "slide-out": "slideOut 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "fade-in": "fadeIn 0.4s ease-out forwards",
        "fade-up": "fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards",
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
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        pulseGlow: {
          "0%, 100%": { boxShadow: "4px 4px 0 #f0f0e8" },
          "50%": { boxShadow: "4px 4px 0 #00ffd5" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" },
        },
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],

};

export default config;