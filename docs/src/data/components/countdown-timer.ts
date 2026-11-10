import type { ComponentDef } from './_types';

export const countdownTimer: ComponentDef = {
  name: 'Countdown Timer',
  slug: 'countdown-timer',
  tag: 'arc-countdown-timer',
  tier: 'data',
  interactivity: 'interactive',
  description:
    'Counts down to a date and time in days, hours, minutes and seconds, and fires an event at zero.',

  overview: `CountdownTimer counts down to the date in \`target\`, which takes an ISO 8601 string or anything \`new Date()\` can parse. A date and time without a time zone is read as the visitor's local time, but a date on its own, such as \`2027-01-01\`, is read as midnight UTC. The display is four segments, labeled Days, Hours, Min and Sec, with colons between them. Each number is at least two mono digits with \`tabular-nums\`, so the width doesn't change as it ticks. A countdown of 100 days or more shows three digits of days.

It recalculates every second and stops its interval when removed from the page. At zero it fires \`arc-expired\` once and replaces the segments with the \`expired\` text, which defaults to "Expired". Setting a new \`target\` starts it again.

\`label\` adds an uppercase line above the countdown, such as "Sale ends". \`hide-zero-segments\` hides segments whose value is zero, so a countdown under a day drops the Days segment.`,

  features: [
    'Numbers use the accent text gradient, and segments get the interactive hover shadow',
    'CSS parts: `container`, `segment`, `number`, `label`, `separator`',
  ],

  guidelines: {
    do: [
      'Use it for event countdowns, product launches and sale deadlines',
      'Set a `label` that says what\'s being counted down to, such as "Launches in" or "Offer ends"',
      'Set `expired` to text that fits, such as "Now live"',
    ],
    dont: [
      "Don't use it for elapsed time or as a stopwatch. It only counts down",
      "Don't set a target in the past unless you want the expired text straight away",
      "Don't enforce deadlines with it. Check them on the server",
    ],
  },

  previewHtml: `<arc-countdown-timer target="2027-01-01T00:00:00" label="New Year"></arc-countdown-timer>`,

  tabs: [
    {
      label: 'Web Component',
      lang: 'html',
      code: `<!-- New Year countdown -->
<arc-countdown-timer
  target="2026-12-31T00:00:00"
  label="New Year"
></arc-countdown-timer>

<!-- Product launch with custom expired text -->
<arc-countdown-timer
  target="2026-06-15T09:00:00"
  label="Launches In"
  expired="Now Live!"
></arc-countdown-timer>

<!-- Short countdown, hiding zero segments -->
<arc-countdown-timer
  target="2026-03-01T18:00:00"
  hide-zero-segments
></arc-countdown-timer>`,
    },
    {
      label: 'React',
      lang: 'tsx',
      code: `import { CountdownTimer } from '@arclux/arc-ui-react';

function LaunchBanner({ launchDate }) {
  return (
    <CountdownTimer
      target={launchDate}
      label="Launches In"
      expired="Now Live!"
      onArcExpired={() => console.log('Countdown finished!')}
    />
  );
}`,
    },
    {
      label: 'Vue',
      lang: 'html',
      code: `<script setup>
import { CountdownTimer } from '@arclux/arc-ui-vue';

const launchDate = '2026-12-31T00:00:00';

function handleExpired() {
  console.log('Countdown finished!');
}
</script>

<template>
  <CountdownTimer
    :target="launchDate"
    label="New Year"
    expired="Happy New Year!"
    @arc-expired="handleExpired"
  />
</template>`,
    },
    {
      label: 'Svelte',
      lang: 'html',
      code: `<script>
  import { CountdownTimer } from '@arclux/arc-ui-svelte';

  const target = '2026-12-31T00:00:00';
</script>

<CountdownTimer
  {target}
  label="New Year"
  expired="Happy New Year!"
  on:arc-expired={() => console.log('Done!')}
/>`,
    },
    {
      label: 'Angular',
      lang: 'ts',
      code: `import { Component } from '@angular/core';
import { CountdownTimer } from '@arclux/arc-ui-angular';

@Component({
  imports: [CountdownTimer],
  template: \`
    <arc-countdown-timer
      target="2026-12-31T00:00:00"
      label="New Year"
      expired="Happy New Year!"
      (arc-expired)="onExpired()"
    />
  \`,
})
export class CountdownComponent {
  onExpired() {
    console.log('Countdown finished!');
  }
}`,
    },
    {
      label: 'Solid',
      lang: 'tsx',
      code: `import { CountdownTimer } from '@arclux/arc-ui-solid';

function LaunchCountdown() {
  return (
    <CountdownTimer
      target="2026-12-31T00:00:00"
      label="New Year"
      expired="Happy New Year!"
    />
  );
}`,
    },
    {
      label: 'Preact',
      lang: 'tsx',
      code: `import { CountdownTimer } from '@arclux/arc-ui-preact';

function LaunchCountdown() {
  return (
    <CountdownTimer
      target="2026-12-31T00:00:00"
      label="New Year"
      expired="Happy New Year!"
    />
  );
}`,
    },
  ],

  seeAlso: ['animated-number', 'stat', 'badge'],
};
