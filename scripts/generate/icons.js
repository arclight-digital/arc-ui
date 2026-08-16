#!/usr/bin/env node
/**
 * Generates vendored icon modules from upstream libraries.
 * Run: node scripts/generate/icons.js
 *
 * Outputs per library (phosphor, lucide), all under packages/icons/src:
 *   {lib}.js             — monolithic re-export (full library opt-in)
 *   {lib}.d.ts           — type declarations for monolithic
 *   {lib}/{name}.js      — per-icon module (~500 bytes each)
 *   {lib}/_resolver.js   — name → () => import('./{name}.js'), what {lib}.register.js registers
 *   {lib}/_manifest.js   — array of all icon names
 *   {lib}/_manifest.d.ts
 *   types.d.ts           — combined IconName type
 *
 * These lived in packages/web-components/src/icons until v4. They were 88% of
 * the core package's published files and 44% of its unpacked bytes, in every
 * install, whether or not an icon was ever rendered — and the resolver put 3,408
 * static import specifiers into every consumer's bundle graph by default. 4.7
 * moved them to @arclux/arc-ui-icons, where a consumer opts in with one import.
 * The two hand-written {lib}.register.js modules there are the seam; everything
 * this script writes is downstream of them.
 *
 * Also writes packages/icons/LICENSE — see attribution() at the bottom. That is
 * generated rather than typed for the same reason everything else here is: it
 * has to be a *copy* of what the installed upstream says, and an upstream that
 * changes its terms should show up as a diff on the next run rather than as a
 * notice that quietly stopped being true.
 */
import { createRequire } from 'node:module';
import { writeFileSync, mkdirSync, readFileSync, readdirSync } from 'node:fs';
import { resolve, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = resolve(__dirname, '../../packages/icons/src');
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

  // Upstream ships casing aliases (ArrowDownAZ / ArrowDownAz, Axis3D / Axis3d)
  // that toKebab collapses onto one name. Emitting both produced duplicate
  // `export const` declarations, which is a hard SyntaxError — the whole module
  // failed to import. Bodies are identical, so keeping the first is lossless.
  const seen = new Map();
  const collisions = [];
  for (const entry of entries) {
    const [iconName, svg] = entry;
    if (!seen.has(iconName)) {
      seen.set(iconName, entry);
    } else if (seen.get(iconName)[1] !== svg) {
      collisions.push(iconName);
    }
  }
  if (collisions.length) {
    throw new Error(
      `generate-icons: ${label} has name collisions with differing SVG bodies, so one would be ` +
        `silently lost: ${collisions.join(', ')}. Disambiguate toKebab before continuing.`,
    );
  }
  const dropped = entries.length - seen.size;
  entries = [...seen.values()];
  if (dropped > 0) {
    console.log(`  ${label}: collapsed ${dropped} casing alias(es) onto existing names`);
  }

  const names = entries.map(([n]) => n);

  // --- Per-icon files ---
  const perIconDir = resolve(outDir, name);
  mkdirSync(perIconDir, { recursive: true });

  for (const [iconName, svg] of entries) {
    const escaped = svg.replace(/'/g, "\\'");
    const perIconSource = `// Auto-generated — do not edit manually.\nexport default '${escaped}';\n`;
    writeFileSync(resolve(perIconDir, `${iconName}.js`), perIconSource);
  }

  // --- Resolver (static import() per icon — Vite/Rollup can analyze these) ---
  const resolverEntries = entries.map(([iconName]) =>
    `  '${iconName}': () => import('./${iconName}.js')`
  );
  const resolverSource = [
    `// Auto-generated — do not edit manually.`,
    `// Each entry is a static import path so bundlers can create chunks per icon.`,
    `export default {`,
    resolverEntries.join(',\n'),
    `};`,
    ``,
  ].join('\n');
  writeFileSync(resolve(perIconDir, '_resolver.js'), resolverSource);

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
    `// Run: node scripts/generate/icons.js`,
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
  '../../node_modules/@phosphor-icons/core/assets/regular',
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

/* ── Attribution ───────────────────────────────────────────────────────────
 *
 * Both icon sets are permissively licensed and both licences say the same thing
 * about it: Phosphor is MIT — "shall be included in all copies or substantial
 * portions of the Software" — and Lucide is ISC — "provided that the above
 * copyright notice and this permission notice appear in all copies". 3,408
 * vendored glyphs are a substantial portion by any reading, so the notices have
 * to travel with them.
 *
 * They did not. The packs shipped inside @arclux/arc-ui from v1.9.0 with only
 * ARC's own MIT beside them, which is a compliance gap rather than a licensing
 * problem — nothing here was ever disallowed, the required notices were simply
 * missing. 4.7 is the moment to close it, because the packs become a published
 * package of their own with its own LICENSE.
 *
 * Read from the installed packages rather than pasted, so the file is a copy of
 * what is actually being redistributed. If Lucide relicenses, or Phosphor's
 * copyright line moves a year, the next `pnpm generate` shows it as a diff.
 */
/**
 * Through node_modules rather than `require.resolve`, which both of these
 * refuse: their export maps do not publish `./package.json`, and
 * @phosphor-icons/core is assets with no entry point at all. The Phosphor SVGs
 * above are read the same way for the same reason.
 */
function upstreamDir(pkg) {
  return resolve(__dirname, '../../node_modules', pkg);
}

function upstreamLicense(pkg) {
  const dir = upstreamDir(pkg);
  for (const name of ['LICENSE', 'LICENSE.md', 'LICENCE', 'license']) {
    try {
      return readFileSync(resolve(dir, name), 'utf-8').trim();
    } catch {
      /* next candidate */
    }
  }
  throw new Error(
    `generate-icons: no LICENSE found in ${pkg}. The icon modules cannot be ` +
      `published without the notice their licence requires — find where it moved ` +
      `to before regenerating.`,
  );
}

const upstreamVersion = (pkg) =>
  JSON.parse(readFileSync(resolve(upstreamDir(pkg), 'package.json'), 'utf-8')).version;

const licenseText = [
  readFileSync(resolve(__dirname, '../../LICENSE'), 'utf-8').trim(),
  '',
  '',
  '───────────────────────────────────────────────────────────────────────────',
  '',
  'THIRD-PARTY NOTICES',
  '',
  'The icon modules in this package are generated from the two sets below and',
  'are redistributed under their original licences. Only the packaging is ARC',
  "UI's; the artwork is not. Each glyph is reproduced unchanged apart from the",
  'removal of fixed width/height and class attributes so it can inherit size',
  'and colour from its host.',
  '',
  '',
  `Phosphor Icons — https://phosphoricons.com (@phosphor-icons/core ${upstreamVersion('@phosphor-icons/core')})`,
  '',
  upstreamLicense('@phosphor-icons/core'),
  '',
  '',
  `Lucide — https://lucide.dev (lucide-static ${upstreamVersion('lucide-static')})`,
  '',
  upstreamLicense('lucide-static'),
  '',
].join('\n');

writeFileSync(resolve(outDir, '..', 'LICENSE'), licenseText);
console.log('  LICENSE: ARC UI MIT + Phosphor (MIT) + Lucide (ISC) notices');

console.log('Done.');
