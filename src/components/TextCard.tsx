import React from "react"
import { cn } from "../utils/cn"

type TextCardProps = {
    title: string
    body: string
    isActive?: boolean
}

const TextCard = ({ title, body, isActive = true }: TextCardProps) => {
    return (
        <div
            className={cn(
                "flex flex-col gap-1 rounded-lg border-2 border-solid border-white/10 px-4 py-3 opacity-50 transition-all max-w-72",
                {
                    "bg-gradient-to-br from-[#1E1E1E] to-charcoal opacity-100 shadow-md shadow-white/5 hover:shadow-lg":
                        isActive,
                },
            )}
        >
            <h1 className="text-balance text-lg font-semibold">{title}</h1>
            <p className="text-pretty text-sm">{body}</p>
        </div>
    )
}

export default TextCard
