import type { ComponentDef } from './_types';

export const numberInput: ComponentDef = {
    name: 'Number Input',
    slug: 'number-input',
    tag: 'arc-number-input',
    tier: 'input',
    interactivity: 'interactive',
    description: 'A numeric stepper input with decrement and increment buttons flanking a central text field, supporting min/max clamping, step increments, and keyboard shortcuts.',

    overview: `Number Input combines a native numeric text field with decrement and increment buttons to create a precise, user-friendly numeric stepper. The three elements are presented as a unified control with a shared border and rounded corners, where the buttons sit on either side of the input field separated by subtle inner borders. When the control receives focus, the entire border shifts to accent-primary with a focus ring, providing clear visual feedback.

The component enforces value boundaries through automatic clamping. When \`min\` or \`max\` props are set, the value is clamped to stay within range, and the corresponding button becomes disabled and visually dimmed when the limit is reached. The \`step\` prop controls the increment granularity for both button clicks and keyboard interactions. Holding Shift while pressing arrow keys multiplies the step by 10, enabling quick large adjustments without repeated clicks.

When a \`label\` is provided, it renders as an uppercase accent-font label above the control, connected to the input via a generated \`id\` and \`for\` attribute for accessibility. The component fires \`arc-change\` on every value change -- whether from button clicks, direct typing, or keyboard arrows -- with the new value in the event detail.`,

    features: [
      'Inline decrement and increment buttons flanking a centred numeric text field',
      'Automatic value clamping to `min` and `max` boundaries with buttons disabled at limits',
      'Configurable `step` for increment granularity, with Shift+Arrow for 10x step multiplier',
      'Focus-within styling applies accent-primary border and ring to the entire control group',
      'Label rendered as uppercase accent-font text above the control with proper `for` association',
      'Native `spinbutton` ARIA role with `aria-valuenow`, `aria-valuemin`, and `aria-valuemax`',
      'Hides browser-native spin buttons for a clean cross-platform appearance',
      'Disabled state at 40% opacity with pointer events blocked'
    ],

    guidelines: {
      do: [
        'Use Number Input when the user needs to enter or adjust an exact numeric value',
        'Set `min` and `max` to prevent invalid values and provide clear boundary feedback',
        'Choose a `step` that matches your data precision -- 1 for integers, 0.1 for decimals',
        'Provide a `label` so the input is properly announced by screen readers',
        'Use the Shift+Arrow shortcut tip in help text for power users who need fast adjustments'
      ],
      dont: [
        'Do not use Number Input for approximate values or large ranges -- use Slider instead',
        'Do not omit `min` and `max` when there are logical boundaries for the value',
        'Do not set a `step` of 0 -- it prevents the buttons from changing the value',
        'Do not use Number Input for non-numeric data like phone numbers -- use a standard Input with a pattern',
        'Avoid stacking many number inputs without labels -- each one needs context for usability'
      ],
    },

    previewHtml: `<arc-number-input label="Quantity" value="3" min="1" max="99" step="1"></arc-number-input>`,

    props: [
      { name: 'value', type: 'number', default: '0', description: 'Current numeric value. Reflected as an attribute and updated on user interaction.' },
      { name: 'min', type: 'number', default: 'undefined', description: 'Minimum allowed value. The decrement button is disabled when the value reaches this limit.' },
      { name: 'max', type: 'number', default: 'undefined', description: 'Maximum allowed value. The increment button is disabled when the value reaches this limit.' },
      { name: 'step', type: 'number', default: '1', description: 'Increment and decrement step size. Arrow keys use this value, Shift+Arrow uses 10x this value.' },
      { name: 'label', type: 'string', default: "''", description: 'Label text displayed above the control in uppercase accent font.' },
      { name: 'disabled', type: 'boolean', default: 'false', description: 'Disables interaction, reducing opacity to 40% and blocking pointer events.' }
    ],
    events: [
      { name: 'arc-change', description: 'Fired when the numeric value changes via buttons or keyboard' }
    ],

    tabs: [
    {
        label: 'Web Component',
        lang: 'html',
        code: `<arc-number-input label="Quantity" value="3" min="1" max="99" step="1"></arc-number-input>`,
      },
    {
        label: 'React',
        lang: 'tsx',
        code: `import { NumberInput } from '@arclux/arc-ui-react';

<NumberInput label="Quantity" value={3} min={1} max={99} step={1} />`,
      },
    {
        label: 'Vue',
        lang: 'html',
        code: `<script setup>
import { NumberInput } from '@arclux/arc-ui-vue';
</script>

<template>
  <NumberInput label="Quantity" :value="3" :min="1" :max="99" :step="1" />
</template>`,
      },
    {
        label: 'Svelte',
        lang: 'html',
        code: `<script>
  import { NumberInput } from '@arclux/arc-ui-svelte';
</script>

<NumberInput label="Quantity" value={3} min={1} max={99} step={1} />`,
      },
    {
        label: 'Angular',
        lang: 'ts',
        code: `import { Component } from '@angular/core';
import { NumberInput } from '@arclux/arc-ui-angular';

@Component({
  imports: [NumberInput],
  template: \`
    <NumberInput label="Quantity" [value]="3" [min]="1" [max]="99" [step]="1"></NumberInput>
  \`,
})
export class MyComponent {}`,
      },
    {
        label: 'Solid',
        lang: 'tsx',
        code: `import { NumberInput } from '@arclux/arc-ui-solid';

<NumberInput label="Quantity" value={3} min={1} max={99} step={1} />`,
      },
    {
        label: 'Preact',
        lang: 'tsx',
        code: `import { NumberInput } from '@arclux/arc-ui-preact';

<NumberInput label="Quantity" value={3} min={1} max={99} step={1} />`,
      },
  ],
  
  seeAlso: ["input","slider"],
};
