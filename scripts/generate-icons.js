#!/usr/bin/env node
/**
 * Generates vendored icon modules from upstream libraries.
 * Run: node scripts/generate-icons.js
 *
 * Outputs:
 *   packages/web-components/src/icons/lucide.js    (~1,900 icons)
 *   packages/web-components/src/icons/phosphor.js   (~1,500 icons)
 *   packages/web-components/src/icons/lucide.d.ts   (type declarations)
 *   packages/web-components/src/icons/phosphor.d.ts  (type declarations)
 *   packages/web-components/src/icons/types.d.ts     (combined IconName type)
 */
import { createRequire } from 'node:module';
import { writeFileSync, mkdirSync, readFileSync, readdirSync } from 'node:fs';
import { resolve, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = resolve(__dirname, '../packages/web-components/src/icons');
mkdirSync(outDir, { recursive: true });

function toKebab(str) {
  return str
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1-$2')
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .toLowerCase();
}

function cleanSvg(svg) {
  return svg
    .replace(/\s+width="\d+"/, '')
    .replace(/\s+height="\d+"/, '')
    .replace(/\s+class="[^"]*"/, '')
    .replace('<svg', '<svg width="100%" height="100%" ')
    .replace(/\n\s*/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

function writeIconModule(name, label, entries) {
  entries.sort(([a], [b]) => a.localeCompare(b));
  const names = entries.map(([n]) => n);

  // JS module
  const lines = entries.map(
    ([n, svg]) => `  '${n}': '${svg.replace(/'/g, "\\'")}'`,
  );
  const source = `// Auto-generated from ${label} — do not edit manually.\n// Run: node scripts/generate-icons.js\nconst icons = {\n${lines.join(',\n')}\n};\nexport default icons;\n`;
  writeFileSync(resolve(outDir, `${name}.js`), source);

  // Type declaration
  const typeName = name.charAt(0).toUpperCase() + name.slice(1) + 'IconName';
  const unionMembers = names.map((n) => `  | '${n}'`).join('\n');
  const dts = `// Auto-generated — do not edit manually.\nexport type ${typeName} =\n${unionMembers};\n\ndeclare const icons: Record<${typeName}, string>;\nexport default icons;\n`;
  writeFileSync(resolve(outDir, `${name}.d.ts`), dts);

  console.log(`  ${name}: ${entries.length} icons`);
  return { typeName, names };
}

// --- Lucide ---
console.log('Generating icon packs...');
const lucide = require('lucide-static');
const lucideEntries = Object.entries(lucide)
  .filter(([, val]) => typeof val === 'string' && val.trimStart().startsWith('<svg'))
  .map(([key, svg]) => [toKebab(key), cleanSvg(svg)]);
const lucideInfo = writeIconModule('lucide', 'lucide-static', lucideEntries);

// --- Phosphor (regular weight) ---
const phosphorDir = resolve(
  __dirname,
  '../node_modules/@phosphor-icons/core/assets/regular',
);
const phosphorEntries = readdirSync(phosphorDir)
  .filter((f) => f.endsWith('.svg'))
  .map((f) => {
    const name = basename(f, '.svg');
    const raw = readFileSync(resolve(phosphorDir, f), 'utf-8');
    return [name, cleanSvg(raw)];
  });
const phosphorInfo = writeIconModule('phosphor', '@phosphor-icons/core', phosphorEntries);

// --- Combined types ---
const combinedDts = `// Auto-generated — do not edit manually.
export type { ${phosphorInfo.typeName} } from './phosphor.js';
export type { ${lucideInfo.typeName} } from './lucide.js';

import type { ${phosphorInfo.typeName} } from './phosphor.js';
import type { ${lucideInfo.typeName} } from './lucide.js';

export type IconName = ${phosphorInfo.typeName} | ${lucideInfo.typeName};
`;
writeFileSync(resolve(outDir, 'types.d.ts'), combinedDts);

console.log('Done.');
