/**
 * Probe config: how close is any test file to the runner's *own* timeouts?
 *
 * Hypothesis worth measuring rather than arguing about. The runner gives each
 * page 10s to get from "navigated" to "tests started" (`testsStartTimeout`).
 * A page that misses it fails as a single entry — one failure, in one file, with
 * a message about starting rather than about any assertion. That is the exact
 * silhouette of the flake on record: one test, no useful message, and it never
 * reproduces because the second run has a warm module graph and starts far
 * faster than the first.
 *
 * Nothing in a normal run reveals the margin, because passing at 10s and passing
 * at 0.4s look identical. So squeeze the limit until files fail, and the failures
 * name the slowest files and how slow they are. Run it as a ratchet:
 *
 *   STARTUP_MS=1500 npx web-test-runner --config web-test-runner.startprobe.mjs
 *
 * If nothing fails at a value far below 10000, the flake is not here.
 */
import { playwrightLauncher } from '@web/test-runner-playwright';

export default {
  files: 'packages/web-components/test/**/*.test.js',
  nodeResolve: true,
  browsers: [playwrightLauncher({ product: 'chromium' })],
  concurrency: Number(process.env.PROBE_CONCURRENCY ?? 12),
  testsStartTimeout: Number(process.env.STARTUP_MS ?? 1500),
};
