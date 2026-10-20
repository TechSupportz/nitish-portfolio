(async () => {
    const wait = ms => new Promise(r => setTimeout(r, ms));
    const ready = new Promise(r => document.addEventListener('astro:page-load', r, { once: true }));
    document.querySelector('nav a[href="/about"]').click(); await ready; await wait(1200);
    const canvas = document.querySelector('canvas'), rect = canvas.getBoundingClientRect();
    const hash = () => canvas.toDataURL();
    const results = [], check = (name, pass, details = {}) => results.push({ name, pass: !!pass, ...details });
    const initial = hash();
    window.dispatchEvent(new PointerEvent('pointermove', { clientX: rect.width / 2, clientY: rect.y + rect.height / 2, pointerType: 'mouse' }));
    await wait(180);
    check('pointer spotlight changes matrix', hash() !== initial);
    document.documentElement.dispatchEvent(new PointerEvent('pointerleave')); await wait(200);
    const resting = hash();
    window.dispatchEvent(new PointerEvent('pointerdown', { clientX: rect.width / 2, clientY: rect.y + rect.height / 2, pointerType: 'touch' }));
    await wait(250);
    check('tap sends a ripple', hash() !== resting);
    const role = () => [...document.querySelectorAll('[data-role-column]')].findIndex(e => e.dataset.active === 'true');
    const before = role();
    document.querySelector('#role-cycle').click(); await wait(200);
    check('manual role advances one step', role() === (before + 1) % 3);
    await wait(2300);
    check('manual selection resets reading deadline', role() === (before + 1) % 3);
    await wait(1900);
    check('automatic role resumes after full deadline', role() === (before + 2) % 3);
    return { pass: results.every(r => r.pass), results, hdrDisplay: matchMedia('(dynamic-range: high)').matches };
})()
