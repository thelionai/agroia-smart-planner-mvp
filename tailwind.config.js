/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // ── AgroTech futuristic palette ─────────────────────────
        agro: {
          navy: '#0A0F1E', // App background
          dark: '#0D1428', // Card background
          panel: '#111827', // Panel
          border: '#1a2a4a', // Borders
          green: '#00FF87', // Cyber green accent
          primary: '#00FF87', // From mockup
          secondary: '#00d1ff', // From mockup
          greenDim: '#00cc6a', // Dimmer green
          blue: '#0066FF', // Bio blue
          blueDim: '#004acc', // Dimmer blue
          teal: '#00C9FF', // Teal accent
          gold: '#FFD700', // Warning / lunar
          red: '#FF4444', // Alert / danger
          orange: '#FF8800', // Moderate risk
          text: '#E2E8F0', // Primary text
          muted: '#64748B', // Secondary text
          glass: 'rgba(255,255,255,0.05)',  // Glass card background
          glassBorder: 'rgba(255,255,255,0.10)',
        },
        // ── Keep Andean for backwards compat ────────────────────
        andean: {
          earth: '#8B5A2B',
          clay: '#D27D2D',
          sky: '#0077BE',
          azure: '#006994',
          maize: '#FFCB00',
          gold: '#FFD700',
          foliage: '#4F7942',
          moss: '#8A9A5B',
          stone: '#595959',
          wool: '#F5F5DC',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['"Space Grotesk"', 'Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'agro-radial': 'radial-gradient(ellipse at top left, #0D2040 0%, #0A0F1E 60%)',
        'agro-hero': 'linear-gradient(135deg, #0D2040 0%, #001a33 50%, #0A0F1E 100%)',
        'green-glow': 'linear-gradient(135deg, #00FF87, #00cc6a)',
        'blue-glow': 'linear-gradient(135deg, #0066FF, #00C9FF)',
        'gold-glow': 'linear-gradient(135deg, #FFD700, #FF8800)',
      },
      boxShadow: {
        'green-glow': '0 0 20px rgba(0,255,135,0.25)',
        'blue-glow': '0 0 20px rgba(0,102,255,0.25)',
        'glass': '0 4px 16px rgba(0,0,0,0.4)',
        'glass-lg': '0 8px 32px rgba(0,0,0,0.5)',
      },
      keyframes: {
        'fade-slide-up': {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 8px rgba(0,255,135,0.3)' },
          '50%': { boxShadow: '0 0 24px rgba(0,255,135,0.7)' },
        },
        'bar-fill': {
          '0%': { width: '0%' },
          '100%': { width: 'var(--bar-width)' },
        },
        'spin-slow': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        'dot-pulse': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.3' },
        },
      },
      animation: {
        'fade-slide-up': 'fade-slide-up 0.4s ease-out both',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'spin-slow': 'spin-slow 8s linear infinite',
        'dot-pulse': 'dot-pulse 1.5s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}