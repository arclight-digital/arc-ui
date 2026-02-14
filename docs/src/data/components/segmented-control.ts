import type { ComponentDef } from './_types';

export const segmentedControl: ComponentDef = {
    name: 'Segmented Control',
    slug: 'segmented-control',
    tag: 'arc-segmented-control',
    tier: 'input',
    interactivity: 'interactive',
    description: 'A radio-group-style toggle bar that renders slotted arc-option elements as a row of mutually exclusive buttons with an active highlight.',

    overview: `Segmented Control provides a compact, horizontal set of mutually exclusive options rendered as a pill-shaped button group. It reads \`<arc-option>\` children from its default slot and mirrors them as styled buttons inside a bordered container with rounded corners. The currently selected option receives an accent-primary background with a subtle glow, while unselected options appear in muted text that brightens on hover.

The component uses a \`radiogroup\` ARIA role with individual \`radio\` roles on each option button, following the WAI-ARIA radio group pattern. Keyboard navigation supports arrow keys for cycling through options (with wrapping), Home/End for jumping to the first or last option, and Enter/Space for confirming a selection. Focus management automatically moves focus to the newly selected button after keyboard navigation.

Segmented Control auto-selects the first option when no initial \`value\` is provided, ensuring the control always has a valid selection. It fires a single \`arc-change\` event with the selected value whenever the user makes a new choice, making it straightforward to wire into form state or reactive frameworks.`,

    features: [
      'Renders slotted `<arc-option>` elements as styled toggle buttons in a horizontal pill container',
      'Active option highlighted with accent-primary background, contrasting text, and glow shadow',
      'Full keyboard navigation: arrow keys cycle options with wrapping, Home/End jump to edges, Enter/Space confirm',
      'ARIA radiogroup pattern with `role="radio"` and `aria-checked` on each option button',
      'Auto-selects the first option when no `value` attribute is provided',
      'Hover state brightens text and adds a subtle background on non-active options',
      'Disabled state at 40% opacity with pointer events blocked on the entire control',
      'Respects `prefers-reduced-motion` by disabling transitions',
    ],

    guidelines: {
      do: [
        'Use Segmented Control for 2-5 options where the user must pick exactly one',
        'Keep option labels short -- ideally one or two words -- to prevent overflow',
        'Provide a `value` attribute if you need to pre-select an option other than the first',
        'Listen to `arc-change` to react to selection changes in your application logic',
        'Place the control within a form context or a settings panel where space is limited',
      ],
      dont: [
        'Do not use for more than 5 options -- use Select or RadioGroup instead for longer lists',
        'Do not nest interactive elements inside `<arc-option>` children -- labels should be plain text',
        'Do not use Segmented Control for navigation between views -- use Tabs instead',
        'Do not rely solely on the glow colour to indicate selection -- the component also uses aria-checked for accessibility',
        'Avoid using it for binary toggles where a Toggle switch would be more semantically appropriate',
      ],
    },

    previewHtml: `<arc-segmented-control value="monthly">
  <arc-option value="daily">Daily</arc-option>
  <arc-option value="weekly">Weekly</arc-option>
  <arc-option value="monthly">Monthly</arc-option>
</arc-segmented-control>`,

    props: [
      { name: 'value', type: 'string', default: "''", description: 'The value of the currently selected option. Reflected as an attribute and auto-set to the first option if empty.' },
      { name: 'disabled', type: 'boolean', default: 'false', description: 'Disables the entire control, reducing opacity to 40% and blocking pointer events.' },
    ],
    events: [
      { name: 'arc-change', description: 'Fired when the selected segment changes' },
    ],

    subComponents: [
      {
        name: 'Option',
        tag: 'arc-option',
        description: 'Individual option element slotted into the segmented control. The `value` attribute identifies the option and the text content becomes the label.',
        props: [
          { name: 'value', type: 'string', default: "''", description: 'The value identifier for this option, used to match against the parent control value.' },
        ],
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

<SegmentedControl value="monthly">
  <Option value="daily">Daily</Option>
  <Option value="weekly">Weekly</Option>
  <Option value="monthly">Monthly</Option>
</SegmentedControl>`,
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
    <SegmentedControl value="monthly">
      <Option value="daily">Daily</Option>
      <Option value="weekly">Weekly</Option>
      <Option value="monthly">Monthly</Option>
    </SegmentedControl>
  \`,
})
export class MyComponent {}`,
      },
      {
        label: 'Solid',
        lang: 'tsx',
        code: `import { SegmentedControl, Option } from '@arclux/arc-ui-solid';

<SegmentedControl value="monthly">
  <Option value="daily">Daily</Option>
  <Option value="weekly">Weekly</Option>
  <Option value="monthly">Monthly</Option>
</SegmentedControl>`,
      },
      {
        label: 'Preact',
        lang: 'tsx',
        code: `import { SegmentedControl, Option } from '@arclux/arc-ui-preact';

<SegmentedControl value="monthly">
  <Option value="daily">Daily</Option>
  <Option value="weekly">Weekly</Option>
  <Option value="monthly">Monthly</Option>
</SegmentedControl>`,
      },
      {
        label: 'HTML',
        lang: 'html',
        code: `<arc-segmented-control value="monthly">
  <arc-option value="daily">Daily</arc-option>
  <arc-option value="weekly">Weekly</arc-option>
  <arc-option value="monthly">Monthly</arc-option>
</arc-segmented-control>`,
      },
    ],
  
  seeAlso: ["tabs","radio-group","chip"],
};
