import type { ComponentDef } from './_types';

export const datePicker: ComponentDef = {
    name: 'Date Picker',
    slug: 'date-picker',
    tag: 'arc-date-picker',
    tier: 'input',
    interactivity: 'interactive',
    description: 'Calendar-based date picker with keyboard navigation.',

    overview: `DatePicker provides a calendar-based date selection interface that combines a read-only text input with a dropdown calendar grid. Clicking the input toggles a 6-row calendar showing the current month with previous/next month navigation arrows. The selected date is displayed in a human-readable format (e.g., "Jan 15, 2026") inside the input, while the underlying \`value\` property stores the date as an ISO string (YYYY-MM-DD).

The calendar grid highlights today's date with an inset ring, the currently selected date with a filled accent-primary circle, and outside-month dates with reduced opacity. The \`min\` and \`max\` properties constrain the selectable range -- dates outside this range appear dimmed and are non-interactive. Previous and next month buttons in the calendar header allow quick navigation without changing the selected value.

When a date is selected, the component dispatches an \`arc-change\` event with the ISO date string in the detail. Clicking outside the component or pressing Escape closes the dropdown and returns focus to the input. The dropdown uses a slide-down entrance animation that respects \`prefers-reduced-motion\`. A configurable \`label\` renders above the input as an uppercase accent-font heading, consistent with other ARC UI form controls.`,

    features: [
      'Calendar dropdown with 6-row grid showing current, previous, and next month days',
      'ISO string value format (YYYY-MM-DD) for consistent data handling',
      'Human-readable date display in the input (e.g., "Jan 15, 2026")',
      'Min and max date constraints that disable out-of-range dates visually',
      'Today highlight with an inset border ring for orientation',
      'Previous/next month navigation arrows in the calendar header',
      'Escape key and outside-click dismissal with focus restoration to the input',
      'Animated dropdown entrance with prefers-reduced-motion support'
    ],

    guidelines: {
      do: [
        'Set min and max to constrain the date range when the context requires it (e.g., future-only booking dates)',
        'Provide a descriptive label like "Start Date" or "Date of Birth" for accessibility',
        'Use the ISO string value for form submission and API communication, not the display format',
        'Listen to arc-change to capture the selected date and validate it against business rules',
        'Set the initial value property when editing an existing record so the calendar opens to the correct month'
      ],
      dont: [
        'Use DatePicker for date ranges -- use two DatePicker instances with coordinated min/max instead',
        'Allow the user to type directly into the input; it is read-only by design to ensure valid date formats',
        'Set min greater than max, as this will disable all dates and make the picker unusable',
        'Forget to handle the arc-change event -- without it, the selected date is not captured',
        'Place DatePicker inside a container with overflow: hidden, as the calendar dropdown will be clipped'
      ],
    },

    previewHtml: `<arc-date-picker label="Start Date" placeholder="Choose a date" style="width:240px"></arc-date-picker>`,

    props: [
      { name: 'value', type: 'string', default: "''", description: 'The selected date as an ISO string (YYYY-MM-DD). Set this to pre-select a date. Updated when the user picks a date from the calendar.' },
      { name: 'min', type: 'string', default: "''", description: 'Minimum selectable date as an ISO string. Dates before this are visually dimmed and non-interactive.' },
      { name: 'max', type: 'string', default: "''", description: 'Maximum selectable date as an ISO string. Dates after this are visually dimmed and non-interactive.' },
      { name: 'placeholder', type: 'string', default: "'Select date'", description: 'Placeholder text displayed in the input when no date is selected.' },
      { name: 'disabled', type: 'boolean', default: 'false', description: 'Disables the date picker, reducing opacity and preventing the calendar from opening.' },
      { name: 'label', type: 'string', default: "''", description: 'Label text rendered above the input in uppercase accent font styling.' }
    ],
    events: [
      { name: 'arc-change', description: 'Fired when a date is selected' }
    ],
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

<DatePicker label="Select Date" placeholder="Choose a date"></DatePicker>`,
      },
    {
        label: 'Vue',
        lang: 'html',
        code: `<script setup>
import { DatePicker } from '@arclux/arc-ui-vue';
</script>

<template>
  <DatePicker label="Select Date" placeholder="Choose a date"></DatePicker>
</template>`,
      },
    {
        label: 'Svelte',
        lang: 'html',
        code: `<script>
  import { DatePicker } from '@arclux/arc-ui-svelte';
</script>

<DatePicker label="Select Date" placeholder="Choose a date"></DatePicker>`,
      },
    {
        label: 'Angular',
        lang: 'ts',
        code: `import { Component } from '@angular/core';
import { DatePicker } from '@arclux/arc-ui-angular';

@Component({
  imports: [DatePicker],
  template: \`
    <DatePicker label="Select Date" placeholder="Choose a date"></DatePicker>
  \`,
})
export class MyComponent {}`,
      },
    {
        label: 'Solid',
        lang: 'tsx',
        code: `import { DatePicker } from '@arclux/arc-ui-solid';

<DatePicker label="Select Date" placeholder="Choose a date"></DatePicker>`,
      },
    {
        label: 'Preact',
        lang: 'tsx',
        code: `import { DatePicker } from '@arclux/arc-ui-preact';

<DatePicker label="Select Date" placeholder="Choose a date"></DatePicker>`,
      },
  ],
  
  seeAlso: ["calendar","input"],
};
