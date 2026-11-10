import type { ComponentDef } from './_types';

export const combobox: ComponentDef = {
  name: 'Combobox',
  slug: 'combobox',
  tag: 'arc-combobox',
  tier: 'input',
  interactivity: 'interactive',
  searchKeywords: ['autocomplete', 'typeahead'],
  description: 'A text input that filters a list of options as you type, for picking one value from a long list.',

  overview: `Combobox is a text input over a list of \`<arc-option>\` elements. Typing narrows the list to options whose text contains the query, ignoring case. Picking an option, by click or by Enter on the highlighted one, closes the list, puts the option's text in the input and fires \`arc-change\` with its value. Every keystroke fires \`arc-input\` with the query.

Use it when the list is too long to scroll through but the value has to be one of the options, such as a country field. There's no free-text entry.

Each \`<arc-option>\` needs a \`value\`, and its text content is the label that's shown and searched. The component renders its own copy of each option and hides the ones you wrote.`,

  features: [
    'The input has `role="combobox"` with `aria-expanded`, `aria-controls` and `aria-activedescendant`, and the list is a `listbox` of `option` elements',
    'Arrow Down and Arrow Up move the highlight, Enter selects and Escape closes. Home and End move the highlight only while the input is empty',
    'Disabled options are dimmed, skipped by the arrow keys and can\'t be selected',
    'Shows "No results found" when nothing matches the query',
    'Clicking outside or moving focus away closes the list',
    'Form-associated: give it a `name` and the selected value submits with the form',
    '`readonly` blocks typing and selection, but the input stays focusable, the list still opens and the value still submits',
  ],

  guidelines: {
    do: [
      'Give every option a distinct `value`. Selection is tracked by value',
      'Write a placeholder that says the field is searchable, such as "Search countries..."',
      'Set `label`. It renders above the input and is the accessible name',
    ],
    dont: [
      'Don\'t use it for a handful of options. A Select is quicker',
      'Don\'t put anything but `<arc-option>` in the slot. Other elements are ignored',
    ],
  },

  previewHtml: `<arc-combobox label="Select a framework" placeholder="Type to search..." style="width:260px">
  <arc-option value="react" label="React">React</arc-option>
  <arc-option value="vue" label="Vue">Vue</arc-option>
  <arc-option value="angular" label="Angular">Angular</arc-option>
  <arc-option value="svelte" label="Svelte">Svelte</arc-option>
  <arc-option value="solid" label="Solid">Solid</arc-option>
  <arc-option value="preact" label="Preact">Preact</arc-option>
  <arc-option value="lit" label="Lit">Lit</arc-option>
</arc-combobox>`,

  tabs: [
    {
      label: 'Web Component',
      lang: 'html',
      code: `<arc-combobox label="Select Fruit" placeholder="Type to search...">
  <arc-option value="apple">Apple</arc-option>
  <arc-option value="banana">Banana</arc-option>
  <arc-option value="cherry">Cherry</arc-option>
</arc-combobox>`,
    },
    {
      label: 'React',
      lang: 'tsx',
      code: `import { Combobox, Option } from '@arclux/arc-ui-react';

export default function Example() {
  return (
    <Combobox label="Select Fruit" placeholder="Type to search...">
      <Option value="apple">Apple</Option>
      <Option value="banana">Banana</Option>
      <Option value="cherry">Cherry</Option>
    </Combobox>
  );
}`,
    },
    {
      label: 'Vue',
      lang: 'html',
      code: `<script setup>
import { Combobox, Option } from '@arclux/arc-ui-vue';
</script>

<template>
  <Combobox label="Select Fruit" placeholder="Type to search...">
    <Option value="apple">Apple</Option>
    <Option value="banana">Banana</Option>
    <Option value="cherry">Cherry</Option>
  </Combobox>
</template>`,
    },
    {
      label: 'Svelte',
      lang: 'html',
      code: `<script>
  import { Combobox, Option } from '@arclux/arc-ui-svelte';
</script>

<Combobox label="Select Fruit" placeholder="Type to search...">
  <Option value="apple">Apple</Option>
  <Option value="banana">Banana</Option>
  <Option value="cherry">Cherry</Option>
</Combobox>`,
    },
    {
      label: 'Angular',
      lang: 'ts',
      code: `import { Component } from '@angular/core';
import { Combobox, Option } from '@arclux/arc-ui-angular';

@Component({
  imports: [Combobox, Option],
  template: \`
    <arc-combobox label="Select Fruit" placeholder="Type to search...">
      <arc-option value="apple">Apple</arc-option>
      <arc-option value="banana">Banana</arc-option>
      <arc-option value="cherry">Cherry</arc-option>
    </arc-combobox>
  \`,
})
export class MyComponent {}`,
    },
    {
      label: 'Solid',
      lang: 'tsx',
      code: `import { Combobox, Option } from '@arclux/arc-ui-solid';

export default function Example() {
  return (
    <Combobox label="Select Fruit" placeholder="Type to search...">
      <Option value="apple">Apple</Option>
      <Option value="banana">Banana</Option>
      <Option value="cherry">Cherry</Option>
    </Combobox>
  );
}`,
    },
    {
      label: 'Preact',
      lang: 'tsx',
      code: `import { Combobox, Option } from '@arclux/arc-ui-preact';

export default function Example() {
  return (
    <Combobox label="Select Fruit" placeholder="Type to search...">
      <Option value="apple">Apple</Option>
      <Option value="banana">Banana</Option>
      <Option value="cherry">Cherry</Option>
    </Combobox>
  );
}`,
    },
  ],

  seeAlso: ['select', 'multi-select', 'search', 'command-palette'],
};
