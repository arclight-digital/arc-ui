import type { ComponentDef } from './_types';

export const truncate: ComponentDef = {
  name: 'Truncate',
  slug: 'truncate',
  tag: 'arc-truncate',
  tier: 'typography',
  interactivity: 'interactive',
  description: 'Multi-line text clamping with expandable show-more toggle.',

  overview: `Truncate cuts long text off after \`lines\` lines and adds a "Show more" / "Show less" toggle. The clamp is CSS \`-webkit-line-clamp\`, so no JavaScript measures the text to cut it.

A \`ResizeObserver\` checks whether the text overflows the clamp, and the toggle appears only when it does, so short text gets no toggle. It checks again when the container resizes.

Clicking the toggle fires \`arc-toggle\` with \`{ expanded }\` in the detail, and the \`expanded\` attribute is reflected for CSS. The toggle is uppercase text in \`--interactive\`.`,

  guidelines: {
    do: [
      'Use it for long descriptions, comments or bios that would take over the layout',
      'Set `lines="2"` or `lines="3"` for card descriptions and list item summaries',
      'Use it in cards or list items to keep their heights even',
    ],
    dont: [
      'Don\'t use it for single-line text, `lines="1"` included. Use CSS `text-overflow: ellipsis`',
      'Don\'t put forms, buttons or other controls inside it. It\'s for text',
    ],
  },

  previewHtml: `<arc-truncate lines="3" style="max-width: 320px;">
  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
</arc-truncate>`,

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

export default function Example() {
  return (
    <Truncate lines={3} onArcToggle={(e) => console.log(e.detail.expanded)}>
      Lorem ipsum dolor sit amet, consectetur adipiscing elit.
      Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
      Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.
    </Truncate>
  );
}`,
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
    <arc-truncate [lines]="3" (arc-toggle)="onToggle($event)">
      Lorem ipsum dolor sit amet...
    </arc-truncate>
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

export default function Example() {
  return (
    <Truncate lines={3}>
      Lorem ipsum dolor sit amet...
    </Truncate>
  );
}`,
    },
    {
      label: 'Preact',
      lang: 'tsx',
      code: `import { Truncate } from '@arclux/arc-ui-preact';

export default function Example() {
  return (
    <Truncate lines={3}>
      Lorem ipsum dolor sit amet...
    </Truncate>
  );
}`,
    },
  ],

  seeAlso: ['text', 'tooltip'],
};
