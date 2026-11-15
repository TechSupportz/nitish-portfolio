// Months are counted from apr 2021 (0). The so far. page's clock and lighting
// work in these units.
export const monthIndex = (year: number, month: number) =>
    (year - 2021) * 12 + (month - 4)

export type TSoFarEntry = {
    kind: "study" | "work"
    start: number
    end: number
    dates: string
    expected?: boolean
    title: string
    subtitle: string
    bullets: string[]
}

// Newest first. Work entries sit on a branch beside the study line.
export const soFar: TSoFarEntry[] = [
    {
        kind: "study",
        start: monthIndex(2026, 8),
        end: monthIndex(2029, 12),
        dates: "aug 2026 — dec 2029",
        expected: true,
        title: "National University of Singapore",
        subtitle: "Bachelor of Computing (Honours) in Computer Science",
        bullets: [
            "Awarded the Stephen Riady Young Entrepreneur Scholars (SRYES) Scholarship.",
        ],
    },
    {
        kind: "work",
        start: monthIndex(2023, 4),
        end: monthIndex(2024, 4),
        dates: "apr 2023 — apr 2024",
        title: "GovTech Singapore",
        subtitle: "Software Engineer Intern",
        bullets: [
            "Built the CCUBE Admin Portal on my own, so configuring Listing Layer services no longer meant Postman requests and hand-edited SQL and config files.",
            "Added a Monaco config editor with IntelliSense and type checking, so malformed service JSON gets caught before it's applied.",
            "Worked with UX designers and internal users to turn one huge config form into focused flows, with validation and confirmations for risky changes.",
        ],
    },
    {
        kind: "study",
        start: monthIndex(2021, 4),
        end: monthIndex(2024, 5),
        dates: "apr 2021 — may 2024",
        title: "Temasek Polytechnic",
        subtitle: "Diploma in Information Technology with Merit · GPA 3.99",
        bullets: [
            "Lee Kuan Yew Award for Mathematics and Science, AWS Singapore Course Gold Medal and IMDA Excellence Award.",
            "Accenture Award as the top student in Cloud Application Development, for TPOSS: Reimagined.",
        ],
    },
]
