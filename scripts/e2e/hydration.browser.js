(async () => {
    const errors = [], unmounts = [];
    const wait = ms => new Promise(r => setTimeout(r, ms));
    const report = e => errors.push({ message: String(e.message || e.reason), path: location.pathname, stack: e.error?.stack });
    window.addEventListener('error', report); window.addEventListener('unhandledrejection', report);
    const listen = () => document.querySelectorAll('astro-island').forEach(island => {
        if (island.dataset.qaObserved) return;
        island.dataset.qaObserved = 'true';
        island.addEventListener('astro:unmount', () => {
            const key = Object.keys(island).find(k => k.startsWith('__reactContainer'));
            unmounts.push({ component: island.getAttribute('component-url'), dehydrated: key ? island[key]?.memoizedState?.isDehydrated : null });
        }, { once: true });
    });
    document.addEventListener('astro:page-load', listen); listen();
    const nav = path => new Promise(resolve => {
        document.addEventListener('astro:page-load', resolve, { once: true });
        document.querySelector(`.navbar a[href="${path}"]`).click();
    });
    try {
        for (let i = 0; i < 20; i++) {
            await nav('/projects');
            await wait([0, 5, 10, 20][i % 4]);
            await nav('/contact');
            await wait(150);
            await nav('/about');
            await wait([0, 5, 10, 20][i % 4]);
            await nav('/contact');
            await wait(150);
        }
        await wait(1000);
        return { pass: errors.length === 0, errors, unmounts };
    } finally {
        document.removeEventListener('astro:page-load', listen);
        window.removeEventListener('error', report); window.removeEventListener('unhandledrejection', report);
    }
})()
