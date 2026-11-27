import type { ActiveProject } from "../navigation/projectNavigation"
import { createSidebarFollow } from "./listing/sidebarFollow"
import { pause, typeCommand } from "./terminalTyping"

const PRINT_PAUSE_MS = 90
const EGG_PUSH = 240
const EGG_PULL = 90
const EGG_COOLDOWN_MS = 1000

type Navigation = {
    atBottom: () => boolean
    jumpTo: (id: string) => void
    behavior: () => ScrollBehavior
}

export function createProjectsTerminal(
    page: HTMLElement,
    signal: AbortSignal,
    reduced: MediaQueryList,
    navigation: Navigation,
) {
    const desktop = matchMedia("(min-width: 64rem)")
    const sidebar = page.querySelector<HTMLElement>("[data-ls]")!
    const bar = page.querySelector<HTMLElement>("[data-pb]")!
    const toggle = bar.querySelector<HTMLButtonElement>("[data-pb-toggle]")!
    const barCommand = bar.querySelector<HTMLElement>("[data-pb-cmd]")!
    const barCount = bar.querySelector<HTMLElement>("[data-pb-count]")!
    const desktopPrompt =
        sidebar.querySelector<HTMLElement>("[data-egg-prompt]")!
    const mobilePrompt = page.querySelector<HTMLElement>(
        "[data-egg-slot] [data-egg-prompt]",
    )!
    const exchanges = [
        ...page.querySelectorAll<HTMLTemplateElement>("[data-egg-exchange]"),
    ]
    const listings = [
        ...sidebar.querySelectorAll<HTMLElement>("[data-ls-block]"),
    ]
    const { follow, stop } = createSidebarFollow(sidebar, reduced)

    let view = new AbortController()
    let retype: AbortController | undefined
    let active: ActiveProject | undefined
    let nextListing = 0
    let furthestListing = 1
    let busy = false
    let desktopUnlocked = false
    let cooldownUntil = 0
    const transcript: HTMLElement[] = []
    let previousOverflow: string | undefined

    const isOpen = () => bar.hasAttribute("data-open")
    const setOpen = (open: boolean) => {
        if (isOpen() === open) return
        bar.toggleAttribute("data-open", open)
        toggle.setAttribute("aria-expanded", String(open))
        const style = document.documentElement.style
        if (open) {
            previousOverflow = style.overflow
            style.overflow = "hidden"
        } else if (previousOverflow !== undefined) {
            style.overflow = previousOverflow
            previousOverflow = undefined
        }
    }

    const updatePrompts = () => {
        const done = transcript.length >= exchanges.length
        for (const prompt of [desktopPrompt, mobilePrompt]) {
            const locked = prompt === desktopPrompt && !desktopUnlocked
            prompt.toggleAttribute("data-locked", locked)
            prompt.toggleAttribute("data-done", done)
            if (locked || done) {
                prompt.removeAttribute("role")
                prompt.removeAttribute("tabindex")
                prompt.removeAttribute("aria-label")
            } else {
                prompt.setAttribute("role", "button")
                prompt.tabIndex = 0
                prompt.setAttribute("aria-label", "Run the next command")
            }
        }
    }

    const unlockDesktop = () => {
        if (desktopUnlocked) return
        desktopUnlocked = true
        updatePrompts()
    }

    const unlockAfterOutput = async (output: Element, run: AbortSignal) => {
        // The final row's visibility transition includes its stagger delay.
        const printing = output.lastElementChild?.getAnimations() ?? []
        await Promise.allSettled(printing.map(animation => animation.finished))
        if (!run.aborted) unlockDesktop()
    }

    const printImmediately = (block: HTMLElement) => {
        const command = block.querySelector<HTMLElement>("[data-ls-cmd]")!
        block.hidden = false
        command.textContent = command.dataset.text!
        command.removeAttribute("data-typing")
        block.querySelector("[data-ls-out]")!.setAttribute("data-in", "")
    }

    async function printBlock(block: HTMLElement, isEgg = false) {
        const run = view.signal
        const isDesktop = desktop.matches
        const prompt = isDesktop ? desktopPrompt : mobilePrompt
        const command = block.querySelector<HTMLElement>("[data-ls-cmd]")!
        const output = block.querySelector<HTMLElement>("[data-ls-out]")!
        const finishNow = () =>
            reduced.matches || (!isEgg && nextListing <= furthestListing)
        const ensureVisible = (element: HTMLElement) => {
            if (isDesktop) {
                follow(isEgg)
            } else {
                const over =
                    element.getBoundingClientRect().bottom - (innerHeight - 24)
                if (over > 0)
                    scrollBy({ top: over, behavior: navigation.behavior() })
            }
        }

        block.hidden = false
        ensureVisible(block)
        if (finishNow()) {
            printImmediately(block)
        } else {
            if (isDesktop) prompt.hidden = true
            else prompt.style.visibility = "hidden"
            command.textContent = ""
            command.toggleAttribute("data-typing", true)
            if (
                !(await typeCommand(
                    command,
                    command.dataset.text!,
                    run,
                    finishNow,
                )) ||
                run.aborted
            )
                return
            command.removeAttribute("data-typing")
            if (!(await pause(PRINT_PAUSE_MS, run)) || run.aborted) return
            output.setAttribute("data-in", "")
        }

        prompt.hidden = false
        prompt.style.visibility = ""
        ensureVisible(isDesktop ? block : prompt)

        if (block.dataset.lsBlock === "hackathon") {
            await unlockAfterOutput(output, run)
        }
    }

    const printListings = async () => {
        if (busy) return
        const run = view.signal
        busy = true
        while (!run.aborted && nextListing <= furthestListing) {
            await printBlock(listings[nextListing++])
        }
        if (!run.aborted) busy = false
    }

    const markCurrent = (
        terminal: HTMLElement,
        project: ActiveProject,
        categoryChanged: boolean,
    ) => {
        terminal
            .querySelector("[data-ls-row][data-active]")
            ?.removeAttribute("data-active")
        terminal
            .querySelector(`[data-ls-row="${project.id}"]`)
            ?.setAttribute("data-active", "")
        if (!categoryChanged) return
        terminal
            .querySelector("[data-ls-dir][data-active]")
            ?.removeAttribute("data-active")
        terminal
            .querySelector(`[data-ls-dir="${project.category}"]`)
            ?.setAttribute("data-active", "")
        terminal
            .querySelector("[data-ls-block][data-on]")
            ?.removeAttribute("data-on")
        terminal
            .querySelector(`[data-ls-block="${project.category}"]`)
            ?.setAttribute("data-on", "")
    }

    const markSidebar = (project: ActiveProject, categoryChanged: boolean) => {
        markCurrent(sidebar, project, categoryChanged)
        const requested = listings.findIndex(
            block => block.dataset.lsBlock === project.category,
        )
        furthestListing = Math.max(furthestListing, requested)
    }

    const markBar = (
        project: ActiveProject,
        categoryChanged: boolean,
        instant = false,
    ) => {
        markCurrent(bar, project, categoryChanged)
        barCount.textContent = `${project.position}/${project.total}`
        if (!categoryChanged) return
        retype?.abort()
        retype = new AbortController()
        const next = bar.querySelector<HTMLElement>(
            `[data-ls-block="${project.category}"] [data-ls-cmd]`,
        )!
        const run = AbortSignal.any([view.signal, retype.signal])
        void typeCommand(
            barCommand,
            next.dataset.text!,
            run,
            () => instant || reduced.matches,
        )
    }

    const setActive = (project: ActiveProject) => {
        const categoryChanged = active?.category !== project.category
        active = project
        if (desktop.matches) {
            markSidebar(project, categoryChanged)
            if (!busy) follow()
            void printListings()
        } else {
            markBar(project, categoryChanged)
        }
    }

    function placeExchange(block: HTMLElement, index: number) {
        if (desktop.matches) {
            block.className = index === 0 ? "mt-10 mb-4" : "mb-4"
            desktopPrompt.before(block)
        } else {
            block.className = "mb-6"
            mobilePrompt.before(block)
        }
    }

    desktop.addEventListener(
        "change",
        () => {
            view.abort()
            view = new AbortController()
            stop()
            setOpen(false)
            busy = false

            // Finish interrupted output in the newly visible terminal.
            const prompt = desktop.matches ? desktopPrompt : mobilePrompt
            prompt.hidden = false
            prompt.style.visibility = ""
            transcript.forEach((block, index) => {
                placeExchange(block, index)
                printImmediately(block)
            })
            if (!active) return
            if (desktop.matches) {
                markSidebar(active, true)
                listings.slice(0, furthestListing + 1).forEach(printImmediately)
                nextListing = furthestListing + 1
                const last = listings[furthestListing]
                if (last.dataset.lsBlock === "hackathon") {
                    void unlockAfterOutput(
                        last.querySelector("[data-ls-out]")!,
                        view.signal,
                    )
                }
                follow()
            } else {
                markBar(active, true, true)
            }
        },
        { signal },
    )

    if (desktop.matches) {
        if (reduced.matches) {
            nextListing = 2
        } else {
            listings.slice(0, 2).forEach(block => {
                block.hidden = true
                block.querySelector("[data-ls-out]")!.removeAttribute("data-in")
            })
        }
    }

    const canHatch = () =>
        (!desktop.matches || desktopUnlocked) &&
        !isOpen() &&
        !busy &&
        transcript.length < exchanges.length

    const hatch = async () => {
        if (!canHatch()) return
        const run = view.signal
        const index = transcript.length
        const block = exchanges[index].content.firstElementChild!.cloneNode(
            true,
        ) as HTMLElement
        transcript.push(block)
        placeExchange(block, index)
        updatePrompts()
        busy = true
        await printBlock(block, true)
        if (!run.aborted) {
            busy = false
            cooldownUntil = performance.now() + EGG_COOLDOWN_MS
        }
    }

    toggle.addEventListener("click", () => setOpen(!isOpen()), { signal })
    bar.querySelector("[data-pb-dim]")!.addEventListener(
        "click",
        () => setOpen(false),
        { signal },
    )
    addEventListener(
        "keydown",
        event => {
            if (event.key === "Escape") setOpen(false)
        },
        { signal },
    )

    for (const prompt of [desktopPrompt, mobilePrompt]) {
        prompt.addEventListener("click", () => void hatch(), { signal })
        prompt.addEventListener(
            "keydown",
            event => {
                if ((event.key !== "Enter" && event.key !== " ") || !canHatch())
                    return
                event.preventDefault()
                void hatch()
            },
            { signal },
        )
    }

    for (const terminal of [sidebar, bar]) {
        terminal.addEventListener(
            "click",
            event => {
                const button = (event.target as Element).closest<HTMLElement>(
                    "[data-ls-jump]",
                )
                if (!button) return
                if (terminal === bar) setOpen(false)
                navigation.jumpTo(button.dataset.lsJump!)
            },
            { signal },
        )
    }

    let push = 0
    addEventListener(
        "wheel",
        event => {
            if (
                !canHatch() ||
                event.deltaY <= 0 ||
                performance.now() < cooldownUntil ||
                !navigation.atBottom()
            ) {
                push = 0
                return
            }
            push += event.deltaY
            if (push < EGG_PUSH) return
            push = 0
            void hatch()
        },
        { signal, passive: true },
    )

    let pull: { touchId: number; from?: number } | undefined
    const resetPull = () => {
        pull = undefined
    }
    addEventListener(
        "touchstart",
        event => {
            resetPull()
            if (
                event.touches.length !== 1 ||
                !canHatch() ||
                performance.now() < cooldownUntil
            )
                return
            const touch = event.touches[0]
            pull = {
                touchId: touch.identifier,
                from: navigation.atBottom() ? touch.clientY : undefined,
            }
        },
        { signal, passive: true },
    )
    addEventListener(
        "touchmove",
        event => {
            const touch = event.touches[0]
            if (!pull || touch?.identifier !== pull.touchId) return
            if (
                !canHatch() ||
                performance.now() < cooldownUntil ||
                !navigation.atBottom()
            ) {
                pull.from = undefined
                return
            }
            // Scrolling to the bottom does not count toward the extra pull.
            pull.from ??= touch.clientY
            if (pull.from - touch.clientY <= EGG_PULL) return
            resetPull()
            void hatch()
        },
        { signal, passive: true },
    )
    addEventListener("touchend", resetPull, { signal, passive: true })
    addEventListener("touchcancel", resetPull, { signal, passive: true })
    addEventListener(
        "resize",
        () => {
            if (desktop.matches && !busy) follow()
        },
        { signal, passive: true },
    )

    signal.addEventListener(
        "abort",
        () => {
            view.abort()
            stop()
            setOpen(false)
        },
        { once: true },
    )

    return { isOpen, setActive }
}
