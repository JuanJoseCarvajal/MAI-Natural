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
					50: "#f3f2e9",
					100: "#e5e8db",
					300: "#a4b097",
					500: "#728263",
					700: "#365744",
					900: "#203c32"
				}
			}
		}
	},
	plugins: []
};

export default config;
