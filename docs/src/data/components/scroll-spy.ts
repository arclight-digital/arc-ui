import type { ComponentDef } from './_types';

export const scrollSpy: ComponentDef = {
  name: 'Scroll Spy',
  slug: 'scroll-spy',
  tag: 'arc-scroll-spy',
  tier: 'navigation',
  interactivity: 'interactive',
  description: 'An "On this page" table of contents that highlights the section you\'re reading.',

  overview: `ScrollSpy builds a table of contents from \`<arc-spy-link>\` children and marks the entry for the section you're reading. Put it in a sticky sidebar or aside next to long content. Each link's \`target\` is the \`id\` of a section, and its text is the label. ScrollSpy hides the links you write and renders its own list under an "On this page" heading. Clicking the heading scrolls back to the top.

The current section is the last one whose top has scrolled past \`offset\` pixels from the top of the viewport (80 by default). Raise \`offset\` to clear a taller sticky header. When the page reaches the bottom, the last section counts as current even if it's too short to reach that line. ScrollSpy listens for scroll events on the whole document in the capture phase, so sections inside a scrolling container are tracked as well as ones in the window.

The current link gets \`aria-current="location"\` and the accent background, and the component fires \`arc-change\` with \`{ value }\` set to the section id when scrolling changes the current section. Clicking a link marks it current without firing \`arc-change\`, scrolls its section into view, smoothly unless the reader has asked for reduced motion, and writes \`#id\` to the URL with \`history.replaceState\`.`,

  features: [
    '`level` on a spy link indents it and sets it in a smaller font, for nested headings',
    'A link whose `target` matches no element on the page still shows in the list but is never marked current',
  ],

  guidelines: {
    do: [
      "Give every section a unique `id` that matches a spy link's `target`",
      'Set `offset` to the height of your sticky header or TopBar',
      'Listen for `arc-change` to follow the section being read as the reader scrolls',
      'Keep link labels short, matching or abbreviating the section headings',
    ],
    dont: [
      "Don't use it for site navigation. It only tracks sections on the current page",
      "Don't forget to import `arc-spy-link`. ScrollSpy reads its links from it",
      "Don't give it more than 10 to 12 links. A longer list is hard to scan",
    ],
  },

  previewHtml: `<div style="width:100%;border:1px solid var(--border-subtle);border-radius:var(--radius-md);overflow:hidden;background:var(--bg-surface);padding:var(--space-lg)">
  <arc-scroll-spy>
    <arc-spy-link target="overview">Overview</arc-spy-link>
    <arc-spy-link target="installation">Installation</arc-spy-link>
    <arc-spy-link target="usage">Usage</arc-spy-link>
    <arc-spy-link target="api-reference">API reference</arc-spy-link>
    <arc-spy-link target="examples">Examples</arc-spy-link>
  </arc-scroll-spy>
</div>`,

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

export default function Example() {
  return (
    <ScrollSpy>
      <SpyLink target="section-1">Section 1</SpyLink>
      <SpyLink target="section-2">Section 2</SpyLink>
    </ScrollSpy>
  );
}`,
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
    <arc-scroll-spy>
      <arc-spy-link target="section-1">Section 1</arc-spy-link>
      <arc-spy-link target="section-2">Section 2</arc-spy-link>
    </arc-scroll-spy>
  \`,
})
export class MyComponent {}`,
    },
    {
      label: 'Solid',
      lang: 'tsx',
      code: `import { ScrollSpy, SpyLink } from '@arclux/arc-ui-solid';

export default function Example() {
  return (
    <ScrollSpy>
      <SpyLink target="section-1">Section 1</SpyLink>
      <SpyLink target="section-2">Section 2</SpyLink>
    </ScrollSpy>
  );
}`,
    },
    {
      label: 'Preact',
      lang: 'tsx',
      code: `import { ScrollSpy, SpyLink } from '@arclux/arc-ui-preact';

export default function Example() {
  return (
    <ScrollSpy>
      <SpyLink target="section-1">Section 1</SpyLink>
      <SpyLink target="section-2">Section 2</SpyLink>
    </ScrollSpy>
  );
}`,
    },
  ],
  subComponents: [
    {
      name: 'SpyLink',
      tag: 'arc-spy-link',
      description:
        'One entry in a ScrollSpy. `target` names the section id, `level` sets the indent, and the text is the label.',
    },
  ],

  seeAlso: ['scroll-to-top', 'tabs', 'navigation-menu'],
};
