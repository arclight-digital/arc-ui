import type { ComponentDef } from './_types';

export const tagInput: ComponentDef = {
    name: 'Tag Input',
    slug: 'tag-input',
    tag: 'arc-tag-input',
    tier: 'input',
    interactivity: 'interactive',
    status: 'beta',
    description: 'Free-text token entry field with optional autocomplete suggestions, delimiter splitting, and duplicate rejection.',

    overview: `TagInput lets users build a list of free-text values as removable tag chips. Typing a value and pressing Enter -- or the configurable delimiter character (comma by default) -- commits the trimmed text as a tag. Pasting text containing delimiters splits it into multiple tags at once, making it fast to import comma-separated lists.

An optional \`suggestions\` array turns the field into a lightweight autocomplete: as the user types, matching suggestions appear in a dropdown listbox navigable with ArrowUp/ArrowDown and committed with Enter or a click. Free text is still allowed alongside suggestions unless \`allowCustom\` is set to false, in which case only values from the suggestion list can be added. Duplicate entries are rejected -- the existing chip shakes briefly to show why nothing was added (the animation is suppressed under reduced-motion preferences).

TagInput is form-associated: it submits one FormData entry per tag under its \`name\`, so servers receive the values as a repeated field. A \`maxTags\` limit disables further entry with a "-- max reached" hint once reached. Keyboard editing mirrors MultiSelect: Backspace in an empty input removes the last tag, and ArrowLeft from the start of the input walks focus into the chips where arrows navigate and Backspace/Delete removes.`,

    features: [
      'Free-text tag creation on Enter or a configurable delimiter character (comma by default)',
      'Paste splitting: pasted text containing delimiters becomes multiple tags in one action',
      'Optional autocomplete dropdown driven by a `suggestions` array with type-ahead filtering',
      '`allowCustom={false}` restricts entry to suggestion values only',
      'Duplicate rejection with a brief shake animation on the existing chip (respects reduced motion)',
      '`maxTags` limit with an inline "-- max reached" hint when full',
      'Full keyboard editing: Backspace removes the last tag, ArrowLeft walks into chips, arrows navigate, Backspace/Delete removes, Escape returns to the input',
      'Form-associated: submits one FormData entry per tag under `name`',
    ],

    guidelines: {
      do: [
        'Always provide a `label` so the field is accessible to screen readers',
        'Provide `suggestions` when a known vocabulary exists -- it speeds entry and reduces typos',
        'Set `allowCustom` to false when values must come from a controlled vocabulary',
        'Use `maxTags` to cap entries when downstream systems limit how many values are accepted',
        'Listen to `arc-input` to fetch or refine suggestions from a server as the user types',
      ],
      dont: [
        'Do not use TagInput when values must be chosen from a fixed list and casual browsing matters -- use MultiSelect instead',
        'Do not pick a delimiter character that legitimately appears inside your values',
        'Do not use extremely long tag values -- they will overflow the chips',
        'Do not rely on the shake animation alone to explain rejected input in critical flows -- pair with an `error` message where it matters',
      ],
    },

    previewHtml: `<arc-tag-input
  label="Topics"
  placeholder="Add a topic..."
  suggestions='["JavaScript","TypeScript","Rust","Python","Go","Swift","Kotlin"]'
  value='["JavaScript"]'
></arc-tag-input>`,

    props: [
      { name: 'value', type: 'string[]', default: '[]', description: 'Array of current tags. Updated on add/remove and emitted via `arc-change`.' },
      { name: 'suggestions', type: 'string[]', default: '[]', description: 'Autocomplete candidates. When non-empty, typing filters them into a dropdown listbox.' },
      { name: 'delimiter', type: 'string', default: "','", description: 'Character that commits the current text as a tag when typed; pasted text is split on it.' },
      { name: 'maxTags', type: 'number', default: '0', description: 'Maximum number of tags (0 = unlimited). At the limit, entry is disabled with a "-- max reached" hint.' },
      { name: 'allowCustom', type: 'boolean', default: 'true', description: 'When false, only values from `suggestions` can be added; free text is rejected.' },
      { name: 'label', type: 'string', default: "''", description: 'Visible label rendered above the field in a small uppercase style.' },
      { name: 'placeholder', type: 'string', default: "''", description: 'Hint text shown inside the field when no tags exist and the input is empty.' },
      { name: 'name', type: 'string', default: "''", description: 'Form field name. Each tag is submitted as its own FormData entry under this name.' },
      { name: 'disabled', type: 'boolean', default: 'false', description: 'Disables the control, preventing interaction and reducing opacity to 50%.' },
      { name: 'error', type: 'string', default: "''", description: 'Error message shown below the field; also applies error styling to the border.' },
    ],
    events: [
      { name: 'arc-change', description: 'Fired when a tag is added or removed; detail contains `{ value }`' },
      { name: 'arc-input', description: 'Fired as the user types; detail contains `{ query }`' },
    ],
    tabs: [
    {
        label: 'Web Component',
        lang: 'html',
        code: `<arc-tag-input
  label="Topics"
  placeholder="Add a topic..."
  suggestions='["JavaScript","TypeScript","Python"]'
  max-tags="5"
></arc-tag-input>`,
      },
    {
        label: 'React',
        lang: 'tsx',
        code: `import { TagInput } from '@arclux/arc-ui-react';

<TagInput
  label="Topics"
  placeholder="Add a topic..."
  suggestions={['JavaScript', 'TypeScript', 'Python']}
  maxTags={5}
  onArcChange={(e) => console.log(e.detail.value)}
/>`,
      },
    {
        label: 'Vue',
        lang: 'html',
        code: `<script setup>
import { TagInput } from '@arclux/arc-ui-vue';
</script>

<template>
  <TagInput
    label="Topics"
    placeholder="Add a topic..."
    :suggestions="['JavaScript', 'TypeScript', 'Python']"
    :maxTags="5"
  />
</template>`,
      },
    {
        label: 'Svelte',
        lang: 'html',
        code: `<script>
  import { TagInput } from '@arclux/arc-ui-svelte';
</script>

<TagInput
  label="Topics"
  placeholder="Add a topic..."
  suggestions={['JavaScript', 'TypeScript', 'Python']}
  maxTags={5}
/>`,
      },
    {
        label: 'Angular',
        lang: 'ts',
        code: `import { Component } from '@angular/core';
import { TagInput } from '@arclux/arc-ui-angular';

@Component({
  imports: [TagInput],
  template: \`
    <TagInput
      label="Topics"
      placeholder="Add a topic..."
      [suggestions]="['JavaScript', 'TypeScript', 'Python']"
      [maxTags]="5"
    />
  \`,
})
export class MyComponent {}`,
      },
    {
        label: 'Solid',
        lang: 'tsx',
        code: `import { TagInput } from '@arclux/arc-ui-solid';

<TagInput
  label="Topics"
  placeholder="Add a topic..."
  suggestions={['JavaScript', 'TypeScript', 'Python']}
  maxTags={5}
/>`,
      },
    {
        label: 'Preact',
        lang: 'tsx',
        code: `import { TagInput } from '@arclux/arc-ui-preact';

<TagInput
  label="Topics"
  placeholder="Add a topic..."
  suggestions={['JavaScript', 'TypeScript', 'Python']}
  maxTags={5}
/>`,
      },
  ],

  seeAlso: ["multi-select","combobox","input","tag"],
};
