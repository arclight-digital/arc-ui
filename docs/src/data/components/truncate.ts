import type { ComponentDef } from './_types';

export const truncate: ComponentDef = {
    name: 'Truncate',
    slug: 'truncate',
    tag: 'arc-truncate',
    tier: 'content',
    interactivity: 'interactive',
    description: 'Multi-line text clamping with expandable show-more toggle.',

    overview: `Truncate clamps long text to a specified number of lines and provides a "Show more" / "Show less" toggle to expand and collapse the content. It uses CSS \`-webkit-line-clamp\` for native multi-line truncation, which is widely supported across all modern browsers and provides smooth, reliable clamping without JavaScript text measurement.

A \`ResizeObserver\` monitors the content container and automatically detects whether the text actually overflows the clamp limit. The toggle button only appears when overflow is detected — short text that fits within the line limit will not show a toggle at all. When expanded, the component temporarily re-applies the clamp to measure whether the toggle should remain visible.

The component fires an \`arc-toggle\` event with \`{ expanded }\` detail when toggled, and the \`expanded\` attribute is reflected for CSS targeting. The toggle link is styled with \`var(--accent-primary)\` and uppercase lettering consistent with the design system's action links.`,

    features: [
      'CSS-native multi-line text clamping via -webkit-line-clamp',
      'Automatic overflow detection — toggle only appears when text exceeds line limit',
      'ResizeObserver for responsive re-measurement on container resize',
      'Configurable line count via lines attribute',
      'Reflected expanded attribute for CSS-based conditional styling',
      'Show more / Show less toggle with accent-primary styling',
    ],

    guidelines: {
      do: [
        'Use for long descriptions, comments, or bio text that would dominate the layout',
        'Set lines="2" or lines="3" for card descriptions and list item summaries',
        'Use in combination with cards or list items to keep uniform heights',
        'Test with varying content lengths to ensure the toggle appears correctly',
      ],
      dont: [
        'Use Truncate for single-line text — use CSS text-overflow: ellipsis instead',
        'Set lines to 1 — the clamping behavior is designed for multi-line content',
        'Truncate interactive content like forms or buttons — only use for text',
        'Nest Truncate components — expanding one inside another creates confusing behavior',
      ],
    },

    previewHtml: `<arc-truncate lines="3" style="max-width: 320px;">
  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
</arc-truncate>`,

    props: [
      { name: 'lines', type: 'number', default: '3', description: 'Maximum number of visible lines before clamping' },
      { name: 'expanded', type: 'boolean', default: 'false', description: 'Whether the text is fully expanded' },
    ],
    events: [
      { name: 'arc-toggle', description: 'Fired when expand/collapse toggle is clicked, with { expanded } detail' },
    ],
    tabs: [
      {
        label: 'Web Component',
        lang: 'html',
        code: `<arc-truncate lines="3">
  Lorem ipsum dolor sit amet, consectetur adipiscing elit.
  Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
  Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.
  Duis aute irure dolor in reprehenderit in voluptate velit esse.
</arc-truncate>`,
      },
      {
        label: 'React',
        lang: 'tsx',
        code: `import { Truncate } from '@arclux/arc-ui-react';

<Truncate lines={3} onArcToggle={(e) => console.log(e.detail.expanded)}>
  Lorem ipsum dolor sit amet, consectetur adipiscing elit.
  Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
  Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.
</Truncate>`,
      },
      {
        label: 'Vue',
        lang: 'html',
        code: `<script setup>
import { Truncate } from '@arclux/arc-ui-vue';
</script>

<template>
  <Truncate :lines="3" @arc-toggle="(e) => console.log(e.detail.expanded)">
    Lorem ipsum dolor sit amet...
  </Truncate>
</template>`,
      },
      {
        label: 'Svelte',
        lang: 'html',
        code: `<script>
  import { Truncate } from '@arclux/arc-ui-svelte';
</script>

<Truncate lines={3} on:arc-toggle={(e) => console.log(e.detail.expanded)}>
  Lorem ipsum dolor sit amet...
</Truncate>`,
      },
      {
        label: 'Angular',
        lang: 'ts',
        code: `import { Component } from '@angular/core';
import { Truncate } from '@arclux/arc-ui-angular';

@Component({
  imports: [Truncate],
  template: \`
    <Truncate [lines]="3" (arc-toggle)="onToggle($event)">
      Lorem ipsum dolor sit amet...
    </Truncate>
  \`,
})
export class MyComponent {
  onToggle(e: CustomEvent) { console.log(e.detail.expanded); }
}`,
      },
      {
        label: 'Solid',
        lang: 'tsx',
        code: `import { Truncate } from '@arclux/arc-ui-solid';

<Truncate lines={3}>
  Lorem ipsum dolor sit amet...
</Truncate>`,
      },
      {
        label: 'Preact',
        lang: 'tsx',
        code: `import { Truncate } from '@arclux/arc-ui-preact';

<Truncate lines={3}>
  Lorem ipsum dolor sit amet...
</Truncate>`,
      },
    ],
  
  seeAlso: ["text","tooltip"],
};
