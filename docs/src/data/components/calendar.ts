import type { ComponentDef } from './_types';

export const calendar: ComponentDef = {
    name: 'Calendar',
    slug: 'calendar',
    tag: 'arc-calendar',
    tier: 'input',
    interactivity: 'interactive',
    description: 'Interactive month-view calendar grid for date selection with min/max constraints, keyboard navigation, and today highlighting.',

    overview: `Calendar renders a full month grid with day-of-week headers, previous/next month navigation, and selectable date cells. It is the core building block for date pickers and scheduling interfaces. The selected date is stored as an ISO string (YYYY-MM-DD) in the \`value\` prop, and the visible month is controlled independently via \`month\` (0-based) and \`year\`, allowing programmatic navigation without changing the selection.

Days from the previous and next months fill the grid to maintain a consistent 6-row layout, but these "outside" days are displayed at reduced opacity. The current date receives an inset ring highlight (\`--border-bright\`), while the selected date gets a solid accent-primary background. Optional \`min\` and \`max\` ISO date strings constrain the selectable range -- disabled dates are dimmed and non-interactive.

Full keyboard navigation is supported: arrow keys move a focus ring through the grid (including automatic month transitions at boundaries), and Enter or Space confirms the selection. The component fires \`arc-change\` when a date is selected and \`arc-navigate\` when the visible month changes, enabling lazy-loading of events or availability data for the newly visible period.`,

    features: [
      'Standard 7-column month grid with Sun-Sat headers in monospace uppercase',
      'Previous and next month navigation buttons in the header',
      'Today highlighting with an inset border ring for orientation',
      'Selected date highlighted with solid accent-primary background and bold weight',
      'Min/max date constraints via ISO date strings that disable out-of-range days',
      'Arrow key navigation through the grid with automatic month transitions at boundaries',
      'Outside-month day cells shown at 30% opacity to fill the 6-row grid consistently',
      'Two events: `arc-change` on date selection and `arc-navigate` on month/year changes'
    ],

    guidelines: {
      do: [
        'Set `min` and `max` to constrain the selectable range when your use case has date boundaries',
        'Use `arc-navigate` to lazy-load events or availability data when the user changes months',
        'Pair Calendar with a text input or DatePicker wrapper for combined typed and visual date entry',
        'Pre-set `month` and `year` to the month containing the initial `value` so the selection is visible on load',
        'Provide sufficient container width (280px minimum) so the grid cells are comfortably clickable'
      ],
      dont: [
        'Do not use Calendar for time selection -- it handles dates only',
        'Do not set `min` greater than `max` -- the component will disable all days',
        'Do not use Calendar for date range selection (two dates) -- it supports single date selection only',
        'Do not override the monospace font on day cells -- it ensures uniform column alignment',
        'Avoid placing Calendar in extremely narrow containers below 280px -- the grid cells become too small for touch targets'
      ],
    },

    previewHtml: `<arc-calendar value="2026-02-12"></arc-calendar>`,

    props: [
      { name: 'value', type: 'string', default: "''", description: 'The selected date as an ISO string (YYYY-MM-DD). Empty string means no date is selected.' },
      { name: 'min', type: 'string', default: "''", description: 'Minimum selectable date as an ISO string. Days before this date are disabled.' },
      { name: 'max', type: 'string', default: "''", description: 'Maximum selectable date as an ISO string. Days after this date are disabled.' },
      { name: 'month', type: 'number', description: 'The currently displayed month (0-based, 0=January). Defaults to the current month.' },
      { name: 'year', type: 'number', description: 'The currently displayed year. Defaults to the current year.' }
    ],
    events: [
      { name: 'arc-change', description: 'Fired when a date is selected. `event.detail.value` contains the ISO date string (YYYY-MM-DD).' },
      { name: 'arc-navigate', description: 'Fired when the visible month or year changes via the navigation buttons.' }
    ],
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

<Calendar></Calendar>`,
      },
    {
        label: 'Vue',
        lang: 'html',
        code: `<script setup>
import { Calendar } from '@arclux/arc-ui-vue';
</script>

<template>
  <Calendar></Calendar>
</template>`,
      },
    {
        label: 'Svelte',
        lang: 'html',
        code: `<script>
  import { Calendar } from '@arclux/arc-ui-svelte';
</script>

<Calendar></Calendar>`,
      },
    {
        label: 'Angular',
        lang: 'ts',
        code: `import { Component } from '@angular/core';
import { Calendar } from '@arclux/arc-ui-angular';

@Component({
  imports: [Calendar],
  template: \`
    <Calendar></Calendar>
  \`,
})
export class MyComponent {}`,
      },
    {
        label: 'Solid',
        lang: 'tsx',
        code: `import { Calendar } from '@arclux/arc-ui-solid';

<Calendar></Calendar>`,
      },
    {
        label: 'Preact',
        lang: 'tsx',
        code: `import { Calendar } from '@arclux/arc-ui-preact';

<Calendar></Calendar>`,
      },
  ],
  
  seeAlso: ["date-picker"],
};
