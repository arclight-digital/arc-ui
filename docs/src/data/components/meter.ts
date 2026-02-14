import type { ComponentDef } from './_types';

export const meter: ComponentDef = {
    name: 'Meter',
    slug: 'meter',
    tag: 'arc-meter',
    tier: 'content',
    interactivity: 'static',
    description: 'Semantic gauge display with color-coded fill zones (success, warning, error) based on configurable low/high/optimum thresholds.',

    overview: `Meter is a visual gauge that represents a scalar value within a known range, similar to the native HTML \`<meter>\` element but with ARC UI styling and full theme integration. The component renders a rounded track with an animated fill bar whose color changes based on the value's relationship to configurable thresholds. When a \`label\` is provided, a header row displays the label on the left and the current percentage on the right in monospace font.

The color logic mirrors the HTML meter algorithm using three thresholds: \`low\`, \`high\`, and \`optimum\`. When the optimum is in the high segment (e.g. battery level), values above \`high\` render in green (success), values between \`low\` and \`high\` in yellow (warning), and values below \`low\` in red (error). When the optimum is in the low segment (e.g. error count), the logic inverts -- low values are green and high values are red. If thresholds are not explicitly set, the component divides the range into sensible thirds.

Meter uses \`role="meter"\` with \`aria-valuenow\`, \`aria-valuemin\`, and \`aria-valuemax\` for full accessibility. The fill width and color transitions are animated using the theme's base transition timing, creating smooth visual updates when the value changes programmatically.`,

    features: [
      'Color-coded fill bar: green (success) when the value is in the optimal zone, yellow (warning) for intermediate, red (error) for critical',
      'Configurable `low`, `high`, and `optimum` thresholds mirroring the HTML `<meter>` algorithm',
      'Header row showing label text and current percentage in monospace font when `label` is set',
      'Animated fill width and color transitions using the theme base timing function',
      'Automatic zone calculation with sensible third-based defaults when thresholds are omitted',
      'Semantic `role="meter"` with `aria-valuenow`, `aria-valuemin`, and `aria-valuemax`',
      'Rounded 8px track with `bg-elevated` background matching the design system surface palette',
      'Value clamped between `min` and `max` -- out-of-range values are handled gracefully',
    ],

    guidelines: {
      do: [
        'Set `low`, `high`, and `optimum` to match the semantic meaning of your data (e.g. optimum near max for battery level)',
        'Provide a `label` so users understand what the meter represents and can read the percentage',
        'Use Meter for known-range scalar values like disk usage, battery level, signal strength, or performance scores',
        'Update the `value` prop reactively to reflect real-time data changes with smooth animations',
        'Pair Meter with adjacent text or tooltips to explain what the color zones mean in your context',
      ],
      dont: [
        'Do not use Meter for indeterminate progress -- use Progress with an indeterminate state instead',
        'Do not use Meter for task completion tracking -- use Progress for sequential step-based workflows',
        'Do not set `min` equal to or greater than `max` -- the fill calculation returns 0% in that case',
        'Do not rely on color alone to convey the zone meaning -- always include a label or supplementary text',
        'Avoid using Meter for binary states (pass/fail) -- use a Badge or status indicator instead',
      ],
    },

    previewHtml: `<div style="display:flex; flex-direction:column; gap:var(--space-md); width:100%; max-width:400px;">
  <arc-meter label="Battery Level" value="82" min="0" max="100" low="20" high="60" optimum="100"></arc-meter>
  <arc-meter label="Error Rate" value="45" min="0" max="100" low="10" high="50" optimum="0"></arc-meter>
</div>`,

    props: [
      { name: 'value', type: 'number', default: '0', description: 'Current meter value. Clamped between `min` and `max`. Reflected as an attribute.' },
      { name: 'min', type: 'number', default: '0', description: 'Minimum value representing the left edge (empty) of the meter.' },
      { name: 'max', type: 'number', default: '100', description: 'Maximum value representing the right edge (full) of the meter.' },
      { name: 'low', type: 'number', default: 'min + range * 0.33', description: 'Threshold below which the value is considered low. Used for color zone calculation.' },
      { name: 'high', type: 'number', default: 'min + range * 0.67', description: 'Threshold above which the value is considered high. Used for color zone calculation.' },
      { name: 'optimum', type: 'number', default: '(low + high) / 2', description: 'The optimal value. Determines which end of the range is "good" for color zone logic.' },
      { name: 'label', type: 'string', default: "''", description: 'Label text displayed in the header row alongside the current percentage.' },
    ],
    tabs: [
      {
        label: 'Web Component',
        lang: 'html',
        code: `<arc-meter
  label="Disk Usage"
  value="72"
  min="0"
  max="100"
  low="50"
  high="80"
  optimum="0"
></arc-meter>`,
      },
      {
        label: 'React',
        lang: 'tsx',
        code: `import { Meter } from '@arclux/arc-ui-react';

<Meter
  label="Disk Usage"
  value={72}
  min={0}
  max={100}
  low={50}
  high={80}
  optimum={0}
/>`,
      },
      {
        label: 'Vue',
        lang: 'html',
        code: `<script setup>
import { Meter } from '@arclux/arc-ui-vue';
</script>

<template>
  <Meter
    label="Disk Usage"
    :value="72"
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
  import { Meter } from '@arclux/arc-ui-svelte';
</script>

<Meter
  label="Disk Usage"
  value={72}
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
import { Meter } from '@arclux/arc-ui-angular';

@Component({
  imports: [Meter],
  template: \`
    <Meter
      label="Disk Usage"
      [value]="72"
      [min]="0"
      [max]="100"
      [low]="50"
      [high]="80"
      [optimum]="0"
    ></Meter>
  \`,
})
export class MyComponent {}`,
      },
      {
        label: 'Solid',
        lang: 'tsx',
        code: `import { Meter } from '@arclux/arc-ui-solid';

<Meter
  label="Disk Usage"
  value={72}
  min={0}
  max={100}
  low={50}
  high={80}
  optimum={0}
/>`,
      },
      {
        label: 'Preact',
        lang: 'tsx',
        code: `import { Meter } from '@arclux/arc-ui-preact';

<Meter
  label="Disk Usage"
  value={72}
  min={0}
  max={100}
  low={50}
  high={80}
  optimum={0}
/>`,
      },
    ],
  
  seeAlso: ["progress","stat"],
};
