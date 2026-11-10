import type { ComponentDef } from './_types';

export const text: ComponentDef = {
  name: 'Text',
  slug: 'text',
  tag: 'arc-text',
  tier: 'typography',
  interactivity: 'static',
  description: 'Sets text in one of nine styles from the ARC UI type scale.',

  overview: `Text sets type from ARC UI's type scale in one of nine variants.

\`display\` is a large headline with a gradient fill, \`heading\` is a section title, and \`body\` (the default) is paragraph text in the secondary text color. \`muted\` and \`ghost\` set only a dimmer color, for supporting content, and take their size from the surrounding text. \`accent\` fills short text with the accent gradient and a glow, \`label\` is an uppercase section title in Tomorrow, \`wordmark\` is uppercase branding text with an accent glow, and \`code\` is monospace in \`--accent-secondary\`, for inline code.

\`as\` sets the element: \`h1\` to \`h6\`, \`span\`, or \`p\` (the default). The variant sets the look, so a section can be an \`h2\` for the outline and still look like \`display\`.`,

  features: [
    '`heading` and `body` use `text-wrap: balance`',
    '`accent` and `code` display inline, and every other variant displays as a block',
  ],

  guidelines: {
    do: [
      'Set `as` to keep the heading outline right, whatever the variant',
      'Use `display` for hero headlines and `heading` for section titles',
      'Use `muted` or `ghost` for supporting text',
      'Use `label` to title a group of content',
      'Use `code` for code references inside body text',
    ],
    dont: [
      'Don\'t render `display` or `heading` with `as="span"`. They\'re headings and should use a heading element',
      'Don\'t skip heading levels (such as h1 to h3) to get a size. Set `as` and `variant` separately',
      'Don\'t use `accent` for long text. The gradient and glow are for short highlights',
      'Don\'t use `wordmark` for anything but a product or brand name',
    ],
  },

  previewHtml: `<div style="display: flex; flex-direction: column; gap: 16px;">
  <arc-text variant="display" as="h1">Display headline</arc-text>
  <arc-text variant="heading" as="h2">Section heading</arc-text>
  <arc-text variant="body">Your export is ready. The download link expires in seven days.</arc-text>
  <arc-text variant="muted">Muted supporting text</arc-text>
  <arc-text variant="accent" as="span">Accent highlight</arc-text>
  <arc-text variant="label" as="span">Section label</arc-text>
  <arc-text variant="code" as="span">const x = 42;</arc-text>
</div>`,

  tabs: [
    {
      label: 'Web Component',
      lang: 'html',
      code: `<arc-text variant="display">Display Headline</arc-text>
<arc-text variant="heading">Section Heading</arc-text>
<arc-text variant="body">Body paragraph text.</arc-text>
<arc-text variant="accent">Accent gradient</arc-text>
<arc-text variant="label">Section Label</arc-text>
<arc-text variant="code">const x = 42;</arc-text>`,
    },
    {
      label: 'React',
      lang: 'tsx',
      code: `import { Text } from '@arclux/arc-ui-react';

export default function Example() {
  return (
    <>
      <Text variant="display">Display Headline</Text>
      <Text variant="heading">Section Heading</Text>
      <Text variant="body">Body paragraph text.</Text>
    </>
  );
}`,
    },

    {
      label: 'Vue',
      lang: 'html',
      code: `<script setup>
import { Text } from '@arclux/arc-ui-vue';
</script>

<template>
  <Text variant="display">Display Headline</Text>
  <Text variant="heading">Section Heading</Text>
  <Text variant="body">Body paragraph text.</Text>
  <Text variant="accent">Accent gradient</Text>
  <Text variant="label">Section Label</Text>
  <Text variant="code">const x = 42;</Text>
</template>`,
    },
    {
      label: 'Svelte',
      lang: 'html',
      code: `<script>
  import { Text } from '@arclux/arc-ui-svelte';
</script>

<Text variant="display">Display Headline</Text>
<Text variant="heading">Section Heading</Text>
<Text variant="body">Body paragraph text.</Text>
<Text variant="accent">Accent gradient</Text>
<Text variant="label">Section Label</Text>
<Text variant="code">const x = 42;</Text>`,
    },
    {
      label: 'Angular',
      lang: 'ts',
      code: `import { Component } from '@angular/core';
import { Text } from '@arclux/arc-ui-angular';

@Component({
  imports: [Text],
  template: \`
    <arc-text variant="display">Display Headline</arc-text>
    <arc-text variant="heading">Section Heading</arc-text>
    <arc-text variant="body">Body paragraph text.</arc-text>
    <arc-text variant="accent">Accent gradient</arc-text>
    <arc-text variant="label">Section Label</arc-text>
    <arc-text variant="code">const x = 42;</arc-text>
  \`,
})
export class MyComponent {}`,
    },
    {
      label: 'Solid',
      lang: 'tsx',
      code: `import { Text } from '@arclux/arc-ui-solid';

export default function Example() {
  return (
    <>
      <Text variant="display">Display Headline</Text>
      <Text variant="heading">Section Heading</Text>
      <Text variant="body">Body paragraph text.</Text>
      <Text variant="accent">Accent gradient</Text>
      <Text variant="label">Section Label</Text>
      <Text variant="code">const x = 42;</Text>
    </>
  );
}`,
    },
    {
      label: 'Preact',
      lang: 'tsx',
      code: `import { Text } from '@arclux/arc-ui-preact';

export default function Example() {
  return (
    <>
      <Text variant="display">Display Headline</Text>
      <Text variant="heading">Section Heading</Text>
      <Text variant="body">Body paragraph text.</Text>
      <Text variant="accent">Accent gradient</Text>
      <Text variant="label">Section Label</Text>
      <Text variant="code">const x = 42;</Text>
    </>
  );
}`,
    },
    {
      label: 'HTML',
      lang: 'html',
      code: `<!-- Auto-generated by @arclux/prism — do not edit manually -->
<!-- arc-text — requires text.css + base.css (or arc-ui.css) -->
<div class="arc-text">
  <p class="text--Variant">Text</p>
</div>`,
    },
    {
      label: 'HTML (Inline)',
      lang: 'html',
      code: `<!-- Auto-generated by @arclux/prism — do not edit manually -->
<!-- arc-text — self-contained, no external CSS needed -->
<div class="arc-text" style="display: block">
  <p>Text</p>
</div>`,
    },
  ],

  seeAlso: ['markdown', 'highlight', 'truncate'],
};
