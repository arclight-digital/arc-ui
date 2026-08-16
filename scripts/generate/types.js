#!/usr/bin/env node
/**
 * Generates packages/web-components/types/index.d.ts from custom-elements.json.
 * Replaces the previous hand-maintained declaration file so types can never
 * drift from component source.
 *
 * (Called automatically by `pnpm generate`, after generate-manifest.js)
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const wcDir = resolve(__dirname, '../../packages/web-components');
const manifest = JSON.parse(readFileSync(resolve(wcDir, 'custom-elements.json'), 'utf-8'));

/** Map a CEM type text to a TypeScript type. */
function tsType(member) {
  const text = member.type?.text;
  switch (text) {
    case 'string':
    case 'boolean':
    case 'number':
      return text;
    case 'array':
      return 'unknown[]';
    case 'object':
      return 'Record<string, unknown>';
    default:
      return text || 'unknown';
  }
}

const elements = manifest.modules
  .flatMap((m) => m.declarations ?? [])
  .filter((d) => d.customElement && d.tagName)
  .sort((a, b) => a.tagName.localeCompare(b.tagName));

const lines = [
  '// Generated from custom-elements.json by scripts/generate-types.js — do not edit',
  "import { LitElement } from 'lit';",
  '',
];

for (const el of elements) {
  const fields = (el.members ?? []).filter(
    (m) => m.kind === 'field' && m.privacy !== 'private' && m.privacy !== 'protected'
  );
  const events = (el.events ?? []).map((e) => e.name).filter(Boolean);

  lines.push('/**');
  lines.push(` * \`<${el.tagName}>\``);
  if (events.length) lines.push(` * Events: ${events.join(', ')}`);
  lines.push(' */');
  lines.push(`export declare class ${el.name} extends LitElement {`);
  for (const f of fields) {
    const doc = [];
    if (f.description) doc.push(f.description.replace(/\s+/g, ' '));
    if (f.default !== undefined) doc.push(`@default ${f.default}`);
    if (doc.length) lines.push(`  /** ${doc.join(' ')} */`);
    lines.push(`  ${f.name}: ${tsType(f)};`);
  }
  lines.push('}');
  lines.push('');
}

// Custom event map, deduped across components, so addEventListener('arc-…')
// autocompletes with a typed detail. When several components fire the same
// event name, the entry is the union of their detail types; any untyped
// dispatch widens the entry to plain CustomEvent.
const eventTypes = new Map();
for (const el of elements) {
  for (const e of el.events ?? []) {
    if (!e.name?.startsWith('arc-')) continue;
    const t = e.type?.text?.startsWith('CustomEvent<') ? e.type.text : 'CustomEvent';
    if (!eventTypes.has(e.name)) eventTypes.set(e.name, new Set());
    eventTypes.get(e.name).add(t);
  }
}
const eventEntries = [...eventTypes.entries()]
  .map(([name, types]) => [name, types.has('CustomEvent') ? 'CustomEvent' : [...types].sort().join(' | ')])
  .sort((a, b) => a[0].localeCompare(b[0]));

lines.push('declare global {');
lines.push('  interface HTMLElementTagNameMap {');
for (const el of elements) {
  lines.push(`    '${el.tagName}': ${el.name};`);
}
lines.push('  }');
lines.push('  interface GlobalEventHandlersEventMap {');
for (const [name, type] of eventEntries) {
  lines.push(`    '${name}': ${type};`);
}
lines.push('  }');
lines.push('}');
lines.push('');

mkdirSync(resolve(wcDir, 'types'), { recursive: true });
writeFileSync(resolve(wcDir, 'types/index.d.ts'), lines.join('\n'));
console.log(`✓ types/index.d.ts — ${elements.length} classes + HTMLElementTagNameMap`);

