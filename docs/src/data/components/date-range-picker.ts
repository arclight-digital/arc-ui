import type { ComponentDef } from './_types';

export const dateRangePicker: ComponentDef = {
  name: 'Date Range Picker',
  slug: 'date-range-picker',
  tag: 'arc-date-range-picker',
  tier: 'input',
  interactivity: 'interactive',
  description:
    'A date field that opens one or more month calendars for picking a start and an end date.',

  overview: `DateRangePicker is DatePicker for a start and end date. The read-only field shows the range as "Jan 5 – Feb 2, 2026", while \`start\` and \`end\` hold ISO dates (YYYY-MM-DD). \`value\` joins them as an ISO 8601 interval ("2026-01-05/2026-02-02"), and that string is what submits with the form under \`name\`. \`form.reset()\` restores the initial range.

The first click, or Enter on a focused day, sets the start. Until you pick the end, hovering or focusing another day previews the range. The second click sets the end, swapping the two if it's earlier, fires \`arc-change\` with the interval as \`value\` plus \`start\` and \`end\`, and closes the popup. A third click starts a new range. \`months\` sets how many month panels show (2 by default). They sit side by side and stack when the popup is too narrow, with one pair of previous and next buttons.

\`presets\` adds a rail of quick ranges on the left. Each entry is \`{ label, days }\` and selects the last \`days\` days ending today, fires \`arc-change\` and closes the popup.`,

  features: [
    'The day grids are one tab stop. Arrow keys, Home, End, Page Up and Page Down move focus and turn the month at the edges',
    'The start and end days get ", range start" and ", range end" added to their labels',
    'A polite live region announces progress, such as "Start date set. Choose end date."',
    'Escape closes the popup and puts focus back in the field. A click outside also closes it',
    '`min` and `max` dim and disable days outside the range, and `required` keeps the field invalid until both dates are set',
    "The popup renders in the top layer, so an `overflow: hidden` ancestor doesn't clip it",
  ],

  guidelines: {
    do: [
      'Add presets for the ranges people pick most, such as 7, 30 and 90 days',
      'Send `start` and `end`, or the interval `value`, to APIs. Never parse the display text',
      'Set `min` and `max` when only some dates have data, as in a report',
      'Set `months="1"` in narrow places, such as a filter popover, where two panels would overflow',
    ],
    dont: [
      "Don't use it for a single date. Use DatePicker",
      "Don't treat the first click as a value. `arc-change` only fires once the end date is chosen",
      "Don't build your own preset buttons when `presets` does the job",
      "Don't set `min` later than `max`. Every day is disabled",
    ],
  },

  previewLayout: 'block',

  previewHeight: '560px',

  previewHtml: `<arc-date-range-picker
  label="Reporting period"
  placeholder="Select date range"
  presets='[{"label":"Last 7 days","days":7},{"label":"Last 30 days","days":30},{"label":"Last 90 days","days":90}]'
  style="width:300px"
></arc-date-range-picker>`,

  tabs: [
    {
      label: 'Web Component',
      lang: 'html',
      code: `<arc-date-range-picker
  label="Reporting Period"
  presets='[{"label":"Last 7 days","days":7},{"label":"Last 30 days","days":30}]'
></arc-date-range-picker>`,
    },
    {
      label: 'React',
      lang: 'tsx',
      code: `import { DateRangePicker } from '@arclux/arc-ui-react';

export default function Example() {
  return (
    <DateRangePicker
      label="Reporting Period"
      presets={[{ label: 'Last 7 days', days: 7 }, { label: 'Last 30 days', days: 30 }]}
      onArcChange={(e) => console.log(e.detail.start, e.detail.end)}
    ></DateRangePicker>
  );
}`,
    },
    {
      label: 'Vue',
      lang: 'html',
      code: `<script setup>
import { DateRangePicker } from '@arclux/arc-ui-vue';

const presets = [{ label: 'Last 7 days', days: 7 }, { label: 'Last 30 days', days: 30 }];
</script>

<template>
  <DateRangePicker label="Reporting Period" :presets="presets" />
</template>`,
    },
    {
      label: 'Svelte',
      lang: 'html',
      code: `<script>
  import { DateRangePicker } from '@arclux/arc-ui-svelte';

  const presets = [{ label: 'Last 7 days', days: 7 }, { label: 'Last 30 days', days: 30 }];
</script>

<DateRangePicker label="Reporting Period" presets={presets} />`,
    },
    {
      label: 'Angular',
      lang: 'ts',
      code: `import { Component } from '@angular/core';
import { DateRangePicker } from '@arclux/arc-ui-angular';

@Component({
  imports: [DateRangePicker],
  template: \`
    <arc-date-range-picker label="Reporting Period" [presets]="presets"></arc-date-range-picker>
  \`,
})
export class MyComponent {
  presets = [{ label: 'Last 7 days', days: 7 }, { label: 'Last 30 days', days: 30 }];
}`,
    },
    {
      label: 'Solid',
      lang: 'tsx',
      code: `import { DateRangePicker } from '@arclux/arc-ui-solid';

export default function Example() {
  return (
    <DateRangePicker
      label="Reporting Period"
      presets={[{ label: 'Last 7 days', days: 7 }]} />
  );
}`,
    },
    {
      label: 'Preact',
      lang: 'tsx',
      code: `import { DateRangePicker } from '@arclux/arc-ui-preact';

export default function Example() {
  return (
    <DateRangePicker
      label="Reporting Period"
      presets={[{ label: 'Last 7 days', days: 7 }]} />
  );
}`,
    },
  ],

  seeAlso: ['date-picker', 'calendar', 'input'],
};
