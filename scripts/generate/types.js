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
const wcDir = resolve(__dirname, '../packages/web-components');
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
// types/react-jsx.d.ts — opt-in JSX typings for React 19 users who render the
// custom elements directly instead of using @arclux/arc-ui-react.
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

const jsx = [
  '// Generated from custom-elements.json by scripts/generate-types.js — do not edit',
  '// Opt-in JSX typings for using ARC UI custom elements directly in React 19',
  '// (no wrapper). Enable via tsconfig:',
  '//   { "compilerOptions": { "types": ["@arclux/arc-ui/react-jsx"] } }',
  '// or per file:',
  '//   /// <reference types="@arclux/arc-ui/react-jsx" />',
  '',
  'export {};',
  '',
  'type ArcBaseAttributes = {',
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
  '} & { [attr: `data-${string}`]: unknown } & { [attr: `aria-${string}`]: unknown } & {',
  '  [attr: `on${string}`]: unknown;',
  '};',
  '',
  "declare module 'react' {",
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

writeFileSync(resolve(wcDir, 'types/react-jsx.d.ts'), jsx.join('\n'));
console.log(`✓ types/react-jsx.d.ts — IntrinsicElements for ${elements.length} tags`);