// ---------------------------------------------------------------------------
// types/<framework>-jsx.d.ts — opt-in JSX typings for consumers who render the
// custom elements directly instead of using a wrapper package.
//
// These sit *beside* the wrapper packages rather than replacing them. React has
// shipped both for a release — @arclux/arc-ui-react for `<Input>`, react-jsx
// for `<arc-input>` — and 4.6 gives Preact and Solid the same pair. A consumer
// picking the native path is not a consumer we are trying to move off wrappers;
// they are one who already decided, and until now only the React one was served.
//
// The base attribute set is per-framework on purpose. Writing React's shape
// three times would type `className` for Solid, which does nothing, and would
// miss `on:` — Solid's namespaced event directive and the only way to reach a
// custom event like `arc-change` from JSX without a ref.
// ---------------------------------------------------------------------------

/** Attribute-level TS type: unions pass through, primitives map, rest is string. */
function attrType(a) {
  const text = a.type?.text;
  if (!text) return 'string';
  if (text.includes("'")) return text; // literal union
  if (text === 'boolean') return 'boolean';
  if (text === 'number') return 'number | string';
  return 'string';
}

/* Shared across all three: an attribute is a string in markup whichever
   framework is rendering it, and every framework passes data-* and aria-*
   through untouched. */
const OPEN_ATTRS =
  '} & { [attr: `data-${string}`]: unknown } & { [attr: `aria-${string}`]: unknown } & {';

const JSX_TARGETS = [
  {
    file: 'react-jsx.d.ts',
    module: 'react',
    label: 'React 19',
    subpath: '@arclux/arc-ui/react-jsx',
    /* Unchanged from what shipped in v3: React accepts `class` on a custom
       element and `className` on everything, and both are spelled here because
       consumers write both. */
    base: [
      '  children?: unknown;',
      '  key?: string | number | null;',
      '  ref?: unknown;',
      '  class?: string;',
      '  className?: string;',
      '  style?: unknown;',
      '  id?: string;',
      '  slot?: string;',
      '  part?: string;',
      '  hidden?: boolean;',
      '  title?: string;',
      '  role?: string;',
      '  tabIndex?: number;',
      OPEN_ATTRS,
      '  [attr: `on${string}`]: unknown;',
    ],
  },
  {
    file: 'preact-jsx.d.ts',
    module: 'preact',
    label: 'Preact 10',
    subpath: '@arclux/arc-ui/preact-jsx',
    /* Preact sets a DOM property when one exists and falls back to an
       attribute, so both spellings of the class and tabindex attributes are
       real. `on${string}` is deliberately loose: Preact lowercases the part
       after `on`, so a dashed custom event name is not reachable from a plain
       `on*` prop at all — @arclux/arc-ui-preact exists because that mapping
       needs a listener, and a consumer on this path writes the ref themselves.
       Typing it narrowly here would promise something the framework cannot do. */
    base: [
      '  children?: unknown;',
      '  key?: string | number | null;',
      '  ref?: unknown;',
      '  class?: string;',
      '  className?: string;',
      '  style?: unknown;',
      '  id?: string;',
      '  slot?: string;',
      '  part?: string;',
      '  hidden?: boolean;',
      '  title?: string;',
      '  role?: string;',
      '  tabIndex?: number;',
      '  tabindex?: number;',
      '  dangerouslySetInnerHTML?: { __html: string };',
      OPEN_ATTRS,
      '  [attr: `on${string}`]: unknown;',
    ],
  },
  {
    file: 'solid-jsx.d.ts',
    /* `solid-js/jsx-runtime`, not `solid-js`. Under the standard Solid setup —
       `jsxImportSource: "solid-js"` — TypeScript resolves JSX.IntrinsicElements
       through the jsx-runtime entry, which re-exports the namespace from
       solid-js/types/jsx. An augmentation of the *main* entry adds a second,
       unrelated JSX namespace and does nothing at all, with no diagnostic.
       Verified both ways by scripts/checks/jsx-augmentations.js.

       Worth knowing while reading a generated Solid wrapper: prism emits the
       `declare module 'solid-js'` form into all 201 of them, so those blocks
       are inert too. Recorded in prism-feedback.md. */
    module: 'solid-js/jsx-runtime',
    label: 'Solid 1',
    subpath: '@arclux/arc-ui/solid-jsx',
    /* Solid is the one whose base set carries real information. `on:` binds a
       listener by exact event name, which is how `arc-change` is reached from
       JSX with no ref; `prop:` forces a DOM property rather than an attribute,
       which is how an array or object prop is passed to a component that
       declares one; `attr:` forces the other direction. Those three are the
       whole reason a Solid consumer can take the native path comfortably, and
       none of them exists in React or Preact. `classList` is Solid's own. */
    base: [
      '  children?: unknown;',
      '  ref?: unknown;',
      '  class?: string;',
      '  classList?: Record<string, boolean | undefined>;',
      '  style?: unknown;',
      '  id?: string;',
      '  slot?: string;',
      '  part?: string;',
      '  hidden?: boolean;',
      '  title?: string;',
      '  role?: string;',
      '  tabindex?: number | string;',
      OPEN_ATTRS,
      '  [directive: `on:${string}`]: unknown;',
      '  [directive: `oncapture:${string}`]: unknown;',
      '  [directive: `prop:${string}`]: unknown;',
      '  [directive: `attr:${string}`]: unknown;',
      '  [directive: `use:${string}`]: unknown;',
      '  [attr: `on${string}`]: unknown;',
    ],
  },
];

