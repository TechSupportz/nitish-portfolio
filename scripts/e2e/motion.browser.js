(async () => {
    const wait = ms => new Promise(r => setTimeout(r, ms));
    const results = [];
    const check = (name, pass, details = {}) => results.push({ name, pass: !!pass, ...details });
    const ready = new Promise(resolve => document.addEventListener('astro:page-load', resolve, { once: true }));
    document.querySelector('.navbar a[href="/contact"]').click();
    await ready;
    const samples = [];
    for (let i = 0; i < 25; i++) {
        const title = [...document.querySelectorAll('h1')].find(h => h.textContent.trim() === 'contact.');
        const background = title.parentElement.parentElement.firstElementChild;
        const style = getComputedStyle(title), bg = getComputedStyle(background);
        const dot = getComputedStyle(document.documentElement, '::view-transition-group(nav-dot)');
        samples.push({ ms: performance.now(), title: { opacity: +style.opacity, translate: style.translate, filter: style.filter, animationName: style.animationName }, background: { opacity: bg.opacity, translate: bg.translate, transform: bg.transform, animationName: bg.animationName }, dotDuration: dot.animationDuration });
        await wait(30);
    }
    check('title enters with blur and fade', samples.some(s => s.title.opacity > 0 && s.title.opacity < 0.99 && s.title.filter !== 'blur(0px)') && samples.at(-1).title.opacity > samples[0].title.opacity, { samples });
    check('title background stays stationary', samples.every(s => s.background.transform === 'none' && s.background.translate === 'none' && s.background.animationName === 'none'));
    if (innerWidth >= 1024) check('active dot retains 400ms travel', samples.some(s => s.dotDuration === '0.4s'));
    await wait(1100);
    check('title finishes visible', getComputedStyle(document.querySelector('h1')).opacity === '1');
    check('fonts are loaded', document.fonts.status === 'loaded');
    return { pass: results.every(x => x.pass), results, width: innerWidth, reducedMotion: matchMedia('(prefers-reduced-motion: reduce)').matches };
})()
