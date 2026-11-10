import type { ComponentDef } from './_types';

export const imageHotspots: ComponentDef = {
  name: 'Image Hotspots',
  slug: 'image-hotspots',
  tag: 'arc-image-hotspots',
  tier: 'content',
  interactivity: 'interactive',
  description:
    'An image with pins that each open a small popover, for annotating a screenshot or photo.',
  searchKeywords: ['annotation', 'pin', 'marker', 'callout', 'map', 'screenshot'],

  overview: `Image Hotspots puts pins over a picture, and each pin opens a popover. Slot the image and the \`<arc-hotspot>\` children together. Each pin positions itself from its \`x\` and \`y\` attributes, given as percentages of the image, so source order doesn't matter and nothing is measured.

Each pin is a \`<button>\` with a label and \`aria-expanded\`. Activating it opens its popover above the pin, and the popover flips and shifts to stay in the viewport. The parent keeps one popover open at a time. An open popover closes on Escape, on a click anywhere else, or on a second click of its pin.

Every close goes through \`close()\`, including the parent's. It fires a cancelable \`arc-close\` first, and a listener that calls \`preventDefault()\` keeps the popover open. Closing the other popovers is itself a \`close()\` call, so a hotspot holding an unsaved note can refuse to close when someone clicks another pin, as well as on Escape. Call \`close()\` yourself to dismiss a popover from script. Its first argument, \`restoreFocus\`, defaults to true and returns focus to the pin. Pass \`false\` when you're closing one popover to open another, so focus lands on the new pin.

Pins server-render at their coordinates because positioning is plain CSS from attributes. Only the popovers need JavaScript. Every hotspot fires \`arc-open\` and \`arc-close\`, which bubble to the parent with \`detail.value\` set to the hotspot's label, or its index if it has no label.`,

  features: [
    'Pins pulse, and their glow rises on hover and focus',
  ],

  guidelines: {
    do: [
      'Give every hotspot a label. It names the pin for screen readers, heads the popover, and identifies the hotspot in events',
      'Keep popover content to a sentence or two, and link out for anything longer',
      'Put each pin on the feature it describes, not beside it',
      'Use a handful of pins per image',
      'Give the component a width that keeps the pins far enough apart to tap',
    ],
    dont: [
      'Don\'t put pins so close that their popovers cover each other\'s pins',
      'Don\'t put critical information only in a popover. People miss pins',
      'Don\'t use it for step-by-step onboarding. Pins have no order, and nothing here sequences them (`arc-guided-tour` was cut in v4, and `arc-tour` is the planned rebuild)',
    ],
  },

  previewHtml: `<arc-image-hotspots style="width: min(560px, 100%)">
  <div style="aspect-ratio: 16 / 10; border-radius: var(--radius-lg); border: 1px solid var(--border-subtle); background: linear-gradient(160deg, rgba(var(--accent-primary-rgb), 0.10), transparent 45%), var(--surface-raised); overflow: hidden; display: grid; grid-template-columns: 26% 1fr; grid-template-rows: 14% 1fr;">
    <div style="grid-column: 1 / -1; border-bottom: 1px solid var(--border-subtle); display: flex; align-items: center; gap: 6px; padding-inline: var(--space-md);">
      <span style="width: 8px; height: 8px; border-radius: var(--radius-full); background: var(--border-bright);"></span>
      <span style="width: 8px; height: 8px; border-radius: var(--radius-full); background: var(--border-bright);"></span>
      <span style="width: 40%; height: 8px; border-radius: var(--radius-full); background: var(--surface-overlay); margin-inline-start: var(--space-md);"></span>
    </div>
    <div style="border-inline-end: 1px solid var(--border-subtle); padding: var(--space-md); display: flex; flex-direction: column; gap: var(--space-sm);">
      <span style="height: 8px; border-radius: var(--radius-full); background: var(--surface-overlay); width: 80%;"></span>
      <span style="height: 8px; border-radius: var(--radius-full); background: var(--surface-overlay); width: 65%;"></span>
      <span style="height: 8px; border-radius: var(--radius-full); background: var(--surface-overlay); width: 72%;"></span>
    </div>
    <div style="padding: var(--space-md); display: grid; gap: var(--space-sm); grid-template-rows: 1fr 32%;">
      <div style="border-radius: var(--radius-md); background: linear-gradient(180deg, rgba(var(--accent-secondary-rgb), 0.14), rgba(var(--accent-primary-rgb), 0.05)); border: 1px solid var(--border-subtle);"></div>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-sm);">
        <div style="border-radius: var(--radius-md); background: var(--surface-overlay);"></div>
        <div style="border-radius: var(--radius-md); background: var(--surface-overlay);"></div>
      </div>
    </div>
  </div>
  <arc-hotspot x="13" y="46" label="Workspaces">
    Switch between projects without losing your place. Every workspace keeps its own layout.
  </arc-hotspot>
  <arc-hotspot x="62" y="42" label="Live charts">
    Each chart covers the last 30 days. Hover a line to see daily values.
  </arc-hotspot>
  <arc-hotspot x="84" y="82" label="Exports">
    Download any panel as a CSV file or a PNG image.
  </arc-hotspot>
</arc-image-hotspots>`,
  previewLayout: 'center',
  previewHeight: '420px',

  subComponents: [
    {
      name: 'Hotspot',
      tag: 'arc-hotspot',
      description:
        'One pin inside Image Hotspots. `x` and `y` position it as percentages of the image, `label` names it, and its children become the popover body.',
    },
  ],

  tabs: [
    {
      label: 'Web Component',
      lang: 'html',
      code: `<arc-image-hotspots>
  <img src="/screenshots/dashboard.png" alt="Analytics dashboard" />
  <arc-hotspot x="18" y="30" label="Navigation">
    Jump between reports, alerts, and settings from one rail.
  </arc-hotspot>
  <arc-hotspot x="60" y="45" label="Live charts">
    Metrics stream in real time — no refresh required.
  </arc-hotspot>
  <arc-hotspot x="85" y="78" label="Exports">
    Any panel exports to CSV, PNG, or a shared link.
  </arc-hotspot>
</arc-image-hotspots>`,
    },
    {
      label: 'React',
      lang: 'tsx',
      code: `import { ImageHotspots, Hotspot } from '@arclux/arc-ui-react';

export default function FeatureTour() {
  return (
    <ImageHotspots onArcOpen={(e) => console.log('opened', e.detail.value)}>
      <img src="/screenshots/dashboard.png" alt="Analytics dashboard" />
      <Hotspot x={18} y={30} label="Navigation">
        Jump between reports, alerts, and settings from one rail.
      </Hotspot>
      <Hotspot x={60} y={45} label="Live charts">
        Metrics stream in real time — no refresh required.
      </Hotspot>
      <Hotspot x={85} y={78} label="Exports">
        Any panel exports to CSV, PNG, or a shared link.
      </Hotspot>
    </ImageHotspots>
  );
}`,
    },
    {
      label: 'Vue',
      lang: 'html',
      code: `<script setup>
import { ImageHotspots, Hotspot } from '@arclux/arc-ui-vue';
</script>

<template>
  <ImageHotspots>
    <img src="/screenshots/dashboard.png" alt="Analytics dashboard" />
    <Hotspot :x="18" :y="30" label="Navigation">
      Jump between reports, alerts, and settings from one rail.
    </Hotspot>
    <Hotspot :x="60" :y="45" label="Live charts">
      Metrics stream in real time — no refresh required.
    </Hotspot>
    <Hotspot :x="85" :y="78" label="Exports">
      Any panel exports to CSV, PNG, or a shared link.
    </Hotspot>
  </ImageHotspots>
</template>`,
    },
    {
      label: 'Svelte',
      lang: 'html',
      code: `<script>
  import { ImageHotspots, Hotspot } from '@arclux/arc-ui-svelte';
</script>

<ImageHotspots>
  <img src="/screenshots/dashboard.png" alt="Analytics dashboard" />
  <Hotspot x={18} y={30} label="Navigation">
    Jump between reports, alerts, and settings from one rail.
  </Hotspot>
  <Hotspot x={60} y={45} label="Live charts">
    Metrics stream in real time — no refresh required.
  </Hotspot>
  <Hotspot x={85} y={78} label="Exports">
    Any panel exports to CSV, PNG, or a shared link.
  </Hotspot>
</ImageHotspots>`,
    },
    {
      label: 'Angular',
      lang: 'ts',
      code: `import { Component } from '@angular/core';
import { ImageHotspots, Hotspot } from '@arclux/arc-ui-angular';

@Component({
  imports: [ImageHotspots, Hotspot],
  template: \`
    <arc-image-hotspots>
      <img src="/screenshots/dashboard.png" alt="Analytics dashboard" />
      <arc-hotspot x="18" y="30" label="Navigation">
        Jump between reports, alerts, and settings from one rail.
      </arc-hotspot>
      <arc-hotspot x="60" y="45" label="Live charts">
        Metrics stream in real time — no refresh required.
      </arc-hotspot>
      <arc-hotspot x="85" y="78" label="Exports">
        Any panel exports to CSV, PNG, or a shared link.
      </arc-hotspot>
    </arc-image-hotspots>
  \`,
})
export class FeatureTourComponent {}`,
    },
    {
      label: 'Solid',
      lang: 'tsx',
      code: `import { ImageHotspots, Hotspot } from '@arclux/arc-ui-solid';

export default function FeatureTour() {
  return (
    <ImageHotspots>
      <img src="/screenshots/dashboard.png" alt="Analytics dashboard" />
      <Hotspot x={18} y={30} label="Navigation">
        Jump between reports, alerts, and settings from one rail.
      </Hotspot>
      <Hotspot x={60} y={45} label="Live charts">
        Metrics stream in real time — no refresh required.
      </Hotspot>
      <Hotspot x={85} y={78} label="Exports">
        Any panel exports to CSV, PNG, or a shared link.
      </Hotspot>
    </ImageHotspots>
  );
}`,
    },
    {
      label: 'Preact',
      lang: 'tsx',
      code: `import { ImageHotspots, Hotspot } from '@arclux/arc-ui-preact';

export default function FeatureTour() {
  return (
    <ImageHotspots>
      <img src="/screenshots/dashboard.png" alt="Analytics dashboard" />
      <Hotspot x={18} y={30} label="Navigation">
        Jump between reports, alerts, and settings from one rail.
      </Hotspot>
      <Hotspot x={60} y={45} label="Live charts">
        Metrics stream in real time — no refresh required.
      </Hotspot>
      <Hotspot x={85} y={78} label="Exports">
        Any panel exports to CSV, PNG, or a shared link.
      </Hotspot>
    </ImageHotspots>
  );
}`,
    },
  ],

  seeAlso: ['popover', 'tooltip', 'image', 'hotspot'],
};
