import type { ComponentDef } from './_types';

export const video: ComponentDef = {
  name: 'Video',
  slug: 'video',
  tag: 'arc-video',
  tier: 'content',
  interactivity: 'interactive',
  description:
    'House-styled video player with a glowing poster play overlay and minimal custom controls over the native video element.',
  searchKeywords: ['player', 'media', 'movie', 'playback', 'mp4'],

  overview: `Video wraps the native \`<video>\` element in the house player chrome. Before the first play it shows the poster with a large, glowing play button; once playback starts, a minimal floating control bar takes over — play/pause, a monospace time readout, a scrub bar that seeks directly, a mute toggle, and a fullscreen button. During playback the bar dims after two seconds of idle rather than disappearing — it stays legible and clickable, so the controls never have to be summoned — and comes back to full strength whenever the pointer is over the player or a control takes focus. Under reduced motion the transition is suppressed; the dimming is not.

The player answers to the standard keyboard map when focused: Space or K toggles playback, the arrow keys seek five seconds in either direction, M toggles mute, and F toggles fullscreen. Every state change surfaces as a house event — \`arc-play\`, \`arc-pause\`, and \`arc-ended\`, each carrying the current time in seconds on \`detail.value\`.

The component takes a single \`src\` — there is no \`<source>\` fallback chain for multiple formats. Serve one broadly supported encoding (H.264/MP4 plays everywhere), or drop down to the native element when you need format negotiation or adaptive streaming. For ambient or presentation video, set \`controls="false"\` and pair \`autoplay\` with \`muted\` — browsers only honor autoplay for muted video, and when autoplay is blocked the play overlay simply remains.`,

  features: [
    'Poster state with a large centered play button carrying the house glow',
    'Floating control bar: play/pause, monospace time readout, direct-seek scrub bar, mute, fullscreen',
    'Controls dim after two seconds of idle playback and return to full strength on hover or focus; never hidden outright',
    'Standard player keys on the focused player: Space/K, arrow-key seeking, M, F',
    'House events with the current time on `detail.value`: `arc-play`, `arc-pause`, `arc-ended`',
    '`controls="false"` ambient mode for presentation and background video',
    'Native `preload` passthrough, defaulting to `metadata`',
    'Fullscreen is feature-detected — a quiet no-op where the API is unavailable',
  ],

  guidelines: {
    do: [
      'Provide a `label` — it names the player region for screen readers and the overlay play button',
      'Set a `poster` so the pre-play frame shows content instead of an empty surface',
      'Pair `autoplay` with `muted`; browsers block unmuted autoplay',
      'Use `controls="false"` with `autoplay`, `muted`, and `loop` for ambient background video',
      'Serve a single broadly supported format such as H.264/MP4',
    ],
    dont: [
      'Do not use arc-video for a still frame — use arc-image for anything that does not play',
      'Do not use it to page through a set of clips or mixed media — arc-carousel handles sequenced content',
      'Do not rely on multiple `<source>` formats — the component takes exactly one `src`',
      'Do not leave ambient video unmuted; sound without a visible control is hostile',
    ],
  },

  previewHtml: `<div style="max-width: 560px; width: 100%;">
  <arc-video
    src="https://mdn.github.io/shared-assets/videos/flower.mp4"
    poster="https://picsum.photos/800/450?random=41"
    label="Flower demo clip"
  ></arc-video>
</div>`,
  previewLayout: 'center',

  tabs: [
    {
      label: 'Web Component',
      lang: 'html',
      code: `<arc-video
  src="/media/launch-recap.mp4"
  poster="/media/launch-recap.jpg"
  label="Launch recap"
></arc-video>

<!-- Ambient background video: no controls, muted autoplay loop -->
<arc-video
  src="/media/hero-loop.mp4"
  controls="false"
  autoplay
  muted
  loop
></arc-video>`,
    },
    {
      label: 'React',
      lang: 'tsx',
      code: `import { Video } from '@arclux/arc-ui-react';

export default function Example() {
  return (
    <Video
      src="/media/launch-recap.mp4"
      poster="/media/launch-recap.jpg"
      label="Launch recap"
      onArcPlay={(e) => console.log('started at', e.detail.value)}
    />
  );
}`,
    },
    {
      label: 'Vue',
      lang: 'html',
      code: `<script setup>
import { Video } from '@arclux/arc-ui-vue';
</script>

<template>
  <Video
    src="/media/launch-recap.mp4"
    poster="/media/launch-recap.jpg"
    label="Launch recap"
  />
</template>`,
    },
    {
      label: 'Svelte',
      lang: 'html',
      code: `<script>
  import { Video } from '@arclux/arc-ui-svelte';
</script>

<Video
  src="/media/launch-recap.mp4"
  poster="/media/launch-recap.jpg"
  label="Launch recap"
/>`,
    },
    {
      label: 'Angular',
      lang: 'ts',
      code: `import { Component } from '@angular/core';
import { Video } from '@arclux/arc-ui-angular';

@Component({
  imports: [Video],
  template: \`
    <arc-video
      src="/media/launch-recap.mp4"
      poster="/media/launch-recap.jpg"
      label="Launch recap"
    />
  \`,
})
export class MediaComponent {}`,
    },
    {
      label: 'Solid',
      lang: 'tsx',
      code: `import { Video } from '@arclux/arc-ui-solid';

export default function Example() {
  return (
    <Video
      src="/media/launch-recap.mp4"
      poster="/media/launch-recap.jpg"
      label="Launch recap"
    />
  );
}`,
    },
    {
      label: 'Preact',
      lang: 'tsx',
      code: `import { Video } from '@arclux/arc-ui-preact';

export default function Example() {
  return (
    <Video
      src="/media/launch-recap.mp4"
      poster="/media/launch-recap.jpg"
      label="Launch recap"
    />
  );
}`,
    },
  ],

  seeAlso: ['image', 'carousel', 'aspect-ratio', 'waveform'],
};
