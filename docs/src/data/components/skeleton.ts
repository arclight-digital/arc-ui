import type { ComponentDef } from './_types';

export const skeleton: ComponentDef = {
  name: 'Skeleton',
  slug: 'skeleton',
  tag: 'arc-skeleton',
  tier: 'content',
  interactivity: 'static',
  searchKeywords: ['placeholder', 'loading'],
  description: 'A placeholder shape with a shimmer, shown where content will appear once it loads.',

  overview: `Skeleton stands in for content that hasn't loaded yet, in roughly the size and shape of that content, so the page doesn't jump when it arrives. A gradient sweeps across it every 1.8 seconds. Unlike a spinner, it shows the layout that's coming.

\`variant\` sets the shape. \`text\` is a full-width bar 1em tall, for lines of a paragraph. \`circle\` is round, for avatars, and takes its height from \`width\` when you don't set one. \`rect\` is a block with rounded corners, for images, cards and thumbnails. \`width\` and \`height\` take any CSS length, so you can match the content you're waiting for.

The shimmer runs from \`--surface-overlay\` through a 4% tint of the accent color, so it follows the theme. The component sets \`role="status"\`, \`aria-label="Loading"\` and \`aria-busy="true"\` for screen reader users.`,

  features: ['CSS part `skeleton` on the shape, for overriding its style or animation'],

  guidelines: {
    do: [
      'Size each skeleton like the content it replaces',
      'Combine shapes to sketch a layout, such as a circle beside two text lines for a comment',
      'Vary the widths of stacked text lines so they read as a paragraph',
      'Remove skeletons as soon as the content loads, with no added delay',
    ],
    dont: [
      "Don't show a skeleton for loads that finish almost at once. It flashes and disappears",
      "Don't stack more than five or six text lines. A tall block of bars looks like a broken page",
      "Don't leave a rect skeleton without a `height`. It has no height of its own and collapses",
      "Don't mix skeletons and spinners on one screen",
      "Don't animate a skeleton's opacity on top of its shimmer",
    ],
  },

  previewHtml: `<div style="display: flex; flex-direction: column; gap: 12px; width: 100%;">
  <div style="display: flex; gap: 12px; align-items: center;">
    <arc-skeleton variant="circle" width="40px"></arc-skeleton>
    <div style="flex: 1; display: flex; flex-direction: column; gap: 8px;">
      <arc-skeleton variant="text" width="60%"></arc-skeleton>
      <arc-skeleton variant="text" width="40%"></arc-skeleton>
    </div>
  </div>
  <arc-skeleton variant="rect" width="100%" height="120px"></arc-skeleton>
  <arc-skeleton variant="text" width="90%"></arc-skeleton>
  <arc-skeleton variant="text" width="75%"></arc-skeleton>
</div>`,

  tabs: [
    {
      label: 'Web Component',
      lang: 'html',
      code: `<arc-skeleton variant="text" width="200px"></arc-skeleton>
<arc-skeleton variant="circle" width="48px"></arc-skeleton>
<arc-skeleton variant="rect" width="300px" height="120px"></arc-skeleton>`,
    },
    {
      label: 'React',
      lang: 'tsx',
      code: `import { Skeleton } from '@arclux/arc-ui-react';

export default function Example() {
  return (
    <>
      <Skeleton variant="text" width="200px" />
      <Skeleton variant="circle" width="48px" />
      <Skeleton variant="rect" width="300px" height="120px" />
    </>
  );
}`,
    },
    {
      label: 'Vue',
      lang: 'html',
      code: `<script setup>
import { Skeleton } from '@arclux/arc-ui-vue';
</script>

<template>
  <Skeleton variant="text" width="200px" />
  <Skeleton variant="circle" width="48px" />
  <Skeleton variant="rect" width="300px" height="120px" />
</template>`,
    },
    {
      label: 'Svelte',
      lang: 'html',
      code: `<script>
  import { Skeleton } from '@arclux/arc-ui-svelte';
</script>

<Skeleton variant="text" width="200px" />
<Skeleton variant="circle" width="48px" />
<Skeleton variant="rect" width="300px" height="120px" />`,
    },
    {
      label: 'Angular',
      lang: 'ts',
      code: `import { Component } from '@angular/core';
import { Skeleton } from '@arclux/arc-ui-angular';

@Component({
  imports: [Skeleton],
  template: \`
    <arc-skeleton variant="text" width="200px"></arc-skeleton>
    <arc-skeleton variant="circle" width="48px"></arc-skeleton>
    <arc-skeleton variant="rect" width="300px" height="120px"></arc-skeleton>
  \`,
})
export class MyComponent {}`,
    },
    {
      label: 'Solid',
      lang: 'tsx',
      code: `import { Skeleton } from '@arclux/arc-ui-solid';

export default function Example() {
  return (
    <>
      <Skeleton variant="text" width="200px" />
      <Skeleton variant="circle" width="48px" />
      <Skeleton variant="rect" width="300px" height="120px" />
    </>
  );
}`,
    },
    {
      label: 'Preact',
      lang: 'tsx',
      code: `import { Skeleton } from '@arclux/arc-ui-preact';

export default function Example() {
  return (
    <>
      <Skeleton variant="text" width="200px" />
      <Skeleton variant="circle" width="48px" />
      <Skeleton variant="rect" width="300px" height="120px" />
    </>
  );
}`,
    },
    {
      label: 'HTML',
      lang: 'html',
      code: `<!-- Auto-generated by @arclux/prism — do not edit manually -->
<!-- arc-skeleton — requires skeleton.css + base.css (or arc-ui.css) -->
<div class="arc-skeleton">
  <div
   class="skeleton"
   role="status"
   aria-label="Loading"
   aria-busy="true"
   ></div>
</div>`,
    },
    {
      label: 'HTML (Inline)',
      lang: 'html',
      code: `<!-- Auto-generated by @arclux/prism — do not edit manually -->
<!-- arc-skeleton — self-contained, no external CSS needed -->
<div class="arc-skeleton" style="display: block">
  <div
   style="background: linear-gradient(
            90deg,
            rgb(17, 17, 22) 25%,
            rgb(24, 24, 30) 37%,
            rgb(17, 17, 22) 63%
          ); background-size: 200% 100%; animation: shimmer 1.8s ease-in-out infinite"
   role="status"
   aria-label="Loading"
   aria-busy="true"
   ></div>
</div>`,
    },
  ],

  seeAlso: ['spinner', 'progress'],
};
