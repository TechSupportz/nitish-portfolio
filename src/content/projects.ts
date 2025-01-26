import type { TProjectContent } from "../types/ProjectContentType"

// FIXME - This is a placeholder for the project content, NOT ALL ARE REAL PROJECTS

export const projectContent: TProjectContent = {
    featured: [
        {
            title: "Transito",
            description:
                "Real-time bus tracking app providing accurate arrival times and routes. Built with Flutter and Firebase for seamless cross-platform experience.",
            imageUrl: "https://placehold.co/300x200",
            url: "https://transito.example.com",
            icons: ["flutter", "android", "ios"],
        },
        {
            title: "DevConnect",
            description:
                "Social platform for developers to collaborate on projects and share resources. Built with React, Node.js, and MongoDB.",
            imageUrl: "https://placehold.co/300x200",
            url: "https://devconnect.example.com",
            icons: ["react", "typescript"],
        },
        {
            title: "EcoTracker",
            description:
                "Environmental monitoring platform tracking carbon footprint and sustainability metrics. Built with Next.js and GraphQL.",
            imageUrl: "https://placehold.co/300x200",
            url: "https://ecotracker.example.com",
            icons: ["angular", "typescript", "cloud"],
        },
    ],
    personal: [
        {
            title: "Portfolio v2",
            description:
                "Personal portfolio website built with Astro and Tailwind CSS featuring dark mode and responsive design.",
            imageUrl: "https://placehold.co/300x200",
            url: "https://portfolio.example.com",
            icons: ["astro", "typescript", "react"],
        },
        {
            title: "Weather Dashboard",
            description:
                "Real-time weather application with detailed forecasts and interactive maps.",
            imageUrl: "https://placehold.co/300x200",
            url: "https://weather.example.com",
            icons: ["react", "typescript"],
        },
    ],
    hackathon: [
        {
            title: "MediChain",
            description:
                "Blockchain-based medical records system for secure patient data management. Won first place at HealthTech Hackathon 2023.",
            imageUrl: "https://placehold.co/300x200",
            url: "https://medichain.example.com",
            icons: ["react", "typescript"],
        },
        {
            title: "SmartPark",
            description:
                "IoT solution for smart parking management using computer vision. Runner-up at Smart City Hackathon.",
            imageUrl: "https://placehold.co/300x200",
            url: "https://smartpark.example.com",
            icons: ["typescript", "cloud"],
        },
    ],
    school: [
        {
            title: "Library Management System",
            description:
                "Full-stack application for managing library resources, borrowing, and returns using MERN stack.",
            imageUrl: "https://placehold.co/300x200",
            url: "https://library.example.com",
            icons: ["react", "typescript"],
        },
        {
            title: "Algorithm Visualizer",
            description:
                "Interactive tool for visualizing sorting and pathfinding algorithms. Created for Data Structures course.",
            imageUrl: "https://placehold.co/300x200",
            url: "https://algo-viz.example.com",
            icons: ["typescript", "react"],
        },
    ],
}
