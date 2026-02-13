import type { ComponentDef } from './_types';

export const scrollToTop: ComponentDef = {
    name: 'Scroll To Top',
    slug: 'scroll-to-top',
    tag: 'arc-scroll-to-top',
    tier: 'navigation',
    interactivity: 'interactive',
    description: 'Floating button that appears after scrolling and smoothly returns the user to the top of the page.',

    overview: `ScrollToTop renders a fixed-position button that fades into view once the user scrolls past a configurable threshold (default 300px). Clicking it scrolls the page back to the top using the browser's native smooth scroll behavior. The component handles its own visibility state via a throttled passive scroll listener, so there is no setup required beyond placing the element in your page.

The button uses a circular design with a chevron-up icon, positioned in the bottom-right corner by default. Both the corner placement and the edge offset are configurable via the \`position\` and \`offset\` properties. The show/hide animation uses opacity and translateY for a subtle fade-and-slide effect that feels native.

Accessibility is built in: the button has \`aria-label="Scroll to top"\` and proper focus styles. The component also respects \`prefers-reduced-motion\` — when the user has opted out of motion, smooth scrolling is replaced with an instant jump and the CSS transition is disabled.`,

    features: [
      'Auto show/hide based on scroll position with configurable threshold',
      'Smooth scroll to top with prefers-reduced-motion fallback to instant',
      'Passive, throttled scroll listener for zero layout thrashing',
      'Configurable corner placement: bottom-right or bottom-left',
      'Configurable edge offset via CSS length values',
      'Circular button with chevron-up icon, fully token-styled',
      'Accessible: aria-label, focus-visible glow, keyboard operable',
    ],

    guidelines: {
      do: [
        'Place once at the page level, outside scrolling containers',
        'Use on long pages where scrolling back to the top is common',
        'Adjust the threshold for pages with different scroll depths',
        'Pair with ScrollSpy for complete scroll navigation',
      ],
      dont: [
        'Place inside a scrollable container — it listens to window scroll',
        'Add multiple ScrollToTop instances on the same page',
        'Set the threshold too low — the button should appear after meaningful scrolling',
        'Override the aria-label without providing an equivalent accessible name',
      ],
    },

    previewHtml: `<div style="display:flex;align-items:center;gap:var(--space-md)">
  <arc-callout variant="info">
    <strong>Live on this page.</strong> Scroll down to see the button appear in the bottom-right corner, then click it to return here.
  </arc-callout>
</div>
<arc-scroll-to-top threshold="200"></arc-scroll-to-top>`,

    props: [
      { name: 'threshold', type: 'number', default: '300', description: 'Scroll distance in pixels before the button becomes visible.' },
      { name: 'smooth', type: 'boolean', default: 'true', description: 'Use smooth scrolling animation. Falls back to instant when prefers-reduced-motion is set.' },
      { name: 'position', type: 'string', default: 'bottom-right', description: 'Corner placement: "bottom-right" or "bottom-left".' },
      { name: 'offset', type: 'string', default: 'var(--space-lg)', description: 'Distance from viewport edges. Accepts any CSS length value.' },
    ],
    events: [],
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
    <ScrollToTop></ScrollToTop>
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
  };
