import { useStore } from "@nanostores/react"
import { isDrawerOpen } from "../store/uiStore"
import { cn } from "../utils/cn"

const Drawer = () => {
    const $isDrawerOpen = useStore(isDrawerOpen)

    return (
        <>
            <div
                onClick={() => isDrawerOpen.set(false)}
                className={cn(
                    "fixed inset-0 z-40 h-screen w-full bg-black bg-opacity-45 backdrop-blur-sm transition-all",
                    {
                        "pointer-events-none opacity-0": !$isDrawerOpen,
                    },
                )}
            ></div>
            <div
                className={cn(
                    "fixed right-0 top-0 z-50 h-screen w-64 translate-x-full transform-gpu rounded-l-2xl bg-charcoal shadow-lg transition-all duration-500",
                    {
                        "translate-x-0": $isDrawerOpen,
                    },
                )}
            >
                <div className="px-6 py-4">
                    <h2 className="text-lg font-semibold">Drawer</h2>
                    <p className="text-gray-500">This is a drawer.</p>
                </div>
            </div>
        </>
    )
}

export default Drawer
