import type { ComponentDef } from './_types';

export const aspectRatio: ComponentDef = {
    name: 'Aspect Ratio',
    slug: 'aspect-ratio',
    tag: 'arc-aspect-ratio',
    tier: 'content',
    interactivity: 'static',
    description: 'Container that enforces a consistent width-to-height ratio on its content, ideal for images, videos, and embedded media.',

    overview: `Aspect Ratio is a layout primitive that constrains its children to a specified width-to-height proportion using the CSS \`aspect-ratio\` property. Pass a ratio string like \`"16/9"\`, \`"4/3"\`, or \`"1/1"\` and the container will maintain that shape regardless of the available width. Slotted children (images, videos, iframes) are automatically sized to fill the container with \`object-fit: cover\`, ensuring no letterboxing or stretching.

This component solves the common problem of content layout shift (CLS) caused by media loading. By reserving the exact space an image or video will occupy before it loads, Aspect Ratio prevents the jarring page reflows that hurt both user experience and Core Web Vitals scores. The container's width is always 100% of its parent, and the height is derived from the ratio, so it works seamlessly in fluid grid layouts.

The ratio prop accepts any valid \`W/H\` format including decimal values like \`"2.35/1"\` for cinematic widescreen. If an invalid format is provided, the component falls back to \`16/9\`. The container applies the theme's medium border radius and clips overflow, so rounded corners on media come free without additional styling.`,

    features: [
      'Enforces a consistent aspect ratio using the CSS `aspect-ratio` property with a `W/H` string prop',
      'Slotted children automatically sized to fill with `width: 100%`, `height: 100%`, and `object-fit: cover`',
      'Prevents content layout shift (CLS) by reserving space before media loads',
      'Supports any valid ratio including standard formats (`16/9`, `4/3`, `1/1`) and decimals (`2.35/1`)',
      'Falls back to `16/9` if the ratio string is invalid or malformed',
      'Applies `border-radius: var(--radius-md)` with overflow clipping for rounded media corners',
      'Full-width container that fills its parent, making it ideal for responsive grid cells',
      'Lightweight wrapper with no JavaScript interaction -- purely CSS-driven layout',
    ],

    guidelines: {
      do: [
        'Use Aspect Ratio around images and videos to prevent layout shift during page load',
        'Choose standard ratios that match your media: `16/9` for video, `4/3` for photos, `1/1` for avatars or thumbnails',
        'Place Aspect Ratio inside grid or flex containers where the width is determined by the layout',
        'Use decimal ratios like `2.35/1` for cinematic or ultrawide content when needed',
        'Combine with lazy loading on images for optimal performance -- the space is reserved before the image loads',
      ],
      dont: [
        'Do not use Aspect Ratio when the content has its own intrinsic dimensions and layout shift is not a concern',
        'Do not place text-heavy content inside Aspect Ratio -- it clips overflow and does not scroll',
        'Do not set both a fixed height and Aspect Ratio on the same element -- they will conflict',
        'Do not use ratio values with zero in the denominator (e.g. `16/0`) -- the component falls back to 16/9',
        'Avoid nesting multiple Aspect Ratio components -- the inner one will be constrained by both ratios unpredictably',
      ],
    },

    previewHtml: `<div style="max-width:320px; width:100%;">
  <arc-aspect-ratio ratio="16/9">
    <div style="background:linear-gradient(135deg, var(--accent-primary), var(--accent-purple, #a855f7)); display:flex; align-items:center; justify-content:center; color:white; font-family:var(--font-mono); font-size:var(--text-lg);">16 / 9</div>
  </arc-aspect-ratio>
</div>`,

    props: [
      { name: 'ratio', type: 'string', default: "'16/9'", description: 'Aspect ratio as a `W/H` string. Supports integers and decimals. Falls back to `16/9` if invalid.' },
    ],
    tabs: [
      {
        label: 'Web Component',
        lang: 'html',
        code: `<arc-aspect-ratio ratio="16/9">
  <img src="/hero.jpg" alt="Hero banner" />
</arc-aspect-ratio>

<!-- Square thumbnail -->
<arc-aspect-ratio ratio="1/1">
  <img src="/avatar.jpg" alt="User avatar" />
</arc-aspect-ratio>`,
      },
      {
        label: 'React',
        lang: 'tsx',
        code: `import { AspectRatio } from '@arclux/arc-ui-react';

<AspectRatio ratio="16/9">
  <img src="/hero.jpg" alt="Hero banner" />
</AspectRatio>

{/* Square thumbnail */}
<AspectRatio ratio="1/1">
  <img src="/avatar.jpg" alt="User avatar" />
</AspectRatio>`,
      },
      {
        label: 'Vue',
        lang: 'html',
        code: `<script setup>
import { AspectRatio } from '@arclux/arc-ui-vue';
</script>

<template>
  <AspectRatio ratio="16/9">
    <img src="/hero.jpg" alt="Hero banner" />
  </AspectRatio>

  <!-- Square thumbnail -->
  <AspectRatio ratio="1/1">
    <img src="/avatar.jpg" alt="User avatar" />
  </AspectRatio>
</template>`,
      },
      {
        label: 'Svelte',
        lang: 'html',
        code: `<script>
  import { AspectRatio } from '@arclux/arc-ui-svelte';
</script>

<AspectRatio ratio="16/9">
  <img src="/hero.jpg" alt="Hero banner" />
</AspectRatio>

<!-- Square thumbnail -->
<AspectRatio ratio="1/1">
  <img src="/avatar.jpg" alt="User avatar" />
</AspectRatio>`,
      },
      {
        label: 'Angular',
        lang: 'ts',
        code: `import { Component } from '@angular/core';
import { AspectRatio } from '@arclux/arc-ui-angular';

@Component({
  imports: [AspectRatio],
  template: \`
    <AspectRatio ratio="16/9">
      <img src="/hero.jpg" alt="Hero banner" />
    </AspectRatio>

    <!-- Square thumbnail -->
    <AspectRatio ratio="1/1">
      <img src="/avatar.jpg" alt="User avatar" />
    </AspectRatio>
  \`,
})
export class MyComponent {}`,
      },
      {
        label: 'Solid',
        lang: 'tsx',
        code: `import { AspectRatio } from '@arclux/arc-ui-solid';

<AspectRatio ratio="16/9">
  <img src="/hero.jpg" alt="Hero banner" />
</AspectRatio>

{/* Square thumbnail */}
<AspectRatio ratio="1/1">
  <img src="/avatar.jpg" alt="User avatar" />
</AspectRatio>`,
      },
      {
        label: 'Preact',
        lang: 'tsx',
        code: `import { AspectRatio } from '@arclux/arc-ui-preact';

<AspectRatio ratio="16/9">
  <img src="/hero.jpg" alt="Hero banner" />
</AspectRatio>

{/* Square thumbnail */}
<AspectRatio ratio="1/1">
  <img src="/avatar.jpg" alt="User avatar" />
</AspectRatio>`,
      },
    ],
  };
