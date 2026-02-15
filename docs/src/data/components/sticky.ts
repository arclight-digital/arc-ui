import type { ComponentDef } from './_types';

export const sticky: ComponentDef = {
    name: 'Sticky',
    slug: 'sticky',
    tag: 'arc-sticky',
    tier: 'layout',
    interactivity: 'interactive',
    description: 'Wrapper that goes sticky at a configurable offset and emits a stuck attribute/event for visual state changes.',

    overview: `Sticky is a layout wrapper that applies \`position: sticky\` to its children and uses an IntersectionObserver to detect when the element has actually become stuck to the viewport edge. When the stuck state changes, the component sets a \`stuck\` attribute on the host element and fires an \`arc-stuck\` event, enabling downstream visual changes — such as adding a shadow, changing the background, or toggling a border — without any manual scroll-listener wiring.

The \`offset\` prop controls the \`top\` value for the sticky positioning (e.g., "0px" for flush with the viewport top, "64px" to account for a fixed top bar). The IntersectionObserver sentinel technique ensures the stuck detection is performant and does not rely on scroll events, making it safe for complex pages with many sticky elements.

Common use cases include section headers that stick as the user scrolls through a long list, toolbar rows that become fixed under a top bar, and table column headers in scrollable data regions. Sticky handles the positioning and detection; your styles respond to the \`[stuck]\` attribute for visual feedback.`,

    features: [
      'CSS `position: sticky` with configurable `top` offset via the `offset` prop',
      'IntersectionObserver-based stuck detection — no scroll event listeners',
      'Sets a `stuck` boolean attribute on the host when the element is stuck',
      'Fires `arc-stuck` custom event with `{ stuck: boolean }` detail for state synchronization',
      'Performant sentinel technique works with many sticky elements on the same page',
      'CSS part: `sticky` for targeted ::part() styling',
      'Works inside any scrollable container, not just the viewport',
    ],

    guidelines: {
      do: [
        'Use for section headers in long scrollable lists or content areas',
        'Use for toolbar rows that should stick below a fixed top bar (set offset to top bar height)',
        'Style the stuck state via the `[stuck]` attribute selector for shadows, borders, or background changes',
        'Listen for the `arc-stuck` event when you need to update application state on stick/unstick',
        'Set offset to match any fixed headers above the sticky element to avoid overlap',
      ],
      dont: [
        'Do not use Sticky for elements that should be `position: fixed` — Sticky respects scroll context',
        'Do not nest Sticky inside another Sticky in the same scroll container',
        'Do not rely on Sticky for critical layout structure — it is a progressive enhancement',
        'Do not set offset to a negative value — the element will stick above the viewport edge',
        'Do not use Sticky when the parent container does not have overflow scroll — sticky has no effect without a scrollable ancestor',
      ],
    },

    previewHtml: `<div style="width:100%;height:180px;overflow-y:auto;border:1px solid var(--border-subtle);border-radius:var(--radius-md);background:var(--bg-surface)">
  <div style="padding:var(--space-md)">
    <div style="color:var(--text-secondary);font-size:13px;font-family:var(--font-body);margin-bottom:var(--space-sm)">Scroll down to see the sticky header</div>
  </div>
  <div style="position:sticky;top:0;z-index:1;padding:var(--space-sm) var(--space-md);background:var(--bg-elevated);backdrop-filter:blur(8px);border-bottom:1px solid var(--border-subtle);font-size:14px;font-weight:600;color:var(--text-primary);font-family:var(--font-body)">
    Sticky Section Header
  </div>
  <div style="padding:var(--space-md);display:flex;flex-direction:column;gap:var(--space-sm)">
    <div style="padding:var(--space-sm);background:rgba(77,126,247,0.06);border-radius:var(--radius-sm);color:var(--text-secondary);font-size:13px;font-family:var(--font-body)">List item 1</div>
    <div style="padding:var(--space-sm);background:rgba(77,126,247,0.06);border-radius:var(--radius-sm);color:var(--text-secondary);font-size:13px;font-family:var(--font-body)">List item 2</div>
    <div style="padding:var(--space-sm);background:rgba(77,126,247,0.06);border-radius:var(--radius-sm);color:var(--text-secondary);font-size:13px;font-family:var(--font-body)">List item 3</div>
    <div style="padding:var(--space-sm);background:rgba(77,126,247,0.06);border-radius:var(--radius-sm);color:var(--text-secondary);font-size:13px;font-family:var(--font-body)">List item 4</div>
    <div style="padding:var(--space-sm);background:rgba(77,126,247,0.06);border-radius:var(--radius-sm);color:var(--text-secondary);font-size:13px;font-family:var(--font-body)">List item 5</div>
    <div style="padding:var(--space-sm);background:rgba(77,126,247,0.06);border-radius:var(--radius-sm);color:var(--text-secondary);font-size:13px;font-family:var(--font-body)">List item 6</div>
    <div style="padding:var(--space-sm);background:rgba(77,126,247,0.06);border-radius:var(--radius-sm);color:var(--text-secondary);font-size:13px;font-family:var(--font-body)">List item 7</div>
    <div style="padding:var(--space-sm);background:rgba(77,126,247,0.06);border-radius:var(--radius-sm);color:var(--text-secondary);font-size:13px;font-family:var(--font-body)">List item 8</div>
  </div>
</div>`,

    props: [
      { name: 'offset', type: 'string', default: "'0px'", description: 'The CSS `top` value for sticky positioning. Set to "64px" to stick below a 64px top bar, or "0px" to stick flush with the viewport/scroll container edge.' },
      { name: 'stuck', type: 'boolean', default: 'false', description: 'Read-only attribute set by the IntersectionObserver when the element is currently stuck. Use the `[stuck]` CSS selector to style the stuck state.' },
    ],
    events: [
      { name: 'arc-stuck', description: 'Fired when the stuck state changes. Event detail contains `{ stuck: boolean }` indicating whether the element is currently stuck.' },
    ],

    tabs: [
      {
        label: 'Web Component',
        lang: 'html',
        code: `<arc-sticky offset="0px">
  <div class="section-header">Section Title</div>
</arc-sticky>

<style>
  arc-sticky[stuck] .section-header {
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    background: var(--bg-surface-overlay);
    backdrop-filter: blur(8px);
  }
</style>

<script>
  const sticky = document.querySelector('arc-sticky');
  sticky.addEventListener('arc-stuck', (e) => {
    console.log('Stuck:', e.detail.stuck);
  });
</script>`,
      },
      {
        label: 'React',
        lang: 'tsx',
        code: `import { Sticky } from '@arclux/arc-ui-react';

function StickyHeader() {
  return (
    <Sticky offset="64px" onArcStuck={(e) => console.log('Stuck:', e.detail.stuck)}>
      <div className="section-header">Section Title</div>
    </Sticky>
  );
}`,
      },
      {
        label: 'Vue',
        lang: 'html',
        code: `<script setup>
import { Sticky } from '@arclux/arc-ui-vue';

function onStuck(e: CustomEvent) {
  console.log('Stuck:', e.detail.stuck);
}
</script>

<template>
  <Sticky offset="64px" @arc-stuck="onStuck">
    <div class="section-header">Section Title</div>
  </Sticky>
</template>`,
      },
      {
        label: 'Svelte',
        lang: 'html',
        code: `<script>
  import { Sticky } from '@arclux/arc-ui-svelte';
</script>

<Sticky offset="64px" on:arc-stuck={(e) => console.log('Stuck:', e.detail.stuck)}>
  <div class="section-header">Section Title</div>
</Sticky>`,
      },
      {
        label: 'Angular',
        lang: 'ts',
        code: `import { Component } from '@angular/core';
import { Sticky } from '@arclux/arc-ui-angular';

@Component({
  imports: [Sticky],
  template: \`
    <Sticky offset="64px" (arcStuck)="onStuck($event)">
      <div class="section-header">Section Title</div>
    </Sticky>
  \`,
})
export class StickyHeaderComponent {
  onStuck(e: CustomEvent) {
    console.log('Stuck:', e.detail.stuck);
  }
}`,
      },
      {
        label: 'Solid',
        lang: 'tsx',
        code: `import { Sticky } from '@arclux/arc-ui-solid';

function StickyHeader() {
  return (
    <Sticky offset="64px" onArcStuck={(e) => console.log('Stuck:', e.detail.stuck)}>
      <div class="section-header">Section Title</div>
    </Sticky>
  );
}`,
      },
      {
        label: 'Preact',
        lang: 'tsx',
        code: `import { Sticky } from '@arclux/arc-ui-preact';

function StickyHeader() {
  return (
    <Sticky offset="64px" onArcStuck={(e) => console.log('Stuck:', e.detail.stuck)}>
      <div class="section-header">Section Title</div>
    </Sticky>
  );
}`,
      },
    ],

  seeAlso: ['top-bar', 'toolbar', 'scroll-spy'],
};
