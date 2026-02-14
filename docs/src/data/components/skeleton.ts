import type { ComponentDef } from './_types';

export const skeleton: ComponentDef = {
    name: 'Skeleton',
    slug: 'skeleton',
    tag: 'arc-skeleton',
    tier: 'content',
    interactivity: 'static',
    description: 'Loading placeholder with shimmer animation.',

    overview: `Skeleton is a loading placeholder that mimics the shape of content before it arrives, reducing perceived wait times and preventing layout shift. It uses a shimmer animation — a linear gradient that sweeps left to right at 1.8-second intervals — to signal that data is being loaded. This approach is less intrusive than a spinner and gives users a preview of the page structure.

Three variant shapes cover common content patterns: \`text\` renders a single-line bar (full width, 1em height) ideal for paragraph placeholders, \`circle\` produces a perfect circle for avatar placeholders (height auto-matches width when not explicitly set), and \`rect\` creates a rectangular block for images, cards, or media thumbnails. Custom \`width\` and \`height\` properties let you match the exact dimensions of the content being loaded.

The shimmer gradient uses \`--bg-elevated\` and \`--border-subtle\` tokens to ensure the animation blends naturally with both light and dark themes. The component sets \`role="status"\`, \`aria-label="Loading"\`, and \`aria-busy="true"\` for screen reader users who cannot see the visual animation.`,

    features: [
      'Three shape variants: text (line), circle (avatar), and rect (block)',
      'Smooth shimmer animation using a sweeping linear gradient at 1.8s intervals',
      'Custom width and height properties for precise content-matching dimensions',
      'Circle variant auto-matches height to width when height is not set',
      'Theme-aware shimmer using --bg-elevated and --border-subtle tokens',
      'Built-in accessibility: role="status", aria-label, and aria-busy attributes',
      'CSS part (skeleton) for external animation or style overrides',
    ],

    guidelines: {
      do: [
        'Match skeleton dimensions to the actual content they replace to prevent layout shift',
        'Combine multiple skeletons to represent a full content layout (avatar + text lines)',
        'Use the text variant in a stack with varying widths for realistic paragraph placeholders',
        'Use the circle variant sized to match your avatar component dimensions',
        'Remove skeletons immediately when content loads — do not add artificial delays',
      ],
      dont: [
        'Use skeletons for actions that take under 200ms — the flash is more distracting than helpful',
        'Stack more than 5-6 skeleton lines — it looks like a broken page rather than a loading state',
        'Use a rect skeleton without setting width and height — it will collapse to zero size',
        'Mix skeletons with spinners on the same screen — choose one loading pattern',
        'Animate skeleton opacity on top of the shimmer — the dual animation is visually noisy',
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

    props: [
      { name: 'variant', type: "'text' | 'circle' | 'rect'", default: "'text'", description: 'Shape of the skeleton: text for lines, circle for avatars, rect for blocks' },
      { name: 'width', type: 'string', default: "''", description: 'CSS width value (e.g. "200px", "100%")' },
      { name: 'height', type: 'string', default: "''", description: 'CSS height value; circle auto-matches width when omitted' },
      { name: 'count', type: 'number', default: '1', description: 'Renders multiple skeleton items stacked vertically with spacing. Useful for placeholder lists.' },
    ],
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

<Skeleton variant="text" width="200px"></Skeleton>
<Skeleton variant="circle" width="48px"></Skeleton>
<Skeleton variant="rect" width="300px" height="120px"></Skeleton>`,
      },
      {
        label: 'Vue',
        lang: 'html',
        code: `<script setup>
import { Skeleton } from '@arclux/arc-ui-vue';
</script>

<template>
  <Skeleton variant="text" width="200px"></Skeleton>
  <Skeleton variant="circle" width="48px"></Skeleton>
  <Skeleton variant="rect" width="300px" height="120px"></Skeleton>
</template>`,
      },
      {
        label: 'Svelte',
        lang: 'html',
        code: `<script>
  import { Skeleton } from '@arclux/arc-ui-svelte';
</script>

<Skeleton variant="text" width="200px"></Skeleton>
<Skeleton variant="circle" width="48px"></Skeleton>
<Skeleton variant="rect" width="300px" height="120px"></Skeleton>`,
      },
      {
        label: 'Angular',
        lang: 'ts',
        code: `import { Component } from '@angular/core';
import { Skeleton } from '@arclux/arc-ui-angular';

@Component({
  imports: [Skeleton],
  template: \`
    <Skeleton variant="text" width="200px"></Skeleton>
    <Skeleton variant="circle" width="48px"></Skeleton>
    <Skeleton variant="rect" width="300px" height="120px"></Skeleton>
  \`,
})
export class MyComponent {}`,
      },
      {
        label: 'Solid',
        lang: 'tsx',
        code: `import { Skeleton } from '@arclux/arc-ui-solid';

<Skeleton variant="text" width="200px"></Skeleton>
<Skeleton variant="circle" width="48px"></Skeleton>
<Skeleton variant="rect" width="300px" height="120px"></Skeleton>`,
      },
      {
        label: 'Preact',
        lang: 'tsx',
        code: `import { Skeleton } from '@arclux/arc-ui-preact';

<Skeleton variant="text" width="200px"></Skeleton>
<Skeleton variant="circle" width="48px"></Skeleton>
<Skeleton variant="rect" width="300px" height="120px"></Skeleton>`,
      },
      { label: 'HTML', lang: 'html', code: `<!-- Auto-generated by @arclux/prism — do not edit manually -->
<!-- arc-skeleton — requires skeleton.css + base.css (or arc-ui.css) -->
<div class="arc-skeleton">
  <div
   class="skeleton"
   role="status"
   aria-label="Loading"
   aria-busy="true"
   ></div>
</div>` },
      { label: 'HTML (Inline)', lang: 'html', code: `<!-- Auto-generated by @arclux/prism — do not edit manually -->
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
</div>` }
    ],
  
  seeAlso: ["spinner","progress"],
};
