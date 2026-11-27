import {
    $activeRole,
    $homeBootStart,
    HOME_BOOT_WAVE_MS,
} from "@store/uiStore"
import { cn } from "@utils/cn"
import { useEffect, useRef } from "react"

type DotMatrixProps = {
    className?: string
    // One icon per role (SVG path data on a 24x24 grid), lit up for $activeRole
    icons?: string[][]
}

type TRgb = [number, number, number]
type TRect = { x0: number; y0: number; x1: number; y1: number }

// The grid's size lives in global.css (--matrix-*), shared with the .dot-grid
// banners, and is read on every layout. These are only fallbacks
let PITCH = 12
let OFFSET = 6
let DOT_RADIUS = 2.5
let DOT_RADIUS_MOBILE = 2.7
let BASE_ALPHA = 0.3
let ICON_RADIUS = 4.45
const readGrid = () => {
    const css = getComputedStyle(document.documentElement)
    const read = (name: string, fallback: number) => {
        const value = parseFloat(css.getPropertyValue(name))
        return Number.isFinite(value) && value > 0 ? value : fallback
    }
    // Same ratios as global.css: dot:gap 3:4, lit dots at 2/3 of the pitch
    const dot = read("--matrix-dot", 5)
    PITCH = (dot * 7) / 3
    OFFSET = PITCH / 2
    DOT_RADIUS = dot / 2
    // Phone pixels are physically smaller, so dots get a touch bigger to read as bright
    DOT_RADIUS_MOBILE = DOT_RADIUS * 1.08
    BASE_ALPHA = read("--matrix-alpha", 0.3)
    ICON_RADIUS = PITCH / 3
}

const ICON_ALPHA = 0.9
// Icon stroke in Lucide's 24-unit space (Lucide itself draws at 2)
const ICON_STROKE = 2.7
const ICON_STROKE_MOBILE = 3.2
// Largest the icon gets, in px; its size in dots follows the pitch
const ICON_MAX_PX = 576
// Share of the area the icon may take. On desktop the area is the whole hero,
// so the icon sits top-right and only overlaps the copy slightly
const ICON_SLOT_FILL_X = 0.48
const ICON_SLOT_FILL_Y = 0.76
// The mobile matrix is tall, so height gets a smaller share to keep the icon in the top part
const ICON_MATRIX_FILL_X = 0.63
const ICON_MATRIX_FILL_Y = 0.455
// Switching icons: the old icon's dots turn off and the new one's turn on,
// each dot on its own in a random order, like an LED panel redrawing
const PIXEL_OUT_SPREAD_MS = 280
const PIXEL_IN_DELAY_MS = 120
const PIXEL_IN_SPREAD_MS = 420
const PIXEL_STEP_MS = 70
const SWITCH_MS = PIXEL_IN_DELAY_MS + PIXEL_IN_SPREAD_MS + PIXEL_STEP_MS
// First icon: a ripple leaves the corner logo's blue dot (after it flickers on
// during the initial boot, or right away on revisit) and grows each icon dot in
const REVEAL_DELAY_MS = 80
const REVEAL_GROW_MS = 420
// Mobile only: the lit icon dots are also drawn as an HDR image (~4x SDR white,
// public/hdr-glow.avif) masked to the dots, so HDR screens show them glowing.
// Two layers crossfade between icons over the same time as the canvas switch
const HDR_GLOW_FADE_MS = SWITCH_MS
// Ripples get the same HDR glow, dimmer, as a CSS-masked ring over the grid dots
const RIPPLE_HDR_ALPHA = 0.45

// Desktop only: dots behind text are dimmed where the icon overlaps the copy
const TEXT_DIM = 0.6
const TEXT_PAD = 4
const TEXT_SOFTNESS = 11
const DIM_EASE_MS = 250

const SPOT_RADIUS = 115
const RIPPLE_SPEED = 0.38
const RIPPLE_WIDTH = 22
const RIPPLE_LIFE_MS = 1500
// The first icon's ring crosses the whole grid, like the profile picture's
// reveal: dots light up just behind it and fade as it moves on
const REVEAL_WAKE_PX = 140
const REVEAL_WAKE_ALPHA = 0.5
// Like the pfp's ring: the radius follows 1 - (1 - t)^4 over this time, out
// to 1.4x the farthest corner, so it crosses the grid quickly (~1.2s) and does
// most of its slowing down past the edge, off screen
const REVEAL_RING_MS = 4400
const REVEAL_EASE = 4
const REVEAL_OVERSHOOT = 1.4
// The ring also uncovers the grid itself, behind a soft edge this wide
const REVEAL_EDGE_PX = 48
const revealRadius = (age: number, reach: number) =>
    reach *
    (1 -
        Math.pow(
            1 - Math.min(1, Math.max(0, age / REVEAL_RING_MS)),
            REVEAL_EASE,
        ))
// When the eased ring reaches a point `distance` away
const revealArrival = (distance: number, reach: number) =>
    REVEAL_RING_MS *
    (1 - Math.pow(1 - Math.min(1, distance / reach), 1 / REVEAL_EASE))

const WHITE: TRgb = [255, 255, 255]
// The brand gradient, sky-100 to blue-500 (--color-grad-from / --color-grad-to)
const SKY: TRgb = [224, 242, 254]
const BLUE: TRgb = [59, 130, 246]

const clamp = (value: number) => Math.min(1, Math.max(0, value))
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3)
const mix = (a: TRgb, b: TRgb, t: number): TRgb => [
    a[0] + (b[0] - a[0]) * t,
    a[1] + (b[1] - a[1]) * t,
    a[2] + (b[2] - a[2]) * t,
]

