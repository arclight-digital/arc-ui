import type { ComponentDef } from './_types';

export const floatBar: ComponentDef = {
    name: 'Float Bar',
    slug: 'float-bar',
    tag: 'arc-float-bar',
    tier: 'layout',
    interactivity: 'interactive',
    description: 'Viewport-bottom floating toolbar with surface-overlay background, backdrop blur, and spring easing. For bulk actions, unsaved-changes prompts.',

    overview: `Float Bar is a floating action bar that appears at the bottom (or top) of the viewport to present contextual actions in response to a user selection or state change. It slides into view with spring easing, overlaying page content with a surface-overlay background and backdrop blur that keeps it visually distinct without fully obscuring the page beneath.

The most common pattern is a bulk-action bar that appears when one or more items are selected in a data table or list: "3 items selected — Delete | Archive | Export." Float Bar also works well as an unsaved-changes prompt ("You have unsaved changes — Save | Discard") or a cookie consent banner. The bar fires arc-open and arc-close events so your application can track its visibility state.

Unlike Dock, which auto-hides and reveals on hover, Float Bar is explicitly controlled via the \`open\` prop — it appears in response to application state (e.g., items selected, form dirty) and disappears when the triggering condition resolves. This makes Float Bar the right choice for transient contextual toolbars, while Dock is better for persistent utility panels.`,

    features: [
      'Viewport-fixed floating bar with spring easing slide-in animation',
      'Surface-overlay background with backdrop-filter blur for visual layering',
      'Configurable position: bottom (default) or top of the viewport',
      'Controlled via `open` prop — appears in response to application state changes',
      'Fires arc-open and arc-close events for state synchronization',
      'Non-blocking overlay — does not lock body scroll or trap focus',
      'Rounded corners and subtle shadow for floating appearance',
      'CSS part: `bar` for targeted ::part() styling',
    ],

    guidelines: {
      do: [
        'Use for bulk-action bars that appear when items are selected in a table or list',
        'Use for unsaved-changes prompts at the bottom of forms',
        'Keep the content concise: a status message plus 2-3 action buttons',
        'Dismiss the Float Bar automatically when the triggering condition resolves (e.g., selection cleared)',
        'Combine with Button components for clear primary/secondary action hierarchy',
        'Use position="bottom" for most cases; position="top" for cookie/consent banners',
      ],
      dont: [
        'Do not use Float Bar for permanent toolbars — use Toolbar instead',
        'Do not put navigation links in a Float Bar — use Top Bar or Dock',
        'Do not leave the Float Bar open indefinitely — it should be transient and context-dependent',
        'Do not place complex forms or multi-step flows inside a Float Bar',
        'Do not show multiple Float Bars simultaneously at the same position',
        'Do not use as a toast replacement — Float Bar is for actions, Toast is for notifications',
      ],
    },

    previewHtml: `<div style="position:relative;width:100%;height:180px;border:1px solid var(--border-subtle);border-radius:var(--radius-md);overflow:hidden;background:var(--bg-surface)">
  <div style="padding:var(--space-md);text-align:center;color:var(--text-secondary);font-size:14px;font-family:var(--font-body)">
    Page content behind the float bar
  </div>
  <div style="position:absolute;bottom:var(--space-md);left:50%;transform:translateX(-50%);display:flex;align-items:center;gap:var(--space-md);padding:var(--space-sm) var(--space-lg);background:var(--bg-surface-overlay);backdrop-filter:blur(12px);border:1px solid var(--border-subtle);border-radius:var(--radius-lg);box-shadow:0 4px 24px rgba(0,0,0,0.12)">
    <span style="color:var(--text-secondary);font-size:14px;font-family:var(--font-body);white-space:nowrap">3 items selected</span>
    <arc-button variant="secondary" size="sm">Archive</arc-button>
    <arc-button variant="danger" size="sm">Delete</arc-button>
  </div>
</div>`,

    props: [
      { name: 'open', type: 'boolean', default: 'false', description: 'Controls visibility of the float bar. Set to true when a triggering condition is met (e.g., items selected, form dirty) and false when the condition resolves.' },
      { name: 'position', type: "'bottom' | 'top'", default: "'bottom'", description: 'Which edge of the viewport the float bar appears at. Bottom is standard for bulk-action bars; top works for consent banners or global alerts.' },
    ],
    events: [
      { name: 'arc-open', description: 'Fired when the float bar becomes visible after the open prop is set to true.' },
      { name: 'arc-close', description: 'Fired when the float bar hides after the open prop is set to false.' },
    ],

    tabs: [
      {
        label: 'Web Component',
        lang: 'html',
        code: `<arc-float-bar id="bulk-actions" position="bottom">
  <span>3 items selected</span>
  <arc-button variant="secondary" size="sm">Archive</arc-button>
  <arc-button variant="danger" size="sm">Delete</arc-button>
</arc-float-bar>

<script>
  const bar = document.querySelector('#bulk-actions');
  // Show when items are selected
  bar.open = true;
  bar.addEventListener('arc-close', () => console.log('Float bar hidden'));
</script>`,
      },
      {
        label: 'React',
        lang: 'tsx',
        code: `import { FloatBar, Button } from '@arclux/arc-ui-react';

function BulkActions({ selectedCount }: { selectedCount: number }) {
  return (
    <FloatBar open={selectedCount > 0} position="bottom">
      <span>{selectedCount} items selected</span>
      <Button variant="secondary" size="sm">Archive</Button>
      <Button variant="danger" size="sm">Delete</Button>
    </FloatBar>
  );
}`,
      },
      {
        label: 'Vue',
        lang: 'html',
        code: `<script setup>
import { ref } from 'vue';
import { FloatBar, Button } from '@arclux/arc-ui-vue';

const selectedCount = ref(3);
</script>

<template>
  <FloatBar :open="selectedCount > 0" position="bottom">
    <span>{{ selectedCount }} items selected</span>
    <Button variant="secondary" size="sm">Archive</Button>
    <Button variant="danger" size="sm">Delete</Button>
  </FloatBar>
</template>`,
      },
      {
        label: 'Svelte',
        lang: 'html',
        code: `<script>
  import { FloatBar, Button } from '@arclux/arc-ui-svelte';

  let selectedCount = $state(3);
</script>

<FloatBar open={selectedCount > 0} position="bottom">
  <span>{selectedCount} items selected</span>
  <Button variant="secondary" size="sm">Archive</Button>
  <Button variant="danger" size="sm">Delete</Button>
</FloatBar>`,
      },
      {
        label: 'Angular',
        lang: 'ts',
        code: `import { Component } from '@angular/core';
import { FloatBar, Button } from '@arclux/arc-ui-angular';

@Component({
  imports: [FloatBar, Button],
  template: \`
    <FloatBar [open]="selectedCount > 0" position="bottom">
      <span>{{ selectedCount }} items selected</span>
      <Button variant="secondary" size="sm">Archive</Button>
      <Button variant="danger" size="sm">Delete</Button>
    </FloatBar>
  \`,
})
export class BulkActionsComponent {
  selectedCount = 3;
}`,
      },
      {
        label: 'Solid',
        lang: 'tsx',
        code: `import { createSignal } from 'solid-js';
import { FloatBar, Button } from '@arclux/arc-ui-solid';

function BulkActions() {
  const [selectedCount] = createSignal(3);

  return (
    <FloatBar open={selectedCount() > 0} position="bottom">
      <span>{selectedCount()} items selected</span>
      <Button variant="secondary" size="sm">Archive</Button>
      <Button variant="danger" size="sm">Delete</Button>
    </FloatBar>
  );
}`,
      },
      {
        label: 'Preact',
        lang: 'tsx',
        code: `import { useState } from 'preact/hooks';
import { FloatBar, Button } from '@arclux/arc-ui-preact';

function BulkActions() {
  const [selectedCount] = useState(3);

  return (
    <FloatBar open={selectedCount > 0} position="bottom">
      <span>{selectedCount} items selected</span>
      <Button variant="secondary" size="sm">Archive</Button>
      <Button variant="danger" size="sm">Delete</Button>
    </FloatBar>
  );
}`,
      },
    ],

  seeAlso: ['toolbar', 'dock', 'status-bar'],
};
