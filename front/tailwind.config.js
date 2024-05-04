/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    fontFamily: {
      primary: ["Poppins", "sans-serif"],
    },
    extend: {
      dropShadow: {
        "3xl": "-15px 5px 0px #000000",
      },
      gridTemplateColumns: {
        container:
          "[outer-start] 1fr [outer-padding-start] 20px [inner-padding-start] 20px [content-start] minmax(auto,640px) [half] minmax(auto,640px) [content-end] 20px [inner-padding-end] 20px [outer-padding-end] 1fr [outer-end]",
      },
      gridColumnStart: {
        "outer-start": "outer-start",
        "outer-padding-start": "outer-padding-start",
        "inner-padding-start": "inner-padding-start",
        "content-start": "content-start",
        "outer-end": "outer-end",
        "outer-padding-end": "outer-padding-end",
        "inner-padding-end": "inner-padding-end",
        "content-end": "content-end",
      },
      gridColumnEnd: {
        "outer-start": "outer-start",
        "outer-padding-start": "outer-padding-start",
        "inner-padding-start": "inner-padding-start",
        "content-start": "content-start",
        "outer-end": "outer-end",
        "outer-padding-end": "outer-padding-end",
        "inner-padding-end": "inner-padding-end",
        "content-end": "content-end",
      },
    },
  },
  plugins: [],
};
