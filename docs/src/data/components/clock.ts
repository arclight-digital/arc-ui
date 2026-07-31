import type { ComponentDef } from './_types';

export const clock: ComponentDef = {
  name: 'Clock',
  slug: 'clock',
  tag: 'arc-clock',
  tier: 'data',
  interactivity: 'interactive',
  description: 'Live clock with a digital or analog face, optionally pinned to an IANA timezone.',

  overview: `Clock displays the current time and keeps it current, updating once per second from a single interval that starts on connect and is cleared on disconnect. It ships two faces selected by the \`variant\` attribute. The digital face renders the time in \`var(--font-mono)\` with tabular numerals in the primary text color, so digits tick over without the layout shifting. The analog face is an SVG dial: a minimal tick ring with twelve major marks, hour and minute hands in the primary text color, and an accent-colored second hand with a soft glow around a center pin.

Both faces read the same attributes. \`timezone\` accepts any IANA name such as "Asia/Tokyo" and defaults to the viewer's local zone; an unrecognized value falls back to local time rather than throwing. \`show-seconds\` adds seconds to the digital string or the second hand to the dial. On the digital face, \`hour12\` forces 12-hour display (set the property to \`false\` to force 24-hour display; when unset, the viewer's locale decides), and \`show-timezone\` appends the zone abbreviation in muted text. An optional \`label\` renders a gradient-accent caption under the face, which is how a row of clocks becomes a world-clock strip.

The visual face is decorative to assistive technology. The current time, along with the label and zone when present, is exposed as visually hidden text that updates each tick without an \`aria-live\` region, so screen readers can query the time on demand without being flooded by announcements. The analog hands move in discrete one-second ticks rather than a continuous sweep, so there is no motion to suppress under \`prefers-reduced-motion\`.

Server rendering produces a valid static face — a dash placeholder on the digital face, hands at twelve on the dial — that hydration replaces with the live time without layout shift.`,

  features: [
    'Digital and analog faces from one element, selected by the variant attribute',
    'Live updates once per second, with the interval cleared on disconnect',
    'Pins to any IANA timezone; invalid names fall back to local time',
    'Digital face uses mono tabular numerals so ticking digits never shift layout',
    'Accent second hand with a soft glow, composed from the base accent tokens',
    'hour12 forces 12-hour or 24-hour display; unset follows the viewer locale',
    'show-timezone renders the muted zone abbreviation beside the digital time',
    'Optional gradient-accent label under the face for world-clock strips',
    'Accessible time exposed as visually hidden text, with no aria-live flooding',
    'Discrete one-second hand ticks, so prefers-reduced-motion needs nothing suppressed',
  ],

  guidelines: {
    do: [
      'Use Clock to show the current time — a dashboard header, a status bar, a world-clock strip',
      'Label each clock when more than one is on screen, so the zones read at a glance',
      'Pin timezone explicitly for team or ops views where "local" is ambiguous',
      'Use show-seconds when the seconds carry meaning, such as an ops console; omit it when they are noise',
      'Prefer the analog face where the time is ambient and the digital face where it will be read precisely',
    ],
    dont: [
      'Do not use Clock to count toward a deadline — that is CountdownTimer, which counts down to a target and fires an event at zero',
      'Do not use Clock to describe when something happened — that is TimeAgo, which renders relative phrases like "3 minutes ago"',
      'Do not place many seconds-precision clocks on one page — each ticks every second, and together they compete for attention',
      'Do not force hour12 in interfaces serving mixed locales without a reason; the locale default is usually right',
      "Do not rely on the displayed time for anything transactional — it is the viewer's device clock, not a server clock",
    ],
  },

  previewHtml: `<div style="display:flex;gap:var(--space-2xl);align-items:center;justify-content:center;flex-wrap:wrap">
  <arc-clock label="Local" show-seconds></arc-clock>
  <arc-clock variant="analog" label="Local" show-seconds></arc-clock>
  <arc-clock timezone="Asia/Tokyo" label="Tokyo" show-seconds show-timezone></arc-clock>
  <arc-clock variant="analog" timezone="Asia/Tokyo" label="Tokyo" show-seconds></arc-clock>
</div>`,

  tabs: [
    {
      label: 'Web Component',
      lang: 'html',
      code: `<!-- Local time, digital -->
<arc-clock show-seconds></arc-clock>

<!-- Analog face with the accent second hand -->
<arc-clock variant="analog" show-seconds></arc-clock>

<!-- Pinned to a timezone, with the muted zone abbreviation -->
<arc-clock
  timezone="Asia/Tokyo"
  label="Tokyo"
  show-timezone
></arc-clock>

<!-- Forced 12-hour display; to force 24-hour, set the hour12
     property to false from a framework or script -->
<arc-clock timezone="UTC" label="UTC" hour12></arc-clock>`,
    },
    {
      label: 'React',
      lang: 'tsx',
      code: `import { Clock } from '@arclux/arc-ui-react';

function WorldClocks() {
  return (
    <>
      <Clock label="Local" showSeconds />
      <Clock variant="analog" timezone="America/New_York" label="New York" showSeconds />
      <Clock timezone="Asia/Tokyo" label="Tokyo" showTimezone hour12={false} />
    </>
  );
}`,
    },
    {
      label: 'Vue',
      lang: 'html',
      code: `<script setup>
import { Clock } from '@arclux/arc-ui-vue';
</script>

<template>
  <Clock label="Local" show-seconds />
  <Clock variant="analog" timezone="Asia/Tokyo" label="Tokyo" show-seconds />
</template>`,
    },
    {
      label: 'Svelte',
      lang: 'html',
      code: `<script>
  import { Clock } from '@arclux/arc-ui-svelte';
</script>

<Clock label="Local" showSeconds />
<Clock variant="analog" timezone="Asia/Tokyo" label="Tokyo" showSeconds />`,
    },
    {
      label: 'Angular',
      lang: 'ts',
      code: `import { Component } from '@angular/core';
import { Clock } from '@arclux/arc-ui-angular';

@Component({
  imports: [Clock],
  template: \`
    <arc-clock label="Local" show-seconds />
    <arc-clock
      variant="analog"
      timezone="Asia/Tokyo"
      label="Tokyo"
      show-seconds
    />
  \`,
})
export class WorldClocksComponent {}`,
    },
    {
      label: 'Solid',
      lang: 'tsx',
      code: `import { Clock } from '@arclux/arc-ui-solid';

function WorldClocks() {
  return (
    <>
      <Clock label="Local" show-seconds />
      <Clock variant="analog" timezone="Asia/Tokyo" label="Tokyo" show-seconds />
    </>
  );
}`,
    },
    {
      label: 'Preact',
      lang: 'tsx',
      code: `import { Clock } from '@arclux/arc-ui-preact';

function WorldClocks() {
  return (
    <>
      <Clock label="Local" show-seconds />
      <Clock variant="analog" timezone="Asia/Tokyo" label="Tokyo" show-seconds />
    </>
  );
}`,
    },
  ],

  seeAlso: ['countdown-timer', 'time-ago', 'animated-number'],
};
