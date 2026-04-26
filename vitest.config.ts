import { defineConfig } from "vitest/config";

/**
 * Standalone vitest config — intentionally does NOT load the TanStack Start
 * plugin (which expects a server/router runtime). Tests target pure functions
 * in `src/lib`, so we only need `#/` path resolution and a node environment.
 */
export default defineConfig({
	resolve: {
		alias: {
			"#": new URL("./src/", import.meta.url).pathname,
		},
	},
	test: {
		environment: "node",
		include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
	},
});
