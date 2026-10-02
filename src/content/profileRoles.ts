import type { TProfileRole } from "@src/types/ProfileRoleType"

// Icon paths are Lucide's code-xml, zap and graduation-cap
export const profileRoles: TProfileRole[] = [
    {
        role: "software developer",
        shortRole: "software dev",
        title: "software developer.",
        body: "Full-stack web & mobile dev who loves solving problems and building cool stuff.",
        icon: ["m18 16 4-4-4-4", "m6 8-4 4 4 4", "m14.5 4-5 16"],
    },
    {
        role: "tech fanatic",
        title: "tech fanatic.",
        body: "Always keeping up with the latest in tech, from new gadgets to the wild innovations in F1.",
        icon: [
            "M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z",
        ],
    },
    {
        role: "student",
        title: "student.",
        body: "Computer Science student at NUS. Temasek Poly graduate, 2024 IT Gold Medallist and Lee Kuan Yew Award winner.",
        icon: [
            "M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z",
            "M22 10v6",
            "M6 12.5V16a6 3 0 0 0 12 0v-3.5",
        ],
    },
]
