import { projectContent } from "@content/projects"
import { useStore } from "@nanostores/react"
import type { TProjectCategory } from "@src/types/ProjectContentType"
import { $currentProject, $currentProjectCategory } from "@store/projectsStore"
import { cn } from "@utils/cn"

const ProjectsSidebar = () => {
    const currentProject = useStore($currentProject)
    const currentProjectCategory = useStore($currentProjectCategory)

    const scrollToProject = (project: string) => {
        const projectElement = document.getElementById(project)
        projectElement?.scrollIntoView({
            block: "center",
            behavior: "smooth",
        })
    }

    const scrollToCategory = (category: TProjectCategory) => {
        const categoryElement = document.getElementsByClassName(
            `${category}-project`,
        )[0]

        categoryElement?.scrollIntoView({
            block: "center",
            behavior: "smooth",
        })
    }

    return (
        <div className="flex flex-col gap-6 pr-12">
            {(Object.keys(projectContent) as TProjectCategory[]).map(
                category => (
                    <details
                        id={`details-${category}`}
                        key={category}
                        open={category === currentProjectCategory}
                    >
                        <summary
                            className="cursor-pointer list-none font-display text-2xl font-bold xl:text-3xl"
                            onClick={() => {
                                scrollToCategory(category)
                            }}
                        >
                            {category}
                        </summary>
                        <ul className="list-['\00B7\00B7\00B7'] pl-4 pt-1">
                            {projectContent[category].map(project => (
                                <li
                                    key={project.title}
                                    onClick={() =>
                                        scrollToProject(
                                            project.title.toLowerCase(),
                                        )
                                    }
                                    className={cn(
                                        "cursor-pointer text-balance pl-1.5 text-lg font-extralight transition-all duration-300 ease-out xl:text-xl",
                                        {
                                            "font-normal":
                                                currentProject ===
                                                project.title.toLowerCase(),
                                        },
                                    )}
                                >
                                    {project.title.toLowerCase()}
                                </li>
                            ))}
                        </ul>
                    </details>
                ),
            )}
        </div>
    )
}

export default ProjectsSidebar
