import type { ComponentDef } from './_types';

export const chip: ComponentDef = {
  name: 'Chip',
  slug: 'chip',
  tag: 'arc-chip',
  tier: 'input',
  interactivity: 'interactive',
  description:
    'A toggleable pill-shaped element for filters, tags, or multi-select options, with a selected state highlighted in accent-primary.',

  overview: `Chip is a pill that toggles between selected and unselected. Use a set of chips to pick zero or more options from a visible list: filters, tag pickers, interest pickers. It renders an \`arc-tag\`, so it has Tag's uppercase label. Unselected, it's a default Tag. Selected, it's a primary Tag: accent-primary border and text on an \`--accent-primary-subtle\` background.

On its own, a chip has the \`button\` role with \`aria-pressed\`. Inside an ancestor with \`role="listbox"\` or \`role="group"\`, it switches to the \`option\` role with \`aria-selected\`. Enter and Space toggle it. A disabled chip leaves the tab order (\`tabindex="-1"\`). The slot takes any inline content, but plain text suits the uppercase styling best.

Each toggle fires \`arc-change\` with \`{ value, selected }\`. There's no chip group component, so to manage a set, listen to \`arc-change\` on each chip and keep the selected values in your own state. \`value\` is an identifier for your code, separate from the visible label.`,

  features: [
    'Glows on hover, in the variant color',
    'Disabled chips drop to 50% opacity and ignore the pointer',
  ],

  guidelines: {
    do: [
      'Give each chip a unique value',
      'Keep labels to one or two words',
      'Add a clear or reset action when chips act as active filters',
    ],
    dont: [
      'Don\'t use chips for mutually exclusive choices. Use SegmentedControl or RadioGroup',
      'Don\'t put a sentence in a chip',
      'Don\'t use a chip for navigation. It is an input, not a link',
      'Don\'t put buttons or links inside a chip',
    ],
  },

  previewHtml: `<div style="display:flex; gap:8px; flex-wrap:wrap;">
  <arc-chip value="react" selected>React</arc-chip>
  <arc-chip value="vue">Vue</arc-chip>
  <arc-chip value="svelte">Svelte</arc-chip>
  <arc-chip value="angular">Angular</arc-chip>
</div>`,

  tabs: [
    {
      label: 'Web Component',
      lang: 'html',
      code: `<arc-chip value="react" selected>React</arc-chip>
<arc-chip value="vue">Vue</arc-chip>
<arc-chip value="svelte">Svelte</arc-chip>`,
    },
    {
      label: 'React',
      lang: 'tsx',
      code: `import { Chip } from '@arclux/arc-ui-react';

export default function Example() {
  return (
    <>
      <Chip value="react" selected>React</Chip>
      <Chip value="vue">Vue</Chip>
      <Chip value="svelte">Svelte</Chip>
    </>
  );
}`,
    },
    {
      label: 'Vue',
      lang: 'html',
      code: `<script setup>
import { Chip } from '@arclux/arc-ui-vue';
</script>

<template>
  <Chip value="react" selected>React</Chip>
  <Chip value="vue">Vue</Chip>
  <Chip value="svelte">Svelte</Chip>
</template>`,
    },
    {
      label: 'Svelte',
      lang: 'html',
      code: `<script>
  import { Chip } from '@arclux/arc-ui-svelte';
</script>

<Chip value="react" selected>React</Chip>
<Chip value="vue">Vue</Chip>
<Chip value="svelte">Svelte</Chip>`,
    },
    {
      label: 'Angular',
      lang: 'ts',
      code: `import { Component } from '@angular/core';
import { Chip } from '@arclux/arc-ui-angular';

@Component({
  imports: [Chip],
  template: \`
    <arc-chip value="react" [selected]="true">React</arc-chip>
    <arc-chip value="vue">Vue</arc-chip>
    <arc-chip value="svelte">Svelte</arc-chip>
  \`,
})
export class MyComponent {}`,
    },
    {
      label: 'Solid',
      lang: 'tsx',
      code: `import { Chip } from '@arclux/arc-ui-solid';

export default function Example() {
  return (
    <>
      <Chip value="react" selected>React</Chip>
      <Chip value="vue">Vue</Chip>
      <Chip value="svelte">Svelte</Chip>
    </>
  );
}`,
    },
    {
      label: 'Preact',
      lang: 'tsx',
      code: `import { Chip } from '@arclux/arc-ui-preact';

export default function Example() {
  return (
    <>
      <Chip value="react" selected>React</Chip>
      <Chip value="vue">Vue</Chip>
      <Chip value="svelte">Svelte</Chip>
    </>
  );
}`,
    },
  ],

  seeAlso: ['tag', 'badge', 'segmented-control', 'multi-select'],
};
