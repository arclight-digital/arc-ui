import type { ComponentDef } from './_types';

export const timePicker: ComponentDef = {
  name: 'Time Picker',
  slug: 'time-picker',
  tag: 'arc-time-picker',
  tier: 'input',
  interactivity: 'interactive',
  description: 'Scrollable column-based time picker with 12h/24h format support.',

  overview: `TimePicker is a read-only text input that opens a dropdown with scrollable hour and minute columns, plus an AM/PM column in 12h mode. The reader picks the hour and minute separately by clicking them.

The input shows the time in the chosen \`format\`, such as "2:30 PM" in \`12h\` or "14:30" in \`24h\`. \`value\` is always 24-hour "HH:MM", whatever the display. \`step\` sets the minute increment (1, 5, 15 or 30).

\`min\` and \`max\` limit the range, and times outside it are dimmed and can't be picked. Once both an hour and a minute are picked, \`arc-change\` fires with the 24-hour time in \`detail.value\`. A click outside closes the dropdown, and Escape closes it and returns focus to the input. The arrow keys move within a column, Tab moves between columns, and Enter picks. The dropdown slides open, except under \`prefers-reduced-motion\`.`,

  features: [
    "The dropdown opens in the top layer, so a parent with `overflow: hidden` doesn't clip it",
  ],

  guidelines: {
    do: [
      'Set `step` to 5 or 15 for most scheduling, so there are fewer minutes to scroll',
      'Give it a `label` that says which time, such as "Start time" or "Appointment time"',
      'Send `value` (24-hour) to forms and APIs, not the displayed text',
      'Set `min` and `max` when only part of the day is valid, such as business hours',
      'Set `value` when editing an existing record, so the columns open on the saved time',
    ],
    dont: [
      "Don't use it for a duration. Use a number input that counts minutes",
      "Don't set `min` later than `max`. Every option is disabled and the picker can't be used",
    ],
  },

  previewHtml: `<arc-time-picker label="Start time" placeholder="Pick a time" step="15" style="width:240px"></arc-time-picker>`,

  tabs: [
    {
      label: 'Web Component',
      lang: 'html',
      code: `<arc-time-picker label="Start Time" placeholder="Pick a time" step="15"></arc-time-picker>`,
    },
    {
      label: 'React',
      lang: 'tsx',
      code: `import { TimePicker } from '@arclux/arc-ui-react';

export default function Example() {
  return (
    <TimePicker label="Start Time" placeholder="Pick a time" step={15} />
  );
}`,
    },
    {
      label: 'Vue',
      lang: 'html',
      code: `<script setup>
import { TimePicker } from '@arclux/arc-ui-vue';
</script>

<template>
  <TimePicker label="Start Time" placeholder="Pick a time" :step="15" />
</template>`,
    },
    {
      label: 'Svelte',
      lang: 'html',
      code: `<script>
  import { TimePicker } from '@arclux/arc-ui-svelte';
</script>

<TimePicker label="Start Time" placeholder="Pick a time" step={15} />`,
    },
    {
      label: 'Angular',
      lang: 'ts',
      code: `import { Component } from '@angular/core';
import { TimePicker } from '@arclux/arc-ui-angular';

@Component({
  imports: [TimePicker],
  template: \`
    <arc-time-picker label="Start Time" placeholder="Pick a time" [step]="15"></arc-time-picker>
  \`,
})
export class MyComponent {}`,
    },
    {
      label: 'Solid',
      lang: 'tsx',
      code: `import { TimePicker } from '@arclux/arc-ui-solid';

export default function Example() {
  return (
    <TimePicker label="Start Time" placeholder="Pick a time" step={15} />
  );
}`,
    },
    {
      label: 'Preact',
      lang: 'tsx',
      code: `import { TimePicker } from '@arclux/arc-ui-preact';

export default function Example() {
  return (
    <TimePicker label="Start Time" placeholder="Pick a time" step={15} />
  );
}`,
    },
    {
      label: 'HTML',
      lang: 'html',
      code: `<link rel="stylesheet" href="@arclux/arc-ui/css/arc-ui.css" />
<link rel="stylesheet" href="@arclux/arc-ui/css/time-picker.css" />

<arc-time-picker label="Start Time" placeholder="Pick a time" step="15"></arc-time-picker>`,
    },
    {
      label: 'CSS Only',
      lang: 'html',
      code: `<!-- TimePicker requires JavaScript for the dropdown interaction.
     Use the Web Component or a framework wrapper. -->
<arc-time-picker label="Start Time" placeholder="Pick a time" step="15"></arc-time-picker>`,
    },
  ],

  seeAlso: ['date-picker', 'input', 'select'],
};
