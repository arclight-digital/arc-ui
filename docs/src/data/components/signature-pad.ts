import type { ComponentDef } from './_types';

export const signaturePad: ComponentDef = {
  name: 'Signature Pad',
  slug: 'signature-pad',
  tag: 'arc-signature-pad',
  tier: 'input',
  interactivity: 'interactive',
  description:
    'A canvas for a handwritten signature that works as a form field: strokes serialize to a PNG data-URL and submit as its value.',
  searchKeywords: ['sign', 'draw', 'autograph', 'canvas', 'ink', 'handwriting'],

  overview: `SignaturePad is a bordered canvas for a handwritten signature. While it's blank, a muted "Sign here" baseline shows, and it disappears with the first stroke. The line width follows stroke speed (slow movement thickens it, fast flicks thin it), so a mouse or finger signature reads as handwriting. The pen color defaults to \`--text-primary\` and \`pen-color\` takes any CSS color, including a \`var()\` reference.

It's a form control. Each completed stroke serializes the whole canvas to a PNG data-URL and submits it under \`name\`. A blank pad submits nothing, and \`required\` on a blank pad reports \`valueMissing\` like any other input. The stroke is the edit unit: \`arc-input\` and \`arc-change\` fire together once per completed stroke, never per point, each with the data-URL in \`event.detail.value\`. Once signed, a small ghost clear button appears in the top corner. Clearing empties the value, fires \`arc-clear\` and brings the placeholder back. \`clear()\` does the same from script. \`toDataURL(type)\` exports the image in a format other than PNG.

Signing is a pointer gesture, and the pad has no keyboard way to produce a signature. The canvas has \`role="img"\` with an accessible name that says whether it's signed or empty, it stays focusable, and the clear button is reachable by keyboard. If your form must be completable without a pointer, offer an equivalent next to the pad, such as a type-to-sign text field or a file upload. The component doesn't provide one.`,

  features: [
    'Pointer capture: mouse, touch and stylus all work, and touch never scrolls the page mid-stroke',
    'Pen width varies up to 40% either side of the `pen-width` base, with midpoint-smoothed curves',
    '`form.reset()` restores the initial state',
    'Pen color resolves CSS custom properties at stroke time, so it follows theme changes',
    'The backing store is sized to `devicePixelRatio` on setup and on every resize, so strokes are sharp on high-DPI screens, and completed strokes survive a resize',
    'Setting `value` from script draws the image back onto the canvas, so a saved signature can be shown for review',
  ],

  guidelines: {
    do: [
      'Give the pad a `label`. It is also the canvas\'s accessible name',
      'Listen for `arc-change` to save or preview the signature. Each stroke delivers the full current image',
      'Use `readonly` to show a captured signature that still submits but can\'t be changed',
      'Call `clear()` when your own flow invalidates the signature: a changed name field, a rejected submission, a different signer',
    ],
    dont: [
      'Don\'t store the value in an attribute. A data-URL is far too large, so read the `value` property or the event detail',
      'Don\'t treat a signature image as proof of identity on its own. Pair it with real authentication when it matters legally',
      'Don\'t hide the clear button behind your own chrome. A signer who slips needs an obvious way to start over',
      'Don\'t make the pad narrower than about 240px. There isn\'t room for a natural signing motion',
    ],
  },

  previewHtml: `<div style="display: flex; flex-direction: column; gap: var(--space-md); width: min(360px, 100%);">
  <arc-signature-pad
    label="Signature"
    name="signature"
  ></arc-signature-pad>
  <img
    class="sig-preview"
    alt="Captured signature preview"
    hidden
    style="height: 56px; object-fit: contain; align-self: flex-start; border: 1px solid var(--border-subtle); border-radius: var(--radius-sm); background: var(--surface-primary);"
  />
</div>`,

  previewSetup: `const pad = document.querySelector('arc-signature-pad');
const preview = document.querySelector('.sig-preview');
pad.addEventListener('arc-change', (e) => {
  preview.src = e.detail.value;
  preview.hidden = !e.detail.value;
});
pad.addEventListener('arc-clear', () => {
  preview.hidden = true;
  preview.removeAttribute('src');
});`,

  tabs: [
    {
      label: 'Web Component',
      lang: 'html',
      code: `<form>
  <arc-signature-pad
    label="Signature"
    name="signature"
    required
  ></arc-signature-pad>
</form>

<script>
  const pad = document.querySelector('arc-signature-pad');
  // Fired once per completed stroke with the PNG data-URL
  pad.addEventListener('arc-change', (e) => {
    console.log('Signature updated:', e.detail.value.slice(0, 40) + '…');
  });
  pad.addEventListener('arc-clear', () => {
    console.log('Signature cleared');
  });
</script>`,
    },
    {
      label: 'React',
      lang: 'tsx',
      code: `import { SignaturePad } from '@arclux/arc-ui-react';

export default function Example() {
  return (
    <SignaturePad
      label="Signature"
      name="signature"
      required
      onArcChange={(e) => console.log('Signature:', e.detail.value)}
      onArcClear={() => console.log('Cleared')}
    />
  );
}`,
    },
    {
      label: 'Vue',
      lang: 'html',
      code: `<script setup>
import { SignaturePad } from '@arclux/arc-ui-vue';
</script>

<template>
  <SignaturePad
    label="Signature"
    name="signature"
    required
    @arc-change="(e) => console.log('Signature:', e.detail.value)"
    @arc-clear="() => console.log('Cleared')"
  />
</template>`,
    },
    {
      label: 'Svelte',
      lang: 'html',
      code: `<script>
  import { SignaturePad } from '@arclux/arc-ui-svelte';
</script>

<SignaturePad
  label="Signature"
  name="signature"
  required
  on:arc-change={(e) => console.log('Signature:', e.detail.value)}
  on:arc-clear={() => console.log('Cleared')}
/>`,
    },
    {
      label: 'Angular',
      lang: 'ts',
      code: `import { Component } from '@angular/core';
import { SignaturePad } from '@arclux/arc-ui-angular';

@Component({
  imports: [SignaturePad],
  template: \`
    <arc-signature-pad
      label="Signature"
      name="signature"
      required
      (arc-change)="onSign($event)"
      (arc-clear)="onClear()"
    ></arc-signature-pad>
  \`,
})
export class MyComponent {
  onSign(e: CustomEvent) {
    console.log('Signature:', e.detail.value);
  }

  onClear() {
    console.log('Cleared');
  }
}`,
    },
    {
      label: 'Solid',
      lang: 'tsx',
      code: `import { SignaturePad } from '@arclux/arc-ui-solid';

export default function Example() {
  return (
    <SignaturePad
      label="Signature"
      name="signature"
      required
      onArcChange={(e) => console.log('Signature:', e.detail.value)}
      onArcClear={() => console.log('Cleared')}
    />
  );
}`,
    },
    {
      label: 'Preact',
      lang: 'tsx',
      code: `import { SignaturePad } from '@arclux/arc-ui-preact';

export default function Example() {
  return (
    <SignaturePad
      label="Signature"
      name="signature"
      required
      onArcChange={(e) => console.log('Signature:', e.detail.value)}
      onArcClear={() => console.log('Cleared')}
    />
  );
}`,
    },
  ],

  seeAlso: ['file-upload', 'image-cropper', 'color-picker'],
};
