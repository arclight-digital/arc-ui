import type { ComponentDef } from './_types';

export const highlight: ComponentDef = {
    name: 'Highlight',
    slug: 'highlight',
    tag: 'arc-highlight',
    tier: 'content',
    interactivity: 'static',
    description: 'Text highlighting with search query match markers.',

    overview: `Highlight renders text with matching portions wrapped in \`<mark>\` tags, styled with the accent color for instant visual identification. Pass the full text via the \`text\` attribute and the search query via \`query\` — the component splits the text at each match boundary and wraps matching segments in styled marks.

The matching is case-insensitive by default, which suits most search UIs. Set \`case-sensitive\` for exact-case matching in technical contexts like code search or regex patterns. The query string is escaped for regex safety, so special characters like \`.\`, \`(\`, and \`*\` are matched literally rather than interpreted as regex operators.

Highlight is designed to pair with Search, DataTable, CommandPalette, and any component that displays filtered results. The mark styling uses \`var(--accent-primary)\` with low opacity for the background and a stronger underline, ensuring matches are visible without overwhelming the surrounding text.`,

    features: [
      'Automatic text splitting and mark wrapping at match boundaries',
      'Case-insensitive matching by default, with case-sensitive option',
      'Regex-safe query escaping — special characters matched literally',
      'Themed mark styling with accent color background and underline',
      'Zero-overhead for non-matching text — renders plain text without marks',
      'CSS parts for mark and text segments for custom styling',
    ],

    guidelines: {
      do: [
        'Use Highlight in search result lists to show why each result matched',
        'Pair with Search or CommandPalette to highlight the active query in results',
        'Use in DataTable cells to highlight filtered column values',
        'Update the query prop reactively as the user types for live highlighting',
      ],
      dont: [
        'Use Highlight for static emphasis — use <strong> or Text variant="label" instead',
        'Pass HTML content as the text prop — it expects plain text only',
        'Use Highlight on very long text (>10KB) without debouncing the query updates',
        'Set both text and slot content — text prop takes precedence',
      ],
    },

    previewHtml: `<arc-highlight text="The quick brown fox jumps over the lazy dog" query="fox"></arc-highlight>`,

    props: [
      { name: 'text', type: 'string', default: "''", description: 'The full text to display and search within' },
      { name: 'query', type: 'string', default: "''", description: 'The search query to highlight within the text' },
      { name: 'case-sensitive', type: 'boolean', default: 'false', description: 'Whether matching should be case-sensitive' },
    ],
    tabs: [
      {
        label: 'Web Component',
        lang: 'html',
        code: `<arc-highlight
  text="The quick brown fox jumps over the lazy dog"
  query="fox"
></arc-highlight>

<!-- Case-sensitive matching -->
<arc-highlight
  text="Hello World, hello world"
  query="Hello"
  case-sensitive
></arc-highlight>`,
      },
      {
        label: 'React',
        lang: 'tsx',
        code: `import { Highlight } from '@arclux/arc-ui-react';

function SearchResults({ results, query }) {
  return results.map(r => (
    <Highlight key={r.id} text={r.title} query={query} />
  ));
}`,
      },
      {
        label: 'Vue',
        lang: 'html',
        code: `<script setup>
import { ref } from 'vue';
import { Highlight } from '@arclux/arc-ui-vue';

const query = ref('');
const text = 'The quick brown fox jumps over the lazy dog';
</script>

<template>
  <input v-model="query" placeholder="Search..." />
  <Highlight :text="text" :query="query" />
</template>`,
      },
      {
        label: 'Svelte',
        lang: 'html',
        code: `<script>
  import { Highlight } from '@arclux/arc-ui-svelte';
  let query = '';
</script>

<input bind:value={query} placeholder="Search..." />
<Highlight text="The quick brown fox" {query} />`,
      },
      {
        label: 'Angular',
        lang: 'ts',
        code: `import { Component } from '@angular/core';
import { Highlight } from '@arclux/arc-ui-angular';

@Component({
  imports: [Highlight],
  template: \`
    <input [(ngModel)]="query" placeholder="Search..." />
    <Highlight [text]="text" [query]="query" />
  \`,
})
export class MyComponent {
  text = 'The quick brown fox jumps over the lazy dog';
  query = '';
}`,
      },
      {
        label: 'Solid',
        lang: 'tsx',
        code: `import { Highlight } from '@arclux/arc-ui-solid';
import { createSignal } from 'solid-js';

const [query, setQuery] = createSignal('');

<input onInput={(e) => setQuery(e.target.value)} />
<Highlight text="The quick brown fox" query={query()} />`,
      },
      {
        label: 'Preact',
        lang: 'tsx',
        code: `import { Highlight } from '@arclux/arc-ui-preact';
import { useState } from 'preact/hooks';

const [query, setQuery] = useState('');

<input onInput={(e) => setQuery(e.target.value)} />
<Highlight text="The quick brown fox" query={query} />`,
      },
    
    {
      label: 'HTML',
      lang: 'html',
      code: `<!-- Auto-generated by @arclux/prism — do not edit manually -->
<!-- arc-highlight — requires highlight.css + tokens.css (or arc-ui.css) -->
<span class="arc-highlight">
  <span></span>
</span>`,
    },
    {
      label: 'HTML (Inline)',
      lang: 'html',
      code: `<!-- Auto-generated by @arclux/prism — do not edit manually -->
<!-- arc-highlight — self-contained, no external CSS needed -->
<span class="arc-highlight" style="display: inline">
  <span></span>
</span>`,
    },
  ],
  
  seeAlso: ["text","code-block","search"],
};
