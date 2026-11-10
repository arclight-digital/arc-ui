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

  overview: `Gauge is the radial version of Meter: the same value, range and thresholds, drawn as an arc instead of a bar. A neutral track carries a value arc in the zone color with a matching glow, and the reading is in the middle in mono type, with an optional \`unit\` and a \`label\` under it. \`variant="full"\`, the default, is a 270-degree horseshoe with the reading inside. \`variant="half"\` is a 180-degree semicircle with the reading on the baseline.

The colors follow the HTML \`<meter>\` rules, with Meter's \`low\`, \`high\` and \`optimum\`. When the optimum is in the high segment, as for battery level, values above \`high\` are green (success), values between \`low\` and \`high\` yellow (warning), and values below \`low\` red (error). When the optimum is in the low segment, as for an error rate, it's the other way round. With no thresholds, the range splits into thirds.

\`mode\` changes the coloring. \`zones\` is the default described above. \`plain\` draws one color, \`--gauge-fill\` (the accent by default), for a quantity that's neither good nor bad. \`diverging\` draws from \`center\` toward the value, in \`--gauge-below\` on one side and \`--gauge-above\` on the other, for a lean either way, such as -1 to +1. \`center\` defaults to halfway between \`min\` and \`max\`.

The arc sweeps in on first paint and again on every change. It uses \`role="meter"\` with \`aria-valuenow\`, \`aria-valuemin\` and \`aria-valuemax\`, and with a \`unit\` set, \`aria-valuetext\` gives the reading with its unit, so screen readers say "72%" and not a bare number.`,

  features: [
    '`value` is clamped between `min` and `max`',
    '`no-value` hides the reading in the middle',
    'A custom color\'s glow reads the matching `-rgb` property, such as `--gauge-fill-rgb`',
  ],

  guidelines: {
    do: [
      'Use it for a single reading that should stand out on a dashboard, such as CPU load, battery or a health score',
      'Set `low`, `high` and `optimum` to match what your numbers mean, as you would on Meter',
      'Set a `label`. It\'s shown under the reading and is the accessible name',
      'Set `unit` when the number alone is ambiguous: "72" means different things as %, ms or GB',
      'Use the `half` variant when vertical space is tight, as in a stat row or a card header',
    ],
    dont: [
      'Don\'t use it in dense layouts or lists of readings. Meter shows the same data in a fraction of the height',
      'Don\'t use it for a number with no meaningful range. Use Stat',
      'Don\'t use it for task progress. Use Progress',
      'Don\'t set `min` equal to or greater than `max`. The arc renders empty',
      'Don\'t rely on color alone for the zone. Keep the value and label visible, or add text beside it',
    ],
  },

  previewHtml: `<div style="display:flex; align-items:flex-end; gap:var(--space-xl); flex-wrap:wrap; justify-content:center;">
  <arc-gauge label="Battery" value="82" unit="%" min="0" max="100" low="20" high="60" optimum="100"></arc-gauge>
  <arc-gauge label="Error rate" value="45" unit="%" min="0" max="100" low="10" high="50" optimum="0"></arc-gauge>
  <arc-gauge variant="half" label="Load" value="0.64" unit="" min="0" max="1" low="0.5" high="0.8" optimum="0"></arc-gauge>
  <arc-gauge variant="half" label="Lean" mode="diverging" value="-0.3" min="-1" max="1"></arc-gauge>
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
