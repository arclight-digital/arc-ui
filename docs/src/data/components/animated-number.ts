import type { ComponentDef } from './_types';

export const animatedNumber: ComponentDef = {
    name: 'Animated Number',
    slug: 'animated-number',
    tag: 'arc-animated-number',
    tier: 'content',
    interactivity: 'static',
    replayable: true,
    description: 'Smooth count-up/down number animation with formatting options.',

    overview: `AnimatedNumber smoothly transitions between numeric values using \`requestAnimationFrame\` with an ease-out-expo curve, creating the classic "counting up" effect seen in dashboards, stat cards, and hero metrics. When the \`value\` attribute changes, the component interpolates from the current displayed number to the new target over the specified duration.

The ease-out-expo easing produces a fast start that decelerates toward the target, which feels natural and draws attention to the final number. Duration defaults to 1000ms but can be adjusted for different contexts — 500ms for small increments in real-time dashboards, 2000ms for dramatic hero reveals on landing pages.

Formatting is built in: \`prefix\` and \`suffix\` strings wrap the number (e.g., "$" and "K"), and \`decimals\` controls fixed decimal places. The component uses \`Intl.NumberFormat\` for locale-aware comma separation, so "1234567" displays as "1,234,567". The animation respects \`prefers-reduced-motion\` by snapping directly to the target value without animation.`,

    features: [
      'Smooth count-up/down animation using requestAnimationFrame',
      'Ease-out-expo easing for natural deceleration',
      'Configurable duration from quick updates to dramatic reveals',
      'Prefix and suffix strings for currency, units, and labels',
      'Fixed decimal place control via decimals attribute',
      'Locale-aware number formatting with Intl.NumberFormat',
      'Respects prefers-reduced-motion by snapping to final value',
    ],

    guidelines: {
      do: [
        'Use in dashboard stat cards and hero metrics for visual impact',
        'Set decimals="2" for currency values and decimals="0" for counts',
        'Use prefix="$" or suffix="%" for contextual formatting',
        'Keep duration under 2000ms — longer animations feel sluggish',
        'Combine with ValueCard or Stat for complete metric displays',
      ],
      dont: [
        'Animate more than 4-5 numbers simultaneously — it becomes distracting',
        'Use for rapidly changing real-time values — the animations will queue and feel laggy',
        'Set duration below 200ms — the animation becomes imperceptible',
        'Animate between extremely different magnitudes (1 to 1,000,000) — the counting is meaningless',
        'Use for static numbers that never change — add animation only when values update',
      ],
    },

    previewHtml: `<div style="display: flex; gap: 24px; align-items: baseline;">
  <arc-animated-number value="12847" prefix="$" duration="1500" style="font-size: 32px; font-weight: 700;"></arc-animated-number>
  <arc-animated-number value="94.7" suffix="%" decimals="1" duration="1200" style="font-size: 24px; font-weight: 600;"></arc-animated-number>
  <arc-animated-number value="3200" suffix=" users" duration="1000" style="font-size: 20px;"></arc-animated-number>
</div>`,

    props: [
      { name: 'value', type: 'number', default: '0', description: 'Target number to animate to' },
      { name: 'duration', type: 'number', default: '1000', description: 'Animation duration in milliseconds' },
      { name: 'prefix', type: 'string', default: "''", description: 'String prepended before the number (e.g., "$")' },
      { name: 'suffix', type: 'string', default: "''", description: 'String appended after the number (e.g., "%")' },
      { name: 'decimals', type: 'number', default: '0', description: 'Number of fixed decimal places' },
    ],
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
  template: \`<AnimatedNumber [value]="revenue" prefix="$" [duration]="1500" />\`,
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
    ],
  };
