/**
 * Astro integration around `@arclux/arc-ui/ssr`.
 *
 * All the work lives in the library — this walks the built HTML files, hands
 * each one to `renderDeclarativeShadowDOM`, and writes back the result plus the
 * shared stylesheets it returns. It is deliberately thin: the same rendering
 * runs for Nuxt, SvelteKit, Angular Universal or anything else that produces
 * HTML, and keeping the Astro-specific part to file IO is what makes that true.
 *
 * ## Why a build pass and not @astrojs/lit
 *
 * Astro only routes *imported components* through a renderer. Raw `<arc-button>`
 * in a template is passed through as unknown HTML, and this site emits the large
 * majority of its component markup as HTML strings from `src/data/**` — which no
 * Astro renderer can ever see. Making @astrojs/lit cover the site would mean
 * rewriting every usage as an imported component, and would still leave the
 * data-driven examples out.
 *
 * (@astrojs/lit is also broken against its own dependency range at the time of
 * writing: its `render()` hand-builds a RenderInfo with four fields, and the
 * @lit-labs/ssr its `^3.2.2` resolves to also reads `eventTargetStack` and
 * `slotStack`. That is fixable; the coverage ceiling above is not.)
 *
 * ## Hydration depends on a chunking rule, not on import order
 *
 * Getting Lit to *adopt* this markup rather than render over it needs hydration
 * support in its own chunk — see `manualChunks` in astro.config.mjs. Without it
 * the module is small enough for Rollup to inline into the entry chunk, while
 * the components stay separate chunks whose imports hoist above that inlined
 * code, so the hook lands after all 185 components are defined.
 *
 * Two things that look like fixes and are not: putting the import first inside
 * the script (Rollup hoists past it, 0 of 185 patched), and splitting it into a
 * second `<script>` (Astro does not preserve sibling script order — it emitted
 * the component block first).
 *
 * The symptom, worth recognising: elements end up holding the server's markers
 * *and* a second client-rendered copy above them, so each has two default slots
 * of which only the first is assigned, and axe reports buttons and links with
 * no accessible name. `<!--lit-part-->` comments surviving in a shadow root is
 * hydration working, not failing — hydration preserves them.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderDeclarativeShadowDOM } from '@arclux/arc-ui/ssr';
/**
 * Registers Phosphor in the *build* process, which is a separate program from
 * the browser bundle — `[slug].astro` registering it client-side does nothing
 * here. Since 4.7 core selects no library, and without this every `<arc-icon
 * name="…">` across 19,539 pre-rendered shadow roots resolves to null and paints
 * its empty-slot fallback into the HTML. Not a broken page — the client produces
 * the same tree, so hydration is clean — but a page whose icons only appear
 * after JavaScript, which is the thing pre-rendering exists to avoid.
 */
import '@arclux/arc-ui-icons/phosphor';

/** Where the shared stylesheets are written, relative to the site root. */
const SHEET_DIR = '_arc';

/**
 * `ARC_DSD=0 pnpm build` skips the pass; `ARC_DSD_LIFT=0` keeps the shadow
 * stylesheets inline. Both exist for measuring against. The dev server never
 * runs it — this is an `astro:build:done` hook — so dev renders client-side.
 */
export default function arcDsd({
  enabled = process.env.ARC_DSD !== '0',
  lift = process.env.ARC_DSD_LIFT !== '0',
} = {}) {
  return {
    name: 'arc-dsd',
    hooks: {
      'astro:build:done': async ({ dir, logger }) => {
        if (!enabled) return logger.info('skipped (disabled)');

        const distDir = fileURLToPath(dir);
        const stylesheets = new Map();
        const failures = [];
        let rendered = 0;
        let roots = 0;
        let deferred = 0;
        let before = 0;
        let after = 0;

        for (const file of htmlFiles(distDir)) {
          const source = fs.readFileSync(file, 'utf-8');
          if (!source.includes('<arc-')) continue;

          let result;
          try {
            result = await renderDeclarativeShadowDOM(source, {
              lift,
              stylesheetPath: `/${SHEET_DIR}`,
              stylesheets,
            });
          } catch (error) {
            failures.push({ file: path.relative(distDir, file), error });
            continue;
          }

          roots += result.roots;
          deferred += result.deferred;
          before += source.length;
          after += result.html.length;
          rendered++;
          fs.writeFileSync(file, result.html);
        }

        const sheetDir = path.join(distDir, SHEET_DIR);
        fs.mkdirSync(sheetDir, { recursive: true });
        let sheetBytes = 0;
        for (const [css, name] of stylesheets) {
          fs.writeFileSync(path.join(sheetDir, name), css);
          sheetBytes += css.length;
        }

        const kb = (n) => `${(n / 1024).toFixed(0)}K`;
        logger.info(
          `${rendered} pages, ${roots} shadow roots; ${deferred} closed overlays deferred`
        );
        logger.info(
          `html ${kb(before)} -> ${kb(after)}; ` +
          `${stylesheets.size} shared stylesheets, ${kb(sheetBytes)} total`
        );

        if (failures.length > 0) {
          for (const { file, error } of failures) {
            logger.error(`${file}: ${error?.message ?? error}`);
          }
          throw new Error(
            `arc-dsd: ${failures.length} page(s) failed to server-render. ` +
            'A component that throws here would have shipped as an empty tag.'
          );
        }
      },
    },
  };
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
