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
          50: "#F4F1FF",
          100: "#EAE4FF",
          200: "#D6CBFF",
          300: "#B8A4FF",
          400: "#977BFF",
          500: "#7C5CFC",
          600: "#6344F5", // Primary Soft 3D Clay Purple
          700: "#5032DC",
          800: "#4126B8",
          900: "#351F94",
          950: "#1D1154",
        },
        clay: {
          canvas: "#F3F2FC",
          canvasDark: "#100F24",
          surface: "#FFFFFF",
          surfaceDark: "#1C1A3A",
          elevatedDark: "#26234D",
          mint: "#D8F6F1",
          mintDeep: "#3CC8B4",
          lavender: "#ECE7FF",
          lavenderDeep: "#8E72FF",
          peach: "#FFF1DC",
          peachDeep: "#FFB44C",
          pink: "#FFE5EE",
          pinkDeep: "#FF6B9E",
          sky: "#E4F2FF",
          skyDeep: "#4EA8FF",
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
        card: "28px",
        clay: "24px",
        button: "16px",
      },
      boxShadow: {
        soft: "0 6px 24px -4px rgba(99, 68, 245, 0.10)",
        card: "0 14px 34px -8px rgba(48, 35, 118, 0.10), inset 0 2px 3px rgba(255, 255, 255, 0.9)",
        glow: "0 10px 30px -5px rgba(124, 92, 252, 0.35)",
        clay: "0 14px 30px -8px rgba(68, 52, 138, 0.13), 0 4px 10px -2px rgba(68, 52, 138, 0.06), inset 0 3px 4px rgba(255, 255, 255, 0.95), inset 0 -3px 6px rgba(198, 192, 238, 0.25)",
        "clay-sm": "0 8px 18px -6px rgba(68, 52, 138, 0.12), inset 0 2px 3px rgba(255, 255, 255, 0.95), inset 0 -2px 4px rgba(198, 192, 238, 0.2)",
        "clay-purple": "0 10px 22px -6px rgba(99, 68, 245, 0.45), inset 0 2px 3px rgba(255, 255, 255, 0.45), inset 0 -3px 0 rgba(48, 25, 140, 0.3)",
        "clay-mint": "0 10px 22px -6px rgba(52, 198, 179, 0.38), inset 0 2px 3px rgba(255, 255, 255, 0.5), inset 0 -3px 0 rgba(16, 118, 105, 0.22)",
        "clay-amber": "0 10px 22px -6px rgba(245, 158, 11, 0.38), inset 0 2px 3px rgba(255, 255, 255, 0.5), inset 0 -3px 0 rgba(146, 64, 14, 0.25)",
        soroban: "0 20px 40px -10px rgba(0, 0, 0, 0.28)",
      },
      animation: {
        "pulse-subtle": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        float: "float 4s ease-in-out infinite",
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
          "50%": { transform: "translateY(-9px) rotate(1.5deg)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
