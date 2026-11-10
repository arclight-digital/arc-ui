import type { ComponentDef } from './_types';

export const activityHeatmap: ComponentDef = {
  name: 'Activity Heatmap',
  slug: 'activity-heatmap',
  tag: 'arc-activity-heatmap',
  tier: 'data',
  interactivity: 'hybrid',
  description:
    'A GitHub-style contribution calendar that shades one cell per day by how much happened that day.',
  searchKeywords: ['contribution', 'calendar', 'commits', 'punch card', 'github graph', 'streak'],

  overview: `Activity Heatmap draws a contribution calendar: 52 week columns, one cell per day, tinted deeper as the day gets busier. Month labels run along the top, Mon, Wed and Fri labels down the side, and a Less to More legend sits underneath. Hovering a cell, or focusing the grid and using the arrow keys, raises it with the glow and shows the date and the day's label or value in a small bubble.

The \`data\` property takes one entry per day with activity: an ISO \`date\`, a numeric \`value\`, and an optional \`label\` that replaces the bare number in the detail ("7 commits" instead of "7"). Days without an entry render as empty cells, so you don't need to fill in zeros. By default the grid ends today and runs back \`weeks\` columns (52). Set \`end-date\` to show a fixed window. When \`end-date\` is unset, the server render and the first client render anchor on the newest date in the data, and the browser switches to today one render later. Set \`end-date\` when server and client must match exactly.

Intensity is relative by default. The nonzero values are split into quartiles, one per step of the ramp, so a quiet repository and a busy one both use the full range. Set \`max\` to get a linear scale from zero to that value instead. Empty days use \`--surface-overlay\`, and the four active steps are \`--accent-primary-rgb\` at rising alpha, so overriding that one token recolors every step but the empty one.

Screen readers get the grid as one image with a summary label (day count, end date, total and active days), not 364 tab stops. The grid takes focus once: up and down move a day, left and right move a week, Home and End jump to the first and last day, and a live region reads out each cell.`,

  features: [
    'Weeks start on Sunday or Monday via `week-start`',
    'Month and weekday labels come from `Intl`',
    'Cell size and gap are set by `--activity-heatmap-cell` and `--activity-heatmap-gap`',
  ],

  guidelines: {
    do: [
      'Use it for daily counts over months: commits, deploys, workouts, practice sessions',
      'Give each entry a label ("7 commits"). The hover detail and the live region read it out',
      'Set end-date when the window is a fixed report ("2025 in review") or when server and client must render the same grid',
      "Set max when readers compare two heatmaps or there's a known ceiling. Quartile ramps are relative to each dataset, so side by side they mislead",
      'Match week-start to your readers: Sunday is the GitHub convention, Monday the ISO one',
      'Keep the legend unless the page already explains the ramp. It is the only key to the colors',
    ],
    dont: [
      "Don't use it for a continuous metric like latency or revenue. Use Sparkline",
      "Don't use it for pass/fail history per period. Use Uptime, which has its own status colors",
      "Don't use it to show scheduled items on dates. Use Calendar",
      "Don't put more than one measure in a cell. Two measures need two heatmaps",
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
