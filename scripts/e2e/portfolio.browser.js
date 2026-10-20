// Evaluate this complete expression in a production-preview browser tab.
// Set window.portfolioSuite to 'performance', 'desktop', 'mobile', or 'stress'.
(async () => {
    const suite = window.portfolioSuite || 'desktop';
    const results = [], trace = [], errors = [];
    const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
    const check = (name, pass, details = {}) => {
        results.push({ name, pass: !!pass, ...details });
        if (!pass) throw new Error(name);
    };
    const error = e => errors.push(String(e.message || e.reason));
    window.addEventListener('error', error);
    window.addEventListener('unhandledrejection', error);
    const origin = performance.timeOrigin, logo = document.querySelector('.logo');
    const drawer = document.querySelector('#drawer'), backdrop = document.querySelector('#drawer-backdrop');
    const routeEvent = e => trace.push({ event: e.type, path: location.pathname, ms: performance.now() });
    const events = ['astro:before-preparation', 'astro:before-swap', 'astro:after-swap', 'astro:page-load'];
    events.forEach(e => document.addEventListener(e, routeEvent));
    const loaded = () => new Promise((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error('Navigation timed out')), 8000);
        document.addEventListener('astro:page-load', () => { clearTimeout(timer); resolve(); }, { once: true });
    });
    const nav = async (path, settle = 460) => {
        const ready = loaded(), start = performance.now();
        document.querySelector(`.navbar a[href="${path}"]`).click();
        await ready;
        const elapsed = performance.now() - start;
        await wait(settle);
        check(`route ${path}`, location.pathname === path && performance.timeOrigin === origin && logo === document.querySelector('.logo'), { swapMs: elapsed });
        return elapsed;
    };
    const dimensions = () => ({ width: innerWidth, scrollWidth: document.documentElement.scrollWidth, fonts: document.fonts.status });
    const active = () => {
        const expected = location.pathname === '/' ? '/about' : location.pathname;
        check('active desktop dot', document.querySelector('.nav-dot')?.parentElement.getAttribute('href') === expected);
        check('active drawer dot', [...drawer.querySelectorAll('a > [data-nav-dot]')].filter(s => !s.classList.contains('opacity-0')).every(s => s.parentElement.getAttribute('href') === expected));
    };
    let metrics;
    try {
        if (suite === 'performance') {
            // Instrument actual browser timer callbacks before mounting the home page.
            await nav('/contact');
            const nativeInterval = window.setInterval, nativeTimeout = window.setTimeout;
            const callbacks = [];
            window.setInterval = (fn, ms, ...args) => nativeInterval(() => { callbacks.push({ kind: 'interval', ms }); fn(...args); }, ms);
            window.setTimeout = (fn, ms, ...args) => nativeTimeout(() => { callbacks.push({ kind: 'timeout', ms }); typeof fn === 'function' ? fn(...args) : eval(fn); }, ms);
            try {
                await nav('/about', 1200);
                callbacks.length = 0;
                const start = performance.now();
                await wait(8200);
                metrics = { durationMs: performance.now() - start, rolePollingTicks: callbacks.filter(x => x.kind === 'interval' && x.ms === 100).length, roleDeadlineTicks: callbacks.filter(x => x.kind === 'timeout' && x.ms === 4000).length };
                check('role advances automatically', !!document.querySelector('[data-role-column][data-active="true"]'));
            } finally { window.setInterval = nativeInterval; window.setTimeout = nativeTimeout; }
            const navMs = [];
            for (const path of ['/projects', '/contact', '/about', '/projects', '/contact', '/about']) navMs.push(await nav(path));
            metrics.navMs = navMs;
            const fonts = performance.getEntriesByType('resource').filter(e => e.name.endsWith('.woff2'));
            metrics.fontBytes = fonts.reduce((s, e) => s + e.decodedBodySize, 0);
        } else if (suite === 'stress') {
            await nav('/projects'); await nav('/contact'); await nav('/about');
            // Exercise interruption before capture, during capture, and during animation.
            for (const delay of [0, 5, 20, 60, 140, 0, 5, 20, 60, 140]) {
                const traversed = new Promise(resolve => window.addEventListener('popstate', resolve, { once: true }));
                history.back(); await traversed; await wait(delay); history.forward(); await wait(650);
                check(`rapid back/forward ${delay}ms`, location.pathname === '/about' && document.querySelector('#scroll-list') && logo === document.querySelector('.logo'));
            }
            for (let i = 0; i < 10; i++) {
                document.querySelector('.navbar a[href="/projects"]').click(); await wait(20);
                document.querySelector('.navbar a[href="/contact"]').click(); await wait(20);
                document.querySelector('.navbar a[href="/about"]').click(); await wait(650);
                check('latest click wins', location.pathname === '/about' && !!document.querySelector('canvas'));
            }
            await wait(1200);
        } else {
            for (const path of ['/about', '/projects', '/contact', '/about', '/projects', '/contact', '/about']) {
                if (suite === 'mobile') {
                    document.querySelector('#menu-button').click(); await wait(550);
                    check('drawer reopens', drawer.hasAttribute('data-open') && drawer.getBoundingClientRect().x < innerWidth / 2);
                    const ready = loaded(), samples = [], start = performance.now();
                    drawer.querySelector(`a[href="${path}"]`).click();
                    await ready;
                    for (let n = 0; n < 30; n++) {
                        samples.push({ path: location.pathname, ms: performance.now() - start, x: drawer.getBoundingClientRect().x, opacity: Number(getComputedStyle(backdrop).opacity) });
                        await wait(20);
                    }
                    check('drawer closes over incoming page', samples.some(s => s.path === path && s.x > innerWidth / 4 + 2 && s.x < innerWidth - 2 && s.opacity > 0 && s.opacity < 1), { samples });
                    // The collaborative browser may throttle background paint ticks.
                    // Wait for the actual transition, with a bounded deadline.
                    await Promise.race([Promise.all(drawer.getAnimations().map(a => a.finished)), wait(2000)]);
                    check('overlay nodes persist and finish closed', drawer === document.querySelector('#drawer') && backdrop === document.querySelector('#drawer-backdrop') && drawer.getBoundingClientRect().x >= innerWidth - 1);
                } else await nav(path);
                active(); await document.fonts.ready;
                check('fonts loaded; no horizontal overflow', document.fonts.status === 'loaded' && document.documentElement.scrollWidth <= innerWidth, dimensions());
                if (path === '/projects') check('12 projects', document.querySelectorAll('.project-card').length === 12);
                if (path === '/contact') {
                    // No message is sent: verify the real copy control and its reset.
                    document.querySelector('.copy-email').click(); await wait(100);
                    check('copy success animation', document.querySelector('.copy-success-icon').classList.contains('motion-opacity-in-0'));
                    await wait(1200);
                    check('copy control resets', document.querySelector('.copy-success-icon').classList.contains('opacity-0'));
                }
            }
            const readyBack = loaded(); history.back(); await readyBack; await wait(460);
            check('settled back', location.pathname === '/contact');
            const readyForward = loaded(); history.forward(); await readyForward; await wait(460);
            check('settled forward', location.pathname === '/about');
            const canvas = document.querySelector('canvas');
            await wait(1200);
            const before = canvas.toDataURL();
            const columns = [...document.querySelectorAll('[data-role-column]')];
            const startRole = columns.findIndex(c => c.dataset.active === 'true');
            // Desktop columns are selectable by hover; mobile uses the role button.
            if (suite === 'mobile') document.querySelector('#role-cycle').click();
            else await wait(4200);
            await wait(1200);
            check('role cycles once and matrix changes', columns.findIndex(c => c.dataset.active === 'true') === (startRole + 1) % 3 && before !== canvas.toDataURL());
            check('single home canvas', document.querySelectorAll('canvas').length === 1);
            await nav('/contact');
            const oldCanvas = canvas.toDataURL(); await wait(1500);
            check('detached matrix stops drawing', !canvas.isConnected && canvas.toDataURL() === oldCanvas);
        }
        check('no uncaught browser errors', errors.length === 0, { errors });
        return { pass: true, suite, viewport: dimensions(), metrics, results, trace, errors };
    } catch (e) { return { pass: false, suite, error: String(e), metrics, results, trace, errors }; }
    finally {
        window.removeEventListener('error', error); window.removeEventListener('unhandledrejection', error);
        events.forEach(e => document.removeEventListener(e, routeEvent));
    }
})()
