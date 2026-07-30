import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import arcDsd from './integrations/arc-dsd.mjs';

export default defineConfig({
  site: 'https://arcui.dev',
  integrations: [
    arcDsd(),
    sitemap({
      // /docs/ is a redirect stub — keep it out of the index. /dev/ holds
      // internal eyeballing pages, which are noindex and not public docs.
      filter: (page) => page !== 'https://arcui.dev/docs/' && !page.includes('/dev/'),
      // Emit slash-less URLs to match canonical tags and internal links
      // (the CDN serves both forms; these tags pick the canonical one).
      serialize: (item) =>
        item.url === 'https://arcui.dev/' ? item : { ...item, url: item.url.replace(/\/$/, '') },
    }),
  ],
  vite: {
    build: {
      rollupOptions: {
        output: {
          // Force Lit's hydration support into a chunk of its own.
          //
          // It has to evaluate before any component class is defined, and
          // importing it first does not achieve that on its own: the module is
          // small, so Rollup inlines it into the entry chunk, while the
          // components stay separate chunks — and a chunk's cross-chunk imports
          // are hoisted above its own inlined code. The hook was therefore
          // assigned after all 185 components had already been defined.
          //
          // As its own chunk it becomes a cross-chunk import too, and those keep
          // their source order relative to each other. Splitting it into a
          // second <script> does not work either: Astro does not preserve the
          // order of sibling script blocks.
          manualChunks(id) {
            if (id.includes('ssr-client') || id.endsWith('arc-ui/src/hydrate.js')) {
              return 'arc-hydrate';
            }
          },
        },
      },
    },
    ssr: {
      // lit and its packages are deliberately absent. They were here from the
      // first commit with no recorded reason, and bundling them gives Astro's
      // server chunk a second copy of Lit — including a second custom-element
      // registry, which is what made @astrojs/lit unable to find any ARC
      // element. The site builds and audits identically without them.
      noExternal: ['@arclux/arc-ui', '@arclux/brand', 'shiki', '@shikijs/core', '@shikijs/engine-javascript', '@shikijs/engine-oniguruma', '@shikijs/types', '@shikijs/vscode-textmate'],
    },
  },
});
