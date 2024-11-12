import { useStore } from "@nanostores/react"
import { X } from "lucide-react"
import emailIcon from "../assets/email.svg"
import githubIcon from "../assets/github.svg"
import linkedInIcon from "../assets/linkedin.svg"
import { isDrawerOpen } from "../store/uiStore"
import { cn } from "../utils/cn"

const Drawer = () => {
    const $isDrawerOpen = useStore(isDrawerOpen)

    const closeDrawer = () => isDrawerOpen.set(false)

    return (
        <>
            <div
                onClick={closeDrawer}
                className={cn(
                    "fixed inset-0 z-40 h-screen w-full bg-black bg-opacity-45 backdrop-blur-md transition-all duration-500 ease-in-out",
                    {
                        "pointer-events-none opacity-0": !$isDrawerOpen,
                    },
                )}
            ></div>
            <div
                className={cn(
                    "fixed right-0 top-0 z-50 h-dvh w-3/4 translate-x-full transform-gpu rounded-l-[2rem] bg-charcoal shadow-lg transition-all duration-500 ease-in-out",
                    {
                        "translate-x-0": $isDrawerOpen,
                    },
                )}
            >
                <div className="flex size-full flex-col px-4 py-6">
                    <div
                        className="pointer-events-none absolute inset-y-0 -right-1 h-[90%] w-3/5 bg-[url('/dot-matrix.svg')] bg-repeat opacity-40"
                        style={{
                            maskImage:
                                "linear-gradient(to bottom,transparent,15%,white,80%,transparent)",
                        }}
                    ></div>
                    <header className="flex justify-end">
                        <X size={"2rem"} onClick={closeDrawer} />
                    </header>
                    <div className="flex-1">
                        <div className="flex h-full flex-col items-center justify-center gap-10 font-display text-5xl font-extrabold text-white">
                            <a
                                href="/about"
                                className="group transition duration-300"
                            >
                                About
                                <span className="block h-[5px] max-w-0 rounded-sm bg-white transition-all duration-300 group-hover:max-w-full"></span>
                            </a>
                            <a
                                href="/projects"
                                className="group transition duration-300"
                            >
                                Projects
                                <span className="block h-[5px] max-w-0 rounded-sm bg-white transition-all duration-300 group-hover:max-w-full"></span>
                            </a>
                            <a
                                href="/contact"
                                className="group transition duration-300"
                            >
                                Contact
                                <span className="block h-[5px] max-w-0 rounded-sm bg-white transition-all duration-300 group-hover:max-w-full"></span>
                            </a>
                        </div>
                    </div>
                    <footer className="flex h-fit items-center justify-center gap-8 opacity-50">
                        <a href="https://github.tnitish.com/">
                            <img
                                src={githubIcon.src}
                                alt="GitHub"
                                className="size-10"
                            />
                        </a>
                        <a href="mailto:contact@tnitish.com">
                            <img
                                src={emailIcon.src}
                                alt="Email"
                                className="size-10"
                            />
                        </a>
                        <a href="https://linkedin.tnitish.com/">
                            <img
                                src={linkedInIcon.src}
                                alt="LinkedIn"
                                className="size-10"
                            />
                        </a>
                    </footer>
                </div>
            </div>
        </>
    )
}

export default Drawer
