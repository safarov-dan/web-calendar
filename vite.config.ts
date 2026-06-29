import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
	plugins: [react(), tailwindcss()],
	resolve: {
		alias: {
			"@ui": fileURLToPath(
				new URL("./node_modules/@safarov-dan/ui-library/src", import.meta.url),
			),
			react: fileURLToPath(new URL("./node_modules/react", import.meta.url)),
			"react-dom": fileURLToPath(new URL("./node_modules/react-dom", import.meta.url)),
			"react/jsx-runtime": fileURLToPath(
				new URL("./node_modules/react/jsx-runtime.js", import.meta.url),
			),
		},
		dedupe: ["react", "react-dom"],
	},
	test: {
		globals: true,
		environment: "jsdom",
		setupFiles: "./src/test/setup.ts",
	},
});
