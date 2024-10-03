// TODO add "@ts-check" when we have properly migrated to esm modules

import eslint from '@eslint/js'
import tseslint from 'typescript-eslint'
import eslintPluginReactHooks from 'eslint-plugin-react-hooks'
import reactRecommended from 'eslint-plugin-react/configs/recommended.js'

import noOnlyTests from 'eslint-plugin-no-only-tests'
import { fixupPluginRules } from '@eslint/compat'

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.strictTypeChecked,
  // TODO in the future, revisit using next eslint plugin when it supports v9
  reactRecommended,
  {
    // TODO someday I should make a simpler type-less linting for all config files
    ignores: ['jest.config.js', 'next.config.js', 'prettier.config.js', '.next/*'],
  },
  {
    settings: {
      react: {
        version: 'detect',
      },
    },
    languageOptions: {
      parserOptions: {
        project: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      'react-hooks': fixupPluginRules(eslintPluginReactHooks),
      'no-only-tests': fixupPluginRules(noOnlyTests),
    },
    rules: {
      ...eslintPluginReactHooks.configs.recommended.rules,

      // turn off unwanted rules:
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off', // unnecessary with typescript
      '@typescript-eslint/restrict-template-expressions': 'off', // this feels too verbose
      '@typescript-eslint/no-inferrable-types': 'off', // this brings very little value
      '@typescript-eslint/no-unsafe-enum-comparison': 'off',
      '@typescript-eslint/no-redundant-type-constituents': 'off', // complains when we have type unknown

      // these are turned off, but differs from other projects
      '@typescript-eslint/only-throw-error': 'off', // needlessly strict
      '@typescript-eslint/prefer-promise-reject-errors': 'off', // extension of 'only-throw-error' rule
      '@typescript-eslint/no-unnecessary-boolean-literal-compare': 'off', // this is just stylistic and unnecessary

      // activate extra rules:
      'no-only-tests/no-only-tests': 'error',
      eqeqeq: ['error', 'smart'],
      curly: ['error'],
      'no-console': ['error', { allow: ['warn', 'error'] }],
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
      'sort-imports': [
        'error',
        {
          ignoreCase: true,
          ignoreDeclarationSort: true, // disabled since it does not have a '--fix' option
        },
      ],
      'react/jsx-curly-brace-presence': [
        'error',
        {
          propElementValues: 'always',
        },
      ],

      // change config of activated rules
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          vars: 'all',
          args: 'none',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/no-confusing-void-expression': [
        'error',
        {
          // having this active is too verbose
          ignoreArrowShorthand: true,
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

      // this rule would be awesome if it worked properly
      // re-evaluate when this issue has been settled:
      // https://github.com/typescript-eslint/typescript-eslint/issues/8113
      '@typescript-eslint/no-invalid-void-type': ['off'],
    },
  },
)
