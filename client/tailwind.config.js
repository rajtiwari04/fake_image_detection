/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["'Syne'", "sans-serif"],
        body:    ["'DM Sans'", "sans-serif"],
        mono:    ["'JetBrains Mono'", "monospace"],
      },
      colors: {
     
        brand: {
          50:  "#f0f9ff",
          100: "#e0f2fe",
          400: "#38bdf8",
          500: "#0ea5e9",
          600: "#0284c7",
          900: "#0c4a6e",
        },
        danger: {
          400: "#f87171",
          500: "#ef4444",
          600: "#dc2626",
        },
        success: {
          400: "#4ade80",
          500: "#22c55e",
          600: "#16a34a",
        },
        surface: {
  50: "#f8fafc",
  100: "#f1f5f9",
  200: "#e2e8f0",
  600: "#475569",
  700: "#334155",
  800: "#1e293b",
  900: "#0f172a",
  950: "#020617",
}
      },
      animation: {
        "fade-in":      "fadeIn 0.4s ease forwards",
        "slide-up":     "slideUp 0.5s ease forwards",
        "pulse-slow":   "pulse 3s cubic-bezier(0.4,0,0.6,1) infinite",
        "spin-slow":    "spin 3s linear infinite",
        "scan":         "scan 2s ease-in-out infinite",
      },
      keyframes: {
        fadeIn:  { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp: { from: { opacity: 0, transform: "translateY(20px)" }, to: { opacity: 1, transform: "translateY(0)" } },
        scan:    {
          "0%":   { top: "0%" },
          "50%":  { top: "90%" },
          "100%": { top: "0%" },
        },
      },
      backgroundImage: {
        "grid-pattern": "linear-gradient(rgba(14,165,233,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(14,165,233,0.05) 1px, transparent 1px)",
        "hero-glow":    "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(14,165,233,0.15), transparent)",
      },
      backgroundSize: {
        "grid": "40px 40px",
      },
    },
  },
  plugins: [],
};
