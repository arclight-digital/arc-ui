import type { ComponentDef } from './_types';

export const slider: ComponentDef = {
    name: 'Slider',
    slug: 'slider',
    tag: 'arc-slider',
    tier: 'input',
    interactivity: 'hybrid',
    description: 'Range input slider with a label, live numeric value display, accent-primary fill track, and customisable min/max/step.',

    overview: `Slider provides a familiar range input for selecting a numeric value within a defined range. When a \`label\` is provided, the component renders a header row with the label on the left and the current numeric value on the right in monospace font, giving users immediate feedback as they drag the thumb. The track uses a gradient fill from accent-primary to the default border colour, visually indicating the selected proportion.

The component wraps a native \`<input type="range">\` element, ensuring built-in browser accessibility including keyboard control (arrow keys for stepping) and screen reader announcement of the current value via \`aria-valuenow\`, \`aria-valuemin\`, and \`aria-valuemax\`. The \`step\` prop controls the increment granularity, making it suitable for both coarse controls (volume 0-100) and fine-grained settings (opacity 0.00-1.00).

Slider fires \`arc-input\` on every movement for real-time UI updates and \`arc-change\` when the user releases the thumb, mirroring the native input/change event distinction. The thumb scales up and gains a blue glow on hover or focus, providing clear interactive feedback consistent with ARC UI's design language.`,

    features: [
      'Visual fill track using a CSS gradient from accent-primary to the border colour, proportional to the current value',
      'Header row displaying the label and current numeric value in monospace font when `label` is set',
      'Configurable `min`, `max`, and `step` props for precise range and increment control',
      'Thumb hover and focus effects with scale-up and accent-primary glow shadow',
      'Native keyboard support via arrow keys, Page Up/Down, and Home/End from the underlying range input',
      'Dual events: `arc-input` fires continuously during drag, `arc-change` fires on release',
      'Full ARIA value attributes: `aria-valuenow`, `aria-valuemin`, `aria-valuemax`, and `aria-label`',
      'Disabled state at 40% opacity with pointer events blocked',
    ],

    guidelines: {
      do: [
        'Provide a `label` so users can see both the purpose and the current value at a glance',
        'Choose a `step` that matches your data precision -- use 1 for integers, 0.01 for percentages',
        'Use `arc-input` for real-time preview (e.g. adjusting a visual property) and `arc-change` for committing the final value',
        'Set meaningful `min` and `max` values that reflect the actual valid range for your use case',
        'Place Slider in a container wide enough for comfortable thumb dragging -- at least 200px',
      ],
      dont: [
        'Do not use Slider for exact numeric entry where the user needs to type a specific number -- use Input with `type="number"` instead',
        'Do not set a `step` so small that the slider has thousands of positions -- it becomes imprecise with mouse input',
        'Do not omit `label` when the slider is standalone -- without context the value readout is meaningless',
        'Do not use Slider for binary on/off choices -- use Toggle instead',
        'Avoid placing multiple sliders in a narrow column without sufficient vertical spacing between them',
      ],
    },

    previewHtml: `<div style="width:100%; max-width:400px;">
  <arc-slider label="Opacity" value="75" min="0" max="100" step="1"></arc-slider>
</div>`,

    props: [
      { name: 'value', type: 'number', default: '0', description: 'Current slider value. Reflected as an attribute and updated on user interaction.' },
      { name: 'min', type: 'number', default: '0', description: 'Minimum allowed value at the left edge of the track.' },
      { name: 'max', type: 'number', default: '100', description: 'Maximum allowed value at the right edge of the track.' },
      { name: 'step', type: 'number', default: '1', description: 'Increment granularity. The value snaps to multiples of this number.' },
      { name: 'label', type: 'string', default: "''", description: 'Label text displayed above the slider with the current value shown on the right.' },
      { name: 'disabled', type: 'boolean', default: 'false', description: 'Disables interaction, reducing opacity to 40% and blocking pointer events.' },
    ],
    events: [
      { name: 'arc-input', description: 'Fired continuously as the user drags the thumb. Use for real-time preview updates like adjusting opacity, volume, or a CSS property live.' },
      { name: 'arc-change', description: 'Fired once when the user releases the thumb, indicating the final committed value. Use for persisting the value to a database or triggering an expensive operation.' },
    ],
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
      <Slider label="Playback Speed" [value]="speed" [min]="0.25" [max]="3" [step]="0.25"
        (arc-input)="speed = $event.detail.value"></Slider>

      <Slider label="Seek" [value]="position" [min]="0" [max]="duration"
        (arc-input)="onSeek($event.detail.value)"
        (arc-change)="onSeekCommit($event.detail.value)"></Slider>

      <Slider label="Volume" [value]="volume" [min]="0" [max]="100"
        (arc-change)="volume = $event.detail.value"></Slider>
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
    ],
  
  seeAlso: ["number-input","input","rating"],
};
