// Bundled Astro scripts run once; bind page behavior after each router swap
// and release observers, subscriptions and timers before its DOM is removed.
export function onPageLoad(
    setup: (signal: AbortSignal) => void | (() => void),
) {
    let cleanup: (() => void) | undefined

    const dispose = () => {
        cleanup?.()
        cleanup = undefined
    }

    document.addEventListener("astro:before-swap", dispose)
    document.addEventListener("astro:page-load", () => {
        dispose()
        const controller = new AbortController()
        const release = setup(controller.signal)
        cleanup = () => {
            controller.abort()
            release?.()
        }
    })
}
