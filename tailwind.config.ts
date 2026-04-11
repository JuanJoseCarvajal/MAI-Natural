import type { Config } from "tailwindcss";

const config: Config = {
	content: [
		"./app/**/*.{js,ts,jsx,tsx,mdx}",
		"./components/**/*.{js,ts,jsx,tsx,mdx}"
	],
	theme: {
		extend: {
			colors: {
				brand: {
					50: "#f4f9f6",
					100: "#deeee4",
					300: "#93c6a7",
					500: "#4c9a6a",
					700: "#2a6343",
					900: "#173626"
				}
			}
		}
	},
	plugins: []
};

export default config;
