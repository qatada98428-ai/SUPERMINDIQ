import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        brand: {
          50: "#EEF2FF",
          100: "#E0E7FF",
          200: "#C7D2FE",
          300: "#A5B4FC",
          400: "#818CF8",
          500: "#6366F1",
          600: "#4F46E5", // Main brand indigo
          700: "#4338CA",
          800: "#3730A3",
          900: "#312E81",
          950: "#1E1B4B",
        },
        energy: {
          50: "#FFFBEB",
          100: "#FEF3C7",
          500: "#F59E0B",
          600: "#D97706",
          700: "#B45309",
        },
        soroban: {
          wood: "#8B4513",
          frame: "#2D1B13",
          beadActive: "#D97706",
          beadInactive: "#6B7280",
          beadUpper: "#E11D48",
          bar: "#E5E7EB",
          rod: "#9CA3AF",
        },
      },
      fontFamily: {
        arabic: ["Alexandria", "IBM Plex Sans Arabic", "Cairo", "system-ui", "sans-serif"],
        display: ["Alexandria", "sans-serif"],
        kids: ["Fredoka", "Baloo Bhaijaan 2", "Alexandria", "system-ui", "sans-serif"],
      },
      borderRadius: {
        card: "18px",
        button: "12px",
      },
      boxShadow: {
        soft: "0 4px 20px -2px rgba(79, 70, 229, 0.08)",
        card: "0 10px 30px -4px rgba(15, 23, 42, 0.06)",
        glow: "0 0 25px -5px rgba(99, 102, 241, 0.35)",
        soroban: "0 20px 40px -10px rgba(0, 0, 0, 0.3)",
      },
      animation: {
        "pulse-subtle": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "float": "float 4s ease-in-out infinite",
        "float-delayed": "float 5s ease-in-out 1.5s infinite",
        "float-slow": "floatSlow 6s ease-in-out infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" },
        },
        floatSlow: {
          "0%, 100%": { transform: "translateY(0px) rotate(0deg)" },
          "50%": { transform: "translateY(-10px) rotate(2deg)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
