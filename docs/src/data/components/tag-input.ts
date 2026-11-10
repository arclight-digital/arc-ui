import type { ComponentDef } from './_types';

export const tagInput: ComponentDef = {
  name: 'Tag Input',
  slug: 'tag-input',
  tag: 'arc-tag-input',
  tier: 'input',
  interactivity: 'interactive',
  description:
    'Free-text token entry field with optional autocomplete suggestions, delimiter splitting, and duplicate rejection.',

  overview: `TagInput collects a list of free-text values as removable chips. Pressing Enter or typing the \`delimiter\` (a comma by default) adds the trimmed text as a tag, and pasted text is split on the delimiter into several tags at once.

Give it a \`suggestions\` array and matching values appear in a dropdown as the reader types. Free text is still accepted unless you set \`no-custom\` (\`allowCustom = false\`), and then only suggestions can be added. A duplicate isn't added, and the existing chip shakes to show why. The shake is off under reduced motion.

TagInput is form-associated and submits one FormData entry per tag under its \`name\`, so the server gets a repeated field. Once \`max-tags\` is reached, entry is disabled and a "-- max reached" hint appears.`,

  features: [
    'Keyboard: Backspace in an empty input removes the last tag, ArrowLeft from the start of the input moves into the chips, the arrows move between chips, Backspace or Delete removes one, and Escape returns to the input',
    'In the suggestion list, ArrowUp and ArrowDown move and Enter or a click adds the value',
  ],

  guidelines: {
    do: [
      'Set a `label`. It renders as a `<label>` for the text input, so screen readers announce it',
      'Provide `suggestions` when there\'s a known vocabulary, to speed up entry and cut typos',
      'Set `allowCustom` to false when values must come from that vocabulary',
      'Set `max-tags` when the system receiving the values accepts only so many',
      'Listen to `arc-input` to fetch suggestions from a server as the reader types',
    ],
    dont: [
      'Don\'t use TagInput when readers pick from a fixed list and want to browse it. Use MultiSelect',
      'Don\'t pick a delimiter that can appear inside a value',
      'Don\'t use very long tag values. They overflow the chips',
      'Don\'t rely on the shake alone to explain a rejected value where it matters. Set an `error` message too',
    ],
  },

  previewHtml: `<arc-tag-input
  label="Topics"
  placeholder="Add a topic..."
  suggestions='["JavaScript","TypeScript","Rust","Python","Go","Swift","Kotlin"]'
  value='["JavaScript"]'
></arc-tag-input>`,

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

export default function Example() {
  return (
    <TagInput
      label="Topics"
      placeholder="Add a topic..."
      suggestions={['JavaScript', 'TypeScript', 'Python']}
      maxTags={5}
      onArcChange={(e) => console.log(e.detail.value)}
    />
  );
}`,
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
    <arc-tag-input
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

export default function Example() {
  return (
    <TagInput
      label="Topics"
      placeholder="Add a topic..."
      suggestions={['JavaScript', 'TypeScript', 'Python']}
      maxTags={5}
    />
  );
}`,
    },
    {
      label: 'Preact',
      lang: 'tsx',
      code: `import { TagInput } from '@arclux/arc-ui-preact';

export default function Example() {
  return (
    <TagInput
      label="Topics"
      placeholder="Add a topic..."
      suggestions={['JavaScript', 'TypeScript', 'Python']}
      maxTags={5}
    />
  );
}`,
    },
  ],

  seeAlso: ['multi-select', 'combobox', 'input', 'tag'],
};
