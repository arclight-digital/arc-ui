import type { ComponentDef } from './_types';

export const sparkline: ComponentDef = {
  name: 'Sparkline',
  slug: 'sparkline',
  tag: 'arc-sparkline',
  tier: 'data',
  interactivity: 'static',
  description: 'Tiny inline SVG chart for embedding lightweight line or bar visualizations inside tables, stat cards, and dashboards. Renders from a simple comma-separated data string with no external charting dependencies.',

  overview: `Sparkline is a miniature, inline chart designed to show a trend at a glance without the overhead of a full charting library. Drop it into a table cell next to a metric, pair it with a stat card, or tuck it into a dashboard grid — wherever a compact visual summary beats a wall of numbers.

The component accepts data as a plain comma-separated string, parses it into a normalized SVG path, and renders either a smooth line or a series of bars depending on the \`type\` prop. Line mode draws a polyline with rounded joins and an optional filled area beneath the curve; bar mode renders evenly spaced rectangles that respond to hover with a subtle fill transition.

A draw-in animation on the line type plays once on mount (respecting \`prefers-reduced-motion\`), giving dashboards a polished feel without requiring JavaScript animation libraries. The component uses only CSS custom properties and SVG primitives, keeping the DOM lightweight and the render path fast even when dozens of sparklines appear on a single page.

Color defaults to \`var(--accent-primary)\` so the chart harmonizes with the rest of the design system out of the box. Override the \`color\` prop to use a custom CSS color value when you need a specific semantic color (e.g., green for revenue, red for error rate).`,

  features: [
    'Two chart types: smooth line and evenly spaced bars',
    'Optional area fill beneath the line with semi-transparent accent color',
    'Draw-in stroke animation on mount (800ms, respects prefers-reduced-motion)',
    'Bar hover state with smooth fill transition',
    'Configurable width, height, and color via props',
    'Subtle baseline rule using --border-subtle for visual grounding',
    'CSS parts (svg, line, area, bar) for external style overrides',
    'Inline-block display with vertical-align: middle for seamless text-flow embedding',
    'No external charting dependencies — pure SVG rendered by Lit',
    'Aria-hidden SVG — decorative by design, pair with visible text for accessibility',
  ],

  guidelines: {
    do: [
      'Use sparklines alongside a numeric value to give context — "42 requests" with a trend line is more useful than either alone',
      'Keep data sets short (5-20 points) for clarity at small sizes',
      'Use the line type for continuous trends (revenue over time, request latency)',
      'Use the bar type for discrete comparisons (daily counts, category breakdowns)',
      'Set fill=true when you want to emphasize the magnitude of a trend, not just its direction',
      'Use the color prop to match semantic meaning (green for growth, red for errors) when context demands it',
      'Pair with Stat, AnimatedNumber, or Badge for rich metric displays',
    ],
    dont: [
      'Use sparklines as the sole data representation for critical decisions — they lack axes, labels, and precision',
      'Pass more than ~30 data points — the chart becomes an unreadable blob at small sizes',
      'Rely on sparkline color alone to convey meaning; always include a text label or value nearby',
      'Animate sparklines in a long list or table — the draw-in effect becomes distracting at scale; consider disabling animation via CSS',
      'Use sparklines for interactive data exploration — reach for a full chart component when users need tooltips, zoom, or click-to-drill-down',
    ],
  },

  previewHtml: `<div style="display: flex; align-items: center; gap: 24px; flex-wrap: wrap;">
  <div style="display: flex; flex-direction: column; align-items: center; gap: 8px;">
    <arc-sparkline data="10,25,18,30,22,35,28,40,32" type="line"></arc-sparkline>
    <span style="font-size: 12px; color: var(--text-muted);">Line</span>
  </div>
  <div style="display: flex; flex-direction: column; align-items: center; gap: 8px;">
    <arc-sparkline data="10,25,18,30,22,35,28,40,32" type="line" fill></arc-sparkline>
    <span style="font-size: 12px; color: var(--text-muted);">Line + Fill</span>
  </div>
  <div style="display: flex; flex-direction: column; align-items: center; gap: 8px;">
    <arc-sparkline data="10,25,18,30,22,35,28,40,32" type="bar"></arc-sparkline>
    <span style="font-size: 12px; color: var(--text-muted);">Bar</span>
  </div>
</div>`,

  replayable: true,

  props: [
    {
      name: 'data',
      type: 'string',
      default: "''",
      description: 'Comma-separated numeric values that define the chart data points (e.g. "10,25,18,30,22,35,28"). Parsed into a number array at render time. Non-numeric entries are silently dropped.',
    },
    {
      name: 'type',
      type: "'line' | 'bar'",
      default: "'line'",
      description: "Chart type. Line renders a polyline with optional area fill; bar renders evenly spaced rectangles.",
    },
    {
      name: 'color',
      type: 'string',
      default: "''",
      description: 'CSS color override applied to strokes and fills. Accepts any valid CSS color value. Defaults to var(--accent-primary) when not set.',
    },
    {
      name: 'width',
      type: 'number',
      default: '120',
      description: 'SVG viewport width in pixels.',
    },
    {
      name: 'height',
      type: 'number',
      default: '32',
      description: 'SVG viewport height in pixels.',
    },
    {
      name: 'fill',
      type: 'boolean',
      default: 'false',
      description: 'When true and type is "line", fills the area beneath the curve with a semi-transparent accent color.',
    },
  ],

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
      <Sparkline data="10,25,18,30,22,35,28,40,32" type="line" fill />
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
