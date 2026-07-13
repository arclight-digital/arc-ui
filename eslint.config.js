import globals from 'globals';

export default [
  {
    files: ['packages/*/src/**/*.js'],
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    rules: {
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      'no-undef': 'error',
      'no-const-assign': 'error',
      'no-dupe-keys': 'error',
      'no-duplicate-case': 'error',
      'no-unreachable': 'warn',
      'eqeqeq': ['warn', 'smart'],
      'no-var': 'error',
      'prefer-const': 'warn',
    },
  },
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      'packages/html/**',
      '.idea/**',
      // Generated output — kept honest by the CI generate-diff gate, not lint.
      // (espree can't parse the generated TS wrappers anyway.)
      'packages/react/src/**',
      'packages/vue/src/**',
      'packages/svelte/src/**',
      'packages/angular/src/**',
      'packages/solid/src/**',
      'packages/preact/src/**',
      'packages/web-components/src/icons/**',
      'packages/web-components/src/**/*.register.js',
      'packages/web-components/src/register.js',
      'packages/web-components/src/base.css',
    ],
  },
];
