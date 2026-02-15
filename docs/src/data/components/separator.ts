import type { ComponentDef } from './_types';

export const separator: ComponentDef = {
  name: 'Separator',
  slug: 'separator',
  tag: 'arc-separator',
  tier: 'content',
  interactivity: 'static',
  description: 'Visual divider for separating content sections. Supports horizontal and vertical orientations, multiple line styles, and optional inline labels.',

  overview: `Separator draws a thin line between content sections to create visual grouping and hierarchy. It replaces raw \`<hr>\` elements with a component that respects design tokens, supports vertical orientation for side-by-side layouts, and can carry an inline text label centered between two lines.

Four variants control the line style: solid (default), dashed, dotted, and fade. The fade variant uses a gradient that tapers to transparent at both ends, producing a softer visual break that works well in card layouts and sidebars. Labeled separators render the text between two line segments, useful for "or" dividers in auth forms or section markers in long lists.

The component sets \`role="separator"\` and \`aria-orientation\` automatically, ensuring assistive technology correctly identifies the divider and its direction.`,

  features: [
    'Horizontal and vertical orientations for flexible layout use',
    'Four line variants: solid, dashed, dotted, and fade (gradient taper)',
    'Optional inline label centered between two line segments',
    'Semantic `role="separator"` with automatic `aria-orientation`',
    'Uses `--border-default` token for consistent theme integration',
    'Exposed CSS parts: separator, line, label for per-instance styling',
  ],

  guidelines: {
    do: [
      'Use between logical groups of content — form sections, list categories, nav groups',
      'Use the fade variant for subtle breaks inside cards or sidebars',
      'Use a labeled separator for "or" dividers in auth flows or filter groups',
      'Use the vertical orientation to divide side-by-side toolbar groups',
    ],
    dont: [
      'Stack multiple separators without meaningful content between them',
      'Use a separator when whitespace alone provides sufficient visual grouping',
      'Use the label slot for long text — keep it to one or two words',
      'Use separator as a decorative border — it is a semantic content divider',
    ],
  },

  previewHtml: `<div style="display: flex; flex-direction: column; gap: 24px; width: 100%;">
  <arc-separator></arc-separator>
  <arc-separator variant="dashed"></arc-separator>
  <arc-separator variant="dotted"></arc-separator>
  <arc-separator variant="fade"></arc-separator>
  <arc-separator label="or"></arc-separator>
</div>`,

  props: [
    { name: 'orientation', type: "'horizontal' | 'vertical'", default: "'horizontal'", description: 'Controls the divider direction. Vertical separators display as inline-flex with full parent height.' },
    { name: 'label', type: 'string', default: "''", description: 'Optional text displayed centered between two line segments. Only applies to horizontal orientation.' },
    { name: 'variant', type: "'line' | 'dashed' | 'dotted' | 'fade'", default: "'line'", description: 'Controls the line style. Fade uses a gradient that tapers to transparent at both ends.' },
  ],

  tabs: [
    {
      label: 'Web Component',
      lang: 'html',
      code: `<arc-separator></arc-separator>
<arc-separator variant="dashed"></arc-separator>
<arc-separator variant="fade"></arc-separator>
<arc-separator label="or"></arc-separator>

<!-- Vertical in a toolbar -->
<div style="display: flex; align-items: center; gap: 8px; height: 32px;">
  <span>Left</span>
  <arc-separator orientation="vertical"></arc-separator>
  <span>Right</span>
</div>`,
    },
    {
      label: 'React',
      lang: 'tsx',
      code: `import { Separator } from '@arclux/arc-ui-react';

<Separator />
<Separator variant="dashed" />
<Separator variant="fade" />
<Separator label="or" />`,
    },
    {
      label: 'Vue',
      lang: 'html',
      code: `<script setup>
import { Separator } from '@arclux/arc-ui-vue';
</script>

<template>
  <Separator />
  <Separator variant="dashed" />
  <Separator variant="fade" />
  <Separator label="or" />
</template>`,
    },
    {
      label: 'Svelte',
      lang: 'html',
      code: `<script>
  import { Separator } from '@arclux/arc-ui-svelte';
</script>

<Separator />
<Separator variant="dashed" />
<Separator variant="fade" />
<Separator label="or" />`,
    },
    {
      label: 'Angular',
      lang: 'ts',
      code: `import { Component } from '@angular/core';
import { Separator } from '@arclux/arc-ui-angular';

@Component({
  imports: [Separator],
  template: \`
    <Separator />
    <Separator variant="dashed" />
    <Separator variant="fade" />
    <Separator label="or" />
  \`,
})
export class ContentSection {}`,
    },
    {
      label: 'Solid',
      lang: 'tsx',
      code: `import { Separator } from '@arclux/arc-ui-solid';

<Separator />
<Separator variant="dashed" />
<Separator variant="fade" />
<Separator label="or" />`,
    },
    {
      label: 'Preact',
      lang: 'tsx',
      code: `import { Separator } from '@arclux/arc-ui-preact';

<Separator />
<Separator variant="dashed" />
<Separator variant="fade" />
<Separator label="or" />`,
    },
    {
      label: 'HTML',
      lang: 'html',
      code: `<!-- Auto-generated by @arclux/prism — do not edit manually -->
<!-- arc-separator — requires separator.css + base.css (or arc-ui.css) -->
<div class="arc-separator">
  <div class="separator" role="separator" aria-orientation=""></div>
</div>`,
    },
    {
      label: 'HTML (Inline)',
      lang: 'html',
      code: `<!-- Auto-generated by @arclux/prism — do not edit manually -->
<!-- arc-separator — self-contained, no external CSS needed -->
<div class="arc-separator" style="display: block; width: 100%">
  <div style="width: 100%; height: 1px; background: rgb(42, 42, 92)" role="separator" aria-orientation=""></div>
</div>`,
    },
  ],

  seeAlso: ['divider'],
};
