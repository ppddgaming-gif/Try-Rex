import { defineConfig, globalIgnores } from "eslint/config"
import nextVitals from "eslint-config-next/core-web-vitals"
import nextTs from "eslint-config-next/typescript"

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([
    // Defaults of eslint-config-next, restated because this list overrides them.
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Vendored upstream source; only read by scripts/generate-game-data.mjs.
    "Game-data-main/**",
    // Generated. Regenerate instead of editing.
    "lib/game-data.ts",
  ]),
])

export default eslintConfig
