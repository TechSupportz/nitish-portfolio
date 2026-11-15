(async () => {
    const wait = ms => new Promise(r => setTimeout(r, ms));
    const results = [], check = (name, pass, details = {}) => results.push({ name, pass: !!pass, ...details });
    const ready = new Promise(r => document.addEventListener('astro:page-load', r, { once: true }));
    document.querySelector('nav a[href="/projects"]').click(); await ready; await wait(1800);
    const cards = [...document.querySelectorAll('.project-card')];
    check('12 cards and valid image geometry', cards.length === 12 && cards.every(c => c.querySelector('img').getBoundingClientRect().width > 0));
    const row = document.querySelector('[data-ls-row="word-counter"]');
    if (innerWidth >= 1024) row.click();
    else document.getElementById('word-counter').scrollIntoView({ block: 'start' });
    await wait(1500);
    const bounds = document.getElementById('word-counter').getBoundingClientRect();
    check('scrolls to project', bounds.bottom > 264 && bounds.top < innerHeight && scrollY > 500);
    check('active project follows scroll', row.hasAttribute('data-active'));
    check('personal ls printed', !document.querySelector('[data-ls-block="personal"]').hidden && document.querySelector('[data-ls-block="personal"] [data-ls-out]').hasAttribute('data-in'));
    check('active dir marked', document.querySelector('[data-ls-dir="personal"]').hasAttribute('data-active'));
    if (innerWidth < 1024) check('mobile path follows project', document.querySelector('[data-pwd]').textContent === 'personal/word counter');
    return { pass: results.every(r => r.pass), width: innerWidth, results };
})()
