import type { ComponentDef } from './_types';

export const loadingOverlay: ComponentDef = {
  name: 'Loading Overlay',
  slug: 'loading-overlay',
  tag: 'arc-loading-overlay',
  tier: 'feedback',
  interactivity: 'interactive',
  description:
    'Semi-transparent, blurred overlay that covers a container or the page, with a centered spinner and optional progress text.',

  overview: `Loading Overlay covers part of the page while something loads. It puts a semi-transparent, blurred layer over the content, with a large spinner in the middle and an optional \`message\` under it. Set \`active\` to show it.

By default the overlay uses \`position: absolute\` and covers its nearest positioned ancestor. With \`global\`, it's fixed to the viewport and covers the whole page. Use it for a region that can't be used until loading finishes. For a small inline indicator, use Spinner.

The spinner and message are a \`role="status"\` live region.

A contained overlay stops clicks reaching the content under it, but not the keyboard: Tab still reaches the covered controls. A \`global\` overlay is a modal \`<dialog>\`, so while it's active the browser makes the rest of the page inert: Tab, clicks and a screen reader's own navigation can't reach it, and focus returns to where it was when the overlay closes. Escape doesn't close it, and the page doesn't scroll while it's up.`,

  features: [
    'Fades in and out. With `prefers-reduced-motion`, it appears and disappears without the fade, and the blur stays',
  ],

  guidelines: {
    do: [
      'Set `position: relative` on the container you want covered',
      'Set a message that says what\'s happening, like "Saving changes..."',
      'Save `global` for operations that block the whole page, like an initial data load',
      "Remove the overlay as soon as loading finishes. Don't add a delay",
      "In contained mode, disable the covered controls yourself if keyboard users mustn't reach them",
    ],
    dont: [
      "Don't use it for background work that doesn't block the UI. Use Spinner",
      "Don't leave it up indefinitely. Handle errors and time out",
      "Don't stack several loading overlays on one page",
      "Don't use it when you know the content's layout in advance. Use Skeleton placeholders",
    ],
  },

  previewHtml: `<div style="width:100%;position:relative;min-height:160px;border:1px solid var(--border-default);border-radius:var(--radius-md);padding:var(--space-lg);background:var(--surface-raised)"><arc-loading-overlay active message="Loading data..."></arc-loading-overlay><p style="color:var(--text-secondary)">Content behind the loading overlay</p></div>`,

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
      <arc-loading-overlay [active]="loading" message="Loading data..."></arc-loading-overlay>
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
