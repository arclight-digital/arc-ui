import type { ComponentDef } from './_types';

export const inset: ComponentDef = {
  name: 'Inset',
  slug: 'inset',
  tag: 'arc-inset',
  tier: 'layout',
  interactivity: 'static',
  description:
    'Padding primitive consuming spacing tokens with optional negative-margin bleed mode.',

  overview: `Inset pads its content on all four sides with one spacing token. Use it for the space around a block of content, and Stack for the gaps between siblings.

The \`space\` prop picks the token. The \`bleed\` prop adds a negative margin equal to that padding. Inside a parent padded by the same token, the Inset's box (its background and border) reaches the parent's edges while its content stays where it was.`,

  features: [
    'Each `space` value maps to one token: `--space-xs`, `--space-sm`, `--space-md`, `--space-lg`, `--space-xl` or `--space-2xl`',
  ],

  guidelines: {
    do: [
      'Use it for card bodies, dialog content and section interiors',
      'Use `space="lg"` or `space="xl"` for main content areas and `space="sm"` for compact UI',
      'Use `bleed` when a block\'s background should reach past its parent\'s padding',
    ],
    dont: [
      'Don\'t use Inset in place of Container. Container limits width, Inset adds padding',
      'Don\'t use `bleed` without a padded parent. The negative margin pushes the box outside it',
      'Don\'t hard-code pixel padding. Change the spacing tokens instead',
    ],
  },

  previewHtml: `<div style="width:100%;display:flex;flex-direction:column;gap:var(--space-md)">
  <div style="border:1px dashed var(--accent-primary);border-radius:var(--radius-sm)">
    <div style="padding:var(--space-lg);background:rgba(77,126,247,0.06);border-radius:var(--radius-sm)">
      <div style="color:var(--text-secondary);font-size:13px;font-family:var(--font-body);text-align:center">Inset space="lg"</div>
    </div>
  </div>
  <div style="border:1px dashed var(--accent-secondary);border-radius:var(--radius-sm)">
    <div style="padding:var(--space-sm);background:rgba(139,92,246,0.06);border-radius:var(--radius-sm)">
      <div style="color:var(--text-secondary);font-size:13px;font-family:var(--font-body);text-align:center">Inset space="sm"</div>
    </div>
  </div>
  <div style="border:1px dashed var(--accent-primary);border-radius:var(--radius-sm)">
    <div style="padding:var(--space-xl);background:rgba(77,126,247,0.06);border-radius:var(--radius-sm)">
      <div style="color:var(--text-secondary);font-size:13px;font-family:var(--font-body);text-align:center">Inset space="xl"</div>
    </div>
  </div>
</div>`,

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
    <arc-card>
      <arc-inset space="lg">
        <h3>Card Title</h3>
        <p>Content with consistent padding.</p>
      </arc-inset>
    </arc-card>

    <!-- Bleed mode -->
    <arc-inset space="lg">
      <p>Padded content above</p>
      <arc-inset bleed>
        <img src="/hero.jpg" alt="Full-width hero" style="width:100%">
      </arc-inset>
      <p>Padded content below</p>
    </arc-inset>
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
    {
      label: 'HTML',
      lang: 'html',
      code: `<!-- Auto-generated by @arclux/prism — do not edit manually -->
<!-- arc-inset — requires inset.css + base.css (or arc-ui.css) -->
<div class="arc-inset">
  Inset
</div>`,
    },
    {
      label: 'HTML (Inline)',
      lang: 'html',
      code: `<!-- Auto-generated by @arclux/prism — do not edit manually -->
<!-- arc-inset — self-contained, no external CSS needed -->
<div class="arc-inset" style="display: block; padding: 16px">
  Inset
</div>`,
    },
  ],

  seeAlso: ['container', 'stack', 'center'],
};
