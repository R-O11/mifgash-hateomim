export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: '#2E1A12',
          gold: '#C89B3C',
          light: '#F5F5F5',
          cta: '#D84315',
        }
      },
      fontFamily: {
        sans: ['Heebo', 'Segoe UI', 'Tahoma', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
