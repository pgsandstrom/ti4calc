module.exports = {
  env: {
    browser: true,
    es6: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime', // disable rules not needed with jsx runtime
    'plugin:react-hooks/recommended',
    'plugin:@typescript-eslint/recommended-type-checked',

    'plugin:@next/next/recommended',
    'prettier',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2021,
    ecmaFeatures: {
      jsx: true,
    },
    project: ['./tsconfig.json'],
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint', 'react-hooks', 'no-only-tests'],
  rules: {
    // turn off unwanted rules:
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-non-null-assertion': 'off',
    'react/display-name': 'off', // Complains about functions in strings-file that returns jsx
    'react/prop-types': 'off', // unnecessary with typescript
    '@typescript-eslint/restrict-template-expressions': 'off', // this feels too verbose
    '@typescript-eslint/no-inferrable-types': 'off', // this brings very little value
    '@typescript-eslint/no-unsafe-enum-comparison': 'off',
    '@typescript-eslint/no-redundant-type-constituents': 'off', //Complains when we have type unknown

    // activate extra rules:
    eqeqeq: ['error', 'smart'],
    curly: ['error'],
    // 'no-console': ['error', { allow: ['warn', 'error'] }],
    '@typescript-eslint/no-unnecessary-type-assertion': ['error'],
    '@typescript-eslint/no-extra-non-null-assertion': ['error'],
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        vars: 'all',
        args: 'none',
      },
    ],
    '@typescript-eslint/strict-boolean-expressions': [
      'error',
      {
        allowNullableBoolean: true,
      },
    ],
    'no-restricted-imports': [
      'error',
      {
        paths: [
          {
            name: 'react-router',
            message: 'Please import from react-router-dom',
          },
        ],
      },
    ],
    '@typescript-eslint/prefer-enum-initializers': ['error'],
    'no-only-tests/no-only-tests': 'error',
    'sort-imports': [
      'error',
      {
        ignoreDeclarationSort: true, // disabled since it does not have a '--fix' option
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
    '@typescript-eslint/no-unnecessary-condition': ['error'],
    '@typescript-eslint/prefer-ts-expect-error': ['error'],
    'react/jsx-curly-brace-presence': ['error'],
    '@typescript-eslint/no-useless-template-literals': ['error'],
    '@typescript-eslint/prefer-reduce-type-parameter': ['error'],
    '@typescript-eslint/no-meaningless-void-operator': ['error'],
    '@typescript-eslint/no-invalid-void-type': ['error'],
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
  ignorePatterns: [
    '.eslintrc.js',
    '*.config.js',
    '*.json',
    '*.local',
    '*.sql',
    '*.sh',
    '*.md',
    '*.tsbuildinfo',
  ],
}
