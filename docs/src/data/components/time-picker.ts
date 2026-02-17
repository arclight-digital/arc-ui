import type { ComponentDef } from './_types';

export const timePicker: ComponentDef = {
    name: 'Time Picker',
    slug: 'time-picker',
    tag: 'arc-time-picker',
    tier: 'input',
    interactivity: 'interactive',
    description: 'Scrollable column-based time picker with 12h/24h format support.',

    overview: `TimePicker provides a column-based time selection interface that combines a read-only text input with a dropdown panel containing scrollable hour and minute columns. In 12h mode a third AM/PM column is shown. Clicking the input toggles the dropdown where users can independently select hours and minutes by clicking options styled as buttons inside scrollable lists.

The selected time is displayed in the input in the chosen format (e.g. "2:30 PM" in 12h mode or "14:30" in 24h mode), while the underlying \`value\` property always stores the time in 24-hour "HH:MM" format for consistent data handling. The \`step\` property controls the minute increment (1, 5, 15, or 30) to reduce the number of options when fine-grained selection is unnecessary.

The \`min\` and \`max\` properties constrain the selectable range -- time options outside this range appear dimmed and are non-interactive. When a complete time is selected (both hour and minute), the component dispatches an \`arc-change\` event with the 24-hour time string in the detail. Clicking outside the component or pressing Escape closes the dropdown and returns focus to the input. The dropdown uses a slide-down entrance animation that respects \`prefers-reduced-motion\`. Arrow keys navigate within columns, Tab moves between columns, and Enter confirms a selection.`,

    features: [
      'Scrollable hour and minute columns for intuitive time selection',
      '12-hour and 24-hour display format with automatic AM/PM column in 12h mode',
      'Value always stored in 24-hour "HH:MM" format regardless of display format',
      'Configurable minute step increment (1, 5, 15, 30) to control granularity',
      'Min and max time constraints that disable out-of-range options visually',
      'Keyboard navigation: Arrow keys within columns, Tab between columns, Enter to select',
      'Escape key and outside-click dismissal with focus restoration to the input',
      'Animated dropdown entrance with prefers-reduced-motion support'
    ],

    guidelines: {
      do: [
        'Set step to 5 or 15 for most scheduling use cases to reduce cognitive load',
        'Provide a descriptive label like "Start Time" or "Appointment Time" for accessibility',
        'Use the 24h format value for form submission and API communication, not the display format',
        'Set min and max to constrain the time range when context requires it (e.g., business hours only)',
        'Listen to arc-change to capture the selected time and validate it against business rules',
        'Set the initial value property when editing an existing record so the columns open to the correct selection'
      ],
      dont: [
        'Use TimePicker for duration input -- use a number input with minutes or a dedicated duration component instead',
        'Allow the user to type directly into the input; it is read-only by design to ensure valid time formats',
        'Set min greater than max, as this will disable all options and make the picker unusable',
        'Forget to handle the arc-change event -- without it, the selected time is not captured',
        'Place TimePicker inside a container with overflow: hidden, as the dropdown will be clipped'
      ],
    },

    previewHtml: `<arc-time-picker label="Start Time" placeholder="Pick a time" step="15" style="width:240px"></arc-time-picker>`,

    props: [
      { name: 'value', type: 'string', default: "''", description: 'The selected time in 24-hour "HH:MM" format (e.g. "14:30"). Set this to pre-select a time. Updated when the user picks a time.' },
      { name: 'min', type: 'string', default: "''", description: 'Minimum selectable time in "HH:MM" 24-hour format. Times before this are visually dimmed and non-interactive.' },
      { name: 'max', type: 'string', default: "''", description: 'Maximum selectable time in "HH:MM" 24-hour format. Times after this are visually dimmed and non-interactive.' },
      { name: 'step', type: 'number', default: '1', description: 'Minute step increment (1, 5, 15, or 30). Controls the granularity of minute options shown in the dropdown.' },
      { name: 'format', type: 'string', default: "'12h'", description: 'Display format: "12h" shows hours 1-12 with an AM/PM column, "24h" shows hours 0-23 without AM/PM.' },
      { name: 'placeholder', type: 'string', default: "'Select time'", description: 'Placeholder text displayed in the input when no time is selected.' },
      { name: 'disabled', type: 'boolean', default: 'false', description: 'Disables the time picker, reducing opacity and preventing the dropdown from opening.' },
      { name: 'label', type: 'string', default: "''", description: 'Label text rendered above the input in uppercase accent font styling.' }
    ],
    events: [
      { name: 'arc-change', description: 'Fired when a time is selected. Detail contains { value: "HH:MM" } in 24-hour format.' }
    ],
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

<TimePicker label="Start Time" placeholder="Pick a time" step={15}></TimePicker>`,
      },
    {
        label: 'Vue',
        lang: 'html',
        code: `<script setup>
import { TimePicker } from '@arclux/arc-ui-vue';
</script>

<template>
  <TimePicker label="Start Time" placeholder="Pick a time" :step="15"></TimePicker>
</template>`,
      },
    {
        label: 'Svelte',
        lang: 'html',
        code: `<script>
  import { TimePicker } from '@arclux/arc-ui-svelte';
</script>

<TimePicker label="Start Time" placeholder="Pick a time" step={15}></TimePicker>`,
      },
    {
        label: 'Angular',
        lang: 'ts',
        code: `import { Component } from '@angular/core';
import { TimePicker } from '@arclux/arc-ui-angular';

@Component({
  imports: [TimePicker],
  template: \`
    <TimePicker label="Start Time" placeholder="Pick a time" [step]="15"></TimePicker>
  \`,
})
export class MyComponent {}`,
      },
    {
        label: 'Solid',
        lang: 'tsx',
        code: `import { TimePicker } from '@arclux/arc-ui-solid';

<TimePicker label="Start Time" placeholder="Pick a time" step={15}></TimePicker>`,
      },
    {
        label: 'Preact',
        lang: 'tsx',
        code: `import { TimePicker } from '@arclux/arc-ui-preact';

<TimePicker label="Start Time" placeholder="Pick a time" step={15}></TimePicker>`,
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

  seeAlso: ["date-picker", "input", "select"],
};
