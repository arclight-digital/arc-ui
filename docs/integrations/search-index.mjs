/**
 * Astro integration that extracts a section-level search index from the built
 * HTML.
 *
 * ## Why the built HTML and not the sources
 *
 * The obvious alternative is to parse `src/pages/**.astro`, and it is worse in
 * every way that matters here. Half of this site's prose is emitted from
 * `src/data/**` as HTML strings, so a source parse would miss it — the same
 * reason `arc-dsd` renders the built files rather than going through Astro's
 * component graph. The built HTML also has the section ids already resolved,
 * which is what the search results have to link to.
 *
 * The cost is that this runs at `astro:build:done`, so a `pnpm dev` session has
 * no index of its own. The file is therefore written to `public/` as well as to
 * `dist/`: the dev server serves `public/` directly, so development searches the
 * index from the last build. Stale by one build, and the alternative is a
 * feature that only exists in production.
 *
 * ## What a record is
 *
 * One per `<section id>` — the unit a heading anchors to, and the unit worth
 * landing a reader on. Page-level records would send someone to the top of the
 * changelog to find one release; block-level records would rank fragments
 * against each other and bury the section that actually answers the query.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/** Longest snippet kept per section. Enough to recognise, short enough to fit. */
const SNIPPET = 180;

/**
 * Pages excluded from the index.
 *
 * /dev/ holds internal eyeballing pages that are noindex and not public docs —
 * the same set the sitemap filters. The changelog is indexed but capped below:
 * it is one page carrying every release, and left alone it would contribute
 * more records than the rest of the site combined and drown real results.
 */
const EXCLUDE = [/\/dev\//];
const MAX_SECTIONS_PER_PAGE = 40;

export default function searchIndex({ enabled = process.env.ARC_SEARCH_INDEX !== '0' } = {}) {
  return {
    name: 'arc-search-index',
    hooks: {
      'astro:build:done': async ({ dir, logger }) => {
        if (!enabled) return logger.info('skipped (disabled)');

        const distDir = fileURLToPath(dir);
        const records = [];

        for (const file of htmlFiles(distDir)) {
          const url = toUrl(distDir, file);
          if (EXCLUDE.some((re) => re.test(url))) continue;

          const html = fs.readFileSync(file, 'utf-8');
          const main = mainContent(html);
          if (!main) continue;

          const pageTitle = textOf(html.match(/<title>([\s\S]*?)<\/title>/)?.[1] ?? '')
            .replace(/\s*[—|]\s*ARC UI.*$/, '')
            .trim();

          const sections = extractSections(main).slice(0, MAX_SECTIONS_PER_PAGE);
          for (const section of sections) {
            records.push({
              // The anchor is the whole point — a result lands on the section,
              // not the top of the page.
              href: `${url}#${section.id}`,
              title: section.title,
              page: pageTitle,
              text: section.text.slice(0, SNIPPET),
            });
          }
        }

        const json = JSON.stringify(records);
        fs.writeFileSync(path.join(distDir, 'search-index.json'), json);

        // Also into public/, so the next `pnpm dev` has an index to serve. The
        // build copies public/ into dist, so this is what keeps the two in step.
        const publicDir = path.resolve(fileURLToPath(new URL('../public', import.meta.url)));
        fs.mkdirSync(publicDir, { recursive: true });
        fs.writeFileSync(path.join(publicDir, 'search-index.json'), json);

        logger.info(
          `${records.length} sections indexed, ${(json.length / 1024).toFixed(0)}K ` +
          `(${(json.length / 1024 / 4).toFixed(0)}K gzipped, roughly)`
        );
      },
    },
  };
}

/** The <main> region, so nav, sidebar and footer text never enters the index. */
function mainContent(html) {
  const open = html.search(/<main\b[^>]*>/);
  if (open === -1) return null;
  const start = html.indexOf('>', open) + 1;
  const end = html.lastIndexOf('</main>');
  return end > start ? html.slice(start, end) : null;
}

/**
 * Split a content region into `<section id>` records.
 *
 * Sections nest on some pages, so this tracks depth rather than assuming the
 * next `<section` closes the previous one — otherwise a parent section's text
 * would stop at its first child and every nested section would be lost.
 */
function extractSections(html) {
  const out = [];
  const open = /<section\b[^>]*\bid=["']([^"']+)["'][^>]*>/gi;
  let m;
  while ((m = open.exec(html))) {
    const bodyStart = m.index + m[0].length;
    const body = html.slice(bodyStart, sectionEnd(html, bodyStart));
    const heading = body.match(/<h[1-6]\b[^>]*>([\s\S]*?)<\/h[1-6]>/i);
    const title = textOf(heading?.[1] ?? '');
    if (!title) continue;

    // Drop the heading from the body so the snippet is the prose beneath it
    // rather than a repeat of the title.
    const prose = textOf(body.replace(heading[0], ''));
    out.push({ id: m[1], title, text: prose });
  }
  return out;
}

/** Index of the `</section>` matching the section open tag before `from`. */
function sectionEnd(html, from) {
  const tag = /<(\/?)section\b/gi;
  tag.lastIndex = from;
  let depth = 1;
  let m;
  while ((m = tag.exec(html))) {
    depth += m[1] ? -1 : 1;
    if (depth === 0) return m.index;
  }
  return html.length;
}

/**
 * HTML to readable text.
 *
 * Order matters: script, style and template go first, whole — their contents
 * are code, and stripping tags before removing them would leave the JavaScript
 * behind as prose. Declarative shadow roots are dropped for the same reason
 * arc-dsd exists: every component's internal markup is inlined into the page,
 * and indexing it would fill the snippet with the component's own scaffolding
 * instead of the author's words.
 */
function textOf(html) {
  return html
    .replace(/<(script|style|template)\b[^>]*>[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&[a-z]+;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function toUrl(distDir, file) {
  const rel = path.relative(distDir, file).split(path.sep).join('/');
  const url = '/' + rel.replace(/index\.html$/, '').replace(/\.html$/, '');
  return url.length > 1 ? url.replace(/\/$/, '') : url;
}

function htmlFiles(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...htmlFiles(full));
    else if (entry.name.endsWith('.html')) out.push(full);
  }
  return out;
}
