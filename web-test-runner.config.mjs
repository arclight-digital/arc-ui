import { playwrightLauncher } from '@web/test-runner-playwright';

export default {
  files: 'packages/web-components/test/**/*.test.js',
  nodeResolve: true,
  browsers: [playwrightLauncher({ product: 'chromium' })],
  // Before every test file: a failing assertion about a DOM node would
  // otherwise hang the run rather than fail. See the module for why.
  testRunnerHtml: (testFramework) => `<html><body>
    <script type="module" src="/packages/web-components/test/setup/node-safe-assertions.js"></script>
    <script type="module" src="${testFramework}"></script>
  </body></html>`,
};
