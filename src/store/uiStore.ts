import { atom, map } from "nanostores"
import type { TScrollListItemVisibility } from "../types/ScrollListType"

export const isDrawerOpen = atom(false)
export const scrollListItemVisibility = map<TScrollListItemVisibility>({
    softwareDeveloper: true,
	techFanatic: false,
	student: false,
})
