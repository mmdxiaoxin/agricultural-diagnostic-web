import legacy from "@vitejs/plugin-legacy";
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
				minify: true,
				template: "index.html",
				inject: {
					data: {
						title: viteEnv.VITE_GLOB_APP_TITLE
					},
					tags: [
						{
							injectTo: "head",
							tag: "meta",
							attrs: {
								name: "description",
								content: "农业诊断系统"
							}
						},
						{
							injectTo: "head",
							tag: "meta",
							attrs: {
								name: "keywords",
								content: "农业,诊断,系统"
							}
						},
						{
							injectTo: "head",
							tag: "meta",
							attrs: {
								name: "author",
								content: "mmdxiaoxin"
							}
						},
						{
							injectTo: "head",
							tag: "meta",
							attrs: {
								name: "mobile-web-app-capable",
								content: "yes"
							}
						},
						{
							injectTo: "head",
							tag: "meta",
							attrs: {
								name: "apple-mobile-web-app-status-bar-style",
								content: "black"
							}
						},
						{
							injectTo: "head",
							tag: "meta",
							attrs: {
								name: "format-detection",
								content: "telephone=no"
							}
						},
						{
							injectTo: "head",
							tag: "meta",
							attrs: {
								"http-equiv": "Content-Language",
								content: "zh-CN"
							}
						},
						{
							injectTo: "head",
							tag: "meta",
							attrs: {
								"http-equiv": "Content-Type",
								content: "text/html; charset=utf-8"
							}
						}
					]
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
				svgo: {
					plugins: [
						{
							name: "removeViewBox"
						},
						{
							name: "removeEmptyAttrs",
							active: false
						},
						{
							name: "removeComments"
						},
						{
							name: "removeDesc"
						},
						{
							name: "removeTitle"
						},
						{
							name: "removeDoctype"
						},
						{
							name: "removeXMLProcInst"
						},
						{
							name: "removeMetadata"
						},
						{
							name: "removeEditorsNSData"
						},
						{
							name: "cleanupAttrs"
						},
						{
							name: "mergeStyles"
						},
						{
							name: "inlineStyles"
						},
						{
							name: "minifyStyles"
						},
						{
							name: "cleanupIDs"
						},
						{
							name: "removeUselessDefs"
						},
						{
							name: "cleanupNumericValues"
						},
						{
							name: "convertColors"
						},
						{
							name: "removeUnknownsAndDefaults"
						},
						{
							name: "removeNonInheritableGroupAttrs"
						},
						{
							name: "removeUselessStrokeAndFill"
						},
						{
							name: "removeViewBox"
						},
						{
							name: "cleanupEnableBackground"
						},
						{
							name: "removeHiddenElems"
						},
						{
							name: "removeEmptyText"
						},
						{
							name: "convertShapeToPath"
						},
						{
							name: "convertEllipseToCircle"
						},
						{
							name: "moveElemsAttrsToGroup"
						},
						{
							name: "moveGroupAttrsToElems"
						},
						{
							name: "collapseGroups"
						},
						{
							name: "convertPathData"
						},
						{
							name: "convertTransform"
						},
						{
							name: "removeEmptyAttrs"
						},
						{
							name: "removeEmptyContainers"
						},
						{
							name: "mergePaths"
						},
						{
							name: "removeUnusedNS"
						},
						{
							name: "sortAttrs"
						},
						{
							name: "removeTitle"
						},
						{
							name: "removeDesc"
						},
						{
							name: "removeDimensions"
						},
						{
							name: "removeAttrs"
						},
						{
							name: "removeElementsByAttr"
						},
						{
							name: "addClassesToSVGElement"
						},
						{
							name: "removeStyleElement"
						},
						{
							name: "removeScriptElement"
						}
					]
				}
			}),
			!isDev &&
				legacy({
					targets: [
						"> 1%", // 全球使用率超过1%的浏览器
						"last 2 versions", // 所有浏览器的最后两个版本
						"not dead", // 排除已停止更新的浏览器
						"not ie 11", // 排除 IE 11
						"not op_mini all" // 排除 Opera Mini
					],
					modernPolyfills: true, // 为现代浏览器提供必要的 polyfills
					renderLegacyChunks: true // 为旧版浏览器生成单独的 chunk
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
			exclude: ["monaco-editor", "@monaco-editor/react", "jspdf", "html2canvas"]
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
					manualChunks: {
						// React 核心
						vendor: ["react", "react-dom", "react-router"],
						// Redux 相关
						redux: ["@reduxjs/toolkit", "react-redux", "redux-persist"],
						// DnD Kit 相关
						dnd: [
							"@dnd-kit/core",
							"@dnd-kit/sortable",
							"@dnd-kit/utilities",
							"@dnd-kit/modifiers",
							"@dnd-kit/accessibility"
						],
						// 图表相关
						charts: ["echarts"],
						// 工具库
						utils: ["dayjs", "qs", "spark-md5"]
					},
					// 自动分包配置
					chunkFileNames: chunkInfo => {
						const id = chunkInfo.name;
						if (id?.includes("node_modules")) {
							return "assets/js/vendor/[name]-[hash].js";
						} else if (id?.includes("src/components")) {
							return "assets/js/components/[name]-[hash].js";
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
