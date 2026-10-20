(async () => {
    const wait = ms => new Promise(r => setTimeout(r, ms));
    const results = [], check = (name, pass, details = {}) => results.push({ name, pass: !!pass, ...details });
    const ready = new Promise(r => document.addEventListener('astro:page-load', r, { once: true }));
    document.querySelector('nav a[href="/projects"]').click(); await ready; await wait(1800);
    const cards = [...document.querySelectorAll('.project-card')];
    check('12 cards and valid image geometry', cards.length === 12 && cards.every(c => c.querySelector('img').getBoundingClientRect().width > 0));
    const item = [...document.querySelectorAll('details li')].find(e => e.textContent.trim() === 'word counter');
    item.click(); await wait(1500);
    const card = document.getElementById('word counter'), bounds = card.getBoundingClientRect();
    check('sidebar click scrolls to project', bounds.bottom > 264 && bounds.top < innerHeight && scrollY > 500);
    check('active project follows visibility', item.classList.contains('font-medium'));
    check('active category expands', document.querySelector('#details-personal').open);
    if (innerWidth < 1024) {
        const text = [...document.querySelectorAll('p')].find(e => e.textContent.trim() === 'word counter' && getComputedStyle(e).opacity === '1');
        check('mobile sticky title follows project', !!text);
    }
    return { pass: results.every(r => r.pass), width: innerWidth, results };
})()
