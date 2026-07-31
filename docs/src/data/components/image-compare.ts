import type { ComponentDef } from './_types';

export const imageCompare: ComponentDef = {
  name: 'Image Compare',
  slug: 'image-compare',
  tag: 'arc-image-compare',
  tier: 'content',
  interactivity: 'interactive',
  description:
    'Before/after comparison with two layered images and a draggable divider revealing one over the other.',
  searchKeywords: ['before after', 'comparison slider', 'juxtapose', 'reveal', 'diff'],

  overview: `Image Compare layers two images and reveals the \`before\` slot over the \`after\` slot up to a draggable divider. The reveal is a pure CSS clip driven by the \`position\` property (0–100, defaulting to a centered 50), so the component server-renders at its initial position and never measures the images on load. Both slots accept a plain \`<img>\` or an \`arc-image\`; the two should share an aspect ratio, since the top layer is cropped to cover the frame.

The divider carries a circular grab handle that is also the keyboard control: a focusable \`role="slider"\` that moves by 1 with the arrow keys, by 10 with Shift held, and jumps to either extreme with Home and End. Dragging emits \`arc-input\` continuously and \`arc-change\` once on release, so live readouts and expensive persistence can subscribe separately.

\`orientation\` is named for the axis the divider moves along: \`horizontal\` (the default) slides a vertical divider line left and right, while \`vertical\` slides a horizontal line up and down. The horizontal axis is logical — position 0 is the inline-start edge, so the whole control mirrors in right-to-left documents along with the reading order. Optional \`before-label\` and \`after-label\` props float muted caption chips over the corners of each region.`,

  features: [
    'Two named slots — `before` and `after` — accepting `<img>` or `arc-image`',
    'CSS clip-path reveal driven by `position` (0–100), so it server-renders at the initial split',
    'Pointer dragging anywhere on the frame, with `arc-input` while moving and `arc-change` on release',
    'Focusable divider handle with `role="slider"`: arrows step by 1, Shift+arrows by 10, Home/End to the extremes',
    'Orientation named for the motion axis: `horizontal` (default) or `vertical`',
    'Optional floating caption chips via `before-label` and `after-label`',
    'Logical horizontal axis — the control mirrors automatically in RTL documents',
    'Exposed CSS parts: container, before, after, divider, handle, label-before, label-after',
  ],

  guidelines: {
    do: [
      'Slot two images of the same subject and aspect ratio — the point is the difference between them',
      'Set `before-label` and `after-label` when the direction of the edit is not obvious from the images alone',
      'Give the handle a descriptive `label` so screen reader users know what the slider compares',
      'Use `arc-input` for cheap live readouts and `arc-change` for anything expensive or persisted',
    ],
    dont: [
      'Do not use it as a gallery for unrelated images — that is a job for arc-carousel',
      'Do not compare text or code revisions with it — a rendered diff communicates changes precisely; sliding pixels does not',
      'Do not slot images with different aspect ratios — the top layer is cropped to cover and the comparison stops being honest',
      'Do not preset `position` near 0 or 100 — a nearly hidden layer defeats the invitation to drag',
    ],
  },

  previewHtml: `<arc-image-compare
  label="Color grade comparison"
  before-label="Original"
  after-label="Graded"
  style="width: 100%; max-width: 560px;"
>
  <img slot="before" src="https://picsum.photos/id/1015/800/500?grayscale" alt="River valley before color grading" />
  <img slot="after" src="https://picsum.photos/id/1015/800/500" alt="River valley after color grading" />
</arc-image-compare>`,

  tabs: [
    {
      label: 'Web Component',
      lang: 'html',
      code: `<arc-image-compare
  label="Color grade comparison"
  before-label="Original"
  after-label="Graded"
  position="50"
>
  <img slot="before" src="/photos/valley-raw.jpg" alt="River valley, unedited" />
  <img slot="after" src="/photos/valley-graded.jpg" alt="River valley, color graded" />
</arc-image-compare>

<!-- Vertical divider motion -->
<arc-image-compare orientation="vertical" label="Sky replacement">
  <img slot="before" src="/photos/sky-raw.jpg" alt="Original sky" />
  <img slot="after" src="/photos/sky-replaced.jpg" alt="Replaced sky" />
</arc-image-compare>`,
    },
    {
      label: 'React',
      lang: 'tsx',
      code: `import { ImageCompare } from '@arclux/arc-ui-react';

export default function Example() {
  return (
    <ImageCompare
      label="Color grade comparison"
      beforeLabel="Original"
      afterLabel="Graded"
      onArcChange={(e) => console.log('committed at', e.detail.value)}
    >
      <img slot="before" src="/photos/valley-raw.jpg" alt="River valley, unedited" />
      <img slot="after" src="/photos/valley-graded.jpg" alt="River valley, color graded" />
    </ImageCompare>
  );
}`,
    },
    {
      label: 'Vue',
      lang: 'html',
      code: `<script setup>
import { ImageCompare } from '@arclux/arc-ui-vue';
</script>

<template>
  <ImageCompare label="Color grade comparison" before-label="Original" after-label="Graded">
    <img slot="before" src="/photos/valley-raw.jpg" alt="River valley, unedited" />
    <img slot="after" src="/photos/valley-graded.jpg" alt="River valley, color graded" />
  </ImageCompare>
</template>`,
    },
    {
      label: 'Svelte',
      lang: 'html',
      code: `<script>
  import { ImageCompare } from '@arclux/arc-ui-svelte';
</script>

<ImageCompare label="Color grade comparison" before-label="Original" after-label="Graded">
  <img slot="before" src="/photos/valley-raw.jpg" alt="River valley, unedited" />
  <img slot="after" src="/photos/valley-graded.jpg" alt="River valley, color graded" />
</ImageCompare>`,
    },
    {
      label: 'Angular',
      lang: 'ts',
      code: `import { Component } from '@angular/core';
import { ImageCompare } from '@arclux/arc-ui-angular';

@Component({
  imports: [ImageCompare],
  template: \`
    <arc-image-compare label="Color grade comparison" before-label="Original" after-label="Graded">
      <img slot="before" src="/photos/valley-raw.jpg" alt="River valley, unedited" />
      <img slot="after" src="/photos/valley-graded.jpg" alt="River valley, color graded" />
    </arc-image-compare>
  \`,
})
export class ComparisonComponent {}`,
    },
    {
      label: 'Solid',
      lang: 'tsx',
      code: `import { ImageCompare } from '@arclux/arc-ui-solid';

export default function Example() {
  return (
    <ImageCompare label="Color grade comparison" beforeLabel="Original" afterLabel="Graded">
      <img slot="before" src="/photos/valley-raw.jpg" alt="River valley, unedited" />
      <img slot="after" src="/photos/valley-graded.jpg" alt="River valley, color graded" />
    </ImageCompare>
  );
}`,
    },
    {
      label: 'Preact',
      lang: 'tsx',
      code: `import { ImageCompare } from '@arclux/arc-ui-preact';

export default function Example() {
  return (
    <ImageCompare label="Color grade comparison" beforeLabel="Original" afterLabel="Graded">
      <img slot="before" src="/photos/valley-raw.jpg" alt="River valley, unedited" />
      <img slot="after" src="/photos/valley-graded.jpg" alt="River valley, color graded" />
    </ImageCompare>
  );
}`,
    },
  ],

  seeAlso: ['image', 'carousel', 'aspect-ratio', 'image-cropper'],
};
