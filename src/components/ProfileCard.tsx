import { useStore } from "@nanostores/react"
import {
    EmojiMap,
    ProfileCardTitles,
    type EmojiParticle,
    type ProfileCardTitle,
} from "@src/types/ProfileCardType"
import { $scrollListItemVisibility } from "@store/uiStore"
import { cn } from "@utils/cn"
import { useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"

type ProfileCardProps = {
    title: ProfileCardTitle
    body: string
    initialActive?: boolean
    offset?: boolean
}

const ProfileCard = ({
    title,
    body,
    initialActive = false,
    offset = false,
}: ProfileCardProps) => {
    const scrollListItemVisibility = useStore($scrollListItemVisibility)
    const [isActive, setIsActive] = useState(initialActive)
    const [particles, setParticles] = useState<EmojiParticle[]>([])
    const containerRef = useRef<HTMLDivElement | null>(null)
    const nextParticleId = useRef(0)

    useEffect(() => {
        switch (title) {
            case ProfileCardTitles.SoftwareDeveloper:
                setIsActive(scrollListItemVisibility.softwareDeveloper)
                break
            case ProfileCardTitles.TechFanatic:
                setIsActive(scrollListItemVisibility.techFanatic)
                break
            case ProfileCardTitles.Student:
                setIsActive(scrollListItemVisibility.student)
                break
            default:
                setIsActive(false)
        }
    }, [scrollListItemVisibility])

    const triggerEmojiConfetti = (
        event: React.MouseEvent | React.KeyboardEvent,
    ) => {
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches)
            return

        const emojis = EmojiMap[title] ?? ["✨"]
        let clickX: number
        let clickY: number

        if ("clientX" in event) {
            clickX = event.clientX
            clickY = event.clientY
        } else {
            const rect = containerRef.current?.getBoundingClientRect()
            if (!rect) return
            clickX = rect.left + rect.width / 2
            clickY = rect.top + rect.height / 2
        }

        const duration = 600
        const newParticles: EmojiParticle[] = Array.from({ length: 8 }, () => {
            return {
                id: nextParticleId.current++,
                emoji: emojis[Math.floor(Math.random() * emojis.length)],
                style: {
                    left: clickX,
                    top: clickY,
                    "--dx": `${Math.random() * 200 - 100}px`,
                    "--dy": `${Math.random() * 200 - 100}px`,
                    "--rotate": `${Math.random() * 360}deg`,
                    "--scale": `${1 + Math.random() * 0.25}`,
                    "--duration": `${duration}ms`,
                },
            }
        })

        setParticles(prev => [...prev, ...newParticles].slice(-60))

        const ids = new Set(newParticles.map(p => p.id))
        setTimeout(
            () => setParticles(prev => prev.filter(p => !ids.has(p.id))),
            duration + 100,
        )
    }

    return (
        <div
            ref={containerRef}
            className={cn(
                "relative flex max-w-72 motion-preset-blur-up-md cursor-pointer flex-col gap-1 rounded-lg px-4 py-3 shadow-white/0 outline-2 outline-white/3 transition-all duration-700 ease-in-out motion-duration-700 sm:max-w-80 sm:px-5 sm:py-4 md:max-w-96 md:gap-2 md:px-6 md:py-5 lg:w-full lg:max-w-none lg:gap-4 lg:px-7 lg:py-6",
                {
                    "shadow-lg shadow-blue-300/10 outline-white/10": isActive,
                    "bg-linear-to-br from-[#202020] to-charcoal to-35%":
                        isActive,
                    "bg-charcoal": !isActive,
                    "max-lg:place-self-end": offset,
                },
                {
                    "motion-delay-0":
                        title === ProfileCardTitles.SoftwareDeveloper,
                    "motion-delay-[300ms]":
                        title === ProfileCardTitles.TechFanatic,
                    "motion-delay-[600ms]": title === ProfileCardTitles.Student,
                },
            )}
            role="button"
            tabIndex={0}
            onClick={triggerEmojiConfetti}
        >
            <h1
                className={cn(
                    "text-lg font-semibold text-nowrap transition-opacity duration-300 ease-in-out select-none sm:text-xl md:text-2xl lg:text-3xl",
                    {
                        "opacity-30": !isActive,
                    },
                )}
            >
                {title}
            </h1>
            <p
                className={cn(
                    "text-sm font-light text-pretty whitespace-pre-wrap transition-opacity duration-300 ease-in-out select-none sm:text-base md:text-lg lg:text-lg",
                    {
                        "opacity-30": !isActive,
                    },
                )}
            >
                {body}
            </p>
            {typeof document !== "undefined" &&
                particles.length > 0 &&
                createPortal(
                    particles.map(p => (
                        <span
                            key={p.id}
                            className={cn("emoji-particle", {
                                "emoji-particle-dim": !isActive,
                            })}
                            style={p.style}
                        >
                            {p.emoji}
                        </span>
                    )),
                    document.body,
                )}
        </div>
    )
}

export default ProfileCard
