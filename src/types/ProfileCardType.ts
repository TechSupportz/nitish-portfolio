export const ProfileCardTitles = {
    SoftwareDeveloper: "👨🏾‍💻 software developer.",
    TechFanatic: "📱 tech fanatic.",
    Student: "🎓 student.",
} as const

export type ProfileCardTitle =
    (typeof ProfileCardTitles)[keyof typeof ProfileCardTitles]

export const EmojiMap: Record<ProfileCardTitle, string[]> = {
    [ProfileCardTitles.SoftwareDeveloper]: ["💾", "🛠️", "👾", "💻"],
    [ProfileCardTitles.TechFanatic]: ["📱", "🖥️", "📸", "🏎️"],
    [ProfileCardTitles.Student]: ["🎓", "📚", "✏️", "🔍"],
}

export type EmojiParticle = {
    id: number
    emoji: string
    style: {
        left: number
        top: number
        "--dx": string
        "--dy": string
        "--rotate": string
        "--scale": string
        "--duration": string
    }
}
