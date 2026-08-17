/**
 * ssr-fuzz.test.js — server-render every component's populated paths.
 *
 * Split out of scripts/checks/ssr.js by V4-PLAN 4.10: the check keeps the
 * CLIENT_ONLY / UPSTREAM_BLOCKED bookkeeping and the bare-element render —
 * "does this component server-render at all" is a contract with a decision
 * list behind it. What lives here is the fuzzing that grew around that
 * contract: the enum-variant markup passes and the explicit structured-prop
 * samples, which are test cases, not bookkeeping — they earn new entries the
 * way tests do, and their failures read like test failures.
 *
 * Node-side on purpose (`node --test`, wired as `pnpm test:ssr-fuzz` and into
 * `pnpm verify`): @lit-labs/ssr is a Node renderer, and the browser suite in
 * packages/web-components/test cannot host it. This file lives beside
 * test/wrapper-runtime/ — the repo's other Node-side suite — and deliberately
 * leaves packages/web-components/test/helpers.js untouched (the do-NOT list's
 * additive-only rule; nothing here needs a browser helper anyway).
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const WC = path.join(root, 'packages/web-components');
const SRC = path.join(WC, 'src');

// Shared with @arclux/arc-ui/ssr and scripts/checks/ssr.js: a component on
// this list is client-only by decision, so its populated paths are not
// server-rendered here either.
import { CLIENT_ONLY } from '../packages/web-components/src/ssr-client-only.js';

// lit and @lit-labs/ssr are installed in the web-components package, not the
// workspace root, so resolve them from there rather than from this file.
const requireFromWC = createRequire(pathToFileURL(path.join(WC, 'package.json')));
const importFromWC = (spec) => import(pathToFileURL(requireFromWC.resolve(spec)).href);

const { render } = await importFromWC('@lit-labs/ssr');
const { collectResult } = await importFromWC('@lit-labs/ssr/lib/render-result.js');
const { html } = await importFromWC('lit');

/**
 * Every component tag, paired with the module that registers it.
 *
 * Duplicated from scripts/checks/ssr.js rather than shared: the check is a
 * script and this is a test, and a lib module existing only to couple the two
 * would out-weigh the fifteen lines.
 */
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

const all = components().filter(({ tag }) => !CLIENT_ONLY[tag]);

// Icons resolve through a code-split dynamic import, so a named icon renders
// only if it is already in memory — on the server there is no second pass to
// fill it in later.
const { iconRegistry } = await import(
  pathToFileURL(path.join(SRC, 'content/icon-registry.js')).href
);
await iconRegistry.preload([SAMPLE_ICON]);

test('ssr fuzz: populated renders', async (t) => {
  // Anti-vacuity: an empty walk or a sample map naming no live tag would pass
  // every subtest below by running none of them.
  assert.ok(all.length > 0, 'no components found — nothing was asserted');
  const tags = new Set(all.map((c) => c.tag));
  for (const tag of Object.keys(PROPERTY_SAMPLES)) {
    assert.ok(tags.has(tag), `PROPERTY_SAMPLES names ${tag}, which is not a registered component`);
  }

  for (const { tag, module } of all) {
    await t.test(tag, async () => {
      await import(pathToFileURL(module).href);

      // Enum-variant pass: the same element with its documented attributes
      // set, once per enum-literal variant.
      for (const markup of populatedMarkups(tag)) {
        await collectResult(render(markupTemplate(markup)));
      }

      // Structured props from the explicit sample map.
      const sample = PROPERTY_SAMPLES[tag]?.();
      if (sample) {
        await collectResult(render(sample.template));
        const problem = sample.verify?.();
        if (problem) assert.fail(problem);
      }
    });
  }
});
