import type { TProjectIcon } from "../utils/projectIcons"

export type TProject = {
    title: string
    description: string
    imageUrl: string
    url: string
    icons: TProjectIcon[]
}

export type TProjectContent = Record<string, TProject[]>
