import type { ComponentDef } from './_types';

export const sticky: ComponentDef = {
  name: 'Sticky',
  slug: 'sticky',
  tag: 'arc-sticky',
  tier: 'layout',
  interactivity: 'interactive',
  description:
    'A wrapper that sticks at a set distance from the top and sets a `stuck` attribute while stuck.',

  overview: `Sticky is a wrapper with \`position: sticky\`. \`offset\` sets its \`top\` value. \`"0px"\`, the default, sticks it flush with the top edge, and \`"64px"\` sticks it under a 64px top bar.

An IntersectionObserver, not a scroll listener, watches a 1px sentinel just above the wrapper. The observer's top edge sits at the offset, so the sentinel crosses it at the moment the wrapper sticks. Sticky then sets the \`stuck\` attribute on the host, removes it when the wrapper scrolls back down, and fires \`arc-stuck\` with \`{ stuck }\` in the detail each time. The stuck state adds \`--shadow-sm\` by default. Style \`[stuck]\` to change the background, border or anything else.`,

  features: [
    'The wrapper sits at `z-index: 10`, above the content that scrolls under it',
  ],

  guidelines: {
    do: [
      'Use it for section headers in long lists',
      'Use it for a toolbar row under a fixed top bar, with `offset` set to the top bar\'s height',
      'Style the stuck state with the `[stuck]` selector',
      'Listen for `arc-stuck` when app state needs to change on stick or unstick',
    ],
    dont: [
      'Don\'t use it for something that must stay on screen at all times. It scrolls away with its parent, so use `position: fixed`',
      'Don\'t set a negative offset. The element sticks above the top edge',
      'Don\'t expect it to stick past the end of its parent. A sticky element stays inside its parent\'s box',
    ],
  },

  previewHtml: `<div tabindex="0" style="width:100%;height:180px;overflow-y:auto;border:1px solid var(--border-subtle);border-radius:var(--radius-md);background:var(--bg-surface)">
  <div style="padding:var(--space-md)">
    <div style="color:var(--text-secondary);font-size:13px;font-family:var(--font-body);margin-bottom:var(--space-sm)">Scroll down to see the sticky header</div>
  </div>
  <div style="position:sticky;top:0;z-index:1;padding:var(--space-sm) var(--space-md);background:var(--bg-elevated);backdrop-filter:blur(8px);border-bottom:1px solid var(--border-subtle);font-size:14px;font-weight:600;color:var(--text-primary);font-family:var(--font-body)">
    Sticky section header
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
    <arc-sticky offset="64px" (arcStuck)="onStuck($event)">
      <div class="section-header">Section Title</div>
    </arc-sticky>
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
