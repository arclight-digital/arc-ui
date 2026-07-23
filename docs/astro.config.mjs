import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://arcui.dev',
  integrations: [sitemap()],
  vite: {
    ssr: {
      noExternal: ['lit', '@lit/reactive-element', 'lit-html', 'lit-element', '@arclux/arc-ui', '@arclux/brand', 'shiki', '@shikijs/core', '@shikijs/engine-javascript', '@shikijs/engine-oniguruma', '@shikijs/types', '@shikijs/vscode-textmate'],
    },
  },
});
