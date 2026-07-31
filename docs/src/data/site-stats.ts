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
 * counting those files is counting tags; it's also the number check:ssr
 * renders, which is why the SSR claims quote it.
 */
const wcSrc = new URL('../../../packages/web-components/src/', import.meta.url);
const countRegisters = (dir: URL): number =>
  fs.readdirSync(dir, { withFileTypes: true }).reduce((n, entry) => {
    if (entry.isDirectory()) return n + countRegisters(new URL(`${entry.name}/`, dir));
    return n + (entry.name.endsWith('.register.js') ? 1 : 0);
  }, 0);
export const elementCount = countRegisters(wcSrc);

export const frameworks = ['React', 'Vue', 'Svelte', 'Angular', 'Solid', 'Preact', 'HTML'];
export const frameworkCount = frameworks.length;

export const buildSteps = 0;

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
