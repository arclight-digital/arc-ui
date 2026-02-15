import type { ComponentDef } from './_types';

export const image: ComponentDef = {
  name: 'Image',
  slug: 'image',
  tag: 'arc-image',
  tier: 'content',
  interactivity: 'interactive',
  description: 'Enhanced image component with shimmer loading skeleton, smooth fade-in transition, error fallback, and aspect ratio presets.',

  overview: `Image wraps the native \`<img>\` element with loading states and error handling that would otherwise require custom boilerplate in every project. While the image loads, a shimmer skeleton animation fills the container, giving users immediate visual feedback. Once loaded, the image fades in smoothly via a CSS opacity transition.

If the image fails to load, the component switches to an error state that displays either a custom fallback image (via the \`fallback\` prop) or a default placeholder icon. This three-state lifecycle — loading, loaded, error — is fully automatic and requires no imperative code.

Six aspect ratio presets (\`1/1\`, \`4/3\`, \`16/9\`, \`21/9\`, \`3/4\`, \`9/16\`) constrain the container dimensions before the image loads, preventing layout shift. The \`fit\` property maps directly to CSS \`object-fit\`, defaulting to \`cover\` for full-bleed cropping. Native lazy loading is enabled by default via the \`loading="lazy"\` attribute.`,

  features: [
    'Shimmer skeleton animation during image loading',
    'Smooth opacity fade-in transition when the image loads',
    'Automatic error fallback with placeholder icon or custom fallback image',
    'Six aspect ratio presets to prevent layout shift: 1/1, 4/3, 16/9, 21/9, 3/4, 9/16',
    'Five object-fit modes: cover (default), contain, fill, none, scale-down',
    'Native lazy loading enabled by default',
    'Respects `prefers-reduced-motion` — disables shimmer and fade when set',
    'Exposed CSS parts: wrapper, image, fallback'
  ],

  guidelines: {
    do: [
      'Always provide meaningful `alt` text for accessibility',
      'Set an `aspect` ratio to prevent layout shift during loading',
      'Use `fit="contain"` for logos or icons that should not be cropped',
      'Provide a `fallback` image URL for critical images that must always display something'
    ],
    dont: [
      'Use arc-image for decorative background images — use CSS `background-image` instead',
      'Set `loading="eager"` on below-the-fold images — lazy is the default for a reason',
      'Omit `alt` text — the image is semantically meaningful content',
      'Use extremely large source images without server-side resizing'
    ],
  },

  previewHtml: `<div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; max-width: 600px;">
  <arc-image src="https://picsum.photos/300/200?random=1" alt="Sample landscape" aspect="16/9"></arc-image>
  <arc-image src="https://picsum.photos/300/300?random=2" alt="Sample square" aspect="1/1"></arc-image>
  <arc-image src="https://invalid-url.example/broken.jpg" alt="Broken image" aspect="16/9"></arc-image>
</div>`,

  props: [
    { name: 'src', type: 'string', default: "''", description: 'Image source URL.' },
    { name: 'alt', type: 'string', default: "''", description: 'Alt text for the image. Used as the accessible description.' },
    { name: 'aspect', type: "'1/1' | '4/3' | '16/9' | '21/9' | '3/4' | '9/16'", default: "''", description: 'Constrains the container to a fixed aspect ratio, preventing layout shift during loading.' },
    { name: 'fit', type: "'cover' | 'contain' | 'fill' | 'none' | 'scale-down'", default: "'cover'", description: 'CSS object-fit mode controlling how the image fills its container.' },
    { name: 'loading', type: "'lazy' | 'eager'", default: "'lazy'", description: 'Native loading strategy. Lazy defers off-screen images until they approach the viewport.' },
    { name: 'fallback', type: 'string', default: "''", description: 'URL of a fallback image to display if the primary `src` fails to load.' }
  ],

  events: [
    { name: 'arc-load', description: 'Fired when the image successfully loads.' },
    { name: 'arc-error', description: 'Fired when the image fails to load.' }
  ],

  tabs: [
    {
      label: 'Web Component',
      lang: 'html',
      code: `<arc-image
  src="https://picsum.photos/600/400"
  alt="Mountain landscape"
  aspect="16/9"
></arc-image>

<!-- With fallback -->
<arc-image
  src="https://example.com/missing.jpg"
  alt="Product photo"
  aspect="1/1"
  fallback="https://picsum.photos/200/200"
></arc-image>`,
    },
    {
      label: 'React',
      lang: 'tsx',
      code: `import { Image } from '@arclux/arc-ui-react';

<Image src="https://picsum.photos/600/400" alt="Mountain landscape" aspect="16/9" />
<Image src="/missing.jpg" alt="Product" aspect="1/1" fallback="/placeholder.png" />`,
    },
    {
      label: 'Vue',
      lang: 'html',
      code: `<script setup>
import { Image } from '@arclux/arc-ui-vue';
</script>

<template>
  <Image src="https://picsum.photos/600/400" alt="Mountain landscape" aspect="16/9" />
  <Image src="/missing.jpg" alt="Product" aspect="1/1" fallback="/placeholder.png" />
</template>`,
    },
    {
      label: 'Svelte',
      lang: 'html',
      code: `<script>
  import { Image } from '@arclux/arc-ui-svelte';
</script>

<Image src="https://picsum.photos/600/400" alt="Mountain landscape" aspect="16/9" />
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
    <Image src="https://picsum.photos/600/400" alt="Mountain landscape" aspect="16/9" />
    <Image src="/missing.jpg" alt="Product" aspect="1/1" fallback="/placeholder.png" />
  \`,
})
export class GalleryComponent {}`,
    },
    {
      label: 'Solid',
      lang: 'tsx',
      code: `import { Image } from '@arclux/arc-ui-solid';

<Image src="https://picsum.photos/600/400" alt="Mountain landscape" aspect="16/9" />
<Image src="/missing.jpg" alt="Product" aspect="1/1" fallback="/placeholder.png" />`,
    },
    {
      label: 'Preact',
      lang: 'tsx',
      code: `import { Image } from '@arclux/arc-ui-preact';

<Image src="https://picsum.photos/600/400" alt="Mountain landscape" aspect="16/9" />
<Image src="/missing.jpg" alt="Product" aspect="1/1" fallback="/placeholder.png" />`,
    },
  ],

  seeAlso: ['avatar', 'skeleton', 'carousel'],
};
