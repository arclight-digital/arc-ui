import type { ComponentDef } from './_types';

export const imageHotspots: ComponentDef = {
  name: 'Image Hotspots',
  slug: 'image-hotspots',
  tag: 'arc-image-hotspots',
  tier: 'content',
  interactivity: 'interactive',
  description:
    'An annotated image with glowing pin markers, each opening a small popover of detail content. Built for product-feature callouts, annotated screenshots, and simple maps.',
  searchKeywords: ['annotation', 'pin', 'marker', 'callout', 'map', 'screenshot'],

  overview: `Image Hotspots lays glowing pins over a picture and gives each pin a popover. Slot the image and the \`<arc-hotspot>\` children together — every pin positions itself from its own x and y attributes, given as percentages of the image, so source order never matters and the markup stays a flat list of facts about the picture.

Each pin is a real button: keyboard-focusable, labeled for screen readers, and carrying \`aria-expanded\` popover semantics. Clicking or activating a pin opens its popover anchored above the pin, flipping to fit near viewport edges. The parent keeps one popover open at a time, and an open popover closes on Escape, on a click anywhere else, or on a second click of its pin.

The pins render server-side at their coordinates because positioning is pure CSS derived from attributes; only the popover interaction needs JavaScript. Every hotspot reports its activity through \`arc-open\` and \`arc-close\` events that bubble to the parent, with \`detail.value\` carrying the hotspot's label — or its index when no label is set.`,

  features: [
    'Percentage-based pin coordinates — responsive by construction, no measuring',
    'Pulsing accent pins with a glow that rises on hover and focus',
    'One popover open at a time, coordinated by the parent',
    'Escape and outside-click both dismiss the open popover',
    'Popovers flip and shift to stay inside the viewport',
    'Pins are real buttons: focusable, labeled, `aria-expanded` state',
    '`arc-open` / `arc-close` events with `detail.value` naming the hotspot',
    'Pins server-render at their positions; popovers stay closed without JS',
    'Ambient pulse is suppressed under `prefers-reduced-motion`',
  ],

  guidelines: {
    do: [
      'Give every hotspot a label — it names the pin for screen readers, heads the popover, and identifies the hotspot in events',
      'Keep popover content to a sentence or two; link out for anything longer',
      'Place pins on the feature they describe, not beside it — coordinates are the whole message',
      'Use a handful of pins per image; three to six is the comfortable range',
      'Constrain the component to a readable width so pin targets stay comfortably apart',
    ],
    dont: [
      "Do not crowd pins so close together that their popovers cover each other's targets",
      'Do not put critical information only in a popover — undiscovered pins go unread',
      "Do not use Image Hotspots for step-by-step onboarding — that is Guided Tour's job",
      'Do not rely on pixel positions in your head; x and y are percentages of the image box',
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
    Switch between projects without losing your place — every workspace keeps its own layout.
  </arc-hotspot>
  <arc-hotspot x="62" y="42" label="Live charts">
    Metrics stream in over WebSockets and render at 60fps, no refresh required.
  </arc-hotspot>
  <arc-hotspot x="84" y="82" label="Exports">
    Send any panel to CSV, PNG, or a shared link with one click.
  </arc-hotspot>
</arc-image-hotspots>`,
  previewLayout: 'center',
  previewHeight: '420px',

  subComponents: [
    {
      name: 'Hotspot',
      tag: 'arc-hotspot',
      description:
        'A single glowing pin inside an Image Hotspots surface. The x and y attributes position it as percentages of the image, the label names it, and slotted children become the popover body.',
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

  seeAlso: ['popover', 'tooltip', 'image', 'guided-tour'],
};
