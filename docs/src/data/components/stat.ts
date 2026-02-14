import type { ComponentDef } from './_types';

export const stat: ComponentDef = {
    name: 'Stat',
    slug: 'stat',
    tag: 'arc-stat',
    tier: 'content',
    interactivity: 'static',
    description: 'Numeric statistic display with gradient value and label.',

    overview: `Stat renders a single key metric as a vertically stacked, center-aligned block. The value is displayed in a large, lightweight font (weight 200) with a blue-to-violet gradient fill and a dual-layer drop-shadow glow, making numbers visually striking against dark backgrounds. A thin gradient rule sits between the value and its uppercase label, providing a subtle decorative separator.

The value font-size uses \`clamp(32px, 4.5vw, 48px)\` to scale responsively between breakpoints, ensuring readability from mobile to desktop without manual media queries. The label uses the Tektur accent font at a small uppercase size with wide letter-spacing, following the system's standard labeling pattern.

Stat is designed for landing-page metrics, dashboard KPI rows, and pricing comparison grids. Place multiple Stats side by side in a flex or grid container to create a metrics row. The exposed CSS parts — "stat", "value", and "label" — allow per-instance styling when you need to customize colors or sizes beyond the defaults.`,

    features: [
      'Gradient-clipped value text with blue-to-violet fill and dual drop-shadow glow',
      'Responsive font-size using clamp() that scales from 32px to 48px',
      'Decorative gradient rule separator between value and label',
      'Uppercase Tektur-font label with wide letter-spacing',
      'Three exposed CSS parts (stat, value, label) for external style overrides',
      'Lightweight font-weight 200 for an elegant numeric display',
      'Center-aligned vertical layout with configurable padding via design tokens',
    ],

    guidelines: {
      do: [
        'Place Stats in a row of three or four to create a balanced metrics section',
        'Use short, punchy values like "99.9%", "<50ms", or "24/7" for maximum impact',
        'Keep labels to one or two words — they are designed for terse descriptions',
        'Pair with arc-section or a flex container to create structured stat rows',
        'Use the ::part(value) selector to apply custom gradients for branded metric colors',
      ],
      dont: [
        'Use Stat for long text content — it is optimized for short numeric values',
        'Place a single Stat in isolation; they work best in groups that invite comparison',
        'Override the font-weight to bold — the lightweight 200 weight is intentional for the design aesthetic',
        'Embed interactive elements inside the value or label props; they render as plain text spans',
      ],
    },

    previewHtml: `<div style="display: flex; gap: 32px; justify-content: center; flex-wrap: wrap;">
  <arc-stat value="99.9%" label="Uptime"></arc-stat>
  <arc-stat value="<50ms" label="Latency"></arc-stat>
  <arc-stat value="24/7" label="Support"></arc-stat>
</div>`,

    props: [
      { name: 'value', type: 'string', description: 'The stat value (e.g. "99%")' },
      { name: 'label', type: 'string', description: 'Label below the value' },
      { name: 'trend', type: 'string', default: "''", description: "Shows a trend indicator arrow below the label. Options: 'up', 'down', 'neutral'." },
      { name: 'change', type: 'string', default: "''", description: "Text displayed next to the trend arrow, typically a percentage like '+12%' or '-3.5%'." },
    ],
    tabs: [
      {
        label: 'Web Component',
        lang: 'html',
        code: `<arc-stat value="99.9%" label="Uptime"></arc-stat>
<arc-stat value="<50ms" label="Response Time"></arc-stat>
<arc-stat value="24/7" label="Support"></arc-stat>`,
      },
      {
        label: 'React',
        lang: 'tsx',
        code: `import { Stat } from '@arclux/arc-ui-react';

<Stat value="99.9%" label="Uptime" />
<Stat value="<50ms" label="Response Time" />`,
      },
      
      {
        label: 'Vue',
        lang: 'html',
        code: `<script setup>
import { Stat } from '@arclux/arc-ui-vue';
</script>

<template>
  <Stat value="99.9%" label="Uptime"></Stat>
  <Stat value="<50ms" label="Response Time"></Stat>
  <Stat value="24/7" label="Support"></Stat>
</template>`,
      },
      {
        label: 'Svelte',
        lang: 'html',
        code: `<script>
  import { Stat } from '@arclux/arc-ui-svelte';
</script>

<Stat value="99.9%" label="Uptime"></Stat>
<Stat value="<50ms" label="Response Time"></Stat>
<Stat value="24/7" label="Support"></Stat>`,
      },
      {
        label: 'Angular',
        lang: 'ts',
        code: `import { Component } from '@angular/core';
import { Stat } from '@arclux/arc-ui-angular';

@Component({
  imports: [Stat],
  template: \`
    <Stat value="99.9%" label="Uptime"></Stat>
    <Stat value="<50ms" label="Response Time"></Stat>
    <Stat value="24/7" label="Support"></Stat>
  \`,
})
export class MyComponent {}`,
      },
      {
        label: 'Solid',
        lang: 'tsx',
        code: `import { Stat } from '@arclux/arc-ui-solid';

<Stat value="99.9%" label="Uptime"></Stat>
<Stat value="<50ms" label="Response Time"></Stat>
<Stat value="24/7" label="Support"></Stat>`,
      },
      {
        label: 'Preact',
        lang: 'tsx',
        code: `import { Stat } from '@arclux/arc-ui-preact';

<Stat value="99.9%" label="Uptime"></Stat>
<Stat value="<50ms" label="Response Time"></Stat>
<Stat value="24/7" label="Support"></Stat>`,
      },
{ label: 'HTML', lang: 'html', code: `<!-- Auto-generated by @arclux/prism — do not edit manually -->
<!-- arc-stat — requires stat.css + base.css (or arc-ui.css) -->
<div class="arc-stat">
  <div class="stat">
   <span class="stat__value">Value</span>
   <span class="stat__rule"></span>
   <span class="stat__label">Label</span>
   </div>
</div>` },
      { label: 'HTML (Inline)', lang: 'html', code: `<!-- Auto-generated by @arclux/prism — do not edit manually -->
<!-- arc-stat — self-contained, no external CSS needed -->
<div class="arc-stat" style="display: block">
  <div style="display: flex; flex-direction: column; align-items: center; gap: 8px; text-align: center; padding: 24px 16px">
   <span style="font-size: clamp(32px, 4.5vw, 48px); font-weight: 200; letter-spacing: -1px; line-height: 1; background: linear-gradient(90deg, rgb(77, 126, 247), rgb(139, 92, 246)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; filter: drop-shadow(0 0 16px rgba(77, 126, 247,0.3))
                  drop-shadow(0 0 40px rgba(139, 92, 246,0.12))">Value</span>
   <span style="width: 24px; height: 1px; background: linear-gradient(90deg, transparent, rgb(77, 126, 247), transparent); opacity: 0.4"></span>
   <span style="font-family: 'Tektur', system-ui, sans-serif; font-weight: 600; font-size: 10px; letter-spacing: 3px; text-transform: uppercase; color: rgb(124, 124, 137)">Label</span>
   </div>
</div>` }
    ],
  
  seeAlso: ["animated-number","value-card","badge"],
};
