import type { ComponentDef } from './_types';

export const spinner: ComponentDef = {
    name: 'Spinner',
    slug: 'spinner',
    tag: 'arc-spinner',
    tier: 'content',
    interactivity: 'static',
    description: 'Animated loading spinner in three sizes.',

    overview: `Spinner is a simple rotating loading indicator for actions where content shape is unknown or a skeleton layout is impractical. It renders a circular border element with one transparent edge that spins continuously at 0.75-second intervals, creating the classic "loading ring" pattern. Use it for button loading states, inline status indicators, and overlay loading screens.

Three size presets control the spinner dimensions: \`sm\` (16px, 2px border) is compact enough for inline use next to text or inside buttons, \`md\` (24px, 2.5px border) is the default for general loading states, and \`lg\` (40px, 3px border) suits page-level or overlay loading indicators. The border width scales proportionally with size to maintain visual balance.

Three colour variants — \`primary\`, \`secondary\`, and \`white\` — let you match the spinner to its context. Primary uses the accent-primary colour, secondary aligns with accent-secondary areas, and white works on dark backgrounds or inside filled buttons. The component includes \`role="status"\` and \`aria-label="Loading"\` for screen reader users.`,

    features: [
      'Three size presets: sm (16px), md (24px), lg (40px) with proportional border widths',
      'Three colour variants: primary (--accent-primary), secondary (--accent-secondary), white (--text-primary)',
      'Continuous 0.75s linear rotation animation for smooth spinning',
      'Inline-flex display for easy placement beside text or inside buttons',
      'Built-in role="status" and aria-label="Loading" for accessibility',
      'CSS part (spinner) for custom animation or colour overrides',
      'Lightweight implementation — single div element with border animation',
    ],

    guidelines: {
      do: [
        'Use sm size inside buttons to indicate a pending action',
        'Use lg size for full-page or overlay loading states',
        'Choose the white variant when placing a spinner on a filled or dark background',
        'Pair with a text label ("Loading...") for screen readers and sighted users alike',
        'Remove the spinner immediately when loading completes — avoid artificial delays',
      ],
      dont: [
        'Use a spinner when the content shape is predictable — prefer skeleton placeholders',
        'Place multiple spinners on the same screen simultaneously',
        'Use the lg spinner inline with text — it overwhelms surrounding content',
        'Rely solely on the spinner for status — combine with aria-live regions when appropriate',
        'Use the primary variant on a primary-coloured background — it becomes invisible',
      ],
    },

    previewHtml: `<div style="display: flex; align-items: center; gap: 24px;">
  <arc-spinner size="sm" variant="primary"></arc-spinner>
  <arc-spinner size="md" variant="secondary"></arc-spinner>
  <arc-spinner size="lg" variant="primary"></arc-spinner>
</div>`,

    props: [
      { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Spinner dimensions: sm (16px), md (24px), lg (40px)' },
      { name: 'variant', type: "'primary' | 'secondary' | 'white'", default: "'primary'", description: 'Colour of the spinner ring' },
    ],
    tabs: [
      {
        label: 'Web Component',
        lang: 'html',
        code: `<arc-spinner size="sm"></arc-spinner>
<arc-spinner size="md"></arc-spinner>
<arc-spinner size="lg"></arc-spinner>`,
      },
      {
        label: 'React',
        lang: 'tsx',
        code: `import { Spinner } from '@arclux/arc-ui-react';

<Spinner size="sm"></Spinner>
<Spinner size="md"></Spinner>
<Spinner size="lg"></Spinner>`,
      },
      {
        label: 'Vue',
        lang: 'html',
        code: `<script setup>
import { Spinner } from '@arclux/arc-ui-vue';
</script>

<template>
  <Spinner size="sm"></Spinner>
  <Spinner size="md"></Spinner>
  <Spinner size="lg"></Spinner>
</template>`,
      },
      {
        label: 'Svelte',
        lang: 'html',
        code: `<script>
  import { Spinner } from '@arclux/arc-ui-svelte';
</script>

<Spinner size="sm"></Spinner>
<Spinner size="md"></Spinner>
<Spinner size="lg"></Spinner>`,
      },
      {
        label: 'Angular',
        lang: 'ts',
        code: `import { Component } from '@angular/core';
import { Spinner } from '@arclux/arc-ui-angular';

@Component({
  imports: [Spinner],
  template: \`
    <Spinner size="sm"></Spinner>
    <Spinner size="md"></Spinner>
    <Spinner size="lg"></Spinner>
  \`,
})
export class MyComponent {}`,
      },
      {
        label: 'Solid',
        lang: 'tsx',
        code: `import { Spinner } from '@arclux/arc-ui-solid';

<Spinner size="sm"></Spinner>
<Spinner size="md"></Spinner>
<Spinner size="lg"></Spinner>`,
      },
      {
        label: 'Preact',
        lang: 'tsx',
        code: `import { Spinner } from '@arclux/arc-ui-preact';

<Spinner size="sm"></Spinner>
<Spinner size="md"></Spinner>
<Spinner size="lg"></Spinner>`,
      },
      { label: 'HTML', lang: 'html', code: `<!-- Auto-generated by @arclux/prism — do not edit manually -->
<!-- arc-spinner — requires spinner.css + tokens.css (or arc-ui.css) -->
<span class="arc-spinner">
  <div
   class="spinner"
   role="status"
   aria-label="Loading"
   ></div>
</span>` },
      { label: 'HTML (Inline)', lang: 'html', code: `<!-- Auto-generated by @arclux/prism — do not edit manually -->
<!-- arc-spinner — self-contained, no external CSS needed -->
<span class="arc-spinner" style="display: inline-flex">
  <div
   style="border-radius: 9999px; border-style: solid; border-color: rgb(77, 126, 247); border-top-color: transparent; animation: spin 0.75s linear infinite; box-sizing: border-box"
   role="status"
   aria-label="Loading"
   ></div>
</span>` }
    ],
  };
