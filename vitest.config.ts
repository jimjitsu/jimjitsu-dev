import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
    setupFiles: ["./vitest.setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      // Scope coverage to the testable non-component surface (lib + API route).
      // Component/client behavior is covered by Playwright e2e instead.
      include: ["src/lib/**", "src/app/api/**"],
    },
  },
});
