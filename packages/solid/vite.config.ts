import { defineConfig } from 'vite';
import solid from 'vite-plugin-solid';
import { isAbsolute } from 'node:path';

// Compiled fallback for tooling without the Solid compiler. Solid-aware
// bundlers should resolve the `solid` export condition to the source .tsx
// instead — compiling JSX here binds it to this solid-js runtime version,
// which is exactly what the source condition exists to avoid.
export default defineConfig({
  plugins: [solid()],
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
