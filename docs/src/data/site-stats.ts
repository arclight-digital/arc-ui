/**
 * site-stats.ts — single source of truth for the numbers the site brags about.
 *
 * Imported by both the landing page (index.astro) and the OG image endpoint
 * (og-image.png.ts) so the social card can never drift from the site again.
 * Everything here is derived from real sources at build time — never
 * hard-code a stat in a page that also appears on the OG image.
 */
import fs from 'node:fs';
import { components } from './components/index';

const pkg = JSON.parse(
  fs.readFileSync(new URL('../../../packages/web-components/package.json', import.meta.url), 'utf-8'),
);
const baseCss = fs.readFileSync(new URL('../../../shared/base.css', import.meta.url), 'utf-8');

export const componentCount = components.length;

/**
 * Every custom element the library defines — child items included, so this is
 * larger than componentCount. Each element ships exactly one .register.js, so
 * counting those files is counting tags; it's also the number the ssr check
 * renders, which is why the SSR claims quote it.
 */
const wcSrc = new URL('../../../packages/web-components/src/', import.meta.url);
const iconSrc = new URL('../../../packages/icons/src/', import.meta.url);
const countRegisters = (dir: URL): number =>
  fs.readdirSync(dir, { withFileTypes: true }).reduce((n, entry) => {
    if (entry.isDirectory()) return n + countRegisters(new URL(`${entry.name}/`, dir));
    return n + (entry.name.endsWith('.register.js') ? 1 : 0);
  }, 0);
export const elementCount = countRegisters(wcSrc);

export const frameworks = ['React', 'Vue', 'Svelte', 'Angular', 'Solid', 'Preact', 'HTML'];
export const frameworkCount = frameworks.length;

/** Steps in the generate pipeline, counted from the pipeline definition itself
 *  (gen('…') / check('…') calls plus the literal prism step in scripts/generate.js). */
const generateJs = fs.readFileSync(new URL('../../../scripts/generate.js', import.meta.url), 'utf-8');
export const buildSteps =
  (generateJs.match(/\b(?:gen|check)\('[a-z-]+'\)/g) ?? []).length +
  (generateJs.match(/name: 'prism'/g) ?? []).length;

/** Unique custom properties defined in the generated shared/base.css. */
export const tokenCount = new Set(baseCss.match(/--[a-z0-9-]+(?=\s*:)/g)).size;

/** Counted from the component test suites so the landing page can't drift from reality. */
const testDir = new URL('../../../packages/web-components/test/', import.meta.url);
const testFiles = fs.readdirSync(testDir).filter((f) => f.endsWith('.test.js'));
export const testSuiteCount = testFiles.length;
export const testCount = testFiles.reduce(
  (n, f) => n + (fs.readFileSync(new URL(f, testDir), 'utf-8').match(/\bit\(/g) ?? []).length,
  0,
);

/** Unique class names in the generated utilities stylesheet. */
const utilitiesCss = fs.readFileSync(new URL('../../../shared/utilities.css', import.meta.url), 'utf-8');
export const utilityClassCount = new Set(utilitiesCss.match(/^\.[a-z0-9\\:-]+(?=[ ,{])/gm)).size;

export const version = pkg.version as string;
/** e.g. "v2.3" — used for release badges/pills. */
export const versionShort = `v${version.split('.').slice(0, 2).join('.')}`;

/* ── Surface area ──────────────────────────────────────────────────────────
   Counted from the component sources, which is also where the docs tables,
   the editor data and every wrapper package get them from. A number here
   being wrong would mean the manifest is wrong too. */
const wcFiles: URL[] = [];
const collect = (dir: URL) => {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) collect(new URL(`${entry.name}/`, dir));
    else if (entry.name.endsWith('.js') && !entry.name.endsWith('.register.js'))
      wcFiles.push(new URL(entry.name, dir));
  }
};
collect(wcSrc);
// `/icons/` is no longer among these — 4.7 moved both packs to
// @arclux/arc-ui-icons — but the filter stays: it costs nothing and the day it
// is wrong is the day something has reached back across the split.
const wcSource = wcFiles
  .filter((f) => !f.pathname.includes('/icons/') && !f.pathname.includes('/generated/'))
  .map((f) => fs.readFileSync(f, 'utf-8'));

const countTag = (tag: string) =>
  wcSource.reduce((n, src) => n + (src.match(new RegExp(`@${tag}\\b`, 'g')) ?? []).length, 0);

export const propCount = countTag('prop');
export const eventCount = countTag('fires');
export const partCount = countTag('csspart');
export const slotCount = countTag('slot');

/** Lines of component source — icons and generated files excluded, since
 *  neither is written by hand. */
export const sourceLineCount = wcSource.reduce((n, src) => n + src.split('\n').length, 0);

/** Icons available to arc-icon, across both sets — read from @arclux/arc-ui-icons. */
const iconSets = ['phosphor', 'lucide'] as const;
export const iconCount = iconSets.reduce((n, set) => {
  const src = fs.readFileSync(new URL(`${set}.js`, iconSrc), 'utf-8');
  return n + (src.match(/^export const /gm) ?? []).length;
}, 0);

/** Published packages: the web components, the icon packs, and the wrappers. */
export const packageCount = fs
  .readdirSync(new URL('../../../packages/', import.meta.url), { withFileTypes: true })
  .filter((e) => e.isDirectory()).length;

/** Components by tier, largest first — the shape of the library. */
export const tierBreakdown = Object.entries(
  components.reduce<Record<string, number>>((acc, c) => {
    const tier = (c as { tier?: string }).tier ?? 'other';
    acc[tier] = (acc[tier] ?? 0) + 1;
    return acc;
  }, {}),
).sort((a, b) => b[1] - a[1]);
