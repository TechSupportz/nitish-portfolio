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
            },
            animation: {
                infiniteScroll: "scrollUp 6s infinite",
                "quick-spin": "spinQuick 0.45s linear",
            },
            keyframes: {
                scrollUp: {
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
                spinQuick: {
                    "0%": { transform: "scale(1) rotate(0deg)" },
                    "50%": { transform: "scale(1.25) rotate(180deg)" },
                    "100%": { transform: "scale(1) rotate(360deg)" },
                },
            },
        },
    },
    plugins: [],
}
