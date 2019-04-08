module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:vue/recommended'
  ],
  plugins: ['vue'],
  env: {
    /** enable support for es6 global */
    es6: true,
    browser: true,
    webextensions: true,
  },
  parserOptions: {
    parser: 'babel-eslint',
    ecmaVersion: 2018,
    /** modularized code */
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
      spread: true,
      legacyDecorators: true
    },
  },
  rules: {
    semi: ['warn'],
    'no-console': ['error', { allow: ['warn', 'error'] }],
    quotes: ['warn', 'single'],
    indent: ['error', 2],
  },
};