// Same falloff as the old CSS mask:
// linear-gradient(to bottom, transparent, 15%, white, 80%, transparent)
const fadeMask = (progress: number) =>
    progress <= 0.5
        ? Math.pow(progress / 0.5, Math.log(0.5) / Math.log(0.3))
        : 1 - Math.pow((progress - 0.5) / 0.5, Math.log(0.5) / Math.log(0.6))

const DotMatrix = ({ className, icons = [] }: DotMatrixProps) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null)
    const glowRefs = useRef<(HTMLDivElement | null)[]>([])
    const rippleGlowRef = useRef<HTMLDivElement | null>(null)

    useEffect(() => {
        const canvas = canvasRef.current
        const ctx = canvas?.getContext("2d")
        if (!canvas || !ctx) return

        const motionQuery = window.matchMedia(
            "(prefers-reduced-motion: reduce)",
        )
        let reduceMotion = motionQuery.matches
        const finePointer = window.matchMedia(
            "(hover: hover) and (pointer: fine)",
        ).matches

        let box = canvas.getBoundingClientRect()
        let cols = 0
        let rows = 0
        let mask = new Float32Array(0)
        let lit = new Float32Array(0)
        let from = new Float32Array(0)
        // Per-dot random order for the pixel switch, rolled once per layout
        let outOrder = new Float32Array(0)
        let inOrder = new Float32Array(0)
        // First-icon reveal: t < 0 while the full stop is still flickering,
        // then the ring's start time and origin, until every icon dot is in
        // The grid itself, uncovered by the same ring; null once fully shown
        let unveil: {
            t: number
            x: number
            y: number
            reach: number
            clear: number
        } | null = null
        let reveal: {
            t: number
            x: number
            y: number
            reach: number
            end: number
        } | null = null
        let dim = new Float32Array(0)
        let dimTarget = new Float32Array(0)
        let iconSets: Uint8Array[] = []
        // Icon footprint on the grid; `fill` spans the whole matrix (mobile)
        let icon = { c0: 0, r0: 0, size: 0, fill: false }
        let dotRadius = DOT_RADIUS

        let active = $activeRole.get()
        let changedAt = performance.now()
        let frame = 0
        let lastFrame = 0
        const pointer = { x: -1e4, y: -1e4 }
        const ripples: {
            x: number
            y: number
            t: number
            life: number
            // The reveal ring eases out to this radius (0 for a plain tap
            // ripple), lighting the grid behind it as it goes
            reach: number
            wake: boolean
            // Dropped once its radius passes this (the reveal, past the grid)
            clear: number
            glow?: HTMLDivElement
        }[] = []
        const timers = new Set<ReturnType<typeof setTimeout>>()
        const later = (callback: () => void, ms: number) => {
            const id = setTimeout(() => {
                timers.delete(id)
                callback()
            }, ms)
            timers.add(id)
        }

        // Only the region that changed is repainted each frame
        let fullRedraw = true
        let previousRegion: TRect | null = null
        const lastPointer = { x: -1e4, y: -1e4 }
        // True while icon dots are mid-sweep or their text dimming is easing
        let iconUnsettled = true
        // Static grid, drawn once per layout; frames only repaint changing dots
        const baseLayer = document.createElement("canvas")
        const baseCtx = baseLayer.getContext("2d")

        // Anchors the icon to the top-right of the slot, or of the grid area
        // below the navbar when there's no visible slot (mobile)
        const placeIcon = (gridTop: number) => {
            const slot = document
                .querySelector<HTMLElement>("[data-matrix-icon-slot]")
                ?.getBoundingClientRect()
            const fill = !slot || slot.width === 0 || slot.height === 0
            const area = fill
                ? {
                      left: 0,
                      top: gridTop,
                      width: box.width,
                      height: Math.max(0, box.height - gridTop),
                  }
                : {
                      left: slot.left - box.left,
                      top: slot.top - box.top,
                      width: slot.width,
                      height: slot.height,
                  }

            const size = Math.min(
                Math.floor(ICON_MAX_PX / PITCH),
                Math.floor(
                    Math.min(
                        area.width *
                            (fill ? ICON_MATRIX_FILL_X : ICON_SLOT_FILL_X),
                        area.height *
                            (fill ? ICON_MATRIX_FILL_Y : ICON_SLOT_FILL_Y),
                    ) / PITCH,
                ),
            )
            const lastCol = Math.floor(
                (area.left + area.width - OFFSET) / PITCH,
            )
            const firstRow = Math.ceil((area.top - OFFSET) / PITCH)
            // Margin (in dots) keeping the icon in from the top-right corner
            const insetCols = fill ? 1 : 4
            const insetRows = fill ? 1 : 4
            icon = {
                c0: Math.min(lastCol, cols - 1) - insetCols - size + 1,
                r0: Math.max(firstRow, 0) + insetRows,
                size,
                fill,
            }
        }

        // Draw the icon at the icon's footprint size and keep the grid dots it covers
        const rasterize = (paths: string[]) => {
            const set = new Uint8Array(cols * rows)
            if (icon.size <= 0) return set

            // Whole pixels: the pitch can be fractional (it follows the dot
            // size), and a canvas rounds its width down, so indexing pixels
            // with a fractional span would read the wrong ones
            const span = Math.ceil((icon.size + 2) * PITCH)
            const unit = (icon.size * PITCH) / 24
            const offscreen = document.createElement("canvas")
            offscreen.width = span
            offscreen.height = span
            const off = offscreen.getContext("2d", {
                willReadFrequently: true,
            })
            if (!off) return set

            off.translate(PITCH, PITCH)
            off.scale(unit, unit)
            off.lineWidth = icon.fill ? ICON_STROKE_MOBILE : ICON_STROKE
            off.lineCap = "round"
            off.lineJoin = "round"
            paths.forEach(path => off.stroke(new Path2D(path)))

            const pixels = off.getImageData(0, 0, span, span).data
            for (let r = 0; r < icon.size + 2; r++) {
                for (let c = 0; c < icon.size + 2; c++) {
                    const sx = Math.round(c * PITCH + PITCH / 2)
                    const sy = Math.round(r * PITCH + PITCH / 2)
                    if (pixels[(sy * span + sx) * 4 + 3] <= 70) continue

                    const col = icon.c0 + c - 1
                    const row = icon.r0 + r - 1
                    if (col >= 0 && col < cols && row >= 0 && row < rows) {
                        set[row * cols + col] = 1
                    }
                }
            }
            return set
        }

        const measureText = () => {
            dimTarget.fill(1)
            // The full-matrix icon on mobile sits behind the copy undimmed
            if (icon.fill) return
            const rects: DOMRect[] = []
            const range = document.createRange()

            document
                .querySelectorAll<HTMLElement>("[data-matrix-dim]")
                .forEach(el => {
                    const clip = el
                        .closest("[data-matrix-dim-clip]")
                        ?.getBoundingClientRect()
                    range.selectNodeContents(el)
                    for (const rect of range.getClientRects()) {
                        const left = Math.max(rect.left, clip?.left ?? -1e4)
                        const right = Math.min(rect.right, clip?.right ?? 1e4)
                        const top = Math.max(rect.top, clip?.top ?? -1e4)
                        const bottom = Math.min(
                            rect.bottom,
                            clip?.bottom ?? 1e4,
                        )
                        if (right - left > 2 && bottom - top > 2) {
                            rects.push(
                                new DOMRect(
                                    left - box.left,
                                    top - box.top,
                                    right - left,
                                    bottom - top,
                                ),
                            )
                        }
                    }
                })

            for (let r = 0; r < rows; r++) {
                for (let c = 0; c < cols; c++) {
                    const x = OFFSET + c * PITCH
                    const y = OFFSET + r * PITCH
                    let factor = 1
                    for (const rect of rects) {
                        const dx = Math.max(
                            rect.left - TEXT_PAD - x,
                            0,
                            x - rect.right - TEXT_PAD,
                        )
                        const dy = Math.max(
                            rect.top - TEXT_PAD - y,
                            0,
                            y - rect.bottom - TEXT_PAD,
                        )
                        const distance = Math.hypot(dx, dy)
                        factor = Math.min(
                            factor,
                            TEXT_DIM +
                                (1 - TEXT_DIM) *
                                    clamp(distance / TEXT_SOFTNESS),
                        )
                    }
                    dimTarget[r * cols + c] = factor
                }
            }
        }

        const schedule = () => {
            if (!frame) frame = requestAnimationFrame(draw)
        }

        const glowLayers = glowRefs.current.filter(
            (layer): layer is HTMLDivElement => layer !== null,
        )
        let glowMasks: string[] = []
        let glowFront = 0
        // SDR screens would clip the glow to flat white, losing the icon's gradient
        const hdrQuery = window.matchMedia("(dynamic-range: high)")
        let hdrEnabled = true

        // One mask per icon, cropped to the icon's footprint
        const buildGlowMasks = () => {
            glowMasks = []
            if (!icon.fill || icon.size <= 0 || !hdrQuery.matches) return
            if (!hdrEnabled) return

            const dpr = canvas.width / Math.max(1, box.width)
            const left = OFFSET + (icon.c0 - 1) * PITCH - PITCH / 2
            const top = OFFSET + (icon.r0 - 1) * PITCH - PITCH / 2
            const span = (icon.size + 2) * PITCH
            glowMasks = iconSets.map(set => {
                const maskCanvas = document.createElement("canvas")
                maskCanvas.width = Math.ceil(span * dpr)
                maskCanvas.height = Math.ceil(span * dpr)
                const maskCtx = maskCanvas.getContext("2d")
                if (!maskCtx) return "none"

                maskCtx.setTransform(dpr, 0, 0, dpr, -left * dpr, -top * dpr)
                set.forEach((on, id) => {
                    if (!on) return
                    maskCtx.globalAlpha = ICON_ALPHA
                    maskCtx.beginPath()
                    maskCtx.arc(
                        OFFSET + (id % cols) * PITCH,
                        OFFSET + Math.floor(id / cols) * PITCH,
                        ICON_RADIUS,
                        0,
                        Math.PI * 2,
                    )
                    maskCtx.fill()
                })
                // Sized to the rounded-up canvas so it isn't stretched by a fraction
                const size = maskCanvas.width / dpr
                return `url(${maskCanvas.toDataURL()}) ${left}px ${top}px / ${size}px ${size}px no-repeat`
            })
        }

        const showGlow = (layer: HTMLDivElement, index: number) => {
            const value = glowMasks[index] ?? "none"
            layer.style.setProperty("mask", value)
            layer.style.setProperty("-webkit-mask", value)
        }

        const glowTransition = () =>
            reduceMotion
                ? "none"
                : `opacity ${HDR_GLOW_FADE_MS}ms cubic-bezier(0.65, 0, 0.35, 1)`

        // Sets a layer's opacity instantly, skipping its transition
        const snapOpacity = (layer: HTMLDivElement, opacity: string) => {
            layer.style.transition = "none"
            layer.style.opacity = opacity
            void layer.offsetWidth
            layer.style.transition = glowTransition()
        }

        // Snaps to a clean state: the front layer shows the current icon, the back is hidden
        const resetGlow = () => {
            const on = glowMasks.length > 0
            glowLayers.forEach((layer, i) => {
                layer.style.display = on ? "block" : "none"
                if (i === glowFront) showGlow(layer, active)
                snapOpacity(layer, on && i === glowFront ? "1" : "0")
            })
        }

        const fadeInGlow = () => {
            const layer = glowLayers[glowFront]
            if (!layer || glowMasks.length === 0) return
            snapOpacity(layer, "0")
            layer.style.opacity = "1"
        }

        const crossfadeGlow = (index: number) => {
            if (glowMasks.length === 0 || glowLayers.length < 2) return
            const next = 1 - glowFront
            // It may still be fading out after a quick previous change, so clear
            // it before reuse rather than swapping in a half-visible mask
            snapOpacity(glowLayers[next], "0")
            showGlow(glowLayers[next], index)
            glowLayers[next].style.opacity = "1"
            glowLayers[glowFront].style.opacity = "0"
            glowFront = next
        }

        const glowAllowed = () =>
            icon.fill && hdrEnabled && hdrQuery.matches && !reduceMotion

        // Ripple glow is two nested masks, which multiply: the host is masked
        // once per layout to every grid dot (with the grid's fade), and each
        // ripple inside it is masked to its expanding ring
        const rippleHost = rippleGlowRef.current
        const buildRippleDotsMask = () => {
            if (!rippleHost) return
            // Skip the full-matrix mask entirely when ripples can't glow
            if (!glowAllowed()) {
                rippleHost.style.display = "none"
                return
            }
            const scale = Math.min(2, window.devicePixelRatio || 1)
            const dotsCanvas = document.createElement("canvas")
            dotsCanvas.width = Math.ceil(box.width * scale)
            dotsCanvas.height = Math.ceil(box.height * scale)
            const dotsCtx = dotsCanvas.getContext("2d")
            if (!dotsCtx) return

            dotsCtx.setTransform(scale, 0, 0, scale, 0, 0)
            for (let r = 0; r < rows; r++) {
                if (mask[r] < 0.02) continue
                dotsCtx.globalAlpha = mask[r]
                dotsCtx.beginPath()
                for (let c = 0; c < cols; c++) {
                    const x = OFFSET + c * PITCH
                    const y = OFFSET + r * PITCH
                    dotsCtx.moveTo(x + dotRadius * 1.3, y)
                    dotsCtx.arc(x, y, dotRadius * 1.3, 0, Math.PI * 2)
                }
                dotsCtx.fill()
            }
            const value = `url(${dotsCanvas.toDataURL()}) 0 0 / 100% 100% no-repeat`
            rippleHost.style.setProperty("mask", value)
            rippleHost.style.setProperty("-webkit-mask", value)
            rippleHost.style.display = "block"
        }

        const ringMask = (x: number, y: number, radius: number) => {
            const inner = Math.max(0, radius - RIPPLE_WIDTH)
            return `radial-gradient(circle at ${x}px ${y}px, transparent ${inner}px, #000 ${radius}px, transparent ${radius + RIPPLE_WIDTH}px)`
        }

        // How strong a ring still is: taps fade quickly, the reveal holds on
        // until it has crossed the grid
        const waveFade = (wave: (typeof ripples)[number], age: number) =>
            Math.pow(1 - age / wave.life, 1.5)
        const waveRadius = (wave: (typeof ripples)[number], age: number) =>
            wave.wake ? revealRadius(age, wave.reach) : age * RIPPLE_SPEED

        const addRipple = (
            x: number,
            y: number,
            life = RIPPLE_LIFE_MS,
            reach = 0,
            clear = Infinity,
        ) => {
            const wake = reach > 0
            const wave: (typeof ripples)[number] = {
                x,
                y,
                t: performance.now(),
                life,
                reach,
                wake,
                clear,
            }
            if (glowAllowed() && rippleHost) {
                const glow = document.createElement("div")
                Object.assign(glow.style, {
                    position: "absolute",
                    inset: "0",
                    backgroundImage: "url('/hdr-glow.avif')",
                    backgroundSize: "cover",
                    opacity: "0",
                })
                rippleHost.append(glow)
                wave.glow = glow
            }
            ripples.push(wave)
            schedule()
        }

        const clearRipples = () => {
            ripples.forEach(wave => wave.glow?.remove())
            ripples.length = 0
        }

        const layout = () => {
            readGrid()
            box = canvas.getBoundingClientRect()
            const dpr = window.devicePixelRatio || 1
            canvas.width = Math.round(box.width * dpr)
            canvas.height = Math.round(box.height * dpr)
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

            cols = Math.max(0, Math.floor((box.width - OFFSET) / PITCH) + 1)
            rows = Math.max(0, Math.floor((box.height - OFFSET) / PITCH) + 1)
            // Keep the resting grid faded below the navbar so the logo area
            // stays clean at rest, while still letting the reveal wave emerge
            // directly from the logo dot behind the transparent navbar.
            const navBottom =
                document.querySelector(".navbar")?.getBoundingClientRect()
                    .bottom ?? 0
            const gridTop = Math.max(0, navBottom - box.top)
            const gridHeight = Math.max(1, box.height - gridTop)
            mask = new Float32Array(rows).map((_, r) => {
                const y = OFFSET + r * PITCH
                if (y < gridTop) return 0
                return fadeMask(clamp((y - gridTop) / gridHeight))
            })

            placeIcon(gridTop)
            dotRadius = icon.fill ? DOT_RADIUS_MOBILE : DOT_RADIUS

            baseLayer.width = canvas.width
            baseLayer.height = canvas.height
            if (baseCtx) {
                baseCtx.setTransform(dpr, 0, 0, dpr, 0, 0)
                baseCtx.fillStyle = "#fff"
                for (let r = 0; r < rows; r++) {
                    if (mask[r] * BASE_ALPHA < 0.012) continue
                    baseCtx.globalAlpha = mask[r] * BASE_ALPHA
                    baseCtx.beginPath()
                    for (let c = 0; c < cols; c++) {
                        const x = OFFSET + c * PITCH
                        const y = OFFSET + r * PITCH
                        baseCtx.moveTo(x + dotRadius, y)
                        baseCtx.arc(x, y, dotRadius, 0, Math.PI * 2)
                    }
                    baseCtx.fill()
                }
            }

            iconSets = icons.map(rasterize)
            outOrder = Float32Array.from({ length: cols * rows }, Math.random)
            inOrder = Float32Array.from({ length: cols * rows }, Math.random)
            buildGlowMasks()
            resetGlow()
            buildRippleDotsMask()
            // Snap straight to the current icon so resizing never replays the
            // switch; a resize mid-reveal just shows the icon
            lit = Float32Array.from(iconSets[active] ?? [])
            from = Float32Array.from(lit)
            reveal = null
            unveil = null
            dimTarget = new Float32Array(cols * rows).fill(1)
            measureText()
            dim = Float32Array.from(dimTarget)
            fullRedraw = true
            iconUnsettled = true
            schedule()
        }

        const iconRegion = (): TRect => ({
            x0: OFFSET + (icon.c0 - 2) * PITCH,
            y0: OFFSET + (icon.r0 - 2) * PITCH,
            x1: OFFSET + (icon.c0 + icon.size + 2) * PITCH,
            y1: OFFSET + (icon.r0 + icon.size + 2) * PITCH,
        })

        const draw = (now: number) => {
            frame = 0
            const dt = lastFrame ? Math.min(48, now - lastFrame) : 16
            lastFrame = now

            for (let i = ripples.length - 1; i >= 0; i--) {
                const age = now - ripples[i].t
                if (
                    age > ripples[i].life ||
                    waveRadius(ripples[i], age) > ripples[i].clear
                ) {
                    ripples[i].glow?.remove()
                    ripples.splice(i, 1)
                }
            }
            for (const wave of ripples) {
                if (!wave.glow) continue
                const age = now - wave.t
                const ring = ringMask(wave.x, wave.y, waveRadius(wave, age))
                wave.glow.style.setProperty("mask-image", ring)
                wave.glow.style.setProperty("-webkit-mask-image", ring)
                wave.glow.style.opacity = String(
                    RIPPLE_HDR_ALPHA * waveFade(wave, age),
                )
            }

            const since = now - changedAt
            if (reveal && reveal.t >= 0 && now > reveal.end) {
                from = Float32Array.from(iconSets[active] ?? [])
                lit = Float32Array.from(from)
                reveal = null
                changedAt = -Infinity
            }
            const iconSweeping =
                !reduceMotion &&
                (reveal !== null || unveil !== null || since < SWITCH_MS)
            // How much of the grid the reveal ring has uncovered so far
            let unveilRadius = !unveil
                ? Infinity
                : unveil.t < 0
                  ? 0
                  : revealRadius(now - unveil.t, unveil.reach)
            if (unveil && unveilRadius >= unveil.clear) {
                unveil = null
                unveilRadius = Infinity
                fullRedraw = true
            }

            // Everything that changes this frame, plus what last frame drew
            const changed: TRect[] = []
            // A resting pointer's spotlight is already painted, so only a move counts
            const pointerMoved =
                pointer.x !== lastPointer.x || pointer.y !== lastPointer.y
            for (const spot of pointerMoved ? [pointer, lastPointer] : []) {
                if (isNearGrid(spot.x, spot.y)) {
                    changed.push({
                        x0: spot.x - SPOT_RADIUS,
                        y0: spot.y - SPOT_RADIUS,
                        x1: spot.x + SPOT_RADIUS,
                        y1: spot.y + SPOT_RADIUS,
                    })
                }
            }
            for (const wave of ripples) {
                const reach =
                    waveRadius(wave, now - wave.t) + RIPPLE_WIDTH + PITCH
                changed.push({
                    x0: wave.x - reach,
                    y0: wave.y - reach,
                    x1: wave.x + reach,
                    y1: wave.y + reach,
                })
            }
            if (iconUnsettled || iconSweeping) changed.push(iconRegion())

            const regions = [...changed]
            if (previousRegion) regions.push(previousRegion)
            if (fullRedraw) {
                regions.push({ x0: 0, y0: 0, x1: box.width, y1: box.height })
            }
            if (regions.length === 0) {
                lastFrame = 0
                return
            }

            // Snap the union to whole grid cells so no dot is ever half cleared
            const c0 = Math.max(
                0,
                Math.floor(
                    (Math.min(...regions.map(r => r.x0)) - OFFSET) / PITCH,
                ),
            )
            const c1 = Math.min(
                cols - 1,
                Math.ceil(
                    (Math.max(...regions.map(r => r.x1)) - OFFSET) / PITCH,
                ),
            )
            const r0 = Math.max(
                0,
                Math.floor(
                    (Math.min(...regions.map(r => r.y0)) - OFFSET) / PITCH,
                ),
            )
            const r1 = Math.min(
                rows - 1,
                Math.ceil(
                    (Math.max(...regions.map(r => r.y1)) - OFFSET) / PITCH,
                ),
            )
            const left = Math.max(0, OFFSET + c0 * PITCH - PITCH / 2)
            const top = Math.max(0, OFFSET + r0 * PITCH - PITCH / 2)
            const right = fullRedraw
                ? box.width
                : Math.min(box.width, OFFSET + c1 * PITCH + PITCH / 2)
            const bottom = fullRedraw
                ? box.height
                : Math.min(box.height, OFFSET + r1 * PITCH + PITCH / 2)
            const dpr = canvas.width / Math.max(1, box.width)

            ctx.clearRect(left, top, right - left, bottom - top)
            if (right > left && bottom > top) {
                ctx.drawImage(
                    baseLayer,
                    left * dpr,
                    top * dpr,
                    (right - left) * dpr,
                    (bottom - top) * dpr,
                    left,
                    top,
                    right - left,
                    bottom - top,
                )
                // Hide the grid the reveal ring hasn't reached yet
                if (unveil) {
                    ctx.save()
                    ctx.beginPath()
                    ctx.rect(left, top, right - left, bottom - top)
                    ctx.clip()
                    if (unveilRadius > 0) {
                        const edge = ctx.createRadialGradient(
                            unveil.x,
                            unveil.y,
                            Math.max(0, unveilRadius - REVEAL_EDGE_PX),
                            unveil.x,
                            unveil.y,
                            unveilRadius,
                        )
                        edge.addColorStop(0, "#000")
                        edge.addColorStop(1, "rgba(0,0,0,0)")
                        ctx.globalCompositeOperation = "destination-in"
                        ctx.fillStyle = edge
                        ctx.fillRect(left, top, right - left, bottom - top)
                    } else {
                        ctx.clearRect(left, top, right - left, bottom - top)
                    }
                    ctx.restore()
                }
            }

            const target = iconSets[active]
            const dimStep = 1 - Math.exp(-dt / DIM_EASE_MS)
            let dimMoving = false

            for (let r = r0; r <= r1; r++) {
                const m = mask[r]
                for (let c = c0; c <= c1; c++) {
                    const id = r * cols + c
                    const x = OFFSET + c * PITCH
                    const y = OFFSET + r * PITCH

                    if (target) {
                        if (reveal) {
                            // First icon: grow in as the full stop's ring passes
                            const grow =
                                reveal.t < 0
                                    ? 0
                                    : easeOut(
                                          clamp(
                                              (now -
                                                  reveal.t -
                                                  revealArrival(
                                                      Math.hypot(
                                                          x - reveal.x,
                                                          y - reveal.y,
                                                      ),
                                                      reveal.reach,
                                                  )) /
                                                  REVEAL_GROW_MS,
                                          ),
                                      )
                            lit[id] = target[id] * grow
                        } else if (reduceMotion) {
                            lit[id] = target[id]
                        } else if (target[id] && from[id] > 0.999) {
                            // Lit in both icons, so it just stays on
                            lit[id] = 1
                        } else {
                            const off = clamp(
                                (since - outOrder[id] * PIXEL_OUT_SPREAD_MS) /
                                    PIXEL_STEP_MS,
                            )
                            const on = clamp(
                                (since -
                                    PIXEL_IN_DELAY_MS -
                                    inOrder[id] * PIXEL_IN_SPREAD_MS) /
                                    PIXEL_STEP_MS,
                            )
                            lit[id] = Math.max(
                                from[id] * (1 - off),
                                target[id] * on,
                            )
                        }

                        dim[id] += (dimTarget[id] - dim[id]) * dimStep
                        if (Math.abs(dimTarget[id] - dim[id]) > 0.005) {
                            dimMoving = true
                        }
                    }

                    const level = (lit[id] ?? 0) * (dim[id] ?? 1)

                    let spot = 0
                    const toPointer = Math.hypot(x - pointer.x, y - pointer.y)
                    if (toPointer < SPOT_RADIUS) {
                        spot = Math.pow(1 - toPointer / SPOT_RADIUS, 1.5)
                    }

                    let tapRipple = 0
                    let revealRipple = 0
                    let wake = 0
                    for (const wave of ripples) {
                        const age = now - wave.t
                        const fade = waveFade(wave, age)
                        const behind =
                            waveRadius(wave, age) -
                            Math.hypot(x - wave.x, y - wave.y)
                        const offRing = Math.abs(behind)
                        if (offRing < RIPPLE_WIDTH) {
                            const strength = (1 - offRing / RIPPLE_WIDTH) * fade
                            if (wave.wake) {
                                revealRipple = Math.max(revealRipple, strength)
                            } else {
                                tapRipple = Math.max(tapRipple, strength)
                            }
                        }
                        if (wave.wake && behind > 0) {
                            wake = Math.max(
                                wake,
                                Math.exp(-behind / REVEAL_WAKE_PX) * fade,
                            )
                        }
                    }
                    // Nothing shows ahead of the reveal ring
                    if (
                        unveil &&
                        Math.hypot(x - unveil.x, y - unveil.y) > unveilRadius
                    )
                        continue
                    // Untouched dots are already on the base layer
                    if (
                        level < 0.001 &&
                        spot === 0 &&
                        tapRipple === 0 &&
                        revealRipple === 0 &&
                        wake < 0.01
                    )
                        continue

                    // Spotlight and tap ripples only brighten dots that exist;
                    // the logo reveal wave also lights dots through the top
                    // fade around the logo dot, while still fading at the bottom.
                    const waveMask = y < box.height * 0.5 ? 1 : m
                    const base = m * BASE_ALPHA
                    const alpha = Math.min(
                        1,
                        Math.max(base, level * ICON_ALPHA) +
                            (spot * 0.3 + tapRipple * 0.6) *
                                Math.max(m, level) +
                            (revealRipple * 0.6 + wake * REVEAL_WAKE_ALPHA) *
                                Math.max(waveMask, level),
                    )
                    // Painted over the base dot, so only add what's missing
                    const overlay = (alpha - base) / (1 - base)
                    if (overlay < 0.005) continue

                    let color = WHITE
                    if (lit[id] > 0) {
                        const along = clamp(
                            ((c - icon.c0) / icon.size +
                                (1 - (r - icon.r0) / icon.size)) /
                                2,
                        )
                        color = mix(color, mix(SKY, BLUE, along), lit[id])
                    }
                    const tint = Math.max(
                        Math.max(spot * 0.5, tapRipple * 0.85) * m,
                        Math.max(revealRipple * 0.85, wake * 0.85) * waveMask,
                    )
                    if (tint > 0) {
                        color = mix(color, mix(SKY, BLUE, c / cols), tint)
                    }

                    ctx.fillStyle = `rgba(${color[0] | 0},${color[1] | 0},${color[2] | 0},${overlay})`
                    ctx.beginPath()
                    ctx.arc(
                        x,
                        y,
                        dotRadius +
                            (ICON_RADIUS - dotRadius) * level +
                            dotRadius *
                                (tapRipple * 0.55 * m +
                                    (revealRipple * 0.55 + wake * 0.3) *
                                        waveMask),
                        0,
                        Math.PI * 2,
                    )
                    ctx.fill()
                }
            }

            fullRedraw = false
            iconUnsettled = iconSweeping || dimMoving
            // Remember the raw changed area (not the snapped one) so the region
            // doesn't creep outward by a cell every frame
            previousRegion =
                changed.length > 0
                    ? {
                          x0: Math.min(...changed.map(r => r.x0)),
                          y0: Math.min(...changed.map(r => r.y0)),
                          x1: Math.max(...changed.map(r => r.x1)),
                          y1: Math.max(...changed.map(r => r.y1)),
                      }
                    : null
            lastPointer.x = pointer.x
            lastPointer.y = pointer.y

            canvas.style.opacity = "1"
            if (ripples.length > 0 || iconUnsettled || previousRegion) {
                schedule()
            } else {
                lastFrame = 0
            }
        }

        const toLocal = (event: PointerEvent) => ({
            x: event.clientX - box.left,
            y: event.clientY - box.top,
        })

        const isNearGrid = (x: number, y: number) =>
            x > -SPOT_RADIUS &&
            x < box.width + SPOT_RADIUS &&
            y > -SPOT_RADIUS &&
            y < box.height + SPOT_RADIUS

        const onPointerMove = (event: PointerEvent) => {
            if (!finePointer || event.pointerType !== "mouse") return
            const wasNear = isNearGrid(pointer.x, pointer.y)
            const { x, y } = toLocal(event)
            pointer.x = x
            pointer.y = y
            // Only redraw while the spotlight is (or just was) over the grid
            if (wasNear || isNearGrid(x, y)) schedule()
        }

        const onPointerLeave = () => {
            pointer.x = -1e4
            pointer.y = -1e4
            schedule()
        }

        const onPointerDown = (event: PointerEvent) => {
            if (reduceMotion) return
            const { x, y } = toLocal(event)
            const row = Math.round((y - OFFSET) / PITCH)
            if (x < 0 || x > box.width || row < 0 || row >= rows) return
            if (mask[row] < 0.05) return
            addRipple(x, y)
        }

        const unsubscribe = $activeRole.subscribe(index => {
            if (index === active) return
            from = Float32Array.from(lit)
            reveal = null
            active = index
            changedAt = performance.now()
            crossfadeGlow(index)
            // Text widths change with the scroller, so re-measure once it settles
            iconUnsettled = true
            later(measureText, 0)
            later(() => {
                measureText()
                iconUnsettled = true
                schedule()
            }, 750)
            schedule()
        })

        let laidOutSize = ""
        const resizeObserver = new ResizeObserver(() => {
            const { width, height } = canvas.getBoundingClientRect()
            const size = `${width}x${height}`
            if (size === laidOutSize) return
            laidOutSize = size
            layout()
        })
        resizeObserver.observe(canvas)
        // Dev only: editing the --matrix-* values hot-swaps the CSS, so lay the
        // grid out again to pick them up without a reload
        const relayout = () => layout()
        import.meta.hot?.on("vite:afterUpdate", relayout)
        document.fonts?.ready.then(() => {
            measureText()
            iconUnsettled = true
            schedule()
        })

        const onMotionChange = (event: MediaQueryListEvent) => {
            reduceMotion = event.matches
            if (reduceMotion) clearRipples()
            resetGlow()
            buildRippleDotsMask()
            iconUnsettled = true
            schedule()
        }
        motionQuery.addEventListener("change", onMotionChange)

        // e.g. the window moves between an HDR and an SDR display
        const onHdrChange = () => {
            ripples.forEach(wave => {
                wave.glow?.remove()
                wave.glow = undefined
            })
            buildGlowMasks()
            resetGlow()
            buildRippleDotsMask()
            fadeInGlow()
        }
        hdrQuery.addEventListener("change", onHdrChange)

        // Testing aid: add ?hdr-debug to the URL for an on-screen HDR toggle.
        // Dev server only; production builds strip this block
        let debugToggle: HTMLButtonElement | null = null
        if (
            import.meta.env.DEV &&
            new URLSearchParams(window.location.search).has("hdr-debug")
        ) {
            debugToggle = document.createElement("button")
            const label = () => {
                debugToggle!.textContent = `HDR glow: ${hdrEnabled ? "on" : "off"} · screen: ${hdrQuery.matches ? "HDR" : "SDR"}`
            }
            Object.assign(debugToggle.style, {
                position: "fixed",
                right: "12px",
                bottom: "calc(env(safe-area-inset-bottom) + 12px)",
                zIndex: "60",
                padding: "8px 12px",
                borderRadius: "999px",
                border: "1px solid rgba(255,255,255,0.25)",
                background: "rgba(18,18,18,0.85)",
                color: "#fff",
                font: "12px system-ui, sans-serif",
            })
            debugToggle.addEventListener("click", () => {
                hdrEnabled = !hdrEnabled
                onHdrChange()
                label()
            })
            label()
            document.body.append(debugToggle)
        }

        layout()
        laidOutSize = `${box.width}x${box.height}`
        // First icon: radiate out from the corner logo's blue dot (right as it
        // locks on during the initial boot, or shortly after mount on revisit).
        const origin = document.querySelector("[data-matrix-origin]")
        let unsubscribeBoot: (() => void) | undefined
        if (origin && !reduceMotion) {
            const pending = { t: -1, x: 0, y: 0, reach: 1, end: Infinity }
            reveal = pending
            unveil = { t: -1, x: 0, y: 0, reach: 1, clear: Infinity }
            // The ring is the fade in, so skip the canvas's own
            canvas.style.transition = "none"
            glowLayers.forEach(layer => snapOpacity(layer, "0"))
            lit = new Float32Array(cols * rows)
            from = new Float32Array(cols * rows)

            const triggerReveal = () => {
                if (reveal !== pending) return
                measureText()
                dim = Float32Array.from(dimTarget)
                const dot = origin.getBoundingClientRect()
                const x = dot.left + dot.width / 2 - box.left
                const y = dot.top + dot.height / 2 - box.top
                const corners = [
                    [icon.c0 - 1, icon.r0 - 1],
                    [icon.c0 + icon.size + 1, icon.r0 + icon.size + 1],
                    [icon.c0 - 1, icon.r0 + icon.size + 1],
                    [icon.c0 + icon.size + 1, icon.r0 - 1],
                ].map(([c, r]) =>
                    Math.hypot(OFFSET + c * PITCH - x, OFFSET + r * PITCH - y),
                )
                const farthest = Math.max(
                    ...[
                        [0, 0],
                        [box.width, 0],
                        [0, box.height],
                        [box.width, box.height],
                    ].map(([cx, cy]) => Math.hypot(cx - x, cy - y)),
                )
                const reach = REVEAL_OVERSHOOT * farthest
                const t = performance.now()
                reveal = {
                    t,
                    x,
                    y,
                    reach,
                    end:
                        t +
                        revealArrival(Math.max(...corners), reach) +
                        REVEAL_GROW_MS,
                }
                unveil = {
                    t,
                    x,
                    y,
                    reach,
                    clear: farthest + REVEAL_EDGE_PX,
                }
                // Kept until its lit wake has left the grid too
                addRipple(
                    x,
                    y,
                    REVEAL_RING_MS,
                    reach,
                    farthest + 4 * REVEAL_WAKE_PX,
                )
                fadeInGlow()
                // Re-measure once the staggered hero text finishes translating in
                later(() => {
                    measureText()
                    iconUnsettled = true
                    schedule()
                }, 1150)
            }

            if (document.documentElement.dataset.homeBoot === "true") {
                const scheduleFromBoot = (startedAt: number) => {
                    const elapsed = performance.now() - startedAt
                    later(
                        triggerReveal,
                        Math.max(0, HOME_BOOT_WAVE_MS - elapsed),
                    )
                }
                const startedAt = $homeBootStart.get()
                if (startedAt !== null) {
                    scheduleFromBoot(startedAt)
                } else {
                    unsubscribeBoot = $homeBootStart.subscribe(at => {
                        if (at === null) return
                        unsubscribeBoot?.()
                        unsubscribeBoot = undefined
                        scheduleFromBoot(at)
                    })
                }
            } else {
                later(triggerReveal, REVEAL_DELAY_MS)
            }
        } else {
            from = new Float32Array(cols * rows)
            changedAt = performance.now()
            fadeInGlow()
        }

        window.addEventListener("pointermove", onPointerMove)
        document.documentElement.addEventListener(
            "pointerleave",
            onPointerLeave,
        )
        window.addEventListener("pointerdown", onPointerDown)

        return () => {
            cancelAnimationFrame(frame)
            clearRipples()
            timers.forEach(clearTimeout)
            motionQuery.removeEventListener("change", onMotionChange)
            hdrQuery.removeEventListener("change", onHdrChange)
            debugToggle?.remove()
            unsubscribe()
            unsubscribeBoot?.()
            resizeObserver.disconnect()
            import.meta.hot?.off("vite:afterUpdate", relayout)
            window.removeEventListener("pointermove", onPointerMove)
            document.documentElement.removeEventListener(
                "pointerleave",
                onPointerLeave,
            )
            window.removeEventListener("pointerdown", onPointerDown)
        }
    }, [])

    return (
        <div aria-hidden className={cn("pointer-events-none", className)}>
            <canvas
                ref={canvasRef}
                className="absolute inset-0 size-full opacity-0 transition-opacity duration-700"
            />
            <div
                ref={rippleGlowRef}
                className="absolute inset-0"
                style={{ display: "none" }}
            />
            {[0, 1].map(i => (
                <div
                    key={i}
                    ref={el => {
                        glowRefs.current[i] = el
                    }}
                    className="absolute inset-0 bg-[url('/hdr-glow.avif')] bg-cover opacity-0"
                    style={{ display: "none" }}
                />
            ))}
        </div>
    )
}

export default DotMatrix
