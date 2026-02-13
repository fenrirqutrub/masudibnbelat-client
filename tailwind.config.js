/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "*.{js,ts,jsx,tsx,mdx}",
    "app/**/*.{ts,tsx}",
    "components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bgPrimary: "var(--color-bg)",
        textPrimary: "var(--color-text)",
        textGray: "var(--color-gray)",
        textHover: "var(--color-text-hover)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
