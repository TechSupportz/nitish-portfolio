// @ts-check
import { defineConfig, fontProviders } from "astro/config"

import react from "@astrojs/react"

import tailwindcss from "@tailwindcss/vite"

// https://astro.build/config
export default defineConfig({
    site: "https://tnitish.com",
    integrations: [react()],
    build: {
        // Emit /projects.html rather than /projects/index.html so links to
        // /projects are served directly instead of redirecting to /projects/
        format: "file",
    },
    prefetch: {
        prefetchAll: true,
        defaultStrategy: "viewport",
    },
    fonts: [
        {
            provider: fontProviders.fontsource(),
            name: "DM Sans",
            cssVariable: "--font-dm-sans",
            weights: ["100 1000"],
            styles: ["normal"],
            fallbacks: ["ui-sans-serif", "system-ui", "sans-serif"],
        },
        {
            provider: fontProviders.fontsource(),
            name: "Poppins",
            cssVariable: "--font-poppins",
            weights: [400, 600, 700, 800],
            styles: ["normal"],
            fallbacks: ["sans-serif"],
        },
    ],
    vite: {
        plugins: [tailwindcss()],
    },
    devToolbar: {
        enabled: false,
    },
})
