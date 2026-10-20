# Portfolio production E2E

Failure modes to cover before changing the implementation:

- Internal navigation reloads the document, lags before swapping, or leaves a stale active dot.
- Interrupted history/click navigation rejects or renders an older destination.
- Drawer disappears before swap, waits for the incoming page, fails to fade/slide, or stops reopening.
- Persistent logo restarts on every route or loses its hover spin.
- Role timer duplicates on revisits, changes too early after manual selection, stops cycling, or survives teardown.
- Canvas stops animating, changes icon incorrectly, loses pointer/ripple/HDR behavior, or draws after unmount.
- Responsive thumbnails blur at high density, change card geometry, or fetch oversized resources.
- Entry animations disappear; header background starts moving with the title.
- Font preload changes cause fallback flashes or layout shifts.
- Contact copy control fails to reset after navigation/revisits.
- Direct routes, unknown-route status, mobile 404 typography, or reduced motion regress.
- Project category expansion, project scrolling, active text, or the mobile sticky title stops following visibility after React islands are removed; crossing the desktop breakpoint leaves the wrong control active.

Build with `pnpm build`, then serve with `pnpm preview:cf` on port 8787. Check an actual HTTP 200 and body after every rebuild; restart only this preview if Wrangler has stale assets.

Open a fresh browser tab at `http://localhost:8787/`. Use 1440×900 for desktop, 390×844 for mobile (DPR is recorded separately). Set `window.portfolioSuite` to `performance`, `desktop`, `mobile`, or `stress`, then evaluate **the trimmed contents** of `portfolio.browser.js`. Each returns a serializable report with assertions and timestamped router events. All must return `pass: true`. Run performance before and after on the same machine and viewport; the six route samples include warm prefetched navigation.

The browser's clipboard permission must allow writing for the contact check. No external links are opened and no messages are sent. Browser error listeners are observed without suppressing errors. A stress failure must be investigated, never filtered out of a passing result.

To repeat the main-thread stress condition, run `const busy = setInterval(() => { const end = performance.now() + 8; while (performance.now() < end) {} }, 16)` before the stress suite; run `clearInterval(busy)` in `finally`. This is a synthetic 8 ms task every 16 ms, not a calibrated CPU slowdown. It reproduced the baseline React #424 unmount-before-hydration race.

Other real-browser expressions: `images.browser.js` checks candidate resolution, aspect ratio and actual resource bytes; `projects.browser.js` checks scroll, active category and sticky title; `interaction.browser.js` checks canvas pointer/ripple and manual/automatic role deadlines; `motion.browser.js` samples title/background and dot timing; `transition-errors.browser.js` deliberately creates invalid duplicate names and expects an observable InvalidStateError. Run the negative check separately from the zero-error suites. `reduced-motion.browser.js` uses the site's actual CSS through CSSOM plus matchMedia emulation because T3 has no native reduced-motion control; it restores the overrides and does not change OS settings. HDR output and other browser engines still require real-device checks.

Use browser screenshots and recordings to inspect logo hover, title entry over stationary background, matrix interaction, and the mobile drawer over the incoming contact page. Inspect extracted video frames against the current URL/DOM before accepting a recording. Additional direct-load and reduced-motion checks and result files are documented in the artifact README generated for this pass.
