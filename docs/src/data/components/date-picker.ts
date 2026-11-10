import type { ComponentDef } from './_types';

export const datePicker: ComponentDef = {
  name: 'Date Picker',
  slug: 'date-picker',
  tag: 'arc-date-picker',
  tier: 'input',
  interactivity: 'interactive',
  description: 'A read-only date field that opens a month calendar, for picking one date.',

  overview: `DatePicker is a read-only text field that opens a calendar. Clicking the field toggles a six-week grid for one month, with buttons for the previous and next month. Clicking the month title switches to a grid of months, and again to a grid of years, for longer jumps. The field shows the chosen date as "Jan 15, 2026", and \`value\` holds it as \`YYYY-MM-DD\`. Picking a date fires \`arc-change\` with that string.

\`min\` and \`max\` take ISO dates. Days outside the range are dimmed and can't be picked. Today has an inset ring and the selected day a filled accent circle. Month and weekday names follow \`locale\`, which defaults to the page's \`lang\`, and the week starts on the locale's usual first day unless you set \`first-day-of-week\` (1 is Monday, 7 is Sunday).

Escape closes the calendar and puts focus back in the field, and a click outside closes it too. The calendar renders in the top layer, so an \`overflow: hidden\` ancestor doesn't clip it. For a start and end date, use DateRangePicker.`,

  features: [
    'The day grid is one tab stop. Arrow keys move by a day or a week, and Home and End go to the start and end of the week',
    'Form-associated: with a `name`, the ISO value submits with the form',
    'Set `open` to open the calendar from code. It stays closed while `disabled`',
  ],

  guidelines: {
    do: [
      'Set `min` and `max` when only some dates make sense, such as future-only booking dates',
      'Set a `label`, such as "Start date" or "Date of birth". Without one, the field is named "Choose date"',
      'Send the ISO `value` to forms and APIs, not the displayed text',
      'Set `value` when editing an existing record, so the calendar opens on the right month',
    ],
    dont: [
      'Don\'t set `min` later than `max`. Every date is disabled',
    ],
  },

  previewHtml: `<arc-date-picker label="Start date" placeholder="Choose a date" style="width:240px"></arc-date-picker>`,

  tabs: [
    {
      label: 'Web Component',
      lang: 'html',
      code: `<arc-date-picker label="Select Date" placeholder="Choose a date"></arc-date-picker>`,
    },
    {
      label: 'React',
      lang: 'tsx',
      code: `import { DatePicker } from '@arclux/arc-ui-react';

export default function Example() {
  return (
    <DatePicker label="Select Date" placeholder="Choose a date" />
  );
}`,
    },
    {
      label: 'Vue',
      lang: 'html',
      code: `<script setup>
import { DatePicker } from '@arclux/arc-ui-vue';
</script>

<template>
  <DatePicker label="Select Date" placeholder="Choose a date" />
</template>`,
    },
    {
      label: 'Svelte',
      lang: 'html',
      code: `<script>
  import { DatePicker } from '@arclux/arc-ui-svelte';
</script>

<DatePicker label="Select Date" placeholder="Choose a date" />`,
    },
    {
      label: 'Angular',
      lang: 'ts',
      code: `import { Component } from '@angular/core';
import { DatePicker } from '@arclux/arc-ui-angular';

@Component({
  imports: [DatePicker],
  template: \`
    <arc-date-picker label="Select Date" placeholder="Choose a date"></arc-date-picker>
  \`,
})
export class MyComponent {}`,
    },
    {
      label: 'Solid',
      lang: 'tsx',
      code: `import { DatePicker } from '@arclux/arc-ui-solid';

export default function Example() {
  return (
    <DatePicker label="Select Date" placeholder="Choose a date" />
  );
}`,
    },
    {
      label: 'Preact',
      lang: 'tsx',
      code: `import { DatePicker } from '@arclux/arc-ui-preact';

export default function Example() {
  return (
    <DatePicker label="Select Date" placeholder="Choose a date" />
  );
}`,
    },
  ],

  seeAlso: ['calendar', 'input'],
};
