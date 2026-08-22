#!/usr/bin/env node
/**
 * Generates packages/web-components/src/dev-schema.js from
 * custom-elements.json — a compact attribute schema consumed by the opt-in
 * dev-warnings module (import '@arclux/arc-ui/dev').
 *
 * Per tag: the list of known attributes, the allowed values for attributes
 * whose type is a union of string literals, the value an unrecognised one
 * falls back to, the docs slug, and — for a component being merged away — the
 * tag that replaces it.
 *
 * The fallback is the half that was missing. `oneOf()` coerces an unknown value
 * to the declared default rather than ignoring it, so `variant="danger"` on a
 * v4 alert is not an inert attribute — it renders as `info`, which is why a
 * consumer's four failure alerts read as neutral notices for months without
 * anyone noticing. Naming the destination turns "that value is wrong" into
 * "this is what you are looking at", and puts the coercion where a codemod can
 * read it.
 *
 * (Called automatically by `pnpm generate`, after generate-manifest.js)
 */
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const wcDir = resolve(__dirname, '../../packages/web-components');
const manifest = JSON.parse(readFileSync(resolve(wcDir, 'custom-elements.json'), 'utf-8'));

// tag → docs slug (sub-components resolve to their parent's page)
const docsDataDir = resolve(__dirname, '../../docs/src/data/components');
const slugByTag = new Map();
for (const file of readdirSync(docsDataDir)) {
  if (!file.endsWith('.ts') || file === '_types.ts' || file === 'index.ts') continue;
  const mod = await import(pathToFileURL(resolve(docsDataDir, file)).href);
  const def = Object.values(mod)[0];
  if (!def?.tag) continue;
  if (!slugByTag.has(def.tag)) slugByTag.set(def.tag, def.slug);
  for (const sub of def.subComponents ?? []) {
    if (!slugByTag.has(sub.tag)) slugByTag.set(sub.tag, def.slug);
  }
}

/** 'primary' | 'secondary' → ['primary','secondary']; null if not a literal union. */
function literalUnion(typeText) {
  if (!typeText || !typeText.includes("'")) return null;
  const parts = typeText.split('|').map((p) => p.trim());
  const values = [];
  for (const p of parts) {
    const m = p.match(/^'([^']*)'$/);
    if (!m) return null;
    values.push(m[1]);
  }
  return values.length > 1 ? values : null;
}

const schema = {};
for (const mod of manifest.modules) {
  for (const decl of mod.declarations ?? []) {
    if (!decl.customElement || !decl.tagName) continue;
    const attrs = (decl.attributes ?? []).map((a) => a.name);
    const enums = {};
    const fallbacks = {};
    for (const a of decl.attributes ?? []) {
      const values = literalUnion(a.type?.text);
      if (!values) continue;
      enums[a.name] = values;
      // The manifest carries the default as source text — "'info'". A computed
      // default (oneOf resolves those per element) has no single answer, so it
      // is left out rather than guessed at.
      const literal = /^'([^']*)'$/.exec(a.default ?? '');
      if (literal && values.includes(literal[1])) fallbacks[a.name] = literal[1];
    }
    schema[decl.tagName] = { attrs };
    if (Object.keys(enums).length) schema[decl.tagName].enums = enums;
    if (Object.keys(fallbacks).length) schema[decl.tagName].fallbacks = fallbacks;
    const slug = slugByTag.get(decl.tagName);
    if (slug) schema[decl.tagName].slug = slug;
    // A deprecated component keeps working and stays in the barrel for the
    // whole major — which is exactly why nothing else tells a consumer it is
    // deprecated. Their build does not break, their tests pass, and the first
    // signal would be the v5 release notes. Carrying the survivor here is what
    // lets `@arclux/arc-ui/dev` say so at the point of use.
    if (decl.status === 'deprecated') schema[decl.tagName].mergedInto = decl.mergedInto;
  }
}

const out = `// Generated from custom-elements.json by scripts/generate-dev-schema.js — do not edit
export default ${JSON.stringify(schema, null, 1)};
`;
writeFileSync(resolve(wcDir, 'src/dev-schema.js'), out);
const enumCount = Object.values(schema).filter((s) => s.enums).length;
const deprecated = Object.values(schema).filter((s) => s.mergedInto).length;
console.log(
  `✓ src/dev-schema.js — ${Object.keys(schema).length} tags, ${enumCount} with enums` +
    (deprecated ? `, ${deprecated} deprecated` : ''),
);
