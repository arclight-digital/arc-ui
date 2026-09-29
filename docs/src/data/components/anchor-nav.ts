import type { ComponentDef } from './_types';

export const anchorNav: ComponentDef = {
  name: 'Anchor Nav',
  slug: 'anchor-nav',
  tag: 'arc-anchor-nav',
  tier: 'navigation',
  interactivity: 'interactive',
  description:
    'Vertical or horizontal in-page link bar. The active link gets an accent-primary background pill or an underline glow.',

  overview: `AnchorNav is an in-page navigation component that renders a list of section links in either a vertical column or horizontal row. The active link is highlighted with an accent-primary background pill (vertical) or underline glow (horizontal), so users can see where they are in a long-scrolling page. It suits single-page documentation, landing pages with sections, and settings screens with distinct panels.

The component manages its own selection state via the \`value\` prop and dispatches \`arc-change\` when the user clicks a link. For automatic scroll-position tracking, pair AnchorNav with ScrollSpy. The scroll spy updates the active value as the user scrolls, and AnchorNav reflects the change, which gives you a "table of contents" with minimal wiring.

AnchorNav supports both orientations. Vertical mode is best for sidebars and narrow rails, and horizontal mode works as a sub-header beneath a TopBar. Both modes scroll smoothly when a link is clicked, and all items are keyboard navigable with arrow keys and Enter.`,

  features: [
    'Vertical and horizontal orientations',
    'Accent-primary background pill (vertical) or underline glow (horizontal) on active link',
    '`arc-change` event on link selection',
    'Controlled value prop for external state management',
    'Smooth scroll to the target section on click',
    'Keyboard navigation with arrow keys',
    'Pairs with ScrollSpy for automatic scroll tracking',
    'Token-driven theming via CSS custom properties',
  ],

  guidelines: {
    do: [
      'Pair with ScrollSpy for automatic active-link tracking on scroll',
      'Use vertical orientation in sidebars and horizontal under a TopBar',
      'Keep link labels short: two to four words that match section headings',
      'Ensure each link target has a matching ID on the page',
      'Place AnchorNav in a sticky container so it remains visible during scroll',
    ],
    dont: [
      'Do not use AnchorNav for multi-page navigation. Use Sidebar or NavigationMenu instead',
      'Do not add more than eight to ten links. Split long pages into separate routes instead',
      'Do not mix orientations on the same page',
      'Do not forget to set matching IDs on the sections the links point to',
      'Do not use AnchorNav without sticky positioning; it loses its wayfinding value if it scrolls away',
    ],
  },

  previewHtml: `<div style="width:100%;max-width:220px;padding:var(--space-lg);background:var(--bg-surface);border:1px solid var(--border-subtle);border-radius:var(--radius-md)">
  <arc-anchor-nav orientation="vertical" value="theming">
    <span value="overview">Overview</span>
    <span value="installation">Installation</span>
    <span value="theming">Theming</span>
    <span value="api">API Reference</span>
  </arc-anchor-nav>
</div>`,

  tabs: [
    {
      label: 'Web Component',
      lang: 'html',
      code: `<script type="module" src="@arclux/arc-ui"></script>

<arc-anchor-nav orientation="vertical" value="overview" id="toc">
  <span value="overview">Overview</span>
  <span value="installation">Installation</span>
  <span value="theming">Theming</span>
  <span value="api">API Reference</span>
</arc-anchor-nav>

<script>
  document.querySelector('#toc').addEventListener('arc-change', (e) => {
    console.log('active section:', e.detail.value);
  });
</script>`,
    },
    {
      label: 'React',
      lang: 'tsx',
      code: `import { AnchorNav } from '@arclux/arc-ui-react';

export function TableOfContents() {
  return (
    <AnchorNav
      orientation="vertical"
      value="overview"
      onArcChange={(e) => console.log('active:', e.detail.value)}
    >
      <span value="overview">Overview</span>
      <span value="installation">Installation</span>
      <span value="theming">Theming</span>
      <span value="api">API Reference</span>
    </AnchorNav>
  );
}`,
    },
    {
      label: 'Vue',
      lang: 'html',
      code: `<script setup>
import { AnchorNav } from '@arclux/arc-ui-vue';

function onChange(e) {
  console.log('active:', e.detail.value);
}
</script>

<template>
  <AnchorNav orientation="vertical" value="overview" @arc-change="onChange">
    <span value="overview">Overview</span>
    <span value="installation">Installation</span>
    <span value="theming">Theming</span>
    <span value="api">API Reference</span>
  </AnchorNav>
</template>`,
    },
    {
      label: 'Svelte',
      lang: 'html',
      code: `<script>
  import { AnchorNav } from '@arclux/arc-ui-svelte';
</script>

<AnchorNav
  orientation="vertical"
  value="overview"
  on:arc-change={(e) => console.log('active:', e.detail.value)}
>
  <span value="overview">Overview</span>
  <span value="installation">Installation</span>
  <span value="theming">Theming</span>
  <span value="api">API Reference</span>
</AnchorNav>`,
    },
    {
      label: 'Angular',
      lang: 'ts',
      code: `import { Component } from '@angular/core';
import { AnchorNav } from '@arclux/arc-ui-angular';

@Component({
  imports: [AnchorNav],
  template: \`
    <arc-anchor-nav
      orientation="vertical"
      value="overview"
      (arc-change)="onChange($event)"
    >
      <span value="overview">Overview</span>
      <span value="installation">Installation</span>
      <span value="theming">Theming</span>
      <span value="api">API Reference</span>
    </arc-anchor-nav>
  \`,
})
export class TableOfContentsComponent {
  onChange(e: CustomEvent) {
    console.log('active:', e.detail.value);
  }
}`,
    },
    {
      label: 'Solid',
      lang: 'tsx',
      code: `import { AnchorNav } from '@arclux/arc-ui-solid';

export function TableOfContents() {
  return (
    <AnchorNav
      orientation="vertical"
      value="overview"
      onArcChange={(e) => console.log('active:', e.detail.value)}
    >
      <span value="overview">Overview</span>
      <span value="installation">Installation</span>
      <span value="theming">Theming</span>
      <span value="api">API Reference</span>
    </AnchorNav>
  );
}`,
    },
    {
      label: 'Preact',
      lang: 'tsx',
      code: `import { AnchorNav } from '@arclux/arc-ui-preact';

export function TableOfContents() {
  return (
    <AnchorNav
      orientation="vertical"
      value="overview"
      onArcChange={(e) => console.log('active:', e.detail.value)}
    >
      <span value="overview">Overview</span>
      <span value="installation">Installation</span>
      <span value="theming">Theming</span>
      <span value="api">API Reference</span>
    </AnchorNav>
  );
}`,
    },
  ],

  seeAlso: ['scroll-spy', 'sidebar', 'tabs'],
};
