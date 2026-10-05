import { fileURLToPath } from "node:url"
import { defineConfig } from "vitest/config"

// Unit tests for the pure logic (lib/**). Components aren't tested here.
export default defineConfig({
  resolve: {
    alias: { "@": fileURLToPath(new URL("./", import.meta.url)) },
  },
  test: {
    include: ["lib/**/*.test.ts"],
    environment: "node",
  },
})
