import type { TProjectIcon } from "@utils/projectIcons"

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

// A project as listed on the projects page: numbered, slugged and lowercased.
export type TListedProject = TProject & {
    category: TProjectCategory
    id: string
    no: string
    name: string
}
