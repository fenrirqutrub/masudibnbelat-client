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
        primaryLight: "#E9EBED",
        primaryDark: "#0C0D12",
        textLight: "#0C0D12",
        textDark: "#FFFFFF",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
