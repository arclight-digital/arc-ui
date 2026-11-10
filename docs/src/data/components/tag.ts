import type { ComponentDef } from './_types';

export const tag: ComponentDef = {
  name: 'Tag',
  slug: 'tag',
  tag: 'arc-tag',
  tier: 'data',
  interactivity: 'hybrid',
  description:
    'A small uppercase pill for a category or filter, with an optional button to remove it.',

  overview: `Tag is a small pill-shaped label for a category, a filter or a piece of metadata. Its text is uppercase in the label font with wide letter spacing.

There are seven variants: \`default\` (neutral border and muted text), \`primary\` and \`secondary\` (accent tints), and the status colors \`success\` (green), \`warning\` (yellow), \`error\` (red) and \`info\` (blue). On hover a tag glows in its variant's color, except \`default\` and \`info\`, which glow in the accent color.

When no variant fits, \`color\` takes an RGB triplet such as \`"77, 126, 247"\` and uses it for the border, text, background tint and hover glow. Use it for category colors that come from your data.

\`removable\` adds a close button after the label. Clicking it fires \`arc-remove\`, and your code removes the tag or clears the filter. The close button has its own hover state and focus ring.`,

  features: [
    'The default slot takes text, icons or both',
    'A disabled tag is 50% opacity and ignores the pointer, close button included',
  ],

  guidelines: {
    do: [
      'Use `primary` or `secondary` to group related categories',
      'Use `color` when category colors come from data, such as project or label colors',
      'Set `removable` on a filter the reader applied and can clear',
      'Keep labels to one to three words. Long uppercase labels are hard to read',
      'Listen for `arc-remove` once on the parent container, not on every tag',
      'Lay a set of tags out in a wrapping flex row with a small gap',
    ],
    dont: [
      "Don't use Tag for long text",
      "Don't use the close button for destructive actions such as deleting a resource. It should only remove the tag",
      "Don't use more than two variants in one group of tags",
      "Don't use Tag as a button. It has no button role or button focus handling",
    ],
  },

  previewHtml: `<div style="display:flex; gap:8px; flex-wrap:wrap; align-items:center;">
  <arc-tag>Default</arc-tag>
  <arc-tag variant="primary">Primary</arc-tag>
  <arc-tag variant="secondary">Secondary</arc-tag>
  <arc-tag variant="success">Success</arc-tag>
  <arc-tag variant="warning">Warning</arc-tag>
  <arc-tag variant="error">Error</arc-tag>
  <arc-tag color="255, 120, 50">Custom</arc-tag>
  <arc-tag variant="primary" removable>Removable</arc-tag>
</div>`,

  tabs: [
    {
      label: 'Web Component',
      lang: 'html',
      code: `<arc-tag>Default</arc-tag>
<arc-tag variant="primary">Primary</arc-tag>
<arc-tag variant="secondary">Secondary</arc-tag>
<arc-tag removable>Removable</arc-tag>

<!-- Custom color from data -->
<arc-tag color="255, 120, 50">Custom</arc-tag>
<arc-tag color="120, 200, 80">Green</arc-tag>`,
    },
    {
      label: 'React',
      lang: 'tsx',
      code: `import { Tag } from '@arclux/arc-ui-react';

export default function Example() {
  return (
    <>
      <Tag>Default</Tag>
      <Tag variant="primary">Primary</Tag>
      <Tag variant="secondary">Secondary</Tag>
      <Tag removable>Removable</Tag>

      {/* Custom color from data */}
      <Tag color="255, 120, 50">Custom</Tag>
      <Tag color="120, 200, 80">Green</Tag>
    </>
  );
}`,
    },
    {
      label: 'Vue',
      lang: 'html',
      code: `<script setup>
import { Tag } from '@arclux/arc-ui-vue';
</script>

<template>
  <Tag>Default</Tag>
  <Tag variant="primary">Primary</Tag>
  <Tag variant="secondary">Secondary</Tag>
  <Tag removable>Removable</Tag>
  <Tag color="255, 120, 50">Custom</Tag>
</template>`,
    },
    {
      label: 'Svelte',
      lang: 'html',
      code: `<script>
  import { Tag } from '@arclux/arc-ui-svelte';
</script>

<Tag>Default</Tag>
<Tag variant="primary">Primary</Tag>
<Tag variant="secondary">Secondary</Tag>
<Tag removable>Removable</Tag>
<Tag color="255, 120, 50">Custom</Tag>`,
    },
    {
      label: 'Angular',
      lang: 'ts',
      code: `import { Component } from '@angular/core';
import { Tag } from '@arclux/arc-ui-angular';

@Component({
  imports: [Tag],
  template: \`
    <arc-tag>Default</arc-tag>
    <arc-tag variant="primary">Primary</arc-tag>
    <arc-tag variant="secondary">Secondary</arc-tag>
    <arc-tag removable>Removable</arc-tag>
    <arc-tag color="255, 120, 50">Custom</arc-tag>
  \`,
})
export class MyComponent {}`,
    },
    {
      label: 'Solid',
      lang: 'tsx',
      code: `import { Tag } from '@arclux/arc-ui-solid';

export default function Example() {
  return (
    <>
      <Tag>Default</Tag>
      <Tag variant="primary">Primary</Tag>
      <Tag variant="secondary">Secondary</Tag>
      <Tag removable>Removable</Tag>
      <Tag color="255, 120, 50">Custom</Tag>
    </>
  );
}`,
    },
    {
      label: 'Preact',
      lang: 'tsx',
      code: `import { Tag } from '@arclux/arc-ui-preact';

export default function Example() {
  return (
    <>
      <Tag>Default</Tag>
      <Tag variant="primary">Primary</Tag>
      <Tag variant="secondary">Secondary</Tag>
      <Tag removable>Removable</Tag>
      <Tag color="255, 120, 50">Custom</Tag>
    </>
  );
}`,
    },
    {
      label: 'HTML',
      lang: 'html',
      code: `<arc-tag>Default</arc-tag>
<arc-tag variant="primary">Primary</arc-tag>
<arc-tag variant="secondary">Secondary</arc-tag>
<arc-tag removable>Removable</arc-tag>
<arc-tag color="255, 120, 50">Custom</arc-tag>`,
    },

    {
      label: 'HTML (Inline)',
      lang: 'html',
      code: `<!-- Auto-generated by @arclux/prism — do not edit manually -->
<!-- arc-tag — self-contained, no external CSS needed -->
<div class="arc-tag">

</div>`,
    },
  ],

  seeAlso: ['badge', 'chip'],
};
