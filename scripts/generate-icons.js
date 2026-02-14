#!/usr/bin/env node
/**
 * Generates vendored icon modules from upstream libraries.
 * Run: node scripts/generate-icons.js
 *
 * Outputs per library (phosphor, lucide):
 *   packages/web-components/src/icons/{lib}.js          — monolithic re-export (full library opt-in)
 *   packages/web-components/src/icons/{lib}.d.ts        — type declarations for monolithic
 *   packages/web-components/src/icons/{lib}/{name}.js   — per-icon module (~500 bytes each)
 *   packages/web-components/src/icons/{lib}/_manifest.js — array of all icon names
 *   packages/web-components/src/icons/{lib}/_manifest.d.ts
 *   packages/web-components/src/icons/types.d.ts        — combined IconName type
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

function toPascal(kebab) {
  return kebab.replace(/(^|-)([a-z0-9])/g, (_, _sep, ch) => ch.toUpperCase());
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

  // --- Per-icon files ---
  const perIconDir = resolve(outDir, name);
  mkdirSync(perIconDir, { recursive: true });

  for (const [iconName, svg] of entries) {
    const escaped = svg.replace(/'/g, "\\'");
    const perIconSource = `// Auto-generated — do not edit manually.\nexport default '${escaped}';\n`;
    writeFileSync(resolve(perIconDir, `${iconName}.js`), perIconSource);
  }

  // --- Manifest (array of all names) ---
  const manifestSource = [
    `// Auto-generated — do not edit manually.`,
    `export default ${JSON.stringify(names)};`,
    ``,
  ].join('\n');
  writeFileSync(resolve(perIconDir, '_manifest.js'), manifestSource);

  const manifestDts = [
    `// Auto-generated — do not edit manually.`,
    `declare const names: string[];`,
    `export default names;`,
    ``,
  ].join('\n');
  writeFileSync(resolve(perIconDir, '_manifest.d.ts'), manifestDts);

  // --- Monolithic JS module (full library opt-in) ---
  const namedExports = entries.map(([n, svg]) => {
    const pascal = toPascal(n);
    return `export const ${pascal} = '${svg.replace(/'/g, "\\'")}';`;
  });
  const defaultEntries = entries.map(([n]) => {
    const pascal = toPascal(n);
    return `  '${n}': ${pascal}`;
  });
  const source = [
    `// Auto-generated from ${label} — do not edit manually.`,
    `// Run: node scripts/generate-icons.js`,
    ``,
    ...namedExports,
    ``,
    `const icons = {`,
    defaultEntries.join(',\n'),
    `};`,
    `export default icons;`,
    ``,
  ].join('\n');
  writeFileSync(resolve(outDir, `${name}.js`), source);

  // --- Type declaration for monolithic ---
  const typeName = name.charAt(0).toUpperCase() + name.slice(1) + 'IconName';
  const unionMembers = names.map((n) => `  | '${n}'`).join('\n');
  const namedExportTypes = entries
    .map(([n]) => `export declare const ${toPascal(n)}: string;`)
    .join('\n');
  const dts = [
    `// Auto-generated — do not edit manually.`,
    `export type ${typeName} =`,
    `${unionMembers};`,
    ``,
    namedExportTypes,
    ``,
    `declare const icons: Record<${typeName}, string>;`,
    `export default icons;`,
    ``,
  ].join('\n');
  writeFileSync(resolve(outDir, `${name}.d.ts`), dts);

  console.log(`  ${name}: ${entries.length} icons (${entries.length} per-icon files + manifest)`);
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
