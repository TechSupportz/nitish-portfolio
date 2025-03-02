const defaultTheme = require("tailwindcss/defaultTheme")

/** @type {import('tailwindcss').Config} */
export default {
    content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
    theme: {
        fontFamily: {
            sans: ["DM Sans Variable", ...defaultTheme.fontFamily.sans],
            display: ["Poppins", "sans-serif"],
        },
        extend: {
            colors: {
                charcoal: "#121212",
            },
            screens: {
                xs: "456px",
				wmax: "1600px"
            },
            aspectRatio: {
                "3/2": "3 / 2",
            },
            animation: {
                "infinite-scroll": "scroll-up 10s infinite",
                "quick-spin": "quick-spin 0.35s linear",
            },
            keyframes: {
                "scroll-up": {
                    "16.5%, 33%": {
                        transform: "translateY(-25%)",
                    },
                    "49.5%, 66%": {
                        transform: "translateY(-50%)",
                    },
                    "82.5%, 100%": {
                        transform: "translateY(-75%)",
                    },
                },
                "quick-spin": {
                    "0%": { transform: "scale(1) rotate(0deg)" },
                    "50%": { transform: "scale(1.25) rotate(180deg)" },
                    "100%": { transform: "scale(1) rotate(360deg)" },
                },
            },
        },
    },
    plugins: [require("tailwindcss-motion")],
}
