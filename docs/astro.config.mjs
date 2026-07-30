import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://arcui.dev',
  integrations: [
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
