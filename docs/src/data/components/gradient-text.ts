import type { ComponentDef } from './_types';

export const gradientText: ComponentDef = {
  name: 'Gradient Text',
  slug: 'gradient-text',
  tag: 'arc-gradient-text',
  tier: 'typography',
  interactivity: 'static',
  description: 'Fills inline text with one of four gradients or your own CSS gradient.',

  overview: `GradientText fills inline text with a gradient using \`background-clip: text\`. Pick a \`variant\`: \`accent\` (the default, \`--gradient-accent-text\`), \`display\` (\`--gradient-display-text\`), \`sunset\` or \`ocean\`. For your own gradient, set \`variant="custom"\` and pass any CSS gradient in \`gradient\`. \`gradient\` is ignored with the other variants.

It's inline and inherits the parent's font size, weight and line height, so it works inside a heading, a paragraph or a button label. Every variant adds a faint drop-shadow glow in \`--accent-primary-rgb\`. The paint box extends a little above and below the text so descenders aren't clipped under a tight line height.

\`animated\` slides the gradient back and forth on a 4-second loop, and stops under reduced motion. It has no visible effect with \`variant="custom"\`.`,

  features: [
    '`accent` and `display` read theme tokens, so they follow theme overrides',
    'CSS part: `text`',
  ],

  guidelines: {
    do: [
      'Use it for hero headings, feature labels and marketing copy',
      'Use it at 24px and up, where the gradient is easy to see',
      'Use `accent` where the text should match the brand colors, and `display` for page headings and section titles',
      'Use `custom` for one-off or campaign colors',
    ],
    dont: [
      "Don't use it for body copy or long paragraphs. At small sizes the gradient is hard to see",
      "Don't animate every gradient on the page. Animate one focal element at most",
      "Don't use `sunset` or `ocean` where the text has to match the brand accent tokens",
    ],
  },

  previewHtml: `<div style="display:flex;flex-direction:column;gap:var(--space-md);font-size:24px;font-weight:500">
  <arc-gradient-text variant="accent">Accent gradient</arc-gradient-text>
  <arc-gradient-text variant="display">Display gradient</arc-gradient-text>
  <arc-gradient-text variant="sunset">Sunset gradient</arc-gradient-text>
  <arc-gradient-text variant="ocean">Ocean gradient</arc-gradient-text>
  <arc-gradient-text variant="accent" animated>Animated gradient</arc-gradient-text>
</div>`,

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
<arc-gradient-text variant="accent" animated>Animated Gradient</arc-gradient-text>`,
    },
    {
      label: 'React',
      lang: 'tsx',
      code: `import { GradientText } from '@arclux/arc-ui-react';

function HeroHeading() {
  return (
    <h1 style={{ fontSize: '48px', fontWeight: 700 }}>
      <GradientText variant="accent" animated>
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
    <GradientText variant="accent" animated>
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
  <GradientText variant="accent" animated>
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
      <arc-gradient-text variant="accent" animated>
        Build Something Beautiful
      </arc-gradient-text>
    </h1>
  \`,
})
export class HeroComponent {}`,
    },
    {
      label: 'Solid',
      lang: 'tsx',
      code: `import { GradientText } from '@arclux/arc-ui-solid';

export default function Example() {
  return (
    <h1 style={{ 'font-size': '48px', 'font-weight': 700 }}>
      <GradientText variant="accent" animated>
        Build Something Beautiful
      </GradientText>
    </h1>
  );
}`,
    },
    {
      label: 'Preact',
      lang: 'tsx',
      code: `import { GradientText } from '@arclux/arc-ui-preact';

export default function Example() {
  return (
    <h1 style={{ fontSize: '48px', fontWeight: 700 }}>
      <GradientText variant="accent" animated>
        Build Something Beautiful
      </GradientText>
    </h1>
  );
}`,
    },
  ],

  seeAlso: ['text', 'typewriter', 'blockquote'],
};
