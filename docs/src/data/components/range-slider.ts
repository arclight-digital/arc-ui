import type { ComponentDef } from './_types';

export const rangeSlider: ComponentDef = {
    name: 'Range Slider',
    slug: 'range-slider',
    tag: 'arc-range-slider',
    tier: 'input',
    interactivity: 'interactive',
    description: 'Dual-thumb range slider for selecting a numeric interval within a defined range, with accent-primary fill between the thumbs and live value display.',

    overview: `Range Slider lets users select a contiguous sub-range between two bounds by dragging two thumbs along a shared track. The filled region between the thumbs is rendered with accent-primary, giving an immediate visual cue of the selected interval.

When a \`label\` is provided the component renders a header row with the label on the left and the current range values ("low – high") on the right in monospace font, matching the single Slider's visual pattern. The \`show-values\` attribute (on by default) controls whether the numeric readout appears.

Rather than layering two native range inputs, this component implements a custom track with pointer capture-based dragging for reliable cross-browser behavior. Both thumbs are keyboard accessible with arrow keys, Home, and End, and each carries proper ARIA \`role="slider"\` attributes (\`aria-valuenow\`, \`aria-valuemin\`, \`aria-valuemax\`) so screen readers announce the current value and range constraints.

Range Slider fires \`arc-input\` continuously during drag for real-time previews and \`arc-change\` on thumb release for committing the final selection, with \`{ low, high }\` in the event detail. The low thumb is clamped to never exceed the high thumb and vice versa, preventing invalid crossover states.`,

    features: [
      'Custom dual-thumb track built with pointer capture for reliable cross-browser dragging',
      'Accent-primary filled region between the two thumbs visually indicates the selected range',
      'Header row displaying the label and "low – high" values in monospace font when `label` and `show-values` are set',
      'Configurable `min`, `max`, and `step` props for precise range and increment control',
      'Thumb hover and focus effects with scale-up and accent-primary glow shadow matching the single Slider',
      'Keyboard support: ArrowLeft/Right/Up/Down step by `step`, Home and End jump to limits',
      'Dual events: `arc-input` fires continuously during drag, `arc-change` fires on release, both with `{ low, high }` detail',
      'Full ARIA slider roles on each thumb with `aria-valuenow`, `aria-valuemin`, `aria-valuemax`, and `aria-label`',
      'Clamping logic prevents thumbs from crossing each other, maintaining low ≤ high invariant',
      'Click-on-track moves the nearest thumb to the clicked position',
      'Disabled state at 50% opacity with pointer events blocked',
      'Reduced-motion media query disables thumb transitions',
    ],

    guidelines: {
      do: [
        'Provide a `label` so users understand what the range represents at a glance',
        'Use for selecting a sub-range within a larger set, such as a price filter, date range, or frequency band',
        'Use `arc-input` for real-time filtering or preview and `arc-change` for committing the selection to a server',
        'Choose `step` values that match your data granularity — use 1 for integers, 0.01 for fine decimal values',
        'Place the Range Slider in a container at least 250px wide for comfortable dual-thumb dragging',
        'Set `low` and `high` to sensible defaults that represent the most common range for your use case',
      ],
      dont: [
        'Do not use Range Slider when the user only needs to pick a single value — use Slider instead',
        'Do not set a `step` so small that the two thumbs become difficult to separate with a mouse',
        'Do not omit `label` when the slider is standalone — without context the numeric readout is meaningless',
        'Do not use for non-numeric selections — use a multi-select or checkbox group instead',
        'Avoid placing multiple range sliders in a narrow column without sufficient vertical spacing',
      ],
    },

    previewHtml: `<div style="width:100%; max-width:400px;">
  <arc-range-slider label="Price Range" low="25" high="75" min="0" max="100" step="1"></arc-range-slider>
</div>`,

    props: [
      { name: 'min', type: 'number', default: '0', description: 'Minimum allowed value at the left edge of the track.' },
      { name: 'max', type: 'number', default: '100', description: 'Maximum allowed value at the right edge of the track.' },
      { name: 'step', type: 'number', default: '1', description: 'Increment granularity. Values snap to multiples of this number.' },
      { name: 'low', type: 'number', default: '0', description: 'Lower bound value of the selected range. Reflected as an attribute.' },
      { name: 'high', type: 'number', default: '100', description: 'Upper bound value of the selected range. Reflected as an attribute.' },
      { name: 'label', type: 'string', default: "''", description: 'Label text displayed above the slider with the range values shown on the right.' },
      { name: 'show-values', type: 'boolean', default: 'true', description: 'Whether to display the numeric "low – high" readout in the header.' },
      { name: 'disabled', type: 'boolean', default: 'false', description: 'Disables interaction, reducing opacity and blocking pointer events.' },
    ],
    events: [
      { name: 'arc-input', description: 'Fired continuously as the user drags either thumb. Detail contains `{ low, high }`. Use for real-time filtering or preview.' },
      { name: 'arc-change', description: 'Fired once when the user releases a thumb, indicating the final committed range. Detail contains `{ low, high }`. Use for persisting to a database or triggering an expensive operation.' },
    ],
    tabs: [
      {
        label: 'Web Component',
        lang: 'html',
        code: `<script type="module" src="@arclux/arc-ui"></script>

<!-- Basic price range filter -->
<arc-range-slider label="Price" low="20" high="80" min="0" max="200" step="5"></arc-range-slider>

<!-- Temperature comfort zone -->
<arc-range-slider label="Comfort Zone" low="18" high="24" min="10" max="40" step="0.5"></arc-range-slider>

<!-- Frequency band selector -->
<arc-range-slider label="Frequency (Hz)" low="200" high="4000" min="20" max="20000" step="10"></arc-range-slider>

<!-- Disabled state -->
<arc-range-slider label="Locked Range" low="30" high="70" disabled></arc-range-slider>

<!-- Without value display -->
<arc-range-slider label="Silent" low="10" high="90" show-values="false"></arc-range-slider>

<script>
  const rs = document.querySelector('arc-range-slider');

  // Real-time filtering while dragging
  rs.addEventListener('arc-input', (e) => {
    console.log('Filtering:', e.detail.low, '–', e.detail.high);
  });

  // Commit final range on release
  rs.addEventListener('arc-change', (e) => {
    console.log('Committed:', e.detail.low, '–', e.detail.high);
  });
</script>`,
      },
      {
        label: 'React',
        lang: 'tsx',
        code: `import { RangeSlider } from '@arclux/arc-ui-react';
import { useState } from 'react';

function PriceFilter() {
  const [low, setLow] = useState(20);
  const [high, setHigh] = useState(80);

  return (
    <div style={{ maxWidth: 400 }}>
      <RangeSlider
        label="Price"
        low={low}
        high={high}
        min={0}
        max={200}
        step={5}
        onArcInput={(e) => { setLow(e.detail.low); setHigh(e.detail.high); }}
        onArcChange={(e) => fetchProducts(e.detail.low, e.detail.high)}
      />
    </div>
  );
}

function AudioEqualizer() {
  const [band, setBand] = useState({ low: 200, high: 4000 });

  return (
    <div style={{ maxWidth: 400 }}>
      <RangeSlider
        label="Frequency Band (Hz)"
        low={band.low}
        high={band.high}
        min={20}
        max={20000}
        step={10}
        onArcInput={(e) => setBand({ low: e.detail.low, high: e.detail.high })}
      />
      <p style={{ marginTop: 12, fontSize: 14, color: 'var(--text-muted)' }}>
        Bandwidth: {band.high - band.low} Hz
      </p>
    </div>
  );
}`,
      },
      {
        label: 'Vue',
        lang: 'html',
        code: `<script setup>
import { RangeSlider } from '@arclux/arc-ui-vue';
import { ref, computed } from 'vue';

const minAge = ref(18);
const maxAge = ref(65);
const range = computed(() => maxAge.value - minAge.value);
</script>

<template>
  <div style="max-width:400px;">
    <RangeSlider
      label="Age Range"
      :low="minAge"
      :high="maxAge"
      :min="0"
      :max="100"
      @arc-input="minAge = $event.detail.low; maxAge = $event.detail.high"
    />
    <p style="margin-top:12px; font-size:14px; color:var(--text-muted);">
      Span: {{ range }} years
    </p>
  </div>
</template>`,
      },
      {
        label: 'Svelte',
        lang: 'html',
        code: `<script>
  import { RangeSlider } from '@arclux/arc-ui-svelte';

  let low = 25;
  let high = 75;

  function onInput(e) {
    low = e.detail.low;
    high = e.detail.high;
  }
</script>

<div style="max-width:400px;">
  <RangeSlider
    label="Score Range"
    {low}
    {high}
    min={0}
    max={100}
    on:arc-input={onInput}
    on:arc-change={() => console.log('Committed:', low, '–', high)}
  />
  <p style="margin-top:12px; font-size:14px; color:var(--text-muted);">
    Selected: {low} – {high} ({high - low} points)
  </p>
</div>`,
      },
      {
        label: 'Angular',
        lang: 'ts',
        code: `import { Component } from '@angular/core';
import { RangeSlider } from '@arclux/arc-ui-angular';

@Component({
  imports: [RangeSlider],
  template: \`
    <div style="max-width:400px;">
      <RangeSlider
        label="Budget"
        [low]="low"
        [high]="high"
        [min]="0"
        [max]="10000"
        [step]="100"
        (arc-input)="onInput($event)"
        (arc-change)="onCommit($event)"
      ></RangeSlider>

      <p style="margin-top:12px; font-size:14px; color:var(--text-muted);">
        \${{ low | number }} – \${{ high | number }}
      </p>
    </div>
  \`,
})
export class BudgetFilterComponent {
  low = 1000;
  high = 5000;

  onInput(e: CustomEvent) {
    this.low = e.detail.low;
    this.high = e.detail.high;
  }

  onCommit(e: CustomEvent) {
    this.fetchResults(e.detail.low, e.detail.high);
  }

  fetchResults(low: number, high: number) { /* ... */ }
}`,
      },
      {
        label: 'Solid',
        lang: 'tsx',
        code: `import { RangeSlider } from '@arclux/arc-ui-solid';
import { createSignal } from 'solid-js';

function WeightFilter() {
  const [low, setLow] = createSignal(50);
  const [high, setHigh] = createSignal(150);

  return (
    <div style={{ 'max-width': '400px' }}>
      <RangeSlider
        label="Weight (kg)"
        low={low()}
        high={high()}
        min={0}
        max={300}
        step={5}
        onArcInput={(e) => { setLow(e.detail.low); setHigh(e.detail.high); }}
        onArcChange={(e) => console.log('Final:', e.detail.low, '–', e.detail.high)}
      />
      <p style={{ 'margin-top': '12px', 'font-size': '14px', color: 'var(--text-muted)' }}>
        Range: {high() - low()} kg
      </p>
    </div>
  );
}`,
      },
      {
        label: 'Preact',
        lang: 'tsx',
        code: `import { RangeSlider } from '@arclux/arc-ui-preact';
import { useState } from 'preact/hooks';

function DateRangeFilter() {
  const [low, setLow] = useState(2010);
  const [high, setHigh] = useState(2025);

  return (
    <div style={{ maxWidth: 400 }}>
      <RangeSlider
        label="Year Range"
        low={low}
        high={high}
        min={1990}
        max={2030}
        step={1}
        onArcInput={(e) => { setLow(e.detail.low); setHigh(e.detail.high); }}
        onArcChange={(e) => fetchByYear(e.detail.low, e.detail.high)}
      />
      <p style={{ marginTop: 12, fontSize: 14, color: 'var(--text-muted)' }}>
        {high - low} years selected
      </p>
    </div>
  );
}`,
      },
      {
        label: 'HTML',
        lang: 'html',
        code: `<!-- arc-range-slider is interactive — requires JS -->
<arc-range-slider></arc-range-slider>`,
      },
      {
        label: 'HTML (Inline)',
        lang: 'html',
        code: `<!-- arc-range-slider is interactive — requires JS -->
<arc-range-slider></arc-range-slider>`,
      },
    ],

  seeAlso: ["slider", "input", "number-input"],
};
