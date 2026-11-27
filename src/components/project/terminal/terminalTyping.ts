const TYPE_MS = 24
const ERASE_MS = 12

export function pause(ms: number, signal: AbortSignal): Promise<boolean> {
    if (signal.aborted) return Promise.resolve(false)
    return new Promise(resolve => {
        const finish = (completed: boolean) => {
            clearTimeout(timer)
            signal.removeEventListener("abort", cancel)
            resolve(completed)
        }
        const cancel = () => finish(false)
        const timer = setTimeout(() => finish(true), ms)
        signal.addEventListener("abort", cancel, { once: true })
    })
}

export async function typeCommand(
    target: HTMLElement,
    next: string,
    signal: AbortSignal,
    finishNow: () => boolean,
): Promise<boolean> {
    if (signal.aborted) return false
    let text = target.textContent ?? ""
    while (!next.startsWith(text) && !finishNow()) {
        if (!(await pause(ERASE_MS, signal))) return false
        text = text.slice(0, -1)
        target.textContent = text
    }
    while (text.length < next.length && !finishNow()) {
        if (!(await pause(TYPE_MS, signal))) return false
        if (finishNow()) break
        text = next.slice(0, text.length + 1)
        target.textContent = text
    }
    if (signal.aborted) return false
    target.textContent = next
    return true
}
