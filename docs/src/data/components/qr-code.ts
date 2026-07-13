import type { ComponentDef } from './_types';

export const qrCode: ComponentDef = {
  name: 'QR Code',
  slug: 'qr-code',
  tag: 'arc-qr-code',
  tier: 'content',
  interactivity: 'interactive',
  status: 'beta',
  description: 'Client-side QR code renderer that encodes any string into a crisp inline SVG. Themes automatically via currentColor, with an optional contrast card for guaranteed scanability on dark backgrounds.',

  overview: `QR Code encodes a URL, Wi-Fi credential, 2FA provisioning URI, or any other string entirely on the client and renders it as a single-path inline SVG — no canvas, no image requests, no server round-trip. All dark modules are combined into one \`<path>\` with crisp edges, so even large codes stay lightweight and scale cleanly at any size.

By default the modules inherit \`currentColor\` (falling back to \`var(--text-primary)\`) over a transparent background, so the code themes automatically alongside your text. Consumers can override the two custom properties \`--qr-fg\` (module color) and \`--qr-bg\` (background) for full control.

One important caveat: QR scanners are built for dark modules on a light background. On ARC's dark theme, the default rendering produces light modules on a dark surface — an "inverted" code that most modern scanners handle, but less reliably than a standard one. When scanability matters (payment links, ticket check-in, device pairing), set the \`contrast\` attribute: it renders the code as forced-black modules on a white rounded card, guaranteeing reliable scanning in both themes.

The component re-encodes automatically whenever \`value\` or \`level\` changes, and renders nothing when \`value\` is empty or exceeds QR capacity. The raw value is never exposed to assistive technology — set a meaningful \`label\` describing what the code does, especially since values are often secrets (2FA URIs, tokens).`,

  features: [
    'Fully client-side encoding via the battle-tested qrcode-generator library (MIT, zero dependencies)',
    'Single-path SVG output with run-length-combined modules — small DOM, crisp at any size',
    'Themes automatically: modules use var(--qr-fg, currentColor), background var(--qr-bg, transparent)',
    'Contrast mode renders a white rounded card with forced dark modules for guaranteed scanability in both themes',
    'Four error-correction levels (L / M / Q / H) with automatic version (size) selection',
    'Configurable quiet zone (border of empty modules) around the code',
    'role="img" with a consumer-provided accessible label — the raw value is never exposed by default',
    'Re-encodes reactively when value or level changes; renders nothing for empty values',
    'CSS parts (svg, card) for external style overrides',
  ],

  guidelines: {
    do: [
      'Set the contrast attribute whenever reliable scanning matters (payments, tickets, pairing) — inverted light-on-dark codes are less reliable with some scanners',
      'Provide a meaningful label describing what the code does ("Scan to open the event page"), not the encoded value itself',
      'Use level "M" (the default) for most content; step up to "Q" or "H" only when the code may be partially obscured (e.g. a logo overlay or print wear)',
      'Keep encoded values short — shorter strings produce fewer modules and scan faster from further away',
      'Render at 160px or larger for codes meant to be scanned from another device across a desk',
      'Pair with visible text or a copy button showing the same link, for users who cannot scan',
    ],
    dont: [
      'Rely on the default transparent rendering for scan-critical codes on the dark theme — use contrast mode instead',
      'Put the raw encoded value in the label — it is exposed to assistive technology and may be a secret (2FA URI, token)',
      'Encode very long strings (over ~1KB) — capacity runs out and density makes scanning unreliable at typical sizes',
      'Override --qr-fg/--qr-bg with low-contrast or same-lightness colors — scanners need strong dark-on-light contrast',
      'Shrink the quiet zone below 2 modules when the code sits against busy surrounding content',
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

  props: [
    {
      name: 'value',
      type: 'string',
      default: "''",
      description: 'The content to encode (URL, text, Wi-Fi string, 2FA URI, …). Empty values render nothing. Values exceeding QR capacity for the chosen level also render nothing.',
    },
    {
      name: 'size',
      type: 'number',
      default: '160',
      description: 'Rendered width and height of the SVG in pixels. The code is vector-based and stays crisp at any size.',
    },
    {
      name: 'level',
      type: "'L' | 'M' | 'Q' | 'H'",
      default: "'M'",
      description: 'Error-correction level: L (~7% recovery), M (~15%), Q (~25%), H (~30%). Higher levels tolerate more damage/occlusion but produce denser codes.',
    },
    {
      name: 'label',
      type: 'string',
      default: "''",
      description: 'Accessible description announced to screen readers (falls back to "QR code"). Describe the purpose, not the encoded value — the value is never exposed by default since it may be a secret.',
    },
    {
      name: 'quiet-zone',
      type: 'number',
      default: '2',
      description: 'Width of the empty border around the code, measured in modules. Scanners rely on this margin to find the code; keep at least 2 against busy backgrounds.',
    },
    {
      name: 'contrast',
      type: 'boolean',
      default: 'false',
      description: 'Renders the code on a white rounded card with forced dark modules, guaranteeing dark-on-light scanability in both themes. Overrides --qr-fg/--qr-bg. Recommended for scan-critical codes.',
    },
  ],

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
    <QrCode value="https://arcui.dev" label="ARC UI website" size="200" contrast />
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

  seeAlso: ['image', 'copy-button', 'otp-input'],
};
