import type { ComponentDef } from './_types';

export const video: ComponentDef = {
  name: 'Video',
  slug: 'video',
  tag: 'arc-video',
  tier: 'content',
  interactivity: 'interactive',
  description:
    'Video player with a glowing play button on the poster and a small set of custom controls over the native video element.',
  searchKeywords: ['player', 'media', 'movie', 'playback', 'mp4'],

  overview: `Video wraps the native \`<video>\` element in ARC UI's own controls. Before the first play it shows the poster with a large, glowing play button. Once playback starts, a floating control bar takes over with play/pause, a monospace time readout, a scrub bar that seeks where you click, a mute toggle and a fullscreen button. After two seconds without input the bar dims, but it stays visible and clickable. It returns to full strength when the pointer is over the player or a control has focus. Under reduced motion the fade is instant, but the bar still dims.

When the player has focus, Space or K plays and pauses, the arrow keys seek five seconds back or forward, M mutes and F toggles fullscreen. \`arc-play\`, \`arc-pause\` and \`arc-ended\` fire on each change, with the current time in seconds on \`detail.value\`.

It takes a single \`src\`, with no \`<source>\` list for multiple formats. Serve one format your target browsers all play, such as H.264/MP4, or use the native element when you need format negotiation or adaptive streaming. For ambient or presentation video, set \`controls="false"\` and pair \`autoplay\` with \`muted\`. Browsers only honor autoplay for muted video, and when autoplay is blocked the play button stays up.`,

  features: [
    '`preload` is passed to the native element and defaults to `metadata`',
    'The fullscreen button does nothing where the Fullscreen API isn\'t available',
  ],

  guidelines: {
    do: [
      'Set a `label`. It names the player region and the play button for screen readers',
      'Set a `poster` so the frame before playback shows content, not an empty box',
      'Use `controls="false"` with `autoplay`, `muted` and `loop` for an ambient background video',
    ],
    dont: [
      'Don\'t use it for a still frame. Use arc-image for anything that doesn\'t play',
      'Don\'t use it to page through a set of clips or mixed media. Use arc-carousel',
      'Don\'t leave ambient video unmuted. With `controls="false"` the reader has no way to turn the sound off',
    ],
  },

  previewHtml: `<div style="max-width: 560px; width: 100%;">
  <arc-video
    src="https://mdn.github.io/shared-assets/videos/flower.mp4"
    poster="/demo/video-poster-800x450.jpg"
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
