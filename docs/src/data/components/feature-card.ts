import type { ComponentDef } from './_types';

export const featureCard: ComponentDef = {
    name: 'Feature Card',
    slug: 'feature-card',
    tag: 'arc-feature-card',
    tier: 'content',
    interactivity: 'static',
    description: 'Card with icon, heading, description, and animated hover effects.',

    overview: `Feature Card is a promotional content block designed for landing pages, feature grids, and marketing sections. It presents an icon, heading, and description in a vertical layout with a polished gradient border hover effect that draws attention without overwhelming the content. The card's animated hover state includes an icon lift, a subtle glow from \`--glow-card-hover\`, and an expanding accent rule that creates a premium feel.

When an \`href\` is provided, the entire card renders as an anchor element, making it a natural fit for feature grids that link to detail pages. Without an href, it renders as a static \`<div>\`, suitable for purely informational feature lists. The card uses a 1px padding trick with a gradient background to produce a border effect that transitions smoothly on hover.

The icon slot accepts custom content (SVG icons, emoji, or any markup) via the \`icon\` named slot, falling back to the \`icon\` string property for simple text or emoji icons. CSS parts (\`card\`, \`inner\`, \`icon\`, \`title\`, \`description\`) are exposed for deep style customization when needed.`,

    features: [
      'Gradient border hover effect using a 1px padding technique for smooth transitions',
      'Icon slot with fallback to the icon string property for simple emoji or text',
      'Renders as an <a> when href is set, or a <div> for static display',
      'Animated icon lift with glow shadow (--accent-primary-glow) on hover',
      'Expanding accent rule that fades in on hover for visual polish',
      'Focus-visible outline using --focus-glow for keyboard navigation',
      'Responsive padding that adjusts at the 768px breakpoint',
      'CSS parts (card, inner, icon, title, description) for external styling',
    ],

    guidelines: {
      do: [
        'Use in a CSS grid for feature grids — the card fills its height via flex layout',
        'Provide an href when the card should navigate to a detail or docs page',
        'Keep descriptions concise (one to two sentences) for scannable feature lists',
        'Use the icon slot for SVG icons when you need precise sizing and color control',
        'Combine multiple feature cards in a 2- or 3-column grid for landing page sections',
      ],
      dont: [
        'Nest interactive elements (buttons, links) inside a feature card that already has an href',
        'Use long paragraph-length descriptions — the card is designed for brief summaries',
        'Mix feature cards with value cards in the same grid — choose one style per section',
        'Override the gradient border with a flat color — it loses the signature hover effect',
        'Use feature cards for data display — use value cards or stat components instead',
      ],
    },

    previewHtml: `<div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; max-width: 720px;">
  <arc-feature-card icon="&#9889;" heading="Performance" description="Optimised builds for lightning-fast load times." href="#" action="Learn more"></arc-feature-card>
  <arc-feature-card icon="&#9881;" heading="Themeable" description="Design tokens let you customise every detail." href="#" action="Customize"></arc-feature-card>
  <arc-feature-card icon="&#9878;" heading="Accessible" description="WCAG-compliant focus and keyboard support."></arc-feature-card>
</div>`,

    props: [
      { name: 'icon', type: 'string', default: "''", description: 'Icon text or emoji displayed in the icon box' },
      { name: 'heading', type: 'string', default: "''", description: 'Card title' },
      { name: 'description', type: 'string', default: "''", description: 'Card body text' },
      { name: 'href', type: 'string', default: "''", description: 'Makes the card a link' },
      { name: 'action', type: 'string', description: 'Action label (e.g. "Learn more") shown at the bottom of the card when href is set. Hidden when empty or when no href is provided.' },
    ],
    tabs: [
      {
        label: 'Web Component',
        lang: 'html',
        code: `<arc-feature-card
  heading="Performance"
  description="Optimised builds for lightning-fast load times."
></arc-feature-card>`,
      },
      {
        label: 'React',
        lang: 'tsx',
        code: `import { FeatureCard } from '@arclux/arc-ui-react';

<FeatureCard
  heading="Performance"
  description="Optimised builds for lightning-fast load times."
/>`,
      },
      
      {
        label: 'Vue',
        lang: 'html',
        code: `<script setup>
import { FeatureCard } from '@arclux/arc-ui-vue';
</script>

<template>
  <FeatureCard
    heading="Performance"
    description="Optimised builds for lightning-fast load times."
  ></FeatureCard>
</template>`,
      },
      {
        label: 'Svelte',
        lang: 'html',
        code: `<script>
  import { FeatureCard } from '@arclux/arc-ui-svelte';
</script>

<FeatureCard
  heading="Performance"
  description="Optimised builds for lightning-fast load times."
></FeatureCard>`,
      },
      {
        label: 'Angular',
        lang: 'ts',
        code: `import { Component } from '@angular/core';
import { FeatureCard } from '@arclux/arc-ui-angular';

@Component({
  imports: [FeatureCard],
  template: \`
    <FeatureCard
      heading="Performance"
      description="Optimised builds for lightning-fast load times."
    ></FeatureCard>
  \`,
})
export class MyComponent {}`,
      },
      {
        label: 'Solid',
        lang: 'tsx',
        code: `import { FeatureCard } from '@arclux/arc-ui-solid';

<FeatureCard
  heading="Performance"
  description="Optimised builds for lightning-fast load times."
></FeatureCard>`,
      },
      {
        label: 'Preact',
        lang: 'tsx',
        code: `import { FeatureCard } from '@arclux/arc-ui-preact';

<FeatureCard
  heading="Performance"
  description="Optimised builds for lightning-fast load times."
></FeatureCard>`,
      },
{ label: 'HTML', lang: 'html', code: `<!-- Auto-generated by @arclux/prism — do not edit manually -->
<!-- arc-feature-card — requires feature-card.css + base.css (or arc-ui.css) -->
<div class="arc-feature-card">
  <a class="card" href="#">
   <div class="card__inner">
   <div class="card__icon">★</div>
   <h3 class="card__title">Heading</h3>
   <p class="card__desc">Description text goes here</p>
   <span class="card__rule"></span>
   </div>
   </a>
</div>` },
      { label: 'HTML (Inline)', lang: 'html', code: `<!-- Auto-generated by @arclux/prism — do not edit manually -->
<!-- arc-feature-card — self-contained, no external CSS needed -->
<style>
  @media (max-width: 768px) {
    .arc-feature-card .card__inner { padding: 24px 16px; }
  }
  .arc-feature-card .card:hover { background: linear-gradient(135deg, rgba(77, 126, 247,0.3), rgba(139, 92, 246,0.15), rgb(34, 34, 41)); }
  .arc-feature-card .card:hover .card__inner { box-shadow: inset 0 1px 0 rgba(255, 255, 255,0.04), 0 4px 24px rgba(0,0,0,0.2); }
  .arc-feature-card .card:hover .card__icon { border-color: rgba(77, 126, 247,0.3);
        box-shadow: 0 0 20px rgba(77, 126, 247, 0.2), 0 0 6px rgba(77, 126, 247, 0.12);
        transform: translateY(-2px); }
  .arc-feature-card .card:hover .card__title { color: #fff; }
  .arc-feature-card .card:hover .card__rule { opacity: 0.5; width: 48px; }
  .arc-feature-card .card:focus-visible { outline: none; box-shadow: 0 0 0 2px rgb(3, 3, 7), 0 0 0 4px rgb(77, 126, 247), 0 0 16px rgba(77,126,247,0.3); border-radius: 14px; }
</style>
<div class="arc-feature-card" style="display: block; height: 100%">
  <a class="card" style="position: relative; border-radius: 14px; height: 100%; padding: 1px; background: rgb(24, 24, 30); text-decoration: none; display: flex; flex-direction: column" href="#">
   <div class="card__inner" style="position: relative; background: rgb(13, 13, 18); border-radius: calc(14px - 1px); padding: 40px 24px; display: flex; flex-direction: column; gap: 16px; flex: 1; z-index: 1">
   <div class="card__icon" style="width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; border-radius: 10px; background: rgba(77, 126, 247, 0.06); border: 1px solid rgba(77, 126, 247, 0.12); color: rgb(77, 126, 247); font-size: 20px">★</div>
   <h3 class="card__title" style="font-size: 17px; font-weight: 600; color: rgb(232, 232, 236); margin: 0">Heading</h3>
   <p style="color: rgb(138, 138, 150); font-family: 'Host Grotesk', system-ui, sans-serif; font-size: 14px; line-height: 1.7; flex: 1; margin: 0">Description text goes here</p>
   <span class="card__rule" style="width: 32px; height: 1px; background: linear-gradient(90deg, rgb(77, 126, 247), transparent); opacity: 0"></span>
   </div>
   </a>
</div>` }
    ],
  
  seeAlso: ["card","value-card","cta-banner"],
};
