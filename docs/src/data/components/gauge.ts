import type { ComponentDef } from './_types';

export const gauge: ComponentDef = {
  name: 'Gauge',
  slug: 'gauge',
  tag: 'arc-gauge',
  tier: 'data',
  interactivity: 'static',
  description:
    'Radial gauge displaying a scalar value on an arc with color-coded zones (success, warning, error) and an animated sweep.',
  searchKeywords: ['radial', 'dial', 'speedometer', 'donut'],

  overview: `Gauge is the radial companion to Meter: the same scalar value, range, and threshold semantics, drawn as an arc instead of a bar. A neutral track arc carries a value arc whose stroke takes the zone color and a soft matching glow, and the current reading sits center-stage in monospace type with an optional \`unit\` suffix and a label beneath it. Two shapes are available through \`variant\`: the default \`full\` renders a 270-degree horseshoe with the readout inside the ring, while \`half\` renders a 180-degree semicircle with the readout resting on the baseline.

The color logic mirrors the HTML meter algorithm using the same three thresholds as Meter: \`low\`, \`high\`, and \`optimum\`. When the optimum is in the high segment (e.g. battery level), values above \`high\` render green (success), values between \`low\` and \`high\` yellow (warning), and values below \`low\` red (error). When the optimum is in the low segment (e.g. error rate), the logic inverts — low values are green and high values are red. If thresholds are omitted, the range divides into sensible thirds.

The value arc sweeps into place on first paint and animates smoothly whenever the value changes, honoring the reduced-motion preference. Gauge uses \`role="meter"\` with \`aria-valuenow\`, \`aria-valuemin\`, and \`aria-valuemax\`; when a \`unit\` is set, \`aria-valuetext\` reports the reading with its unit so screen readers announce "72%" rather than a bare number.`,

  features: [
    'Color-coded value arc: green (success) in the optimal zone, yellow (warning) for intermediate, red (error) for critical',
    'Configurable `low`, `high`, and `optimum` thresholds identical to Meter, mirroring the HTML `<meter>` algorithm',
    'Soft glow on the value arc in the zone color, following the status glow scale',
    'Animated sweep on first paint and on every value change, disabled under reduced motion',
    '`full` (270-degree horseshoe) and `half` (180-degree) arc variants',
    'Center-stage monospace readout with optional `unit` suffix and label, hidden via `showValue`',
    'Semantic `role="meter"` with `aria-valuenow`, `aria-valuemin`, `aria-valuemax`, and unit-aware `aria-valuetext`',
    'Value clamped between `min` and `max` — out-of-range values are handled gracefully',
  ],

  guidelines: {
    do: [
      'Use Gauge for a single reading that deserves visual prominence on a dashboard — CPU load, battery, a health score',
      'Set `low`, `high`, and `optimum` to match the semantic meaning of your data, exactly as you would on Meter',
      'Provide a `label` so the reading has an accessible name and visible context',
      'Set `unit` when the raw number is ambiguous — "72" reads differently as %, ms, or GB',
      'Use the `half` variant when vertical space is tight, such as inside a stat row or card header',
    ],
    dont: [
      'Do not use Gauge where space is dense or readings stack in a list — Meter conveys the same data in a fraction of the height',
      'Do not use Gauge for a plain number with no meaningful range — Stat presents a standalone figure with trend context instead',
      'Do not use Gauge for task progress — Progress communicates completion; Gauge communicates where a reading sits in a range',
      'Do not set `min` equal to or greater than `max` — the sweep renders empty in that case',
      'Do not rely on color alone to convey the zone meaning — keep the value and label visible or provide adjacent text',
    ],
  },

  previewHtml: `<div style="display:flex; align-items:flex-end; gap:var(--space-xl); flex-wrap:wrap; justify-content:center;">
  <arc-gauge label="Battery" value="82" unit="%" min="0" max="100" low="20" high="60" optimum="100"></arc-gauge>
  <arc-gauge label="Error Rate" value="45" unit="%" min="0" max="100" low="10" high="50" optimum="0"></arc-gauge>
  <arc-gauge variant="half" label="Load" value="0.64" unit="" min="0" max="1" low="0.5" high="0.8" optimum="0"></arc-gauge>
</div>`,
  replayable: true,

  tabs: [
    {
      label: 'Web Component',
      lang: 'html',
      code: `<arc-gauge
  label="CPU Load"
  value="72"
  unit="%"
  min="0"
  max="100"
  low="50"
  high="80"
  optimum="0"
></arc-gauge>`,
    },
    {
      label: 'React',
      lang: 'tsx',
      code: `import { Gauge } from '@arclux/arc-ui-react';

export default function Example() {
  return (
    <Gauge
      label="CPU Load"
      value={72}
      unit="%"
      min={0}
      max={100}
      low={50}
      high={80}
      optimum={0}
    />
  );
}`,
    },
    {
      label: 'Vue',
      lang: 'html',
      code: `<script setup>
import { Gauge } from '@arclux/arc-ui-vue';
</script>

<template>
  <Gauge
    label="CPU Load"
    :value="72"
    unit="%"
    :min="0"
    :max="100"
    :low="50"
    :high="80"
    :optimum="0"
  />
</template>`,
    },
    {
      label: 'Svelte',
      lang: 'html',
      code: `<script>
  import { Gauge } from '@arclux/arc-ui-svelte';
</script>

<Gauge
  label="CPU Load"
  value={72}
  unit="%"
  min={0}
  max={100}
  low={50}
  high={80}
  optimum={0}
/>`,
    },
    {
      label: 'Angular',
      lang: 'ts',
      code: `import { Component } from '@angular/core';
import { Gauge } from '@arclux/arc-ui-angular';

@Component({
  imports: [Gauge],
  template: \`
    <arc-gauge
      label="CPU Load"
      [value]="72"
      unit="%"
      [min]="0"
      [max]="100"
      [low]="50"
      [high]="80"
      [optimum]="0"
    ></arc-gauge>
  \`,
})
export class MyComponent {}`,
    },
    {
      label: 'Solid',
      lang: 'tsx',
      code: `import { Gauge } from '@arclux/arc-ui-solid';

export default function Example() {
  return (
    <Gauge
      label="CPU Load"
      value={72}
      unit="%"
      min={0}
      max={100}
      low={50}
      high={80}
      optimum={0}
    />
  );
}`,
    },
    {
      label: 'Preact',
      lang: 'tsx',
      code: `import { Gauge } from '@arclux/arc-ui-preact';

export default function Example() {
  return (
    <Gauge
      label="CPU Load"
      value={72}
      unit="%"
      min={0}
      max={100}
      low={50}
      high={80}
      optimum={0}
    />
  );
}`,
    },
  ],

  seeAlso: ['meter', 'stat', 'progress'],
};
