import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://arcui.dev',
  vite: {
    ssr: {
      noExternal: ['lit', '@lit/reactive-element', 'lit-html', 'lit-element', '@arclux/arc-ui'],
    },
  },
});
