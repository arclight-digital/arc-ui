import type { ComponentDef } from './_types';

export const divider: ComponentDef = {
    name: 'Divider',
    slug: 'divider',
    tag: 'arc-divider',
    tier: 'content',
    interactivity: 'static',
    description: 'Horizontal rule with multiple visual styles from subtle to glowing.',

    overview: `Divider provides a horizontal rule that separates content sections with visual clarity. Unlike a plain \`<hr>\`, it ships with five distinct variants designed for dark-themed interfaces: the default "subtle" uses a gradient that fades at both edges, while "glow" adds an animated shimmer effect using a violet-accented overlay with mix-blend-mode screen.

The line variants — line-white, line-primary, and line-gradient — render a centered 2px rule with constrained max-width (160px, 200px, and 240px respectively), making them ideal for decorative section breaks in hero areas or between card groups. Line-blue and line-gradient include a box-shadow glow for added depth against dark backgrounds.

Divider renders a single \`<div>\` with \`role="separator"\` for proper accessibility semantics. The glow variant's shimmer animation runs over a 6-second cycle and automatically disables when the user has prefers-reduced-motion enabled, ensuring an inclusive experience without sacrificing visual impact.`,

    features: [
      'Five visual variants: subtle, glow, line-white, line-primary, and line-gradient',
      'Animated shimmer on glow variant using a 6-second CSS keyframe cycle',
      'Centered decorative line variants with constrained max-width for elegant section breaks',
      'Box-shadow glow on line-primary and line-gradient for depth on dark backgrounds',
      'Built-in prefers-reduced-motion support that disables the shimmer animation',
      'Semantic role="separator" for assistive technology',
      'Exposed "divider" CSS part for external style customization',
    ],

    guidelines: {
      do: [
        'Use the subtle variant as a general-purpose content separator between sections',
        'Use line-gradient or line-primary as decorative breaks in hero and feature sections',
        'Place glow dividers sparingly to draw attention to major section transitions',
        'Combine with arc-section or arc-container to define clear visual boundaries',
      ],
      dont: [
        'Stack multiple glow dividers close together — the shimmer effect becomes distracting',
        'Use line variants for dense UI layouts; their centered max-width leaves dead space',
        'Rely solely on the divider for semantic separation; use proper heading structure too',
        'Override the animation timing without testing prefers-reduced-motion behavior',
      ],
    },

    previewHtml: `<div style="display: flex; flex-direction: column; gap: 24px; width: 100%;">
  <arc-divider variant="subtle"></arc-divider>
  <arc-divider variant="glow"></arc-divider>
  <arc-divider variant="line-white"></arc-divider>
  <arc-divider variant="line-primary"></arc-divider>
  <arc-divider variant="line-gradient"></arc-divider>
</div>`,

    props: [
      { name: 'variant', type: "'subtle' | 'glow' | 'line-white' | 'line-primary' | 'line-gradient'", default: "'subtle'", description: 'Visual style' },
    ],
    tabs: [
      {
        label: 'Web Component',
        lang: 'html',
        code: `<arc-divider></arc-divider>
<arc-divider variant="glow"></arc-divider>
<arc-divider variant="line-gradient"></arc-divider>`,
      },
      {
        label: 'React',
        lang: 'tsx',
        code: `import { Divider } from '@arclux/arc-ui-react';

<Divider />
<Divider variant="glow" />
<Divider variant="line-gradient" />`,
      },
      
      {
        label: 'Vue',
        lang: 'html',
        code: `<script setup>
import { Divider } from '@arclux/arc-ui-vue';
</script>

<template>
  <Divider></Divider>
  <Divider variant="glow"></Divider>
  <Divider variant="line-gradient"></Divider>
</template>`,
      },
      {
        label: 'Svelte',
        lang: 'html',
        code: `<script>
  import { Divider } from '@arclux/arc-ui-svelte';
</script>

<Divider></Divider>
<Divider variant="glow"></Divider>
<Divider variant="line-gradient"></Divider>`,
      },
      {
        label: 'Angular',
        lang: 'ts',
        code: `import { Component } from '@angular/core';
import { Divider } from '@arclux/arc-ui-angular';

@Component({
  imports: [Divider],
  template: \`
    <Divider></Divider>
    <Divider variant="glow"></Divider>
    <Divider variant="line-gradient"></Divider>
  \`,
})
export class MyComponent {}`,
      },
      {
        label: 'Solid',
        lang: 'tsx',
        code: `import { Divider } from '@arclux/arc-ui-solid';

<Divider></Divider>
<Divider variant="glow"></Divider>
<Divider variant="line-gradient"></Divider>`,
      },
      {
        label: 'Preact',
        lang: 'tsx',
        code: `import { Divider } from '@arclux/arc-ui-preact';

<Divider></Divider>
<Divider variant="glow"></Divider>
<Divider variant="line-gradient"></Divider>`,
      },
{ label: 'HTML', lang: 'html', code: `<!-- Auto-generated by @arclux/prism — do not edit manually -->
<!-- arc-divider — requires divider.css + tokens.css (or arc-ui.css) -->
<div class="arc-divider">
  <div class="divider" role="separator"></div>
</div>` },
      { label: 'HTML (Inline)', lang: 'html', code: `<!-- Auto-generated by @arclux/prism — do not edit manually -->
<!-- arc-divider — self-contained, no external CSS needed -->
<style>
  @media (prefers-reduced-motion: reduce) {
    .arc-divider[data-variant="glow"] .divider::after { animation: none; }
  }
</style>
<div class="arc-divider" style="display: block; width: 100%">
  <div class="divider" style="width: 100%; height: 1px" role="separator"></div>
</div>` }
    ],
  };
