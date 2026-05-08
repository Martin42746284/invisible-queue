/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{ts,tsx}", "./App.tsx"],
  theme: {
    extend: {
      colors: {
        bg: "#0B1220",
        surface: "#111827",
        primary: "#6366F1",
        primaryDark: "#4F46E5",
        accent: "#22D3EE",
        muted: "#94A3B8",
        danger: "#EF4444",
        success: "#10B981",
        warning: "#F59E0B",
        border: "#1F2937",
      },
    },
  },
  plugins: [],
};