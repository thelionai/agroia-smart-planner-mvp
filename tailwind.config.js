/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        andean: {
          earth: '#8B5A2B', // Terracotta/Earth
          clay: '#D27D2D',  // Lighter earth
          sky: '#0077BE',   // Clear Andean sky
          azure: '#006994', // Deep water/sky
          maize: '#FFCB00', // Corn/Sun
          gold: '#FFD700',  // Inca Gold
          foliage: '#4F7942', // Coca/Crop green
          moss: '#8A9A5B',    // High altitude green
          stone: '#595959',   // Inca stone
          wool: '#F5F5DC',    // Alpaca wool (off-white)
        }
      },
      fontFamily: {
        sans: ['Inter', 'Roboto', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}