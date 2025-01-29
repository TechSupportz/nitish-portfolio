import { projectContent } from "@content/projects"
import { useStore } from "@nanostores/react"
import type { TProjectCategory } from "@src/types/ProjectContentType"
import { $currentProject, $currentProjectCategory } from "@store/projectsStore"
import { cn } from "@utils/cn"
import { useEffect } from "react"

const ProjectsSidebar = () => {
    const currentProject = useStore($currentProject)
    const currentProjectCategory = useStore($currentProjectCategory)

    useEffect(() => {
        console.log(currentProjectCategory, currentProject)
    }, [currentProjectCategory, currentProject])

    return (
        <div className="flex flex-col gap-6 pr-12">
            {(Object.keys(projectContent) as TProjectCategory[]).map(
                category => (
                    <details
                        id={`details-${category}`}
                        key={category}
                        open={category === currentProjectCategory}
                    >
                        <summary className="list-none font-display text-2xl font-bold xl:text-3xl cursor-pointer">
                            {category}
                        </summary>
                        <div className="pl-4 pt-1">
                            {projectContent[category].map(project => (
                                <p
                                    key={project.title}
                                    className={cn(
                                        "text-balance text-lg font-extralight transition-all duration-300 ease-out xl:text-xl",
                                        {
                                            "font-normal":
                                                currentProject ===
                                                project.title.toLowerCase(),
                                        },
                                    )}
                                >
                                    {project.title.toLowerCase()}
                                </p>
                            ))}
                        </div>
                    </details>
                ),
            )}
        </div>
    )
}

export default ProjectsSidebar
