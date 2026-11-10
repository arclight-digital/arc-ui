import type { ComponentDef } from './_types';

export const search: ComponentDef = {
  name: 'Search',
  slug: 'search',
  tag: 'arc-search',
  tier: 'input',
  interactivity: 'interactive',
  description: 'A search field with an optional dropdown of suggestions that you supply.',

  overview: `Search is a text field for search and filtering. It has a magnifying glass icon at the start, a clear button that shows once there's text, and a spinner that takes the clear button's place while \`loading\` is set. A \`label\` renders above the field. Without one, the \`placeholder\` becomes the accessible name.

Typing fires \`arc-input\` on every keystroke. Enter fires \`arc-change\` to submit. The clear button empties the field, fires \`arc-clear\` and puts focus back in the field.

Add \`<arc-suggestion>\` children for a dropdown of suggestions. Each one's \`value\` is what you get back, and its text is the label. The dropdown opens on focus or typing, ArrowUp and ArrowDown move through it, Enter picks the highlighted one, and Escape or a click outside closes it. Picking one fills the field with its label and fires \`arc-select\` with \`{ value: { label, value } }\`, then \`arc-change\`. Search doesn't filter the list as you type. To narrow it, replace the children from your \`arc-input\` handler.

The field is a \`searchbox\`. With suggestions it becomes a \`combobox\` with \`aria-expanded\`, wired to a \`listbox\` of \`option\`s.`,

  features: [
    "The dropdown renders in the top layer, so a parent with `overflow: hidden` doesn't clip it",
    '`open` reflects whether the dropdown is showing, and you can set it yourself',
  ],

  guidelines: {
    do: [
      'Give it a `label`. Hide it with `::part(label)` if the design has no room for it',
      'Use `placeholder` to say what can be searched, for example "Search components..."',
      'Set `loading` while results are being fetched',
      'Debounce your `arc-input` handler for live search, and use `arc-change` for an explicit submit',
    ],
    dont: [
      "Don't use it for ordinary text fields. Use Input or Textarea",
      "Don't show hundreds of suggestions. Keep the list to 8 to 10",
      "Don't set `loading` when nothing is being fetched",
    ],
  },

  previewHtml: `<arc-search label="Search" placeholder="Search components...">
  <arc-suggestion value="button">Button</arc-suggestion>
  <arc-suggestion value="modal">Modal</arc-suggestion>
  <arc-suggestion value="table">Table</arc-suggestion>
  <arc-suggestion value="tabs">Tabs</arc-suggestion>
</arc-search>`,

  tabs: [
    {
      label: 'Web Component',
      lang: 'html',
      code: `<arc-search label="Search" placeholder="Search docs...">
  <arc-suggestion value="getting-started">Getting Started</arc-suggestion>
  <arc-suggestion value="components">Components</arc-suggestion>
</arc-search>`,
    },
    {
      label: 'React',
      lang: 'tsx',
      code: `import { Search, Suggestion } from '@arclux/arc-ui-react';

export default function Example() {
  return (
    <Search label="Search" placeholder="Search docs...">
      <Suggestion value="getting-started">Getting Started</Suggestion>
      <Suggestion value="components">Components</Suggestion>
    </Search>
  );
}`,
    },
    {
      label: 'Vue',
      lang: 'html',
      code: `<script setup>
import { Search, Suggestion } from '@arclux/arc-ui-vue';
</script>

<template>
  <Search label="Search" placeholder="Search docs...">
    <Suggestion value="getting-started">Getting Started</Suggestion>
    <Suggestion value="components">Components</Suggestion>
  </Search>
</template>`,
    },
    {
      label: 'Svelte',
      lang: 'html',
      code: `<script>
  import { Search, Suggestion } from '@arclux/arc-ui-svelte';
</script>

<Search label="Search" placeholder="Search docs...">
  <Suggestion value="getting-started">Getting Started</Suggestion>
  <Suggestion value="components">Components</Suggestion>
</Search>`,
    },
    {
      label: 'Angular',
      lang: 'ts',
      code: `import { Component } from '@angular/core';
import { Search, Suggestion } from '@arclux/arc-ui-angular';

@Component({
  imports: [Search, Suggestion],
  template: \`
    <arc-search label="Search" placeholder="Search docs...">
      <arc-suggestion value="getting-started">Getting Started</arc-suggestion>
      <arc-suggestion value="components">Components</arc-suggestion>
    </arc-search>
  \`,
})
export class MyComponent {}`,
    },
    {
      label: 'Solid',
      lang: 'tsx',
      code: `import { Search, Suggestion } from '@arclux/arc-ui-solid';

export default function Example() {
  return (
    <Search label="Search" placeholder="Search docs...">
      <Suggestion value="getting-started">Getting Started</Suggestion>
      <Suggestion value="components">Components</Suggestion>
    </Search>
  );
}`,
    },
    {
      label: 'Preact',
      lang: 'tsx',
      code: `import { Search, Suggestion } from '@arclux/arc-ui-preact';

export default function Example() {
  return (
    <Search label="Search" placeholder="Search docs...">
      <Suggestion value="getting-started">Getting Started</Suggestion>
      <Suggestion value="components">Components</Suggestion>
    </Search>
  );
}`,
    },
  ],
  subComponents: [
    {
      name: 'Suggestion',
      tag: 'arc-suggestion',
      description:
        'One suggestion in a Search dropdown. `value` is what the events report, and the text is the label.',
    },
  ],

  seeAlso: ['combobox', 'command-palette', 'input'],
};
