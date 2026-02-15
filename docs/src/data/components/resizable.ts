import type { ComponentDef } from './_types';

export const resizable: ComponentDef = {
    name: 'Resizable',
    slug: 'resizable',
    tag: 'arc-resizable',
    tier: 'layout',
    interactivity: 'interactive',
    description: 'Resizable panel with drag handle.',

    overview: `Resizable wraps a single content panel and exposes a drag handle on one edge that the user can pull to change the panel's width or height. It is the right building block for sidebars, property panels, console drawers, and any region where the user should be able to claim more or less screen space. The direction prop controls whether the handle appears on the right edge (horizontal) or bottom edge (vertical).

Drag interaction uses the Pointer Events API with pointer capture, so it works seamlessly across mouse, touch, and pen inputs. As the user drags, the component clamps the new size between \`min-size\` and \`max-size\` and updates the \`--panel-size\` CSS custom property in real time for smooth, flicker-free resizing. An \`arc-resize\` custom event fires on every size change so you can persist the user's preference or synchronize adjacent layout regions.

The handle is also fully keyboard-accessible. It renders with \`role="separator"\`, \`tabindex="0"\`, and ARIA value attributes (\`aria-valuenow\`, \`aria-valuemin\`, \`aria-valuemax\`). Arrow keys resize in 5px steps, or 20px steps when Shift is held. The handle highlights on hover and focus with the \`--accent-primary\` token, and an expanded invisible hit area (8px wider than the visible 4px bar) makes it easy to grab even on high-density displays.`,

    features: [
      'Horizontal and vertical resize directions via the direction prop',
      'Pointer Events API with pointer capture for mouse, touch, and pen support',
      'Configurable min-size and max-size constraints to prevent over-shrinking or over-expanding',
      'Real-time --panel-size CSS custom property updates for flicker-free resizing',
      'arc-resize custom event dispatched on every size change',
      'Keyboard-accessible handle with Arrow key steps (5px default, 20px with Shift)',
      'ARIA separator role with aria-valuenow, aria-valuemin, and aria-valuemax',
      'Expanded invisible hit area for easier grab targeting on the 4px handle'
    ],

    guidelines: {
      do: [
        'Use Resizable for sidebars, property panels, and console drawers that users should resize',
        'Set min-size to prevent the panel from collapsing below a usable minimum (e.g. 150px for a sidebar)',
        'Set max-size to prevent the panel from consuming the entire viewport',
        'Listen for the arc-resize event to persist the user preference to localStorage or a database',
        'Pair with SplitPane when you need two resizable regions that share a single divider'
      ],
      dont: [
        'Use Resizable for content that should never be resized -- use a fixed-width Container instead',
        'Set min-size and max-size to the same value -- this effectively disables resizing',
        'Forget to give the parent a defined height when using direction="vertical"',
        'Place the Resizable handle adjacent to a scrollbar; users may confuse the two controls',
        'Override the handle styles without preserving the expanded hit area pseudo-element'
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

    props: [
      { name: 'direction', type: "'horizontal' | 'vertical'", default: "'horizontal'", description: 'Controls which edge the drag handle appears on. Horizontal places the handle on the right edge and resizes width; vertical places it on the bottom edge and resizes height.' },
      { name: 'size', type: 'number', default: '300', description: 'Current size of the panel in pixels. Updated in real time during drag. Maps to the --panel-size CSS custom property.' },
      { name: 'min-size', type: 'number', default: '100', description: 'Minimum allowed size in pixels. The panel cannot be dragged smaller than this value.' },
      { name: 'max-size', type: 'number', default: 'Infinity', description: 'Maximum allowed size in pixels. The panel cannot be dragged larger than this value. Defaults to no limit.' }
    ],
    events: [
      { name: 'arc-resize', description: 'Fired during and after panel resize with { size } detail' }
    ],
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

<Resizable direction="horizontal" size="200">
  <div>Resizable panel</div>
</Resizable>`,
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
    <Resizable direction="horizontal" size="200">
      <div>Resizable panel</div>
    </Resizable>
  \`,
})
export class MyComponent {}`,
      },
      {
        label: 'Solid',
        lang: 'tsx',
        code: `import { Resizable } from '@arclux/arc-ui-solid';

<Resizable direction="horizontal" size="200">
  <div>Resizable panel</div>
</Resizable>`,
      },
      {
        label: 'Preact',
        lang: 'tsx',
        code: `import { Resizable } from '@arclux/arc-ui-preact';

<Resizable direction="horizontal" size="200">
  <div>Resizable panel</div>
</Resizable>`,
      }
    ],
  
  seeAlso: ["split-pane","dashboard-grid"],
};
