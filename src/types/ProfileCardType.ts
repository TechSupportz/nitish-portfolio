export const ProfileCardTitles = {
    SoftwareDeveloper: "Software Developer 👨🏾‍💻",
    TechFanatic: "Tech Fanatic 📱",
    Student: "Student 🎓",
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
