import { atom } from "nanostores"

export const isDrawerOpen = atom(false)
export const $activeRole = atom(0)

// Matches --home-boot in global.css: wait for the corner logo dot to lock on
// (wave fires at HOME_BOOT_WAVE_MS), then bring the nav and hero copy in.
export const HOME_BOOT_WAVE_MS = 1020
export const HOME_BOOT_OFFSET_MS = 1150
export const $homeBootStart = atom<number | null>(null)
