import type { ComponentDef } from './_types';

export const splitPane: ComponentDef = {
  name: 'Split Pane',
  slug: 'split-pane',
  tag: 'arc-split-pane',
  tier: 'layout',
  interactivity: 'interactive',
  description: 'Resizable split layout with two panes.',

  overview: `SplitPane divides its container into two panes with a handle between them. Use it when the reader should decide how two panes share the space. \`orientation="horizontal"\` puts the panes side by side, and \`vertical\` stacks them.

\`ratio\` sets the primary pane's share, from 0 to 1. Dragging the handle or pressing the arrow keys on it changes the ratio, and \`min-ratio\` and \`max-ratio\` (0.15 and 0.85 by default) stop either pane from collapsing. \`arc-resize\` fires on every drag step and every key press, with the new ratio in \`detail.ratio\`.

The \`primary\` slot gets the ratio's share, and \`secondary\` fills the rest. Each pane scrolls on its own (\`overflow: auto\`).`,

  features: [
    'The handle is a 4px bar that turns `--border-bright` on hover and during a drag',
    'Text selection is off while the handle is being dragged',
  ],

  guidelines: {
    do: [
      'Use it for editor and preview, list and detail, or tree and content layouts',
      'Keep `min-ratio` at 0.15 or more and `max-ratio` at 0.85 or less (the defaults) so both panes stay usable',
      'Save the ratio from `arc-resize` to keep the reader\'s layout. It fires on every step, so debounce the write',
      'Give the parent a set height, such as `100vh` or `flex: 1`. SplitPane takes 100% of it',
      'Use `orientation="vertical"` for top and bottom splits, such as a console under an editor',
    ],
    dont: [
      'Don\'t use it for a fixed two-column layout. Use PageLayout with `sidebar-left` or `sidebar-right`',
      'Don\'t set `min-ratio` and `max-ratio` so close together that the handle barely moves',
      'Don\'t put controls the reader needs in the secondary pane if `max-ratio` lets it get too narrow to show them',
    ],
  },

  previewLayout: 'frame',

  previewHeight: '240px',

  previewHtml: `<div style="width:100%;height:100%;border:1px solid var(--border-subtle);border-radius:var(--radius-md);overflow:hidden;background:var(--bg-surface)">
  <arc-split-pane orientation="horizontal" ratio="0.4" style="height:100%">
    <div slot="primary" style="padding:var(--space-md);font-family:var(--font-body);font-size:13px;color:var(--text-secondary);height:100%;box-sizing:border-box">
      <div style="font-weight:600;color:var(--text-primary);margin-bottom:var(--space-sm)">File tree</div>
      <div style="display:flex;flex-direction:column;gap:4px;font-size:13px;color:var(--text-muted);font-family:var(--font-mono)">
        <span>src/</span>
        <span style="padding-left:12px;color:var(--accent-primary)">index.ts</span>
        <span style="padding-left:12px">utils.ts</span>
        <span style="padding-left:12px">types.ts</span>
        <span>package.json</span>
      </div>
    </div>
    <div slot="secondary" style="padding:var(--space-md);font-family:var(--font-body);font-size:13px;color:var(--text-muted);display:flex;align-items:center;justify-content:center;height:100%;box-sizing:border-box">
      Select a file to view its contents
    </div>
  </arc-split-pane>
</div>`,

  tabs: [
    {
      label: 'Web Component',
      lang: 'html',
      code: `<arc-split-pane orientation="horizontal" ratio="0.4">
  <div slot="primary">Primary pane</div>
  <div slot="secondary">Secondary pane</div>
</arc-split-pane>`,
    },
    {
      label: 'React',
      lang: 'tsx',
      code: `import { SplitPane } from '@arclux/arc-ui-react';

export default function Example() {
  return (
    <SplitPane orientation="horizontal" ratio="0.4">
      <div slot="primary">Primary pane</div>
      <div slot="secondary">Secondary pane</div>
    </SplitPane>
  );
}`,
    },
    {
      label: 'Vue',
      lang: 'html',
      code: `<script setup>
import { SplitPane } from '@arclux/arc-ui-vue';
</script>

<template>
  <SplitPane orientation="horizontal" ratio="0.4">
    <div slot="primary">Primary pane</div>
    <div slot="secondary">Secondary pane</div>
  </SplitPane>
</template>`,
    },
    {
      label: 'Svelte',
      lang: 'html',
      code: `<script>
  import { SplitPane } from '@arclux/arc-ui-svelte';
</script>

<SplitPane orientation="horizontal" ratio="0.4">
  <div slot="primary">Primary pane</div>
  <div slot="secondary">Secondary pane</div>
</SplitPane>`,
    },
    {
      label: 'Angular',
      lang: 'ts',
      code: `import { Component } from '@angular/core';
import { SplitPane } from '@arclux/arc-ui-angular';

@Component({
  imports: [SplitPane],
  template: \`
    <arc-split-pane orientation="horizontal" ratio="0.4">
      <div slot="primary">Primary pane</div>
      <div slot="secondary">Secondary pane</div>
    </arc-split-pane>
  \`,
})
export class MyComponent {}`,
    },
    {
      label: 'Solid',
      lang: 'tsx',
      code: `import { SplitPane } from '@arclux/arc-ui-solid';

export default function Example() {
  return (
    <SplitPane orientation="horizontal" ratio="0.4">
      <div slot="primary">Primary pane</div>
      <div slot="secondary">Secondary pane</div>
    </SplitPane>
  );
}`,
    },
    {
      label: 'Preact',
      lang: 'tsx',
      code: `import { SplitPane } from '@arclux/arc-ui-preact';

export default function Example() {
  return (
    <SplitPane orientation="horizontal" ratio="0.4">
      <div slot="primary">Primary pane</div>
      <div slot="secondary">Secondary pane</div>
    </SplitPane>
  );
}`,
    },
  ],

  seeAlso: ['resizable', 'dashboard-grid'],
};
