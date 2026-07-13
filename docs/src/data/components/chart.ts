import type { ComponentDef } from './_types';

export const chart: ComponentDef = {
  name: 'Chart',
  slug: 'chart',
  tag: 'arc-chart',
  tier: 'data',
  interactivity: 'interactive',
  status: 'beta',
  description: 'An SVG chart component for dashboards with line, area, bar, and donut types. Data-driven from a series array, with automatic nice-tick scales, a legend, hover crosshair and tooltips, and a visually-hidden data table for assistive technology.',

  overview: `Chart renders line, area, grouped/stacked bar, and donut charts from plain JavaScript data — no external charting library. Pass a \`series\` array of \`{ label, data }\` objects and a \`labels\` array of x-axis categories, and the component computes a nice 1/2/5-step y scale, recessive horizontal gridlines, abbreviated axis numbers (1.2k, 3.4M), and thin marks in the fixed ARC chart palette.

Series colors are assigned in fixed order from \`--chart-1\` through \`--chart-6\` and are never cycled. When more than six series are provided, the extras are summed into an "Other" series and flagged in the legend, so identity stays readable. The legend renders automatically for two or more series and is omitted for a single series.

A hover layer ships by default: line and area charts show a vertical crosshair with a tooltip listing every series value at the hovered category, while bar and donut charts show per-mark tooltips. Hit targets are invisible full-height columns per category, so users never have to hit a 2px line. Clicking a mark emits \`arc-mark-click\` with the series index, category index, and value. For assistive technology, the chart container carries a generated \`role="img"\` summary and a visually-hidden \`<table>\` exposes the real values.`,

  features: [
    'Four chart types: line, area, grouped bar, stacked bar, and donut',
    'Fixed-order series colors --chart-1 through --chart-6, never cycled',
    'More than 6 series automatically fold into a summed "Other" series',
    'Nice-tick y scale (1/2/5 steps) with abbreviated axis numbers (1.2k, 3.4M)',
    'Single y-axis with recessive 1px horizontal gridlines only',
    'Hover crosshair + all-series tooltip on line/area; per-mark tooltips on bar/donut',
    'Full-plot-height invisible hover columns — no pixel-hunting thin marks',
    'arc-mark-click event with seriesIndex, index, and value',
    'Intl.NumberFormat value formatting: number, percent, or currency',
    'Legend with 8px color chips, rendered automatically for 2+ series',
    'role="img" summary label plus a visually-hidden data table for AT users',
    'ResizeObserver-driven responsive width; respects prefers-reduced-motion',
    'Styleable via ::part(chart), ::part(legend), ::part(tooltip), ::part(axis)',
  ],

  guidelines: {
    do: [
      'Keep charts to 6 or fewer series — beyond that, pre-aggregate or split into small multiples',
      'Use type="area" for a single dominant series and type="line" when comparing trends',
      'Use stacked only when the total is meaningful; use grouped bars to compare series per category',
      'Set value-format="percent" with fractional data (0.24 renders as 24%)',
      'Provide a label for every series — labels drive the legend, tooltip, and data table',
      'Listen to arc-mark-click to drive drill-down navigation or detail panels',
    ],
    dont: [
      'Plot two measures of different scale on one chart — there is one y-axis, never dual axes',
      'Use donut charts for more than ~6 segments or for precise comparisons — use bars instead',
      'Hide the legend on multi-series charts unless the series are directly labeled nearby',
      'Encode meaning in custom mark colors — the fixed palette keeps series identity consistent',
      'Use hide-axis on charts where readers need to look up values — it is for compact trend panels',
      'Feed stacked bars negative values; stacking assumes non-negative data',
    ],
  },

  previewHtml: `<div style="display:grid; gap:24px; width:100%">
  <arc-chart id="demo-chart-bar" type="bar" height="220"></arc-chart>
  <arc-chart id="demo-chart-line" type="line" height="220"></arc-chart>
</div>`,

  previewSetup: `const bar = el.querySelector('#demo-chart-bar');
if (bar) {
  bar.labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  bar.series = [
    { label: 'North', data: [42, 38, 55, 61, 48, 70] },
    { label: 'South', data: [30, 44, 39, 52, 58, 46] },
    { label: 'West', data: [22, 27, 34, 30, 41, 39] }
  ];
}
const line = el.querySelector('#demo-chart-line');
if (line) {
  line.labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  line.series = [
    { label: 'Sessions', data: [1200, 1850, 1640, 2100, 2400, 1980, 1500] },
    { label: 'Signups', data: [180, 240, 210, 320, 380, 300, 220] }
  ];
}`,

  props: [
    {
      name: 'type',
      type: "'line' | 'area' | 'bar' | 'donut'",
      default: "'line'",
      description: 'The chart form. Line and area share the x axis across all series; bar renders grouped columns (or stacked with the `stacked` attribute); donut renders one segment per series (or per category when a single series is given).',
    },
    {
      name: 'series',
      type: 'Array<{ label: string, data: number[] }>',
      default: '[]',
      description: 'The data that drives the chart. Each entry is one series; all series share the x axis defined by `labels`. Set via JavaScript property, not an attribute. Colors are assigned in fixed order from --chart-1 to --chart-6; series beyond six are summed into an "Other" series noted in the legend.',
    },
    {
      name: 'labels',
      type: 'string[]',
      default: '[]',
      description: 'Category labels for the x axis (or donut segment names when a single series is given). Labels that would collide are automatically thinned — every Nth label renders based on available width.',
    },
    {
      name: 'stacked',
      type: 'boolean',
      default: 'false',
      description: 'Bar type only. Stacks series segments on a shared baseline with 2px surface gaps between segments; only the outermost segment gets the rounded value end. Assumes non-negative data.',
    },
    {
      name: 'hide-legend',
      type: 'boolean',
      default: 'false',
      description: 'Suppresses the legend. By default the legend renders for two or more series and is omitted for a single series.',
    },
    {
      name: 'hide-axis',
      type: 'boolean',
      default: 'false',
      description: 'Removes the axis layer — gridlines, y tick labels, and x category labels — for compact trend panels where exact values are read from the tooltip.',
    },
    {
      name: 'height',
      type: 'number',
      default: '260',
      description: 'Chart height in pixels. Width is fluid and tracked with a ResizeObserver.',
    },
    {
      name: 'value-format',
      type: "'number' | 'percent' | 'currency'",
      default: "'number'",
      description: 'How values are formatted in tooltips, the axis, and the accessible data table, via Intl.NumberFormat. Percent expects fractional data (0.24 → 24%). Axis numbers are abbreviated (1.2k, 3.4M).',
    },
    {
      name: 'currency',
      type: 'string',
      default: "'USD'",
      description: 'ISO 4217 currency code used when value-format="currency".',
    },
  ],

  events: [
    { name: 'arc-mark-click', description: 'Fired when a mark (bar, stacked segment, line point column, or donut segment) is clicked. detail: { seriesIndex, index, value }. Indices refer to displayed series after any "Other" folding; a folded donut segment reports seriesIndex -1.' },
  ],

  tabs: [
    {
      label: 'Web Component',
      lang: 'html',
      code: `<arc-chart id="revenue-chart" type="bar" stacked value-format="currency" height="280"></arc-chart>

<script type="module">
  import '@arclux/arc-ui/chart';

  const chart = document.querySelector('#revenue-chart');
  chart.labels = ['Q1', 'Q2', 'Q3', 'Q4'];
  chart.series = [
    { label: 'Subscriptions', data: [42000, 48000, 51000, 62000] },
    { label: 'Services', data: [18000, 16500, 21000, 24000] },
    { label: 'Licensing', data: [9000, 11000, 10500, 14000] }
  ];

  chart.addEventListener('arc-mark-click', (e) => {
    const { seriesIndex, index, value } = e.detail;
    console.log('clicked', seriesIndex, index, value);
  });
</script>`,
    },
    {
      label: 'React',
      lang: 'tsx',
      code: `import { Chart } from '@arclux/arc-ui-react';

const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
const series = [
  { label: 'Sessions', data: [1200, 1850, 1640, 2100, 2400, 1980] },
  { label: 'Signups', data: [180, 240, 210, 320, 380, 300] }
];

export function TrafficChart() {
  return (
    <Chart
      type="line"
      labels={labels}
      series={series}
      height={280}
      onArcMarkClick={(e) => console.log(e.detail)}
    />
  );
}`,
    },
    {
      label: 'Vue',
      lang: 'html',
      code: `<script setup>
import { Chart } from '@arclux/arc-ui-vue';

const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
const series = [
  { label: 'Sessions', data: [1200, 1850, 1640, 2100, 2400, 1980] },
  { label: 'Signups', data: [180, 240, 210, 320, 380, 300] }
];
</script>

<template>
  <Chart type="line" :labels="labels" :series="series" :height="280" />
</template>`,
    },
  ],

  seeAlso: ['sparkline', 'stat', 'data-table', 'meter'],
};
