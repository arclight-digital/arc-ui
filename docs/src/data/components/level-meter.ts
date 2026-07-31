import type { ComponentDef } from './_types';

export const levelMeter: ComponentDef = {
  name: 'Level Meter',
  slug: 'level-meter',
  tag: 'arc-level-meter',
  tier: 'data',
  interactivity: 'static',
  description:
    'Segmented audio level meter with peak-hold. Zone-tinted segments light in proportion to a live value, with a decaying peak line — the live vertical sibling of Meter.',
  searchKeywords: ['audio', 'vu', 'ppm', 'peak', 'rms', 'db', 'volume', 'signal'],

  overview: `LevelMeter is built for values that move at signal rate — audio levels first, but equally buffer fill, network throughput, or any telemetry that updates many times a second. It renders a track of discrete segments (twenty by default) that light up in proportion to \`value\`, each tinted by the zone it occupies: success below the \`warn\` threshold, warning between \`warn\` and \`clip\`, error above \`clip\`. Lit segments carry the house glow; unlit ones show a faint preview of their zone so the scale reads even at silence. Set \`segments="0"\` for a continuous, unsegmented bar.

The value maps linearly between \`min\` and \`max\`, which default to 0 and 1. For dB metering set the range directly — \`min="-60" max="0"\` — and feed dB readings as \`value\`. The \`warn\` and \`clip\` thresholds are always fractions of the range (0.75 and 0.9 by default), so the same zone geometry works for linear and dB scales alike.

A thin peak-hold line rides above the signal. Left alone, the component tracks its own peak from incoming values, holds it for a beat, then decays it toward the current level on an animation frame loop — and under \`prefers-reduced-motion\` the decay becomes a jump rather than a slide. If your audio engine already computes peaks, set the \`peak\` property and the line renders exactly there with no tracking of its own.

One element is one channel, deliberately: there is no stereo mode. Compose two meters side by side for a stereo pair — channel count stays the consumer's decision, and layouts from mono to 7.1 fall out of ordinary flex composition rather than a prop fork. The component renders no visible text, so the \`label\` attribute is the accessible name; \`role="meter"\` with \`aria-valuemin\`, \`aria-valuemax\`, and \`aria-valuenow\` carries the reading itself.`,

  features: [
    'Segmented display with proportional lighting — segment count configurable, `segments="0"` for a continuous bar',
    'Three-zone tinting from `warn` and `clip` fractions: success, warning, and error via the `--color-*` tokens, glow on lit segments',
    'Peak-hold line that tracks incoming values, holds, then decays — or renders a consumer-supplied `peak` exactly',
    'Linear or dB scales through plain `min`/`max` — thresholds stay fractions of the range either way',
    'Vertical (default, bottom-up) and horizontal orientations using logical properties, so horizontal meters follow text direction',
    'Peak decay runs on `requestAnimationFrame`, starts on connect, and stops on disconnect — no work while unmounted',
    'Honours `prefers-reduced-motion`: the peak line jumps instead of animating its fall',
    'Semantic `role="meter"` with `aria-valuemin`, `aria-valuemax`, `aria-valuenow`, and a `label`-driven accessible name',
    'One meter per channel by design — stereo and surround are composition, not configuration',
    'Exposed CSS parts: meter, track, segment, fill, peak',
  ],

  guidelines: {
    do: [
      'Use LevelMeter for live, fast-moving readings — audio channels, input gain, buffer health — where Meter would flicker meaninglessly',
      'Set `min="-60" max="0"` (or your headroom of choice) and feed dB values directly for audio work',
      'Compose one meter per channel: two side by side for stereo, a row of them for a mixer',
      'Give every meter a `label` naming its channel ("Master left", not "Level") — it is the only accessible name the component gets',
      'Set the `peak` property from your audio engine when it already computes peak values; the built-in tracker is for when it does not',
      'Tune `warn` and `clip` to your actual headroom — the defaults (0.75/0.9) suit a linear 0..1 signal',
    ],
    dont: [
      'Do not use LevelMeter for a static scalar like disk usage or a score — that is Meter, whose low/high/optimum semantics exist for exactly that',
      'Do not use it for task completion — Progress owns determinate and indeterminate work tracking',
      'Do not look for a stereo prop; two elements are the stereo pair',
      'Do not drive `value` from slow polling and expect the peak line to mean much — the tracker is only as live as the data feeding it',
      'Do not rely on segment color alone to signal clipping to users — pair the meter with a clip indicator or text where it matters',
    ],
  },

  previewHtml: `<div style="display:flex; flex-direction:column; align-items:center; gap:var(--space-lg);">
  <div style="display:flex; gap:var(--space-xs);">
    <arc-level-meter label="Left channel" value="0.05" style="block-size:180px;"></arc-level-meter>
    <arc-level-meter label="Right channel" value="0.05" style="block-size:180px;"></arc-level-meter>
  </div>
  <arc-level-meter orientation="horizontal" segments="0" label="Master bus" value="0.05" style="inline-size:220px;"></arc-level-meter>
</div>`,

  previewSetup: `{
  const meters = el.querySelectorAll('arc-level-meter');
  if (!meters.length) return;

  // A frozen but representative frame for reduced motion.
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const held = [0.68, 0.74, 0.71];
    meters.forEach((m, i) => { m.value = held[i] ?? 0.7; m.peak = (held[i] ?? 0.7) + 0.18; });
    return;
  }

  // Fake program material: a shared envelope, per-channel drift, rare bursts.
  let t = 0;
  const tick = () => {
    if (!el.isConnected) return;
    t += 0.045;
    const envelope = 0.5 + 0.22 * Math.sin(t) * Math.sin(t * 0.31);
    meters.forEach((m, i) => {
      const drift = 0.08 * Math.sin(t * (1.7 + i * 0.23) + i * 2.1);
      const burst = Math.random() < 0.008 ? 0.3 : 0;
      const noise = (Math.random() - 0.5) * 0.06;
      m.value = Math.min(1, Math.max(0.04, envelope + drift + burst + noise));
    });
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}`,

  tabs: [
    {
      label: 'Web Component',
      lang: 'html',
      code: `<!-- Stereo pair: one meter per channel -->
<div style="display: flex; gap: 4px;">
  <arc-level-meter id="ch-l" label="Master left" min="-60" max="0" value="-60"></arc-level-meter>
  <arc-level-meter id="ch-r" label="Master right" min="-60" max="0" value="-60"></arc-level-meter>
</div>

<script>
  // Drive it at signal rate; the meter tracks its own decaying peak.
  analyser.onLevels = ({ left, right }) => {
    document.getElementById('ch-l').value = left;  // dB
    document.getElementById('ch-r').value = right;
  };
</script>`,
    },
    {
      label: 'React',
      lang: 'tsx',
      code: `import { LevelMeter } from '@arclux/arc-ui-react';

export default function MasterMeters({ left, right }: { left: number; right: number }) {
  return (
    <div style={{ display: 'flex', gap: 4 }}>
      <LevelMeter label="Master left" min={-60} max={0} value={left} />
      <LevelMeter label="Master right" min={-60} max={0} value={right} />
    </div>
  );
}`,
    },
    {
      label: 'Vue',
      lang: 'html',
      code: `<script setup>
import { LevelMeter } from '@arclux/arc-ui-vue';

defineProps({ left: Number, right: Number });
</script>

<template>
  <div style="display: flex; gap: 4px;">
    <LevelMeter label="Master left" :min="-60" :max="0" :value="left" />
    <LevelMeter label="Master right" :min="-60" :max="0" :value="right" />
  </div>
</template>`,
    },
    {
      label: 'Svelte',
      lang: 'html',
      code: `<script>
  import { LevelMeter } from '@arclux/arc-ui-svelte';

  let { left, right } = $props();
</script>

<div style="display: flex; gap: 4px;">
  <LevelMeter label="Master left" min={-60} max={0} value={left} />
  <LevelMeter label="Master right" min={-60} max={0} value={right} />
</div>`,
    },
    {
      label: 'Angular',
      lang: 'ts',
      code: `import { Component, Input } from '@angular/core';
import { LevelMeter } from '@arclux/arc-ui-angular';

@Component({
  imports: [LevelMeter],
  template: \`
    <div style="display: flex; gap: 4px;">
      <arc-level-meter label="Master left" [min]="-60" [max]="0" [value]="left"></arc-level-meter>
      <arc-level-meter label="Master right" [min]="-60" [max]="0" [value]="right"></arc-level-meter>
    </div>
  \`,
})
export class MasterMeters {
  @Input() left = -60;
  @Input() right = -60;
}`,
    },
    {
      label: 'Solid',
      lang: 'tsx',
      code: `import { LevelMeter } from '@arclux/arc-ui-solid';

export default function MasterMeters(props: { left: number; right: number }) {
  return (
    <div style={{ display: 'flex', gap: '4px' }}>
      <LevelMeter label="Master left" min={-60} max={0} value={props.left} />
      <LevelMeter label="Master right" min={-60} max={0} value={props.right} />
    </div>
  );
}`,
    },
    {
      label: 'Preact',
      lang: 'tsx',
      code: `import { LevelMeter } from '@arclux/arc-ui-preact';

export default function MasterMeters({ left, right }: { left: number; right: number }) {
  return (
    <div style={{ display: 'flex', gap: 4 }}>
      <LevelMeter label="Master left" min={-60} max={0} value={left} />
      <LevelMeter label="Master right" min={-60} max={0} value={right} />
    </div>
  );
}`,
    },
  ],

  seeAlso: ['meter', 'progress', 'sparkline'],
};
