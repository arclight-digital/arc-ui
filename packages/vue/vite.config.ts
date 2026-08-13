import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { isAbsolute } from 'node:path';
import { entriesFromExports } from '../../scripts/lib/wrapper-entries.js';

// Library build: every SFC compiles to its own ESM module (preserveModules)
// so the per-component subpath exports resolve to real files, and everything
// bare stays external — the wrapper is glue, not a bundle.
export default defineConfig({
  plugins: [
    // The library compiles its own SFCs now, so IT must know arc-* tags are
    // custom elements — otherwise every compiled render function calls
    // resolveComponent('arc-x'), warns, and only then falls back.
    vue({
      template: {
        compilerOptions: {
          isCustomElement: (tag) => tag.startsWith('arc-'),
        },
      },
    }),
  ],
  build: {
    lib: {
      // Every subpath this package publishes, not just the root barrel.
      // `preserveModules` only preserves what the entry graph *reaches*, and
      // `src/index.ts` re-exports components directly (`./content/Card.vue`),
      // never through the tier barrels — so `src/content/index.ts` and its
      // seven siblings were compiled by nothing and `@arclux/arc-ui-vue/content`
      // threw ERR_MODULE_NOT_FOUND for as long as the subpath has existed.
      // `./CodeBlock` went the same way for the opposite reason: it is
      // `barrelExclude`d precisely so the root never imports it, which also
      // meant nothing did.
      entry: entriesFromExports(import.meta.dirname, ['.vue', '.ts']),
      formats: ['es'],
    },
    rollupOptions: {
      external: (id) => !id.startsWith('.') && !isAbsolute(id),
      output: {
        preserveModules: true,
        preserveModulesRoot: 'src',
        entryFileNames: '[name].js',
      },
    },
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: true,
  },
});
