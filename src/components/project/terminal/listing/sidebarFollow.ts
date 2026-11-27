// Keep the active row about 40% down the fixed sidebar when it has overflowed.
export function createSidebarFollow(
    sidebar: HTMLElement,
    reduced: MediaQueryList,
) {
    const track = sidebar.querySelector<HTMLElement>("[data-ls-track]")!
    let offset = 0
    let goal = 0
    let frame = 0
    let last = 0
    let fade = 0

    const paint = () => {
        track.style.transform = `translate3d(0, ${-offset}px, 0)`
        const nextFade = Math.min(offset, 48)
        if (nextFade === fade) return
        fade = nextFade
        sidebar.style.setProperty("--ls-fade", `${fade}px`)
    }
    const step = (now: number) => {
        const elapsed = last ? now - last : 16
        last = now
        offset += (goal - offset) * (1 - Math.exp(-elapsed / 140))
        if (Math.abs(goal - offset) < 0.3) offset = goal
        paint()
        frame = offset === goal ? 0 : requestAnimationFrame(step)
    }
    const stop = () => {
        cancelAnimationFrame(frame)
        frame = 0
    }
    const follow = (end = false) => {
        const row = sidebar.querySelector<HTMLElement>(
            "[data-ls-row][data-active]",
        )
        if (!end && (!row || row.closest("[hidden]"))) return
        const height = sidebar.clientHeight
        const max = Math.max(0, track.offsetHeight - height)
        if (end) {
            goal = max
        } else {
            const bounds = row!.getBoundingClientRect()
            const at = bounds.top - track.getBoundingClientRect().top
            goal = Math.min(
                max,
                Math.max(0, at + bounds.height / 2 - height * 0.4),
            )
        }
        if (reduced.matches) {
            stop()
            offset = goal
            paint()
        } else if (!frame && offset !== goal) {
            last = 0
            frame = requestAnimationFrame(step)
        }
    }

    return { follow, stop }
}
