import type { ComponentDef } from './_types';

const demoSrc = `data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20width='480'%20height='320'%3E%3Cdefs%3E%3ClinearGradient%20id='g'%20x1='0'%20y1='0'%20x2='1'%20y2='1'%3E%3Cstop%20offset='0'%20stop-color='%231c2b4a'/%3E%3Cstop%20offset='1'%20stop-color='%234d7ef7'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect%20width='480'%20height='320'%20fill='url(%23g)'/%3E%3Ccircle%20cx='340'%20cy='110'%20r='70'%20fill='%238fb0ff'%20opacity='0.6'/%3E%3Ccircle%20cx='150'%20cy='230'%20r='90'%20fill='%230e1526'%20opacity='0.55'/%3E%3C/svg%3E`;

export const imageCropper: ComponentDef = {
  name: 'Image Cropper',
  slug: 'image-cropper',
  tag: 'arc-image-cropper',
  tier: 'input',
  interactivity: 'interactive',
  description:
    "Crop-before-upload control: drag and resize a crop rectangle, lock its aspect ratio, zoom, and export the crop at the image's natural resolution.",

  overview: `Image Cropper shows an image letterboxed in a fixed-height stage with a crop rectangle over it. People drag the rectangle to move it and pull its eight handles (four corners, four edges) to resize it. Everything outside the rectangle is darkened, and rule-of-thirds lines sit inside it. A zoom slider under the stage scales the image around its center from 1x to 4x while the rectangle stays put.

\`aspect\` (width/height, such as \`1\` for a square avatar or \`16/9\`) locks the rectangle to that ratio through every drag, resize, zoom and key press. Leave it at \`0\` for a free-form crop. The rectangle always stays inside the image and never gets smaller than 32px.

Three methods read the result. \`getCrop()\` returns \`{ x, y, width, height }\` in the image's natural pixels, with letterboxing and zoom already accounted for. \`getCroppedBlob(type, quality)\` and \`getCroppedDataUrl(type, quality)\` draw the crop to an offscreen canvas at natural resolution. Export only works when \`src\` is same-origin or served with CORS headers. A cross-origin image taints the canvas, and the methods throw an error that says so. \`arc-crop-change\` fires with the same natural-pixel coordinates, at most once per animation frame during a drag.`,

  features: [
    'Handles have touch-sized hit areas',
    'Keyboard: focus the rectangle, then arrows move it 2px and Shift+arrows resize it from the bottom-right corner',
    'Position and size are announced in a polite live region when a key is released',
    'A skeleton shimmer shows while the image loads, and an inline error if it fails',
  ],

  guidelines: {
    do: [
      'Set `aspect="1"` for avatars so the exported crop is always square',
      'Use an object URL (`URL.createObjectURL(file)`) as `src` when cropping a file just picked in `arc-file-upload`',
      'Listen for `arc-crop-change` to show a live preview or save the crop coordinates',
      'Call `getCroppedBlob()` at upload time to send the cropped region at natural resolution',
      'Serve remote images from the same origin or with CORS headers so export works',
    ],
    dont: [
      "Don't read crop coordinates from the rectangle on screen. `getCrop()` converts them to natural image pixels",
      "Don't shrink `height` far below its 320px default. The rectangle and handles need room",
      "Don't use it to frame an image for display. Use CSS `object-fit` or an aspect-ratio container",
    ],
  },

  previewLayout: 'block',

  previewHtml: `<arc-image-cropper
  src="${demoSrc}"
  aspect="1"
  height="280"
></arc-image-cropper>`,

  tabs: [
    {
      label: 'Web Component',
      lang: 'html',
      code: `<arc-image-cropper
  src="/uploads/avatar-original.jpg"
  aspect="1"
  height="320"
></arc-image-cropper>

<script>
  const cropper = document.querySelector('arc-image-cropper');

  cropper.addEventListener('arc-crop-change', (e) => {
    console.log('Crop (natural px):', e.detail);
  });

  // At upload time — natural-resolution export:
  async function upload() {
    const blob = await cropper.getCroppedBlob('image/jpeg', 0.9);
    const body = new FormData();
    body.append('avatar', blob, 'avatar.jpg');
    await fetch('/api/avatar', { method: 'POST', body });
  }
</script>`,
    },
    {
      label: 'React',
      lang: 'tsx',
      code: `import { useRef } from 'react';
import { ImageCropper } from '@arclux/arc-ui-react';

function AvatarEditor({ src }: { src: string }) {
  const ref = useRef<HTMLElementTagNameMap['arc-image-cropper']>(null);

  const save = async () => {
    const blob = await ref.current!.getCroppedBlob('image/jpeg', 0.9);
    // ...upload blob
  };

  return (
    <>
      <ImageCropper
        ref={ref}
        src={src}
        aspect={1}
        height={320}
        onArcCropChange={(e) => console.log(e.detail)}
      />
      <button onClick={save}>Save avatar</button>
    </>
  );
}`,
    },
    {
      label: 'Vue',
      lang: 'html',
      code: `<script setup>
import { ref } from 'vue';
import { ImageCropper } from '@arclux/arc-ui-vue';

const cropper = ref(null);

async function save() {
  const blob = await cropper.value?.getCroppedBlob('image/jpeg', 0.9);
  // ...upload blob
}
</script>

<template>
  <ImageCropper
    ref="cropper"
    src="/uploads/avatar-original.jpg"
    :aspect="1"
    :height="320"
    @arc-crop-change="(e) => console.log(e.detail)"
  />
  <button @click="save">Save avatar</button>
</template>`,
    },
    {
      label: 'Svelte',
      lang: 'html',
      code: `<script>
  import { ImageCropper } from '@arclux/arc-ui-svelte';

  let cropper;

  async function save() {
    const blob = await cropper.getCroppedBlob('image/jpeg', 0.9);
    // ...upload blob
  }
</script>

<ImageCropper
  bind:this={cropper}
  src="/uploads/avatar-original.jpg"
  aspect={1}
  height={320}
  on:arc-crop-change={(e) => console.log(e.detail)}
/>
<button on:click={save}>Save avatar</button>`,
    },
    {
      label: 'Angular',
      lang: 'ts',
      code: `import { Component, ElementRef, ViewChild } from '@angular/core';
import { ImageCropper } from '@arclux/arc-ui-angular';

@Component({
  imports: [ImageCropper],
  template: \`
    <arc-image-cropper
      #cropper
      src="/uploads/avatar-original.jpg"
      [aspect]="1"
      [height]="320"
      (arcCropChange)="onCropChange($event)"
    ></arc-image-cropper>
    <button (click)="save()">Save avatar</button>
  \`,
})
export class AvatarEditorComponent {
  @ViewChild('cropper', { read: ElementRef }) cropper!: ElementRef;

  onCropChange(e: CustomEvent) {
    console.log(e.detail);
  }

  async save() {
    const blob = await this.cropper.nativeElement.getCroppedBlob('image/jpeg', 0.9);
    // ...upload blob
  }
}`,
    },
  ],

  seeAlso: ['file-upload', 'avatar', 'slider'],
};
