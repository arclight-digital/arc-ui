/**
 * Content collections. `releases` is the changelog: one plain-markdown file
 * per published release (src/content/releases/2-11-1.md, …). The body carries
 * no house markup — /docs/changelog supplies the section chrome and styling.
 * Dates are npm publish dates (`npm view @arclux/arc-ui time`).
 */
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const releases = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/releases' }),
  schema: z.object({
    /** Published version, e.g. "2.11.1". */
    version: z.string().regex(/^\d+\.\d+\.\d+$/),
    /** ISO date (YYYY-MM-DD) the version was published to npm. */
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    /** The release's title, e.g. "Every Button Gets Its Label Back". */
    title: z.string(),
  }),
});

export const collections = { releases };
