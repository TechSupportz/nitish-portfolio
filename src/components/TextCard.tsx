import React from "react"
import { cn } from "../utils/cn"

type TextCardProps = {
    title: string
    body: string
    isActive?: boolean
    offset?: boolean
}

const TextCard = ({
    title,
    body,
    isActive = true,
    offset = false,
}: TextCardProps) => {
    return (
        <div
            className={cn(
                "flex max-w-72 flex-col gap-1 rounded-lg border-2 border-solid border-white/[3%] bg-charcoal px-4 py-3 transition-all sm:max-w-80 sm:px-5 sm:py-4 md:max-w-96 md:gap-2 md:px-6 md:py-5 lg:w-full lg:max-w-none lg:gap-4 lg:px-7 lg:py-6 xl:gap-5 xl:px-8 xl:py-7",
                {
                    "border-white/10 bg-gradient-to-br from-[#1E1E1E] to-charcoal opacity-100 shadow-md shadow-white/5 hover:shadow-lg":
                        isActive,
                },
                {
                    "max-lg:place-self-end": offset,
                },
            )}
        >
            <h1
                className={cn(
                    "text-balance text-lg font-semibold sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl",
                    {
                        "opacity-30": !isActive,
                    },
                )}
            >
                {title}
            </h1>
            <p
                className={cn(
                    "text-pretty text-sm sm:text-base md:text-lg lg:text-lg xl:text-xl",
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

export default TextCard
