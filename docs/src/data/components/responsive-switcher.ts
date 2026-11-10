import type { ComponentDef } from './_types';

export const responsiveSwitcher: ComponentDef = {
  name: 'Responsive Switcher',
  slug: 'responsive-switcher',
  tag: 'arc-responsive-switcher',
  tier: 'layout',
  interactivity: 'static',
  description:
    'A layout that lines its children up in a row when it\'s wide and stacks them when it\'s narrow, using a container query on its own width.',

  overview: `ResponsiveSwitcher lays its children out in a row when its own width is at least \`threshold\`, and in a column below that. It uses a container query, not a media query, so it switches at the same width wherever you put it. Use it for two-column forms that should drop to one column, or a text-and-image pair that should stack.

\`threshold\` defaults to 600px. Each child gets \`flex: 1\`, so children share a row equally. \`gap\` takes the spacing tokens \`xs\` through \`xl\`, with \`md\` as the default.

A \`threshold\` below 600px works. One above 600px doesn't move the switch point: the built-in 600px rule stays in place, so the row layout still starts at 600px.`,

  features: [
    'A changed `threshold` is applied by adding a container-query stylesheet from JavaScript. There\'s no ResizeObserver',
    'Parts: `base` and `switcher`, both on the flex container',
  ],

  guidelines: {
    do: [
      'Set `threshold` to the narrowest width where the row still fits, at 600px or below',
      'Combine it with Container to cap the width as well',
      'Use it inside resizable panels and split panes, where viewport media queries can\'t see the space you have',
    ],
    dont: [
      'Don\'t use it for layouts with several breakpoints. Use CSS Grid',
      'Don\'t set `threshold` so low that the row gets cramped',
      'Don\'t reach for it when the direction never changes. Use Stack',
    ],
  },

  previewHtml: `<div style="width:100%;display:flex;flex-direction:column;gap:var(--space-lg)">
  <div style="color:var(--text-secondary);font-size:13px;font-family:var(--font-body)">Wide container (horizontal):</div>
  <div style="display:flex;gap:var(--space-md);width:100%">
    <div style="flex:1;padding:var(--space-md);background:rgba(77,126,247,0.1);border-radius:var(--radius-sm);text-align:center;color:var(--text-secondary);font-size:13px;font-family:var(--font-body)">Child A</div>
    <div style="flex:1;padding:var(--space-md);background:rgba(139,92,246,0.1);border-radius:var(--radius-sm);text-align:center;color:var(--text-secondary);font-size:13px;font-family:var(--font-body)">Child B</div>
    <div style="flex:1;padding:var(--space-md);background:rgba(77,126,247,0.1);border-radius:var(--radius-sm);text-align:center;color:var(--text-secondary);font-size:13px;font-family:var(--font-body)">Child C</div>
  </div>
  <div style="color:var(--text-secondary);font-size:13px;font-family:var(--font-body)">Narrow container (vertical):</div>
  <div style="display:flex;flex-direction:column;gap:var(--space-md);width:50%">
    <div style="padding:var(--space-md);background:rgba(77,126,247,0.1);border-radius:var(--radius-sm);text-align:center;color:var(--text-secondary);font-size:13px;font-family:var(--font-body)">Child A</div>
    <div style="padding:var(--space-md);background:rgba(139,92,246,0.1);border-radius:var(--radius-sm);text-align:center;color:var(--text-secondary);font-size:13px;font-family:var(--font-body)">Child B</div>
    <div style="padding:var(--space-md);background:rgba(77,126,247,0.1);border-radius:var(--radius-sm);text-align:center;color:var(--text-secondary);font-size:13px;font-family:var(--font-body)">Child C</div>
  </div>
</div>`,

  tabs: [
    {
      label: 'Web Component',
      lang: 'html',
      code: `<arc-responsive-switcher threshold="600px" gap="md">
  <arc-card>First panel</arc-card>
  <arc-card>Second panel</arc-card>
  <arc-card>Third panel</arc-card>
</arc-responsive-switcher>`,
    },
    {
      label: 'React',
      lang: 'tsx',
      code: `import { ResponsiveSwitcher, Card } from '@arclux/arc-ui-react';

function AdaptiveLayout() {
  return (
    <ResponsiveSwitcher threshold="600px" gap="md">
      <Card>First panel</Card>
      <Card>Second panel</Card>
      <Card>Third panel</Card>
    </ResponsiveSwitcher>
  );
}`,
    },
    {
      label: 'Vue',
      lang: 'html',
      code: `<script setup>
import { ResponsiveSwitcher, Card } from '@arclux/arc-ui-vue';
</script>

<template>
  <ResponsiveSwitcher threshold="600px" gap="md">
    <Card>First panel</Card>
    <Card>Second panel</Card>
    <Card>Third panel</Card>
  </ResponsiveSwitcher>
</template>`,
    },
    {
      label: 'Svelte',
      lang: 'html',
      code: `<script>
  import { ResponsiveSwitcher, Card } from '@arclux/arc-ui-svelte';
</script>

<ResponsiveSwitcher threshold="600px" gap="md">
  <Card>First panel</Card>
  <Card>Second panel</Card>
  <Card>Third panel</Card>
</ResponsiveSwitcher>`,
    },
    {
      label: 'Angular',
      lang: 'ts',
      code: `import { Component } from '@angular/core';
import { ResponsiveSwitcher, Card } from '@arclux/arc-ui-angular';

@Component({
  imports: [ResponsiveSwitcher, Card],
  template: \`
    <arc-responsive-switcher threshold="600px" gap="md">
      <arc-card>First panel</arc-card>
      <arc-card>Second panel</arc-card>
      <arc-card>Third panel</arc-card>
    </arc-responsive-switcher>
  \`,
})
export class AdaptiveLayoutComponent {}`,
    },
    {
      label: 'Solid',
      lang: 'tsx',
      code: `import { ResponsiveSwitcher, Card } from '@arclux/arc-ui-solid';

function AdaptiveLayout() {
  return (
    <ResponsiveSwitcher threshold="600px" gap="md">
      <Card>First panel</Card>
      <Card>Second panel</Card>
      <Card>Third panel</Card>
    </ResponsiveSwitcher>
  );
}`,
    },
    {
      label: 'Preact',
      lang: 'tsx',
      code: `import { ResponsiveSwitcher, Card } from '@arclux/arc-ui-preact';

function AdaptiveLayout() {
  return (
    <ResponsiveSwitcher threshold="600px" gap="md">
      <Card>First panel</Card>
      <Card>Second panel</Card>
      <Card>Third panel</Card>
    </ResponsiveSwitcher>
  );
}`,
    },
    {
      label: 'HTML',
      lang: 'html',
      code: `<!-- Auto-generated by @arclux/prism — do not edit manually -->
<!-- arc-responsive-switcher — requires responsive-switcher.css + base.css (or arc-ui.css) -->
<div class="arc-responsive-switcher">
  <div class="switcher">
    ResponsiveSwitcher
  </div>
</div>`,
    },
    {
      label: 'HTML (Inline)',
      lang: 'html',
      code: `<!-- Auto-generated by @arclux/prism — do not edit manually -->
<!-- arc-responsive-switcher — self-contained, no external CSS needed -->
<div class="arc-responsive-switcher" style="display: block; container-type: inline-size">
  <div style="display: flex; flex-direction: row; gap: 16px">
    ResponsiveSwitcher
  </div>
</div>`,
    },
  ],

  seeAlso: ['stack', 'container'],
};
