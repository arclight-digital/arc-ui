import type { ComponentDef } from './_types';

export const scrollIndicator: ComponentDef = {
  name: 'Scroll Indicator',
  slug: 'scroll-indicator',
  tag: 'arc-scroll-indicator',
  tier: 'navigation',
  interactivity: 'interactive',
  description: 'Thin progress bar that tracks scroll position of the page or a target container. Sticks to the top or bottom edge with accent or gradient fill.',

  overview: `Scroll Indicator renders a slim progress bar that fills left-to-right as the user scrolls through content. It attaches to the nearest scroll container or the window, updating via \`requestAnimationFrame\`-throttled scroll events for smooth, jank-free rendering.

The bar sticks to the top or bottom edge using \`position: sticky\` and stays out of the pointer-event flow so it never blocks clicks or text selection. Two color modes — solid accent and gradient (primary → secondary) — let you match the bar to your theme.

Three size presets (sm: 2px, md: 3px, lg: 4px) keep the indicator unobtrusive at the default small size while offering slightly bolder options for reading-focused layouts like blog posts or documentation. The component sets \`role="progressbar"\` with \`aria-valuenow\` for accessibility.`,

  features: [
    'Tracks scroll progress of the window or a specific CSS-selector target',
    'rAF-throttled scroll listener for smooth, jank-free updates',
    'Sticky positioning at top or bottom edge',
    'Two color modes: solid accent and primary-to-secondary gradient',
    'Three size presets: sm (2px), md (3px), lg (4px)',
    'Accessible `role="progressbar"` with live `aria-valuenow`',
    'Non-interactive — `pointer-events: none` so it never blocks content',
    'Respects `prefers-reduced-motion` by disabling transitions'
  ],

  guidelines: {
    do: [
      'Place at the top of long-form content like articles, docs, or settings pages',
      'Use the gradient color for branded reading experiences',
      'Use the sm size (default) for subtle progress indication',
      'Set a `target` selector when tracking a scrollable panel instead of the full page'
    ],
    dont: [
      'Use scroll indicator on short pages where scrolling is minimal',
      'Stack multiple scroll indicators — one per scroll context is sufficient',
      'Use as a loading indicator — use `arc-progress` for async operations instead'
    ],
  },

  previewHtml: `<div style="position: relative; height: 200px; overflow: auto; border: 1px solid var(--border-default); border-radius: var(--radius-md);" id="scroll-demo">
  <arc-scroll-indicator target="#scroll-demo" size="md" color="gradient"></arc-scroll-indicator>
  <div style="height: 800px; padding: 16px;">
    <p style="color: var(--text-muted);">Scroll this container to see the indicator fill...</p>
  </div>
</div>`,

  props: [
    { name: 'target', type: 'string', default: "''", description: 'CSS selector for the scroll container to track. Defaults to the window when empty.' },
    { name: 'position', type: "'top' | 'bottom'", default: "'top'", description: 'Which edge the indicator sticks to.' },
    { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'sm'", description: 'Bar thickness: sm (2px), md (3px), lg (4px).' },
    { name: 'color', type: "'accent' | 'gradient'", default: "'accent'", description: 'Fill color mode. Accent uses `--accent-primary`. Gradient blends from primary to secondary.' }
  ],

  tabs: [
    {
      label: 'Web Component',
      lang: 'html',
      code: `<!-- Page-level scroll indicator -->
<arc-scroll-indicator></arc-scroll-indicator>

<!-- Gradient bar tracking a specific container -->
<arc-scroll-indicator target="#my-panel" color="gradient" size="md"></arc-scroll-indicator>`,
    },
    {
      label: 'React',
      lang: 'tsx',
      code: `import { ScrollIndicator } from '@arclux/arc-ui-react';

{/* Page-level */}
<ScrollIndicator />

{/* Target a container */}
<ScrollIndicator target="#my-panel" color="gradient" size="md" />`,
    },
    {
      label: 'Vue',
      lang: 'html',
      code: `<script setup>
import { ScrollIndicator } from '@arclux/arc-ui-vue';
</script>

<template>
  <ScrollIndicator />
  <ScrollIndicator target="#my-panel" color="gradient" size="md" />
</template>`,
    },
    {
      label: 'Svelte',
      lang: 'html',
      code: `<script>
  import { ScrollIndicator } from '@arclux/arc-ui-svelte';
</script>

<ScrollIndicator />
<ScrollIndicator target="#my-panel" color="gradient" size="md" />`,
    },
    {
      label: 'Angular',
      lang: 'ts',
      code: `import { Component } from '@angular/core';
import { ScrollIndicator } from '@arclux/arc-ui-angular';

@Component({
  imports: [ScrollIndicator],
  template: \`
    <ScrollIndicator />
    <ScrollIndicator target="#my-panel" color="gradient" size="md" />
  \`,
})
export class ArticlePage {}`,
    },
    {
      label: 'Solid',
      lang: 'tsx',
      code: `import { ScrollIndicator } from '@arclux/arc-ui-solid';

<ScrollIndicator />
<ScrollIndicator target="#my-panel" color="gradient" size="md" />`,
    },
    {
      label: 'Preact',
      lang: 'tsx',
      code: `import { ScrollIndicator } from '@arclux/arc-ui-preact';

<ScrollIndicator />
<ScrollIndicator target="#my-panel" color="gradient" size="md" />`,
    },
  ],

  seeAlso: ['progress', 'scroll-spy', 'scroll-area'],
};
