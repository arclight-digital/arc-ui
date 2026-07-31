/**
 * check-wrapper-slots.js
 *
 * Asserts that every slot a component declares actually reaches every generated
 * framework wrapper.
 *
 * This exists because of the failure it catches, which shipped in 2.11.0: prism
 * 2.7.0 rewrote wrapper slot handling to enumerate *named* slots and lost the
 * default one. `<arc-button>Save</arc-button>` still rendered its prefix and
 * suffix and dropped the label, in all six framework packages at once —
 *
 *   svelte    {@render children?.()}   → {@render prefix?.()}{@render suffix?.()}
 *   vue       <slot />                 → <slot name="prefix" /><slot name="suffix" />
 *   angular   <ng-content />           → (nothing)
 *   solid     {local.children}         → (nothing)
 *   preact    {children}               → (nothing)
 *   react     children?: ReactNode     → (nothing; @lit/react still forwards at
 *                                        runtime, so React breaks at the type level)
 *
 * Nothing in this repo consumes a wrapper, so no test could see it — the same
 * blind spot check-prop-unions.js was written for. That check covers props; this
 * one covers slots. Between them, the generated surface is asserted rather than
 * assumed.
 *
 * A generator's own diagnostics are not a substitute: prism 2.7.0 reported ten
 * findings about slot *renaming* while silently dropping the default slot in 111
 * components. What a generator warns about is what it knows it did.
 *
 * Run via: pnpm check wrapper-slots (and as part of pnpm generate)
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..', '..');
const SRC = path.join(root, 'packages', 'web-components', 'src');
const TIERS = ['content', 'data', 'feedback', 'input', 'layout', 'navigation', 'typography', 'shared'];

const pascal = (s) => s.split('-').map((w) => w[0].toUpperCase() + w.slice(1)).join('');

/**
 * How each framework expresses "the default slot's content is rendered here".
 *
 * `ext` is the wrapper file extension; `hasDefault` is given the wrapper source.
 * React is the one framework where the default slot needs no template entry —
 * @lit/react's createComponent forwards children itself — so the assertion there
 * is that the prop is *typed*, without which a TypeScript consumer cannot pass
 * children at all.
 */
/**
 * `namedSlotOutlets` marks the frameworks that materialise a template and so need
 * an outlet per named slot. The others hand the consumer's children straight to
 * the custom element, where the browser assigns `slot="x"` children to the right
 * shadow slot on its own — one passthrough covers every named slot, and requiring
 * a per-slot entry there would be wrong.
 */
const FRAMEWORKS = [
  {
    name: 'react',
    ext: 'ts',
    // @lit/react's createComponent forwards children at runtime, so React needs
    // no template entry — but without the type a consumer cannot pass them.
    hasDefault: (s) => /\bchildren\?:/.test(s),
    namedSlotOutlets: false,
    fix: 'declare `children?: React.ReactNode` on the props interface',
  },
  {
    name: 'preact',
    ext: 'tsx',
    // Typed *and* rendered — children pass as h()'s third argument (prism v3
    // renders custom elements via h('arc-x', props, children), since preact's
    // JSX.IntrinsicElements has no entry for them and the literal form
    // doesn't compile).
    hasDefault: (s) => /\bchildren\?:/.test(s) && /,\s*children\)/.test(s),
    namedSlotOutlets: false,
    fix: "declare `children?: preact.ComponentChildren` and pass children to h()",
  },
  {
    name: 'solid',
    ext: 'tsx',
    hasDefault: (s) => /\bchildren\?:/.test(s) && /\{\s*(local|props)\.children\s*\}/.test(s),
    namedSlotOutlets: false,
    fix: 'declare `children?: JSX.Element`, split it out, and render `{local.children}`',
  },
  {
    name: 'svelte',
    ext: 'svelte',
    hasDefault: (s) => /\bchildren\?:\s*Snippet/.test(s) && /\{@render\s+children\?\.\(\)\}/.test(s),
    namedSlotOutlets: true,
    fix: 'declare `children?: Snippet` and render `{@render children?.()}`',
  },
  {
    name: 'vue',
    ext: 'vue',
    // A bare <slot /> or <slot> — anything without a name attribute.
    hasDefault: (s) => /<slot(?![^>]*\bname=)[^>]*>/.test(s),
    namedSlotOutlets: true,
    fix: 'render a bare `<slot />` inside the element',
  },
  {
    name: 'angular',
    ext: 'ts',
    // <ng-content> with no select attribute.
    hasDefault: (s) => /<ng-content(?![^>]*\bselect=)[^>]*>/.test(s),
    namedSlotOutlets: false,
    fix: 'render `<ng-content />` inside the element template',
  },
];

/**
 * Named slots reach a wrapper under a framework-appropriate identifier, and
 * Svelte additionally suffixes any name that collides with a prop (`eyebrow` →
 * `eyebrow_`). Accept the slot name, its camelCase form, or either with a
 * trailing underscore, so this check reports genuinely absent slots rather than
 * re-reporting the renames prism already accounts for.
 */
