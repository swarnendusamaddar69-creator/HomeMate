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
        brand: {
          50: '#f0fdf4',
          100: '#dcfce7',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
        },
        elder: {
          amber: '#f59e0b',
          bg: '#fffbeb',
          text: '#1c1917',
          card: '#fef3c7',
        }
      },
      fontSize: {
        'elder-base': '1.25rem',
        'elder-lg': '1.5rem',
        'elder-xl': '1.875rem',
        'elder-2xl': '2.25rem',
      }
    },
  },
  plugins: [],
}
