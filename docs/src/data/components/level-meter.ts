import type { ComponentDef } from './_types';

export const levelMeter: ComponentDef = {
  name: 'Level Meter',
  slug: 'level-meter',
  tag: 'arc-level-meter',
  tier: 'data',
  interactivity: 'static',
  description:
    'Segmented audio level meter with peak hold. Zone-tinted segments light in proportion to a live value, under a decaying peak line. The live, vertical counterpart to Meter.',
  searchKeywords: ['audio', 'vu', 'ppm', 'peak', 'rms', 'db', 'volume', 'signal'],

  overview: `LevelMeter shows a value that changes many times a second: audio levels, buffer fill, network throughput. It renders a track of segments (twenty by default) that light up in proportion to \`value\`. Each segment takes the color of its zone: success below \`warn\`, warning between \`warn\` and \`clip\`, error above \`clip\`. Lit segments glow, and unlit ones keep a faint tint of their zone so the scale shows even at silence. Set \`segments="0"\` for a continuous bar.

The value maps linearly between \`min\` and \`max\`, which default to 0 and 1. For dB metering, set the range (\`min="-60" max="0"\`) and pass dB readings as \`value\`. The \`warn\` and \`clip\` thresholds are always fractions of the range (0.75 and 0.9 by default), so the zones fall in the same place on linear and dB scales.

A thin peak line marks the highest recent level. Left alone, the meter tracks its own peak, holds it briefly, then lets it fall toward the current level on an animation frame loop. With \`prefers-reduced-motion\`, the line jumps down instead of sliding. If your audio engine already computes peaks, set the \`peak\` property and the line renders exactly there, with no tracking of its own.

One element is one channel. There's no stereo mode, so put two meters side by side for a stereo pair, or a row of them for a mixer. The meter renders no visible text, so \`label\` is its only accessible name. \`role="meter"\` with \`aria-valuemin\`, \`aria-valuemax\` and \`aria-valuenow\` carries the reading.`,

  features: [
    'Vertical (the default, filling bottom-up) or horizontal. Horizontal fills from the inline start, so it follows text direction',
    'The peak loop runs on `requestAnimationFrame`, starts on connect and stops on disconnect, so an unmounted meter does no work',
  ],

  guidelines: {
    do: [
      'Use it for live readings like audio channels, input gain or buffer health, where Meter would flicker',
      'Name the channel in `label` ("Master left", not "Level")',
      'Set `warn` and `clip` to your headroom. The defaults (0.75 and 0.9) suit a linear 0 to 1 signal',
    ],
    dont: [
      "Don't use it for a static value like disk usage or a score. Use Meter, which has low, high and optimum",
      "Don't use it for task completion. Use Progress",
      "Don't feed `value` from slow polling and expect a useful peak line. The tracker only sees the values you give it",
      "Don't rely on segment color alone to show clipping. Add a clip indicator or text where it matters",
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
  analyzer.onLevels = ({ left, right }) => {
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
