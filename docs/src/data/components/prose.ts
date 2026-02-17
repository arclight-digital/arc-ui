import type { ComponentDef } from './_types';

export const prose: ComponentDef = {
    name: 'Prose',
    slug: 'prose',
    tag: 'arc-prose',
    tier: 'typography',
    interactivity: 'static',
    description: 'Long-form content container that applies typographic rhythm and styling to slotted HTML elements.',

    overview: `Prose is a wrapper component that brings consistent typographic styling to long-form content. Instead of manually styling each heading, paragraph, list, and code block, wrap your content in arc-prose and every child element receives proper spacing, font sizing, and color treatment automatically.

The component styles slotted HTML elements — headings (h1–h4), paragraphs, links, lists, blockquotes, code blocks, images, tables, horizontal rules, and inline elements like strong and code — using the ARC UI design token system. This ensures your long-form content harmonizes with the rest of your application without any additional CSS.

The \`size\` property controls the base font size of the container, with "sm", "md", and "lg" variants. Headings, code blocks, and other elements scale relative to the chosen size. This makes it easy to render the same content at different densities — compact sidebar documentation, standard article views, or large-format reading modes.`,

    features: [
      'Automatic typographic styling for all common HTML elements via ::slotted()',
      'Three size variants (sm, md, lg) for different content density needs',
      'Heading hierarchy with distinct sizes, weights, and spacing for h1–h4',
      'Pretty text wrapping on paragraphs for improved readability',
      'Styled links with accent-colored underlines and smooth hover transitions',
      'Blockquotes with subtle accent background and italic treatment',
      'Code and pre-formatted blocks with monospace font and surface backgrounds',
      'Responsive images with max-width containment and border radius',
      'Full-width tables with collapsed borders and appropriate spacing',
      'Horizontal rules rendered as subtle divider lines',
      'Prefers-reduced-motion support for link transitions',
    ],

    guidelines: {
      do: [
        'Use Prose for article content, documentation pages, blog posts, and rendered Markdown',
        'Choose the size variant based on reading context — sm for sidebars, md for main content, lg for focused reading',
        'Place semantic HTML directly inside arc-prose as slotted children',
        'Combine with the Markdown component to style rendered Markdown output',
        'Use for any long-form content that includes mixed heading levels, paragraphs, and lists',
      ],
      dont: [
        'Nest arc-prose inside another arc-prose — a single wrapper is sufficient',
        'Use Prose for UI chrome like navigation, forms, or dashboards — it is designed for reading content',
        'Wrap individual short text snippets in Prose — use the Text component instead',
        'Override slotted element styles with inline styles when token-level customization is available',
        'Use Prose as a substitute for a CSS reset — it specifically targets content typography',
      ],
    },

    previewHtml: `<arc-prose>
  <h2>Getting Started</h2>
  <p>ARC UI provides a comprehensive set of components for building modern interfaces. Each component follows the design token system for consistent theming.</p>
  <ul>
    <li>Install the package from npm</li>
    <li>Import the components you need</li>
    <li>Apply your theme tokens</li>
  </ul>
</arc-prose>`,

    props: [
      { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Controls the base font size of the prose container. Affects paragraph text; headings and code maintain their own scale.' },
    ],
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

<Prose size="md">
  <h1>Article Title</h1>
  <p>Introductory paragraph with <strong>bold text</strong> and <a href="#">links</a>.</p>
  <h2>Section Heading</h2>
  <p>More content with proper typographic rhythm applied automatically.</p>
  <ul>
    <li>First item</li>
    <li>Second item</li>
  </ul>
</Prose>`,
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
    <Prose size="md">
      <h1>Article Title</h1>
      <p>Introductory paragraph with <strong>bold text</strong> and <a href="#">links</a>.</p>
      <h2>Section Heading</h2>
      <p>Content with proper typographic rhythm.</p>
    </Prose>
  \`,
})
export class MyComponent {}`,
      },
      {
        label: 'Solid',
        lang: 'tsx',
        code: `import { Prose } from '@arclux/arc-ui-solid';

<Prose size="md">
  <h1>Article Title</h1>
  <p>Introductory paragraph with <strong>bold text</strong> and <a href="#">links</a>.</p>
  <h2>Section Heading</h2>
  <p>Content with proper typographic rhythm.</p>
</Prose>`,
      },
      {
        label: 'Preact',
        lang: 'tsx',
        code: `import { Prose } from '@arclux/arc-ui-preact';

<Prose size="md">
  <h1>Article Title</h1>
  <p>Introductory paragraph with <strong>bold text</strong> and <a href="#">links</a>.</p>
  <h2>Section Heading</h2>
  <p>Content with proper typographic rhythm.</p>
</Prose>`,
      },
    ],

  seeAlso: ["text", "markdown", "blockquote"],
};
