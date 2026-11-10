import type { ComponentDef } from './_types';

export const slider: ComponentDef = {
  name: 'Slider',
  slug: 'slider',
  tag: 'arc-slider',
  tier: 'input',
  interactivity: 'hybrid',
  description:
    'A one-thumb slider for picking a number from a range, with an optional label and value readout.',

  overview: `Slider picks a number from a range by dragging a thumb, for settings like volume or opacity. For an exact number someone types, use NumberInput. With a \`label\`, a header row shows the label on the left and the current value on the right in monospace, updating as the thumb moves. The track fills with the accent color up to the thumb.

It wraps a native \`<input type="range">\`, so it keeps the browser's keyboard control (arrow keys, Page Up and Page Down, Home and End) and announces the value with \`aria-valuenow\`, \`aria-valuemin\` and \`aria-valuemax\`. \`step\` sets the increment.

\`arc-input\` fires on every movement and \`arc-change\` when the thumb is released, like the native input and change events. Use \`arc-input\` for a live preview and \`arc-change\` to save the final value.`,

  features: [
    'The thumb and track glow in the accent color on hover and focus',
    '`aria-label` is the `label`, or "Slider" when there isn\'t one',
    'Disabled drops to 50% opacity and blocks pointer events',
  ],

  guidelines: {
    do: [
      'Give it a `label`, so people see what it controls and its current value. Without one the value isn\'t shown',
      'Match `step` to your data: 1 for integers, 0.01 for fractions',
      'Set `min` and `max` to the real valid range',
      'Make it at least 200px wide so the thumb is easy to drag',
    ],
    dont: [
      'Don\'t make `step` so small that the track has thousands of positions. A mouse can\'t hit them precisely',
      'Don\'t use it for an on/off choice. Use Toggle',
      'Don\'t stack several sliders in a narrow column without vertical space between them',
    ],
  },

  previewHtml: `<div style="width:100%; max-width:400px;">
  <arc-slider label="Opacity" value="75" min="0" max="100" step="1"></arc-slider>
</div>`,

  tabs: [
    {
      label: 'Web Component',
      lang: 'html',
      code: `<script type="module" src="@arclux/arc-ui"></script>

<!-- Basic labeled slider -->
<arc-slider label="Volume" value="50" min="0" max="100"></arc-slider>

<!-- Fine-grained step for opacity -->
<arc-slider label="Opacity" value="0.8" min="0" max="1" step="0.01"></arc-slider>

<!-- Temperature range -->
<arc-slider label="Color Temperature" value="4500" min="2700" max="6500" step="100"></arc-slider>

<!-- Disabled state -->
<arc-slider label="Locked" value="30" disabled></arc-slider>

<script>
  const slider = document.querySelector('arc-slider');

  // Real-time preview while dragging
  slider.addEventListener('arc-input', (e) => {
    document.body.style.opacity = e.detail.value / 100;
  });

  // Commit final value on release
  slider.addEventListener('arc-change', (e) => {
    console.log('Final value:', e.detail.value);
  });
</script>`,
    },
    {
      label: 'React',
      lang: 'tsx',
      code: `import { Slider } from '@arclux/arc-ui-react';
import { useState } from 'react';

function VolumeControl() {
  const [volume, setVolume] = useState(50);

  return (
    <Slider
      label="Volume"
      value={volume}
      min={0}
      max={100}
      onArcInput={(e) => setVolume(e.detail.value)}
      onArcChange={(e) => saveVolume(e.detail.value)}
    />
  );
}

function ImageEditor() {
  const [opacity, setOpacity] = useState(1);
  const [blur, setBlur] = useState(0);
  const [brightness, setBrightness] = useState(100);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 400 }}>
      <Slider label="Opacity" value={opacity} min={0} max={1} step={0.01}
        onArcInput={(e) => setOpacity(e.detail.value)} />
      <Slider label="Blur" value={blur} min={0} max={20} step={0.5}
        onArcInput={(e) => setBlur(e.detail.value)} />
      <Slider label="Brightness" value={brightness} min={0} max={200}
        onArcInput={(e) => setBrightness(e.detail.value)} />
    </div>
  );
}`,
    },
    {
      label: 'Vue',
      lang: 'html',
      code: `<script setup>
import { Slider } from '@arclux/arc-ui-vue';
import { ref } from 'vue';

const fontSize = ref(16);
const lineHeight = ref(1.5);
const letterSpacing = ref(0);
</script>

<template>
  <div style="display:flex; flex-direction:column; gap:16px; max-width:400px;">
    <Slider label="Font Size" :value="fontSize" :min="10" :max="48"
      @arc-input="fontSize = $event.detail.value" />
    <Slider label="Line Height" :value="lineHeight" :min="1" :max="3" :step="0.1"
      @arc-input="lineHeight = $event.detail.value" />
    <Slider label="Letter Spacing" :value="letterSpacing" :min="-2" :max="10" :step="0.5"
      @arc-input="letterSpacing = $event.detail.value" />
  </div>

  <p :style="{ fontSize: fontSize + 'px', lineHeight, letterSpacing: letterSpacing + 'px' }">
    Preview text with live adjustments.
  </p>
</template>`,
    },
    {
      label: 'Svelte',
      lang: 'html',
      code: `<script>
  import { Slider } from '@arclux/arc-ui-svelte';

  let hue = 220;
  let saturation = 70;
  let lightness = 50;

  $: color = \`hsl(\${hue}, \${saturation}%, \${lightness}%)\`;
</script>

<div style="display:flex; flex-direction:column; gap:16px; max-width:400px;">
  <Slider label="Hue" value={hue} min={0} max={360}
    on:arc-input={(e) => hue = e.detail.value} />
  <Slider label="Saturation" value={saturation} min={0} max={100}
    on:arc-input={(e) => saturation = e.detail.value} />
  <Slider label="Lightness" value={lightness} min={0} max={100}
    on:arc-input={(e) => lightness = e.detail.value} />
</div>

<div style="width:80px; height:80px; border-radius:12px; margin-top:16px; background:{color}"></div>`,
    },
    {
      label: 'Angular',
      lang: 'ts',
      code: `import { Component } from '@angular/core';
import { Slider } from '@arclux/arc-ui-angular';

@Component({
  imports: [Slider],
  template: \`
    <div style="display:flex; flex-direction:column; gap:16px; max-width:400px;">
      <arc-slider label="Playback Speed" [value]="speed" [min]="0.25" [max]="3" [step]="0.25"
        (arc-input)="speed = $event.detail.value"></arc-slider>

      <arc-slider label="Seek" [value]="position" [min]="0" [max]="duration"
        (arc-input)="onSeek($event.detail.value)"
        (arc-change)="onSeekCommit($event.detail.value)"></arc-slider>

      <arc-slider label="Volume" [value]="volume" [min]="0" [max]="100"
        (arc-change)="volume = $event.detail.value"></arc-slider>
    </div>
  \`,
})
export class MediaPlayerComponent {
  speed = 1;
  position = 0;
  duration = 240;
  volume = 75;

  onSeek(val: number) { /* live preview seek position */ }
  onSeekCommit(val: number) { /* commit seek to player */ }
}`,
    },
    {
      label: 'Solid',
      lang: 'tsx',
      code: `import { Slider } from '@arclux/arc-ui-solid';
import { createSignal } from 'solid-js';

function PricingEstimator() {
  const [seats, setSeats] = createSignal(5);
  const pricePerSeat = 12;

  return (
    <div style={{ 'max-width': '400px' }}>
      <Slider
        label="Team Size"
        value={seats()}
        min={1}
        max={100}
        onArcInput={(e) => setSeats(e.detail.value)}
      />
      <p style={{ 'margin-top': '12px', 'font-size': '14px', color: 'var(--text-muted)' }}>
        {seats()} seats \u00d7 \${pricePerSeat}/mo = <strong>\${seats() * pricePerSeat}/mo</strong>
      </p>
    </div>
  );
}`,
    },
    {
      label: 'Preact',
      lang: 'tsx',
      code: `import { Slider } from '@arclux/arc-ui-preact';
import { useState } from 'preact/hooks';

function BorderRadiusTool() {
  const [radius, setRadius] = useState(8);
  const [padding, setPadding] = useState(16);

  return (
    <div style={{ maxWidth: 400 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Slider label="Border Radius" value={radius} min={0} max={50}
          onArcInput={(e) => setRadius(e.detail.value)} />
        <Slider label="Padding" value={padding} min={0} max={64}
          onArcInput={(e) => setPadding(e.detail.value)} />
      </div>
      <div style={{
        marginTop: 24,
        borderRadius: radius,
        padding,
        background: 'var(--bg-elevated)',
        border: '1px solid var(--border-default)',
      }}>
        Preview box
      </div>
    </div>
  );
}`,
    },
    {
      label: 'HTML',
      lang: 'html',
      code: `<!-- arc-slider is interactive — requires JS -->
<arc-slider></arc-slider>`,
    },
    {
      label: 'HTML (Inline)',
      lang: 'html',
      code: `<!-- arc-slider is interactive — requires JS -->
<arc-slider></arc-slider>`,
    },
  ],

  seeAlso: ['number-input', 'input', 'rating'],
};
