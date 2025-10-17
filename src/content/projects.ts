import type { TProjectContent } from "@src/types/ProjectContentType"

// SECTION - Project Thumbnails
import emailGPTThumbnail from "@assets/project-thumbnails/EmailGPT.png"
import gpaBuyWhatThumbnail from "@assets/project-thumbnails/GPABuyWhat.png"
import portfolioThumbnail from "@assets/project-thumbnails/Portfolio.png"
import tpossThumbnail from "@assets/project-thumbnails/TPOSS-Reimagined.png"
import transitoLandingThumbnail from "@assets/project-thumbnails/Transito-Landing.png"
import transitoThumbnail from "@assets/project-thumbnails/Transito.png"
import wordCounterThumbnail from "@assets/project-thumbnails/Word-Counter.png"
import QRExtensionThumbnail from "@assets/project-thumbnails/QR-Extension.png"
import PortfixThumbnail from "@assets/project-thumbnails/Portfix.png"
// !SECTION

export const projectContent: TProjectContent = {
    featured: [
        {
            title: "Transito",
            description:
                "A cross-platform bus timing application all about giving you the info you need, fast.",
            additionalDescription:
                "Features were cherry-picked to keep things straightforward while remaining useful.",
            imageUrl: transitoThumbnail,
            url: "https://transito.tnitish.com",
            icons: ["flutter", "android", "ios"],
        },
        {
            title: "TPOSS: Reimagined",
            description:
                "A modernised version of Temasek Polytechnic's Online Student Services (TPOSS).",
            additionalDescription:
                "It incorporates a more user friendly interface whilst also utilising a microservices architecture.",
            imageUrl: tpossThumbnail,
            url: "https://github.com/TechSupportz/tposs-reimagined-cloud",
            icons: ["react", "cloud", "typescript"],
        },
        {
            title: "EmailGPT",
            description:
                "A Google Chrome extension to assist the user in writing emails within Gmail using OpenAI's GPT-3.5 model.",
            additionalDescription:
                "Designed to feel like a natural extension of Gmail.",
            imageUrl: emailGPTThumbnail,
            url: "https://github.com/Coeeter/EmailGPT",
            icons: ["openAI", "extension", "typescript"],
        },
        {
            title: "Portfolio Website",
            description:
                "My very own portfolio website built not just showcase my projects but also my design & frontend skills",
            additionalDescription: "...and yes, you're on it right now!",
            imageUrl: portfolioThumbnail,
            url: "https://tnitish.com",
            icons: ["astro", "react", "typescript"],
        },
    ],
    personal: [
        {
            title: "Word Counter",
            description:
                "A word counter with a ignore in-text citation toggle because I was annoyed of removing them manually for assignments.",
            imageUrl: wordCounterThumbnail,
            url: "https://wordcounter.tnitish.com",
            icons: ["react", "typescript"],
        },
        {
            title: "QR Extension",
            description:
                "A simple chrome extension which generates a QR code of the current tab's URL when clicked.",
            additionalDescription:
                "Made this in 30 minutes because I was bored.",
            imageUrl: QRExtensionThumbnail,
            url: "https://github.com/TechSupportz/qr-extension",
            icons: ["typescript", "extension"],
        },
        {
            title: "Transito Landing",
            description:
                "A simple yet smart landing page for Transito that detects the user's device & redirects them to their app store.",
            additionalDescription: "Making QR codes idiot-proof!",
            imageUrl: transitoLandingThumbnail,
            url: "https://transito.tnitish.com",
            icons: ["next", "typescript"],
        },
    ],
    hackathon: [
        {
            title: "GPABuyWat?",
            description:
                "Calculate your GPA with ease, whether you're at home or on the go, and see if you can afford chicken rice!",
            additionalDescription: "Built during Hack&Roll 2023.",
            imageUrl: gpaBuyWhatThumbnail,
            url: "https://gpa-buy-wat.vercel.app/",
            icons: ["react", "typescript"],
        },
        {
            title: "Portfix",
            description:
                "PortFix is a dual-application solution to keep a healthy uptime of the equipments within the PSA ports.",
            additionalDescription: "Built during PSA Codesprint 2022.",
            imageUrl: PortfixThumbnail,
            url: "https://github.com/PuttTim/PSA-vpn2",
            icons: ["react", "typescript", "flutter"],
        },
    ],
}
