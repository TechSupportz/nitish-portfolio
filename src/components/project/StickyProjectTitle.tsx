import { projectContent } from "@content/projects"
import { useStore } from "@nanostores/react"
import type { TProjectCategory } from "@src/types/ProjectContentType"
import { $currentProject, $currentProjectCategory } from "@store/projectsStore"
import { cn } from "@utils/cn"
import { useEffect, useState } from "react"

type Props = {
    class?: string
}

const StickyProjectTitle = ({ class: className }: Props) => {
    const currentProject = useStore($currentProject)
    const currentProjectCategory = useStore($currentProjectCategory)

    return (
        <div>
            <div
                className={cn(
                    "fixed bottom-0 z-10 h-20 w-full bg-progressive-blur-to-t lg:hidden",
                    "motion-preset-focus motion-delay-75 motion-duration-1000",
                )}
            ></div>
            <div
                className={cn(
                    "fixed bottom-0 z-20 flex w-full items-center justify-between px-4 py-2 lg:hidden",
                    "motion-preset-focus motion-delay-75 motion-duration-1000",
                )}
            >
                <div className="grid-overlap lg:hidden">
                    {Object.keys(projectContent).map(category => (
                        <h2
                            key={category}
                            className={cn(
                                "text-2xl font-bold transition-opacity duration-300",
                                currentProjectCategory === category
                                    ? "opacity-100"
                                    : "opacity-0",
                            )}
                        >
                            {category}
                        </h2>
                    ))}
                </div>
                <div className="grid-overlap lg:hidden">
                    {projectContent[currentProjectCategory].map(project => (
                        <p
                            className={cn(
                                "justify-self-end font-sans font-light transition-opacity duration-300",
                                currentProject === project.title.toLowerCase()
                                    ? "opacity-100"
                                    : "opacity-0",
                            )}
                        >
                            {project.title.toLowerCase()}
                        </p>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default StickyProjectTitle
