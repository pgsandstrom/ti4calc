import { defineConfig } from "oxlint"

export default defineConfig({
  plugins: ["typescript", "react", "nextjs"],
  // for rules oxlint has no native version of
  jsPlugins: ["eslint-plugin-no-only-tests", "./oxlint/local-plugin.ts"],
  // correctness flags code that is outright wrong or useless; everything else is opted into below
  categories: {
    correctness: "error",
  },
  options: {
    typeAware: true,
    maxWarnings: 0,
    reportUnusedDisableDirectives: "error",
    respectEslintDisableDirectives: false,
  },
  ignorePatterns: [".next", "next-env.d.ts"],
  rules: {
    // JavaScript
    curly: "error",
    eqeqeq: ["error", "smart"],
    "no-array-constructor": "error",
    "no-case-declarations": "error",
    "no-console": ["error", { allow: ["warn", "error"] }],
    "no-empty": "error",
    "no-prototype-builtins": "error",
    "no-regex-spaces": "error",
    "no-restricted-imports": [
      "error",
      {
        paths: [
          {
            name: "next/router",
            message: "This project uses the app router. Import from next/navigation.",
          },
        ],
      },
    ],
    // require `window.close()` etc., so a stray `close()` can't slip through
    "no-restricted-globals": [
      "error",
      "alert",
      "blur",
      "close",
      "confirm",
      "event",
      "focus",
      "open",
      "scroll",
      "scrollBy",
      "scrollTo",
      "stop",
    ],
    "no-unexpected-multiline": "error",
    "no-unused-vars": [
      "error",
      {
        args: "none",
        caughtErrors: "all",
        caughtErrorsIgnorePattern: "^_",
        destructuredArrayIgnorePattern: "^_",
        varsIgnorePattern: "^_",
        ignoreRestSiblings: true,
        fix: { imports: "fix", variables: "suggestion" },
      },
    ],
    "no-useless-assignment": "error",
    "no-useless-constructor": "error",
    "no-var": "error",
    "prefer-const": "error",
    "prefer-rest-params": "error",
    "prefer-spread": "error",
    "preserve-caught-error": "error",

    // TypeScript
    "typescript/ban-ts-comment": ["error", { minimumDescriptionLength: 10 }],
    // allow `() => doSomething()` even when doSomething returns void
    "typescript/no-confusing-void-expression": ["error", { ignoreArrowShorthand: true }],
    "typescript/no-dynamic-delete": "error",
    "typescript/no-empty-object-type": "error",
    "typescript/no-extraneous-class": "error",
    // allow async functions as callbacks and event handlers
    "typescript/no-misused-promises": [
      "error",
      { checksVoidReturn: { arguments: false, attributes: false, returns: false } },
    ],
    "typescript/no-non-null-asserted-nullish-coalescing": "error",
    "typescript/no-require-imports": "error",
    "typescript/no-unnecessary-condition": "error",
    "typescript/no-unnecessary-template-expression": "error",
    "typescript/no-unnecessary-type-arguments": "error",
    "typescript/no-unnecessary-type-assertion": "error",
    "typescript/no-unnecessary-type-constraint": "error",
    "typescript/no-unnecessary-type-conversion": "error",
    "typescript/no-unnecessary-type-parameters": "error",
    // no-explicit-any and no-unsafe-argument/assignment/member-access/return stay off: they suit
    // small projects that can avoid `any`, not this one
    "typescript/no-unsafe-call": "error",
    "typescript/no-unsafe-function-type": "error",
    "typescript/only-throw-error": "error",
    // `||` for boolean logic, `??` for missing data. Ignoring mixed expressions skips most boolean logic.
    "typescript/prefer-enum-initializers": "error",
    "typescript/prefer-nullish-coalescing": ["error", { ignoreMixedLogicalExpressions: true }],
    "typescript/prefer-promise-reject-errors": "error",
    "typescript/prefer-reduce-type-parameter": "error",
    "typescript/prefer-return-this-type": "error",
    "typescript/related-getter-setter-pairs": "error",
    "typescript/require-await": "error",
    "typescript/return-await": ["error", "error-handling-correctness-only"],
    "typescript/strict-boolean-expressions": ["error", { allowNullableBoolean: true }],
    "typescript/unified-signatures": "error",
    "typescript/use-unknown-in-catch-callback-variable": "error",

    // React
    "react/iframe-missing-sandbox": "error",
    "react/jsx-curly-brace-presence": ["error", { propElementValues: "always" }],
    "react/jsx-key": ["error", { checkKeyMustBeforeSpread: true }],
    "react/jsx-no-comment-textnodes": "error",
    "react/jsx-no-script-url": "error",
    "react/no-clone-element": "error",
    "react/no-danger": "error",
    "react/no-namespace": "error",
    "react/no-react-children": "error",
    "react/no-unsafe": ["error", { checkAliases: true }],
    // render callbacks passed as props are fine
    "react/no-unstable-nested-components": ["error", { allowAsProps: true }],
    "react/rules-of-hooks": "error",
    "react/unsupported-syntax": "error",

    // JS plugins
    "local/no-empty-object-assertion": "error",
    "local/no-raw-object-keys-entries": "error",
    "no-only-tests/no-only-tests": "error",
  },
  overrides: [
    {
      // node:test's `test()` and `describe()` return promises nobody needs to await
      files: ["**/*.test.ts"],
      rules: {
        "typescript/no-floating-promises": "off",
      },
    },
    {
      // scripts and config is allowed to print
      files: ["scripts/**", "oxlint/**", "*.config.ts"],
      rules: {
        "no-console": "off",
      },
    },
  ],
})
