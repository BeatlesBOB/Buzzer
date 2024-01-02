/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    fontFamily: {
      primary: ["Poppins", "sans-serif"],
    },
    extend: {
      dropShadow: {
        "3xl": "-24px 12px 0px #000000",
      },
    },
  },
  plugins: [],
};
