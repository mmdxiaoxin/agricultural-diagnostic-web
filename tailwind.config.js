/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ["./index.html", "./src/**/*.{html,js}"],
	safelist: [
		{
			pattern:
				/(bg|border|text|stroke|fill)-(primary|secondary|tertiary|error|success|warning|info|typography|outline|background|indicator)-(0|50|100|200|300|400|500|600|700|800|900|950|white|gray|black|error|warning|muted|success|info|light|dark|primary)/
		}
	],
	theme: {
		screens: {
			base: "0",
			xs: "400px",
			sm: "480px",
			md: "768px",
			lg: "992px",
			xl: "1280px",
			"2xl": "1536px"
		},
		extend: {}
	},
	plugins: []
};
