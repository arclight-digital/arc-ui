#!/usr/bin/env node
/**
 * Runs the custom-elements-manifest analyzer over the web-components package,
 * then strips internal state (underscore-prefixed fields/attributes) from the
 * manifest so it only describes the public API.
 *
 * Output: packages/web-components/custom-elements.json
 * (Called automatically by `pnpm generate`)
 */
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const wcDir = resolve(__dirname, '../packages/web-components');
const manifestPath = resolve(wcDir, 'custom-elements.json');

execFileSync('pnpm', ['exec', 'custom-elements-manifest', 'analyze'], {
  cwd: wcDir,
  stdio: ['inherit', 'pipe', 'pipe'],
});

const manifest = JSON.parse(readFileSync(manifestPath, 'utf-8'));

// The analyzer emits modules in filesystem-glob order, which is not stable
// across machines — sort by path so the output is deterministic (the CI
// generate-diff gate depends on this).
manifest.modules.sort((a, b) => (a.path ?? '').localeCompare(b.path ?? ''));

for (const mod of manifest.modules) {
  for (const decl of mod.declarations ?? []) {
    if (decl.members) {
      decl.members = decl.members.filter((m) => !m.name?.startsWith('_'));
    }
    if (decl.attributes) {
      decl.attributes = decl.attributes.filter((a) => !a.name?.startsWith('_'));
    }
    // Dynamic event names (dispatchEvent(new CustomEvent(variable))) come out
    // of the analyzer as nameless entries — junk for every downstream consumer.
    if (decl.events) {
      decl.events = decl.events.filter((e) => e.name);
    }
  }
}

writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');

const count = manifest.modules
  .flatMap((m) => m.declarations ?? [])
  .filter((d) => d.customElement && d.tagName).length;
console.log(`✓ custom-elements.json — ${count} custom elements`);
