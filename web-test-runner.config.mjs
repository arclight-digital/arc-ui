import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import { playwrightLauncher } from '@web/test-runner-playwright';

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

export default {
  files: 'packages/web-components/test/**/*.test.js',
  nodeResolve: true,
  browsers: [playwrightLauncher({ product: 'chromium' })],
  plugins: [ssrPreviews()],
  // Before every test file: a failing assertion about a DOM node would
  // otherwise hang the run rather than fail. See the module for why.
  testRunnerHtml: (testFramework) => `<html><body>
    <script type="module" src="/packages/web-components/test/setup/node-safe-assertions.js"></script>
    <script type="module" src="${testFramework}"></script>
  </body></html>`,
};
