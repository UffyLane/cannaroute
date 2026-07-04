// CannaRoute brand palette — single source of truth for all color usage.
// Keep in sync with tailwind.config.js.

export const Colors = {
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
    900: '#0f4c35',   // primary dark green
    950: '#082b1e',
  },
  accent: {
    400: '#fbbf24',
    500: '#f59e0b',   // amber — CTAs, badges
    600: '#d97706',
  },
  neutral: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#e5e5e5',
    300: '#d4d4d4',
    400: '#a3a3a3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
  },
  status: {
    success: '#22c55e',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',
  },
  ui: {
    background: '#fafafa',
    surface: '#ffffff',
    border: '#e5e5e5',
    placeholder: '#a3a3a3',
    text: {
      primary: '#171717',
      secondary: '#525252',
      disabled: '#a3a3a3',
      inverse: '#ffffff',
    },
  },
} as const;

export type BrandColor = keyof typeof Colors.brand;
