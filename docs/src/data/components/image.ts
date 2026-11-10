import type { ComponentDef } from './_types';

export const image: ComponentDef = {
  name: 'Image',
  slug: 'image',
  tag: 'arc-image',
  tier: 'content',
  interactivity: 'interactive',
  description:
    'Image with a shimmer skeleton while it loads, a fade-in, an error fallback and aspect ratio presets.',

  overview: `Image wraps a native \`<img>\` with loading and error states. While the image loads, a shimmer skeleton fills the container, and the image fades in once it arrives. If it fails, the component shows the \`fallback\` image if you set one, or a placeholder icon if you didn't.

\`aspect\` takes one of six presets (\`1/1\`, \`4/3\`, \`16/9\`, \`21/9\`, \`3/4\`, \`9/16\`) and sizes the container before the image loads, so the page doesn't jump. \`fit\` maps to CSS \`object-fit\` and defaults to \`cover\`. \`loading\` defaults to \`lazy\`.`,

  features: ['`fit` values: `cover` (default), `contain`, `fill`, `none` and `scale-down`'],

  guidelines: {
    do: [
      'Write `alt` text that describes the image',
      "Set `aspect` so the layout doesn't shift while the image loads",
      'Use `fit="contain"` for logos and icons that shouldn\'t be cropped',
      'Set `fallback` on images that must always show something',
    ],
    dont: [
      "Don't use it for decorative backgrounds. Use CSS `background-image`",
      'Don\'t set `loading="eager"` on images below the fold. Lazy loading waits until they\'re near the viewport',
      "Don't serve very large source images without resizing them on the server",
    ],
  },

  previewHtml: `<div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; max-width: 600px;">
  <arc-image src="/demo/landscape-300x200.jpg" alt="Sample landscape" aspect="16/9"></arc-image>
  <arc-image src="/demo/square-300x300.jpg" alt="Sample square" aspect="1/1"></arc-image>
  <arc-image src="https://invalid-url.example/broken.jpg" alt="Broken image" aspect="16/9"></arc-image>
</div>`,

  tabs: [
    {
      label: 'Web Component',
      lang: 'html',
      code: `<arc-image
  src="/demo/mountain-600x400.jpg"
  alt="Mountain landscape"
  aspect="16/9"
></arc-image>

<!-- With fallback -->
<arc-image
  src="https://example.com/missing.jpg"
  alt="Product photo"
  aspect="1/1"
  fallback="/demo/fallback-200x200.jpg"
></arc-image>`,
    },
    {
      label: 'React',
      lang: 'tsx',
      code: `import { Image } from '@arclux/arc-ui-react';

export default function Example() {
  return (
    <>
      <Image src="/demo/mountain-600x400.jpg" alt="Mountain landscape" aspect="16/9" />
      <Image src="/missing.jpg" alt="Product" aspect="1/1" fallback="/placeholder.png" />
    </>
  );
}`,
    },
    {
      label: 'Vue',
      lang: 'html',
      code: `<script setup>
import { Image } from '@arclux/arc-ui-vue';
</script>

<template>
  <Image src="/demo/mountain-600x400.jpg" alt="Mountain landscape" aspect="16/9" />
  <Image src="/missing.jpg" alt="Product" aspect="1/1" fallback="/placeholder.png" />
</template>`,
    },
    {
      label: 'Svelte',
      lang: 'html',
      code: `<script>
  import { Image } from '@arclux/arc-ui-svelte';
</script>

<Image src="/demo/mountain-600x400.jpg" alt="Mountain landscape" aspect="16/9" />
<Image src="/missing.jpg" alt="Product" aspect="1/1" fallback="/placeholder.png" />`,
    },
    {
      label: 'Angular',
      lang: 'ts',
      code: `import { Component } from '@angular/core';
import { Image } from '@arclux/arc-ui-angular';

@Component({
  imports: [Image],
  template: \`
    <arc-image src="/demo/mountain-600x400.jpg" alt="Mountain landscape" aspect="16/9" />
    <arc-image src="/missing.jpg" alt="Product" aspect="1/1" fallback="/placeholder.png" />
  \`,
})
export class GalleryComponent {}`,
    },
    {
      label: 'Solid',
      lang: 'tsx',
      code: `import { Image } from '@arclux/arc-ui-solid';

export default function Example() {
  return (
    <>
      <Image src="/demo/mountain-600x400.jpg" alt="Mountain landscape" aspect="16/9" />
      <Image src="/missing.jpg" alt="Product" aspect="1/1" fallback="/placeholder.png" />
    </>
  );
}`,
    },
    {
      label: 'Preact',
      lang: 'tsx',
      code: `import { Image } from '@arclux/arc-ui-preact';

export default function Example() {
  return (
    <>
      <Image src="/demo/mountain-600x400.jpg" alt="Mountain landscape" aspect="16/9" />
      <Image src="/missing.jpg" alt="Product" aspect="1/1" fallback="/placeholder.png" />
    </>
  );
}`,
    },
  ],

  seeAlso: ['avatar', 'skeleton', 'carousel'],
};
