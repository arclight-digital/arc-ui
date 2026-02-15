import type { ComponentDef } from './_types';

export const tag: ComponentDef = {
    name: 'Tag',
    slug: 'tag',
    tag: 'arc-tag',
    tier: 'data',
    interactivity: 'hybrid',
    description: 'Compact pill-shaped label with colour variants, custom colour support, and an optional remove button, for categorisation, filtering, and selection feedback.',

    overview: `Tag is a small, pill-shaped label component used to categorise, filter, or display metadata inline. It renders its content in uppercase with accent font styling and letter spacing, giving it a distinct visual weight that stands out against body text without overwhelming the layout. Tags are commonly seen in filter bars, resource cards, multi-select summaries, and anywhere compact labeling is needed.

Six colour variants are available: \`default\` (neutral border and muted text), \`primary\` (accent-primary tint), \`secondary\` (accent-secondary tint), \`success\` (green), \`warning\` (yellow), and \`danger\` (red). The accent and status variants gain a coloured glow on hover, making them effective for interactive filtering scenarios where the user needs to distinguish active categories at a glance.

For cases where the built-in variants don't cover your colour needs, the \`color\` prop accepts an RGB triplet (e.g. \`"77, 126, 247"\`) and applies it as the tag's border, text, background tint, and hover glow. This is useful for category-specific colours that come from data rather than design tokens.

When the \`removable\` prop is set, a small close button appears after the label. Clicking it fires an \`arc-remove\` event, allowing the parent component to handle removal logic (e.g. removing a filter, un-selecting a value). The remove button has its own hover state and focus ring, ensuring it is independently accessible for keyboard users.`,

    features: [
      'Six colour variants: default, primary, secondary, success, warning, and danger',
      'Custom `color` prop accepting an RGB triplet for data-driven category colours',
      'Pill shape with full border-radius and uppercase letter-spaced text for visual distinction',
      'Optional remove button via `removable` prop, firing `arc-remove` on click',
      'Hover glow effect on coloured variants and custom colours using matching box-shadow',
      'Default slot for label content, supporting text, icons, or mixed content',
      'Disabled state at 40% opacity with pointer events blocked on the entire tag',
      'Focus-visible ring on the remove button for keyboard accessibility',
      'CSS parts `tag`, `label`, and `remove` for targeted external styling',
    ],

    guidelines: {
      do: [
        'Use the `primary` or `secondary` variant to visually group related categories together',
        'Use the `color` prop when category colours come from data (e.g. project colours, label colours)',
        'Enable `removable` when the tag represents a user-applied filter that can be cleared',
        'Keep tag labels to 1-3 words -- the uppercase styling amplifies length visually',
        'Listen to `arc-remove` on the parent container using event delegation for efficient handling',
        'Combine multiple tags in a flex-wrap container with a small gap for scannable filter displays',
      ],
      dont: [
        'Do not use Tag for long descriptive text -- it is designed for short categorical labels',
        'Do not use the remove button for destructive actions (like deleting a resource) -- it should only remove the tag itself',
        'Do not mix more than two colour variants in the same tag group -- it creates visual noise',
        'Do not set `disabled` on removable tags without also disabling the action that applied them',
        'Avoid using Tag as a button replacement -- it lacks the semantic role and focus handling of a button',
      ],
    },

    previewHtml: `<div style="display:flex; gap:8px; flex-wrap:wrap; align-items:center;">
  <arc-tag>Default</arc-tag>
  <arc-tag variant="primary">Primary</arc-tag>
  <arc-tag variant="secondary">Secondary</arc-tag>
  <arc-tag variant="success">Success</arc-tag>
  <arc-tag variant="warning">Warning</arc-tag>
  <arc-tag variant="danger">Danger</arc-tag>
  <arc-tag color="255, 120, 50">Custom</arc-tag>
  <arc-tag variant="primary" removable>Removable</arc-tag>
</div>`,

    props: [
      { name: 'variant', type: "'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger'", default: "'default'", description: 'Colour variant. Default is neutral. Primary and secondary use accent tints. Success, warning, and danger provide semantic status colours.' },
      { name: 'color', type: 'string', description: 'Custom colour as an RGB triplet (e.g. `"77, 126, 247"`). When set, overrides the variant colours for border, text, background, and hover glow. Useful for data-driven category colours.' },
      { name: 'size', type: 'string', default: "'md'", description: "Controls the tag size. Options: 'sm', 'md', 'lg'." },
      { name: 'removable', type: 'boolean', default: 'false', description: 'When true, shows a close button that fires `arc-remove` when clicked.' },
      { name: 'disabled', type: 'boolean', default: 'false', description: 'Disables the tag, reducing opacity to 40% and blocking pointer events including the remove button.' },
    ],
    events: [
      { name: 'arc-remove', description: 'Fired when the remove button on a removable tag is clicked' },
    ],
    tabs: [
      {
        label: 'Web Component',
        lang: 'html',
        code: `<arc-tag>Default</arc-tag>
<arc-tag variant="primary">Primary</arc-tag>
<arc-tag variant="secondary">Secondary</arc-tag>
<arc-tag removable>Removable</arc-tag>

<!-- Custom colour from data -->
<arc-tag color="255, 120, 50">Custom</arc-tag>
<arc-tag color="120, 200, 80">Green</arc-tag>`,
      },
      {
        label: 'React',
        lang: 'tsx',
        code: `import { Tag } from '@arclux/arc-ui-react';

<Tag>Default</Tag>
<Tag variant="primary">Primary</Tag>
<Tag variant="secondary">Secondary</Tag>
<Tag removable>Removable</Tag>

{/* Custom colour from data */}
<Tag color="255, 120, 50">Custom</Tag>
<Tag color="120, 200, 80">Green</Tag>`,
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
    <Tag>Default</Tag>
    <Tag variant="primary">Primary</Tag>
    <Tag variant="secondary">Secondary</Tag>
    <Tag removable>Removable</Tag>
    <Tag color="255, 120, 50">Custom</Tag>
  \`,
})
export class MyComponent {}`,
      },
      {
        label: 'Solid',
        lang: 'tsx',
        code: `import { Tag } from '@arclux/arc-ui-solid';

<Tag>Default</Tag>
<Tag variant="primary">Primary</Tag>
<Tag variant="secondary">Secondary</Tag>
<Tag removable>Removable</Tag>
<Tag color="255, 120, 50">Custom</Tag>`,
      },
      {
        label: 'Preact',
        lang: 'tsx',
        code: `import { Tag } from '@arclux/arc-ui-preact';

<Tag>Default</Tag>
<Tag variant="primary">Primary</Tag>
<Tag variant="secondary">Secondary</Tag>
<Tag removable>Removable</Tag>
<Tag color="255, 120, 50">Custom</Tag>`,
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
  
  seeAlso: ["badge","chip"],
};
