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
  /**
   * Instance methods, on the same terms the docs Methods table uses: no
   * statics (they are not reachable through an element reference), no
   * `*Callback` (the browser calls those, not the consumer).
   *
   * Absent until now, so every imperative API in the library was invisible to
   * TypeScript: `ArcToast` declared five props and none of `show`, `dismiss`,
   * `clear`, `updateToast`, `complete`. That is what every `(ref.current as
   * any).show(…)` in the docs and the READMEs is working around — the cast is
   * not a style choice, it is the only way to call a method this file never
   * declared.
   */
  const methods = (el.members ?? []).filter(
    (m) =>
      m.kind === 'method' &&
      m.privacy !== 'private' &&
      m.privacy !== 'protected' &&
      !m.static &&
      !/Callback$/.test(m.name ?? '')
  );

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
  for (const m of methods) {
    if (m.description) lines.push(`  /** ${m.description.replace(/\s+/g, ' ')} */`);
    // An undocumented parameter is `unknown`, not `any`: a call with the wrong
    // argument should fail here rather than at runtime, and `unknown` is what
    // the field mapping above already resolves an unknown type to.
    const params = (m.parameters ?? [])
      .map((p) => `${p.name}${p.optional ? '?' : ''}: ${p.type?.text ?? 'unknown'}`)
      .join(', ');
    lines.push(`  ${m.name}(${params}): ${m.return.type.text};`);
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
/**
 * Every published method must declare its return type.
 *
 * The first version of this defaulted a missing `@returns` to `void`, which is
 * a claim the generator is in no position to make: the analyzer infers nothing
 * from a plain-JS body, so "no `@returns`" means "nobody wrote one", not "it
 * returns nothing". Four methods shipped into index.d.ts as `void` that way —
 * `getCrop()`, `getCroppedBlob()`, `getCroppedDataUrl()`, `toDataURL()` — three
 * of them `async`, so the declared type was not merely imprecise but the wrong
 * kind of thing. It broke the docs' own examples: `const blob = await
 * ref.getCroppedBlob()` typed `blob` as `void`, and the `FormData.append` on
 * the next line stopped compiling.
 *
 * Failing here rather than guessing makes `void` something an author wrote.
 * The 21 command methods that really do return nothing say `@returns {void}`,
 * which is a sentence, and the next value-returning method added without one
 * stops the build instead of publishing a lie.
 */
const undeclared = elements.flatMap((el) =>
  (el.members ?? [])
    .filter(
      (m) =>
        m.kind === 'method' &&
        m.privacy !== 'private' &&
        m.privacy !== 'protected' &&
        !m.static &&
        !/Callback$/.test(m.name ?? '') &&
        !m.return?.type?.text
    )
    .map((m) => `${el.tagName}.${m.name}()`)
);
if (undeclared.length) {
  console.error(
    `generate-types: ${undeclared.length} method(s) with no @returns — add one ` +
      `(use {void} if it returns nothing):\n  ${undeclared.join('\n  ')}`
  );
  process.exit(1);
}

const methodCount = elements
  .flatMap((el) => el.members ?? [])
  .filter(
    (m) =>
      m.kind === 'method' &&
      m.privacy !== 'private' &&
      m.privacy !== 'protected' &&
      !m.static &&
      !/Callback$/.test(m.name ?? '')
  ).length;
console.log(
  `✓ types/index.d.ts — ${elements.length} classes, ${methodCount} methods + HTMLElementTagNameMap`
);

// The three `types/<framework>-jsx.d.ts` files used to be generated here too.
// prism 3.0 emits them from `config.jsxTypes`, which is the right side of the
// line: they are per-framework JSX augmentations derived from the component
// catalog, and that is prism's whole remit. What lived here additionally had
// to hand-maintain a per-framework base attribute set — Solid's `on:` and
// `prop:` namespaces, Preact's `class`, React 19's `className` — which prism
// now knows about, and it emits both attribute spellings where they differ
// (`confirmlabel` and `confirmLabel`), which this did not.
//
// `scripts/checks/jsx-augmentations.js` stays and now guards prism's output.
// It compiles the documented activation instruction in each emitted header
// against that framework's own resolution rather than asserting the file's
// contents, which is the only thing that catches an instruction that resolves
// to nothing — the failure react-jsx.d.ts shipped with for a release, and the
// failure prism's own default `wcPackage` guess reintroduced here on the first
// run (`@arc/arc-ui`, a package that does not exist). See prism.config.js.
