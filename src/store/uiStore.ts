import type { TScrollListItemVisibility } from "@src/types/ScrollListType"
import { atom, map } from "nanostores"

export const isDrawerOpen = atom(false)
export const $scrollListItemVisibility = map<TScrollListItemVisibility>({
    softwareDeveloper: true,
    techFanatic: false,
    student: false,
})
