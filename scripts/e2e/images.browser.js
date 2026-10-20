(async () => {
    const images = [...document.querySelectorAll('.project-card img[alt="Project Image"]')];
    for (const image of images) { image.loading = 'eager'; await image.decode(); }
    const results = images.map(image => {
        const rect = image.getBoundingClientRect();
        const candidate = image.srcset.split(',').map(x => x.trim().split(/\s+/)).find(([url]) => new URL(url, location.href).href === image.currentSrc);
        const encodedWidth = candidate?.[1]?.endsWith('w') ? parseInt(candidate[1]) : image.naturalWidth;
        return { src: image.currentSrc, width: rect.width, height: rect.height, naturalWidth: image.naturalWidth, encodedWidth, bytes: performance.getEntriesByName(image.currentSrc).at(-1)?.decodedBodySize };
    });
    return { pass: images.length === 12 && results.every(x => x.width > 0 && x.encodedWidth >= x.width * devicePixelRatio && Math.abs(x.width / x.height - 1.5) < 0.02), width: innerWidth, dpr: devicePixelRatio, images: results, totalBytes: results.reduce((sum, x) => sum + (x.bytes || 0), 0) };
})()
