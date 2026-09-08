/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#f22222",
          dark: "#c81c1c",
          light: "#fde5e2",
        },
        forest: {
          DEFAULT: "#096338",
          dark: "#074a2a",
          light: "#e5f2ea",
        },
        cream: "#faf3ea",
      },
      fontFamily: {
        heading: ["Sora", "sans-serif"],
        sans: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
};
