import { $activeRole } from "@store/uiStore"
import { cn } from "@utils/cn"
import { useEffect, useRef } from "react"

type DotMatrixProps = {
    className?: string
    // One icon per role (SVG path data on a 24x24 grid), lit up for $activeRole
    icons?: string[][]
}

type TRgb = [number, number, number]
type TRect = { x0: number; y0: number; x1: number; y1: number }

// Grid matches the old /dot-matrix.svg tile: 11px pitch, 1.5px dots at 30% white
const PITCH = 11
const OFFSET = 6
const DOT_RADIUS = 1.5
const BASE_ALPHA = 0.3

const ICON_ALPHA = 0.72
const ICON_GROWTH = 0.45
const ICON_FADE_MS = 650
const ICON_MAX_DOTS = 52
// Share of the area the icon may take. On desktop the area is the whole hero,
// so the icon sits top-right and only overlaps the copy slightly
const ICON_SLOT_FILL_X = 0.48
const ICON_SLOT_FILL_Y = 0.76
const ICON_MATRIX_FILL = 0.9
// Time for the diagonal sweep to cross the icon, whatever its size
const ICON_SWEEP_MS = 250

// Dots behind text are dimmed so the icon never fights the copy
const TEXT_DIM = 0.6
const TEXT_PAD = 4
const TEXT_SOFTNESS = 11
const DIM_EASE_MS = 250

const SPOT_RADIUS = 115
const RIPPLE_SPEED = 0.38
const RIPPLE_WIDTH = 22
const RIPPLE_LIFE_MS = 1500
// Each role change sends a pulse in from a random spot on the grid's edge,
// shortly after the icon sweep starts
const ROLE_PULSE_DELAY_MS = 200
const ROLE_PULSE_MIN_MASK = 0.5
const ROLE_PULSE_EDGE_DOTS = 3
// Min distance from the previous pulse, as a share of the grid's diagonal
const ROLE_PULSE_MIN_GAP = 0.3
const ROLE_PULSE_TRIES = 12

const WHITE: TRgb = [255, 255, 255]
const SKY: TRgb = [224, 242, 254]
const BLUE: TRgb = [96, 165, 250]

