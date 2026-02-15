import type { ComponentDef } from './_types';

export const loadingOverlay: ComponentDef = {
    name: 'Loading Overlay',
    slug: 'loading-overlay',
    tag: 'arc-loading-overlay',
    tier: 'feedback',
    interactivity: 'interactive',
    description: 'Semi-transparent surface-overlay with backdrop blur covering a container or page. Centers a spinner with optional progress text.',

    overview: `Loading Overlay provides a blocking loading state for containers or the entire page. It renders a semi-transparent surface-overlay with backdrop blur that covers its parent element (or the full viewport in global mode), centering a spinner with an optional progress message.

Use loading-overlay when a section of the UI is temporarily unavailable — fetching data, processing a submission, or waiting for an external service. Unlike spinner (which is a small inline indicator), loading-overlay communicates that the entire region is blocked and prevents user interaction until loading completes.

In container mode, the overlay is positioned absolutely within its parent and covers only that element. In global mode, it uses fixed positioning to cover the entire viewport, blocking all interaction across the page. The overlay includes a focus trap in global mode to prevent keyboard users from tabbing behind it.`,

    features: [
      'Semi-transparent overlay with backdrop blur effect',
      'Centered spinner with configurable progress message',
      'Container mode — covers the parent element with position: absolute',
      'Global mode — covers the full viewport with position: fixed and focus trap',
      'Prevents pointer events and keyboard interaction behind the overlay',
      'Smooth fade-in and fade-out transitions',
      'Accessible — aria-busy="true" on the overlay container',
      'Respects prefers-reduced-motion — disables blur and fade when set',
      'Composable — uses spinner internally',
    ],

    guidelines: {
      do: [
        'Use loading-overlay for operations that block the entire container or page',
        'Provide a descriptive message like "Saving changes..." to set user expectations',
        'Use global mode sparingly — only for full-page blocking operations like initial data load',
        'Remove the overlay immediately when loading completes — avoid artificial delays',
        'Set the parent container to position: relative when using container mode',
      ],
      dont: [
        'Use loading-overlay for background operations that don\'t block the UI — use spinner instead',
        'Leave the overlay active indefinitely — always include error handling and timeouts',
        'Stack multiple loading overlays on the same page',
        'Use loading-overlay when the content shape is known — prefer skeleton placeholders',
        'Use global mode for section-level loading — it blocks the entire application unnecessarily',
      ],
    },

    previewHtml: `<div style="width:100%;position:relative;min-height:160px;border:1px solid var(--border-default);border-radius:var(--radius-md);padding:var(--space-lg);background:var(--surface-raised)"><arc-loading-overlay active message="Loading data..."></arc-loading-overlay><p style="color:var(--text-secondary)">Content behind the loading overlay</p></div>`,

    props: [
      {
        name: 'active',
        type: 'boolean',
        default: 'false',
        description: 'Controls whether the loading overlay is visible. When true, the overlay fades in and blocks interaction with the content behind it.',
      },
      {
        name: 'message',
        type: 'string',
        default: "''",
        description: 'Optional text displayed below the spinner. Use it to communicate what is loading or the current progress step.',
      },
      {
        name: 'global',
        type: 'boolean',
        default: 'false',
        description: 'When true, the overlay uses fixed positioning to cover the entire viewport instead of just its parent container. Includes a focus trap in this mode.',
      },
    ],
    events: [],

    tabs: [
      {
        label: 'Web Component',
        lang: 'html',
        code: `<!-- Container mode -->
<div style="position: relative; min-height: 200px;">
  <arc-loading-overlay active message="Loading data..."></arc-loading-overlay>
  <p>Content behind the overlay</p>
</div>

<!-- Global mode -->
<arc-loading-overlay active global message="Please wait..."></arc-loading-overlay>`,
      },
      {
        label: 'React',
        lang: 'tsx',
        code: `import { LoadingOverlay } from '@arclux/arc-ui-react';

export function LoadingDemo() {
  const [loading, setLoading] = useState(true);

  return (
    <div style={{ position: 'relative', minHeight: 200 }}>
      <LoadingOverlay active={loading} message="Loading data..." />
      <p>Content behind the overlay</p>
    </div>
  );
}`,
      },
      {
        label: 'Vue',
        lang: 'html',
        code: `<script setup>
import { ref } from 'vue';
import { LoadingOverlay } from '@arclux/arc-ui-vue';

const loading = ref(true);
</script>

<template>
  <div style="position: relative; min-height: 200px;">
    <LoadingOverlay :active="loading" message="Loading data..." />
    <p>Content behind the overlay</p>
  </div>
</template>`,
      },
      {
        label: 'Svelte',
        lang: 'html',
        code: `<script>
  import { LoadingOverlay } from '@arclux/arc-ui-svelte';

  let loading = true;
</script>

<div style="position: relative; min-height: 200px;">
  <LoadingOverlay active={loading} message="Loading data..." />
  <p>Content behind the overlay</p>
</div>`,
      },
      {
        label: 'Angular',
        lang: 'ts',
        code: `import { Component } from '@angular/core';
import { LoadingOverlay } from '@arclux/arc-ui-angular';

@Component({
  imports: [LoadingOverlay],
  template: \`
    <div style="position: relative; min-height: 200px;">
      <LoadingOverlay [active]="loading" message="Loading data..."></LoadingOverlay>
      <p>Content behind the overlay</p>
    </div>
  \`,
})
export class LoadingDemoComponent {
  loading = true;
}`,
      },
      {
        label: 'Solid',
        lang: 'tsx',
        code: `import { LoadingOverlay } from '@arclux/arc-ui-solid';
import { createSignal } from 'solid-js';

export function LoadingDemo() {
  const [loading, setLoading] = createSignal(true);

  return (
    <div style={{ position: 'relative', 'min-height': '200px' }}>
      <LoadingOverlay active={loading()} message="Loading data..." />
      <p>Content behind the overlay</p>
    </div>
  );
}`,
      },
      {
        label: 'Preact',
        lang: 'tsx',
        code: `import { LoadingOverlay } from '@arclux/arc-ui-preact';
import { useState } from 'preact/hooks';

export function LoadingDemo() {
  const [loading, setLoading] = useState(true);

  return (
    <div style={{ position: 'relative', minHeight: 200 }}>
      <LoadingOverlay active={loading} message="Loading data..." />
      <p>Content behind the overlay</p>
    </div>
  );
}`,
      },
    ],

    seeAlso: ['spinner', 'progress', 'skeleton'],
};
