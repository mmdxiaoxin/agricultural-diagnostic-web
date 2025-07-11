import { resolve } from "path";
import { ConfigEnv, defineConfig, loadEnv, UserConfig } from "vite";
import { wrapperEnv } from "./src/build/getEnv";
import { createVitePlugins } from "./src/build/plugins";

// https://vite.dev/config/
export default defineConfig((mode: ConfigEnv): UserConfig => {
	const env = loadEnv(mode.mode, process.cwd());
	const viteEnv = wrapperEnv(env);
	const isDev = mode.mode === "development";

	return {
		resolve: {
			alias: {
				"@": resolve(__dirname, "./src")
			}
		},
		server: {
			host: "0.0.0.0",
			port: viteEnv.VITE_PORT,
			open: viteEnv.VITE_OPEN,
			cors: true,
			proxy: {
				"/api": {
					target: "http://localhost:3000",
					changeOrigin: true,
					rewrite: path => path.replace(/^\/api/, "")
				}
			}
		},
		plugins: createVitePlugins(viteEnv, isDev),
		esbuild: {
			treeShaking: true,
			drop: viteEnv.VITE_DROP_CONSOLE ? ["debugger", "console"] : []
		},
		optimizeDeps: {
			include: [
				"spark-md5",
				"react",
				"react-dom",
				"react-router",
				"@reduxjs/toolkit",
				"react-redux",
				"redux-persist",
				"echarts",
				"@dnd-kit/core",
				"@dnd-kit/sortable",
				"@dnd-kit/utilities",
				"@dnd-kit/modifiers",
				"@dnd-kit/accessibility"
			],
			exclude: ["@monaco-editor/react", "jspdf", "html2canvas"]
		},
		build: {
			outDir: "dist",
			minify: "esbuild",
			sourcemap: false,
			cssCodeSplit: true,
			reportCompressedSize: true,
			chunkSizeWarningLimit: 1500,
			rollupOptions: {
				output: {
					entryFileNames: "assets/js/[name]-[hash].js",
					assetFileNames: "assets/[ext]/[name]-[hash].[ext]",
					chunkFileNames: chunkInfo => {
						const id = chunkInfo.facadeModuleId;
						if (id?.includes("node_modules")) {
							return "assets/js/vendor/[name]-[hash].js";
						} else if (id?.includes("/components/")) {
							return "assets/js/components/[name]-[hash].js";
						} else if (id?.includes("/views/")) {
							return "assets/js/views/[name]-[hash].js";
						} else {
							return "assets/js/[name]-[hash].js";
						}
					}
				}
			}
		},
		worker: {
			format: "es",
			plugins: () => []
		}
	};
});
