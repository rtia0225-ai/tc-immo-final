/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Couleurs du logo — inchangées
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
        // Nouvelle palette neutre — plus sobre, moins "IA générative"
        ink: "#1c1d1a",       // noir chaud, jamais du #000 pur
        stone: "#f2f1ec",     // fond, gris-pierre plutôt que crème
        line: "#dcd9d0",      // lignes fines de séparation
        clay: "#a24928",      // accent secondaire, terre ocre ivoirienne
      },
      fontFamily: {
        heading: ["'Lora'", "serif"],
        sans: ["'Inter'", "sans-serif"],
      },
      borderRadius: {
        DEFAULT: "3px",
        sm: "2px",
        md: "4px",
        lg: "6px",
        xl: "8px",
        "2xl": "10px",
      },
    },
  },
  plugins: [],
};
