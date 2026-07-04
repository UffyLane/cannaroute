/**
 * ESLint configuration — CannaRoute monorepo
 *
 * Applies to all TypeScript files across all 7 backend services and the shared package.
 * Each service can extend this root config or override specific rules as needed.
 *
 * To lint a specific service:
 *   cd backend/services/auth && npx eslint "src/**/*.ts"
 *
 * To lint everything from the root:
 *   npx eslint "backend/**/*.ts" --ignore-pattern "**/*.d.ts" --ignore-pattern "**/dist/**"
 */

module.exports = {
  root: true,
  env: {
    node: true,
    jest: true,
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
    tsconfigRootDir: __dirname,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint/eslint-plugin'],
  extends: [
    'plugin:@typescript-eslint/recommended',
  ],
  ignorePatterns: [
    'dist/',
    'node_modules/',
    '*.js',           // ignore transpiled output and config files at root
    '**/*.d.ts',
    'coverage/',
  ],
  rules: {
    // ─── TypeScript ──────────────────────────────────────────────────────────
    '@typescript-eslint/no-explicit-any': 'error',          // no `any` — use proper types
    '@typescript-eslint/no-unused-vars': ['error', {
      argsIgnorePattern: '^_',                              // allow _unused params
      varsIgnorePattern: '^_',
    }],
    '@typescript-eslint/explicit-function-return-type': 'off',  // inferred is fine in services
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-floating-promises': 'error',     // must await or .catch() promises
    '@typescript-eslint/no-misused-promises': 'error',

    // ─── General quality ─────────────────────────────────────────────────────
    'no-console': 'warn',        // use NestJS Logger, not console.log
    'no-debugger': 'error',
    'eqeqeq': ['error', 'always'],
    'no-var': 'error',
    'prefer-const': 'error',

    // ─── Relaxed for NestJS patterns ─────────────────────────────────────────
    '@typescript-eslint/no-empty-function': 'warn',         // NestJS stubs are common
    '@typescript-eslint/ban-types': 'warn',
  },
};
