import type { ComponentDef } from './_types';

export const waveform: ComponentDef = {
  name: 'Waveform',
  slug: 'waveform',
  tag: 'arc-waveform',
  tier: 'data',
  interactivity: 'hybrid',
  description:
    'Audio waveform visualization that doubles as a scrubber. Renders a consumer-computed peaks array as an SVG waveform with an accent played region and glowing playhead, and becomes a full seek control when interactive.',
  searchKeywords: ['audio', 'scrubber', 'seek', 'peaks', 'player', 'sound', 'playhead'],

  overview: `Waveform draws an audio clip's shape from an array of peak amplitudes (one number per bar, 0 to 1) and marks playback progress on it. The played region is in the accent color with a soft glow, the unplayed region is muted, and a thin glowing playhead sits at the current position. Set \`interactive\` and the same element becomes a scrubber, with pointer dragging, keyboard seeking and slider semantics for assistive technology. \`variant="bars"\` draws one bar per peak, centered on the middle line, and \`mirror\` draws a filled min/max envelope.

The component doesn't load, decode or play audio. You compute the peaks however you like (from a decoded buffer, a server-side analysis pass or a cached sidecar file) and pass them as the \`peaks\` property. The SVG depends only on its props, so it renders on the server.

\`position\` is a fraction of the total (0 to 1), not seconds. If your player thinks in seconds, divide by the duration on the way in and multiply on the way out. With \`duration\` set, the \`time\` field on both event details does the multiplying for you, a monospace time readout appears below the track, and screen readers hear elapsed and total time instead of a percentage.

While the reader scrubs, \`arc-input\` fires on every pointer move with the live position, and \`arc-change\` fires once on release with the final one, as with ARC UI's other inputs. Seek your audio source on \`arc-change\`, and use \`arc-input\` for live feedback such as a time display or audible scrubbing.`,

  features: [
    'Keyboard seeking with the arrow keys, PageUp and PageDown, and Home and End',
    '`steps` divides the track into discrete frames, and the arrow keys move one step',
    '`value-text` replaces the screen reader wording with your own',
    'A slider when interactive, and a labeled image otherwise',
    'Scales with its SVG viewBox, so it fits any width without measuring',
    'Empty or missing peaks render an empty track, not an error',
  ],

  guidelines: {
    do: [
      'Compute peaks once per clip and cache them. A few dozen to a few hundred values is plenty, and each is clamped to 0 to 1',
      'Set `duration` whenever you know it',
      'Give every waveform a `label`. It names the slider, or describes the image when the waveform isn\'t interactive',
      'Use `bars` for scrubbers and player UI, and `mirror` for dense timeline lanes where separate bars would shimmer',
      'Set the height with `--waveform-height` when the default doesn\'t suit its row',
    ],
    dont: [
      'Don\'t use it for general trend data. Use Sparkline. The mirrored geometry distorts ordinary series',
      'Don\'t use it as a level indicator or progress bar. Meter shows one current value against a range',
      'Don\'t feed it raw sample data. Downsample to peaks first. In `bars`, every peak is its own SVG element',
      'Don\'t seek your audio source on `arc-input`. It fires on every pointer move',
    ],
  },

  previewHtml: `<div style="display: flex; flex-direction: column; gap: 28px; width: min(560px, 100%);">
  <div style="display: flex; flex-direction: column; gap: 8px;">
    <arc-waveform id="wf-scrub-demo" variant="bars" interactive duration="32" label="Rendered preview"></arc-waveform>
    <span style="font-size: 12px; color: var(--text-muted);">Bars, interactive. Drag or use the arrow keys to seek</span>
  </div>
  <div style="display: flex; flex-direction: column; gap: 8px;">
    <arc-waveform id="wf-mirror-demo" variant="mirror" position="0.35" duration="12" label="Sample preview" style="--waveform-height: 36px;"></arc-waveform>
    <span style="font-size: 12px; color: var(--text-muted);">Mirror envelope, static</span>
  </div>
</div>`,

  previewSetup: `{
  const scrubber = document.getElementById('wf-scrub-demo');
  const sample = document.getElementById('wf-mirror-demo');
  if (!scrubber || !sample) return;

  const peaks = [
    0.12, 0.18, 0.15, 0.22, 0.19, 0.26, 0.31, 0.24,
    0.38, 0.45, 0.42, 0.55, 0.48, 0.62, 0.58, 0.51,
    0.68, 0.75, 0.82, 0.71, 0.88, 0.79, 0.92, 0.85,
    0.96, 0.88, 0.72, 0.65, 0.78, 0.84, 0.90, 0.82,
    0.35, 0.28, 0.42, 0.31, 0.25, 0.38, 0.45, 0.33,
    0.58, 0.66, 0.74, 0.81, 0.90, 0.85, 0.95, 1.00,
    0.92, 0.86, 0.78, 0.83, 0.75, 0.68, 0.60, 0.52,
    0.45, 0.38, 0.30, 0.24, 0.18, 0.14, 0.10, 0.07,
  ];
  scrubber.peaks = peaks;
  sample.peaks = peaks;

  // The fake playhead is decoration; reduced motion gets a still frame.
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    scrubber.position = 0.4;
    return;
  }

  // Advance the playhead in real time against the declared 32s duration,
  // pausing while the user scrubs so the demo never fights the hand.
  let scrubbing = false;
  scrubber.addEventListener('arc-input', () => { scrubbing = true; });
  scrubber.addEventListener('arc-change', () => { scrubbing = false; });

  let last = performance.now();
  const step = (now) => {
    if (!scrubber.isConnected) return;
    const dt = (now - last) / 1000;
    last = now;
    if (!scrubbing) scrubber.position = (scrubber.position + dt / 32) % 1;
    requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}`,

  tabs: [
    {
      label: 'Web Component',
      lang: 'html',
      code: `<script type="module" src="@arclux/arc-ui"></script>

<!-- Interactive scrubber with time readouts -->
<arc-waveform id="scrubber" interactive duration="212" label="Track position"></arc-waveform>

<!-- Static clip preview, mirror envelope -->
<arc-waveform id="clip" variant="mirror" position="0.6" label="Vocal take"></arc-waveform>

<script type="module">
  const scrubber = document.getElementById('scrubber');

  // Peaks are a property, not an attribute — you compute them (0..1 per bar).
  scrubber.peaks = await fetchPeaks('track-7');

  scrubber.addEventListener('arc-input', (e) => {
    // Live position while dragging: e.detail.value is 0..1,
    // e.detail.time is seconds because duration is set.
    timeDisplay.textContent = format(e.detail.time);
  });
  scrubber.addEventListener('arc-change', (e) => {
    audio.currentTime = e.detail.time; // seek once, on release
  });

  // Follow playback
  audio.addEventListener('timeupdate', () => {
    scrubber.position = audio.currentTime / audio.duration;
  });
</script>`,
    },
    {
      label: 'React',
      lang: 'tsx',
      code: `import { Waveform } from '@arclux/arc-ui-react';

export function TrackScrubber({ peaks, audio }: { peaks: number[]; audio: HTMLAudioElement }) {
  return (
    <Waveform
      peaks={peaks}
      duration={audio.duration}
      position={audio.currentTime / audio.duration}
      interactive
      label="Track position"
      onArcInput={(e) => console.log('Live:', e.detail.time)}
      onArcChange={(e) => { audio.currentTime = e.detail.time; }}
    />
  );
}`,
    },
    {
      label: 'Vue',
      lang: 'html',
      code: `<script setup>
import { Waveform } from '@arclux/arc-ui-vue';
import { ref } from 'vue';

const peaks = ref([0.2, 0.5, 0.9, 0.4, 0.7, 0.3, 0.8]);
const position = ref(0);
</script>

<template>
  <Waveform
    :peaks="peaks"
    :position="position"
    :duration="212"
    interactive
    label="Track position"
    @arc-input="(e) => console.log('Live:', e.detail.time)"
    @arc-change="(e) => seek(e.detail.time)"
  />
</template>`,
    },
    {
      label: 'Svelte',
      lang: 'html',
      code: `<script>
  import { Waveform } from '@arclux/arc-ui-svelte';

  let peaks = [0.2, 0.5, 0.9, 0.4, 0.7, 0.3, 0.8];
  let position = 0;
</script>

<Waveform
  {peaks}
  {position}
  duration={212}
  interactive
  label="Track position"
  on:arc-input={(e) => console.log('Live:', e.detail.time)}
  on:arc-change={(e) => seek(e.detail.time)}
/>`,
    },
    {
      label: 'Angular',
      lang: 'ts',
      code: `import { Component } from '@angular/core';
import { Waveform } from '@arclux/arc-ui-angular';

@Component({
  imports: [Waveform],
  template: \`
    <arc-waveform
      [peaks]="peaks"
      [position]="position"
      duration="212"
      interactive
      label="Track position"
      (arc-input)="onScrub($event)"
      (arc-change)="onSeek($event)"
    ></arc-waveform>
  \`,
})
export class TrackScrubberComponent {
  peaks = [0.2, 0.5, 0.9, 0.4, 0.7, 0.3, 0.8];
  position = 0;

  onScrub(e: CustomEvent) { console.log('Live:', e.detail.time); }
  onSeek(e: CustomEvent) { this.position = e.detail.value; }
}`,
    },
    {
      label: 'Solid',
      lang: 'tsx',
      code: `import { Waveform } from '@arclux/arc-ui-solid';
import { createSignal } from 'solid-js';

export function TrackScrubber() {
  const [position, setPosition] = createSignal(0);
  const peaks = [0.2, 0.5, 0.9, 0.4, 0.7, 0.3, 0.8];

  return (
    <Waveform
      peaks={peaks}
      position={position()}
      duration={212}
      interactive
      label="Track position"
      onArcChange={(e) => setPosition(e.detail.value)}
    />
  );
}`,
    },
    {
      label: 'Preact',
      lang: 'tsx',
      code: `import { Waveform } from '@arclux/arc-ui-preact';
import { useState } from 'preact/hooks';

export function TrackScrubber() {
  const [position, setPosition] = useState(0);
  const peaks = [0.2, 0.5, 0.9, 0.4, 0.7, 0.3, 0.8];

  return (
    <Waveform
      peaks={peaks}
      position={position}
      duration={212}
      interactive
      label="Track position"
      onArcChange={(e) => setPosition(e.detail.value)}
    />
  );
}`,
    },
  ],

  seeAlso: ['sparkline', 'meter', 'slider'],
};
