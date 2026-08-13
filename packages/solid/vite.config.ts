import { defineConfig } from 'vite';
import solid from 'vite-plugin-solid';
import { isAbsolute } from 'node:path';
import { entriesFromExports } from '../../scripts/lib/wrapper-entries.js';

// Compiled fallback for tooling without the Solid compiler. Solid-aware
// bundlers should resolve the `solid` export condition to the source .tsx
// instead — compiling JSX here binds it to this solid-js runtime version,
// which is exactly what the source condition exists to avoid.
export default defineConfig({
  plugins: [solid()],
  build: {
    lib: {
      // Every subpath this package publishes, not just the root barrel — see
      // scripts/lib/wrapper-entries.js. `preserveModules` emits what the entry
      // graph reaches, and the eight tier barrels plus the barrel-excluded
      // `./CodeBlock` were reached by nothing.
      entry: entriesFromExports(import.meta.dirname, ['.tsx', '.ts']),
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
