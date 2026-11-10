import type { ComponentDef } from './_types';

export const floatBar: ComponentDef = {
  name: 'Float Bar',
  slug: 'float-bar',
  tag: 'arc-float-bar',
  tier: 'layout',
  interactivity: 'interactive',
  description:
    'Floating toolbar fixed to the bottom of the viewport, with a blurred overlay background. For bulk actions and unsaved-changes prompts.',

  overview: `FloatBar is a toolbar fixed near the bottom of the viewport, or the top with \`position="top"\`, that holds actions for whatever the user is doing right now. It's centered, on the \`--surface-overlay\` background with a 12px backdrop blur. Setting \`open\` slides it in from its edge, and clearing it slides it back out. \`arc-open\` and \`arc-close\` fire on each change.

The usual case is a bulk-action bar that shows while rows in a table or list are selected: "3 items selected" with Archive and Delete. It also suits an unsaved-changes prompt with Save and Discard. Show it from your application state, such as a selection or a dirty form, and hide it when that state clears.

It doesn't block the page: there's no backdrop, no scroll lock and no focus trap. For a bar that's always there, use Toolbar, and for a panel the user opens and closes, use Drawer.`,

  features: ['Slides and fades with the `--ease-out-expo` easing', 'CSS part: `bar`'],

  guidelines: {
    do: [
      'Keep it short: a status message and two or three buttons',
      'Close it as soon as the reason for it goes away, for example when the selection is cleared',
      'Use the default bottom position for most bars, and `position="top"` for consent banners',
    ],
    dont: [
      "Don't put navigation links in it. Use TopBar or Sidebar",
      "Don't put forms or multi-step flows in it",
      "Don't show two at the same edge at once. They overlap",
      "Don't use it in place of a toast. It's for actions, and Toast is for notifications",
    ],
  },

  previewHtml: `<div style="position:relative;width:100%;height:180px;border:1px solid var(--border-subtle);border-radius:var(--radius-md);overflow:hidden;background:var(--bg-surface)">
  <div style="padding:var(--space-md);text-align:center;color:var(--text-secondary);font-size:14px;font-family:var(--font-body)">
    Page content behind the float bar
  </div>
  <div style="position:absolute;bottom:var(--space-md);left:50%;transform:translateX(-50%);display:flex;align-items:center;gap:var(--space-md);padding:var(--space-sm) var(--space-lg);background:var(--bg-surface-overlay);backdrop-filter:blur(12px);border:1px solid var(--border-subtle);border-radius:var(--radius-lg);box-shadow:0 4px 24px rgba(0,0,0,0.12)">
    <span style="color:var(--text-secondary);font-size:14px;font-family:var(--font-body);white-space:nowrap">3 items selected</span>
    <arc-button variant="secondary" size="sm">Archive</arc-button>
    <arc-button variant="secondary" size="sm">Delete</arc-button>
  </div>
</div>`,

  tabs: [
    {
      label: 'Web Component',
      lang: 'html',
      code: `<arc-float-bar id="bulk-actions" position="bottom">
  <span>3 items selected</span>
  <arc-button variant="secondary" size="sm">Archive</arc-button>
  <arc-button variant="secondary" size="sm">Delete</arc-button>
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
      <Button variant="secondary" size="sm">Delete</Button>
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
    <Button variant="secondary" size="sm">Delete</Button>
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
  <Button variant="secondary" size="sm">Delete</Button>
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
    <arc-float-bar [open]="selectedCount > 0" position="bottom">
      <span>{{ selectedCount }} items selected</span>
      <arc-button variant="secondary" size="sm">Archive</arc-button>
      <arc-button variant="secondary" size="sm">Delete</arc-button>
    </arc-float-bar>
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
      <Button variant="secondary" size="sm">Delete</Button>
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
      <Button variant="secondary" size="sm">Delete</Button>
    </FloatBar>
  );
}`,
    },
  ],

  seeAlso: ['toolbar', 'status-bar', 'drawer'],
};