function mentionsNamedSlot(source, slot) {
  const camel = slot.replace(/-(\w)/g, (_, c) => c.toUpperCase());
  return [slot, `${slot}_`, camel, `${camel}_`].some((n) =>
    source.includes(`"${n}"`) || source.includes(`'${n}'`) ||
    new RegExp(`\\b${n.replace(/[^\w]/g, '\\$&')}\\b`).test(source),
  );
}

const missingDefault = [];
const missingNamed = [];
const undocumented = [];
let checked = 0;
let componentsWithDefault = 0;

for (const tier of TIERS) {
  const dir = path.join(SRC, tier);
  if (!fs.existsSync(dir)) continue;

  for (const file of fs.readdirSync(dir)) {
    if (!file.endsWith('.js') || file.endsWith('.register.js') || file === 'index.js') continue;

    const name = file.replace(/\.js$/, '');
    const source = fs.readFileSync(path.join(dir, file), 'utf-8');

    // Declared slots, from the JSDoc prism itself reads. `@slot -` is the default.
    const declaredNamed = [];
    let declaresDefault = false;
    for (const m of source.matchAll(/^\s*\*\s*@slot\s+(\S*)/gm)) {
      const slot = m[1];
      if (!slot || slot === '-') declaresDefault = true;
      // `@slot none` is prism's reserved spelling for "this component has no
      // default slot and its wrappers take no children". It names the absence,
      // so there is nothing for a wrapper to carry.
      else if (slot === 'none') continue;
      // Skip interpolated names — arc-virtual-list's `item-${index}` is a family
      // of runtime slot names, not a literal one, and no wrapper can express it.
      else if (!slot.includes('$')) declaredNamed.push(slot);
    }

    // Don't take the JSDoc's word for it. A component that renders a bare <slot>
    // accepts default-slot content whether or not anyone documented it, and its
    // wrapper still has to forward children — gating this assertion on the
    // annotation alone would leave exactly the undocumented ones unprotected.
    const rendersDefault = /<slot(?![^>]*\bname=)[^>]*>/.test(source);
    if (rendersDefault && !declaresDefault) {
      undocumented.push(`${tier}/${name} renders a default slot with no \`@slot -\` entry`);
    }
    const acceptsDefault = declaresDefault || rendersDefault;
    if (!acceptsDefault && !declaredNamed.length) continue;
    if (acceptsDefault) componentsWithDefault++;

    for (const fw of FRAMEWORKS) {
      const wrapper = path.join(root, 'packages', fw.name, 'src', tier, `${pascal(name)}.${fw.ext}`);
      if (!fs.existsSync(wrapper)) continue; // not every component has every wrapper
      const text = fs.readFileSync(wrapper, 'utf-8');
      checked++;

      if (acceptsDefault && !fw.hasDefault(text)) {
        missingDefault.push(`${fw.name}/${tier}/${pascal(name)}.${fw.ext} — ${fw.fix}`);
      }
      if (!fw.namedSlotOutlets) continue;
      for (const slot of declaredNamed) {
        if (!mentionsNamedSlot(text, slot)) {
          missingNamed.push(`${fw.name}/${tier}/${pascal(name)}.${fw.ext} — slot "${slot}" absent`);
        }
      }
    }
  }
}

const groups = [
  ['default slot declared but not rendered by the wrapper', missingDefault],
  ['named slot declared but absent from the wrapper', missingNamed],
  ['default slot rendered but not documented', undocumented],
];
const total = groups.reduce((n, [, rows]) => n + rows.length, 0);

if (total === 0) {
  console.log(
    `check-wrapper-slots: ${checked} wrapper(s) checked, ` +
      `${componentsWithDefault} component(s) with a default slot all render it`,
  );
  process.exit(0);
}

// A whole-library breakage prints ~700 lines otherwise, which buries the shape.
function summarize(rows, limit = 12) {
  const byPkg = new Map();
  for (const r of rows) {
    const pkg = r.split('/')[0];
    byPkg.set(pkg, (byPkg.get(pkg) || 0) + 1);
  }
  const shown = rows.slice(0, limit);
  return { shown, rest: rows.length - shown.length, byPkg };
}

console.error(`check-wrapper-slots: ${total} slot(s) do not reach a generated wrapper\n`);
for (const [label, rows] of groups) {
  if (!rows.length) continue;
  const { shown, rest, byPkg } = summarize(rows);
  console.error(`  ${label} — ${rows.length}:`);
  if (byPkg.size > 1) {
    console.error(`    by package: ${[...byPkg].map(([p, n]) => `${p} ${n}`).join(', ')}`);
  }
  for (const row of shown) console.error(`    ${row}`);
  if (rest > 0) console.error(`    … and ${rest} more`);
  console.error('');
}
console.error(
  'Slots are generated, never hand-written: fix this in the prism repo\n' +
    '(/Users/nickd/work/arclight/prism) and regenerate — do not edit the wrappers.',
);
process.exit(1);
