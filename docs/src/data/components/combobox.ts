import type { ComponentDef } from './_types';

export const combobox: ComponentDef = {
    name: 'Combobox',
    slug: 'combobox',
    tag: 'arc-combobox',
    tier: 'input',
    interactivity: 'interactive',
    description: 'Searchable dropdown with type-ahead filtering.',

    overview: `Combobox combines a text input with a filterable dropdown list, giving users the speed of typing with the certainty of selecting from a known set of options. As the user types into the input, the listbox narrows to show only options whose labels match the query string. This makes Combobox ideal for fields where the option set is too large for a plain Select but still needs to be constrained to predefined values -- country selectors, tag pickers, and user-mention fields are common examples.

Options are provided declaratively via \`<arc-option>\` children, each carrying a \`value\` and a visible \`label\`. The component reads these from the default slot on connect and rebuilds the filtered list on every keystroke. When the user selects an option -- by clicking it or pressing Enter on the highlighted item -- the combobox closes, the input displays the chosen label, and an \`arc-change\` event fires with the selected value.

Keyboard navigation follows the WAI-ARIA combobox pattern: Arrow Down/Up move the active highlight through the filtered list, Enter confirms the selection, and Escape dismisses the popup. The input carries \`role="combobox"\`, \`aria-expanded\`, \`aria-controls\`, and \`aria-activedescendant\` attributes so screen readers can announce the interaction accurately. Clicking outside the component closes the listbox via a document-level click listener.`,

    features: [
      'Type-ahead filtering that narrows options as the user types',
      'Declarative option list via <arc-option> children with value and label attributes',
      'Full keyboard navigation: ArrowDown, ArrowUp, Enter to select, Escape to dismiss',
      'WAI-ARIA combobox pattern with role, aria-expanded, aria-controls, and aria-activedescendant',
      'Visual active highlight and selected-state accent color on the current option',
      'Automatic close on outside click via a document-level event listener',
      'Configurable label, placeholder, and disabled state',
      '"No results found" empty state when the query matches zero options',
    ],

    guidelines: {
      do: [
        'Use Combobox when the option list exceeds 7-10 items and users benefit from filtering by typing',
        'Provide clear, distinct labels on every <arc-option> so filtering produces meaningful results',
        'Set a descriptive placeholder like "Search countries..." to indicate the field is searchable',
        'Include a label attribute for accessibility -- it renders a visible label above the input',
        'Listen to arc-change to capture the selected value and sync it with your application state',
      ],
      dont: [
        'Use Combobox for short lists (under 5 items) where a simple Select is faster',
        'Omit the value attribute on <arc-option> -- the component needs it to track selection',
        'Place non-<arc-option> elements in the default slot; they will be ignored by the filter logic',
        'Rely on Combobox for free-text entry -- it only accepts values from the predefined option set',
        'Disable the component without providing a visual explanation of why it is unavailable',
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

    props: [
      { name: 'value', type: 'string', default: "''", description: 'The currently selected option value. Reflected as an attribute so it can be read from the DOM. Updated automatically when the user selects an option.' },
      { name: 'placeholder', type: 'string', default: "''", description: 'Placeholder text shown in the input when no value is entered.' },
      { name: 'label', type: 'string', default: "''", description: 'Visible label rendered above the input. Also used as the accessible label for the combobox.' },
      { name: 'disabled', type: 'boolean', default: 'false', description: 'Disables the input and prevents interaction. The host element receives reduced opacity and pointer-events: none.' },
    ],
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

<Combobox label="Select Fruit" placeholder="Type to search...">
  <Option value="apple">Apple</Option>
  <Option value="banana">Banana</Option>
  <Option value="cherry">Cherry</Option>
</Combobox>`,
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
    <Combobox label="Select Fruit" placeholder="Type to search...">
      <Option value="apple">Apple</Option>
      <Option value="banana">Banana</Option>
      <Option value="cherry">Cherry</Option>
    </Combobox>
  \`,
})
export class MyComponent {}`,
      },
      {
        label: 'Solid',
        lang: 'tsx',
        code: `import { Combobox, Option } from '@arclux/arc-ui-solid';

<Combobox label="Select Fruit" placeholder="Type to search...">
  <Option value="apple">Apple</Option>
  <Option value="banana">Banana</Option>
  <Option value="cherry">Cherry</Option>
</Combobox>`,
      },
      {
        label: 'Preact',
        lang: 'tsx',
        code: `import { Combobox, Option } from '@arclux/arc-ui-preact';

<Combobox label="Select Fruit" placeholder="Type to search...">
  <Option value="apple">Apple</Option>
  <Option value="banana">Banana</Option>
  <Option value="cherry">Cherry</Option>
</Combobox>`,
      },
    ],
  
  seeAlso: ["select","multi-select","search","command-palette"],
};
