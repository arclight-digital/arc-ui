import type { ComponentDef } from './_types';

export const signaturePad: ComponentDef = {
  name: 'Signature Pad',
  slug: 'signature-pad',
  tag: 'arc-signature-pad',
  tier: 'input',
  interactivity: 'interactive',
  description:
    'Canvas signature capture that participates in forms — freehand strokes serialize to a PNG data-URL and submit as the field value.',
  searchKeywords: ['sign', 'draw', 'autograph', 'canvas', 'ink', 'handwriting'],

  overview: `SignaturePad is a bordered drawing surface for capturing a handwritten signature. While blank, a muted "Sign here" baseline invites the first stroke and disappears the moment ink goes down. The pen line scales with stroke velocity — slow, deliberate movement thickens it and fast flicks thin it — so a mouse or finger produces something that reads as handwriting rather than a polyline. The pen color follows \`--text-primary\` by default and accepts any CSS color, including a \`var()\` reference, through the \`pen-color\` attribute.

The component is a real form control. Each completed stroke serializes the whole canvas to a PNG data-URL and submits it under \`name\`; a blank pad submits nothing, and \`required\` on a blank pad reports \`valueMissing\` like any other input. The stroke is the edit unit: \`arc-input\` and \`arc-change\` fire together once per completed stroke, never per point, each carrying the data-URL in \`event.detail.value\`. Once signed, a small ghost clear button appears in the top corner; clearing empties the value, fires \`arc-clear\`, and brings the placeholder back. \`clear()\` does the same thing from script — wipe the canvas, empty the value, restore the placeholder — which is what you call from your own "start over" control, or after a failed submit that should not leave a stale signature sitting in a form the user is about to retry. \`toDataURL(type)\` exports the current image in a format other than the PNG the value carries.

An honest note on accessibility: signing by hand is inherently a pointer gesture, and the pad offers no keyboard path to produce a signature. The canvas exposes \`role="img"\` with an accessible name that announces its signed or empty state, it stays focusable, and the clear button is keyboard-reachable — but if your form must be completable without a pointer, you need to offer an equivalent alongside the pad, such as a type-to-sign text field or a file upload. The component does not simulate one.`,

  features: [
    'Freehand drawing with pointer capture — mouse, touch, and stylus all work, and touch never scrolls the page mid-stroke',
    'Velocity-scaled pen width (up to 40% thicker or thinner around the `pen-width` base) with midpoint-smoothed curves for a natural line',
    'Serializes to a PNG data-URL after every completed stroke; `toDataURL(type)` exports other formats on demand',
    'Full form participation: submits under `name`, `required` + blank reports `valueMissing`, `form.reset()` restores the initial state',
    'The stroke is the edit unit — `arc-input` and `arc-change` fire once per stroke, never per point',
    'Ghost clear button appears once signed; clearing fires `arc-clear` and restores the "Sign here" placeholder',
    '`clear()` resets the pad from script — same wipe, same `arc-clear`, same placeholder as the button',
    'Pen color resolves CSS custom properties at stroke time, so it follows theme changes without configuration',
    'Crisp on high-DPI screens — the backing store tracks `devicePixelRatio`, and completed strokes survive a resize',
    'Setting `value` from script draws the image back onto the canvas, so a saved signature can be restored for review',
  ],

  guidelines: {
    do: [
      'Give the pad a `label` — it doubles as the accessible name of the canvas',
      'Set `required` when a signature is mandatory; the pad reports `valueMissing` while blank exactly like a native input',
      'Offer a keyboard-accessible alternative (type-to-sign, upload) next to the pad when the form must be completable without a pointer — the pad itself is pointer-only by nature',
      'Listen for `arc-change` to persist or preview the signature; each completed stroke delivers the full, current image',
      'Use `readonly` to display a captured signature that still submits but can no longer be altered',
      'Call `clear()` when your own flow invalidates the signature — a changed name field, a rejected submission, a switched signer',
    ],
    dont: [
      'Do not reflect or store the value as an attribute — a data-URL is far too large; read the `value` property or the event detail instead',
      'Do not treat a signature image as proof of identity on its own — pair it with real authentication when it matters legally',
      'Do not listen per-point for drawing progress; the component deliberately stays silent until a stroke completes',
      'Do not hide the clear button behind your own chrome — a signer who slips needs an obvious way to start over',
      'Avoid very small pads; under about 240px of width there is not enough room for a natural signing motion',
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
