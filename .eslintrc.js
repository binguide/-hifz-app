module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  env: {
    es2022: true,
    node: true,
  },
  rules: {
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-require-imports': 'off',
    'no-console': 'warn',
  },
  ignorePatterns: ['node_modules/', 'android/', 'ios/', 'babel.config.js', 'metro.config.js'],
};
