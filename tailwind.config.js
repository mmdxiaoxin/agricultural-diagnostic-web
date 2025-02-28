module.exports = {
	content: [
		"./index.html", // 使 tailwind 扫描 index.html
		"./src/**/*.{js,ts,jsx,tsx}" // 扫描 src 目录下的所有文件
	],
	theme: {
		extend: {}
	},
	plugins: []
};
