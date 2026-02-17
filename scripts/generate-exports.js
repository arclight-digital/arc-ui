/**
 * generate-exports.js
 *
 * Syncs the `exports` field in packages/web-components/package.json
 * from the actual .register.js files on disk.
 *
 * Run via: pnpm run generate:exports
 * Called automatically as part of: pnpm generate
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pkgPath = path.join(__dirname, '..', 'packages', 'web-components', 'package.json');
const srcDir = path.join(__dirname, '..', 'packages', 'web-components', 'src');

const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
const existing = pkg.exports;

// Collect all .register.js files
function findRegisterFiles(dir) {
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...findRegisterFiles(full));
    } else if (entry.name.endsWith('.register.js')) {
      results.push(full);
    }
  }
  return results;
}

const registerFiles = findRegisterFiles(srcDir);
let added = 0;

for (const file of registerFiles) {
  const rel = './' + path.relative(path.dirname(pkgPath), file).replace(/\\/g, '/');
  const name = path.basename(file, '.register.js');
  const key = `./${name}`;

  if (!existing[key]) {
    existing[key] = rel;
    added++;
  }
}

// Sort exports: "." first, "./register" second, then alphabetical component keys,
// then category barrels and special entries at the end
const specialFirst = ['.', './register'];
const specialLast = [
  './content', './data', './typography', './input', './feedback',
  './navigation', './layout', './shared',
];

const sorted = {};

// First: . and ./register
for (const k of specialFirst) {
  if (existing[k]) sorted[k] = existing[k];
}

// Middle: component entries (sorted alphabetically), excluding special
const componentKeys = Object.keys(existing)
  .filter(k => !specialFirst.includes(k) && !specialLast.includes(k) && !k.startsWith('./themes/') && !k.startsWith('./icons/') && k !== './tokens' && k !== './base.css')
  .sort();

for (const k of componentKeys) {
  sorted[k] = existing[k];
}

// Last: category barrels, themes, icons, tokens, base.css
for (const k of specialLast) {
  if (existing[k]) sorted[k] = existing[k];
}
for (const k of Object.keys(existing).filter(k => k.startsWith('./themes/')).sort()) {
  sorted[k] = existing[k];
}
if (existing['./tokens']) sorted['./tokens'] = existing['./tokens'];
if (existing['./base.css']) sorted['./base.css'] = existing['./base.css'];
for (const k of Object.keys(existing).filter(k => k.startsWith('./icons/')).sort()) {
  sorted[k] = existing[k];
}

pkg.exports = sorted;
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');

if (added > 0) {
  console.log(`generate-exports: added ${added} missing export(s) to web-components package.json`);
} else {
  console.log('generate-exports: all exports up to date');
}
