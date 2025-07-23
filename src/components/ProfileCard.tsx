import { useStore } from "@nanostores/react"
import { $scrollListItemVisibility } from "@store/uiStore"
import { cn } from "@utils/cn"
import { useEffect, useState } from "react"

type ProfileCardProps = {
    title: string
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

    useEffect(() => {
        switch (title) {
            case "Software Developer 👨🏾‍💻":
                setIsActive(scrollListItemVisibility.softwareDeveloper)
                break
            case "Tech Fanatic 📱":
                setIsActive(scrollListItemVisibility.techFanatic)
                break
            case "Student 🎓":
                setIsActive(scrollListItemVisibility.student)
                break
            default:
                setIsActive(false)
        }
    }, [scrollListItemVisibility])

    return (
        <div
            className={cn(
                "motion-preset-blur-up-md to-charcoal motion-duration-700 flex max-w-72 flex-col gap-1 rounded-lg bg-linear-to-br from-[#202020] to-35% px-4 py-3 shadow-white/0 outline-2 outline-white/3 transition-all duration-700 ease-in-out sm:max-w-80 sm:px-5 sm:py-4 md:max-w-96 md:gap-2 md:px-6 md:py-5 lg:w-full lg:max-w-none lg:gap-4 lg:px-7 lg:py-6",
                {
                    "shadow-lg shadow-blue-300/10 outline-white/10": isActive,
                },
                {
                    "max-lg:place-self-end": offset,
                },
                {
                    "motion-delay-0": title === "Software Developer",
                    "motion-delay-[300ms]": title === "Tech Fanatic",
                    "motion-delay-[600ms]": title === "Student",
                },
            )}
        >
            <h1
                className={cn(
                    "text-lg font-semibold text-nowrap transition-opacity duration-300 ease-in-out sm:text-xl md:text-2xl lg:text-3xl",
                    {
                        "opacity-30": !isActive,
                    },
                )}
            >
                {title}
            </h1>
            <p
                className={cn(
                    "text-sm font-light text-pretty whitespace-pre-wrap transition-opacity duration-300 ease-in-out sm:text-base md:text-lg lg:text-lg",
                    {
                        "opacity-30": !isActive,
                    },
                )}
            >
                {body}
            </p>
        </div>
    )
}

export default ProfileCard
