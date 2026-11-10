import type { ComponentDef } from './_types';

export const uptime: ComponentDef = {
  name: 'Uptime',
  slug: 'uptime',
  tag: 'arc-uptime',
  tier: 'data',
  interactivity: 'hybrid',
  description:
    'A status-page strip of slim ticks, one per period, each colored by how that period went.',
  searchKeywords: ['status page', 'availability', 'incident', 'history', 'sla'],

  overview: `Uptime is a status-page history strip: a row of slim vertical ticks, one per period, each colored by how that period went. Green is operational, amber is degraded, red is an outage, and a neutral tick means no data. Hovering a tick, or focusing the strip and pressing the arrow keys, raises it with a glow in its status color and shows the period's label, exact percentage and status in a small bubble.

\`data\` takes one entry per period, oldest first. The simplest form is an array of numbers from 0 to 1, read as uptime fractions: 0.99 and above is operational, 0.95 and above is degraded, and anything lower is an outage. For more control, pass objects. An explicit \`status\` always wins over the thresholds, a \`value\` still counts toward the summary when the status is set by hand, and a \`label\` names the period in the hover detail. Numbers and objects can be mixed in one array.

The summary above the track is the mean of every value, set in the mono font. \`start-label\` and \`end-label\` caption the two ends. An empty array renders an empty track, not an error, so you can bind it before the data arrives.

Assistive technology gets the strip as one image, described by its period count, overall percentage and incident counts. Keyboard users still get each period: the track is a single tab stop, the arrow keys move between ticks, and a live region announces each one.`,

  features: [
    'Tick colors come from `--color-success`, `--color-warning` and `--color-error`',
    'Renders fully on the server, and the hover and keyboard detail hydrate on the client',
    '`--uptime-tick-gap` and `--uptime-tick-height` set the tick spacing and height',
  ],

  guidelines: {
    do: [
      'Order entries oldest first, so the newest period sits at the end where "Today" goes',
      'Caption the ends with `start-label` and `end-label`. Without them readers have to guess the time span',
      'Pass values, not only statuses, whenever you have them, so the summary has something to average',
      'Use `label` for the period\'s date ("Mar 4"). The hover detail and the screen reader announcement read it',
      'Set an explicit status when the number alone misleads. A 30-minute total outage still averages to 0.98 for the day',
      'Use one strip per monitored service, stacked',
    ],
    dont: [
      "Don't use Uptime for continuous metrics such as latency or throughput. Use Sparkline. Uptime shows health per period",
      "Don't use it to show whether you're online right now. Use ConnectionStatus. Uptime is history",
      "Don't go past about 120 periods. Ticks thinner than a couple of pixels stop reading as separate periods",
      "Don't rely on tick color alone to report an incident. Link to an incident log that explains it",
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
