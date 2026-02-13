import type { ComponentDef } from './_types';

export const colorSwatch: ComponentDef = {
    name: 'Color Swatch',
    slug: 'color-swatch',
    tag: 'arc-color-swatch',
    tier: 'content',
    interactivity: 'static',
    description: 'Color sample square with label — useful for token docs.',

    overview: `Color Swatch renders a colour sample square with a label underneath, making it the go-to component for design token documentation, palette displays, and theme previews. The colour is set via the \`color\` property and applied directly as a \`background-color\` inline style, so it accepts any valid CSS colour value — hex, rgb, hsl, or named colours.

The label defaults to displaying the colour value itself when no explicit label is provided, which is convenient for token reference tables. The label is rendered in monospace (\`--font-mono\`) at 11px with text overflow ellipsis, keeping the layout tidy even with long colour names or values. The swatch box includes a subtle border and a hover effect that brightens the border and adds a blue glow shadow.

Three size presets (\`sm\`, \`md\`, \`lg\`) control the swatch dimensions: 32px, 48px, and 64px respectively. The border radius also scales with size — \`--radius-sm\` for small, \`--radius-md\` for medium, and \`--radius-lg\` for large — maintaining visual consistency at each scale. The colour box includes \`role="img"\` with an \`aria-label\` for accessibility.`,

    features: [
      'Accepts any CSS colour value (hex, rgb, hsl, named) via the color property',
      'Auto-displays the colour value as the label when no explicit label is set',
      'Three size presets: sm (32px), md (48px), lg (64px) with matching border radii',
      'Hover effect with border brightening and blue glow shadow',
      'Monospace label with text-overflow ellipsis for long values',
      'role="img" with aria-label for screen reader accessibility',
      'CSS parts (swatch, color, label) for external styling',
    ],

    guidelines: {
      do: [
        'Use in a flex or grid row to display a palette of related colours',
        'Provide a human-readable label for design token documentation (e.g. "Primary Blue")',
        'Use the lg size for hero palette displays and sm for inline token tables',
        'Group swatches by category — accent colours, neutrals, semantic colours',
        'Use hex values for consistency in token reference docs',
      ],
      dont: [
        'Use colour swatches for interactive colour picking — this is a display-only component',
        'Set transparent or semi-transparent colours without a visible background behind the swatch',
        'Mix different swatch sizes in the same row — keep sizes consistent within a group',
        'Use very long labels that will be truncated — keep labels under 10 characters',
        'Rely solely on colour to convey meaning — always pair with a label',
      ],
    },

    previewHtml: `<div style="display: flex; gap: 16px; align-items: flex-end;">
  <arc-color-swatch color="#4d7ef7" label="Blue" size="lg"></arc-color-swatch>
  <arc-color-swatch color="#8b5cf6" label="Violet" size="lg"></arc-color-swatch>
  <arc-color-swatch color="#10b981" label="Success" size="lg"></arc-color-swatch>
  <arc-color-swatch color="#f59e0b" label="Warning" size="lg"></arc-color-swatch>
  <arc-color-swatch color="#ef4444" label="Error" size="lg"></arc-color-swatch>
</div>`,

    props: [
      { name: 'color', type: 'string', default: "'#4d7ef7'", description: 'Any valid CSS colour value applied as the swatch background' },
      { name: 'label', type: 'string', default: "''", description: 'Display label below the swatch; falls back to the colour value if empty' },
      { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Controls swatch dimensions: sm (32px), md (48px), lg (64px)' },
    ],
    tabs: [
      {
        label: 'Web Component',
        lang: 'html',
        code: `<arc-color-swatch color="#4d7ef7" label="Primary"></arc-color-swatch>
<arc-color-swatch color="#8b5cf6" label="Violet"></arc-color-swatch>`,
      },
      {
        label: 'React',
        lang: 'tsx',
        code: `import { ColorSwatch } from '@arclux/arc-ui-react';

<ColorSwatch color="#4d7ef7" label="Primary"></ColorSwatch>
<ColorSwatch color="#8b5cf6" label="Violet"></ColorSwatch>`,
      },
      {
        label: 'Vue',
        lang: 'html',
        code: `<script setup>
import { ColorSwatch } from '@arclux/arc-ui-vue';
</script>

<template>
  <ColorSwatch color="#4d7ef7" label="Primary"></ColorSwatch>
  <ColorSwatch color="#8b5cf6" label="Violet"></ColorSwatch>
</template>`,
      },
      {
        label: 'Svelte',
        lang: 'html',
        code: `<script>
  import { ColorSwatch } from '@arclux/arc-ui-svelte';
</script>

<ColorSwatch color="#4d7ef7" label="Primary"></ColorSwatch>
<ColorSwatch color="#8b5cf6" label="Violet"></ColorSwatch>`,
      },
      {
        label: 'Angular',
        lang: 'ts',
        code: `import { Component } from '@angular/core';
import { ColorSwatch } from '@arclux/arc-ui-angular';

@Component({
  imports: [ColorSwatch],
  template: \`
    <ColorSwatch color="#4d7ef7" label="Primary"></ColorSwatch>
    <ColorSwatch color="#8b5cf6" label="Violet"></ColorSwatch>
  \`,
})
export class MyComponent {}`,
      },
      {
        label: 'Solid',
        lang: 'tsx',
        code: `import { ColorSwatch } from '@arclux/arc-ui-solid';

<ColorSwatch color="#4d7ef7" label="Primary"></ColorSwatch>
<ColorSwatch color="#8b5cf6" label="Violet"></ColorSwatch>`,
      },
      {
        label: 'Preact',
        lang: 'tsx',
        code: `import { ColorSwatch } from '@arclux/arc-ui-preact';

<ColorSwatch color="#4d7ef7" label="Primary"></ColorSwatch>
<ColorSwatch color="#8b5cf6" label="Violet"></ColorSwatch>`,
      },
      { label: 'HTML', lang: 'html', code: `<!-- Auto-generated by @arclux/prism — do not edit manually -->
<!-- arc-color-swatch — requires color-swatch.css + tokens.css (or arc-ui.css) -->
<span class="arc-color-swatch">
  <div class="swatch">
   <div
   class="swatch__color"
   style="background-color:Color"
   role="img"
   ></div>
   <span class="swatch__label"></span>
   </div>
</span>` },
      { label: 'HTML (Inline)', lang: 'html', code: `<!-- Auto-generated by @arclux/prism — do not edit manually -->
<!-- arc-color-swatch — self-contained, no external CSS needed -->
<style>
  .arc-color-swatch .swatch__color:hover { border-color: rgb(51, 51, 64);
        box-shadow: 0 0 12px rgba(77, 126, 247, 0.1); }
</style>
<span class="arc-color-swatch" style="display: inline-flex">
  <div class="swatch" style="display: flex; flex-direction: column; align-items: center; gap: 8px">
   <div
   class="swatch__color" style="border-radius: 10px; border: 1px solid rgb(34, 34, 41)"
   style="background-color:Color"
   role="img"
   ></div>
   <span style="font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: 11px; color: rgb(124, 124, 137); text-align: center; max-width: 80px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap"></span>
   </div>
</span>` }
    ],
  };
