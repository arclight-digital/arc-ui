import type { ComponentDef } from './_types';

export const rangeSlider: ComponentDef = {
  name: 'Range Slider',
  slug: 'range-slider',
  tag: 'arc-range-slider',
  tier: 'input',
  interactivity: 'interactive',
  description:
    'A slider with two thumbs for picking a low and a high value. The track between them fills with the accent color.',

  overview: `RangeSlider picks an interval, like a price filter or a frequency band, by dragging two thumbs along one track. For a single value, use Slider.

With a \`label\`, a header row shows the label on the left and the current "low – high" values on the right in monospace. \`show-values\` is on by default. Turn it off with \`no-values\` to hide the readout.

The track is custom, not two stacked native range inputs. Dragging uses pointer capture, and clicking the track moves the nearest thumb there. Each thumb is a focusable \`role="slider"\` with its own \`aria-label\` and \`aria-valuenow\`, \`aria-valuemin\` and \`aria-valuemax\`. Arrow keys move a thumb by \`step\`, and Home and End jump to its limit.

Dragging fires \`arc-input\` continuously and \`arc-change\` when you let go. A key press fires both, and neither fires if the key leaves the range where it was. The detail carries \`value\` as \`[low, high]\`, plus \`low\` and \`high\` on their own. Each thumb stops at the other, so low never passes high.`,

  features: [
    'Thumb `aria-label`s are the label plus "low" or "high", or "Range low" and "Range high" without a label',
    '`min`, `max` and `step` props. Values snap to multiples of `step`',
    'Hover and focus add a glow to the thumb',
    'Disabled drops to 50% opacity and blocks pointer events',
  ],

  guidelines: {
    do: [
      'Give it a `label` unless something next to it already says what the range is',
      'Use `arc-input` for live filtering and `arc-change` for saving or other expensive work',
      'Match `step` to your data: 1 for integers, 0.01 for fine decimals',
      'Give it at least 250px of width so both thumbs are easy to drag',
      'Start `low` and `high` at the range most people want',
    ],
    dont: [
      'Don\'t make `step` so small that the thumbs are hard to pull apart with a mouse',
      'Don\'t use it for non-numeric choices. Use MultiSelect or a group of checkboxes',
    ],
  },

  previewHtml: `<div style="width:100%; max-width:400px;">
  <arc-range-slider label="Price range" low="25" high="75" min="0" max="100" step="1"></arc-range-slider>
</div>`,

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
      <arc-range-slider
        label="Budget"
        [low]="low"
        [high]="high"
        [min]="0"
        [max]="10000"
        [step]="100"
        (arc-input)="onInput($event)"
        (arc-change)="onCommit($event)"
      ></arc-range-slider>

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

  seeAlso: ['slider', 'input', 'number-input'],
};
