#!/usr/bin/env node
/**
 * One-time migration: remove customElements.define() from component source files,
 * remove bare side-effect child imports, and add @tag / @requires JSDoc annotations.
 *
 * Run: node scripts/split-define.js
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { resolve, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const srcDir = resolve(__dirname, '../packages/web-components/src');

const TIERS = ['content', 'input', 'navigation', 'layout', 'feedback', 'shared'];

// Collect all component files
const componentFiles = [];
for (const tier of TIERS) {
  const tierDir = resolve(srcDir, tier);
  for (const file of readdirSync(tierDir)) {
    if (!file.endsWith('.js')) continue;
    if (file === 'index.js') continue;
    componentFiles.push(resolve(tierDir, file));
  }
}

let modified = 0;
let skipped = 0;

for (const filePath of componentFiles) {
  let source = readFileSync(filePath, 'utf-8');
  const fileName = basename(filePath);

  // Extract tag name from customElements.define()
  const defineMatch = source.match(
    /customElements\.define\(\s*['"]([^'"]+)['"]\s*,\s*(\w+)\s*\)/
  );
  if (!defineMatch) {
    console.log(`  SKIP ${fileName} — no customElements.define()`);
    skipped++;
    continue;
  }

  const tagName = defineMatch[1];
  const className = defineMatch[2];

  // Find bare side-effect imports (child components)
  // Pattern: import './some-component.js';
  const bareImportPattern = /^import '\.\/([a-z][\w-]*)\.js';\n/gm;
  const requires = [];
  let match;
  while ((match = bareImportPattern.exec(source)) !== null) {
    const childFile = match[1];
    // Derive tag name: files are named like 'accordion-item' -> 'arc-accordion-item'
    requires.push(`arc-${childFile}`);
  }

  // Remove the customElements.define() line (and trailing newline)
  source = source.replace(
    /\n?customElements\.define\(\s*['"]([^'"]+)['"]\s*,\s*(\w+)\s*\);\s*$/,
    '\n'
  );

  // Remove bare side-effect child imports
  source = source.replace(/^import '\.\/[a-z][\w-]*\.js';\n/gm, '');

  // Build the JSDoc annotation
  let jsdoc = `/**\n * @tag ${tagName}`;
  for (const req of requires) {
    jsdoc += `\n * @requires ${req}`;
  }
  jsdoc += '\n */';

  // Insert JSDoc above the class declaration
  const classPattern = /^(export class \w+ extends)/m;
  if (classPattern.test(source)) {
    source = source.replace(classPattern, `${jsdoc}\n$1`);
  } else {
    console.log(`  WARN ${fileName} — no class declaration found`);
  }

  // Clean up any double blank lines left from removed imports
  source = source.replace(/\n{3,}/g, '\n\n');

  // Ensure file ends with single newline
  source = source.trimEnd() + '\n';

  writeFileSync(filePath, source);
  const reqInfo = requires.length ? ` (requires: ${requires.join(', ')})` : '';
  console.log(`  ✓ ${fileName} → @tag ${tagName}${reqInfo}`);
  modified++;
}

console.log(`\nDone: ${modified} modified, ${skipped} skipped`);
