import type { TProjectVisibility } from "@src/types/ProjectContentType"
import { computed, map } from "nanostores"

export const $projectVisibility = map<TProjectVisibility>({
    transito: { category: "featured", isVisible: true },
})

export const $currentProject = computed($projectVisibility, visibility => {
    const currentProject = Object.keys(visibility).find(
        project => visibility[project].isVisible,
    )
    return currentProject || "transito"
})

export const $currentProjectCategory = computed(
    $projectVisibility,
    visibility => {
        // Count number of visible projects in each category
        const categoryProjectCount = Object.values(visibility).reduce(
            (acc, project) => {
                if (project.isVisible) {
                    acc[project.category] = (acc[project.category] || 0) + 1
                }
                return acc
            },
            {} as Record<string, number>,
        )

        // Find category with most visible projects
        const [topCategory] = Object.entries(categoryProjectCount).reduce(
            ([maxCat, maxCount], [category, count]) => {
                return count > maxCount ? [category, count] : [maxCat, maxCount]
            },
            ["", 0],
        )

        const currentProject = visibility[$currentProject.get()]

        if (topCategory !== currentProject.category) {
            return currentProject.category
        }

        return topCategory || "featured"
    },
)
