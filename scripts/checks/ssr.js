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
 * handler is fine, one in a field initializer is not.
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
 * Run via: pnpm check ssr
 */
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..', '..');
const WC = path.join(root, 'packages/web-components');
const SRC = path.join(WC, 'src');

// Shared with @arclux/arc-ui/ssr, which refuses to register a component on this
// list. One copy, in the package, because both readers depend on it being true.
import { CLIENT_ONLY } from '../../packages/web-components/src/ssr-client-only.js';

/**
 * Failures attributable to @lit-labs/ssr rather than to a component.
 *
 * Empty, and the history is worth keeping. Eleven components once failed here
 * with "element.getRootNode is not a function" and were recorded as an
 * upstream regression in @lit-labs/ssr 4.x. That was wrong. The cause was two
 * copies of @lit-labs/ssr-dom-shim in the local tree — the components resolved
 * one, the renderer expected the other, and the element shim they met had no
 * getRootNode. A clean reinstall deduped it and all eleven render.
 *
 * The lesson is about this check, not about lit: a dependency-resolution
 * artifact is indistinguishable from a library bug from inside a single
 * install, and the way it was caught was trying to reduce it to a minimal
 * reproduction and failing to reproduce it at all.
 */
const UPSTREAM_BLOCKED = {};

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

/** A tagged-template literal built from markup, since html`` can't take one dynamically. */
function markupTemplate(text) {
  return html(Object.assign([text], { raw: [text] }));
}

/**
 * Attribute values to render each component *with*, derived from the manifest.
 *
 * A bare element is not enough, and believing it was cost real coverage.
 * arc-icon only touches its SVG path when it has a `name`; the sanitizer behind
 * that path called DOMParser, so every named icon threw in Node — and this
 * check reported 185/186 the whole time, because `<arc-icon>` with no name
 * returns a slot and never gets there. Property-dependent branches are where
 * browser-only code hides, so they have to be rendered, not assumed.
 */
const MANIFEST = JSON.parse(
  fs.readFileSync(path.join(WC, 'custom-elements.json'), 'utf-8')
);

/** Attributes whose value has to be a real icon name to exercise anything. */
const ICON_ATTRIBUTE = /(^|-)icon$|^name$/;

/** One icon that exists in both shipped libraries, used wherever a name is wanted. */
const SAMPLE_ICON = 'check';

/** All string-literal values of an enum union in a manifest type text. */
const literalsOf = (type) => [...type.matchAll(/'([^']*)'/g)].map((m) => m[1]);

/** A plausible value for one manifest attribute, or null to leave it off. */
function sampleValue(tag, attr, variant = 0) {
  const type = attr.type?.text ?? 'string';

  // A union of string literals: every one is rendered across the variant
  // passes, because branch-per-variant is exactly where browser-only code
  // hides — rendering only the first literal left every other branch of a
  // `variant === 'x'` render untested. An attribute with fewer literals than
  // the variant index holds its last value.
  const literals = literalsOf(type);
  if (literals.length > 0) return literals[Math.min(variant, literals.length - 1)];

  // Structured types get skipped, not guessed. `string[]` still contains the
  // word "string", and feeding "Example" to arc-table's `columns` produced a
  // failure that said nothing about SSR — only about this function.
  if (/\[\]|[<>{}]|\b(Array|Object|Record|Map|Set|Function)\b/.test(type)) return null;

  if (/\bboolean\b/.test(type)) return '';
  if (/\bnumber\b/.test(type)) return '1';
  if (!/\bstring\b/.test(type)) return null; // anything else unrecognized

  if (tag === 'arc-icon' && attr.name === 'name') return SAMPLE_ICON;
  if (ICON_ATTRIBUTE.test(attr.name) && attr.name !== 'name') return SAMPLE_ICON;
  // Intl.NumberFormat validates currency codes eagerly; "Example" throws a
  // RangeError that is about this function, not about SSR. (Only reachable now
  // that the variant pass renders type="currency" — the first-literal-only
  // pass never got past type="number".)
  if (attr.name === 'currency') return 'USD';
  return 'Example';
}


/**
 * `<tag a="1" b>` markups built from the manifest — one per enum-literal
 * variant, so every literal of every enum union renders once. Variants are
 * batched by index rather than combined (variant N sets every enum attribute
 * to its Nth literal), so cross-attribute *combinations* remain uncovered —
 * exhaustive combinatorics would be thousands of renders for no plausible
 * class of bug. Empty when the tag has no manifest attributes.
 */
function populatedMarkups(tag) {
  const decl = MANIFEST.modules
    ?.flatMap((m) => m.declarations ?? [])
    .find((d) => d.tagName === tag);
  if (!decl?.attributes?.length) return [];

  const variants = Math.max(
    1,
    ...decl.attributes.map((a) => literalsOf(a.type?.text ?? '').length)
  );
  const markups = [];
  for (let v = 0; v < variants; v++) {
    let out = `<${tag}`;
    for (const attr of decl.attributes) {
      const value = sampleValue(tag, attr, v);
      if (value === null) continue;
      out += value === '' ? ` ${attr.name}` : ` ${attr.name}="${value}"`;
    }
    markups.push(`${out}></${tag}>`);
  }
  return markups;
}

/**
 * Structured (array/object/function-typed) props cannot be spelled as
 * attributes, so the markup passes above skip them — which skipped e.g.
 * arc-virtual-list's items-populated render path entirely. This is an explicit
 * per-component sample map, not a guessing scheme: add a component here when
 * its populated path matters.
 *
 * Still uncovered: structured props of components not listed here (arc-table
 * columns/rows, arc-chart data, arc-kanban columns, ...) and combinations of
 * structured props with enum variants.
 *
 * Each entry returns { template, verify }: the lit template to server-render,
 * and an optional post-render assertion returning an error string. The
 * assertion is what keeps a sample honest — a sample that silently stops
 * exercising its path is the arc-icon lesson all over again.
 */
