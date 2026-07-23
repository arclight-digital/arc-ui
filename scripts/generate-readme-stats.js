#!/usr/bin/env node

/**
 * generate-readme-stats.js — Sync README component counts from docs data
 *
 * The docs component catalog (docs/src/data/components/index.ts) is the
 * single source of truth for the marketing component count. This script
 * rewrites the README badge, intro sentence, and tier-table counts so they
 * can never drift from the catalog.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dataDir = path.join(root, 'docs/src/data/components');
const readmePath = path.join(root, 'README.md');

// Map import identifiers to their source files, then count only the
// components actually exported in the `components` array.
const indexSrc = fs.readFileSync(path.join(dataDir, 'index.ts'), 'utf8');

const importFiles = new Map();
for (const m of indexSrc.matchAll(/import\s*\{\s*(\w+)\s*\}\s*from\s*'\.\/([\w-]+)'/g)) {
  importFiles.set(m[1], m[2]);
}

const arrayMatch = indexSrc.match(/export const components[^=]*=\s*\[([\s\S]*?)\];/);
if (!arrayMatch) {
  console.error('generate-readme-stats: could not find components array in index.ts');
  process.exit(1);
}
const identifiers = arrayMatch[1].split(',').map((s) => s.trim()).filter(Boolean);

const tierCounts = {};
for (const id of identifiers) {
  const file = importFiles.get(id);
  if (!file) {
    console.error(`generate-readme-stats: no import found for '${id}'`);
    process.exit(1);
  }
  const src = fs.readFileSync(path.join(dataDir, `${file}.ts`), 'utf8');
  const tier = src.match(/tier:\s*'(\w+)'/)?.[1];
  if (!tier) {
    console.error(`generate-readme-stats: no tier found in ${file}.ts`);
    process.exit(1);
  }
  tierCounts[tier] = (tierCounts[tier] ?? 0) + 1;
}

const total = identifiers.length;
let readme = fs.readFileSync(readmePath, 'utf8');

readme = readme.replace(/components-\d+(?:%2B)?-/, `components-${total}-`);
readme = readme.replace(/^\d+\+? components organized across/m, `${total} components organized across`);
for (const [tier, count] of Object.entries(tierCounts)) {
  const label = tier.charAt(0).toUpperCase() + tier.slice(1);
  readme = readme.replace(new RegExp(`\\| \\*\\*${label}\\*\\* \\| \\d+ \\|`), `| **${label}** | ${count} |`);
}

fs.writeFileSync(readmePath, readme);
console.log(`README stats synced: ${total} components (${Object.entries(tierCounts).map(([t, c]) => `${t} ${c}`).join(', ')})`);
