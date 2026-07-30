#!/usr/bin/env node
/**
 * check-ssr.js
 *
 * Server-renders every component with @lit-labs/ssr and reports the ones that
 * throw.
 *
 * This is the empirical half of the SSR audit in issue #4. Static analysis says
 * which components *mention* a browser global; only rendering them in Node says
 * which ones break, and those are not the same list — a global inside an event
 * handler is fine, one in a field initialiser is not.
 *
 * Server-side, Lit runs the constructor, willUpdate and render. It does not run
 * connectedCallback, firstUpdated, updated, or any reactive controller's
 * hostConnected — so browser work belongs in those, and this is what proves it
 * stayed there.
 *
 * A component that fails is not necessarily broken: some are inherently
 * client-only. But that should be a recorded decision in CLIENT_ONLY rather
 * than a surprise in a consumer's build. An entry that starts passing is
 * reported too, so the list cannot quietly rot.
 *
 * Run via: pnpm run check:ssr
 */
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const WC = path.join(root, 'packages/web-components');
const SRC = path.join(WC, 'src');

/**
 * Components that cannot be server-rendered *by our own design*, with the
 * reason. This list should stay near-empty; anything on it is content a
 * consumer cannot get into their initial payload.
 */
const CLIENT_ONLY = {
  'arc-markdown':
    'Its sanitizer is DOMParser-based. Rendering unsanitized HTML on the server '
    + 'is not an option, and rendering a different shape (escaped text) would '
    + 'break hydration, which reconnects to the server DOM rather than '
    + 're-rendering it. Needs a DOM-less sanitizer to lift.',
};

/**
 * Blocked by @lit-labs/ssr 4.1.0 (latest at time of writing), not by us.
 *
 *   TypeError: element.getRootNode is not a function
 *     at addElementToEventPath (@lit-labs/ssr/lib/render-value.js)
 *
 * Its event-path bookkeeping calls getRootNode() on its own element shim,
 * which does not implement it. Triggered by an event binding on a nested
 * custom element in certain host/slot arrangements — arc-callout has the same
 * shape and renders fine, so it is narrower than "any nested component".
 *
 * Kept separate from CLIENT_ONLY on purpose: these components are not
 * client-only, they are waiting on a fix upstream, and conflating the two
 * would lose that distinction the moment someone reads the list.
 */
const UPSTREAM_BLOCKED = {
  'element.getRootNode is not a function': [
    'arc-chip', 'arc-code-block', 'arc-command-bar', 'arc-confirm', 'arc-dialog',
    'arc-drawer', 'arc-loading-overlay', 'arc-modal', 'arc-sheet',
    'arc-speed-dial', 'arc-transfer-list',
  ],
};

/** Whether this failure is the known upstream one for this tag. */
function isUpstream(tag, message) {
  return Object.entries(UPSTREAM_BLOCKED)
    .some(([msg, tags]) => tags.includes(tag) && message.includes(msg));
}

// lit and @lit-labs/ssr are installed in the web-components package, not the
// workspace root, so resolve them from there rather than from this script.
const requireFromWC = createRequire(pathToFileURL(path.join(WC, 'package.json')));
const importFromWC = (spec) => import(pathToFileURL(requireFromWC.resolve(spec)).href);

const { render } = await importFromWC('@lit-labs/ssr');
const { collectResult } = await importFromWC('@lit-labs/ssr/lib/render-result.js');
const { html } = await importFromWC('lit');

/** Every component tag, paired with the module that registers it. */
function components() {
  const out = [];
  for (const tier of fs.readdirSync(SRC, { withFileTypes: true })) {
    if (!tier.isDirectory() || tier.name === 'icons' || tier.name === 'generated') continue;
    for (const file of fs.readdirSync(path.join(SRC, tier.name))) {
      if (!file.endsWith('.register.js')) continue;
      const src = fs.readFileSync(path.join(SRC, tier.name, file), 'utf-8');
      const tag = src.match(/customElements\.define\(\s*['"]([a-z0-9-]+)['"]/)?.[1];
      if (tag) out.push({ tag, module: path.join(SRC, tier.name, file) });
    }
  }
  return out.sort((a, b) => a.tag.localeCompare(b.tag));
}

/** A tagged-template literal built for one tag, since html`` can't take one dynamically. */
function elementTemplate(tag) {
  const text = `<${tag}></${tag}>`;
  return html(Object.assign([text], { raw: [text] }));
}

const all = components();
const results = [];

for (const { tag, module } of all) {
  try {
    await import(pathToFileURL(module).href);
    // A bare element is enough: the crash being looked for happens in the
    // constructor or the first render, before any property matters.
    const out = await collectResult(render(elementTemplate(tag)));
    results.push({ tag, ok: true, dsd: out.includes('shadowrootmode') });
  } catch (err) {
    results.push({ tag, ok: false, message: err?.message ?? String(err) });
  }
}

const blocked = results.filter((r) => !r.ok && isUpstream(r.tag, r.message));
const failures = results.filter(
  (r) => !r.ok && !CLIENT_ONLY[r.tag] && !isUpstream(r.tag, r.message)
);
const unexpectedPasses = results.filter(
  (r) => r.ok && (CLIENT_ONLY[r.tag] || Object.values(UPSTREAM_BLOCKED).flat().includes(r.tag))
).map((r) => r.tag);
const ok = results.filter((r) => r.ok);

console.log(
  `check-ssr: ${ok.length}/${results.length} components server-render, ` +
  `${ok.filter((r) => r.dsd).length} emitting declarative shadow DOM`
);
console.log(
  `           ${blocked.length} blocked upstream, ` +
  `${Object.keys(CLIENT_ONLY).length} client-only by design`
);

if (unexpectedPasses.length > 0) {
  console.error(
    `\ncheck-ssr: ${unexpectedPasses.length} component(s) listed as unable to render now render fine.`
  );
  console.error('Remove them from CLIENT_ONLY / UPSTREAM_BLOCKED — a stale exclusion hides a real gain:');
  console.error(unexpectedPasses.map((t) => `  ${t}`).join('\n'));
}

if (failures.length > 0) {
  console.error(`\ncheck-ssr: ${failures.length} component(s) throw when server-rendered\n`);
  for (const f of failures) console.error(`  ${f.tag}: ${f.message}`);
  console.error(
    '\nServer-side Lit runs the constructor, willUpdate and render — and none of\n' +
    "connectedCallback, firstUpdated, updated or a controller's hostConnected.\n" +
    'Move the browser work into one of those, or record the component in\n' +
    'CLIENT_ONLY with a reason.'
  );
}

if (failures.length > 0 || unexpectedPasses.length > 0) process.exit(1);
