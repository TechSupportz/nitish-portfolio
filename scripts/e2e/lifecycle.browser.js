(async () => {
    const wait = ms => new Promise(r => setTimeout(r, ms));
    const nav = path => new Promise(resolve => {
        document.addEventListener('astro:page-load', resolve, { once: true });
        document.querySelector(`nav a[href="${path}"]`).click();
    });
    const results = [], check = (name, pass) => results.push({ name, pass: !!pass });
    await nav('/projects'); await wait(600);
    const oldSidebar = document.querySelector('[data-project-sidebar]');
    const oldItem = oldSidebar.querySelector('[data-project-target="word counter"]');
    oldItem.click(); await wait(1200);
    const oldClasses = oldItem.className;
    for (let i = 0; i < 3; i++) { await nav('/contact'); await wait(500); await nav('/projects'); await wait(500); }
    check('detached sidebar stops receiving store updates', !oldSidebar.isConnected && oldItem.className === oldClasses);
    const y = scrollY;
    oldItem.click(); await wait(1200);
    check('detached sidebar click handler is aborted', Math.abs(scrollY - y) < 1);
    check('revisited projects starts at transito', document.querySelector('[data-project-target="transito"]').classList.contains('font-medium'));
    return { pass: results.every(r => r.pass), results };
})()
