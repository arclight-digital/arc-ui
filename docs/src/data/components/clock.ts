import type { ComponentDef } from './_types';

export const clock: ComponentDef = {
  name: 'Clock',
  slug: 'clock',
  tag: 'arc-clock',
  tier: 'data',
  interactivity: 'interactive',
  description: 'Live clock with a digital or analog face, optionally pinned to an IANA timezone.',

  overview: `Clock shows the current time and updates once a second, from one interval that starts on connect and is cleared on disconnect. \`variant\` picks the face. The digital face sets the time in \`var(--font-mono)\` with tabular numerals, so the digits change without the layout shifting. The analog face is an SVG dial with twelve tick marks, hour and minute hands in the primary text color, and an accent second hand with a soft glow.

Both faces take the same attributes. \`timezone\` takes an IANA name such as "Asia/Tokyo" and defaults to the viewer's zone. An unrecognized name falls back to local time without throwing. \`show-seconds\` adds seconds to the digital time or a second hand to the dial. On the digital face, \`hour12\` forces 12-hour time (set the property to \`false\` for 24-hour, or leave it unset to follow the viewer's locale), and \`show-timezone\` adds the zone abbreviation in muted text. \`label\` puts a caption in the accent gradient under the face. Labeled clocks side by side make a row of world clocks.

Screen readers ignore the face. The time, with the label and zone when present, is visually hidden text that updates each tick with no \`aria-live\`, so a screen reader can ask for the time without hearing it every second. The analog hands jump once a second with no sweep, so there's no motion for reduced-motion settings to stop.

The server renders a valid static face (a dash on the digital face, hands at twelve on the dial), and hydration swaps in the live time without a layout shift.`,

  features: [
    'The second hand\'s color and glow come from the base accent tokens',
  ],

  guidelines: {
    do: [
      'Use it for the current time in a dashboard header, a status bar or a row of world clocks',
      'Label each clock when there\'s more than one on screen',
      'Set timezone for team or ops views where "local" is ambiguous',
      'Turn on show-seconds when the seconds matter, as on an ops console, and leave it off otherwise',
      'Use the analog face where the time is background information and the digital face where people read it exactly',
    ],
    dont: [
      'Don\'t use it to count down to a deadline. Use CountdownTimer, which fires an event at zero',
      'Don\'t use it to say when something happened. Use TimeAgo, which renders phrases like "3 minutes ago"',
      'Don\'t put many clocks with seconds on one page. Each ticks every second and they compete for attention',
      'Don\'t force hour12 for a mixed-locale audience without a reason. The locale default is usually right',
      "Don't rely on the displayed time for anything transactional. It is the viewer's device clock, not a server clock",
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
