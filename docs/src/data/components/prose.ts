import type { ComponentDef } from './_types';

export const prose: ComponentDef = {
  name: 'Prose',
  slug: 'prose',
  tag: 'arc-prose',
  tier: 'typography',
  interactivity: 'static',
  description:
    'A wrapper that styles the headings, paragraphs, lists, code, tables and images inside it for long-form reading.',

  overview: `Prose styles long-form HTML so you don't have to style each element yourself. Wrap an article, a docs page or rendered Markdown in \`<arc-prose>\` and its contents get spacing, font sizes and colors from the ARC UI tokens. It's for reading content, not for UI like navigation, forms or dashboards.

It styles h1 to h4 (not h5 or h6), paragraphs, lists, blockquotes, \`<pre>\` blocks, images, tables and horizontal rules. These get their styles through \`::slotted()\`, which only reaches direct children of \`<arc-prose>\`, so a heading or paragraph inside a wrapper \`<div>\` stays unstyled. Links, list items, inline code, \`<strong>\`, \`<em>\` and table cells are styled at any depth by a stylesheet the component adds to the page.

\`size\` (\`sm\`, \`md\` or \`lg\`) sets the base text size. Headings and code blocks keep their own sizes at every setting.`,

  features: [
    'Paragraphs use `text-wrap: pretty`',
    'Links have a faint accent-colored underline that turns solid on hover',
    'Blockquotes are italic on a faint accent background',
    '`<pre>` blocks use the monospace font on a surface background and scroll sideways when too wide',
    'Images are capped at the container\'s width with rounded corners, and tables run full width with collapsed borders',
  ],

  guidelines: {
    do: [
      'Use `sm` in sidebars, `md` for main content and `lg` for focused reading',
      'Put headings, paragraphs and lists directly inside `<arc-prose>`, not inside a wrapper element',
      'Pair it with the Markdown component to style rendered Markdown',
    ],
    dont: [
      'Don\'t wrap a single short line in Prose. Use Text',
    ],
  },

  previewHtml: `<arc-prose>
  <h2>Getting started</h2>
  <p>To add the library to an existing project:</p>
  <ul>
    <li>Install the package from npm</li>
    <li>Import the components you need</li>
    <li>Apply your theme tokens</li>
  </ul>
</arc-prose>`,

  tabs: [
    {
      label: 'Web Component',
      lang: 'html',
      code: `<arc-prose size="md">
  <h1>Article Title</h1>
  <p>Introductory paragraph with <strong>bold text</strong> and <a href="#">links</a>.</p>
  <h2>Section Heading</h2>
  <p>More content with proper typographic rhythm applied automatically.</p>
  <ul>
    <li>First item</li>
    <li>Second item</li>
    <li>Third item</li>
  </ul>
  <blockquote>A styled blockquote with italic treatment.</blockquote>
  <pre>const greeting = 'Hello, world!';</pre>
</arc-prose>`,
    },
    {
      label: 'React',
      lang: 'tsx',
      code: `import { Prose } from '@arclux/arc-ui-react';

export default function Example() {
  return (
    <Prose size="md">
      <h1>Article Title</h1>
      <p>Introductory paragraph with <strong>bold text</strong> and <a href="#">links</a>.</p>
      <h2>Section Heading</h2>
      <p>More content with proper typographic rhythm applied automatically.</p>
      <ul>
        <li>First item</li>
        <li>Second item</li>
      </ul>
    </Prose>
  );
}`,
    },
    {
      label: 'Vue',
      lang: 'html',
      code: `<script setup>
import { Prose } from '@arclux/arc-ui-vue';
</script>

<template>
  <Prose size="md">
    <h1>Article Title</h1>
    <p>Introductory paragraph with <strong>bold text</strong> and <a href="#">links</a>.</p>
    <h2>Section Heading</h2>
    <p>Content with proper typographic rhythm.</p>
  </Prose>
</template>`,
    },
    {
      label: 'Svelte',
      lang: 'html',
      code: `<script>
  import { Prose } from '@arclux/arc-ui-svelte';
</script>

<Prose size="md">
  <h1>Article Title</h1>
  <p>Introductory paragraph with <strong>bold text</strong> and <a href="#">links</a>.</p>
  <h2>Section Heading</h2>
  <p>Content with proper typographic rhythm.</p>
</Prose>`,
    },
    {
      label: 'Angular',
      lang: 'ts',
      code: `import { Component } from '@angular/core';
import { Prose } from '@arclux/arc-ui-angular';

@Component({
  imports: [Prose],
  template: \`
    <arc-prose size="md">
      <h1>Article Title</h1>
      <p>Introductory paragraph with <strong>bold text</strong> and <a href="#">links</a>.</p>
      <h2>Section Heading</h2>
      <p>Content with proper typographic rhythm.</p>
    </arc-prose>
  \`,
})
export class MyComponent {}`,
    },
    {
      label: 'Solid',
      lang: 'tsx',
      code: `import { Prose } from '@arclux/arc-ui-solid';

export default function Example() {
  return (
    <Prose size="md">
      <h1>Article Title</h1>
      <p>Introductory paragraph with <strong>bold text</strong> and <a href="#">links</a>.</p>
      <h2>Section Heading</h2>
      <p>Content with proper typographic rhythm.</p>
    </Prose>
  );
}`,
    },
    {
      label: 'Preact',
      lang: 'tsx',
      code: `import { Prose } from '@arclux/arc-ui-preact';

export default function Example() {
  return (
    <Prose size="md">
      <h1>Article Title</h1>
      <p>Introductory paragraph with <strong>bold text</strong> and <a href="#">links</a>.</p>
      <h2>Section Heading</h2>
      <p>Content with proper typographic rhythm.</p>
    </Prose>
  );
}`,
    },
  ],

  seeAlso: ['text', 'markdown', 'blockquote'],
};
