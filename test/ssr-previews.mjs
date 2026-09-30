#!/usr/bin/env node
/**
 * Server-render every component's docs preview, for first-paint.test.js.
 *
 * Prints JSON: { body, stylesheets: { [path]: css } }. `body` holds one
 * <section data-arc-preview="tag"> per component, and the icon payload.
 * Run in its own process by the test runner's plugin (web-test-runner.config.mjs),
 * because importing @lit-labs/ssr installs its DOM shim on the process's
 * globals, which the test runner itself should never see.
 *
 * The previews are the docs site's `previewHtml`: the markup a reader sees
 * first on each component's page, children and all. That is what makes them
 * the right input here. A component that builds its shadow tree from its
 * children only shows the problem when it has some.
 */
import fs from 'node:fs';
import path from 'node:path';
import { createRequire, register } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const WC = path.join(root, 'packages/web-components');
const DATA = path.join(root, 'docs/src/data/components');
const requireFromWC = createRequire(pathToFileURL(path.join(WC, 'package.json')));
const load = (spec) => import(pathToFileURL(requireFromWC.resolve(spec)).href);

// The docs data imports its siblings without an extension, as a bundler
// allows; Node needs to be told where './button' is.
register(
  'data:text/javascript,' +
    encodeURIComponent(`export async function resolve(spec, ctx, next) {
      try { return await next(spec, ctx); }
      catch (e) { if (spec.startsWith('.') && !/\\.[a-z]+$/.test(spec)) return next(spec + '.ts', ctx); throw e; }
    }`),
);

const { renderDeclarativeShadowDOM } = await load('@arclux/arc-ui/ssr');
// The same glyphs the docs site renders with.
await load('@arclux/arc-ui-icons/phosphor');

// One document, each preview in its own section, rendered once: the icon
// payload is per document, and the client reads the first it finds, so
// separate renders would each carry only their own glyphs.
const sections = [];
for (const file of fs.readdirSync(DATA).sort()) {
  if (!file.endsWith('.ts') || file.startsWith('_')) continue;
  const mod = await import(pathToFileURL(path.join(DATA, file)).href);
  for (const def of Object.values(mod)) {
    if (!def?.tag || !def.previewHtml) continue;
    sections.push(`<section data-arc-preview="${def.tag}">${def.previewHtml}</section>`);
  }
}
const stylesheets = new Map();
const { html } = await renderDeclarativeShadowDOM(
  `<!doctype html><html><body>${sections.join('')}</body></html>`,
  {
    stylesheets,
    stylesheetPath: '/__arc',
  },
);
const body = html.slice(html.indexOf('<body>') + 6, html.lastIndexOf('</body>'));

// The render keeps its sheets as css → file name; serve them by path.
const byPath = Object.fromEntries([...stylesheets].map(([css, name]) => [`/__arc/${name}`, css]));
process.stdout.write(JSON.stringify({ body, stylesheets: byPath }));
