import type { ComponentDef } from './_types';

export const calendar: ComponentDef = {
  name: 'Calendar',
  slug: 'calendar',
  tag: 'arc-calendar',
  tier: 'input',
  interactivity: 'interactive',
  description:
    'A month of days in a grid, for picking one date.',

  overview: `Calendar shows one month as a grid of days, with previous and next month buttons in the header. Use it on its own or inside a date picker or scheduling screen.

The selected date is an ISO string (YYYY-MM-DD) in \`value\`. The visible month is set separately by \`month\` (0-based) and \`year\`, so you can change the month from code without changing the selection. It doesn't follow \`value\`: it shows the current month until you set \`month\` and \`year\`.

Month and weekday names come from \`locale\` (by default the document's \`lang\`, then the browser's language). The week starts on the locale's usual first day unless you set \`first-day-of-week\` (1 = Monday to 7 = Sunday).

Arrow keys move a focus ring through the grid and cross into the next or previous month at the edges. Enter or Space selects the focused day. \`arc-change\` fires with the selected date, and \`arc-month-change\` fires when the visible month changes, so you can load events or availability for the new month.`,

  features: [
    'Days from the neighboring months fill out a 6-row grid at 30% opacity',
    'Today gets an inset `--border-bright` ring. The selected date gets a solid accent-primary background and bold weight',
    '`min` and `max` (ISO strings) disable and dim the days outside the range',
    'Day numbers are monospace so the columns line up',
  ],

  guidelines: {
    do: [
      'Set min and max when only some dates are valid',
      'Load events or availability on arc-month-change',
      'Pair it with a text input, or use DatePicker, when people should be able to type a date too',
      'Set month and year to the month of the initial value so the selection is visible on load',
      'Give it at least 280px of width so the days are easy to tap',
    ],
    dont: [
      'Don\'t use it to pick a time. It handles dates only',
      'Don\'t set min later than max. Every day ends up disabled',
      'Don\'t use it to pick a range. It selects one date, so use DateRangePicker',
    ],
  },

  previewHtml: `<arc-calendar value="2026-02-12"></arc-calendar>`,

  tabs: [
    {
      label: 'Web Component',
      lang: 'html',
      code: `<arc-calendar></arc-calendar>`,
    },
    {
      label: 'React',
      lang: 'tsx',
      code: `import { Calendar } from '@arclux/arc-ui-react';

export default function Example() {
  return (
    <Calendar />
  );
}`,
    },
    {
      label: 'Vue',
      lang: 'html',
      code: `<script setup>
import { Calendar } from '@arclux/arc-ui-vue';
</script>

<template>
  <Calendar />
</template>`,
    },
    {
      label: 'Svelte',
      lang: 'html',
      code: `<script>
  import { Calendar } from '@arclux/arc-ui-svelte';
</script>

<Calendar />`,
    },
    {
      label: 'Angular',
      lang: 'ts',
      code: `import { Component } from '@angular/core';
import { Calendar } from '@arclux/arc-ui-angular';

@Component({
  imports: [Calendar],
  template: \`
    <arc-calendar></arc-calendar>
  \`,
})
export class MyComponent {}`,
    },
    {
      label: 'Solid',
      lang: 'tsx',
      code: `import { Calendar } from '@arclux/arc-ui-solid';

export default function Example() {
  return (
    <Calendar />
  );
}`,
    },
    {
      label: 'Preact',
      lang: 'tsx',
      code: `import { Calendar } from '@arclux/arc-ui-preact';

export default function Example() {
  return (
    <Calendar />
  );
}`,
    },
  ],

  seeAlso: ['date-picker'],
};
