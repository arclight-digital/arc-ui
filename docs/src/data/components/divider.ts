import type { ComponentDef } from './_types';

export const divider: ComponentDef = {
  name: 'Divider',
  slug: 'divider',
  tag: 'arc-divider',
  tier: 'content',
  interactivity: 'static',
  searchKeywords: ['separator', 'hr', 'rule', 'dashed', 'dotted'],
  description: 'Horizontal or vertical rule in nine styles, plain or glowing.',

  overview: `Divider is a rule between sections. It has nine variants in two families, and picking the family comes first.

**The illuminated set** is what Divider has always drawn. The default \`subtle\` is a token gradient that fades at both edges. \`glow\` adds a shimmer that loops every 6 seconds, using an \`--accent-secondary\` overlay with \`mix-blend-mode: screen\`, and stops under reduced motion. \`line-white\`, \`line-primary\` and \`line-gradient\` are centered 2px rules capped at 160px, 200px and 240px, for decorative breaks in a hero or between card groups. \`line-primary\` and \`line-gradient\` also cast a box-shadow glow.

**The plain set came from \`arc-separator\`, which merged in here in v4.** \`dashed\` and \`dotted\` are the ordinary rules those names describe, and \`line\` is a flat single-color rule with no fade. \`fade\` is a flat, neutral edge-to-edge fade. \`subtle\` reads the \`--gradient-divider\` token instead, which is neutral in the default dark theme and tinted with the primary accent in the light theme. Migrating from Separator, the variants carry over unchanged and \`orientation="vertical"\` becomes the \`vertical\` flag. See [the Separator removal note](/docs/components/separator).

\`vertical\` turns any variant into a top-to-bottom rule for a flex row, with \`aria-orientation="vertical"\`. \`label\` puts text in the middle of a horizontal divider, like the "OR" between two options. \`align="left"\` or \`"right"\` makes a gradient fade from one edge instead of both. The divider is a \`<div>\` with \`role="separator"\`.`,

  features: [
    'CSS parts: `divider`, plus `line` and `label` on a labeled divider',
  ],

  guidelines: {
    do: [
      'Use `subtle` as the everyday separator between sections',
      'Use `dashed` or `dotted` where the rule marks a boundary instead of decorating one, such as a drop zone, an optional section or a cut line',
      'Use `line` for a plain flat rule. It\'s the closest variant to a bare `<hr>`',
      'Use `line-gradient` or `line-primary` as decorative breaks in hero and feature sections',
      'Save `glow` for major section breaks',
    ],
    dont: [
      'Don\'t put several glow dividers close together. The shimmers compete',
      'Don\'t use the centered line variants in dense layouts. Their capped width leaves empty space on both sides',
      'Don\'t rely on a divider alone to separate content. Use headings too',
    ],
  },

  previewHtml: `<div style="display: flex; flex-direction: column; gap: 24px; width: 100%;">
  <arc-divider variant="subtle"></arc-divider>
  <arc-divider variant="glow"></arc-divider>
  <arc-divider variant="line-white"></arc-divider>
  <arc-divider variant="line-primary"></arc-divider>
  <arc-divider variant="line-gradient"></arc-divider>
  <arc-divider variant="dashed"></arc-divider>
  <arc-divider variant="dotted"></arc-divider>
  <arc-divider variant="fade"></arc-divider>
  <arc-divider variant="line"></arc-divider>
  <arc-divider label="OR"></arc-divider>
  <arc-divider variant="glow" align="left"></arc-divider>
  <div style="display: flex; align-items: center; gap: 16px; height: 40px;">
    <span style="color: var(--text-secondary)">Left</span>
    <arc-divider vertical variant="line-primary"></arc-divider>
    <span style="color: var(--text-secondary)">Right</span>
  </div>
</div>`,

  tabs: [
    {
      label: 'Web Component',
      lang: 'html',
      code: `<arc-divider></arc-divider>
<arc-divider variant="glow"></arc-divider>
<arc-divider variant="line-gradient"></arc-divider>

<!-- The plain rules, absorbed from arc-separator -->
<arc-divider variant="dashed"></arc-divider>
<arc-divider variant="dotted"></arc-divider>
<arc-divider variant="fade"></arc-divider>
<arc-divider variant="line"></arc-divider>

<!-- Labeled divider -->
<arc-divider label="OR"></arc-divider>

<!-- Left-aligned gradient -->
<arc-divider variant="glow" align="left"></arc-divider>

<!-- Vertical divider between inline elements -->
<div style="display: flex; align-items: center; gap: 16px; height: 40px;">
  <span>Section A</span>
  <arc-divider vertical variant="line-primary"></arc-divider>
  <span>Section B</span>
</div>`,
    },
    {
      label: 'React',
      lang: 'tsx',
      code: `import { Divider } from '@arclux/arc-ui-react';

export default function Example() {
  return (
    <>
      <Divider />
      <Divider variant="glow" />
      <Divider variant="line-gradient" />

      {/* Labeled */}
      <Divider label="OR" />

      {/* Left-aligned */}
      <Divider variant="glow" align="left" />

      {/* Vertical */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, height: 40 }}>
        <span>Section A</span>
        <Divider vertical variant="line-primary" />
        <span>Section B</span>
      </div>
    </>
  );
}`,
    },

    {
      label: 'Vue',
      lang: 'html',
      code: `<script setup>
import { Divider } from '@arclux/arc-ui-vue';
</script>

<template>
  <Divider />
  <Divider variant="glow" />
  <Divider variant="line-gradient" />
</template>`,
    },
    {
      label: 'Svelte',
      lang: 'html',
      code: `<script>
  import { Divider } from '@arclux/arc-ui-svelte';
</script>

<Divider />
<Divider variant="glow" />
<Divider variant="line-gradient" />`,
    },
    {
      label: 'Angular',
      lang: 'ts',
      code: `import { Component } from '@angular/core';
import { Divider } from '@arclux/arc-ui-angular';

@Component({
  imports: [Divider],
  template: \`
    <arc-divider></arc-divider>
    <arc-divider variant="glow"></arc-divider>
    <arc-divider variant="line-gradient"></arc-divider>
  \`,
})
export class MyComponent {}`,
    },
    {
      label: 'Solid',
      lang: 'tsx',
      code: `import { Divider } from '@arclux/arc-ui-solid';

export default function Example() {
  return (
    <>
      <Divider />
      <Divider variant="glow" />
      <Divider variant="line-gradient" />
    </>
  );
}`,
    },
    {
      label: 'Preact',
      lang: 'tsx',
      code: `import { Divider } from '@arclux/arc-ui-preact';

export default function Example() {
  return (
    <>
      <Divider />
      <Divider variant="glow" />
      <Divider variant="line-gradient" />
    </>
  );
}`,
    },
    {
      label: 'HTML',
      lang: 'html',
      code: `<!-- Auto-generated by @arclux/prism — do not edit manually -->
<!-- arc-divider — requires divider.css + base.css (or arc-ui.css) -->
<div class="arc-divider">
  <div class="divider" role="separator"></div>
</div>`,
    },
    {
      label: 'HTML (Inline)',
      lang: 'html',
      code: `<!-- Auto-generated by @arclux/prism — do not edit manually -->
<!-- arc-divider — self-contained, no external CSS needed -->
<style>
  @media (prefers-reduced-motion: reduce) {
    .arc-divider[data-variant="glow"] .divider::after { animation: none; }
  }
</style>
<div class="arc-divider" style="display: block; width: 100%">
  <div class="divider" style="width: 100%; height: 1px" role="separator"></div>
</div>`,
    },
  ],

  seeAlso: ['section'],
};
