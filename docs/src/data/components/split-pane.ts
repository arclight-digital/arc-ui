import type { ComponentDef } from './_types';

export const splitPane: ComponentDef = {
    name: 'Split Pane',
    slug: 'split-pane',
    tag: 'arc-split-pane',
    tier: 'layout',
    interactivity: 'interactive',
    description: 'Resizable split layout with two panes.',

    overview: `SplitPane divides a container into two resizable regions separated by a draggable handle. It is the standard pattern for code editors (source + preview), email clients (list + reader), and file managers (tree + detail) where both panels need to share a finite amount of space. The \`orientation\` prop controls whether the split runs horizontally (side by side) or vertically (stacked top and bottom).

The divider position is expressed as a \`ratio\` between 0 and 1, where 0.5 means an even 50/50 split. As the user drags the handle, the component clamps the ratio between \`min-ratio\` and \`max-ratio\` to prevent either pane from collapsing to an unusable size. When the drag ends, an \`arc-resize\` custom event fires with the final ratio so you can persist the user's layout preference.

Content is distributed through two named slots: \`primary\` (the region whose size is controlled by the ratio) and \`secondary\` (which flexes to fill the remaining space). Both panes have \`overflow: auto\` by default so independently scrollable content works out of the box. The handle renders as a 4px bar that brightens on hover to \`--border-bright\`, and user-select is disabled during drag to prevent text selection artifacts.`,

    features: [
      'Horizontal and vertical split orientations via the orientation prop',
      'Ratio-based sizing (0-1) with configurable min-ratio and max-ratio constraints',
      'Draggable 4px divider handle with hover and active visual states',
      'arc-resize custom event with final ratio on drag end',
      'Named primary and secondary slots for clear content assignment',
      'Both panes have overflow: auto for independently scrollable content',
      'User-select disabled during drag to prevent text selection artifacts',
      'CSS parts (base, primary, handle, secondary) for targeted ::part() styling'
    ],

    guidelines: {
      do: [
        'Use SplitPane for editor/preview, list/detail, and tree/content layouts',
        'Set min-ratio to at least 0.15 and max-ratio to at most 0.85 to keep both panes usable',
        'Listen for the arc-resize event to save the user preferred ratio to localStorage',
        'Give the SplitPane parent a defined height (e.g. 100vh or flex: 1) so the panes can fill it',
        'Use orientation="vertical" for top/bottom splits like console panels or diff views'
      ],
      dont: [
        'Use SplitPane for static two-column layouts; use PageLayout with sidebar-left or sidebar-right instead',
        'Set min-ratio and max-ratio so close that the drag range is negligible',
        'Nest multiple SplitPanes more than two levels deep -- the interaction becomes confusing',
        'Forget to set a height on the SplitPane container; without it the panes collapse to content height',
        'Place critical controls in the secondary pane if min-ratio could hide it on narrow viewports'
      ],
    },

    previewHtml: `<div style="width:100%;height:240px;border:1px solid var(--border-subtle);border-radius:var(--radius-md);overflow:hidden;background:var(--bg-surface)">
  <arc-split-pane orientation="horizontal" ratio="0.4" style="height:100%">
    <div slot="primary" style="padding:var(--space-md);font-family:var(--font-body);font-size:13px;color:var(--text-secondary);height:100%;box-sizing:border-box">
      <div style="font-weight:600;color:var(--text-primary);margin-bottom:var(--space-sm)">File Tree</div>
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

    props: [
      { name: 'orientation', type: "'horizontal' | 'vertical'", default: "'horizontal'", description: 'Controls the split direction. Horizontal places panes side by side with a vertical divider. Vertical stacks panes top and bottom with a horizontal divider.' },
      { name: 'ratio', type: 'number', default: '0.5', description: 'The proportion of space allocated to the primary pane, from 0 to 1. A value of 0.4 gives the primary pane 40% of the available width (or height in vertical mode).' },
      { name: 'min-ratio', type: 'number', default: '0.15', description: 'Minimum allowed ratio. The divider cannot be dragged below this value, preventing the primary pane from collapsing.' },
      { name: 'max-ratio', type: 'number', default: '0.85', description: 'Maximum allowed ratio. The divider cannot be dragged above this value, preventing the secondary pane from collapsing.' }
    ],
    events: [
      { name: 'arc-resize', description: 'Fired during divider drag with { ratio } detail' }
    ],
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

<SplitPane orientation="horizontal" ratio="0.4">
  <div slot="primary">Primary pane</div>
  <div slot="secondary">Secondary pane</div>
</SplitPane>`,
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
    <SplitPane orientation="horizontal" ratio="0.4">
      <div slot="primary">Primary pane</div>
      <div slot="secondary">Secondary pane</div>
    </SplitPane>
  \`,
})
export class MyComponent {}`,
      },
      {
        label: 'Solid',
        lang: 'tsx',
        code: `import { SplitPane } from '@arclux/arc-ui-solid';

<SplitPane orientation="horizontal" ratio="0.4">
  <div slot="primary">Primary pane</div>
  <div slot="secondary">Secondary pane</div>
</SplitPane>`,
      },
      {
        label: 'Preact',
        lang: 'tsx',
        code: `import { SplitPane } from '@arclux/arc-ui-preact';

<SplitPane orientation="horizontal" ratio="0.4">
  <div slot="primary">Primary pane</div>
  <div slot="secondary">Secondary pane</div>
</SplitPane>`,
      }
    ],
  
  seeAlso: ["resizable","dashboard-grid"],
};
