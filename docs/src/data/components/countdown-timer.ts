import type { ComponentDef } from './_types';

export const countdownTimer: ComponentDef = {
    name: 'Countdown Timer',
    slug: 'countdown-timer',
    tag: 'arc-countdown-timer',
    tier: 'data',
    interactivity: 'interactive',
    description: 'Live countdown to a target date/time with days, hours, minutes, and seconds segments.',

    overview: `CountdownTimer renders a live, self-updating countdown to a target date or time. The display is split into four card-like segments — days, hours, minutes, and seconds — each showing a large mono-spaced number with a gradient accent fill and an uppercase label beneath. Segments are separated by ghost-colored colons to reinforce the time-display metaphor.

The component parses any valid ISO 8601 string or JavaScript-parseable date via the \`target\` attribute and recalculates the remaining time every second using \`setInterval\`. When the countdown reaches zero, an \`arc-expired\` event is dispatched and the display switches to a configurable expired message (default: "Expired"). The interval is automatically cleaned up in \`disconnectedCallback\` to prevent memory leaks.

Numbers use \`font-variant-numeric: tabular-nums\` so digits maintain consistent width as they tick down, preventing layout shift. The segment cards gain a subtle glow on hover via \`box-shadow: var(--glow-hover)\`, and all transitions respect \`prefers-reduced-motion\`. An optional \`label\` attribute renders gradient-accent text above the countdown for context like "Launch In" or "Sale Ends".

The \`hide-zero-segments\` attribute suppresses leading zero-value segments — useful when the countdown is under 24 hours and showing "00 Days" adds no value.`,

    features: [
      'Live countdown updating every second via setInterval',
      'Automatic cleanup of interval timer in disconnectedCallback',
      'Gradient-accent number text with tabular-nums for stable layout',
      'Card-style segments with hover glow effect',
      'Dispatches arc-expired custom event when countdown reaches zero',
      'Configurable expired text via the expired attribute',
      'Optional label with gradient accent text above the countdown',
      'hide-zero-segments attribute to suppress leading zero segments',
      'Respects prefers-reduced-motion by disabling transitions',
      'CSS parts for container, segment, number, label, and separator',
    ],

    guidelines: {
      do: [
        'Use for event countdowns, product launches, and sale timers',
        'Provide a meaningful label like "Launches In" or "Offer Ends"',
        'Set a custom expired message relevant to the context (e.g., "Now Live!")',
        'Use hide-zero-segments when the countdown is under 24 hours',
        'Place inside a Section or Card for visual context',
      ],
      dont: [
        'Use for elapsed time or stopwatch functionality — this counts down only',
        'Set a target date in the past unless you want the expired state immediately',
        'Place more than one or two countdowns on a single page — they compete for attention',
        'Rely solely on the visual countdown for critical deadlines — provide server-side enforcement',
        'Use extremely short countdowns (under 10 seconds) as primary UI — the urgency feels manipulative',
      ],
    },

    previewHtml: `<arc-countdown-timer target="2026-12-31T00:00:00" label="New Year"></arc-countdown-timer>`,

    props: [
      { name: 'target', type: 'string', default: "''", description: 'ISO date string or parseable date for the countdown target' },
      { name: 'label', type: 'string', default: "''", description: 'Optional label displayed above the countdown' },
      { name: 'expired', type: 'string', default: "'Expired'", description: 'Text shown when the countdown reaches zero' },
      { name: 'hide-zero-segments', type: 'boolean', default: 'false', description: 'Hide leading segments that are zero' },
    ],

    events: [
      { name: 'arc-expired', description: 'Fired when the countdown reaches zero' },
    ],

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
    <CountdownTimer
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
