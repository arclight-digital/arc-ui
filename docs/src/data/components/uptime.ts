import type { ComponentDef } from './_types';

export const uptime: ComponentDef = {
  name: 'Uptime',
  slug: 'uptime',
  tag: 'arc-uptime',
  tier: 'data',
  interactivity: 'hybrid',
  description:
    'Status-page uptime history strip: one slim tick per period, colored by status, with hover and keyboard detail. Accepts plain uptime fractions or explicit status objects and renders the computed overall percentage above the track.',
  searchKeywords: ['status page', 'availability', 'incident', 'history', 'sla'],

  overview: `Uptime is the 90-day history strip every status page carries: a row of slim vertical ticks, one per period, each colored by how that period went. Green means operational, amber means degraded, red means an outage, and a neutral tick means no data was recorded. Hovering a tick (or focusing the strip and pressing the arrow keys) raises it with the house status glow and shows its detail — the period's label, its exact percentage, and its status — in a small built-in bubble.

The \`data\` property takes one entry per period, oldest first. The simplest form is an array of numbers between 0 and 1, read as uptime fractions: 0.99 and above renders as operational, 0.95 and above as degraded, and anything lower as an outage. When you need more control, pass objects instead — an explicit \`status\` always wins over the threshold, a \`value\` feeds the summary math even when the status is pinned by hand, and a \`label\` names the period in the hover detail. The two forms mix freely in one array.

The summary line above the track is the mean of every value in the data, rendered in the mono role as status-page convention expects. \`start-label\` and \`end-label\` caption the two ends of the track, and an empty array renders as an empty track rather than an error, so the component is safe to bind before the data arrives.

To assistive technology the strip is a single image with a computed description — period count, overall percentage, and incident counts — rather than ninety tab stops. Keyboard users still get per-period detail: the track takes focus once, arrow keys walk the ticks, and a live region announces each one.`,

  features: [
    'One slim tick per period, colored from the `--color-success` / `--color-warning` / `--color-error` tokens',
    'Accepts plain uptime fractions (0..1) or `{ value, status, label }` objects, mixed freely',
    'Documented thresholds for the number form: ≥ 0.99 up, ≥ 0.95 degraded, below down',
    'Explicit `status` on an object overrides the threshold; `value` still feeds the summary',
    'Overall percentage computed from the data and rendered in `var(--font-mono)`',
    'Hover or arrow-key a tick to raise it with the status glow and show its detail bubble',
    'Single tab stop with a rich `aria-label` summary and a live region for keyboard inspection',
    'Empty or missing data renders an empty track — safe to bind before data arrives',
    'Server-renders fully; detail interaction hydrates on the client',
    'Tick gap and height tunable via `--uptime-tick-gap` and `--uptime-tick-height`',
  ],

  guidelines: {
    do: [
      'Order entries oldest first, so the newest period sits at the reading end where "Today" belongs',
      'Caption the ends with start-label and end-label — a bare strip forces readers to guess its time span',
      'Pass values (not just statuses) whenever you have them, so the summary percentage has something to average',
      'Use the label field for the period date ("Mar 4") — it is what the hover detail and screen reader announcement read out',
      'Pin an explicit status when the number alone misleads — a 30-minute total outage still averages to 0.98',
      'Keep one strip per monitored service and stack them, as status pages do',
    ],
    dont: [
      "Do not use Uptime for continuous metrics like latency or throughput — that trend is Sparkline's job; Uptime shows discrete per-period health",
      'Do not use it as a live indicator of the current connection — Connection Status owns "are we online right now"; Uptime is history',
      'Do not exceed roughly 120 periods — ticks thinner than a couple of pixels stop reading as individual periods',
      'Do not rely on tick color alone to report an incident; the strip summarizes, an incident log explains',
    ],
  },

  previewLayout: 'block',
  previewHtml: `<div style="max-width: 640px; margin-inline: auto;">
  <arc-uptime id="demo-uptime" start-label="90 days ago" end-label="Today"></arc-uptime>
</div>`,
  previewSetup: `const strip = el.querySelector('#demo-uptime');
if (strip) {
  const days = 90;
  const fmt = new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' });
  strip.data = Array.from({ length: days }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (days - 1 - i));
    // A clean history with two incidents: an outage day mid-window with
    // degraded recovery, and a brief degraded blip near the end.
    let value = 1;
    if (i === 41) value = 0.62;
    if (i === 42) value = 0.97;
    if (i === 78) value = 0.981;
    return { value, label: fmt.format(date) };
  });
}`,

  tabs: [
    {
      label: 'Web Component',
      lang: 'html',
      code: `<script type="module" src="@arclux/arc-ui"></script>

<arc-uptime id="api-uptime" start-label="90 days ago" end-label="Today"></arc-uptime>

<script>
  const strip = document.querySelector('#api-uptime');

  // Numbers are uptime fractions; thresholds pick the color.
  strip.data = [1, 1, 0.998, 0.97, 0.62, 1, 1];

  // Or objects, when you need labels or an explicit status:
  strip.data = [
    { value: 1, label: 'Mar 1' },
    { value: 0.98, status: 'down', label: 'Mar 2' }, // status wins over the threshold
    { status: 'none', label: 'Mar 3' },              // no data recorded
  ];
</script>`,
    },
    {
      label: 'React',
      lang: 'tsx',
      code: `import { Uptime } from '@arclux/arc-ui-react';

const history = Array.from({ length: 90 }, (_, i) => ({
  value: i === 41 ? 0.62 : 1,
  label: \`Day \${i + 1}\`,
}));

export function ServiceStatus() {
  return <Uptime data={history} startLabel="90 days ago" endLabel="Today" />;
}`,
    },
    {
      label: 'Vue',
      lang: 'html',
      code: `<script setup>
import { Uptime } from '@arclux/arc-ui-vue';

const history = Array.from({ length: 90 }, (_, i) => ({
  value: i === 41 ? 0.62 : 1,
  label: \`Day \${i + 1}\`,
}));
</script>

<template>
  <Uptime :data="history" start-label="90 days ago" end-label="Today" />
</template>`,
    },
    {
      label: 'Svelte',
      lang: 'html',
      code: `<script>
  import { Uptime } from '@arclux/arc-ui-svelte';

  const history = Array.from({ length: 90 }, (_, i) => ({
    value: i === 41 ? 0.62 : 1,
    label: \`Day \${i + 1}\`,
  }));
</script>

<Uptime data={history} start-label="90 days ago" end-label="Today" />`,
    },
    {
      label: 'Angular',
      lang: 'ts',
      code: `import { Component } from '@angular/core';
import { Uptime } from '@arclux/arc-ui-angular';

@Component({
  imports: [Uptime],
  template: \`
    <arc-uptime [data]="history" start-label="90 days ago" end-label="Today" />
  \`,
})
export class ServiceStatusComponent {
  history = Array.from({ length: 90 }, (_, i) => ({
    value: i === 41 ? 0.62 : 1,
    label: \`Day \${i + 1}\`,
  }));
}`,
    },
    {
      label: 'Solid',
      lang: 'tsx',
      code: `import { Uptime } from '@arclux/arc-ui-solid';

const history = Array.from({ length: 90 }, (_, i) => ({
  value: i === 41 ? 0.62 : 1,
  label: \`Day \${i + 1}\`,
}));

export function ServiceStatus() {
  return <Uptime data={history} startLabel="90 days ago" endLabel="Today" />;
}`,
    },
    {
      label: 'Preact',
      lang: 'tsx',
      code: `import { Uptime } from '@arclux/arc-ui-preact';

const history = Array.from({ length: 90 }, (_, i) => ({
  value: i === 41 ? 0.62 : 1,
  label: \`Day \${i + 1}\`,
}));

export function ServiceStatus() {
  return <Uptime data={history} startLabel="90 days ago" endLabel="Today" />;
}`,
    },
  ],

  seeAlso: ['sparkline', 'connection-status', 'meter', 'stat'],
};