for (const target of JSX_TARGETS) {
  const wrapperPkg = target.module.startsWith('solid-js') ? 'solid' : target.module;
  const jsx = [
    '// Generated from custom-elements.json by scripts/generate/types.js — do not edit',
    `// Opt-in JSX typings for using ARC UI custom elements directly in ${target.label}`,
    `// (no wrapper — @arclux/arc-ui-${wrapperPkg} is the wrapper path, and both are supported).`,
    '//',
    '// Add this file to your program. Either in tsconfig:',
    '//',
    '//   { "include": ["src", "node_modules/@arclux/arc-ui/types/' + target.file + '"] }',
    '//',
    '// or from one file in the project:',
    '//',
    `//   /// <reference path="./node_modules/@arclux/arc-ui/types/${target.file}" />`,
    '//',
    `// NOT \`{ "types": ["${target.subpath}"] }\` and NOT`,
    `// \`/// <reference types="${target.subpath}" />\`. Both look right and both`,
    '// silently do nothing: TypeScript resolves a `types` entry as a *package*',
    '// — node_modules/@types/<name>, or <name>/package.json#types — and never',
    '// follows an export-map subpath. Nothing resolves, nothing is included, and',
    '// every tag stays untyped with no diagnostic. react-jsx.d.ts documented',
    '// exactly that for a release; scripts/checks/jsx-augmentations.js now',
    '// compiles this instruction rather than asserting it.',
    '',
    'export {};',
    '',
    'type ArcBaseAttributes = {',
    ...target.base,
    '};',
    '',
    `declare module '${target.module}' {`,
    '  namespace JSX {',
    '    interface IntrinsicElements {',
  ];

  for (const el of elements) {
    const attrs = (el.attributes ?? []).filter((a) => a.name && !a.name.startsWith('_'));
    if (!attrs.length) {
      jsx.push(`      '${el.tagName}': ArcBaseAttributes;`);
      continue;
    }
    jsx.push(`      '${el.tagName}': ArcBaseAttributes & {`);
    for (const a of attrs) {
      const key = a.name.includes('-') ? `'${a.name}'` : a.name;
      jsx.push(`        ${key}?: ${attrType(a)};`);
    }
    jsx.push('      };');
  }

  jsx.push('    }');
  jsx.push('  }');
  jsx.push('}');
  jsx.push('');

  writeFileSync(resolve(wcDir, 'types', target.file), jsx.join('\n'));
  console.log(`✓ types/${target.file} — IntrinsicElements for ${elements.length} tags`);
}
