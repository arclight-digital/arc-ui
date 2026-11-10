import type { ComponentDef } from './_types';

export const pageIndicator: ComponentDef = {
  name: 'Page Indicator',
  slug: 'page-indicator',
  tag: 'arc-page-indicator',
  tier: 'navigation',
  interactivity: 'interactive',
  description:
    'A row of dots showing which page of a sequence is active. The active dot fills with accent-primary and grows from 8px to 10px.',

  overview: `PageIndicator draws one dot per page and marks the active one. Use it under a carousel, an onboarding flow or a slideshow. It shows position only: it doesn't page content itself, so the parent component owns the transitions. \`count\` sets the number of dots and \`value\` sets the active one (zero-based).

By default the dots are read-only and something else, such as a Carousel or your own swipe handler, sets \`value\`. With \`clickable\`, each dot is a button that sets \`value\` and fires \`arc-change\` with the new index, so readers can jump to any page.`,

  features: [
    'Each dot is a `<button>` labelled "Page 1", "Page 2" and so on. Without `clickable` the buttons are disabled and out of the tab order',
    'Clickable dots are reached with Tab. There are no arrow-key shortcuts',
    'Parts: `base`, `dot`',
  ],

  guidelines: {
    do: [
      'Set `clickable` when readers should be able to jump straight to a page',
      'Keep it to seven dots or fewer',
      'Place it below or over the content it pages',
      'Update `value` whenever the parent\'s active page changes',
    ],
    dont: [
      'Don\'t use it to show progress through a task. Use Progress or Stepper',
      'Don\'t make it the only way to change pages. Pair it with swipe or previous and next buttons',
    ],
  },

  previewHtml: `<div style="width:100%;max-width:300px;padding:var(--space-lg);background:var(--bg-surface);border:1px solid var(--border-subtle);border-radius:var(--radius-md);display:flex;justify-content:center">
  <arc-page-indicator count="5" value="2" clickable></arc-page-indicator>
</div>`,

  tabs: [
    {
      label: 'Web Component',
      lang: 'html',
      code: `<script type="module" src="@arclux/arc-ui"></script>

<arc-page-indicator count="5" value="2" clickable id="dots"></arc-page-indicator>

<script>
  document.querySelector('#dots').addEventListener('arc-change', (e) => {
    console.log('page:', e.detail.value);
  });
</script>`,
    },
    {
      label: 'React',
      lang: 'tsx',
      code: `import { useState } from 'react';
import { PageIndicator } from '@arclux/arc-ui-react';

export function Gallery() {
  const [page, setPage] = useState(0);

  return (
    <PageIndicator
      count={5}
      value={page}
      clickable
      onArcChange={(e) => setPage(e.detail.value)}
    />
  );
}`,
    },
    {
      label: 'Vue',
      lang: 'html',
      code: `<script setup>
import { ref } from 'vue';
import { PageIndicator } from '@arclux/arc-ui-vue';

const page = ref(0);

function onChange(e) {
  page.value = e.detail.value;
}
</script>

<template>
  <PageIndicator :count="5" :value="page" clickable @arc-change="onChange" />
</template>`,
    },
    {
      label: 'Svelte',
      lang: 'html',
      code: `<script>
  import { PageIndicator } from '@arclux/arc-ui-svelte';

  let page = 0;
</script>

<PageIndicator
  count={5}
  value={page}
  clickable
  on:arc-change={(e) => (page = e.detail.value)}
/>`,
    },
    {
      label: 'Angular',
      lang: 'ts',
      code: `import { Component } from '@angular/core';
import { PageIndicator } from '@arclux/arc-ui-angular';

@Component({
  imports: [PageIndicator],
  template: \`
    <arc-page-indicator
      [count]="5"
      [value]="page"
      clickable
      (arc-change)="onChange($event)"
    />
  \`,
})
export class GalleryComponent {
  page = 0;

  onChange(e: CustomEvent) {
    this.page = e.detail.value;
  }
}`,
    },
    {
      label: 'Solid',
      lang: 'tsx',
      code: `import { createSignal } from 'solid-js';
import { PageIndicator } from '@arclux/arc-ui-solid';

export function Gallery() {
  const [page, setPage] = createSignal(0);

  return (
    <PageIndicator
      count={5}
      value={page()}
      clickable
      onArcChange={(e) => setPage(e.detail.value)}
    />
  );
}`,
    },
    {
      label: 'Preact',
      lang: 'tsx',
      code: `import { useState } from 'preact/hooks';
import { PageIndicator } from '@arclux/arc-ui-preact';

export function Gallery() {
  const [page, setPage] = useState(0);

  return (
    <PageIndicator
      count={5}
      value={page}
      clickable
      onArcChange={(e) => setPage(e.detail.value)}
    />
  );
}`,
    },
  ],

  seeAlso: ['carousel', 'stepper', 'tabs'],
};
