import legacy from "@vitejs/plugin-legacy";
import react from "@vitejs/plugin-react-swc";
import { visualizer } from "rollup-plugin-visualizer";
import viteCompression from "vite-plugin-compression";
import { createHtmlPlugin } from "vite-plugin-html";
import viteImagemin from "vite-plugin-imagemin";
import svgr from "vite-plugin-svgr";

export function createVitePlugins(viteEnv: ViteEnv, isDev: boolean) {
	const { VITE_GLOB_APP_TITLE } = viteEnv;

	return [
		// React 支持
		react(),
		// SVG 组件支持
		svgr({ svgrOptions: { icon: true } }),
		// HTML 模板处理
		createHtmlPlugin({
			minify: true,
			template: "index.html",
			inject: {
				data: {
					title: VITE_GLOB_APP_TITLE
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
		// Gzip 压缩
		viteCompression({
			verbose: true,
			disable: false,
			threshold: 10240,
			algorithm: "gzip",
			ext: ".gz"
		}),
		// SVG 优化
		viteImagemin({
			svgo: {
				plugins: [
					{ name: "removeViewBox" },
					{ name: "removeEmptyAttrs", active: false },
					{ name: "removeComments" },
					{ name: "removeDesc" },
					{ name: "removeTitle" },
					{ name: "removeDoctype" },
					{ name: "removeXMLProcInst" },
					{ name: "removeMetadata" },
					{ name: "removeEditorsNSData" },
					{ name: "cleanupAttrs" },
					{ name: "mergeStyles" },
					{ name: "inlineStyles" },
					{ name: "minifyStyles" },
					{ name: "cleanupIDs" },
					{ name: "removeUselessDefs" },
					{ name: "cleanupNumericValues" },
					{ name: "convertColors" },
					{ name: "removeUnknownsAndDefaults" },
					{ name: "removeNonInheritableGroupAttrs" },
					{ name: "removeUselessStrokeAndFill" },
					{ name: "removeViewBox" },
					{ name: "cleanupEnableBackground" },
					{ name: "removeHiddenElems" },
					{ name: "removeEmptyText" },
					{ name: "convertShapeToPath" },
					{ name: "convertEllipseToCircle" },
					{ name: "moveElemsAttrsToGroup" },
					{ name: "moveGroupAttrsToElems" },
					{ name: "collapseGroups" },
					{ name: "convertPathData" },
					{ name: "convertTransform" },
					{ name: "removeEmptyAttrs" },
					{ name: "removeEmptyContainers" },
					{ name: "mergePaths" },
					{ name: "removeUnusedNS" },
					{ name: "sortAttrs" },
					{ name: "removeTitle" },
					{ name: "removeDesc" },
					{ name: "removeDimensions" },
					{ name: "removeAttrs" },
					{ name: "removeElementsByAttr" },
					{ name: "addClassesToSVGElement" },
					{ name: "removeStyleElement" },
					{ name: "removeScriptElement" }
				]
			}
		}),
		// 浏览器兼容性支持
		!isDev &&
			legacy({
				targets: ["> 1%", "last 2 versions", "not dead", "not ie 11", "not op_mini all"],
				modernPolyfills: true,
				renderLegacyChunks: true
			}),
		// 打包分析
		!isDev &&
			visualizer({
				open: true,
				gzipSize: true,
				brotliSize: true,
				filename: "dist/stats.html"
			})
	].filter(Boolean);
}
