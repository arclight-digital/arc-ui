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

export const frameworks = ['React', 'Vue', 'Svelte', 'Angular', 'Solid', 'Preact', 'HTML'];
export const frameworkCount = frameworks.length;

export const buildSteps = 0;

/** Unique custom properties defined in the generated shared/base.css. */
export const tokenCount = new Set(baseCss.match(/--[a-z0-9-]+(?=\s*:)/g)).size;

export const version = pkg.version as string;
/** e.g. "v2.3" — used for release badges/pills. */
export const versionShort = `v${version.split('.').slice(0, 2).join('.')}`;
