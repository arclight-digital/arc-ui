import type { ComponentDef } from './_types';

export const search: ComponentDef = {
    name: 'Search',
    slug: 'search',
    tag: 'arc-search',
    tier: 'input',
    interactivity: 'interactive',
    description: 'Search input with a magnifying glass icon, clear button, loading spinner, and autocomplete suggestions dropdown.',

    overview: `Search is a purpose-built input component for search and filter interactions. It wraps a text input with a leading magnifying glass icon, an optional clear button, and a loading spinner that can be toggled while results are being fetched. When \`<arc-suggestion>\` child elements are provided, the component displays a dropdown of autocomplete suggestions that the user can navigate with the keyboard or mouse.

The component fires three distinct events to cover the full search lifecycle: \`arc-input\` on every keystroke for live filtering, \`arc-change\` when the user presses Enter to submit, and \`arc-select\` when a suggestion is chosen. The clear button (visible when the input has content) resets the field and dispatches \`arc-clear\`, then returns focus to the input for a seamless editing flow.

Suggestions are provided declaratively with \`<arc-suggestion>\` elements, each carrying a \`value\` and a visible label. The dropdown opens on focus when suggestions exist and supports ArrowUp/ArrowDown navigation, Enter to select, and Escape to dismiss. The search input uses \`role="searchbox"\` and connects to the suggestion listbox with proper ARIA attributes for screen reader compatibility.`,

    features: [
      'Built-in magnifying glass search icon positioned inside the input field',
      'Clear button that appears when the input has a value, with `arc-clear` event on click',
      'Loading spinner toggled via the `loading` prop, replacing the clear button while active',
      'Autocomplete suggestions dropdown via `<arc-suggestion>` child elements',
      'Full keyboard navigation: ArrowUp/Down through suggestions, Enter to select or submit, Escape to close',
      'Three event types: `arc-input` (keystrokes), `arc-change` (submit), `arc-select` (suggestion picked)',
      'Automatic outside-click dismissal of the suggestion dropdown',
      'Accessible `role="searchbox"` with `aria-expanded` and `role="listbox"` for suggestions',
    ],

    guidelines: {
      do: [
        'Provide a `label` for accessibility even if you visually hide it with CSS',
        'Use `placeholder` to describe what the user can search for, e.g. "Search components..."',
        'Set `loading` to true while fetching results to give the user visual feedback',
        'Provide `<arc-suggestion>` elements for common or recent queries to speed up discovery',
        'Listen to `arc-input` for debounced live search, and `arc-change` for explicit submission',
      ],
      dont: [
        'Do not use Search for generic text input -- use Input or Textarea for non-search fields',
        'Do not populate suggestions with hundreds of items -- keep the list to 8-10 for usability',
        'Do not rely solely on the clear button for resetting -- also handle programmatic value clearing',
        'Do not use `loading` without actually fetching data -- it misleads users about system activity',
        'Avoid placing Search inside a container with `overflow: hidden` that would clip the suggestion dropdown',
      ],
    },

    previewHtml: `<arc-search label="Search" placeholder="Search components...">
  <arc-suggestion value="button">Button</arc-suggestion>
  <arc-suggestion value="modal">Modal</arc-suggestion>
  <arc-suggestion value="table">Table</arc-suggestion>
  <arc-suggestion value="tabs">Tabs</arc-suggestion>
</arc-search>`,

    props: [
      { name: 'value', type: 'string', default: "''", description: 'Current text content of the search input.' },
      { name: 'placeholder', type: 'string', default: "'Search...'", description: 'Hint text displayed when the input is empty.' },
      { name: 'label', type: 'string', default: "''", description: 'Accessible label for the search field. Rendered visually above the input when provided.' },
      { name: 'disabled', type: 'boolean', default: 'false', description: 'Disables the input, reducing opacity and blocking interaction.' },
      { name: 'loading', type: 'boolean', default: 'false', description: 'Shows a spinning indicator in place of the clear button to signal in-progress loading.' },
    ],
    events: [
      { name: 'arc-input', description: 'Fired on each keystroke in the search field' },
      { name: 'arc-clear', description: 'Fired when the clear button is clicked' },
      { name: 'arc-change', description: 'Fired when the search value changes on blur' },
      { name: 'arc-select', description: 'Fired when a suggestion is selected' },
    ],
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

<Search label="Search" placeholder="Search docs...">
  <Suggestion value="getting-started">Getting Started</Suggestion>
  <Suggestion value="components">Components</Suggestion>
</Search>`,
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
    <Search label="Search" placeholder="Search docs...">
      <Suggestion value="getting-started">Getting Started</Suggestion>
      <Suggestion value="components">Components</Suggestion>
    </Search>
  \`,
})
export class MyComponent {}`,
      },
      {
        label: 'Solid',
        lang: 'tsx',
        code: `import { Search, Suggestion } from '@arclux/arc-ui-solid';

<Search label="Search" placeholder="Search docs...">
  <Suggestion value="getting-started">Getting Started</Suggestion>
  <Suggestion value="components">Components</Suggestion>
</Search>`,
      },
      {
        label: 'Preact',
        lang: 'tsx',
        code: `import { Search, Suggestion } from '@arclux/arc-ui-preact';

<Search label="Search" placeholder="Search docs...">
  <Suggestion value="getting-started">Getting Started</Suggestion>
  <Suggestion value="components">Components</Suggestion>
</Search>`,
      },
    ],
    subComponents: [
      {
        name: 'Suggestion',
        tag: 'arc-suggestion',
        description: 'Autocomplete suggestion item inside a Search component.',
        props: [
          { name: 'value', type: 'string', description: 'Suggestion value' },
        ],
      },
    ],
  };
