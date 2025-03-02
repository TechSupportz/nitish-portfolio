import type { TProjectContent } from "@src/types/ProjectContentType"

// SECTION - Project Thumbnails
import transitoThumbnail from "@assets/project-thumbnails/Transito.png"
import tpossThumbnail from "@assets/project-thumbnails/TPOSS-Reimagined.png"
import emailGPTThumbnail from "@assets/project-thumbnails/EmailGPT.png"
import portfolioThumbnail from "@assets/project-thumbnails/Portfolio.png"
import transitoLandingThumbnail from "@assets/project-thumbnails/Transito-Landing.png"
// !SECTION

export const projectContent: TProjectContent = {
    featured: [
        {
            title: "Transito",
            description:
                "A cross-platform bus timing application all about giving you the info you need, fast.",
            additionalDescription:
                "Features were cherry-picked to keep things straightforward and still being useful.",
            imageUrl: transitoThumbnail,
            url: "https://transito.tnitish.com",
            icons: ["flutter", "android", "ios"],
        },
        {
            title: "TPOSS: Reimagined",
            description:
                "A modernised version of Temasek Polytechnic's Online Student Services (TPOSS).",
            additionalDescription:
                "It incorporates a more user friendly interface while also utilising a microservices architecture.",
            imageUrl: tpossThumbnail,
            url: "https://github.com/TechSupportz/tposs-reimagined-cloud",
            icons: ["react", "cloud", "typescript"],
        },
        {
            title: "EmailGPT",
            description:
                "A Google Chrome extension to assist the user in writing emails inside Gmail using OpenAI's GPT-3.5 model.",
            additionalDescription:
                "Designed to feel like a natural extension of Gmail.",
            imageUrl: emailGPTThumbnail,
            url: "https://github.com/Coeeter/EmailGPT",
            icons: ["openAI", "extension", "typescript"],
        },
        {
            title: "Portfolio Website",
            description:
                "My very own portfolio website to not just showcase my projects but also my design and frontend skills",
            additionalDescription: "...and yes you're looking at it right now!",
            imageUrl: portfolioThumbnail,
            url: "https://tnitish.com",
            icons: ["astro", "react", "typescript"],
        },
    ],
    personal: [],
    hackathon: [],
    school: [],
}
