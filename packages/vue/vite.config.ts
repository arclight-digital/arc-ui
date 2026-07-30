import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { isAbsolute } from 'node:path';

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
      entry: 'src/index.ts',
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
