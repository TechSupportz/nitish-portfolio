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
                "2xs": "320px",
                xs: "456px",
            },
            animation: {
                infiniteScroll: "scrollUp 6s infinite",
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
            },
        },
    },
    plugins: [],
}
