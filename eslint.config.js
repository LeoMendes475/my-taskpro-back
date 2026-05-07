const tseslint = require("typescript-eslint")
const globals = require("globals")

module.exports = tseslint.config(
  { ignores: ["dist/**", "coverage/**"] },
  {
    files: ["src/**/*.ts"],
    plugins: {
      "@typescript-eslint": tseslint.plugin,
    },
    languageOptions: {
      parser: tseslint.parser,
      globals: {
        ...globals.node,
      },
    },
    rules: {
      "quotes": ["error", "double"],
      "semi": ["error", "always"],
      "indent": ["error", 2, { "SwitchCase": 1 }],
    },
  }
)
