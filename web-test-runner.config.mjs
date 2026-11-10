import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import { defaultReporter } from '@web/test-runner';
import { playwrightLauncher } from '@web/test-runner-playwright';

const FILES = 'packages/web-components/test/**/*.test.js';

/**
 * Server-rendered docs previews for first-paint.test.js, rendered once per run
 * in a child process (test/ssr-previews.mjs says why) and served as a module,
 * with the stylesheets the render lifted served beside it. Nothing is
 * committed: the previews are whatever the source renders today.
 */
function ssrPreviews() {
  let data;
  const get = () =>
    (data ??= JSON.parse(
      execFileSync(process.execPath, ['test/ssr-previews.mjs'], { maxBuffer: 64 << 20 }),
    ));
  return {
    name: 'arc-ssr-previews',
    serve(context) {
      if (context.path === '/__ssr-previews.js') {
        return { body: `export default ${JSON.stringify(get().body)};`, type: 'js' };
      }
      // `/__ssr-render.js?m=<base64 markup>`: one server render, for a test
      // that needs a specific page rather than the previews.
      if (context.path === '/__ssr-render.js') {
        const m = new URL(context.url, 'http://x').searchParams.get('m') ?? '';
        const html = execFileSync(process.execPath, ['test/ssr-render.mjs', m], { maxBuffer: 64 << 20 }).toString();
        return { body: `export default ${JSON.stringify(html)};`, type: 'js' };
      }
      if (context.path === '/__register-all.js') {
        const src = 'packages/web-components/src';
        const files = fs
          .readdirSync(src, { recursive: true })
          .filter((f) => f.endsWith('.register.js') && !f.startsWith('generated'));
        // One import each, settled together: a component whose dependency the
        // test server can't load (arc-qr-code's CommonJS encoder) is skipped
        // rather than taking every other definition down with it.
        const list = JSON.stringify(files.map((f) => `/${src}/${f}`));
        return { body: `await Promise.allSettled(${list}.map((m) => import(m)));`, type: 'js' };
      }
      if (context.path.startsWith('/__arc/')) {
        const css = get().stylesheets[context.path];
        if (css !== undefined) return { body: css, type: 'css' };
      }
      return undefined;
    },
  };
}

/**
 * The test count the docs site quotes (docs/src/data/site-stats.ts), written
 * to docs/src/data/test-count.json by the runner itself.
 *
 * The site used to count `it(` calls in the test sources, which said 2,687
 * while the runner ran 5,140: a test inside a loop is one `it(` and many
 * tests. Only the runner knows the real number, and the docs build (Cloudflare
 * Pages) runs no tests, so the number has to be a committed file. Commit it
 * when it changes.
 *
 * Written only when the run is the whole suite, the configured glob, not
 * `--files` (which `pnpm test:log <file>` passes), and not in watch mode; and
 * not when any file failed to load, since its tests never registered. Counts
 * every test that ran, passed or failed; skipped ones are left out. A stray
 * `.only` would shrink it, which the diff on the committed file shows.
 */
export function testCountReporter({ files = FILES, out = new URL('./docs/src/data/test-count.json', import.meta.url) } = {}) {
  let wholeSuite = false;
  return {
    start({ config }) {
      wholeSuite = config.files === files && !config.watch;
    },
    onTestRunFinished({ sessions }) {
      if (!wholeSuite || sessions.some((s) => s.errors?.length || !s.testResults)) return;
      let tests = 0;
      const walk = (suite) => {
        for (const t of suite.tests) if (!t.skipped) tests++;
        for (const child of suite.suites) walk(child);
      };
      for (const s of sessions) walk(s.testResults);
      const body = `${JSON.stringify({ tests }, null, 2)}\n`;
      if (!fs.existsSync(out) || fs.readFileSync(out, 'utf-8') !== body) fs.writeFileSync(out, body);
    },
  };
}

export default {
  files: FILES,
  nodeResolve: true,
  browsers: [playwrightLauncher({ product: 'chromium' })],
  plugins: [ssrPreviews()],
  reporters: [defaultReporter(), testCountReporter()],
  // Before every test file: a failing assertion about a DOM node would
  // otherwise hang the run rather than fail. See the module for why.
  testRunnerHtml: (testFramework) => `<html><body>
    <script type="module" src="/packages/web-components/test/setup/node-safe-assertions.js"></script>
    <script type="module" src="${testFramework}"></script>
  </body></html>`,
};
