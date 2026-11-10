import type { ComponentDef } from './_types';

export const scrollIndicator: ComponentDef = {
  name: 'Scroll Indicator',
  slug: 'scroll-indicator',
  tag: 'arc-scroll-indicator',
  tier: 'navigation',
  interactivity: 'interactive',
  description:
    'A thin bar along the top or bottom edge that fills as you scroll the page or a container.',

  overview: `ScrollIndicator shows how far a reader has scrolled through a long article, doc page or settings panel. The bar fills left to right. It tracks the window by default, or the element matched by the \`target\` selector. A selector that matches nothing falls back to the window. Progress updates from a scroll listener throttled to one \`requestAnimationFrame\` per frame.

The bar uses \`position: sticky\` on the top edge, or the bottom with \`position="bottom"\`, and has \`pointer-events: none\`, so it never blocks clicks or text selection. \`color="accent"\` fills it with \`--accent-primary\`, and \`color="gradient"\` blends primary to secondary. \`size\` sets the thickness: \`sm\` 2px (the default), \`md\` 3px or \`lg\` 4px.

The bar is a \`role="progressbar"\` labelled "Scroll progress", with \`aria-valuenow\` from 0 to 100.`,

  features: [
    'Parts: `base`, `bar` and `fill`',
  ],

  guidelines: {
    do: [
      'Set `target` when the scrolling happens in a panel, not the page',
    ],
    dont: [
      'Don\'t add it to short pages that barely scroll',
      'Don\'t put more than one on the same scroll container',
      'Don\'t use it for loading. Use Progress',
    ],
  },

  previewHtml: `<div style="position: relative; height: 200px; overflow: auto; border: 1px solid var(--border-default); border-radius: var(--radius-md);" id="scroll-demo">
  <arc-scroll-indicator target="#scroll-demo" size="md" color="gradient"></arc-scroll-indicator>
  <div style="height: 800px; padding: 16px;">
    <p style="color: var(--text-muted);">Scroll this container to see the indicator fill...</p>
  </div>
</div>`,

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
    <arc-scroll-indicator />
    <arc-scroll-indicator target="#my-panel" color="gradient" size="md" />
  \`,
})
export class ArticlePage {}`,
    },
    {
      label: 'Solid',
      lang: 'tsx',
      code: `import { ScrollIndicator } from '@arclux/arc-ui-solid';

export default function Example() {
  return (
    <>
      <ScrollIndicator />
      <ScrollIndicator target="#my-panel" color="gradient" size="md" />
    </>
  );
}`,
    },
    {
      label: 'Preact',
      lang: 'tsx',
      code: `import { ScrollIndicator } from '@arclux/arc-ui-preact';

export default function Example() {
  return (
    <>
      <ScrollIndicator />
      <ScrollIndicator target="#my-panel" color="gradient" size="md" />
    </>
  );
}`,
    },
  ],

  seeAlso: ['progress', 'scroll-spy', 'scroll-area'],
};
