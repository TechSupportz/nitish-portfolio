export type TProfileRole = {
    role: string
    shortRole?: string
    title: string
    // Rendered as HTML, so inline tags like <em> are allowed
    body: string
    // SVG path data on a 24x24 grid, lit up on the dot matrix
    icon: string[]
}
