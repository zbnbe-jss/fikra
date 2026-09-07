/** @type {import('tailwindcss').Config} */
// Palette, radii, and shadows recovered from the live site's compiled CSS
// (assets/index-CWwukEVr.css). Do not "improve" these values.
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        fikra: {
          50: "#f5f3ff",
          100: "#ede9fe",
          200: "#ddd6fe",
          300: "#c4b5fd",
          400: "#a78bfa",
          500: "#8b5cf6",
          600: "#7c3aed",
          700: "#6d28d9",
          800: "#5b21b6",
          900: "#4c1d95",
        },
        azure: {
          50: "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          300: "#93c5fd",
          400: "#60a5fa",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
          800: "#1e40af",
          900: "#1e3a8a",
        },
        ink: {
          50: "#f8fafc",
          100: "#f1f5f9",
          200: "#e2e8f0",
          300: "#cbd5e1",
          400: "#94a3b8",
          500: "#64748b",
          600: "#475569",
          700: "#334155",
          800: "#1e293b",
          900: "#0f172a",
        },
      },
      fontFamily: {
        sans: ["Comic Relief", "El Messiri", "system-ui", "sans-serif"],
      },
      borderRadius: {
        "2xl": "1.25rem",
        "3xl": "1.75rem",
      },
      boxShadow: {
        card: "0 4px 24px -8px rgba(124, 58, 237, .12), 0 2px 8px -2px rgba(15, 23, 42, .06)",
        float: "0 12px 40px -12px rgba(124, 58, 237, .25), 0 4px 16px -4px rgba(15, 23, 42, .08)",
        soft: "0 2px 8px -2px rgba(15, 23, 42, .08), 0 4px 16px -4px rgba(15, 23, 42, .06)",
      },
      keyframes: {
        "fade-in": { "0%": { opacity: "0" }, to: { opacity: "1" } },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        float: {
          "0%, to": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-12px)" },
        },
        "pulse-soft": { "0%, to": { opacity: "1" }, "50%": { opacity: ".6" } },
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(.95)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        "slide-in-right": {
          "0%": { opacity: "0", transform: "translate(30px)" },
          to: { opacity: "1", transform: "translate(0)" },
        },
        heroWordIn: {
          "0%": { opacity: "0", transform: "translateY(16px) scale(.98)", filter: "blur(6px)" },
          "60%": { opacity: "1", filter: "blur(0)" },
          to: { opacity: "1", transform: "translateY(0) scale(1)", filter: "blur(0)" },
        },
        heroWordOut: {
          "0%": { opacity: "1", transform: "translateY(0) scale(1)", filter: "blur(0)" },
          to: { opacity: "0", transform: "translateY(-14px) scale(1.02)", filter: "blur(6px)" },
        },
      },
      animation: {
        "fade-in": "fade-in .5s ease-out forwards",
        "fade-up": "fade-up .6s ease-out forwards",
        float: "float 6s ease-in-out infinite",
        "pulse-soft": "pulse-soft 2s ease-in-out infinite",
        "scale-in": "scale-in .4s ease-out forwards",
        "slide-in-right": "slide-in-right .5s ease-out forwards",
      },
    },
  },
  plugins: [],
};
