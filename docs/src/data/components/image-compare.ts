import type { ComponentDef } from './_types';

export const imageCompare: ComponentDef = {
  name: 'Image Compare',
  slug: 'image-compare',
  tag: 'arc-image-compare',
  tier: 'content',
  interactivity: 'interactive',
  description:
    'Before-and-after comparison: two stacked images and a divider you drag to reveal one over the other.',
  searchKeywords: ['before after', 'comparison slider', 'juxtapose', 'reveal', 'diff'],

  overview: `Image Compare stacks two images and shows the \`before\` slot over the \`after\` slot up to a divider you drag. The reveal is a CSS clip driven by \`position\` (0 to 100, default 50), so the component server-renders at its starting position and never measures the images. Both slots take a plain \`<img>\` or an \`arc-image\`. The two images need the same aspect ratio, because the top layer is cropped to cover the frame.

The divider's round handle is also the keyboard control: a focusable \`role="slider"\` that moves by 1 with the arrow keys, by 10 with Shift, and to either end with Home and End. Dragging fires \`arc-input\` on every move and \`arc-change\` once on release.

\`orientation\` names the axis the divider moves along: \`horizontal\` (the default) slides a vertical line left and right, and \`vertical\` slides a horizontal line up and down. Position 0 is the inline-start edge, so the control mirrors in right-to-left documents.`,

  features: [
    'A drag can start anywhere on the frame',
    '`before-label` and `after-label` add caption chips in the corners of each image',
  ],

  guidelines: {
    do: [
      'Use two images of the same subject at the same aspect ratio',
      'Set `before-label` and `after-label` when the images don\'t make the direction of the edit obvious',
      'Give the handle a `label` that says what\'s being compared, for screen readers',
      'Use `arc-input` for cheap live readouts and `arc-change` for anything expensive or saved',
    ],
    dont: [
      'Don\'t use it for unrelated images. Use Carousel',
      'Don\'t compare text or code revisions with it. A rendered diff shows those changes exactly',
      'Don\'t start `position` near 0 or 100. With one image almost hidden, people won\'t see there\'s anything to drag',
    ],
  },

  previewHtml: `<arc-image-compare
  label="Color grade comparison"
  before-label="Original"
  after-label="Graded"
  style="width: 100%; max-width: 560px;"
>
  <img slot="before" src="/demo/valley-800x500-grayscale.jpg" alt="River valley before color grading" />
  <img slot="after" src="/demo/valley-800x500.jpg" alt="River valley after color grading" />
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
