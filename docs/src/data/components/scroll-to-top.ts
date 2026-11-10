import type { ComponentDef } from './_types';

export const scrollToTop: ComponentDef = {
  name: 'Scroll To Top',
  slug: 'scroll-to-top',
  tag: 'arc-scroll-to-top',
  tier: 'navigation',
  interactivity: 'interactive',
  description:
    "A floating button that shows up once you've scrolled down and takes you back to the top of the page.",

  overview: `ScrollToTop is a round, fixed-position button with an up chevron. It fades and slides in once the window has scrolled past \`threshold\` pixels (300 by default), and clicking it scrolls the window back to the top. It watches the window with its own passive scroll listener, throttled to one check per animation frame, so all you do is put the element on the page.

The button is labelled "Scroll to top". With \`prefers-reduced-motion\` set, the scroll is an instant jump and the fade has no transition.`,

  features: [
    'Sits in the bottom-right corner by default. `position="bottom-left"` moves it',
    '`offset` sets the distance from the edges and takes any CSS length',
  ],

  guidelines: {
    do: [
      'Put one at the page level, outside any scrolling container. It only listens to the window',
      'Raise or lower `threshold` to suit how long the page is',
      'Pair it with ScrollSpy on long docs pages',
    ],
    dont: [
      "Don't put more than one on a page",
      "Don't set `threshold` so low that the button shows up after a flick of the wheel",
    ],
  },

  previewHtml: `<div style="display:flex;align-items:center;gap:var(--space-md)">
  <arc-alert variant="info">
    <strong>Live on this page.</strong> Scroll down to see the button appear in the bottom-right corner, then click it to return here.
  </arc-alert>
</div>
<arc-scroll-to-top threshold="200"></arc-scroll-to-top>`,

  tabs: [
    {
      label: 'Web Component',
      lang: 'html',
      code: `<!-- Place once at the page level -->
<arc-scroll-to-top></arc-scroll-to-top>

<!-- Custom threshold and position -->
<arc-scroll-to-top threshold="500" position="bottom-left"></arc-scroll-to-top>`,
    },
    {
      label: 'React',
      lang: 'tsx',
      code: `import { ScrollToTop } from '@arclux/arc-ui-react';

export function Layout({ children }) {
  return (
    <>
      {children}
      <ScrollToTop threshold={400} />
    </>
  );
}`,
    },
    {
      label: 'Vue',
      lang: 'html',
      code: `<script setup>
import { ScrollToTop } from '@arclux/arc-ui-vue';
</script>

<template>
  <main>
    <slot />
  </main>
  <ScrollToTop />
</template>`,
    },
    {
      label: 'Svelte',
      lang: 'html',
      code: `<script>
  import { ScrollToTop } from '@arclux/arc-ui-svelte';
</script>

<main>
  <slot />
</main>
<ScrollToTop />`,
    },
    {
      label: 'Angular',
      lang: 'ts',
      code: `import { Component } from '@angular/core';
import { ScrollToTop } from '@arclux/arc-ui-angular';

@Component({
  imports: [ScrollToTop],
  template: \`
    <main>
      <ng-content></ng-content>
    </main>
    <arc-scroll-to-top></arc-scroll-to-top>
  \`,
})
export class LayoutComponent {}`,
    },
    {
      label: 'Solid',
      lang: 'tsx',
      code: `import { ScrollToTop } from '@arclux/arc-ui-solid';

export function Layout(props) {
  return (
    <>
      {props.children}
      <ScrollToTop />
    </>
  );
}`,
    },
    {
      label: 'Preact',
      lang: 'tsx',
      code: `import { ScrollToTop } from '@arclux/arc-ui-preact';

export function Layout({ children }) {
  return (
    <>
      {children}
      <ScrollToTop />
    </>
  );
}`,
    },
  ],

  seeAlso: ['scroll-spy', 'scroll-area'],
};
