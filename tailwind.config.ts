import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Festival design tokens — see design notes in
        // src/app/globals.css for the rationale behind each hue.
        cream: {
          DEFAULT: "#FBF3E4",
          50: "#FFFDFA",
          100: "#FBF3E4",
          200: "#F6E9D2",
          300: "#EFDBB6",
        },
        saffron: {
          50: "#FFF3E6",
          100: "#FDE0BD",
          400: "#F5941F",
          500: "#EF7E1B",
          600: "#D9660A",
          700: "#B14F08",
        },
        gold: {
          100: "#F3E6BE",
          300: "#E4C77A",
          500: "#C79A3D",
          600: "#A87E2C",
        },
        maroon: {
          50: "#FBEAEE",
          400: "#9C2A44",
          500: "#7A1230",
          600: "#5E0E25",
          900: "#3B0A1A",
        },
        ink: "#3B2412",
      },
      fontFamily: {
        display: ["var(--font-display)", "ui-serif", "serif"],
        body: ["var(--font-body)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        "temple-glow":
          "radial-gradient(120% 100% at 50% -10%, #F5941F 0%, #B14F08 42%, #5E0E25 100%)",
        "rangoli-dots":
          "radial-gradient(circle, rgba(199,154,61,0.35) 1px, transparent 1.5px)",
      },
      boxShadow: {
        card: "0 8px 24px -8px rgba(122, 18, 48, 0.18)",
        "card-hover": "0 16px 32px -12px rgba(122, 18, 48, 0.28)",
      },
    },
  },
  plugins: [],
};

export default config;
