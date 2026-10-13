import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef6f5", 100: "#d5ebe8", 200: "#aad6d0", 300: "#76bab2",
          400: "#45988f", 500: "#2b7c74", 600: "#21635d", 700: "#1d4f4b",
          800: "#1a403d", 900: "#163533", 950: "#0b1f1e",
        },
      },
      fontFamily: { sans: ["var(--font-sans)", "system-ui", "sans-serif"] },
    },
  },
  plugins: [],
};
export default config;
