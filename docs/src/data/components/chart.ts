import type { ComponentDef } from './_types';

export const chart: ComponentDef = {
  name: 'Chart',
  slug: 'chart',
  tag: 'arc-chart',
  tier: 'data',
  interactivity: 'interactive',
  description:
    'Line, area, bar and donut charts drawn in SVG from a plain array of series, with no charting library.',

  overview: `Chart draws line, area, grouped or stacked bar, and donut charts from plain JavaScript data, with no charting library. Pass a \`series\` array of \`{ label, data }\` objects and a \`labels\` array of x-axis categories. The component works out a 1/2/5-step y scale, faint horizontal gridlines, abbreviated axis numbers (1.2k, 3.4M) and thin marks in the ARC chart palette.

Series take their colors in fixed order from \`--chart-1\` to \`--chart-6\`, never cycled. With more than six series, the extras are summed into an "Other" series, flagged in the legend, so no two series share a color. The legend appears for two or more series and not for one.

On hover, line and area charts show a vertical crosshair with a tooltip listing every series at that category. Bar and donut charts show a tooltip per mark. The hover targets are invisible full-height columns, one per category, so nobody has to hit a 2px line. Clicking a mark fires \`arc-mark-click\` with the series index, category index and value. For assistive technology, the chart has a generated \`role="img"\` summary and a visually hidden \`<table>\` of the real values.`,

  features: [
    'One y-axis, with 1px horizontal gridlines only',
    '`value-format` formats values with `Intl.NumberFormat` as number, percent or currency',
    'Legend chips are 8px, in the series color',
    'Width follows the container via ResizeObserver',
  ],

  guidelines: {
    do: [
      'Keep a chart to six series or fewer. Past that, aggregate first or split into small multiples',
      'Use type="area" for one dominant series and type="line" to compare trends',
      'Stack bars only when the total means something. Use grouped bars to compare series within a category',
      'Pass fractions with value-format="percent" (0.24 renders as 24%)',
      'Label every series. The labels feed the legend, the tooltip and the data table',
      'Use arc-mark-click for drill-down or a detail panel',
    ],
    dont: [
      'Don\'t plot two measures with different scales on one chart. There is one y-axis and no second one',
      'Don\'t use a donut for more than about six segments or for precise comparison. Use bars',
      'Don\'t hide the legend on a multi-series chart unless the series are labeled right next to the lines',
      'Don\'t color marks yourself to carry meaning. The fixed palette keeps each series the same color everywhere',
      'Don\'t use hide-axis where readers need to look up values. It is for compact trend panels',
      'Don\'t give stacked bars negative values. Stacking assumes non-negative data',
    ],
  },

  previewLayout: 'block',
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
    {
      label: 'Svelte',
      lang: 'html',
      code: `<script>
  import { Chart } from '@arclux/arc-ui-svelte';

  const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  const series = [
    { label: 'Sessions', data: [1200, 1850, 1640, 2100, 2400, 1980] },
    { label: 'Signups', data: [180, 240, 210, 320, 380, 300] }
  ];
</script>

<Chart type="line" {labels} {series} height={280} on:arc-mark-click={(e) => console.log(e.detail)} />`,
    },
    {
      label: 'Angular',
      lang: 'ts',
      code: `import { Component } from '@angular/core';
import { Chart } from '@arclux/arc-ui-angular';

@Component({
  imports: [Chart],
  template: \`
    <arc-chart
      type="line"
      [labels]="labels"
      [series]="series"
      [height]="280"
      (arcMarkClick)="onMarkClick($event)"
    ></arc-chart>
  \`,
})
export class TrafficChartComponent {
  labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  series = [
    { label: 'Sessions', data: [1200, 1850, 1640, 2100, 2400, 1980] },
    { label: 'Signups', data: [180, 240, 210, 320, 380, 300] }
  ];

  onMarkClick(e: CustomEvent) {
    console.log(e.detail);
  }
}`,
    },
  ],

  seeAlso: ['sparkline', 'stat', 'data-grid', 'meter'],
};
