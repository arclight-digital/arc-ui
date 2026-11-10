import type { ComponentDef } from './_types';

export const anchorNav: ComponentDef = {
  name: 'Anchor Nav',
  slug: 'anchor-nav',
  tag: 'arc-anchor-nav',
  tier: 'navigation',
  interactivity: 'interactive',
  description:
    'Links to the sections of one page, with the section in view highlighted.',

  overview: `AnchorNav is a table of contents for one long page: a row or column of links to its sections, with the section in view highlighted. Use it on pages with named sections, such as a docs page or a settings screen split into panels.

Each item's \`value\` is the \`id\` of the section it points to. Clicking an item scrolls smoothly to the section, and an IntersectionObserver moves the highlight as the reader scrolls, so you don't need ScrollSpy. Both set \`value\` and fire \`arc-change\`.

Pass items as the \`items\` array (\`{ label, value }\`) or as slotted children with a \`value\` attribute. Array items render as \`<button>\` elements, so Tab and Enter reach them. Slotted children stay the element you wrote, and a slotted \`<span>\` can't take focus. There are no arrow-key bindings.`,

  features: [
    '`arc-change` fires with `{ value }` on click and when scrolling changes the active section',
    'The active array item gets `aria-current="true"`',
    'The active link gets a tinted background in a vertical nav and an underline in a horizontal one',
  ],

  guidelines: {
    do: [
      'Use vertical orientation in sidebars and horizontal under a TopBar',
      'Keep link labels to two to four words that match the section headings',
      'Give every section an `id` that matches its item\'s value',
      'Put AnchorNav in a sticky container so it stays visible while the page scrolls',
      'Use the `items` array when keyboard users need to reach the links',
    ],
    dont: [
      'Don\'t use it to link between pages. Use Sidebar or NavigationMenu',
      'Don\'t add more than eight to ten links. Split a page that long into separate routes',
      'Don\'t mix orientations on the same page',
    ],
  },

  previewHtml: `<div style="width:100%;max-width:220px;padding:var(--space-lg);background:var(--bg-surface);border:1px solid var(--border-subtle);border-radius:var(--radius-md)">
  <arc-anchor-nav orientation="vertical" value="theming">
    <span value="overview">Overview</span>
    <span value="installation">Installation</span>
    <span value="theming">Theming</span>
    <span value="api">API reference</span>
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
