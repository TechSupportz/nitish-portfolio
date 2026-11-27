import type { TProjectIcon } from "@components/project/card/projectIcons"

export type TProject = {
    title: string
    description: string
    additionalDescription?: string
    imageUrl: ImageMetadata
    url: string
    icons: TProjectIcon[]
}

export type TProjectCategory = "featured" | "personal" | "hackathon"
export type TProjectContent = Record<TProjectCategory, TProject[]>

// A project as listed on the projects page: with its anchor ID and terminal name.
export type TListedProject = TProject & {
    category: TProjectCategory
    id: string
    name: string
}

export type TProjectGroup = {
    category: TProjectCategory
    items: TListedProject[]
}
