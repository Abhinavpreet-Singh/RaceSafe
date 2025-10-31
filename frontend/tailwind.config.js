/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "blood-red": "#E10600",
        "blood-red-dark": "#B00500",
        "blood-red-light": "#FF0700",
      },
      fontFamily: {
        heading: ["Orbitron", "monospace"],
        body: ["Rajdhani", "sans-serif"],
      },
      animation: {
        "pulse-subtle": "pulse-subtle 2s ease-in-out infinite",
        "fade-in": "fade-in 0.3s ease-out",
      },
      keyframes: {
        "pulse-subtle": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.8" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
      boxShadow: {
        "red-glow": "0 0 8px rgba(225, 6, 0, 0.5)",
        "red-glow-strong":
          "0 0 10px rgba(225, 6, 0, 0.7), 0 0 20px rgba(225, 6, 0, 0.4)",
      },
    },
  },
  plugins: [],
};
