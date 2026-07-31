import type { ComponentDef } from './_types';

export const lightbox: ComponentDef = {
  name: 'Lightbox',
  slug: 'lightbox',
  tag: 'arc-lightbox',
  tier: 'content',
  interactivity: 'interactive',
  searchKeywords: ['gallery', 'image viewer', 'zoom'],
  description:
    'Full-screen image viewer on the overlay stack: open from a thumbnail, step through a gallery with wrapping prev/next navigation, zoom to 2x with drag-to-pan, and dismiss with Escape or a backdrop click.',

  overview: `Lightbox displays a gallery of images at full screen, above the page behind a blurred backdrop. It shares the overlay infrastructure with Modal and Sheet: keyboard focus is trapped while open, page scroll is locked, Escape and a backdrop click dismiss, and focus returns to the trigger element on close. Open it from a thumbnail with \`show(index)\`, or set \`open\` and \`index\` directly.

The gallery is supplied through the \`images\` property rather than slotted children. Each entry is either a plain \`src\` string or a \`{ src, alt, caption }\` object, and the two forms mix freely — captions render below the image and alt text carries through to the rendered \`<img>\`. A monospace counter in the top bar shows the current position, and prev/next arrow buttons (or the arrow keys) step through the gallery, wrapping at both ends.

Zoom is deliberately a single level: press \`+\`, click the zoom button, or double-click the image to magnify to 2x, then drag to pan around it. Navigating to another image or closing the viewer resets the zoom. The component fires \`arc-change\` with the new index on every navigation, and \`arc-close\` is cancelable, so a consumer can veto a dismissal in progress.`,

  features: [
    'Full-screen overlay with backdrop blur, sharing the focus-trap and scroll-lock infrastructure used by Modal and Sheet',
    'Accepts plain `src` strings or `{ src, alt, caption }` objects in the same `images` array',
    'Prev/next arrow buttons and arrow-key navigation, wrapping at both ends',
    'Single-level 2x zoom via the `+`/`-` keys, the zoom button, or a double-click, with drag-to-pan while zoomed',
    'Monospace `3 / 12` position counter with a live region for screen readers',
    'Caption rendered below the image when an entry provides one',
    'Escape and backdrop click dismiss; `arc-close` is cancelable for veto',
    'Fires `arc-change` with the new index on `detail.value` on every navigation',
    'Focus is trapped while open and restored to the trigger element on close',
  ],

  guidelines: {
    do: [
      'Use Lightbox for photo galleries, screenshots, and any image worth inspecting at full size',
      'Open it from a visible thumbnail with `show(index)` so the viewer starts on the image the user chose',
      'Provide `alt` text for every entry — it also labels the dialog for screen readers',
      'Use `caption` for attribution or context that should travel with the image',
      'Listen for `arc-change` when something outside the viewer should track the current image',
    ],
    dont: [
      'Do not use Lightbox for non-image content — Modal is the general-purpose overlay',
      'Do not open it on page load; a full-screen takeover should always be the user\'s choice',
      'Do not pass tiny thumbnails as the `src` — supply full-resolution sources, since the whole point is a closer look',
      'Do not mix it with a second overlay at once; close one surface before opening another',
    ],
  },

  previewHtml: `<div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:12px; max-width:480px;">
  <arc-image id="lb-thumb-0" src="https://picsum.photos/id/1015/300/200" alt="River between mountains" aspect="4/3" style="cursor:pointer;"></arc-image>
  <arc-image id="lb-thumb-1" src="https://picsum.photos/id/1018/300/200" alt="Mountain slope" aspect="4/3" style="cursor:pointer;"></arc-image>
  <arc-image id="lb-thumb-2" src="https://picsum.photos/id/1016/300/200" alt="Canyon river" aspect="4/3" style="cursor:pointer;"></arc-image>
</div>
<arc-lightbox id="demo-lightbox"></arc-lightbox>`,

  previewSetup: `const lb = el.querySelector('#demo-lightbox'); const images = [ { src: 'https://picsum.photos/id/1015/1200/800', alt: 'River between mountains', caption: 'A river valley in evening light' }, { src: 'https://picsum.photos/id/1018/1200/800', alt: 'Mountain slope', caption: 'The slope above the treeline' }, 'https://picsum.photos/id/1016/1200/800' ]; if (lb) lb.images = images; images.forEach((img, i) => { el.querySelector('#lb-thumb-' + i)?.addEventListener('click', () => lb?.show(i)); });`,

  tabs: [
    {
      label: 'Web Component',
      lang: 'html',
      code: `<img id="thumb" src="/photos/valley-thumb.jpg" alt="River valley" />
<arc-lightbox id="viewer"></arc-lightbox>

<script>
  const viewer = document.querySelector('#viewer');
  viewer.images = [
    { src: '/photos/valley.jpg', alt: 'River valley', caption: 'A river valley in evening light' },
    { src: '/photos/slope.jpg', alt: 'Mountain slope' },
    '/photos/canyon.jpg',
  ];
  document.querySelector('#thumb').addEventListener('click', () => viewer.show(0));
</script>`,
    },
    {
      label: 'React',
      lang: 'tsx',
      code: `import { Lightbox } from '@arclux/arc-ui-react';
import { useState } from 'react';

const images = [
  { src: '/photos/valley.jpg', alt: 'River valley', caption: 'A river valley in evening light' },
  { src: '/photos/slope.jpg', alt: 'Mountain slope' },
  '/photos/canyon.jpg',
];

function Gallery() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <img src="/photos/valley-thumb.jpg" alt="River valley" onClick={() => setOpen(true)} />
      <Lightbox images={images} open={open} onArcClose={() => setOpen(false)} />
    </>
  );
}`,
    },
    {
      label: 'Vue',
      lang: 'html',
      code: `<script setup>
import { ref } from 'vue';
import { Lightbox } from '@arclux/arc-ui-vue';

const open = ref(false);
const images = [
  { src: '/photos/valley.jpg', alt: 'River valley', caption: 'A river valley in evening light' },
  { src: '/photos/slope.jpg', alt: 'Mountain slope' },
  '/photos/canyon.jpg',
];
</script>

<template>
  <img src="/photos/valley-thumb.jpg" alt="River valley" @click="open = true" />
  <Lightbox :images="images" :open="open" @arc-close="open = false" />
</template>`,
    },
    {
      label: 'Svelte',
      lang: 'html',
      code: `<script>
  import { Lightbox } from '@arclux/arc-ui-svelte';

  let open = $state(false);
  const images = [
    { src: '/photos/valley.jpg', alt: 'River valley', caption: 'A river valley in evening light' },
    { src: '/photos/slope.jpg', alt: 'Mountain slope' },
    '/photos/canyon.jpg',
  ];
</script>

<img src="/photos/valley-thumb.jpg" alt="River valley" onclick={() => open = true} />
<Lightbox {images} {open} on:arc-close={() => open = false} />`,
    },
    {
      label: 'Angular',
      lang: 'ts',
      code: `import { Component } from '@angular/core';
import { Lightbox } from '@arclux/arc-ui-angular';

@Component({
  imports: [Lightbox],
  template: \`
    <img src="/photos/valley-thumb.jpg" alt="River valley" (click)="open = true" />
    <arc-lightbox [images]="images" [open]="open" (arcClose)="open = false"></arc-lightbox>
  \`,
})
export class GalleryComponent {
  open = false;
  images = [
    { src: '/photos/valley.jpg', alt: 'River valley', caption: 'A river valley in evening light' },
    { src: '/photos/slope.jpg', alt: 'Mountain slope' },
    '/photos/canyon.jpg',
  ];
}`,
    },
    {
      label: 'Solid',
      lang: 'tsx',
      code: `import { createSignal } from 'solid-js';
import { Lightbox } from '@arclux/arc-ui-solid';

const images = [
  { src: '/photos/valley.jpg', alt: 'River valley', caption: 'A river valley in evening light' },
  { src: '/photos/slope.jpg', alt: 'Mountain slope' },
  '/photos/canyon.jpg',
];

function Gallery() {
  const [open, setOpen] = createSignal(false);

  return (
    <>
      <img src="/photos/valley-thumb.jpg" alt="River valley" onClick={() => setOpen(true)} />
      <Lightbox images={images} open={open()} onArcClose={() => setOpen(false)} />
    </>
  );
}`,
    },
    {
      label: 'Preact',
      lang: 'tsx',
      code: `import { useState } from 'preact/hooks';
import { Lightbox } from '@arclux/arc-ui-preact';

const images = [
  { src: '/photos/valley.jpg', alt: 'River valley', caption: 'A river valley in evening light' },
  { src: '/photos/slope.jpg', alt: 'Mountain slope' },
  '/photos/canyon.jpg',
];

function Gallery() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <img src="/photos/valley-thumb.jpg" alt="River valley" onClick={() => setOpen(true)} />
      <Lightbox images={images} open={open} onArcClose={() => setOpen(false)} />
    </>
  );
}`,
    },
  ],

  seeAlso: ['carousel', 'image', 'modal'],
};
