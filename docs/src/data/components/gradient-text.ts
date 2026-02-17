import type { ComponentDef } from './_types';

export const gradientText: ComponentDef = {
    name: 'Gradient Text',
    slug: 'gradient-text',
    tag: 'arc-gradient-text',
    tier: 'typography',
    interactivity: 'static',
    description: 'Inline text wrapper that applies gradient fills to text declaratively.',

    overview: `GradientText wraps any inline text in a gradient fill using \`background-clip: text\`, giving headings, labels, and hero copy vivid color transitions without manual CSS. Choose from built-in variants — accent (the standard blue-to-violet), display (the display heading gradient), sunset, and ocean — or supply a fully custom CSS gradient string via the \`gradient\` prop.

The component is fully inline and inherits the parent's font size, weight, and line height, so it can be dropped into any typographic context — a heading, a paragraph, a button label — without breaking layout. A subtle drop-shadow glow is applied by default using \`var(--accent-primary-rgb)\` for a polished look.

Set \`animate\` to enable a smooth background-position cycle that shifts the gradient back and forth. The animation respects \`prefers-reduced-motion\` and disables itself automatically for users who prefer no motion. The \`text\` CSS part allows external overrides for filters, opacity, or additional styling.`,

    features: [
      'Five built-in gradient variants: accent, display, sunset, ocean, and custom',
      'Custom gradient support — pass any CSS gradient string via the gradient prop',
      'Optional gradient animation with automatic prefers-reduced-motion handling',
      'Fully inline — inherits parent font-size, weight, and line-height',
      'Subtle accent glow via drop-shadow filter for polished presentation',
      'CSS ::part(text) exposed for external styling overrides',
      'Token-driven accent and display gradients cascade with theme overrides',
    ],

    guidelines: {
      do: [
        'Use GradientText for hero headings, feature labels, and marketing copy',
        'Pair with large font sizes (24px+) where gradient fills are most visible',
        'Use the accent variant for UI elements that should match the brand palette',
        'Use the custom variant to match campaign-specific or one-off color schemes',
        'Prefer the display variant for page headings and section titles',
      ],
      dont: [
        'Use GradientText for body copy or long paragraphs — gradients lose impact at small sizes',
        'Animate every gradient on the page — reserve animation for a single focal element',
        'Use the sunset or ocean variants in contexts that need to match the brand accent tokens',
        'Nest GradientText inside another GradientText — only the innermost gradient will be visible',
      ],
    },

    previewHtml: `<div style="display:flex;flex-direction:column;gap:var(--space-md);font-size:24px;font-weight:500">
  <arc-gradient-text variant="accent">Accent Gradient</arc-gradient-text>
  <arc-gradient-text variant="display">Display Gradient</arc-gradient-text>
  <arc-gradient-text variant="sunset">Sunset Gradient</arc-gradient-text>
  <arc-gradient-text variant="ocean">Ocean Gradient</arc-gradient-text>
  <arc-gradient-text variant="accent" animate>Animated Gradient</arc-gradient-text>
</div>`,

    props: [
      { name: 'variant', type: "'accent' | 'display' | 'sunset' | 'ocean' | 'custom'", default: "'accent'", description: 'Predefined gradient variant to apply' },
      { name: 'gradient', type: 'string', default: "''", description: 'Custom CSS gradient string, used when variant is set to custom' },
      { name: 'animate', type: 'boolean', default: 'false', description: 'Animate the gradient with a shifting background-position cycle' },
    ],

    tabs: [
      {
        label: 'Web Component',
        lang: 'html',
        code: `<arc-gradient-text variant="accent">Accent Gradient</arc-gradient-text>

<!-- Display heading gradient -->
<arc-gradient-text variant="display">Display Gradient</arc-gradient-text>

<!-- Sunset variant -->
<arc-gradient-text variant="sunset">Sunset Gradient</arc-gradient-text>

<!-- Ocean variant -->
<arc-gradient-text variant="ocean">Ocean Gradient</arc-gradient-text>

<!-- Custom gradient -->
<arc-gradient-text variant="custom" gradient="linear-gradient(90deg, #e66465, #9198e5)">
  Custom Gradient
</arc-gradient-text>

<!-- Animated -->
<arc-gradient-text variant="accent" animate>Animated Gradient</arc-gradient-text>`,
      },
      {
        label: 'React',
        lang: 'tsx',
        code: `import { GradientText } from '@arclux/arc-ui-react';

function HeroHeading() {
  return (
    <h1 style={{ fontSize: '48px', fontWeight: 700 }}>
      <GradientText variant="accent" animate>
        Build Something Beautiful
      </GradientText>
    </h1>
  );
}

// Custom gradient
<GradientText variant="custom" gradient="linear-gradient(90deg, #e66465, #9198e5)">
  Custom Colors
</GradientText>`,
      },
      {
        label: 'Vue',
        lang: 'html',
        code: `<script setup>
import { GradientText } from '@arclux/arc-ui-vue';
</script>

<template>
  <h1 style="font-size: 48px; font-weight: 700">
    <GradientText variant="accent" animate>
      Build Something Beautiful
    </GradientText>
  </h1>
</template>`,
      },
      {
        label: 'Svelte',
        lang: 'html',
        code: `<script>
  import { GradientText } from '@arclux/arc-ui-svelte';
</script>

<h1 style="font-size: 48px; font-weight: 700">
  <GradientText variant="accent" animate>
    Build Something Beautiful
  </GradientText>
</h1>`,
      },
      {
        label: 'Angular',
        lang: 'ts',
        code: `import { Component } from '@angular/core';
import { GradientText } from '@arclux/arc-ui-angular';

@Component({
  imports: [GradientText],
  template: \`
    <h1 style="font-size: 48px; font-weight: 700">
      <GradientText variant="accent" animate>
        Build Something Beautiful
      </GradientText>
    </h1>
  \`,
})
export class HeroComponent {}`,
      },
      {
        label: 'Solid',
        lang: 'tsx',
        code: `import { GradientText } from '@arclux/arc-ui-solid';

<h1 style={{ 'font-size': '48px', 'font-weight': 700 }}>
  <GradientText variant="accent" animate>
    Build Something Beautiful
  </GradientText>
</h1>`,
      },
      {
        label: 'Preact',
        lang: 'tsx',
        code: `import { GradientText } from '@arclux/arc-ui-preact';

<h1 style={{ fontSize: '48px', fontWeight: 700 }}>
  <GradientText variant="accent" animate>
    Build Something Beautiful
  </GradientText>
</h1>`,
      },
    ],

    seeAlso: ['text', 'typewriter', 'blockquote'],
};
