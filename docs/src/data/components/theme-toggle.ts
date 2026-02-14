import type { ComponentDef } from './_types';

export const themeToggle: ComponentDef = {
    name: 'Theme Toggle',
    slug: 'theme-toggle',
    tag: 'arc-theme-toggle',
    tier: 'input',
    interactivity: 'interactive',
    description: 'Three-state theme toggle cycling through dark, light, and auto modes with animated icon transitions and localStorage persistence.',

    overview: `ThemeToggle is a single-button control that cycles through the three ARC UI theme modes: dark, light, and auto (system preference). Each mode is represented by a distinct icon -- a moon for dark, a sun for light, and a monitor for auto -- with smooth scale-and-rotate transitions between them. The component writes the selected theme to both \`document.documentElement.dataset.theme\` and \`localStorage\`, so the choice persists across page loads without any external state management.

On first mount, ThemeToggle reads the stored preference from \`localStorage\` under the key \`arc-theme\`, falling back to the \`data-theme\` attribute on the HTML element, and then to \`auto\` if neither is set. This makes it a drop-in solution for theme switching in any ARC UI application -- just place the component in your top bar or settings panel and it handles the rest.

An \`icon-only\` mode is available for compact layouts like toolbars, rendering the button as a small circle without the text label. The standard mode displays the current theme name next to the icon, capitalised, giving less experienced users a clear indication of the active state.`,

    features: [
      'Three-state cycle: dark -> light -> auto -> dark, covering all common theme preferences',
      'Animated icon transitions with scale and rotation for visually polished mode switches',
      'Automatic localStorage persistence under the key `arc-theme` for cross-session retention',
      'Sets `data-theme` attribute on the document root for immediate application-wide theme changes',
      'Icon-only compact mode via the `icon-only` attribute for toolbar and header usage',
      'Fires `arc-change` with the new theme value on every cycle for external state coordination',
      'Keyboard accessible with Enter and Space key support, plus visible focus ring',
      'Active-press scale animation (0.95) for tactile click feedback',
    ],

    guidelines: {
      do: [
        'Place ThemeToggle in a persistent location like the top bar or settings panel so users can always find it',
        'Use `icon-only` in dense layouts like toolbars where space is limited',
        'Listen to `arc-change` if you need to coordinate theme changes with a backend preference API',
        'Ensure your application respects the `data-theme` attribute on the document root for theme switching to work',
        'Set an initial `data-theme` on the HTML element during SSR to prevent flash-of-wrong-theme',
      ],
      dont: [
        'Do not place multiple ThemeToggle instances on the same page -- they will compete for localStorage and document attributes',
        'Do not override the localStorage key `arc-theme` from external code without also updating the component',
        'Do not use ThemeToggle for toggling features unrelated to visual theme -- use Toggle for binary settings',
        'Do not hide the component behind a menu -- theme switching should be easily discoverable',
        'Avoid using ThemeToggle in iframes without ensuring the parent document also applies the theme attribute',
      ],
    },

    previewHtml: `<div style="display:flex; gap:16px; align-items:center;">
  <arc-theme-toggle></arc-theme-toggle>
  <arc-theme-toggle icon-only></arc-theme-toggle>
</div>`,

    props: [
      { name: 'theme', type: "'dark' | 'light' | 'auto'", default: "'auto'", description: 'The current theme mode. Automatically synced to localStorage and the document root `data-theme` attribute.' },
      { name: 'disabled', type: 'boolean', default: 'false', description: 'Prevents cycling and reduces opacity to 40%.' },
      { name: 'icon-only', type: 'boolean', default: 'false', description: 'Renders the button as a compact circle without the theme name label. Attribute name is `icon-only`.' },
    ],
    events: [
      { name: 'arc-change', description: 'Fired when the theme is toggled, with { theme } detail' },
    ],
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

<ThemeToggle></ThemeToggle>`,
      },
      {
        label: 'Vue',
        lang: 'html',
        code: `<script setup>
import { ThemeToggle } from '@arclux/arc-ui-vue';
</script>

<template>
  <ThemeToggle></ThemeToggle>
</template>`,
      },
      {
        label: 'Svelte',
        lang: 'html',
        code: `<script>
  import { ThemeToggle } from '@arclux/arc-ui-svelte';
</script>

<ThemeToggle></ThemeToggle>`,
      },
      {
        label: 'Angular',
        lang: 'ts',
        code: `import { Component } from '@angular/core';
import { ThemeToggle } from '@arclux/arc-ui-angular';

@Component({
  imports: [ThemeToggle],
  template: \`
    <ThemeToggle></ThemeToggle>
  \`,
})
export class MyComponent {}`,
      },
      {
        label: 'Solid',
        lang: 'tsx',
        code: `import { ThemeToggle } from '@arclux/arc-ui-solid';

<ThemeToggle></ThemeToggle>`,
      },
      {
        label: 'Preact',
        lang: 'tsx',
        code: `import { ThemeToggle } from '@arclux/arc-ui-preact';

<ThemeToggle></ThemeToggle>`,
      },
    ],
  
  seeAlso: ["/docs/theming"],
};
