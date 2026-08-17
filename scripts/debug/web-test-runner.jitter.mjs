/**
 * Hunting config. NOT for normal runs — `pnpm test` keeps using the plain one.
 *
 * A load-sensitive test is only rare because the machine is usually fast enough.
 * Waiting for natural load to expose one is a stakeout: six clean runs, then ten,
 * and the sample never gets big enough to be worth the wall-clock.
 *
 * So the load is manufactured instead, inside the page and on the main thread —
 * which is the only place it bites. A jitter loop blocks synchronously for a
 * random slice on a random interval, so every timer, rAF, observer delivery and
 * layout read in the suite has to survive being interrupted. Anything that fails
 * under it has encoded a guess about how busy the machine is.
 *
 * **KNOWN LIMITATION — read before trusting a clean run.** This blocks the main
 * thread, which delays the component's work and the *test's own* waits by the
 * same amount. It therefore cannot surface a test racing a frame-count wait
 * (`await settle()` then read a layout value): both sides slip together and the
 * race barely moves. Three clean runs here "cleared" nothing, and the real flake
 * — arc-context-menu re-anchoring, caught 2026-08-03 — was exactly that shape.
 *
 * Valid for: tests racing a fixed wall-clock sleep (`await wait(120)` then assert
 * progress). Invalid for: tests racing rAF/observer delivery. For those, poll
 * with until() and do not expect this tool to prove their absence.
 *
 * Tunable through env so a failure can be bisected by severity:
 *   JITTER_MS   max block per hit  (default 60)
 *   JITTER_GAP  max gap between    (default 300)
 *
 * The duty cycle at the defaults is roughly 20%: enough to break a fixed sleep
 * sized at 4x its nominal interval, not enough to push an honest test past
 * Mocha's 2000ms on its own.
 */
import { playwrightLauncher } from '@web/test-runner-playwright';

const MS = Number(process.env.JITTER_MS ?? 60);
const GAP = Number(process.env.JITTER_GAP ?? 300);

const jitter = `
<script>
(() => {
  const MAX_BLOCK = ${MS};
  const MAX_GAP = ${GAP};

  // Grab the real setTimeout now, before any test file can patch it.
  // timer-teardown.test.js counts outstanding timers through a stubbed
  // setTimeout to prove components clean up after themselves, and this loop
  // always has exactly one pending — scheduling through the stub makes every
  // component in that file look like it leaked one timer. The instrument has
  // to stay off the scale it is perturbing.
  const schedule = window.setTimeout.bind(window);

  // Deliberately synchronous: a setTimeout that yields would not delay anything.
  const block = (ms) => { const end = performance.now() + ms; while (performance.now() < end); };
  const tick = () => {
    block(Math.random() * MAX_BLOCK);
    schedule(tick, Math.random() * MAX_GAP);
  };
  schedule(tick, Math.random() * MAX_GAP);
})();
</script>`;

export default {
  files: 'packages/web-components/test/**/*.test.js',
  nodeResolve: true,
  browsers: [playwrightLauncher({ product: 'chromium' })],
  testRunnerHtml: (testFramework) => `
    <html>
      <body>
        ${jitter}
        <script type="module" src="${testFramework}"></script>
      </body>
    </html>`,
};
