// Application-level media emulation for previews without a media-emulation API.
// Uses the real authored CSS rules and real matrix/page code; does not change OS preferences.
(async () => {
    const nativeMatch = window.matchMedia.bind(window), changed = [];
    const media = nativeMatch('(prefers-reduced-motion: reduce)');
    Object.defineProperty(media, 'matches', { configurable: true, value: true });
    window.matchMedia = query => query.includes('prefers-reduced-motion') ? media : nativeMatch(query);
    const applyRules = rules => {
        for (const rule of rules) {
            if (rule instanceof CSSMediaRule && rule.conditionText.includes('prefers-reduced-motion')) {
                changed.push([rule, rule.media.mediaText]);
                rule.media.mediaText = rule.media.mediaText.replace(/\(prefers-reduced-motion:\s*no-preference\)/g, '(min-width: 999999px)').replace(/\(prefers-reduced-motion:\s*reduce\)/g, '(min-width: 0px)');
            }
            if (rule.cssRules) applyRules(rule.cssRules);
        }
    };
    const apply = () => { for (const sheet of document.styleSheets) { try { applyRules(sheet.cssRules); } catch {} } };
    const wait = ms => new Promise(r => setTimeout(r, ms));
    const nav = path => new Promise(resolve => {
        document.addEventListener('astro:page-load', resolve, { once: true });
        document.querySelector(`.navbar a[href="${path}"]`).click();
    });
    const results = [];
    const check = (name, pass, details = {}) => results.push({ name, pass: !!pass, ...details });
    try {
        apply(); await nav('/about'); apply(); await wait(1300);
        const canvas = document.querySelector('canvas'), before = canvas.toDataURL();
        const rect = canvas.getBoundingClientRect();
        window.dispatchEvent(new PointerEvent('pointerdown', { clientX: innerWidth / 2, clientY: rect.y + rect.height / 2, pointerType: 'touch' }));
        await wait(250);
        check('reduced matrix suppresses ripples', canvas.toDataURL() === before);
        const scrollerStyle = getComputedStyle(document.querySelector('#scroll-list'));
        check('role scroller has no movement transition', scrollerStyle.transitionProperty === 'none' || scrollerStyle.transitionDuration === '0s');
        check('entry has no translate', getComputedStyle(document.querySelector('h1')).translate === 'none');
        const oldRole = [...document.querySelectorAll('[data-role-column]')].findIndex(e => e.dataset.active === 'true');
        document.querySelector('#role-cycle').click(); await wait(250);
        const newRole = [...document.querySelectorAll('[data-role-column]')].findIndex(e => e.dataset.active === 'true');
        check('manual role and icon still change', newRole === (oldRole + 1) % 3 && canvas.toDataURL() !== before);
        await nav('/contact'); apply(); await wait(200);
        check('navigation works with reduced motion', location.pathname === '/contact');
        check('native transition pseudo animations disabled', getComputedStyle(document.documentElement, '::view-transition-group(nav-dot)').animationName === 'none');
        return { pass: results.every(r => r.pass), mode: 'Application CSSOM and matchMedia emulation; OS/browser preference unchanged', results, authoredMediaRulesExercised: changed.length };
    } finally {
        window.matchMedia = nativeMatch;
        for (const [rule, text] of changed.reverse()) rule.media.mediaText = text;
    }
})()
