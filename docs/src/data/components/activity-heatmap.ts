import type { ComponentDef } from './_types';

export const activityHeatmap: ComponentDef = {
  name: 'Activity Heatmap',
  slug: 'activity-heatmap',
  tag: 'arc-activity-heatmap',
  tier: 'data',
  interactivity: 'hybrid',
  description:
    'GitHub-style contribution calendar: a year of day cells, one column per week, each tinted by intensity on a five-step accent ramp, with hover and keyboard detail.',
  searchKeywords: ['contribution', 'calendar', 'commits', 'punch card', 'github graph', 'streak'],

  overview: `Activity Heatmap is the contribution calendar every developer already knows how to read: fifty-two columns of seven cells, one cell per day, tinted deeper as the day gets busier. Month labels run along the top, sparse weekday labels down the side, and a Less→More legend anchors the ramp. Hovering a cell (or focusing the grid and pressing the arrow keys) raises it with the house glow and shows its detail — the date and the day's label or value — in a small built-in bubble.

The \`data\` property takes one entry per day with activity: an ISO \`date\`, a numeric \`value\`, and an optional \`label\` that replaces the bare number in the hover detail ("7 commits" reads better than "7"). Days without an entry render as empty cells, so sparse data needs no zero-filling. By default the grid ends today and spans back \`weeks\` columns; pin \`end-date\` to show a fixed window. When \`end-date\` is unset and the component renders server-side, the anchor is derived from the newest date in the data instead of the server's clock, so the server output stays a pure function of props — pin \`end-date\` whenever server and client must agree exactly.

Intensity is relative by default: the nonzero values are split into quartiles, and each quartile maps to one step of the accent ramp, so a quiet repository and a busy one both use the full range. When absolute comparison matters — two heatmaps side by side, or a known ceiling — set \`max\` and the ramp becomes a linear scale from zero to that value. The ramp itself is composed from \`--accent-primary-rgb\` at five alphas, so overriding one token recolors the whole calendar.

To assistive technology the grid is a single image with a computed description — day count, end date, total, and active days — rather than three hundred and sixty-four tab stops. Keyboard users still get per-day detail: the grid takes focus once, up and down move a day, left and right move a week, Home and End jump to the ends, and a live region announces each cell.`,

  features: [
    'One cell per day in week columns, the layout every contribution graph has taught readers',
    'Five-step intensity ramp composed from `--accent-primary-rgb` — one token override recolors it all',
    'Quartile mapping by default, so sparse and busy datasets both use the full range',
    'Linear scale via `max` when absolute comparison across heatmaps matters',
    'Sparse `data` is fine: days without an entry render as empty cells, no zero-filling',
    'Month labels along the top and Mon/Wed/Fri weekday labels down the side, from `Intl`',
    'Hover or arrow-key a cell to raise it with the house glow and show its detail bubble',
    'Grid-semantics keyboard inspection: up/down a day, left/right a week, Home/End the span',
    'Single tab stop with a rich `aria-label` summary and a live region for keyboard users',
    'Sunday or Monday week start via `week-start`; deterministic server rendering documented on `end-date`',
    'Cell size and gap tunable via `--activity-heatmap-cell` and `--activity-heatmap-gap`',
  ],

  guidelines: {
    do: [
      'Use it for daily event counts over months — commits, deploys, workouts, practice sessions',
      'Give each entry a label ("7 commits") — it is what the hover detail and screen reader announcement read out',
      'Pin end-date when the window is a fixed report ("2025 in review") or when server and client must render identically',
      'Set max when readers will compare two heatmaps side by side — quartile ramps are relative and would mislead',
      'Match week-start to your audience: Sunday is the GitHub convention, Monday the ISO one',
      'Keep the legend unless the surrounding UI already explains the ramp — it is the only key the colors have',
    ],
    dont: [
      "Do not use it for a continuous metric like latency or revenue — that trend is Sparkline's job; the heatmap shows daily density",
      'Do not use it for per-period pass/fail health — Uptime owns discrete status history with its own color semantics',
      'Do not use it to display scheduled items on dates — Calendar shows what happens when; the heatmap shows how much happened',
      'Do not encode more than one measure per cell — one value, one ramp; two measures need two heatmaps',
    ],
  },

  previewLayout: 'block',
  previewHtml: `<div style="display: flex; justify-content: center; overflow-x: auto; overflow-y: hidden;">
  <arc-activity-heatmap id="demo-activity"></arc-activity-heatmap>
</div>`,
  previewSetup: `const map = el.querySelector('#demo-activity');
if (map) {
  // A plausible year of commits: weekday-weighted, with a release push about
  // four months in and a hot streak running up to today. Seeded so the
  // preview is the same shape on every visit.
  let seed = 42;
  const rand = () => (seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296;
  const days = 364;
  const today = new Date();
  const data = [];
  for (let i = 0; i < days; i++) {
    const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() - (days - 1 - i));
    const weekend = d.getDay() === 0 || d.getDay() === 6;
    const streak = (i > 110 && i < 134) || i > 336;
    const chance = (weekend ? 0.2 : 0.72) + (streak ? 0.25 : 0);
    if (rand() > chance) continue;
    const value = Math.max(1, Math.round(rand() * (streak ? 14 : 6)));
    const iso = \`\${d.getFullYear()}-\${String(d.getMonth() + 1).padStart(2, '0')}-\${String(d.getDate()).padStart(2, '0')}\`;
    data.push({ date: iso, value, label: value === 1 ? '1 commit' : \`\${value} commits\` });
  }
  map.data = data;
}`,

  tabs: [
    {
      label: 'Web Component',
      lang: 'html',
      code: `<script type="module" src="@arclux/arc-ui"></script>

<arc-activity-heatmap id="api-activity" end-date="2026-12-31" weeks="52"></arc-activity-heatmap>

<script>
  const map = document.querySelector('#api-activity');

  // One entry per day with activity; empty days need no entry.
  map.data = [
    { date: '2026-12-29', value: 3, label: '3 commits' },
    { date: '2026-12-30', value: 11, label: '11 commits' },
    { date: '2026-12-31', value: 6, label: '6 commits' },
  ];

  // Quartiles scale the ramp by default; pin max for an absolute scale:
  map.max = 12;
</script>`,
    },
    {
      label: 'React',
      lang: 'tsx',
      code: `import { ActivityHeatmap } from '@arclux/arc-ui-react';

const year = commits.map((day) => ({
  date: day.date, // 'YYYY-MM-DD'
  value: day.count,
  label: \`\${day.count} commits\`,
}));

export function ContributionGraph() {
  return <ActivityHeatmap data={year} weeks={52} weekStart="monday" />;
}`,
    },
    {
      label: 'Vue',
      lang: 'html',
      code: `<script setup>
import { ActivityHeatmap } from '@arclux/arc-ui-vue';

const year = commits.map((day) => ({
  date: day.date,
  value: day.count,
  label: \`\${day.count} commits\`,
}));
</script>

<template>
  <ActivityHeatmap :data="year" :weeks="52" week-start="monday" />
</template>`,
    },
    {
      label: 'Svelte',
      lang: 'html',
      code: `<script>
  import { ActivityHeatmap } from '@arclux/arc-ui-svelte';

  const year = commits.map((day) => ({
    date: day.date,
    value: day.count,
    label: \`\${day.count} commits\`,
  }));
</script>

<ActivityHeatmap data={year} weeks={52} weekStart="monday" />`,
    },
    {
      label: 'Angular',
      lang: 'ts',
      code: `import { Component } from '@angular/core';
import { ActivityHeatmap } from '@arclux/arc-ui-angular';

@Component({
  imports: [ActivityHeatmap],
  template: \`
    <arc-activity-heatmap [data]="year" weeks="52" week-start="monday" />
  \`,
})
export class ContributionGraphComponent {
  year = commits.map((day) => ({
    date: day.date,
    value: day.count,
    label: \`\${day.count} commits\`,
  }));
}`,
    },
    {
      label: 'Solid',
      lang: 'tsx',
      code: `import { ActivityHeatmap } from '@arclux/arc-ui-solid';

const year = commits.map((day) => ({
  date: day.date,
  value: day.count,
  label: \`\${day.count} commits\`,
}));

export function ContributionGraph() {
  return <ActivityHeatmap data={year} weeks={52} weekStart="monday" />;
}`,
    },
    {
      label: 'Preact',
      lang: 'tsx',
      code: `import { ActivityHeatmap } from '@arclux/arc-ui-preact';

const year = commits.map((day) => ({
  date: day.date,
  value: day.count,
  label: \`\${day.count} commits\`,
}));

export function ContributionGraph() {
  return <ActivityHeatmap data={year} weeks={52} weekStart="monday" />;
}`,
    },
  ],

  seeAlso: ['uptime', 'sparkline', 'calendar', 'chart'],
};
