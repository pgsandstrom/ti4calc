module.exports = {
  env: {
    browser: true,
    es6: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
    'plugin:@next/next/recommended',
    'prettier',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2017,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
      generators: false,
      experimentalObjectRestSpread: true,
    },
    project: './tsconfig.json',
  },
  plugins: ['@typescript-eslint', 'react-hooks'],
  rules: {
    // turn off unwanted rules:
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-non-null-assertion': 'off',
    '@typescript-eslint/no-inferrable-types': 'off', // I dont feel as if this makes the code much cleaner

    // activate extra rules:
    eqeqeq: ['error', 'smart'],
    curly: ['error'],
    '@typescript-eslint/no-unnecessary-type-assertion': ['error'],
    '@typescript-eslint/no-extra-non-null-assertion': ['error'],
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        vars: 'all',
        args: 'none',
      },
    ],
    '@typescript-eslint/no-unnecessary-condition': ['error'],
    '@typescript-eslint/strict-boolean-expressions': [
      'error',
      {
        allowNullableBoolean: true,
      },
    ],
    'sort-imports': [
      'error',
      {
        ignoreDeclarationSort: true,
      },
    ],
    '@typescript-eslint/no-misused-promises': [
      'error',
      {
        checksVoidReturn: {
          attributes: false,
        },
      },
    ],

    // here is frontend/backend exclusive rules

    'react/display-name': 'off', // Complains about functions in strings-file that returns jsx
    'react/no-find-dom-node': 'off', // We need to do this with d3
    'react/prop-types': 'off', // unnecessary with typescript
    '@typescript-eslint/no-empty-interface': 'off', // I use this sometimes in the frontend, to have some uniformity between components
    'no-empty-pattern': 'off', // I want to be able to write like this when first creating an interface: const Header = ({}: Props) => {
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'error',
    '@typescript-eslint/restrict-template-expressions': 'off', // in class strings I often write like "foo && 'selected'"
    'react/react-in-jsx-scope': 'off', // not required with react 17
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
}
