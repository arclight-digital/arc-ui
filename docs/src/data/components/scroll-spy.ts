import type { ComponentDef } from './_types';

export const scrollSpy: ComponentDef = {
    name: 'Scroll Spy',
    slug: 'scroll-spy',
    tag: 'arc-scroll-spy',
    tier: 'navigation',
    interactivity: 'interactive',
    description: 'Tracks scroll position and highlights the active navigation link.',

    overview: `ScrollSpy is a sticky table-of-contents component that watches the viewport and highlights whichever navigation link corresponds to the currently visible section. It uses an IntersectionObserver under the hood, so tracking is efficient and does not block the main thread even on long pages with dozens of sections. Place it in a sidebar column next to your content and it handles the rest.

Each entry in the table of contents is declared with an \`<arc-spy-link>\` child element whose \`target\` attribute matches the \`id\` of a section on the page. ScrollSpy reads these declarative links from its slot, builds the IntersectionObserver, and renders a compact navigation list in its shadow DOM with an "On this page" heading. When the user scrolls a target section into view, the corresponding link receives an \`aria-current="true"\` attribute and a blue accent background highlight.

Clicking a link triggers a smooth scroll to the target element and immediately updates the active state. The component dispatches an \`arc-change\` custom event with the active section ID whenever the highlighted link changes, so you can synchronize other UI (like a progress bar or breadcrumb) with the current reading position. The \`offset\` prop lets you fine-tune the scroll detection threshold to account for sticky headers of varying heights.`,

    features: [
      'IntersectionObserver-based scroll tracking with zero scroll-event overhead',
      'Declarative link registration via <arc-spy-link target="id"> children',
      'Sticky positioning with automatic height capping to prevent overflow',
      'Smooth-scroll click navigation to target sections',
      'Active link highlighting with accent-primary background and aria-current="true"',
      'Configurable offset prop to account for sticky headers of varying heights',
      'arc-change custom event dispatched when the active section changes',
      'Thin scrollbar styling for long tables of contents',
    ],

    guidelines: {
      do: [
        'Place ScrollSpy in a sidebar-right or sticky aside column next to the scrollable content',
        'Give every target section a unique id attribute that matches the spy-link target',
        'Set the offset prop to match the height of your sticky header or TopBar',
        'Listen for the arc-change event to synchronize breadcrumbs, analytics, or URL hash updates',
        'Keep spy-link labels short -- they should match or abbreviate section headings',
      ],
      dont: [
        'Use ScrollSpy for primary site navigation -- it is for in-page section tracking only',
        'Forget to import arc-spy-link; ScrollSpy depends on it to collect its link definitions',
        'Place ScrollSpy inside a scrollable container other than the document -- the observer watches document-level intersections',
        'Add dozens of spy-links to a single ScrollSpy; more than 10-12 links make the list hard to scan',
        'Omit the target attribute on spy-links -- they will be silently ignored by the observer',
      ],
    },

    previewHtml: `<div style="width:100%;border:1px solid var(--border-subtle);border-radius:var(--radius-md);overflow:hidden;background:var(--bg-surface);padding:var(--space-lg)">
  <arc-scroll-spy>
    <arc-spy-link target="overview">Overview</arc-spy-link>
    <arc-spy-link target="installation">Installation</arc-spy-link>
    <arc-spy-link target="usage">Usage</arc-spy-link>
    <arc-spy-link target="api-reference">API Reference</arc-spy-link>
    <arc-spy-link target="examples">Examples</arc-spy-link>
  </arc-scroll-spy>
</div>`,

    props: [
      { name: 'active', type: 'string', default: "''", description: 'The id of the currently active section. Reflects to an attribute and updates automatically as the user scrolls.' },
      { name: 'offset', type: 'number', default: '80', description: 'Pixel offset from the top of the viewport used in the IntersectionObserver rootMargin. Increase this value to account for taller sticky headers.' },
    ],
    events: [
      { name: 'arc-change', description: 'Fired when the active spy target changes during scroll' },
    ],
    tabs: [
      {
        label: 'Web Component',
        lang: 'html',
        code: `<arc-scroll-spy>
  <arc-spy-link target="section-1">Section 1</arc-spy-link>
  <arc-spy-link target="section-2">Section 2</arc-spy-link>
</arc-scroll-spy>`,
      },
      {
        label: 'React',
        lang: 'tsx',
        code: `import { ScrollSpy, SpyLink } from '@arclux/arc-ui-react';

<ScrollSpy>
  <SpyLink target="section-1">Section 1</SpyLink>
  <SpyLink target="section-2">Section 2</SpyLink>
</ScrollSpy>`,
      },
      {
        label: 'Vue',
        lang: 'html',
        code: `<script setup>
import { ScrollSpy, SpyLink } from '@arclux/arc-ui-vue';
</script>

<template>
  <ScrollSpy>
    <SpyLink target="section-1">Section 1</SpyLink>
    <SpyLink target="section-2">Section 2</SpyLink>
  </ScrollSpy>
</template>`,
      },
      {
        label: 'Svelte',
        lang: 'html',
        code: `<script>
  import { ScrollSpy, SpyLink } from '@arclux/arc-ui-svelte';
</script>

<ScrollSpy>
  <SpyLink target="section-1">Section 1</SpyLink>
  <SpyLink target="section-2">Section 2</SpyLink>
</ScrollSpy>`,
      },
      {
        label: 'Angular',
        lang: 'ts',
        code: `import { Component } from '@angular/core';
import { ScrollSpy, SpyLink } from '@arclux/arc-ui-angular';

@Component({
  imports: [ScrollSpy, SpyLink],
  template: \`
    <ScrollSpy>
      <SpyLink target="section-1">Section 1</SpyLink>
      <SpyLink target="section-2">Section 2</SpyLink>
    </ScrollSpy>
  \`,
})
export class MyComponent {}`,
      },
      {
        label: 'Solid',
        lang: 'tsx',
        code: `import { ScrollSpy, SpyLink } from '@arclux/arc-ui-solid';

<ScrollSpy>
  <SpyLink target="section-1">Section 1</SpyLink>
  <SpyLink target="section-2">Section 2</SpyLink>
</ScrollSpy>`,
      },
      {
        label: 'Preact',
        lang: 'tsx',
        code: `import { ScrollSpy, SpyLink } from '@arclux/arc-ui-preact';

<ScrollSpy>
  <SpyLink target="section-1">Section 1</SpyLink>
  <SpyLink target="section-2">Section 2</SpyLink>
</ScrollSpy>`,
      },
    ],
    subComponents: [
      {
        name: 'SpyLink',
        tag: 'arc-spy-link',
        description: 'Navigation anchor that highlights when its target section is in view.',
        props: [
          { name: 'target', type: 'string', description: 'ID of the section to observe' },
        ],
      },
    ],
  };
