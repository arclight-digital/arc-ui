import type { ComponentDef } from './_types';

export const numberInput: ComponentDef = {
  name: 'Number Input',
  slug: 'number-input',
  tag: 'arc-number-input',
  tier: 'input',
  interactivity: 'interactive',
  description:
    'A number field with minus and plus buttons that keeps the value between `min` and `max`.',

  overview: `NumberInput puts decrement and increment buttons on either side of a text field and draws the three as one bordered control. Use it for an exact value like a quantity. For an approximate value or a wide range, use Slider.

Set \`min\` and \`max\` and the value is clamped to them. The button at a limit disables itself. \`step\` sets how far a button click or arrow key moves the value, and Shift+Arrow moves it 10 steps.

A \`label\` renders above the control and is tied to the field with a generated \`id\` and \`for\`. The events mirror the native control: typing fires \`arc-input\` on each keystroke, and the value commits with \`arc-change\` on blur or Enter. A button click or an arrow key fires both at once. Every event carries the new value in its detail.`,

  features: [
    '`spinbutton` role with `aria-valuenow`, `aria-valuemin` and `aria-valuemax`',
    "Hides the browser's own spin buttons so the control looks the same on every platform",
    "Focus colors the whole control's border with `accent-primary` and a focus ring",
    'Disabled drops to 50% opacity and blocks pointer events',
  ],

  guidelines: {
    do: [
      'Set `min` and `max` whenever the value has real limits',
      'Match `step` to your data: 1 for integers, 0.1 for one decimal place',
      'Give every number input a `label`, so screen readers announce it and stacked inputs can be told apart',
    ],
    dont: [
      "Don't set `step` to 0. The buttons and arrow keys then can't change the value",
      "Don't use it for digits that aren't quantities, like phone numbers. Use Input",
    ],
  },

  previewHtml: `<arc-number-input label="Quantity" value="3" min="1" max="99" step="1"></arc-number-input>`,

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

export default function Example() {
  return (
    <NumberInput label="Quantity" value={3} min={1} max={99} step={1} />
  );
}`,
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
    <arc-number-input label="Quantity" [value]="3" [min]="1" [max]="99" [step]="1"></arc-number-input>
  \`,
})
export class MyComponent {}`,
    },
    {
      label: 'Solid',
      lang: 'tsx',
      code: `import { NumberInput } from '@arclux/arc-ui-solid';

export default function Example() {
  return (
    <NumberInput label="Quantity" value={3} min={1} max={99} step={1} />
  );
}`,
    },
    {
      label: 'Preact',
      lang: 'tsx',
      code: `import { NumberInput } from '@arclux/arc-ui-preact';

export default function Example() {
  return (
    <NumberInput label="Quantity" value={3} min={1} max={99} step={1} />
  );
}`,
    },
  ],

  seeAlso: ['input', 'slider'],
};
