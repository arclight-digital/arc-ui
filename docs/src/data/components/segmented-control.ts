import type { ComponentDef } from './_types';

export const segmentedControl: ComponentDef = {
  name: 'Segmented Control',
  slug: 'segmented-control',
  tag: 'arc-segmented-control',
  tier: 'input',
  interactivity: 'interactive',
  description: 'A row of buttons where exactly one is selected, built from arc-option children.',

  overview: `SegmentedControl draws its \`<arc-option>\` children as buttons in one rounded, bordered bar. The selected button gets the accent background and a glow. Use it for two to five short options where exactly one must be picked, like a daily, weekly or monthly view. For more options, use Select or RadioGroup.

The bar is a \`radiogroup\` and each button a \`radio\` with \`aria-checked\`. Arrow keys move the selection and wrap at the ends, Home and End jump to the first and last option, and focus follows the selection.

With no \`value\` set, the first option is selected, so the control always has a value. \`arc-change\` fires with the new value each time the selection changes.`,

  features: [
    "Each option's label is its text content, so markup inside an `<arc-option>` is dropped",
    'Disabled drops the whole control to 50% opacity and blocks pointer events',
  ],

  guidelines: {
    do: ["Keep labels to one or two words so the bar doesn't overflow"],
    dont: [
      "Don't use it to switch between views. Use Tabs",
      "Don't use it for a single on/off setting. Use Toggle",
    ],
  },

  previewHtml: `<arc-segmented-control value="monthly">
  <arc-option value="daily">Daily</arc-option>
  <arc-option value="weekly">Weekly</arc-option>
  <arc-option value="monthly">Monthly</arc-option>
</arc-segmented-control>`,

  subComponents: [
    {
      name: 'Option',
      tag: 'arc-option',
      description:
        'One option in the bar. `value` identifies it and its text content is the label.',
    },
  ],

  tabs: [
    {
      label: 'Web Component',
      lang: 'html',
      code: `<arc-segmented-control value="monthly">
  <arc-option value="daily">Daily</arc-option>
  <arc-option value="weekly">Weekly</arc-option>
  <arc-option value="monthly">Monthly</arc-option>
</arc-segmented-control>`,
    },
    {
      label: 'React',
      lang: 'tsx',
      code: `import { SegmentedControl, Option } from '@arclux/arc-ui-react';

export default function Example() {
  return (
    <SegmentedControl value="monthly">
      <Option value="daily">Daily</Option>
      <Option value="weekly">Weekly</Option>
      <Option value="monthly">Monthly</Option>
    </SegmentedControl>
  );
}`,
    },
    {
      label: 'Vue',
      lang: 'html',
      code: `<script setup>
import { SegmentedControl, Option } from '@arclux/arc-ui-vue';
</script>

<template>
  <SegmentedControl value="monthly">
    <Option value="daily">Daily</Option>
    <Option value="weekly">Weekly</Option>
    <Option value="monthly">Monthly</Option>
  </SegmentedControl>
</template>`,
    },
    {
      label: 'Svelte',
      lang: 'html',
      code: `<script>
  import { SegmentedControl, Option } from '@arclux/arc-ui-svelte';
</script>

<SegmentedControl value="monthly">
  <Option value="daily">Daily</Option>
  <Option value="weekly">Weekly</Option>
  <Option value="monthly">Monthly</Option>
</SegmentedControl>`,
    },
    {
      label: 'Angular',
      lang: 'ts',
      code: `import { Component } from '@angular/core';
import { SegmentedControl, Option } from '@arclux/arc-ui-angular';

@Component({
  imports: [SegmentedControl, Option],
  template: \`
    <arc-segmented-control value="monthly">
      <arc-option value="daily">Daily</arc-option>
      <arc-option value="weekly">Weekly</arc-option>
      <arc-option value="monthly">Monthly</arc-option>
    </arc-segmented-control>
  \`,
})
export class MyComponent {}`,
    },
    {
      label: 'Solid',
      lang: 'tsx',
      code: `import { SegmentedControl, Option } from '@arclux/arc-ui-solid';

export default function Example() {
  return (
    <SegmentedControl value="monthly">
      <Option value="daily">Daily</Option>
      <Option value="weekly">Weekly</Option>
      <Option value="monthly">Monthly</Option>
    </SegmentedControl>
  );
}`,
    },
    {
      label: 'Preact',
      lang: 'tsx',
      code: `import { SegmentedControl, Option } from '@arclux/arc-ui-preact';

export default function Example() {
  return (
    <SegmentedControl value="monthly">
      <Option value="daily">Daily</Option>
      <Option value="weekly">Weekly</Option>
      <Option value="monthly">Monthly</Option>
    </SegmentedControl>
  );
}`,
    },
  ],

  seeAlso: ['tabs', 'radio-group', 'chip'],
};
