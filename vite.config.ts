import react from "@vitejs/plugin-react-swc";
import { resolve } from "path";
import { ConfigEnv, defineConfig, loadEnv, UserConfig } from "vite";
import { createHtmlPlugin } from "vite-plugin-html";
import viteCompression from "vite-plugin-compression";
import viteImagemin from "vite-plugin-imagemin";
import { wrapperEnv } from "./src/build/getEnv";
import svgr from "vite-plugin-svgr";

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
					quality: 20
				},
				pngquant: {
					quality: [0.8, 0.9],
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
			})
		],
		esbuild: {
			treeShaking: true,
			drop: viteEnv.VITE_DROP_CONSOLE ? ["debugger", "console"] : []
		},
		optimizeDeps: {
			include: ["spark-md5", "jspdf"]
		},
		build: {
			outDir: "dist",
			minify: "esbuild",
			rollupOptions: {
				output: {
					chunkFileNames: "assets/js/[name]-[hash].js",
					entryFileNames: "assets/js/[name]-[hash].js",
					assetFileNames: "assets/[ext]/[name]-[hash].[ext]"
				}
			}
		},
		worker: {
			format: "es"
		}
	};
});
