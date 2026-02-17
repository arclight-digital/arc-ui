import type { ComponentDef } from './_types';

export const anchorNav: ComponentDef = {
  name: 'Anchor Nav',
  slug: 'anchor-nav',
  tag: 'arc-anchor-nav',
  tier: 'navigation',
  interactivity: 'interactive',
  description: 'Vertical or horizontal in-page link bar with active highlight. Active link gets accent-primary background pill or underline glow.',

  overview: `AnchorNav is an in-page navigation component that renders a list of section links in either a vertical column or horizontal row. The active link is highlighted with an accent-primary background pill (vertical) or underline glow (horizontal), giving users a clear sense of where they are within a long-scrolling page. It is the ideal companion for single-page documentation, landing pages with sectioned content, and settings screens with distinct panels.

The component manages its own selection state via the \`value\` prop and dispatches \`arc-change\` when the user clicks a link. For automatic scroll-position tracking, pair AnchorNav with ScrollSpy — the scroll spy updates the active value as the user scrolls, and AnchorNav reflects the change visually. This combination delivers a polished "table of contents" experience with minimal wiring.

AnchorNav supports both orientations out of the box. Vertical mode is best for sidebars and narrow rail positions, while horizontal mode works well as a sub-header beneath a TopBar. Both modes use smooth scroll behaviour when links are clicked, and all items are fully keyboard navigable with arrow keys and Enter activation.`,

  features: [
    'Vertical and horizontal orientations',
    'Accent-primary background pill (vertical) or underline glow (horizontal) on active link',
    'arc-change event on link selection',
    'Controlled value prop for external state management',
    'Smooth scroll to target section on click',
    'Keyboard navigation with arrow keys',
    'Pairs with ScrollSpy for automatic scroll tracking',
    'Token-driven theming via CSS custom properties',
  ],

  guidelines: {
    do: [
      'Pair with ScrollSpy for automatic active-link tracking on scroll',
      'Use vertical orientation in sidebars and horizontal under a TopBar',
      'Keep link labels short — two to four words that match section headings',
      'Ensure each link target has a matching ID on the page',
      'Place AnchorNav in a sticky container so it remains visible during scroll',
    ],
    dont: [
      'Use AnchorNav for multi-page navigation — use Sidebar or NavigationMenu instead',
      'Add more than eight to ten links — split long pages into separate routes instead',
      'Mix orientations on the same page',
      'Forget to set matching IDs on the sections the links point to',
      'Use AnchorNav without sticky positioning — it loses its wayfinding value if it scrolls away',
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

  props: [
    { name: 'orientation', type: "'vertical' | 'horizontal'", default: "'horizontal'", description: 'Layout direction. Vertical renders a column of links; horizontal renders a row.' },
    { name: 'value', type: 'string', default: "''", description: 'The value of the currently active link. Controls which item is highlighted.' },
    { name: 'items', type: 'Array<{ label: string, value: string }>', default: '[]', description: 'Declarative list of items to render. Each object needs a label (display text) and value (identifier). Alternative to slotting children.' },
  ],
  events: [
    { name: 'arc-change', description: 'Fired when a link is selected with detail: { value }.' },
  ],

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
    <AnchorNav
      orientation="vertical"
      value="overview"
      (arc-change)="onChange($event)"
    >
      <span value="overview">Overview</span>
      <span value="installation">Installation</span>
      <span value="theming">Theming</span>
      <span value="api">API Reference</span>
    </AnchorNav>
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
