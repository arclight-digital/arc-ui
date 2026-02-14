import type { ComponentDef } from './_types';

export const section: ComponentDef = {
    name: 'Section',
    slug: 'section',
    tag: 'arc-section',
    tier: 'layout',
    interactivity: 'static',
    description: 'Page section with optional uppercase label, consistent spacing.',

    overview: `Section is a vertical spacing and labeling primitive that wraps a block of page content in consistent padding and an optional uppercase label. It renders a semantic \`<section>\` element, centres its children at \`--max-width\`, and applies generous top and bottom padding (\`--space-3xl\`) that automatically tightens on screens narrower than 768px. Use it to divide a long page into visually distinct bands without manually managing padding or breakpoints.

The optional \`label\` prop renders a small, uppercase, accent-font heading above the slot content. This label uses the \`--section-title-weight\`, \`--section-title-size\`, and \`--section-title-spacing\` tokens, so it stays consistent with every other section label in your application. It is deliberately muted (\`--text-muted\`) and typeset with \`--font-accent\` to serve as an orienting waypoint rather than a competing heading.

Section sets \`scroll-margin-top: var(--space-md)\` on its inner wrapper, which means when you link to a section by ID (or pair it with ScrollSpy), the browser scrolls to the right position with breathing room above the sticky nav bar. Combine Section with Container for width-constrained pages, or use it inside full-bleed layouts where the section itself handles horizontal centering.`,

    features: [
      'Semantic <section> element for accessible document structure',
      'Optional uppercase label using --font-accent and --section-title-* tokens',
      'Consistent vertical padding (--space-3xl) that tightens on mobile at 768px',
      'Automatic horizontal centering at --max-width with --space-lg inline padding',
      'Built-in scroll-margin-top for correct anchor-link positioning under sticky headers',
      'Exposed CSS parts (section, label) for targeted ::part() styling',
      'Responsive padding reduction via a built-in media query',
    ],

    guidelines: {
      do: [
        'Use Section to divide landing pages into logical content bands (features, pricing, testimonials)',
        'Set the label prop for orientation -- it helps users scan the page structure at a glance',
        'Give each Section an id attribute so ScrollSpy and anchor links work correctly',
        'Pair Section with Container when you need an additional width constraint inside a full-bleed band',
        'Keep label text short -- one or two words is ideal for uppercase labels',
      ],
      dont: [
        'Nest Section inside Section -- use a heading or Divider for sub-grouping instead',
        'Use Section as a generic flex container; it is a vertical spacing and labeling wrapper only',
        'Override the responsive padding without testing on mobile screens',
        'Rely on Section for navigation structure -- use PageLayout or SettingsLayout instead',
        'Place form elements directly inside Section without a Container for width constraint',
      ],
    },

    previewHtml: `<div style="width:100%;border:1px solid var(--border-subtle);border-radius:var(--radius-md);overflow:hidden;background:var(--bg-surface)">
  <arc-section label="Features">
    <h2 style="margin:0 0 8px;font-family:var(--font-body);font-size:22px;font-weight:700;color:var(--text-primary)">What We Offer</h2>
    <p style="margin:0;color:var(--text-secondary);font-size:15px;line-height:1.6;font-family:var(--font-body)">A comprehensive set of UI primitives that handle layout, theming, and accessibility out of the box.</p>
  </arc-section>
</div>`,

    props: [
      { name: 'label', type: 'string', description: 'Section label displayed in uppercase above content' },
    ],
    tabs: [
      {
        label: 'Web Component',
        lang: 'html',
        code: `<arc-section label="Features">
  <h2>What We Offer</h2>
  <p>Section content here.</p>
</arc-section>`,
      },
      {
        label: 'React',
        lang: 'tsx',
        code: `import { Section } from '@arclux/arc-ui-react';

<Section label="Features">
  <h2>What We Offer</h2>
  <p>Section content here.</p>
</Section>`,
      },
      
      {
        label: 'Vue',
        lang: 'html',
        code: `<script setup>
import { Section } from '@arclux/arc-ui-vue';
</script>

<template>
  <Section label="Features">
    <h2>What We Offer</h2>
    <p>Section content here.</p>
  </Section>
</template>`,
      },
      {
        label: 'Svelte',
        lang: 'html',
        code: `<script>
  import { Section } from '@arclux/arc-ui-svelte';
</script>

<Section label="Features">
  <h2>What We Offer</h2>
  <p>Section content here.</p>
</Section>`,
      },
      {
        label: 'Angular',
        lang: 'ts',
        code: `import { Component } from '@angular/core';
import { Section } from '@arclux/arc-ui-angular';

@Component({
  imports: [Section],
  template: \`
    <Section label="Features">
      <h2>What We Offer</h2>
      <p>Section content here.</p>
    </Section>
  \`,
})
export class MyComponent {}`,
      },
      {
        label: 'Solid',
        lang: 'tsx',
        code: `import { Section } from '@arclux/arc-ui-solid';

<Section label="Features">
  <h2>What We Offer</h2>
  <p>Section content here.</p>
</Section>`,
      },
      {
        label: 'Preact',
        lang: 'tsx',
        code: `import { Section } from '@arclux/arc-ui-preact';

<Section label="Features">
  <h2>What We Offer</h2>
  <p>Section content here.</p>
</Section>`,
      },
{ label: 'HTML', lang: 'html', code: `<!-- Auto-generated by @arclux/prism — do not edit manually -->
<!-- arc-section — requires section.css + tokens.css (or arc-ui.css) -->
<div class="arc-section">
  <section class="section">
   Label
   Section
   </section>
</div>` },
      { label: 'HTML (Inline)', lang: 'html', code: `<!-- Auto-generated by @arclux/prism — do not edit manually -->
<!-- arc-section — self-contained, no external CSS needed -->
<style>
  @media (max-width: 768px) {
    .arc-section .section { padding: 64px 16px; }
  }
</style>
<div class="arc-section" style="display: block">
  <section class="section" style="width: 100%; max-width: 1120px; margin-inline: auto; padding: 96px 24px; scroll-margin-top: 16px">
   Label
   Section
   </section>
</div>` }
    ],
  
  seeAlso: ["container","divider","page-layout"],
};
