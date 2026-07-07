/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0faf4',
          100: '#dcf4e6',
          200: '#bbe8cf',
          300: '#88d4ae',
          400: '#52b887',
          500: '#2d9a68',
          600: '#1e7d52',
          700: '#196543',
          800: '#175137',
          900: '#0f4c35',
          950: '#082b1e',
        },
        accent: {
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
        },
      },
      fontFamily: {
        sans: ['System'],
      },
    },
  },
  plugins: [],
};
