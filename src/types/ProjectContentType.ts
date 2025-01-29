import type { TProjectIcon } from "@utils/projectIcons"

export type TProject = {
    title: string
    description: string
    imageUrl: string
    url: string
    icons: TProjectIcon[]
}

export type TProjectVisibility = {
    [key: string]: {
        category: TProjectCategory
        isVisible: boolean
    }
}

export type TProjectCategory = "featured" | "personal" | "hackathon" | "school"
export type TProjectContent = Record<TProjectCategory, TProject[]>
