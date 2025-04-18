import react from "@vitejs/plugin-react-swc";
import { resolve } from "path";
import { visualizer } from "rollup-plugin-visualizer";
import { ConfigEnv, defineConfig, loadEnv, UserConfig } from "vite";
import viteCompression from "vite-plugin-compression";
import { createHtmlPlugin } from "vite-plugin-html";
import viteImagemin from "vite-plugin-imagemin";
import svgr from "vite-plugin-svgr";
import { wrapperEnv } from "./src/build/getEnv";

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
					target: "http://localhost:3000/api",
					changeOrigin: true,
					rewrite: path => path.replace(/^\/api/, "")
				}
			}
		},
		plugins: [
			react(),
			svgr({ svgrOptions: { icon: true } }),
			createHtmlPlugin({
				inject: {
					data: {
						title: viteEnv.VITE_GLOB_APP_TITLE
					}
				}
			}),
			viteCompression({
				verbose: true,
				disable: false,
				threshold: 10240,
				algorithm: "gzip",
				ext: ".gz"
			}),
			viteImagemin({
				gifsicle: {
					optimizationLevel: 7,
					interlaced: false
				},
				optipng: {
					optimizationLevel: 7
				},
				mozjpeg: {
					quality: 75,
					progressive: true
				},
				pngquant: {
					quality: [0.65, 0.8],
					speed: 4
				},
				svgo: {
					plugins: [
						{
							name: "removeViewBox"
						},
						{
							name: "removeEmptyAttrs",
							active: false
						}
					]
				}
			}),
			!isDev &&
				visualizer({
					open: true,
					gzipSize: true,
					brotliSize: true,
					filename: "dist/stats.html"
				})
		].filter(Boolean),
		esbuild: {
			treeShaking: true,
			drop: viteEnv.VITE_DROP_CONSOLE ? ["debugger", "console"] : []
		},
		optimizeDeps: {
			include: [
				"spark-md5",
				"monaco-editor",
				"react",
				"react-dom",
				"react-router",
				"antd",
				"@ant-design/icons"
			]
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
					chunkFileNames: "assets/js/[name]-[hash].js",
					entryFileNames: "assets/js/[name]-[hash].js",
					assetFileNames: "assets/[ext]/[name]-[hash].[ext]",
					manualChunks: {
						monaco: ["monaco-editor"],
						vendor: ["react", "react-dom", "react-router"],
						antd: ["antd", "@ant-design/icons"]
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
