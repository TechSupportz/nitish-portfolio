// Negative browser check: an invalid transition name must remain observable.
(async () => {
    const failures = [], nodes = [document.createElement('div'), document.createElement('div')];
    nodes.forEach(node => { node.textContent = 'QA'; node.style.cssText = 'position:fixed;top:100px;left:10px;view-transition-name:qa-duplicate-name'; document.body.append(node); });
    const error = e => failures.push({ name: e.reason?.name, message: String(e.reason) });
    window.addEventListener('unhandledrejection', error);
    try {
        const transition = document.startViewTransition(() => {});
        await transition.finished;
        await new Promise(r => setTimeout(r, 200));
        return { pass: failures.some(e => e.name === 'InvalidStateError'), expectedErrors: failures, path: location.pathname };
    } finally {
        nodes.forEach(node => node.remove());
        window.removeEventListener('unhandledrejection', error);
    }
})()
