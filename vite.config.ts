import react from "@vitejs/plugin-react-swc";
import { resolve } from "path";
import { ConfigEnv, defineConfig, loadEnv, UserConfig } from "vite";
import { createHtmlPlugin } from "vite-plugin-html";
import { wrapperEnv } from "./src/build/getEnv";

// https://vite.dev/config/
export default defineConfig((mode: ConfigEnv): UserConfig => {
	const env = loadEnv(mode.mode, process.cwd());
	const viteEnv = wrapperEnv(env);

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
					target: "http://localhost:5000/api",
					changeOrigin: true,
					rewrite: path => path.replace(/^\/api/, "")
				}
			}
		},
		plugins: [
			react(),
			createHtmlPlugin({
				inject: {
					data: {
						title: viteEnv.VITE_GLOB_APP_TITLE
					}
				}
			})
		],
		esbuild: {
			treeShaking: true,
			drop: viteEnv.VITE_DROP_CONSOLE ? ["debugger", "console"] : []
		},
		optimizeDeps: {
			include: ["spark-md5"]
		},
		build: {
			outDir: "dist",
			// esbuild 打包更快，但是不能去除 console.log，去除 console 使用 terser 模式
			minify: "esbuild",
			// minify: "terser",
			// terserOptions: {
			// 	compress: {
			// 		drop_console: viteEnv.VITE_DROP_CONSOLE,
			// 		drop_debugger: true
			// 	}
			// },
			rollupOptions: {
				output: {
					chunkFileNames: "assets/js/[name]-[hash].js",
					entryFileNames: "assets/js/[name]-[hash].js",
					assetFileNames: "assets/[ext]/[name]-[hash].[ext]"
				}
			}
		}
	};
});
