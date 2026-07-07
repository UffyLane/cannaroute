module.exports = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0faf4',
          100: '#dcf4e6',
          500: '#2d9a68',
          700: '#196543',
          800: '#175137',
          900: '#0f4c35',
        },
        accent: { 500: '#f59e0b' },
      },
    },
  },
  plugins: [],
};
