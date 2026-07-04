import type { Config } from 'tailwindcss';
const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0faf4', 100: '#dcf4e6', 500: '#2d9a68',
          700: '#196543', 800: '#175137', 900: '#0f4c35', 950: '#082b1e',
        },
        accent: { 500: '#f59e0b' },
      },
      fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'] },
    },
  },
  plugins: [],
};
export default config;
