import type { ComponentDef } from './_types';

export const multiSelect: ComponentDef = {
    name: 'Multi Select',
    slug: 'multi-select',
    tag: 'arc-multi-select',
    tier: 'input',
    interactivity: 'interactive',
    description: 'Multi-value select with tag chips, inline search filtering, and keyboard navigation.',

    overview: `MultiSelect is a form control that allows users to choose multiple values from a predefined list of options. Selected items appear as removable tag chips inside the control, giving clear visual feedback about what has been chosen. The inline text input doubles as a filter -- typing narrows the dropdown to matching options, making it efficient even with large option sets.

Options are provided declaratively using \`<arc-option>\` child elements, each with a \`value\` and visible label. The dropdown opens on focus and filters in real time as the user types. Items can be toggled on and off by clicking or via keyboard navigation with ArrowUp/ArrowDown and Enter. Pressing Backspace when the text input is empty removes the last selected tag, providing a natural editing flow.

MultiSelect fires an \`arc-change\` event whenever the selection changes, with the current value array in the event detail. The component handles outside-click dismissal automatically and exposes CSS parts for \`control\`, \`tag\`, \`input\`, \`dropdown\`, and \`option\` to support targeted style customisation.`,

    features: [
      'Selected values rendered as removable pill-shaped tag chips inside the control area',
      'Inline type-ahead filtering that narrows the dropdown options in real time',
      'Full keyboard navigation: ArrowUp/Down to move, Enter to select, Escape to close, Backspace to remove the last tag',
      'Check marks next to already-selected options in the dropdown for clear state indication',
      'Declarative options via `<arc-option>` child elements with `value` and `label` attributes',
      'Automatic outside-click dismissal of the dropdown panel',
      'Focus glow on the control using the shared `--focus-glow` design token',
      '"No results found" empty state when the filter query matches no options',
    ],

    guidelines: {
      do: [
        'Always provide a `label` so the field is accessible to screen readers',
        'Use a descriptive `placeholder` to hint at expected input, such as "Choose languages..."',
        'Keep option labels concise so they display well as tags inside the control',
        'Listen to `arc-change` to react to selection changes and keep external state in sync',
        'Pre-populate the `value` array when editing existing records to show current selections',
      ],
      dont: [
        'Do not use MultiSelect when only a single value is needed -- use Select instead',
        'Do not provide more than ~50 options without also considering server-side filtering via arc-change',
        'Do not use extremely long option labels -- they will overflow the tag chips and the dropdown',
        'Do not set both `disabled` and a pre-selected `value` without a clear visual explanation of why editing is blocked',
        'Avoid nesting MultiSelect inside a popover or modal without testing z-index stacking for the dropdown',
      ],
    },

    previewHtml: `<arc-multi-select label="Technologies" placeholder="Select technologies...">
  <arc-option value="react">React</arc-option>
  <arc-option value="vue">Vue</arc-option>
  <arc-option value="angular">Angular</arc-option>
  <arc-option value="svelte">Svelte</arc-option>
  <arc-option value="lit">Lit</arc-option>
</arc-multi-select>`,

    props: [
      { name: 'value', type: 'string[]', default: '[]', description: 'Array of selected option values. Updated when items are toggled and emitted via `arc-change`.' },
      { name: 'label', type: 'string', default: "''", description: 'Visible label rendered above the control in a small uppercase style.' },
      { name: 'placeholder', type: 'string', default: "''", description: 'Hint text shown inside the control when no items are selected and the input is empty.' },
      { name: 'disabled', type: 'boolean', default: 'false', description: 'Disables the control, preventing interaction and reducing opacity to 50%.' },
    ],
    events: [
      { name: 'arc-change', description: 'Fired when the selected values change' },
    ],
    tabs: [
      {
        label: 'Web Component',
        lang: 'html',
        code: `<arc-multi-select label="Languages" placeholder="Choose...">
  <arc-option value="js">JavaScript</arc-option>
  <arc-option value="ts">TypeScript</arc-option>
  <arc-option value="py">Python</arc-option>
</arc-multi-select>`,
      },
      {
        label: 'React',
        lang: 'tsx',
        code: `import { MultiSelect, Option } from '@arclux/arc-ui-react';

<MultiSelect label="Languages" placeholder="Choose...">
  <Option value="js">JavaScript</Option>
  <Option value="ts">TypeScript</Option>
  <Option value="py">Python</Option>
</MultiSelect>`,
      },
      {
        label: 'Vue',
        lang: 'html',
        code: `<script setup>
import { MultiSelect, Option } from '@arclux/arc-ui-vue';
</script>

<template>
  <MultiSelect label="Languages" placeholder="Choose...">
    <Option value="js">JavaScript</Option>
    <Option value="ts">TypeScript</Option>
    <Option value="py">Python</Option>
  </MultiSelect>
</template>`,
      },
      {
        label: 'Svelte',
        lang: 'html',
        code: `<script>
  import { MultiSelect, Option } from '@arclux/arc-ui-svelte';
</script>

<MultiSelect label="Languages" placeholder="Choose...">
  <Option value="js">JavaScript</Option>
  <Option value="ts">TypeScript</Option>
  <Option value="py">Python</Option>
</MultiSelect>`,
      },
      {
        label: 'Angular',
        lang: 'ts',
        code: `import { Component } from '@angular/core';
import { MultiSelect, Option } from '@arclux/arc-ui-angular';

@Component({
  imports: [MultiSelect, Option],
  template: \`
    <MultiSelect label="Languages" placeholder="Choose...">
      <Option value="js">JavaScript</Option>
      <Option value="ts">TypeScript</Option>
      <Option value="py">Python</Option>
    </MultiSelect>
  \`,
})
export class MyComponent {}`,
      },
      {
        label: 'Solid',
        lang: 'tsx',
        code: `import { MultiSelect, Option } from '@arclux/arc-ui-solid';

<MultiSelect label="Languages" placeholder="Choose...">
  <Option value="js">JavaScript</Option>
  <Option value="ts">TypeScript</Option>
  <Option value="py">Python</Option>
</MultiSelect>`,
      },
      {
        label: 'Preact',
        lang: 'tsx',
        code: `import { MultiSelect, Option } from '@arclux/arc-ui-preact';

<MultiSelect label="Languages" placeholder="Choose...">
  <Option value="js">JavaScript</Option>
  <Option value="ts">TypeScript</Option>
  <Option value="py">Python</Option>
</MultiSelect>`,
      },
    ],
  };
