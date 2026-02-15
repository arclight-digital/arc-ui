import type { ComponentDef } from './_types';

export const pageIndicator: ComponentDef = {
  name: 'Page Indicator',
  slug: 'page-indicator',
  tag: 'arc-page-indicator',
  tier: 'navigation',
  interactivity: 'interactive',
  description: 'Dot-based position indicator for page-level navigation or onboarding flows. Active dot fills with accent-primary and scales up.',

  overview: `PageIndicator renders a horizontal row of dots that communicate the user's position within a paged sequence — carousels, onboarding flows, slideshow presentations, or any content split into discrete steps. The active dot fills with accent-primary and scales up slightly, providing an immediate visual cue for the current position without requiring labels or numbers.

The component supports both passive and interactive modes. In passive mode (\`clickable\` is false), the dots serve as read-only indicators driven by an external controller like a Carousel or swipe gesture handler. In interactive mode (\`clickable\` is true), each dot becomes a tap target that dispatches \`arc-change\` with the selected index, letting users jump directly to any page.

PageIndicator is intentionally minimal — it handles position communication and optional direct navigation while leaving content transitions to the parent component. Pair it with Carousel for image galleries, StepperNav for wizard flows, or your own custom swipe container. The \`count\` prop sets the total number of dots and \`value\` controls which one is active, making it straightforward to synchronise with any paging state.`,

  features: [
    'Horizontal dot row for position indication',
    'Active dot fills with accent-primary and scales up',
    'Passive (read-only) and interactive (clickable) modes',
    'arc-change event when a dot is clicked in interactive mode',
    'Controlled count and value props for external synchronisation',
    'Compact footprint suitable for overlay positioning',
    'Keyboard accessible in clickable mode with arrow keys',
    'Token-driven theming via CSS custom properties',
  ],

  guidelines: {
    do: [
      'Use PageIndicator alongside a Carousel or swipe container for visual context',
      'Enable clickable mode when users should be able to jump to any page directly',
      'Keep the count reasonable — five to seven dots maximum for quick scanning',
      'Position the indicator below or overlaid on the paged content',
      'Synchronise the value prop with the parent component\'s active page state',
    ],
    dont: [
      'Use PageIndicator for progress — use Progress or Stepper instead',
      'Display more than ten dots — the pattern breaks down at high counts',
      'Use PageIndicator without a corresponding paged content area',
      'Rely on PageIndicator as the only navigation mechanism — pair with swipe or buttons',
      'Place multiple PageIndicators for the same content sequence',
    ],
  },

  previewHtml: `<div style="width:100%;max-width:300px;padding:var(--space-lg);background:var(--bg-surface);border:1px solid var(--border-subtle);border-radius:var(--radius-md);display:flex;justify-content:center">
  <arc-page-indicator count="5" value="2" clickable></arc-page-indicator>
</div>`,

  props: [
    { name: 'count', type: 'number', default: '3', description: 'Total number of dots to display.' },
    { name: 'value', type: 'number', default: '0', description: 'Zero-based index of the active dot.' },
    { name: 'clickable', type: 'boolean', default: 'false', description: 'When true, dots become interactive tap targets that dispatch arc-change on click.' },
  ],
  events: [
    { name: 'arc-change', description: 'Fired when a dot is clicked (clickable mode only) with detail: { value }.' },
  ],

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
    <PageIndicator
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
