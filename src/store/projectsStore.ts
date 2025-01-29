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
        // Group by category and count visible projects
        const categoryCounts = Object.values(visibility).reduce(
            (acc, project) => {
                if (project.isVisible) {
                    acc[project.category] = (acc[project.category] || 0) + 1
                }
                return acc
            },
            {} as Record<string, number>,
        )

        // Find category with max visible projects
        const [maxCategory] = Object.entries(categoryCounts).reduce(
            ([maxCat, maxCount], [category, count]) => {
                return count > maxCount ? [category, count] : [maxCat, maxCount]
            },
            ["", 0],
        )

        const currentProject = visibility[$currentProject.get()]

        if (maxCategory !== currentProject.category) {
            return currentProject.category
        }

        return maxCategory || "featured"
    },
)
