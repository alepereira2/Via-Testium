/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        parchment: {
          50: '#fdfbf7',
          100: '#f7f2e7',
          200: '#eee3cd',
          300: '#e1cea9',
          400: '#d0b37e',
          500: '#c09858',
          600: '#b18147',
          700: '#93653b',
          800: '#785135',
          900: '#62432e',
        },
        imperial: {
          red: '#8b1e1e',
          crimson: '#651212',
          gold: '#d4af37',
          darkgold: '#997d1e',
        },
        stonebg: {
          950: '#0c0a09',
          900: '#1c1917',
          800: '#292524',
          700: '#44403c',
        }
      },
      fontFamily: {
        serif: ['Cinzel', 'Georgia', 'Cambria', 'serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
