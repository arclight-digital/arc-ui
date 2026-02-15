import type { ComponentDef } from './_types';

export const inset: ComponentDef = {
    name: 'Inset',
    slug: 'inset',
    tag: 'arc-inset',
    tier: 'layout',
    interactivity: 'static',
    description: 'Padding primitive consuming spacing tokens with optional negative-margin bleed mode.',

    overview: `Inset is a spacing primitive that applies consistent padding to its children using design system spacing tokens. It is the padding counterpart to Stack (which handles vertical spacing between siblings) — where Stack controls the gaps between elements, Inset controls the breathing room around a block of content.

The \`space\` prop maps directly to spacing tokens (xs through 2xl), ensuring padding values stay in sync with the design system across all components. This eliminates ad-hoc padding values and guarantees visual consistency whether the Inset wraps a card body, a section interior, or a dialog content area.

The \`bleed\` prop activates negative-margin mode, which allows the Inset's children to break out of a parent's existing padding. This is useful when you have a padded container but want a specific child — like a full-width image or a divider — to extend edge-to-edge. Bleed applies a negative margin equal to the space value, effectively canceling the parent's padding for that element.`,

    features: [
      'Consistent padding via design system spacing tokens (xs through 2xl)',
      'Bleed mode with negative margins to break out of parent padding',
      'Maps directly to --space-xs, --space-sm, --space-md, --space-lg, --space-xl, --space-2xl tokens',
      'Lightweight wrapper with zero JavaScript overhead',
      'Composable with Stack, Container, and other layout primitives',
      'CSS part: `inset` for targeted ::part() styling',
    ],

    guidelines: {
      do: [
        'Use Inset for card body padding, dialog content areas, and section interiors',
        'Use space="lg" or space="xl" for primary content areas; space="sm" for compact UI',
        'Use bleed mode to make full-width images or dividers extend past parent padding',
        'Combine with Stack for interior layouts: Inset for padding, Stack for vertical spacing',
        'Prefer Inset over custom padding styles to maintain token-based consistency',
      ],
      dont: [
        'Do not use Inset as a substitute for Container — Container constrains width, Inset adds padding',
        'Do not nest Inset inside Inset unless you intentionally want compound padding',
        'Do not use bleed mode without a padded parent — negative margins will misalign content',
        'Do not use Inset for spacing between sibling elements — use Stack or gap utilities instead',
        'Do not hardcode pixel values; adjust the spacing tokens globally instead',
      ],
    },

    previewHtml: `<div style="width:100%;display:flex;flex-direction:column;gap:var(--space-md)">
  <div style="border:1px dashed var(--accent-primary);border-radius:var(--radius-sm)">
    <div style="padding:var(--space-lg);background:rgba(77,126,247,0.06);border-radius:var(--radius-sm)">
      <div style="color:var(--text-secondary);font-size:13px;font-family:var(--font-body);text-align:center">Inset space="lg" — 24px padding</div>
    </div>
  </div>
  <div style="border:1px dashed var(--accent-secondary);border-radius:var(--radius-sm)">
    <div style="padding:var(--space-sm);background:rgba(139,92,246,0.06);border-radius:var(--radius-sm)">
      <div style="color:var(--text-secondary);font-size:13px;font-family:var(--font-body);text-align:center">Inset space="sm" — 8px padding</div>
    </div>
  </div>
  <div style="border:1px dashed var(--accent-primary);border-radius:var(--radius-sm)">
    <div style="padding:var(--space-xl);background:rgba(77,126,247,0.06);border-radius:var(--radius-sm)">
      <div style="color:var(--text-secondary);font-size:13px;font-family:var(--font-body);text-align:center">Inset space="xl" — 32px padding</div>
    </div>
  </div>
</div>`,

    props: [
      { name: 'space', type: "'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'", default: "'md'", description: 'Padding size mapped to a design system spacing token. Controls all four sides equally.' },
      { name: 'bleed', type: 'boolean', default: 'false', description: 'When true, applies negative margins equal to the space value, allowing children to break out of a parent container\'s padding for full-bleed layouts.' },
    ],

    tabs: [
      {
        label: 'Web Component',
        lang: 'html',
        code: `<arc-card>
  <arc-inset space="lg">
    <h3>Card Title</h3>
    <p>Content with consistent padding from the Inset primitive.</p>
  </arc-inset>
</arc-card>

<!-- Bleed mode: image breaks out of parent padding -->
<arc-inset space="lg">
  <p>Padded content above</p>
  <arc-inset bleed>
    <img src="/hero.jpg" alt="Full-width hero" style="width:100%">
  </arc-inset>
  <p>Padded content below</p>
</arc-inset>`,
      },
      {
        label: 'React',
        lang: 'tsx',
        code: `import { Inset, Card } from '@arclux/arc-ui-react';

function CardWithInset() {
  return (
    <Card>
      <Inset space="lg">
        <h3>Card Title</h3>
        <p>Content with consistent padding.</p>
      </Inset>
    </Card>
  );
}

// Bleed mode
function BleedExample() {
  return (
    <Inset space="lg">
      <p>Padded content above</p>
      <Inset bleed>
        <img src="/hero.jpg" alt="Full-width hero" style={{ width: '100%' }} />
      </Inset>
      <p>Padded content below</p>
    </Inset>
  );
}`,
      },
      {
        label: 'Vue',
        lang: 'html',
        code: `<script setup>
import { Inset, Card } from '@arclux/arc-ui-vue';
</script>

<template>
  <Card>
    <Inset space="lg">
      <h3>Card Title</h3>
      <p>Content with consistent padding.</p>
    </Inset>
  </Card>

  <!-- Bleed mode -->
  <Inset space="lg">
    <p>Padded content above</p>
    <Inset bleed>
      <img src="/hero.jpg" alt="Full-width hero" style="width:100%">
    </Inset>
    <p>Padded content below</p>
  </Inset>
</template>`,
      },
      {
        label: 'Svelte',
        lang: 'html',
        code: `<script>
  import { Inset, Card } from '@arclux/arc-ui-svelte';
</script>

<Card>
  <Inset space="lg">
    <h3>Card Title</h3>
    <p>Content with consistent padding.</p>
  </Inset>
</Card>

<!-- Bleed mode -->
<Inset space="lg">
  <p>Padded content above</p>
  <Inset bleed>
    <img src="/hero.jpg" alt="Full-width hero" style="width:100%">
  </Inset>
  <p>Padded content below</p>
</Inset>`,
      },
      {
        label: 'Angular',
        lang: 'ts',
        code: `import { Component } from '@angular/core';
import { Inset, Card } from '@arclux/arc-ui-angular';

@Component({
  imports: [Inset, Card],
  template: \`
    <Card>
      <Inset space="lg">
        <h3>Card Title</h3>
        <p>Content with consistent padding.</p>
      </Inset>
    </Card>

    <!-- Bleed mode -->
    <Inset space="lg">
      <p>Padded content above</p>
      <Inset bleed>
        <img src="/hero.jpg" alt="Full-width hero" style="width:100%">
      </Inset>
      <p>Padded content below</p>
    </Inset>
  \`,
})
export class InsetExampleComponent {}`,
      },
      {
        label: 'Solid',
        lang: 'tsx',
        code: `import { Inset, Card } from '@arclux/arc-ui-solid';

function CardWithInset() {
  return (
    <Card>
      <Inset space="lg">
        <h3>Card Title</h3>
        <p>Content with consistent padding.</p>
      </Inset>
    </Card>
  );
}`,
      },
      {
        label: 'Preact',
        lang: 'tsx',
        code: `import { Inset, Card } from '@arclux/arc-ui-preact';

function CardWithInset() {
  return (
    <Card>
      <Inset space="lg">
        <h3>Card Title</h3>
        <p>Content with consistent padding.</p>
      </Inset>
    </Card>
  );
}`,
      },
      { label: 'HTML', lang: 'html', code: `<!-- See HTML tab after running pnpm generate -->
<div class="arc-inset">...</div>` },
      { label: 'HTML (Inline)', lang: 'html', code: `<!-- See HTML (Inline) tab after running pnpm generate -->
<div class="arc-inset" style="padding:var(--space-md)">...</div>` },
    ],

  seeAlso: ['container', 'stack', 'center'],
};
