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
    if (f.default !== undefined) lines.push(`  /** @default ${f.default} */`);
    lines.push(`  ${f.name}: ${tsType(f)};`);
  }
  lines.push('}');
  lines.push('');
}

lines.push('declare global {');
lines.push('  interface HTMLElementTagNameMap {');
for (const el of elements) {
  lines.push(`    '${el.tagName}': ${el.name};`);
}
lines.push('  }');
lines.push('}');
lines.push('');

mkdirSync(resolve(wcDir, 'types'), { recursive: true });
writeFileSync(resolve(wcDir, 'types/index.d.ts'), lines.join('\n'));
console.log(`✓ types/index.d.ts — ${elements.length} classes + HTMLElementTagNameMap`);
