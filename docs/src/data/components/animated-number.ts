import type { ComponentDef } from './_types';

export const animatedNumber: ComponentDef = {
  name: 'Animated Number',
  slug: 'animated-number',
  tag: 'arc-animated-number',
  tier: 'data',
  interactivity: 'static',
  replayable: true,
  description: 'Count-up/down number animation with formatting options.',

  overview: `AnimatedNumber counts from one number to another when its \`value\` changes. On first render it counts up from 0.

Each change starts from the previous \`value\`, not from the number on screen. If a new value arrives mid-animation, the running animation stops, the number jumps to the previous target, and counts from there.`,

  features: [
    'Runs on `requestAnimationFrame` with an ease-out-expo curve: fast at first, slowing into the final number',
    '`duration` defaults to 1000ms',
    'With reduced motion on, it shows the new value straight away',
    '`prefix` and `suffix` wrap the number (for example "$" and "K"), and `decimals` sets fixed decimal places',
    '`format` switches between `number`, `currency` and `percent`, formatted with `Intl.NumberFormat`',
    '`locale` sets separators and decimal marks. It defaults to `en-US` and takes any BCP 47 tag (`de-DE`, `ja-JP`)',
  ],

  guidelines: {
    do: [
      'Use it in stat cards and headline metrics, or inside ValueCard or Stat',
      'Set decimals="2" for currency and decimals="0" for counts',
      'Use about 500ms for small changes on a live dashboard and up to 2000ms for a headline number',
    ],
    dont: [
      "Don't animate more than four or five numbers at once",
      "Don't feed it values that change faster than the duration. Each change restarts the count from the previous value, so the number jumps",
      "Don't set duration below 200ms, where the count is too fast to see",
      "Don't animate between very different magnitudes (1 to 1,000,000), where the count means nothing",
    ],
  },

  previewHtml: `<div style="display: flex; gap: 24px; align-items: baseline;">
  <arc-animated-number value="12847" prefix="$" duration="1500" style="font-size: 32px; font-weight: 700;"></arc-animated-number>
  <arc-animated-number value="94.7" suffix="%" decimals="1" duration="1200" style="font-size: 24px; font-weight: 600;"></arc-animated-number>
  <arc-animated-number value="3200" suffix=" users" duration="1000" style="font-size: 20px;"></arc-animated-number>
</div>`,

  tabs: [
    {
      label: 'Web Component',
      lang: 'html',
      code: `<!-- Revenue counter -->
<arc-animated-number value="12847" prefix="$" duration="1500"></arc-animated-number>

<!-- Percentage with decimals -->
<arc-animated-number value="94.7" suffix="%" decimals="1"></arc-animated-number>

<!-- User count -->
<arc-animated-number value="3200" suffix=" users"></arc-animated-number>`,
    },
    {
      label: 'React',
      lang: 'tsx',
      code: `import { AnimatedNumber } from '@arclux/arc-ui-react';

function Dashboard({ revenue, percentage, users }) {
  return (
    <div>
      <AnimatedNumber value={revenue} prefix="$" duration={1500} />
      <AnimatedNumber value={percentage} suffix="%" decimals={1} />
      <AnimatedNumber value={users} suffix=" users" />
    </div>
  );
}`,
    },
    {
      label: 'Vue',
      lang: 'html',
      code: `<script setup>
import { ref, onMounted } from 'vue';
import { AnimatedNumber } from '@arclux/arc-ui-vue';

const revenue = ref(0);
onMounted(() => { revenue.value = 12847; });
</script>

<template>
  <AnimatedNumber :value="revenue" prefix="$" :duration="1500" />
</template>`,
    },
    {
      label: 'Svelte',
      lang: 'html',
      code: `<script>
  import { AnimatedNumber } from '@arclux/arc-ui-svelte';
  import { onMount } from 'svelte';

  let value = 0;
  onMount(() => { value = 12847; });
</script>

<AnimatedNumber {value} prefix="$" duration={1500} />`,
    },
    {
      label: 'Angular',
      lang: 'ts',
      code: `import { Component, OnInit } from '@angular/core';
import { AnimatedNumber } from '@arclux/arc-ui-angular';

@Component({
  imports: [AnimatedNumber],
  template: \`<arc-animated-number [value]="revenue" prefix="$" [duration]="1500" />\`,
})
export class DashboardComponent implements OnInit {
  revenue = 0;
  ngOnInit() { this.revenue = 12847; }
}`,
    },
    {
      label: 'Solid',
      lang: 'tsx',
      code: `import { AnimatedNumber } from '@arclux/arc-ui-solid';
import { createSignal, onMount } from 'solid-js';

const [revenue, setRevenue] = createSignal(0);
onMount(() => setRevenue(12847));

<AnimatedNumber value={revenue()} prefix="$" duration={1500} />`,
    },
    {
      label: 'Preact',
      lang: 'tsx',
      code: `import { AnimatedNumber } from '@arclux/arc-ui-preact';
import { useState, useEffect } from 'preact/hooks';

const [revenue, setRevenue] = useState(0);
useEffect(() => { setRevenue(12847); }, []);

<AnimatedNumber value={revenue} prefix="$" duration={1500} />`,
    },

    {
      label: 'HTML',
      lang: 'html',
      code: `<!-- Auto-generated by @arclux/prism — do not edit manually -->
<!-- arc-animated-number — requires animated-number.css + tokens.css (or arc-ui.css) -->
<span class="arc-animated-number">
  <span class="value"
        role="status"
        aria-live="polite"
  >_format Value</span>
</span>`,
    },
    {
      label: 'HTML (Inline)',
      lang: 'html',
      code: `<!-- Auto-generated by @arclux/prism — do not edit manually -->
<!-- arc-animated-number — self-contained, no external CSS needed -->
<span class="arc-animated-number" style="display: inline-block; font-family: 'JetBrains Mono', ui-monospace, monospace; font-variant-numeric: tabular-nums">
  <span style="white-space: nowrap"
        role="status"
        aria-live="polite"
  >_format Value</span>
</span>`,
    },
  ],

  seeAlso: ['stat', 'number-input'],
};
