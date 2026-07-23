import { playwrightLauncher } from '@web/test-runner-playwright';

export default {
  files: 'packages/web-components/test/**/*.test.js',
  nodeResolve: true,
  browsers: [playwrightLauncher({ product: 'chromium' })],
};
