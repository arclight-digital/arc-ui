/**
 * custom-elements-manifest analyzer config.
 * Run via `pnpm generate` (scripts/generate-manifest.js) — outputs custom-elements.json.
 */
export default {
  globs: ['src/**/*.js'],
  exclude: [
    'src/**/*.register.js',
    'src/register.js',
    'src/index.js',
    'src/*/index.js',
    'src/icons/**',
    'src/shared-styles.js',
    'src/tokens.js',
    'src/shared/scroll-lock.js',
    'src/shared/menu-keyboard.js',
    'src/shared/overlay-mixin.js',
    'src/shared/position-styles.js',
    'src/*-styles.js',
    'src/*-utils.js',
  ],
  litelement: true,
  outdir: '.',
};
