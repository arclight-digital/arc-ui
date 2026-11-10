import type { ComponentDef } from './_types';

export const resizable: ComponentDef = {
  name: 'Resizable',
  slug: 'resizable',
  tag: 'arc-resizable',
  tier: 'layout',
  interactivity: 'interactive',
  description: 'A panel with a drag handle on one edge that changes its width or height.',

  overview: `Resizable wraps one panel and puts a handle on one of its edges. Drag the handle to change the panel's width (\`direction="horizontal"\`) or height (\`direction="vertical"\`). Use it for sidebars, property panels and console drawers. The handle sits on the end edge by default, which is the right edge in a left-to-right page or the bottom. Set \`handle="start"\` for a panel docked against the far side of its container.

Dragging uses Pointer Events with pointer capture, so mouse, touch and pen all work. The size is clamped between \`min-size\` and \`max-size\`, written to the \`--panel-size\` custom property as you drag, and reported in an \`arc-resize\` event on every change. Listen to that event to save the size.

The handle is a focusable \`role="separator"\` with \`aria-valuenow\`, \`aria-valuemin\` and \`aria-valuemax\`. Arrow keys resize in 5px steps, or 20px with Shift. The visible bar is 4px wide, with an invisible hit area 4px wider on each side, and it turns the accent color on hover and focus.`,

  features: [
    '`arc-resize` carries `{ size }` in pixels',
    'The handle\'s accessible name is "Resize handle"',
  ],

  guidelines: {
    do: [
      'Set `min-size` so the panel can\'t shrink past usable, for example 150px for a sidebar',
      'Set `max-size` so the panel can\'t take over the viewport',
      'Save the size from `arc-resize` to localStorage or your backend so it survives a reload',
      'Use SplitPane when two regions share one divider',
    ],
    dont: [
      'Don\'t set `min-size` and `max-size` to the same value. The panel then can\'t resize',
      'Don\'t put the handle right next to a scrollbar, where people mistake one for the other',
      'If you restyle the handle part, keep its `::before` hit area, or the 4px bar gets hard to grab',
    ],
  },

  previewHtml: `<div style="width:100%;height:200px;border:1px solid var(--border-subtle);border-radius:var(--radius-md);overflow:hidden;background:var(--bg-surface);display:flex">
  <arc-resizable direction="horizontal" size="220" min-size="120" max-size="400" style="height:100%;border-right:1px solid var(--border-subtle)">
    <div style="padding:var(--space-md);font-family:var(--font-body);font-size:13px;color:var(--text-secondary);height:100%;box-sizing:border-box">
      <div style="font-weight:600;color:var(--text-primary);margin-bottom:var(--space-sm)">Sidebar</div>
      <div>Drag the right edge to resize this panel.</div>
    </div>
  </arc-resizable>
  <div style="flex:1;padding:var(--space-md);font-family:var(--font-body);font-size:13px;color:var(--text-muted);display:flex;align-items:center;justify-content:center">
    Main content area
  </div>
</div>`,

  tabs: [
    {
      label: 'Web Component',
      lang: 'html',
      code: `<arc-resizable direction="horizontal" size="200">
  <div>Resizable panel</div>
</arc-resizable>`,
    },
    {
      label: 'React',
      lang: 'tsx',
      code: `import { Resizable } from '@arclux/arc-ui-react';

export default function Example() {
  return (
    <Resizable direction="horizontal" size="200">
      <div>Resizable panel</div>
    </Resizable>
  );
}`,
    },
    {
      label: 'Vue',
      lang: 'html',
      code: `<script setup>
import { Resizable } from '@arclux/arc-ui-vue';
</script>

<template>
  <Resizable direction="horizontal" size="200">
    <div>Resizable panel</div>
  </Resizable>
</template>`,
    },
    {
      label: 'Svelte',
      lang: 'html',
      code: `<script>
  import { Resizable } from '@arclux/arc-ui-svelte';
</script>

<Resizable direction="horizontal" size="200">
  <div>Resizable panel</div>
</Resizable>`,
    },
    {
      label: 'Angular',
      lang: 'ts',
      code: `import { Component } from '@angular/core';
import { Resizable } from '@arclux/arc-ui-angular';

@Component({
  imports: [Resizable],
  template: \`
    <arc-resizable direction="horizontal" size="200">
      <div>Resizable panel</div>
    </arc-resizable>
  \`,
})
export class MyComponent {}`,
    },
    {
      label: 'Solid',
      lang: 'tsx',
      code: `import { Resizable } from '@arclux/arc-ui-solid';

export default function Example() {
  return (
    <Resizable direction="horizontal" size="200">
      <div>Resizable panel</div>
    </Resizable>
  );
}`,
    },
    {
      label: 'Preact',
      lang: 'tsx',
      code: `import { Resizable } from '@arclux/arc-ui-preact';

export default function Example() {
  return (
    <Resizable direction="horizontal" size="200">
      <div>Resizable panel</div>
    </Resizable>
  );
}`,
    },
  ],

  seeAlso: ['split-pane', 'dashboard-grid'],
};