const PROPERTY_SAMPLES = {
  'arc-virtual-list': () => {
    let rows = 0;
    return {
      // The component only computes its visible window from a client-side
      // measure (firstUpdated → _recalc), so a bare server render shows zero
      // rows and never calls renderItem. Seeding the private `_visibleCount`
      // state forces two rows through the renderItem path in Node; `verify`
      // fails loudly if a rename ever makes the seed a no-op.
      template: html`<arc-virtual-list
        item-height="20"
        .items=${[{ id: 1 }, { id: 2 }, { id: 3 }]}
        .renderItem=${(item, index) => {
          rows++;
          return html`<div>row ${item.id} at ${index}</div>`;
        }}
        ._visibleCount=${2}
      ></arc-virtual-list>`,
      verify: () =>
        rows > 0
          ? null
          : 'renderItem was never invoked — the seeded _visibleCount no longer forces rows through the server render',
    };
  },
  'arc-knob': () => {
    let formatted = 0;
    return {
      template: html`<arc-knob
        value="440"
        min="20"
        max="2000"
        .detents=${[100, 440, 1000]}
        .format=${(v) => {
          formatted++;
          return `${v} Hz`;
        }}
      ></arc-knob>`,
      verify: () =>
        formatted > 0
          ? null
          : 'format() was never invoked — the readout path no longer renders server-side',
    };
  },
  // The remaining entries carry no callback prop, so there is no honest signal
  // to verify — the populated render itself is the exercised path.
  'arc-waveform': () => ({
    template: html`<arc-waveform
      duration="212"
      position="0.4"
      interactive
      variant="bars"
      .peaks=${Array.from({ length: 48 }, (_, i) => 0.15 + 0.85 * Math.abs(Math.sin(i * 0.7)))}
    ></arc-waveform>`,
  }),
  'arc-uptime': () => ({
    template: html`<arc-uptime
      start-label="90 days ago"
      end-label="Today"
      .data=${[1, 0.98, { value: 0.5, status: 'down', label: 'Mar 4' }, { status: 'none' }]}
    ></arc-uptime>`,
  }),
  'arc-terminal': () => ({
    template: html`<arc-terminal
      title="deploy"
      .lines=${[
        { type: 'comment', text: '# install' },
        { type: 'command', text: 'pnpm add @arclux/arc-ui' },
        { type: 'output', text: '+ @arclux/arc-ui 3.0.0' },
      ]}
    ></arc-terminal>`,
  }),
  'arc-lightbox': () => ({
    template: html`<arc-lightbox
      index="1"
      .images=${[
        { src: '/a.jpg', alt: 'A', caption: 'First' },
        '/b.jpg',
      ]}
    ></arc-lightbox>`,
  }),
  'arc-json-tree': () => ({
    template: html`<arc-json-tree
      expanded="2"
      .data=${{ id: 'usr_1042', active: true, score: 9.75, tags: ['alpha', 'beta'], profile: { name: 'Ada', email: null } }}
    ></arc-json-tree>`,
  }),
  'arc-tree-select': () => ({
    template: html`<arc-tree-select
      label="Instrument"
      value="violin"
      .expandedValues=${['strings']}
      .items=${[
        { value: 'keys', label: 'Keys', children: [{ value: 'piano', label: 'Piano' }] },
        { value: 'strings', label: 'Strings', children: [
          { value: 'violin', label: 'Violin' },
          { value: 'cello', label: 'Cello' },
        ] },
      ]}
    ></arc-tree-select>`,
  }),
  'arc-keyboard-map': () => ({
    template: html`<arc-keyboard-map
      platform="mac"
      caption="Command palette"
      .highlight=${['mod+shift+p', 'escape']}
    ></arc-keyboard-map>`,
  }),
  'arc-activity-heatmap': () => ({
    template: html`<arc-activity-heatmap
      end-date="2026-03-14"
      weeks="4"
      .data=${[
        { date: '2026-03-04', value: 7, label: '7 commits' },
        { date: '2026-03-14', value: 3 },
      ]}
    ></arc-activity-heatmap>`,
  }),
};

const all = components();
const results = [];

// Icons resolve through a code-split dynamic import, so a named icon renders
// only if it is already in memory — on the server there is no second pass to
// fill it in later.
const { iconRegistry } = await import(
  pathToFileURL(path.join(SRC, 'content/icon-registry.js')).href
);
await iconRegistry.preload([SAMPLE_ICON]);

for (const { tag, module } of all) {
  try {
    await import(pathToFileURL(module).href);
    const out = await collectResult(render(markupTemplate(`<${tag}></${tag}>`)));
    results.push({ tag, ok: true, dsd: out.includes('shadowrootmode') });
  } catch (err) {
    results.push({ tag, ok: false, message: err?.message ?? String(err) });
    continue;
  }

  const result = results[results.length - 1];
  const fail = (message) => {
    result.ok = false;
    result.withProps = true;
    result.message = message;
  };

  // Second pass: the same element with its documented attributes set, once
  // per enum-literal variant.
  for (const markup of populatedMarkups(tag)) {
    try {
      await collectResult(render(markupTemplate(markup)));
    } catch (err) {
      fail(err?.message ?? String(err));
      break;
    }
  }
  if (!result.ok) continue;

  // Third pass: structured props from the explicit sample map.
  const sample = PROPERTY_SAMPLES[tag]?.();
  if (sample) {
    try {
      await collectResult(render(sample.template));
      const problem = sample.verify?.();
      if (problem) fail(problem);
    } catch (err) {
      fail(err?.message ?? String(err));
    }
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
