import type { ComponentDef } from './_types';

export const sparkline: ComponentDef = {
  name: 'Sparkline',
  slug: 'sparkline',
  tag: 'arc-sparkline',
  tier: 'data',
  interactivity: 'static',
  description:
    'A small inline line or bar chart, drawn as SVG from a comma-separated string of numbers.',

  overview: `Sparkline is a small trend chart, 120 by 32 pixels by default. Put it in a table cell next to a metric, beside a stat card, or in a dashboard grid. It has no axes, labels or tooltips. For those, use a full chart.

Pass the values as a comma-separated string in \`data\`. \`type="line"\` draws a line with rounded joins, and \`fill\` adds a shaded area under it. \`type="bar"\` draws evenly spaced bars that fill in more strongly on hover. The line draws itself in over 800ms when it first renders, and appears at once under \`prefers-reduced-motion\`.

The color is \`--accent-primary\` by default. \`color\` takes any CSS color, such as \`var(--color-success)\` for revenue or \`#dc2626\` for an error rate, and an \`"r, g, b"\` triplet still works. It sets the line, the area under it at 10% opacity, and the bars at 30% (60% on hover).`,

  features: [
    'A baseline rule in `--border-subtle`',
    'CSS parts `svg`, `line`, `area` and `bar`',
    '`display: inline-block` with `vertical-align: middle`, so it lines up with surrounding text',
    'The SVG is `aria-hidden`, so screen readers skip it. Put the number it illustrates in visible text',
  ],

  guidelines: {
    do: [
      'Keep data short, 5 to 20 points. Past about 30 the chart becomes an unreadable blob',
      'Use a line for continuous trends like revenue over time or request latency',
      'Use bars for discrete counts like daily totals or categories',
      'Set `fill` to stress how large a trend is, not only its direction',
    ],
    dont: [
      'Don\'t base important decisions on a sparkline alone. It has no axes, labels or precision',
      'Don\'t put dozens of line sparklines in one table. Each one draws itself in, and there\'s no setting to turn that off',
    ],
  },

  previewHtml: `<div style="display: flex; align-items: center; gap: 24px; flex-wrap: wrap;">
  <div style="display: flex; flex-direction: column; align-items: center; gap: 8px;">
    <arc-sparkline data="10,25,18,30,22,35,28,40,32" type="line"></arc-sparkline>
    <span style="font-size: 12px; color: var(--text-muted);">Line</span>
  </div>
  <div style="display: flex; flex-direction: column; align-items: center; gap: 8px;">
    <arc-sparkline data="10,25,18,30,22,35,28,40,32" type="line" fill></arc-sparkline>
    <span style="font-size: 12px; color: var(--text-muted);">Line + fill</span>
  </div>
  <div style="display: flex; flex-direction: column; align-items: center; gap: 8px;">
    <arc-sparkline data="10,25,18,30,22,35,28,40,32" type="bar"></arc-sparkline>
    <span style="font-size: 12px; color: var(--text-muted);">Bar</span>
  </div>
</div>`,

  replayable: true,

  tabs: [
    {
      label: 'Web Component',
      lang: 'html',
      code: `<script type="module" src="@arclux/arc-ui"></script>

<!-- Line sparkline -->
<arc-sparkline data="10,25,18,30,22,35,28,40,32" type="line"></arc-sparkline>

<!-- Line with area fill -->
<arc-sparkline data="10,25,18,30,22,35,28,40,32" type="line" fill></arc-sparkline>

<!-- Bar sparkline -->
<arc-sparkline data="10,25,18,30,22,35,28,40,32" type="bar"></arc-sparkline>

<!-- Custom size and color -->
<arc-sparkline
  data="5,12,8,20,15,25,18"
  type="line"
  width="200"
  height="48"
  color="var(--color-success)"
></arc-sparkline>`,
    },
    {
      label: 'React',
      lang: 'tsx',
      code: `import { Sparkline } from '@arclux/arc-ui-react';

export function MetricCard() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
      <span style={{ fontSize: 24, fontWeight: 600 }}>2,847</span>
      <Sparkline data="10,25,18,30,22,35,28,40,32" type="line" fill />
    </div>
  );
}`,
    },
    {
      label: 'Vue',
      lang: 'html',
      code: `<script setup>
import { Sparkline } from '@arclux/arc-ui-vue';
</script>

<template>
  <div style="display: flex; align-items: center; gap: 16px;">
    <span style="font-size: 24px; font-weight: 600;">2,847</span>
    <Sparkline data="10,25,18,30,22,35,28,40,32" type="line" fill />
  </div>
</template>`,
    },
    {
      label: 'Svelte',
      lang: 'html',
      code: `<script>
  import { Sparkline } from '@arclux/arc-ui-svelte';
</script>

<div style="display: flex; align-items: center; gap: 16px;">
  <span style="font-size: 24px; font-weight: 600;">2,847</span>
  <Sparkline data="10,25,18,30,22,35,28,40,32" type="line" fill />
</div>`,
    },
    {
      label: 'Angular',
      lang: 'ts',
      code: `import { Component } from '@angular/core';
import { Sparkline } from '@arclux/arc-ui-angular';

@Component({
  imports: [Sparkline],
  template: \`
    <div style="display: flex; align-items: center; gap: 16px;">
      <span style="font-size: 24px; font-weight: 600;">2,847</span>
      <arc-sparkline data="10,25,18,30,22,35,28,40,32" type="line" fill />
    </div>
  \`,
})
export class MetricCardComponent {}`,
    },
    {
      label: 'Solid',
      lang: 'tsx',
      code: `import { Sparkline } from '@arclux/arc-ui-solid';

export function MetricCard() {
  return (
    <div style={{ display: 'flex', 'align-items': 'center', gap: '16px' }}>
      <span style={{ 'font-size': '24px', 'font-weight': '600' }}>2,847</span>
      <Sparkline data="10,25,18,30,22,35,28,40,32" type="line" fill />
    </div>
  );
}`,
    },
    {
      label: 'Preact',
      lang: 'tsx',
      code: `import { Sparkline } from '@arclux/arc-ui-preact';

export function MetricCard() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
      <span style={{ fontSize: 24, fontWeight: 600 }}>2,847</span>
      <Sparkline data="10,25,18,30,22,35,28,40,32" type="line" fill />
    </div>
  );
}`,
    },
  ],

  seeAlso: ['stat', 'animated-number', 'meter'],
};