const clamp = (value: number) => Math.min(1, Math.max(0, value))
const easeInOut = (t: number) =>
    t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
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
        let dim = new Float32Array(0)
        let dimTarget = new Float32Array(0)
        let iconSets: Uint8Array[] = []
        // Icon footprint on the grid; `fill` spans the whole matrix (mobile)
        let icon = { c0: 0, r0: 0, size: 0, fill: false }

        let active = $activeRole.get()
        let changedAt = performance.now()
        let frame = 0
        let lastFrame = 0
        const pointer = { x: -1e4, y: -1e4 }
        const ripples: { x: number; y: number; t: number }[] = []
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

        // Anchors the icon to the top-right of the slot, or of the whole matrix
        // when there's no visible slot (mobile)
        const placeIcon = () => {
            const slot = document
                .querySelector<HTMLElement>("[data-matrix-icon-slot]")
                ?.getBoundingClientRect()
            const fill = !slot || slot.width === 0 || slot.height === 0
            const area = fill
                ? { left: 0, top: 0, width: box.width, height: box.height }
                : {
                      left: slot.left - box.left,
                      top: slot.top - box.top,
                      width: slot.width,
                      height: slot.height,
                  }

            const size = Math.min(
                ICON_MAX_DOTS,
                Math.floor(
                    Math.min(
                        area.width *
                            (fill ? ICON_MATRIX_FILL : ICON_SLOT_FILL_X),
                        area.height *
                            (fill ? ICON_MATRIX_FILL : ICON_SLOT_FILL_Y),
                    ) / PITCH,
                ),
            )
            const lastCol = Math.floor(
                (area.left + area.width - OFFSET) / PITCH,
            )
            const firstRow = Math.ceil((area.top - OFFSET) / PITCH)
            // Margin (in dots) keeping the icon in from the top-right corner
            const insetCols = fill ? 2 : 4
            const insetRows = fill ? 2 : 4
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

            const span = (icon.size + 2) * PITCH
            const unit = (icon.size * PITCH) / 24
            const strokeDots = icon.fill ? 2.6 : 4
            const offscreen = document.createElement("canvas")
            offscreen.width = span
            offscreen.height = span
            const off = offscreen.getContext("2d", {
                willReadFrequently: true,
            })
            if (!off) return set

            off.translate(PITCH, PITCH)
            off.scale(unit, unit)
            off.lineWidth = (strokeDots * PITCH) / unit
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

        const layout = () => {
            box = canvas.getBoundingClientRect()
            const dpr = window.devicePixelRatio || 1
            canvas.width = Math.round(box.width * dpr)
            canvas.height = Math.round(box.height * dpr)
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

            cols = Math.max(0, Math.floor((box.width - OFFSET) / PITCH) + 1)
            rows = Math.max(0, Math.floor((box.height - OFFSET) / PITCH) + 1)
            mask = new Float32Array(rows).map((_, r) =>
                fadeMask(clamp((OFFSET + r * PITCH) / box.height)),
            )

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
                        baseCtx.moveTo(x + DOT_RADIUS, y)
                        baseCtx.arc(x, y, DOT_RADIUS, 0, Math.PI * 2)
                    }
                    baseCtx.fill()
                }
            }

            placeIcon()
            iconSets = icons.map(rasterize)
            // Snap straight to the current icon so resizing never replays the sweep
            lit = Float32Array.from(iconSets[active] ?? [])
            from = Float32Array.from(lit)
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
                if (now - ripples[i].t > RIPPLE_LIFE_MS) ripples.splice(i, 1)
            }

            const since = now - changedAt
            const iconSweeping =
                !reduceMotion && since < ICON_SWEEP_MS + ICON_FADE_MS

            // Everything that changes this frame, plus what last frame drew
            const changed: TRect[] = []
            for (const spot of [pointer, lastPointer]) {
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
                    (now - wave.t) * RIPPLE_SPEED + RIPPLE_WIDTH + PITCH
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
            }

            const target = iconSets[active]
            const stagger = ICON_SWEEP_MS / Math.max(1, 2 * icon.size)
            const dimStep = 1 - Math.exp(-dt / DIM_EASE_MS)
            let dimMoving = false

            for (let r = r0; r <= r1; r++) {
                const m = mask[r]
                for (let c = c0; c <= c1; c++) {
                    const id = r * cols + c
                    const x = OFFSET + c * PITCH
                    const y = OFFSET + r * PITCH

                    if (target) {
                        const delay =
                            Math.max(0, c - icon.c0 + (r - icon.r0)) * stagger
                        const t = reduceMotion
                            ? 1
                            : clamp((since - delay) / ICON_FADE_MS)
                        lit[id] =
                            from[id] + (target[id] - from[id]) * easeInOut(t)

                        dim[id] += (dimTarget[id] - dim[id]) * dimStep
                        if (Math.abs(dimTarget[id] - dim[id]) > 0.005) {
                            dimMoving = true
                        }
                    }

                    const level =
                        (lit[id] ?? 0) *
                        (icon.fill ? 0.5 + 0.5 * Math.sqrt(m) : 1) *
                        (dim[id] ?? 1)

                    let spot = 0
                    const toPointer = Math.hypot(x - pointer.x, y - pointer.y)
                    if (toPointer < SPOT_RADIUS) {
                        spot = Math.pow(1 - toPointer / SPOT_RADIUS, 1.5)
                    }

                    let ripple = 0
                    for (const wave of ripples) {
                        const age = now - wave.t
                        const offRing = Math.abs(
                            Math.hypot(x - wave.x, y - wave.y) -
                                age * RIPPLE_SPEED,
                        )
                        if (offRing < RIPPLE_WIDTH) {
                            ripple = Math.max(
                                ripple,
                                (1 - offRing / RIPPLE_WIDTH) *
                                    Math.pow(1 - age / RIPPLE_LIFE_MS, 1.5),
                            )
                        }
                    }
                    // Untouched dots are already on the base layer
                    if (level < 0.001 && spot === 0 && ripple === 0) continue

                    // Spotlight and ripple only ever brighten dots that exist,
                    // so they fade out with the grid instead of spilling past it
                    const base = m * BASE_ALPHA
                    const alpha = Math.min(
                        1,
                        Math.max(base, level * ICON_ALPHA) +
                            (spot * 0.3 + ripple * 0.6) * Math.max(m, level),
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
                    const tint = Math.max(spot * 0.5, ripple * 0.85) * m
                    if (tint > 0) {
                        color = mix(color, mix(SKY, BLUE, c / cols), tint)
                    }

                    ctx.fillStyle = `rgba(${color[0] | 0},${color[1] | 0},${color[2] | 0},${overlay})`
                    ctx.beginPath()
                    ctx.arc(
                        x,
                        y,
                        DOT_RADIUS *
                            (1 + level * ICON_GROWTH + ripple * 0.3 * m),
                        0,
                        Math.PI * 2,
                    )
                    ctx.fill()
                }
            }

            fullRedraw = false
            iconUnsettled = iconSweeping || dimMoving
            previousRegion =
                changed.length > 0
                    ? { x0: left, y0: top, x1: right, y1: bottom }
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
            ripples.push({ x, y, t: performance.now() })
            schedule()
        }

        // Pulse from a random dot along the edge of the visible grid, so the
        // ring rolls in across it. Sides are picked in proportion to their
        // length, and a spot too close to the last pulse is re-rolled
        let lastPulse: { x: number; y: number } | null = null
        const pulseFromEdge = () => {
            const visibleRows = [...mask.keys()].filter(
                r => mask[r] >= ROLE_PULSE_MIN_MASK,
            )
            if (visibleRows.length === 0 || cols === 0) return

            const top = visibleRows[0]
            const bottom = visibleRows[visibleRows.length - 1]
            const height = bottom - top + 1
            const depth = () =>
                Math.floor(
                    Math.random() * Math.min(ROLE_PULSE_EDGE_DOTS, height),
                )
            const anyCol = () => Math.floor(Math.random() * cols)
            const anyRow = () => top + Math.floor(Math.random() * height)

            const randomEdgeSpot = () => {
                let col: number
                let row: number
                const pick = Math.random() * 2 * (cols + height)
                if (pick < cols) {
                    col = anyCol()
                    row = top + depth()
                } else if (pick < 2 * cols) {
                    col = anyCol()
                    row = bottom - depth()
                } else if (pick < 2 * cols + height) {
                    col = depth()
                    row = anyRow()
                } else {
                    col = cols - 1 - depth()
                    row = anyRow()
                }
                return { x: OFFSET + col * PITCH, y: OFFSET + row * PITCH }
            }

            const minGap =
                Math.hypot(cols * PITCH, height * PITCH) * ROLE_PULSE_MIN_GAP
            let spot = randomEdgeSpot()
            for (
                let tries = 1;
                lastPulse && tries < ROLE_PULSE_TRIES;
                tries++
            ) {
                const gap = Math.hypot(
                    spot.x - lastPulse.x,
                    spot.y - lastPulse.y,
                )
                if (gap >= minGap) break
                const candidate = randomEdgeSpot()
                const candidateGap = Math.hypot(
                    candidate.x - lastPulse.x,
                    candidate.y - lastPulse.y,
                )
                if (candidateGap > gap) spot = candidate
            }

            lastPulse = spot
            ripples.push({ ...spot, t: performance.now() })
            schedule()
        }

        const unsubscribe = $activeRole.subscribe(index => {
            if (index === active) return
            from = Float32Array.from(lit)
            active = index
            changedAt = performance.now()
            // Text widths change with the scroller, so re-measure once it settles
            iconUnsettled = true
            later(measureText, 0)
            later(() => {
                measureText()
                iconUnsettled = true
                schedule()
            }, 750)
            if (!reduceMotion) later(pulseFromEdge, ROLE_PULSE_DELAY_MS)
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
        document.fonts?.ready.then(() => {
            measureText()
            iconUnsettled = true
            schedule()
        })

        const onMotionChange = (event: MediaQueryListEvent) => {
            reduceMotion = event.matches
            if (reduceMotion) ripples.length = 0
            iconUnsettled = true
            schedule()
        }
        motionQuery.addEventListener("change", onMotionChange)

        layout()
        laidOutSize = `${box.width}x${box.height}`
        // First paint sweeps the starting icon in
        from = new Float32Array(cols * rows)
        changedAt = performance.now()

        window.addEventListener("pointermove", onPointerMove)
        document.documentElement.addEventListener(
            "pointerleave",
            onPointerLeave,
        )
        window.addEventListener("pointerdown", onPointerDown)

        return () => {
            cancelAnimationFrame(frame)
            timers.forEach(clearTimeout)
            motionQuery.removeEventListener("change", onMotionChange)
            unsubscribe()
            resizeObserver.disconnect()
            window.removeEventListener("pointermove", onPointerMove)
            document.documentElement.removeEventListener(
                "pointerleave",
                onPointerLeave,
            )
            window.removeEventListener("pointerdown", onPointerDown)
        }
    }, [])

    return (
        <canvas
            ref={canvasRef}
            aria-hidden
            className={cn(
                "pointer-events-none opacity-0 transition-opacity duration-700",
                className,
            )}
        />
    )
}

export default DotMatrix
