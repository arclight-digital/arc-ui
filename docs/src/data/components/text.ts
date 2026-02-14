import type { ComponentDef } from './_types';

export const text: ComponentDef = {
    name: 'Text',
    slug: 'text',
    tag: 'arc-text',
    tier: 'content',
    interactivity: 'static',
    description: 'Typography component with variants matching the arclight type scale.',

    overview: `Text is the foundational typography primitive in ARC UI. It maps nine named variants to the design system's type scale, each with pre-configured font-size, weight, letter-spacing, line-height, and color. The "display" variant renders a large gradient-clipped headline, "heading" provides balanced section titles, and "body" covers standard paragraph content with the secondary text color.

For specialized contexts, "accent" applies the accent gradient with a glow drop-shadow, "label" renders uppercase section titles using the Tektur font, and "wordmark" produces all-caps branding text with a blue glow text-shadow. The "code" variant switches to the monospace font stack with a violet color and subtle text-shadow, ideal for inline code references. "muted" and "ghost" provide progressively dimmer text colors for de-emphasized content.

The \`as\` property controls the rendered HTML element (h1 through h6, span, or the default p), allowing you to maintain correct document heading hierarchy independently from the visual variant. This separation of semantic tag from visual style is essential for accessibility and SEO.`,

    features: [
      'Nine typography variants: display, heading, body, muted, ghost, accent, label, wordmark, and code',
      'Gradient-clipped text rendering on display and accent variants',
      'Configurable HTML element via the "as" prop (h1-h6, span, p) for semantic control',
      'Balanced text wrapping on heading and body variants via text-wrap: balance',
      'Monospace code variant with violet color and subtle glow text-shadow',
      'Uppercase Tektur-font treatment for label and wordmark variants',
      'Accent variant includes a drop-shadow glow filter for visual emphasis',
      'Inline display for accent and code variants; block display for all others',
    ],

    guidelines: {
      do: [
        'Use the "as" prop to match heading hierarchy (h1, h2, etc.) even when using a different visual variant',
        'Use display for hero headlines and heading for section titles to establish clear hierarchy',
        'Use muted or ghost for supporting text that should not compete with primary content',
        'Pair the label variant with section containers to create clear content groupings',
        'Use the code variant for inline code references within body text',
      ],
      dont: [
        'Render display or heading variants inside a <span> — they are block-level content',
        'Skip heading levels (e.g., h1 to h3) just to get a particular visual size; use "as" and "variant" independently',
        'Use the accent variant for large blocks of text — the gradient and glow are meant for short highlights',
        'Apply the wordmark variant outside of branding contexts; it is specifically designed for product names',
        'Nest multiple Text components when a single one with the right variant suffices',
      ],
    },

    previewHtml: `<div style="display: flex; flex-direction: column; gap: 16px;">
  <arc-text variant="display" as="h1">Display Headline</arc-text>
  <arc-text variant="heading" as="h2">Section Heading</arc-text>
  <arc-text variant="body">Body paragraph text with balanced wrapping for readability.</arc-text>
  <arc-text variant="muted">Muted supporting text</arc-text>
  <arc-text variant="accent" as="span">Accent highlight</arc-text>
  <arc-text variant="label" as="span">Section Label</arc-text>
  <arc-text variant="code" as="span">const x = 42;</arc-text>
</div>`,

    props: [
      { name: 'variant', type: "'display' | 'heading' | 'body' | 'muted' | 'ghost' | 'accent' | 'label' | 'wordmark' | 'code'", default: "'body'", description: 'Typography variant' },
    ],
    tabs: [
      {
        label: 'Web Component',
        lang: 'html',
        code: `<arc-text variant="display">Display Headline</arc-text>
<arc-text variant="heading">Section Heading</arc-text>
<arc-text variant="body">Body paragraph text.</arc-text>
<arc-text variant="accent">Accent gradient</arc-text>
<arc-text variant="label">Section Label</arc-text>
<arc-text variant="code">const x = 42;</arc-text>`,
      },
      {
        label: 'React',
        lang: 'tsx',
        code: `import { Text } from '@arclux/arc-ui-react';

<Text variant="display">Display Headline</Text>
<Text variant="heading">Section Heading</Text>
<Text variant="body">Body paragraph text.</Text>`,
      },
      
      {
        label: 'Vue',
        lang: 'html',
        code: `<script setup>
import { Text } from '@arclux/arc-ui-vue';
</script>

<template>
  <Text variant="display">Display Headline</Text>
  <Text variant="heading">Section Heading</Text>
  <Text variant="body">Body paragraph text.</Text>
  <Text variant="accent">Accent gradient</Text>
  <Text variant="label">Section Label</Text>
  <Text variant="code">const x = 42;</Text>
</template>`,
      },
      {
        label: 'Svelte',
        lang: 'html',
        code: `<script>
  import { Text } from '@arclux/arc-ui-svelte';
</script>

<Text variant="display">Display Headline</Text>
<Text variant="heading">Section Heading</Text>
<Text variant="body">Body paragraph text.</Text>
<Text variant="accent">Accent gradient</Text>
<Text variant="label">Section Label</Text>
<Text variant="code">const x = 42;</Text>`,
      },
      {
        label: 'Angular',
        lang: 'ts',
        code: `import { Component } from '@angular/core';
import { Text } from '@arclux/arc-ui-angular';

@Component({
  imports: [Text],
  template: \`
    <Text variant="display">Display Headline</Text>
    <Text variant="heading">Section Heading</Text>
    <Text variant="body">Body paragraph text.</Text>
    <Text variant="accent">Accent gradient</Text>
    <Text variant="label">Section Label</Text>
    <Text variant="code">const x = 42;</Text>
  \`,
})
export class MyComponent {}`,
      },
      {
        label: 'Solid',
        lang: 'tsx',
        code: `import { Text } from '@arclux/arc-ui-solid';

<Text variant="display">Display Headline</Text>
<Text variant="heading">Section Heading</Text>
<Text variant="body">Body paragraph text.</Text>
<Text variant="accent">Accent gradient</Text>
<Text variant="label">Section Label</Text>
<Text variant="code">const x = 42;</Text>`,
      },
      {
        label: 'Preact',
        lang: 'tsx',
        code: `import { Text } from '@arclux/arc-ui-preact';

<Text variant="display">Display Headline</Text>
<Text variant="heading">Section Heading</Text>
<Text variant="body">Body paragraph text.</Text>
<Text variant="accent">Accent gradient</Text>
<Text variant="label">Section Label</Text>
<Text variant="code">const x = 42;</Text>`,
      },
{ label: 'HTML', lang: 'html', code: `<!-- Auto-generated by @arclux/prism — do not edit manually -->
<!-- arc-text — requires text.css + tokens.css (or arc-ui.css) -->
<div class="arc-text">
  <p class="text--Variant">Text</p>
</div>` },
      { label: 'HTML (Inline)', lang: 'html', code: `<!-- Auto-generated by @arclux/prism — do not edit manually -->
<!-- arc-text — self-contained, no external CSS needed -->
<div class="arc-text" style="display: block">
  <p>Text</p>
</div>` }
    ],
  
  seeAlso: ["markdown","highlight","truncate"],
};
