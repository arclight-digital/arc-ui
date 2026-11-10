import type { ComponentDef } from './_types';

export const qrCode: ComponentDef = {
  name: 'QR Code',
  slug: 'qr-code',
  tag: 'arc-qr-code',
  tier: 'content',
  interactivity: 'interactive',
  description:
    'Encodes a string as a QR code in the browser and draws it as inline SVG. Follows your text color, with an optional white card for dark backgrounds.',

  overview: `QRCode encodes a URL, a Wi-Fi string, a 2FA provisioning URI or any other string in the browser and renders it as inline SVG, with no canvas, image request or server call. All the dark modules are joined into one \`<path>\` drawn with \`shape-rendering="crispEdges"\`, so the DOM stays small and the code scales to any size.

The modules use \`--qr-fg\` if you set it and \`currentColor\` otherwise, which defaults to \`--text-primary\`. The background is \`--qr-bg\`, transparent by default. Set either custom property to change them.

Scanners read dark modules on a light background more reliably than the reverse. On ARC's dark theme the default rendering is light modules on a dark surface, an inverted code. When a scan has to work (payment links, ticket check-in, device pairing), set \`contrast\`. It draws black modules on a white rounded card in both themes and ignores \`--qr-fg\` and \`--qr-bg\`.

The code re-encodes whenever \`value\` or \`level\` changes, and renders nothing when \`value\` is empty or too long for a QR code at that level. The SVG has \`role="img"\` and takes its accessible name from \`label\`, or "QR code" without one. The value itself is never exposed to assistive technology, because it may be a secret like a 2FA URI or a token.`,

  features: [
    'Encoding by the qrcode-generator library (MIT, no dependencies of its own)',
    'Four error-correction levels (L, M, Q, H) and automatic version (size) selection',
    '`quiet-zone` sets the width of the empty border around the code, in modules',
    'Parts: `base`, `svg`, `card`',
  ],

  guidelines: {
    do: [
      'Write a `label` that says what the code does ("Scan to open the event page"), not the value. Assistive technology reads the label, and the value may be a secret',
      'Use level M (the default) for most content. Step up to Q or H only when part of the code may be covered or worn, as with a logo overlay or a printed code',
      'Keep values short. Shorter strings make fewer modules, which scan faster and from further away',
      'Render codes at 160px or larger when they\'re scanned from another device across a desk',
      'Show the same link as text or with a copy button for people who can\'t scan',
    ],
    dont: [
      'Don\'t encode strings over about 1KB. Capacity runs out, and dense codes don\'t scan reliably at usual sizes',
      'Don\'t set `--qr-fg` and `--qr-bg` to colors of similar lightness. Scanners need strong dark-on-light contrast',
      'Don\'t set `quiet-zone` below 2 when the code is next to busy content',
    ],
  },

  previewHtml: `<div style="display: flex; align-items: center; gap: 32px; flex-wrap: wrap;">
  <div style="display: flex; flex-direction: column; align-items: center; gap: 8px;">
    <arc-qr-code value="https://arcui.dev" label="ARC UI website" size="140"></arc-qr-code>
    <span style="font-size: 12px; color: var(--text-muted);">Default (currentColor)</span>
  </div>
  <div style="display: flex; flex-direction: column; align-items: center; gap: 8px;">
    <arc-qr-code value="https://arcui.dev" label="ARC UI website" size="140" contrast></arc-qr-code>
    <span style="font-size: 12px; color: var(--text-muted);">Contrast card</span>
  </div>
  <div style="display: flex; flex-direction: column; align-items: center; gap: 8px;">
    <arc-qr-code value="https://arcui.dev" label="ARC UI website" size="140" level="H" style="--qr-fg: var(--accent-primary);"></arc-qr-code>
    <span style="font-size: 12px; color: var(--text-muted);">Custom --qr-fg, level H</span>
  </div>
</div>`,

  tabs: [
    {
      label: 'Web Component',
      lang: 'html',
      code: `<script type="module" src="@arclux/arc-ui"></script>

<!-- Themed code (inherits currentColor) -->
<arc-qr-code value="https://arcui.dev" label="ARC UI website"></arc-qr-code>

<!-- Guaranteed scanability in both themes -->
<arc-qr-code
  value="https://arcui.dev"
  label="ARC UI website"
  contrast
></arc-qr-code>

<!-- High error correction + custom colors -->
<arc-qr-code
  value="WIFI:T:WPA;S:Arclight;P:hunter2;;"
  label="Wi-Fi network credentials"
  level="H"
  size="200"
  style="--qr-fg: var(--accent-primary); --qr-bg: var(--surface-raised);"
></arc-qr-code>`,
    },
    {
      label: 'React',
      lang: 'tsx',
      code: `import { QrCode } from '@arclux/arc-ui-react';

export function SharePanel({ url }: { url: string }) {
  return (
    <QrCode value={url} label="Scan to open this page" size={200} contrast />
  );
}`,
    },
    {
      label: 'Vue',
      lang: 'html',
      code: `<script setup>
import { QrCode } from '@arclux/arc-ui-vue';
</script>

<template>
  <QrCode value="https://arcui.dev" label="ARC UI website" :size="200" contrast />
</template>`,
    },
    {
      label: 'Svelte',
      lang: 'html',
      code: `<script>
  import { QrCode } from '@arclux/arc-ui-svelte';
</script>

<QrCode value="https://arcui.dev" label="ARC UI website" size={200} contrast />`,
    },
    {
      label: 'Angular',
      lang: 'ts',
      code: `import { Component } from '@angular/core';
import { QrCode } from '@arclux/arc-ui-angular';

@Component({
  imports: [QrCode],
  template: \`
    <arc-qr-code value="https://arcui.dev" label="ARC UI website" size="200" contrast />
  \`,
})
export class SharePanelComponent {}`,
    },
    {
      label: 'Solid',
      lang: 'tsx',
      code: `import { QrCode } from '@arclux/arc-ui-solid';

export function SharePanel() {
  return (
    <QrCode value="https://arcui.dev" label="ARC UI website" size={200} contrast />
  );
}`,
    },
    {
      label: 'Preact',
      lang: 'tsx',
      code: `import { QrCode } from '@arclux/arc-ui-preact';

export function SharePanel() {
  return (
    <QrCode value="https://arcui.dev" label="ARC UI website" size={200} contrast />
  );
}`,
    },
  ],

  seeAlso: ['image', 'copy-button', 'pin-input'],
};
