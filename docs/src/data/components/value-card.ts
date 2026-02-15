import type { ComponentDef } from './_types';

export const valueCard: ComponentDef = {
    name: 'Value Card',
    slug: 'value-card',
    tag: 'arc-value-card',
    tier: 'data',
    interactivity: 'static',
    description: 'Horizontal card with icon and text, for values or features lists.',

    overview: `Value Card presents an icon beside a heading and description in a horizontal layout, making it ideal for company values, principle lists, and benefit grids. Unlike Feature Card's vertical stacking, Value Card places the icon to the left of the text block, producing a more compact and scannable layout that works well in tighter spaces or when you have many items to display.

The card uses a subtle border with a hover effect that brightens the border via \`--border-bright\` and adds a soft violet box shadow. The icon is rendered in \`--accent-secondary\` by default, giving it a distinct visual identity that separates it from the blue-accented Feature Card. This color distinction helps maintain visual hierarchy when both card types appear on the same page.

Like Feature Card, Value Card exposes an \`icon\` named slot for custom icon content alongside the string \`icon\` property for simple text. CSS parts (\`card\`, \`icon\`, \`title\`, \`description\`) enable targeted styling from outside the shadow DOM.`,

    features: [
      'Horizontal icon-beside-text layout for compact, scannable presentation',
      'Violet-accented icon area using --accent-secondary for visual distinction',
      'Subtle hover border brightening with a soft violet glow shadow',
      'Icon slot with fallback to the icon string property',
      'Full-height flex layout that equalises card heights in a grid',
      'CSS parts (card, icon, title, description) for external style customization',
      'Clean typographic hierarchy with 17px heading and 14px body text',
    ],

    guidelines: {
      do: [
        'Use for lists of values, principles, or benefits where compact layout matters',
        'Place in a 2-column grid for a balanced presentation of 4-6 items',
        'Use the icon slot to insert SVG icons for consistent sizing and theming',
        'Keep headings short (2-4 words) since horizontal space is limited',
        'Pair with a section heading above the grid for context',
      ],
      dont: [
        'Add an href — value cards are not linkable; use Feature Card for navigation',
        'Use excessively long descriptions that break the horizontal balance',
        'Mix value cards and feature cards in the same grid row',
        'Override the violet icon color without updating the hover glow to match',
        'Use value cards for single items — they are designed for grouped lists',
      ],
    },

    previewHtml: `<div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; max-width: 600px;">
  <arc-value-card icon="&#10003;" heading="Quality First" description="Every component built with accessibility in mind."></arc-value-card>
  <arc-value-card icon="&#9733;" heading="Open Source" description="MIT licensed with an active community."></arc-value-card>
</div>`,

    props: [
      { name: 'icon', type: 'string', description: 'Icon text displayed beside content' },
      { name: 'heading', type: 'string', description: 'Card title' },
      { name: 'description', type: 'string', description: 'Card body text' },
    ],
    tabs: [
      {
        label: 'Web Component',
        lang: 'html',
        code: `<arc-value-card
  heading="Quality First"
  description="Every component built with accessibility in mind."
></arc-value-card>`,
      },
      {
        label: 'React',
        lang: 'tsx',
        code: `import { ValueCard } from '@arclux/arc-ui-react';

<ValueCard
  heading="Quality First"
  description="Every component built with accessibility in mind."
/>`,
      },
      
      {
        label: 'Vue',
        lang: 'html',
        code: `<script setup>
import { ValueCard } from '@arclux/arc-ui-vue';
</script>

<template>
  <ValueCard
    heading="Quality First"
    description="Every component built with accessibility in mind."
  ></ValueCard>
</template>`,
      },
      {
        label: 'Svelte',
        lang: 'html',
        code: `<script>
  import { ValueCard } from '@arclux/arc-ui-svelte';
</script>

<ValueCard
  heading="Quality First"
  description="Every component built with accessibility in mind."
></ValueCard>`,
      },
      {
        label: 'Angular',
        lang: 'ts',
        code: `import { Component } from '@angular/core';
import { ValueCard } from '@arclux/arc-ui-angular';

@Component({
  imports: [ValueCard],
  template: \`
    <ValueCard
      heading="Quality First"
      description="Every component built with accessibility in mind."
    ></ValueCard>
  \`,
})
export class MyComponent {}`,
      },
      {
        label: 'Solid',
        lang: 'tsx',
        code: `import { ValueCard } from '@arclux/arc-ui-solid';

<ValueCard
  heading="Quality First"
  description="Every component built with accessibility in mind."
></ValueCard>`,
      },
      {
        label: 'Preact',
        lang: 'tsx',
        code: `import { ValueCard } from '@arclux/arc-ui-preact';

<ValueCard
  heading="Quality First"
  description="Every component built with accessibility in mind."
></ValueCard>`,
      },
{ label: 'HTML', lang: 'html', code: `<!-- Auto-generated by @arclux/prism — do not edit manually -->
<!-- arc-value-card — requires value-card.css + base.css (or arc-ui.css) -->
<div class="arc-value-card">
  <div class="card">
   <div class="card__icon">★</div>
   <div class="card__text">
   <h3 class="card__title">Heading</h3>
   <p class="card__desc">Description text goes here</p>
   </div>
   </div>
</div>` },
      { label: 'HTML (Inline)', lang: 'html', code: `<!-- Auto-generated by @arclux/prism — do not edit manually -->
<!-- arc-value-card — self-contained, no external CSS needed -->
<style>
  .arc-value-card .card:hover { border-color: rgb(51, 51, 64);
        box-shadow: 0 0 20px rgba(139, 92, 246,0.06); }
</style>
<div class="arc-value-card" style="display: flex; flex-direction: column; height: 100%">
  <div class="card" style="position: relative; display: flex; align-items: flex-start; gap: 24px; padding: 24px; flex: 1; border: 1px solid rgb(24, 24, 30); border-radius: 14px">
   <div style="flex-shrink: 0; color: rgb(139, 92, 246); font-size: 24px; line-height: 1; padding-top: 2px">★</div>
   <div style="display: flex; flex-direction: column; gap: 8px">
   <h3 style="font-size: 17px; font-weight: 600; color: rgb(232, 232, 236); margin: 0">Heading</h3>
   <p style="color: rgb(138, 138, 150); font-family: 'Host Grotesk', system-ui, sans-serif; font-size: 14px; line-height: 1.7; margin: 0">Description text goes here</p>
   </div>
   </div>
</div>` }
    ],
  
  seeAlso: ["card","feature-card","stat"],
};
