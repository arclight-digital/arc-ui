#!/usr/bin/env node
/**
 * Generates per-component .register.js files and a top-level register.js
 * from @tag / @requires JSDoc annotations in component source files.
 *
 * Run: node scripts/generate-registrations.js
 * (Called automatically by `pnpm generate`)
 */
import { writeFileSync, readdirSync, rmSync } from 'node:fs';
import { resolve } from 'node:path';
import { findComponents, SRC_DIR, TIERS } from './lib/component-tags.js';

const srcDir = SRC_DIR;

// ── 1. Clean up old .register.js files ──────────────────────────────────────

for (const tier of TIERS) {
  const tierDir = resolve(srcDir, tier);
  for (const file of readdirSync(tierDir)) {
    if (file.endsWith('.register.js')) {
      rmSync(resolve(tierDir, file));
    }
  }
}

// Also clean top-level register.js
try { rmSync(resolve(srcDir, 'register.js')); } catch {}

// ── 2. Parse all component files ────────────────────────────────────────────

const components = findComponents();

// ── 3. Generate per-component .register.js ──────────────────────────────────

let generated = 0;

for (const [tag, comp] of components) {
  const tierDir = resolve(srcDir, comp.tier);
  const stem = comp.file.replace(/\.js$/, '');
  const registerPath = resolve(tierDir, `${stem}.register.js`);

  const lines = ['// Generated — do not edit'];

  // Import the class from the source file
  lines.push(`import { ${comp.className} } from './${comp.file}';`);

  // Import .register.js for each required child
  for (const req of comp.requires) {
    const child = components.get(req);
    if (!child) {
      console.warn(`  WARN: ${tag} @requires ${req} but no component found for it`);
      continue;
    }
    const childStem = child.file.replace(/\.js$/, '');
    if (child.tier === comp.tier) {
      // Same tier — relative import
      lines.push(`import './${childStem}.register.js';`);
    } else {
      // Different tier — relative path from this tier to child's tier
      lines.push(`import '../${child.tier}/${childStem}.register.js';`);
    }
  }

  // Define the custom element (guarded so mixed barrel/per-component imports and HMR don't double-define)
  lines.push(`if (!customElements.get('${tag}')) customElements.define('${tag}', ${comp.className});`);
  lines.push(`export { ${comp.className} };`);
  lines.push('');

  writeFileSync(registerPath, lines.join('\n'));
  generated++;
}

// ── 4. Generate top-level src/register.js ───────────────────────────────────

const registerAllLines = ['// Generated — do not edit'];
for (const tier of TIERS) {
  const tierComponents = [...components.values()]
    .filter(c => c.tier === tier)
    .sort((a, b) => a.file.localeCompare(b.file));

  for (const comp of tierComponents) {
    const stem = comp.file.replace(/\.js$/, '');
    registerAllLines.push(`import './${tier}/${stem}.register.js';`);
  }
}
registerAllLines.push('');

writeFileSync(resolve(srcDir, 'register.js'), registerAllLines.join('\n'));

console.log(`✓ ${generated} .register.js files + src/register.js generated`);
