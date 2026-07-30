#!/usr/bin/env node
/**
 * smoke-test-wrappers.js — packs the real tarballs and builds a real consumer.
 *
 * Everything else in this repo verifies generated *source*; nothing installs
 * what npm would actually serve. That blind spot is how the packages shipped
 * raw TypeScript entry points for years: every in-repo check resolved through
 * the workspace, where a `src/index.ts` main works fine. This script is the
 * missing consumer: `pnpm pack` (running each package's prepack build), a
 * scratch Vite app installing the tarballs by file path, and a production
 * build that imports a component through its per-component subpath.
 *
 * Run via: pnpm smoke:wrappers  (needs network for the scratch app's deps)
 */

import { execFileSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, mkdirSync, readFileSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const scratch = mkdtempSync(join(tmpdir(), 'arc-smoke-'));

const run = (cmd, args, cwd) =>
  execFileSync(cmd, args, { cwd, encoding: 'utf-8', stdio: ['ignore', 'pipe', 'pipe'] });

console.log(`  scratch: ${scratch}`);

// ── 1. Pack the tarballs (prepack builds dist/ for the built packages) ──────
const tarballs = {};
for (const pkg of ['web-components', 'react']) {
  const out = run('pnpm', ['pack', '--pack-destination', scratch], resolve(root, 'packages', pkg));
  const file = out.trim().split('\n').pop();
  tarballs[pkg] = file;
  console.log(`  packed ${pkg} → ${file.split('/').pop()}`);
}

// ── 2. Scaffold a minimal Vite consumer ─────────────────────────────────────
const app = join(scratch, 'app');
mkdirSync(join(app, 'src'), { recursive: true });

writeFileSync(join(app, 'package.json'), JSON.stringify({
  name: 'arc-smoke-consumer',
  private: true,
  type: 'module',
  dependencies: {
    '@arclux/arc-ui': `file:${tarballs['web-components']}`,
    '@arclux/arc-ui-react': `file:${tarballs['react']}`,
    react: '^19.0.0',
    'react-dom': '^19.0.0',
  },
  devDependencies: { vite: '^7.0.0' },
}, null, 2));

writeFileSync(join(app, 'index.html'),
  '<!doctype html><html><body><div id="root"></div><script type="module" src="/src/main.tsx"></script></body></html>');

// Imports through the per-component subpath — the granular exports surface —
// and through the barrel, so both resolution paths are exercised.
writeFileSync(join(app, 'src', 'main.tsx'), `
import { createRoot } from 'react-dom/client';
import { Button } from '@arclux/arc-ui-react/Button';
import { Card } from '@arclux/arc-ui-react';

createRoot(document.getElementById('root')!).render(
  <Card padding="md"><Button variant="primary">Smoke</Button></Card>
);
`);

// ── 3. Install + build ───────────────────────────────────────────────────────
console.log('  installing scratch app deps…');
run('npm', ['install', '--no-audit', '--no-fund', '--loglevel=error'], app);
console.log('  building with vite…');
run('npx', ['vite', 'build'], app);

// ── 4. Assert the custom elements actually made it into the bundle ──────────
const assets = join(app, 'dist', 'assets');
const bundle = readdirSync(assets)
  .filter((f) => f.endsWith('.js'))
  .map((f) => readFileSync(join(assets, f), 'utf-8'))
  .join('');

const MARKERS = ['arc-button', 'arc-card', 'customElements'];
const missing = MARKERS.filter((m) => !bundle.includes(m));
if (missing.length > 0) {
  console.error(`✗ built bundle is missing: ${missing.join(', ')}`);
  console.error(`  inspect: ${app}`);
  process.exit(1);
}

rmSync(scratch, { recursive: true, force: true });
console.log('✓ tarballs install, compile, and register their elements in a real Vite consumer');
