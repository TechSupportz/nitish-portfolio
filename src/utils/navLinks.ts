const NAV_LINKS = [
    { href: "/about", label: "about" },
    { href: "/projects", label: "projects" },
    { href: "/contact", label: "contact" },
]

export const getNavLinks = (pathname: string) => {
    // Static builds emit /projects.html, and "/" rewrites to "/about"
    const currentPath =
        pathname.replace(/(\/index)?\.html$|\/$/, "") || "/about"

    return NAV_LINKS.map(link => ({
        ...link,
        isActive: link.href === currentPath,
    }))
}
