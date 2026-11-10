import type { ComponentDef } from './_types';

export const themeToggle: ComponentDef = {
  name: 'Theme Toggle',
  slug: 'theme-toggle',
  tag: 'arc-theme-toggle',
  tier: 'input',
  interactivity: 'interactive',
  description:
    'Three-state theme toggle cycling through dark, light, and auto modes with animated icon transitions and localStorage persistence.',

  overview: `ThemeToggle is one button that cycles through dark, light and auto (the system setting). Each mode has its own icon (a moon, a sun or a monitor), and the icons scale and rotate as they change. The chosen mode is written to \`data-theme\` on the document root and to \`localStorage\` under \`arc-theme\`, so it persists across page loads.

On first mount it uses the \`theme\` attribute if you set one. Otherwise it reads \`arc-theme\` from \`localStorage\`, then the \`data-theme\` already on the root, and falls back to \`auto\`.

By default the button shows the current mode's name next to the icon. \`icon-only\` drops the name for a compact button in a toolbar or header.`,

  features: [
    'Fires `arc-change` with the new mode in `detail.value` on every change',
    'Enter and Space cycle the mode',
    'The button scales to 0.95 while pressed',
  ],

  guidelines: {
    do: [
      'Put it somewhere that\'s always on screen, such as the top bar or a settings panel',
      'Use `icon-only` where space is tight',
      'Listen to `arc-change` to save the choice to a backend preference',
      'Make sure your styles follow the `data-theme` attribute on the document root, or switching does nothing',
      'Set `data-theme` on the HTML element during server rendering, so the page doesn\'t flash the wrong theme',
    ],
    dont: [
      'Don\'t change the theme by writing the `arc-theme` key in `localStorage`. The toggle doesn\'t watch storage. Set its `theme` property or the root\'s `data-theme`. Every toggle on the page follows `data-theme`',
      'Don\'t use it for settings other than the theme. Use Toggle',
      'Don\'t use it in an iframe unless the parent page also applies the theme attribute',
    ],
  },

  previewHtml: `<div style="display:flex; gap:16px; align-items:center;">
  <arc-theme-toggle></arc-theme-toggle>
  <arc-theme-toggle icon-only></arc-theme-toggle>
</div>`,

  tabs: [
    {
      label: 'Web Component',
      lang: 'html',
      code: `<arc-theme-toggle></arc-theme-toggle>`,
    },
    {
      label: 'React',
      lang: 'tsx',
      code: `import { ThemeToggle } from '@arclux/arc-ui-react';

export default function Example() {
  return (
    <ThemeToggle />
  );
}`,
    },
    {
      label: 'Vue',
      lang: 'html',
      code: `<script setup>
import { ThemeToggle } from '@arclux/arc-ui-vue';
</script>

<template>
  <ThemeToggle />
</template>`,
    },
    {
      label: 'Svelte',
      lang: 'html',
      code: `<script>
  import { ThemeToggle } from '@arclux/arc-ui-svelte';
</script>

<ThemeToggle />`,
    },
    {
      label: 'Angular',
      lang: 'ts',
      code: `import { Component } from '@angular/core';
import { ThemeToggle } from '@arclux/arc-ui-angular';

@Component({
  imports: [ThemeToggle],
  template: \`
    <arc-theme-toggle></arc-theme-toggle>
  \`,
})
export class MyComponent {}`,
    },
    {
      label: 'Solid',
      lang: 'tsx',
      code: `import { ThemeToggle } from '@arclux/arc-ui-solid';

export default function Example() {
  return (
    <ThemeToggle />
  );
}`,
    },
    {
      label: 'Preact',
      lang: 'tsx',
      code: `import { ThemeToggle } from '@arclux/arc-ui-preact';

export default function Example() {
  return (
    <ThemeToggle />
  );
}`,
    },
  ],

  seeAlso: ['/docs/theming'],
};
