import path from 'node:path';
import { pathToFileURL } from 'node:url';

/**
 * The monorepo root, for build-time reads of the packages' own files.
 *
 * From the working directory, which is docs/ for both `astro build` and
 * `astro dev`. Not from import.meta.url: Astro 7 prerenders from a bundled
 * chunk under dist/, so a path relative to the source file resolved against
 * that chunk instead and every read missed. og-card.ts made the same call
 * for the same reason.
 */
export const REPO = pathToFileURL(`${path.resolve(process.cwd(), '..')}/`);
