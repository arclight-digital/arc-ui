#!/usr/bin/env node

/**
 * a11y-audit.js — axe-core audit of every built component doc page
 *
 * Serves docs/dist, loads each /docs/components/<slug>/ page in headless
 * Chromium (live component demos included), and runs axe-core against the
 * fully rendered DOM — shadow roots included.
 *
 * Output:
 *   - docs/src/data/a11y-audit.json — machine-readable results, rendered
 *     on the accessibility docs page
 *   - non-zero exit if any serious or critical violation is found
 *
 * Usage: node scripts/a11y-audit.js [--fail-on=any|serious]
 *
 * Requires a docs build first: pnpm build:docs
 */

import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import os from 'node:os';
import { chromium } from 'playwright';
import { AxeBuilder } from '@axe-core/playwright';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const distDir = path.join(root, 'docs/dist');
const outFile = path.join(root, 'docs/src/data/a11y-audit.json');
const failOn = process.argv.find((a) => a.startsWith('--fail-on='))?.split('=')[1] ?? 'serious';
// --pages=button,tabs audits only those slugs (fast iteration mode);
// partial runs never overwrite the committed report.
const onlyPages = process.argv.find((a) => a.startsWith('--pages='))?.split('=')[1]?.split(',');
const CONCURRENCY = Math.min(12, Math.max(4, os.cpus().length - 2));

const MIME = {
  '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript',
  '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png',
  '.woff2': 'font/woff2', '.webmanifest': 'application/manifest+json',
};

if (!fs.existsSync(path.join(distDir, 'index.html'))) {
  console.error('a11y-audit: docs/dist not found — run `pnpm build:docs` first');
  process.exit(1);
}

const server = http.createServer((req, res) => {
  const urlPath = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  let filePath = path.join(distDir, urlPath);
  if (!filePath.startsWith(distDir)) { res.writeHead(403).end(); return; }
  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, 'index.html');
  }
  if (!fs.existsSync(filePath)) { res.writeHead(404).end(); return; }
  res.writeHead(200, { 'content-type': MIME[path.extname(filePath)] ?? 'application/octet-stream' });
  fs.createReadStream(filePath).pipe(res);
});
await new Promise((resolve) => server.listen(0, resolve));
const base = `http://localhost:${server.address().port}`;

let slugs = fs.readdirSync(path.join(distDir, 'docs/components'), { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => d.name)
  .sort();
if (onlyPages) slugs = slugs.filter((slug) => onlyPages.includes(slug));

const browser = await chromium.launch();
const results = [];
let done = 0;

async function auditSlug(context, slug) {
  // Audit in both color schemes: contrast differs per theme, structural
  // violations are deduped by (rule, target) across themes. One navigation
  // per page — the theme flips via emulateMedia between axe runs.
  const byKey = new Map();
  let error;
  const page = await context.newPage();
  try {
    // reducedMotion neutralizes transitions inside shadow roots (every
    // component honors prefers-reduced-motion), which a document-level
    // style tag cannot reach — without it, the theme flip below animates
    // shadow-DOM colors and axe samples mid-transition blends.
    await page.emulateMedia({ colorScheme: 'dark', reducedMotion: 'reduce' });
    await page.goto(`${base}/docs/components/${slug}/`, { waitUntil: 'load' });
    // Freeze light-DOM animations and force reveal states to their final
    // values: axe samples composited colors, and mid-animation opacity
    // produces false contrast readings (and nondeterministic CI runs).
    await page.addStyleTag({
      content: `
        *, *::before, *::after { transition: none !important; animation: none !important; }
        .reveal { opacity: 1 !important; transform: none !important; }
      `,
    });
    for (const theme of ['dark', 'light']) {
      await page.emulateMedia({ colorScheme: theme, reducedMotion: 'reduce' });
      // Settle window for any transition not covered by reduced-motion.
      await page.waitForTimeout(250);
      await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
      const { violations } = await new AxeBuilder({ page }).analyze();
      for (const v of violations) {
        const key = `${v.id}::${v.nodes[0]?.target.join(' ') ?? ''}`;
        if (byKey.has(key)) {
          byKey.get(key).themes.push(theme);
        } else {
          byKey.set(key, {
            id: v.id,
            impact: v.impact,
            description: v.description,
            helpUrl: v.helpUrl,
            nodes: v.nodes.length,
            targets: v.nodes.slice(0, 3).map((n) => n.target.join(' ')),
            themes: [theme],
          });
        }
      }
    }
  } catch (err) {
    error = err.message.split('\n')[0];
  } finally {
    await page.close();
  }
  results.push({ slug, ...(error ? { error } : {}), violations: [...byKey.values()] });
  done += 1;
  if (done % 25 === 0 || done === slugs.length) console.log(`  audited ${done}/${slugs.length}`);
}

const queue = [...slugs];
await Promise.all(Array.from({ length: CONCURRENCY }, async () => {
  const context = await browser.newContext();
  while (queue.length) await auditSlug(context, queue.shift());
  await context.close();
}));
await browser.close();
server.close();

const axeVersion = createRequire(import.meta.url)('axe-core/package.json').version;

const impactRank = { minor: 0, moderate: 1, serious: 2, critical: 3 };
const allViolations = results.flatMap((r) => r.violations.map((v) => ({ ...v, slug: r.slug })));
const totals = { minor: 0, moderate: 0, serious: 0, critical: 0 };
for (const v of allViolations) totals[v.impact] = (totals[v.impact] ?? 0) + 1;
const errors = results.filter((r) => r.error);

const report = {
  date: new Date().toISOString().slice(0, 10),
  axeVersion,
  pagesAudited: slugs.length,
  pagesClean: results.filter((r) => !r.error && r.violations.length === 0).length,
  totals,
  violations: allViolations.sort((a, b) => impactRank[b.impact] - impactRank[a.impact]),
};
if (!onlyPages) {
  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  fs.writeFileSync(outFile, JSON.stringify(report, null, 2) + '\n');
}

console.log(`\naxe-core ${axeVersion} — ${slugs.length} pages audited, ${report.pagesClean} clean`);
console.log(`violations: ${totals.critical} critical, ${totals.serious} serious, ${totals.moderate} moderate, ${totals.minor} minor`);
for (const v of report.violations.slice(0, 20)) {
  console.log(`  [${v.impact}] ${v.slug}: ${v.id} (${v.nodes} nodes)`);
}
if (allViolations.length > 20) console.log(`  … and ${allViolations.length - 20} more (see ${path.relative(root, outFile)})`);
if (errors.length) {
  console.log(`page errors: ${errors.map((e) => e.slug).join(', ')}`);
  process.exit(1);
}

const failing = failOn === 'any'
  ? allViolations.length
  : allViolations.filter((v) => impactRank[v.impact] >= impactRank.serious).length;
process.exit(failing ? 1 : 0);
