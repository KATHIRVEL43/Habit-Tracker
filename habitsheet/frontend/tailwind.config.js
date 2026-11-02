/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        plum: {
          50: '#FDF7FA',
          100: '#FBF0F5',
          200: '#F5DEEA',
          300: '#ECC0D5',
          400: '#DB94B8',
          500: '#C46495',
          600: '#9D3364',
          700: '#8D2D5B', // Primary plum from reference
          800: '#75254B',
          900: '#62203F',
        },
        rosepink: {
          50: '#FFF7FB',
          100: '#FEEDF5',
          200: '#FCD8E8',
          300: '#F9B7D4',
          400: '#F3A8C7', // Pink checkbox border & fill
          500: '#EE78A7', // Pink chart line & dots
          600: '#D95286',
        },
        lavender: {
          100: '#F1ECF5',
          200: '#E4DAEC',
          300: '#DFD2E6', // Table summary bar background
          400: '#D7C7E1', // Donut track
        }
      },
      fontFamily: {
        cursive: ['Dancing Script', 'Caveat', 'cursive'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['Roboto Mono', 'monospace'],
      }
    },
  },
  plugins: [],
}
