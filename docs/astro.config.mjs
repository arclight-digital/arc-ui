import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://arcui.dev',
  integrations: [
    sitemap({
      // /docs/ is a redirect stub — keep it out of the index.
      filter: (page) => page !== 'https://arcui.dev/docs/',
      // Emit slash-less URLs to match canonical tags and internal links
      // (the CDN serves both forms; these tags pick the canonical one).
      serialize: (item) =>
        item.url === 'https://arcui.dev/' ? item : { ...item, url: item.url.replace(/\/$/, '') },
    }),
  ],
  vite: {
    ssr: {
      noExternal: ['lit', '@lit/reactive-element', 'lit-html', 'lit-element', '@arclux/arc-ui', '@arclux/brand', 'shiki', '@shikijs/core', '@shikijs/engine-javascript', '@shikijs/engine-oniguruma', '@shikijs/types', '@shikijs/vscode-textmate'],
    },
  },
});
