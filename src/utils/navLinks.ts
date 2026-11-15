const NAV_LINKS = [
    { href: "/so-far", label: "so far" },
    { href: "/projects", label: "projects" },
    { href: "/contact", label: "contact" },
]

export const getNavLinks = (pathname: string) => {
    // Static builds emit /projects.html. Home has no nav entry.
    const currentPath = pathname.replace(/(\/index)?\.html$|\/$/, "") || "/"

    return NAV_LINKS.map(link => ({
        ...link,
        isActive: link.href === currentPath,
    }))
}
