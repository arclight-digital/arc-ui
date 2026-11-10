import type { ComponentDef } from './_types';

export const multiSelect: ComponentDef = {
  name: 'Multi Select',
  slug: 'multi-select',
  tag: 'arc-multi-select',
  tier: 'input',
  interactivity: 'interactive',
  description:
    'A dropdown for picking several options, shown as removable chips.',

  overview: `Multi Select lets people pick several values from a fixed list. Each selection shows as a removable tag chip inside the control. The text input is also a filter: typing narrows the dropdown to options whose label contains what you typed.

Options are \`<arc-option>\` children, each with a \`value\` attribute and its text content as the label. The dropdown opens on focus. ArrowUp and ArrowDown move through the options, and Enter or a click toggles one. Backspace in an empty input removes the last tag.

\`arc-change\` fires whenever the selection changes, with the value array in \`detail.value\`. A click outside closes the dropdown.`,

  features: [
    'Selected options show a check mark in the dropdown',
    'Escape closes the dropdown',
    '"No results found" shows when the filter matches no options',
  ],

  guidelines: {
    do: [
      'Always set a `label` so screen readers can name the field',
      'Use a `placeholder` that says what to pick, such as "Choose languages..."',
      'Keep option labels short. They become tags inside the control',
      'Set `value` to the current selections when editing an existing record',
    ],
    dont: [
      'Don\'t use it when only one value is allowed. Use Select',
      'Don\'t load a long option list. Every matching option renders, so filter on the server instead. `arc-input` gives you the query on each keystroke',
      'Don\'t disable a field that has selections without saying why it can\'t be edited',
    ],
  },

  previewHtml: `<arc-multi-select label="Technologies" placeholder="Select technologies...">
  <arc-option value="react">React</arc-option>
  <arc-option value="vue">Vue</arc-option>
  <arc-option value="angular">Angular</arc-option>
  <arc-option value="svelte">Svelte</arc-option>
  <arc-option value="lit">Lit</arc-option>
</arc-multi-select>`,

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

export default function Example() {
  return (
    <MultiSelect label="Languages" placeholder="Choose...">
      <Option value="js">JavaScript</Option>
      <Option value="ts">TypeScript</Option>
      <Option value="py">Python</Option>
    </MultiSelect>
  );
}`,
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
    <arc-multi-select label="Languages" placeholder="Choose...">
      <arc-option value="js">JavaScript</arc-option>
      <arc-option value="ts">TypeScript</arc-option>
      <arc-option value="py">Python</arc-option>
    </arc-multi-select>
  \`,
})
export class MyComponent {}`,
    },
    {
      label: 'Solid',
      lang: 'tsx',
      code: `import { MultiSelect, Option } from '@arclux/arc-ui-solid';

export default function Example() {
  return (
    <MultiSelect label="Languages" placeholder="Choose...">
      <Option value="js">JavaScript</Option>
      <Option value="ts">TypeScript</Option>
      <Option value="py">Python</Option>
    </MultiSelect>
  );
}`,
    },
    {
      label: 'Preact',
      lang: 'tsx',
      code: `import { MultiSelect, Option } from '@arclux/arc-ui-preact';

export default function Example() {
  return (
    <MultiSelect label="Languages" placeholder="Choose...">
      <Option value="js">JavaScript</Option>
      <Option value="ts">TypeScript</Option>
      <Option value="py">Python</Option>
    </MultiSelect>
  );
}`,
    },
  ],

  seeAlso: ['select', 'combobox', 'chip', 'tag'],
};
