#!/usr/bin/env node
/**
 * Server-render one piece of markup for a browser test: the markup arrives
 * base64-encoded as the only argument, and the rendered HTML (stylesheets
 * inlined, icons embedded) goes to stdout. Run by the test runner's plugin
 * in its own process, as ssr-previews.mjs is, and for the same reason.
 */
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const requireFromWC = createRequire(pathToFileURL(path.join(root, 'packages/web-components/package.json')));
const { renderDeclarativeShadowDOM } = await import(pathToFileURL(requireFromWC.resolve('@arclux/arc-ui/ssr')).href);

const markup = Buffer.from(process.argv[2], 'base64').toString('utf8');
const { html } = await renderDeclarativeShadowDOM(markup, { lift: false });
process.stdout.write(html);
