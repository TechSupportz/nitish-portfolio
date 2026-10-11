import type { TProjectContent } from "@src/types/ProjectContentType"

// SECTION - Project Thumbnails
import andreaThumbnail from "@assets/project-thumbnails/Andrea.png"
import atemControllerThumbnail from "@assets/project-thumbnails/ATEM-Controller.png"
import canvasNotionThumbnail from "@assets/project-thumbnails/Canvas-Notion.png"
import emailGPTThumbnail from "@assets/project-thumbnails/EmailGPT.png"
import carousellDealScoutThumbnail from "@assets/project-thumbnails/Carousell-Deal-Scout.png"
import gpaBuyWhatThumbnail from "@assets/project-thumbnails/GPABuyWhat.png"
import nativeGlassNavbarThumbnail from "@assets/project-thumbnails/Native-Glass-Navbar.png"
import perfectlyBalancedThumbnail from "@assets/project-thumbnails/Perfectly-Balanced.png"
import portfolioThumbnail from "@assets/project-thumbnails/Portfolio.png"
import smplWidgetsThumbnail from "@assets/project-thumbnails/smpl-widgets.png"
import transitoThumbnail from "@assets/project-thumbnails/Transito.png"
import wordCounterThumbnail from "@assets/project-thumbnails/Word-Counter.png"
// !SECTION

export const projectContent: TProjectContent = {
    featured: [
        {
            title: "Transito",
            mobileDescription:
                "Hopefully the last bus timing app you'll need in Singapore. No fluff, and yes, NUS shuttles too.",
            description:
                "Hopefully the last bus timing app you'll ever need. Open it, see when your bus is coming, and go. No fluff, and yes, NUS shuttles too.",
            additionalDescription: "My ongoing rabbit hole since 2021.",
            imageUrl: transitoThumbnail,
            url: "https://transito.tnitish.com/download",
            icons: ["flutter", "android", "ios"],
        },
        {
            title: "Canvas to Notion",
            mobileDescription:
                "Got tired of Canvas surprises, so an agent syncs everything to my Notion planner.",
            description:
                "I got tired of checking Canvas for surprises, so now an agent quietly syncs everything into my Notion planner.",
            additionalDescription:
                "Now I open Notion and just know what's due (or overdue 🫪).",
            imageUrl: canvasNotionThumbnail,
            url: "https://github.com/TechSupportz/nus-notion-workflow",
            icons: ["notion", "agent"],
        },
        {
            title: "Native Glass Navbar",
            mobileDescription:
                "Wanted Liquid Glass in Flutter, so I borrowed the real tab bar from UIKit.",
            description:
                "I wanted iOS 26's Liquid Glass tab bar in Flutter, so I just borrowed the real one from UIKit.",
            additionalDescription:
                "Up on pub.dev if you want that glass in your app too.",
            imageUrl: nativeGlassNavbarThumbnail,
            url: "https://pub.dev/packages/native_glass_navbar",
            icons: ["flutter", "swift", "ios"],
        },
        {
            title: "smpl.widgets",
            mobileDescription:
                "Widgets that look nice the second you add them. No home screen design project needed.",
            description:
                "Got tired of widget apps that make you design your whole home screen from scratch. These just look nice the second you add them.",
            additionalDescription: "Widgets without the work.",
            imageUrl: smplWidgetsThumbnail,
            url: "https://github.com/TechSupportz/smpl-widgets",
            icons: ["swift", "ios", "figma"],
        },
    ],
    personal: [
        {
            title: "ATEM iPad Controller",
            mobileDescription:
                "An iPad remote for the ATEM Mini. Trigger camera switches without being next to it.",
            description:
                "Turned an iPad into a touch remote for an ATEM Mini video switcher, so I could trigger camera switches without being next to it.",
            additionalDescription:
                "A little more freedom to move around while switching.",
            imageUrl: atemControllerThumbnail,
            url: "https://github.com/TechSupportz/atem-ipad-control",
            icons: ["swift", "ios"],
        },
        {
            title: "Carousell Deal Scout",
            mobileDescription:
                "Needed an iPad for uni. Made a bot scroll Carousell and ping me about good deals.",
            description:
                "Needed an iPad for uni, and being chronically on Carousell was not fun. So I made a bot do the scrolling and only ping me about the good deals.",
            additionalDescription:
                "It only shows me new listings or price drops, never the same one twice.",
            imageUrl: carousellDealScoutThumbnail,
            url: "https://github.com/TechSupportz/carousell-searcher",
            icons: ["javascript", "playwright"],
        },
        {
            title: "Word Counter",
            mobileDescription:
                "Count words, skip in-text citations. One less assignment chore.",
            description:
                "A word counter with an ignore in-text citation toggle because I was annoyed of removing them manually for assignments.",
            imageUrl: wordCounterThumbnail,
            url: "https://wordcounter.tnitish.com",
            icons: ["react", "typescript"],
        },
        {
            title: "Portfolio Website",
            mobileDescription:
                "A home for my projects and a little playground for design. You're on it!",
            description:
                "My very own portfolio website built not just to showcase my projects but also my design & frontend skills",
            additionalDescription: "...and yes, you're on it right now!",
            imageUrl: portfolioThumbnail,
            url: "https://github.com/TechSupportz/nitish-portfolio",
            icons: ["astro", "react", "typescript"],
        },
    ],
    hackathon: [
        {
            title: "Andrea",
            mobileDescription:
                "An AI sidekick to untangle your small claim and get hearing-ready.",
            description:
                "Small claims, lots of paperwork. Andrea's an AI sidekick that helps you untangle your story and get hearing-ready, no lawyer needed.",
            additionalDescription:
                "Built with law and computing students at SMU LIT 2026. It'll poke holes in your story, not just nod along.",
            imageUrl: andreaThumbnail,
            url: "https://devpost.com/software/project-andrea",
            icons: ["react", "typescript", "agent"],
        },
        {
            title: "Perfectly Balanced",
            mobileDescription:
                "Vision Pro brain games that get you turning, reaching, and thinking.",
            description:
                "Vision Pro brain games with a catch: you have to move. Targets pop up all around you, so you're turning and reaching while you think.",
            additionalDescription:
                "Built at Hack Spatial Computing 2026 with a team of five.",
            imageUrl: perfectlyBalancedThumbnail,
            url: "https://github.com/Coeeter/perfectlybalanced",
            icons: ["swift", "visionOS"],
        },
        {
            title: "EmailGPT",
            mobileDescription:
                "GPT-powered email help right in Gmail. Less staring at a blank reply box.",
            description:
                "A Chrome extension that helps you write emails right inside Gmail with GPT-3.5, so you don't have to stare at a blank reply box.",
            additionalDescription:
                "Built to feel like it was always part of Gmail.",
            imageUrl: emailGPTThumbnail,
            url: "https://github.com/Coeeter/EmailGPT",
            icons: ["openAI", "extension", "typescript"],
        },
        {
            title: "GPABuyWat?",
            mobileDescription:
                "Check your GPA and see if you can afford chicken rice!",
            description:
                "Calculate your GPA with ease, whether you're at home or on the go, and see if you can afford chicken rice!",
            additionalDescription: "Built during Hack&Roll 2023.",
            imageUrl: gpaBuyWhatThumbnail,
            url: "https://gpa-buy-wat.vercel.app/",
            icons: ["react", "typescript"],
        },
    ],
}
