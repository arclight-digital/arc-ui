import type { ComponentDef } from './_types';

export const markdown: ComponentDef = {
    name: 'Markdown',
    slug: 'markdown',
    tag: 'arc-markdown',
    tier: 'content',
    interactivity: 'static',
    description: 'Renders markdown content as styled HTML with zero dependencies. Supports headings, lists, code blocks, blockquotes, links, images, and inline formatting.',

    overview: `Markdown parses a markdown string into styled HTML using a lightweight built-in parser with zero external dependencies. Pass content via the \`content\` attribute or as slotted text, and the component renders it with full design-token styling — headings, code blocks, blockquotes, lists, links, and inline formatting all match the rest of the ARC UI theme.

The parser handles the most common markdown patterns: ATX headings (\`#\` through \`######\`), bold, italic, inline code, fenced code blocks with optional language hints, ordered and unordered lists, blockquotes, links, images, horizontal rules, and paragraph separation. It is intentionally lightweight — designed for documentation, changelogs, README rendering, and component descriptions rather than full CommonMark compliance.

All output is sanitized through a DOMParser pipeline that strips \`<script>\` elements and \`on*\` event handler attributes, making it safe to render user-provided markdown. The rendered HTML is injected into a styled shadow DOM container with proper spacing, typography, and color tokens applied to every element type.`,

    features: [
      'Zero-dependency markdown parser built into the component',
      'Supports headings, bold, italic, code, lists, blockquotes, links, images, and HR',
      'Fenced code blocks with optional language class for syntax highlighting hooks',
      'Content via attribute or slotted text with automatic re-render on changes',
      'XSS-safe: strips script tags and on* event handlers from rendered output',
      'Full design-token styling for all rendered elements',
      'Exposed "markdown" CSS part for external style customization',
    ],

    guidelines: {
      do: [
        'Use the content attribute for dynamic markdown from APIs or state',
        'Use slotted text for static markdown embedded in templates',
        'Pair with CodeBlock for syntax-highlighted code when full highlighting is needed',
        'Use for README rendering, changelogs, documentation, and component descriptions',
      ],
      dont: [
        'Rely on it for full CommonMark or GFM compliance — it covers common patterns only',
        'Render untrusted HTML directly — always go through the markdown parser',
        'Use for rich text editing — pair with a dedicated editor component instead',
        'Nest Markdown components inside each other',
      ],
    },

    previewHtml: `<arc-markdown content="# Hello World\n\nThis is a **markdown** component with *italic* text and \`inline code\`.\n\n## Features\n\n- Zero dependencies\n- Design token styling\n- XSS sanitization\n\n> Blockquotes work too, styled with the accent color.\n\n\`\`\`js\nconst greeting = 'Hello from ARC UI';\nconsole.log(greeting);\n\`\`\`\n\n---\n\nLinks like [ARC UI](https://arclight.build) are styled with the accent color."></arc-markdown>`,

    props: [
      { name: 'content', type: 'string', description: 'Markdown string to parse and render. Takes precedence over slotted text content.' },
    ],
    tabs: [
      {
        label: 'Web Component',
        lang: 'html',
        code: `<arc-markdown content="# Hello World

This is **bold** and *italic* text with \`inline code\`.

## Lists

- Item one
- Item two
- Item three

> A blockquote with accent styling.
"></arc-markdown>

<!-- Or use slotted text -->
<arc-markdown>
  # Slotted Content

  Markdown passed as text content.
</arc-markdown>`,
      },
      {
        label: 'React',
        lang: 'tsx',
        code: `import { Markdown } from '@arclux/arc-ui-react';

const readme = \`# My Component

A description with **bold** and \\\`code\\\`.

## Installation

\\\`\\\`\\\`bash
npm install my-component
\\\`\\\`\\\`
\`;

export function Docs() {
  return <Markdown content={readme} />;
}`,
      },
      {
        label: 'Vue',
        lang: 'html',
        code: `<script setup>
import { Markdown } from '@arclux/arc-ui-vue';

const content = '# Hello\\n\\nMarkdown content here.';
</script>

<template>
  <Markdown :content="content" />
</template>`,
      },
      {
        label: 'Svelte',
        lang: 'html',
        code: `<script>
  import { Markdown } from '@arclux/arc-ui-svelte';

  let content = '# Hello\\n\\nMarkdown content here.';
</script>

<Markdown {content} />`,
      },
      {
        label: 'Angular',
        lang: 'ts',
        code: `import { Component } from '@angular/core';
import { Markdown } from '@arclux/arc-ui-angular';

@Component({
  imports: [Markdown],
  template: \`<Markdown [content]="md"></Markdown>\`,
})
export class DocsComponent {
  md = '# Hello\\n\\nMarkdown content here.';
}`,
      },
      {
        label: 'Solid',
        lang: 'tsx',
        code: `import { Markdown } from '@arclux/arc-ui-solid';

export function Docs() {
  return <Markdown content="# Hello\\n\\nMarkdown content here." />;
}`,
      },
      {
        label: 'Preact',
        lang: 'tsx',
        code: `import { Markdown } from '@arclux/arc-ui-preact';

export function Docs() {
  return <Markdown content="# Hello\\n\\nMarkdown content here." />;
}`,
      },
    ],
  };
