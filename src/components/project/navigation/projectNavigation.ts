export type ActiveProject = {
    id: string
    category: string
    position: number
    total: number
}

export function createProjectNavigation(
    page: HTMLElement,
    signal: AbortSignal,
    reduced: MediaQueryList,
) {
    const cards = [...page.querySelectorAll<HTMLElement>("[data-project-card]")]
    const header = document.querySelector("h1")
    const counts = new Map<string, number>()
    const projects = cards
        .map(card => {
            const category = card.dataset.category!
            const position = (counts.get(category) ?? 0) + 1
            counts.set(category, position)
            return { id: card.id, category, position }
        })
        .map(project => ({ ...project, total: counts.get(project.category)! }))

    const cardById = new Map(cards.map(card => [card.id, card]))
    const behavior = (): ScrollBehavior =>
        reduced.matches ? "instant" : "smooth"
    const jumpTo = (id: string) =>
        cardById
            .get(id)
            ?.scrollIntoView({ block: "start", behavior: behavior() })

    const atBottom = () =>
        scrollY >= document.documentElement.scrollHeight - innerHeight - 2

    function watch(
        onActive: (project: ActiveProject) => void,
        isListingOpen: () => boolean,
    ) {
        let current = -1
        let frame = 0
        let tops: number[] = []
        let line = 0
        let maxScroll = 0
        let needsMeasure = true

        const measure = () => {
            const y = scrollY
            const headerBottom = header?.getBoundingClientRect().bottom ?? 200
            line = headerBottom + (innerHeight - headerBottom) * 0.3
            tops = cards.map(card => card.getBoundingClientRect().top + y)
            maxScroll = document.documentElement.scrollHeight - innerHeight
            needsMeasure = false
        }
        const update = () => {
            frame = 0
            if (needsMeasure) measure()
            if (isListingOpen()) return
            const y = scrollY
            let next = 0
            if (y >= maxScroll - 4) {
                next = cards.length - 1
            } else {
                while (next + 1 < tops.length && tops[next + 1] <= y + line)
                    next++
            }
            if (next === current || !projects[next]) return
            current = next
            onActive(projects[next])
        }
        const schedule = () => {
            if (!frame) frame = requestAnimationFrame(update)
        }
        const invalidate = () => {
            needsMeasure = true
            schedule()
        }

        addEventListener("scroll", schedule, { signal, passive: true })
        addEventListener("resize", invalidate, { signal, passive: true })
        const observer = new ResizeObserver(invalidate)
        observer.observe(page)
        if (header) observer.observe(header)

        addEventListener(
            "keydown",
            event => {
                if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return
                if (event.defaultPrevented || isListingOpen()) return
                if (
                    event.altKey ||
                    event.ctrlKey ||
                    event.metaKey ||
                    event.shiftKey
                )
                    return
                if (
                    event.target instanceof Element &&
                    event.target.closest(
                        "input, textarea, select, [contenteditable]",
                    )
                )
                    return

                const next =
                    projects[current + (event.key === "ArrowDown" ? 1 : -1)]
                event.preventDefault()
                if (next) jumpTo(next.id)
                else if (event.key === "ArrowUp")
                    scrollTo({ top: 0, behavior: behavior() })
            },
            { signal },
        )
        signal.addEventListener(
            "abort",
            () => {
                observer.disconnect()
                cancelAnimationFrame(frame)
            },
            { once: true },
        )

        update()
    }

    return { jumpTo, watch, atBottom, behavior }
}
