;(async () => {
    const results = []
    const check = (name, pass) => results.push({ name, pass: !!pass })
    const until = async (condition, description) => {
        const deadline = performance.now() + 5000
        while (performance.now() < deadline) {
            if (condition()) return
            await new Promise(resolve => setTimeout(resolve, 25))
        }
        throw new Error("Timed out waiting for " + description)
    }
    const navigate = async (selector, path) => {
        const link = document.querySelector(selector)
        if (!link) throw new Error("Missing link to " + path)
        let loaded = false
        document.addEventListener(
            "astro:page-load",
            () => {
                loaded = true
            },
            { once: true },
        )
        link.click()
        await until(
            () => loaded && location.pathname.replace(/\/$/, "") === path,
            path,
        )
    }

    try {
        await navigate('nav a[href="/projects"]', "/projects")
        await until(
            () => document.querySelector("[data-projects]"),
            "Projects markup",
        )
        const page = document.querySelector("[data-projects]")
        const mobile = innerWidth < 1024
        const cards = [...page.querySelectorAll("[data-project-card]")]
        const bar = page.querySelector("[data-pb]")
        const toggle = bar.querySelector("[data-pb-toggle]")
        const terminal = mobile ? bar : page.querySelector("[data-ls]")
        const prompt = mobile
            ? page.querySelector("[data-egg-slot] [data-egg-prompt]")
            : terminal.querySelector("[data-egg-prompt]")

        check(
            "12 cards with valid image geometry",
            cards.length === 12 &&
                cards.every(
                    card =>
                        card.querySelector("img").getBoundingClientRect()
                            .width > 0,
                ),
        )
        if (mobile) {
            check(
                "phone easter egg has no Hackathon gate",
                !prompt.hasAttribute("data-locked"),
            )
        } else {
            check(
                "easter egg starts locked",
                prompt.hasAttribute("data-locked"),
            )
            prompt.click()
            check(
                "early prompt click leaves the transcript empty",
                !page.querySelector("[data-ls-egg]"),
            )
        }

        const openListing = async () => {
            if (!mobile) return
            toggle.click()
            await until(
                () => toggle.getAttribute("aria-expanded") === "true",
                "open listing",
            )
            check(
                "open listing locks scrolling",
                getComputedStyle(document.documentElement).overflowY ===
                    "hidden",
            )
        }

        // Enter Personal through its directory, then jump to Word Counter through a row.
        await openListing()
        const personal = terminal.querySelector('[data-ls-dir="personal"]')
        await until(
            () => getComputedStyle(personal).visibility === "visible",
            "Personal directory",
        )
        personal.click()
        await until(
            () => personal.hasAttribute("data-active"),
            "active Personal category",
        )

        await openListing()
        const wordCounter = terminal.querySelector(
            '[data-ls-row="word-counter"]',
        )
        await until(
            () => getComputedStyle(wordCounter).visibility === "visible",
            "Word Counter row",
        )
        wordCounter.click()
        await until(
            () => wordCounter.hasAttribute("data-active"),
            "active Word Counter row",
        )
        check(
            "Word Counter is visible after jumping",
            cards
                .find(card => card.id === "word-counter")
                .getBoundingClientRect().top < innerHeight,
        )
        if (!mobile)
            check(
                "easter egg stays locked in Personal",
                prompt.hasAttribute("data-locked"),
            )
        if (mobile) {
            check(
                "jump closes the listing",
                toggle.getAttribute("aria-expanded") === "false",
            )
            check(
                "Word Counter count is 3/4",
                bar.querySelector("[data-pb-count]").textContent.trim() ===
                    "3/4",
            )
        }

        await openListing()
        const hackathon = terminal.querySelector('[data-ls-dir="hackathon"]')
        await until(
            () => getComputedStyle(hackathon).visibility === "visible",
            "Hackathon directory",
        )
        hackathon.click()
        if (mobile) {
            await until(
                () =>
                    bar.querySelector("[data-pb-cmd]").textContent.trim() ===
                    "ls -l hackathon",
                "phone Hackathon command",
            )
        } else {
            const listing = terminal.querySelector(
                '[data-ls-block="hackathon"] [data-ls-out]',
            )
            if (!matchMedia("(prefers-reduced-motion: reduce)").matches) {
                await until(
                    () => listing.hasAttribute("data-in"),
                    "Hackathon output starts printing",
                )
                const lastRowVisible =
                    getComputedStyle(listing.lastElementChild).visibility ===
                    "visible"
                check(
                    "prompt stays locked during Hackathon output stagger",
                    !lastRowVisible && prompt.hasAttribute("data-locked"),
                )
                prompt.click()
                check(
                    "prompt cannot start an egg during the stagger",
                    !page.querySelector("[data-ls-egg]"),
                )
            }
            await until(
                () => !prompt.hasAttribute("data-locked"),
                "unlocked easter egg",
            )
            check(
                "Hackathon finishes printing before unlock",
                listing.hasAttribute("data-in") &&
                    getComputedStyle(listing.lastElementChild).visibility ===
                        "visible",
            )
        }

        const commands = [
            "cd in-progress",
            "sudo ls in-progress",
            "cat in-progress/???.md",
        ]
        for (const [index, command] of commands.entries()) {
            prompt.click()
            await until(
                () =>
                    page.querySelectorAll(
                        "[data-ls-egg] [data-ls-out][data-in]",
                    ).length ===
                    index + 1,
                "printed " + command,
            )
            const block = page.querySelectorAll("[data-ls-egg]")[index]
            check(
                "prints " + command,
                block.querySelector("[data-ls-cmd]").textContent === command,
            )
        }

        const replies = [
            ...page.querySelectorAll(
                "[data-ls-egg] [data-ls-out] p:last-child",
            ),
        ].map(line => line.textContent.trim().replace(/\s+/g, " "))
        check(
            "easter egg replies keep their copy",
            replies[0] === "there's def stuff in there. trust." &&
                replies[1] === "ok... its mostly ideas but still counts" &&
                replies[2] === "you know u can just ask me right?contact.",
        )
        const link = page.querySelector('[data-ls-egg] a[href="/contact"]')
        check(
            "last exchange points to Contact",
            !!link && link.textContent.trim() === "contact",
        )
        prompt.click()
        check(
            "prompt stops after three exchanges",
            page.querySelectorAll("[data-ls-egg]").length === 3,
        )
        if (mobile) {
            await openListing()
            await navigate('nav a[href="/contact"]', "/contact")
            check(
                "navigation closes the old phone listing",
                toggle.getAttribute("aria-expanded") === "false",
            )
        } else {
            await navigate('[data-ls-egg] a[href="/contact"]', "/contact")
        }
        await until(() => !page.isConnected, "Projects teardown")
        check(
            "leaving Projects releases scrolling",
            document.documentElement.style.overflow === "",
        )
    } catch (error) {
        results.push({ name: String(error), pass: false })
    }

    return {
        pass: results.every(result => result.pass),
        width: innerWidth,
        height: innerHeight,
        results,
    }
})()
