import type { ComponentDef } from './_types';

const previewMarkup = `<arc-cta-banner eyebrow="Ready when you are" headline="Build something that glows.">
  <p>A package for each of React, Vue, Svelte, Angular, Solid and Preact, and web components for plain HTML. MIT licensed.</p>
  <arc-button slot="actions" href="/docs/getting-started" variant="primary" size="md">Read the install guide</arc-button>
  <arc-button slot="actions" href="/docs/components" variant="secondary" size="md">Browse components</arc-button>
</arc-cta-banner>`;

export const ctaBanner: ComponentDef = {
  name: 'CTA Banner',
  slug: 'cta-banner',
  tag: 'arc-cta-banner',
  tier: 'content',
  interactivity: 'static',
  description:
    'Full-width call-to-action banner with an eyebrow, a gradient headline, body copy and action buttons.',

  overview: `CtaBanner is a centered block that closes a landing page or a marketing section. From top to bottom it stacks an \`eyebrow\` label, a gradient-text \`headline\`, the default slot for body copy and an \`actions\` slot for buttons, over a radial gradient made from the accent tokens. Set \`nogradient\` to turn the background off.

The \`eyebrow\` and \`headline\` slots take markup when a plain string isn't enough. Below 768px the padding shrinks and the buttons stack.`,

  features: [
    'The headline uses `--text-2xl`, which scales from 28px to 36px',
    'CSS parts: `container`, `background`, `inner`, `eyebrow`, `headline`, `body`, `actions`',
  ],

  guidelines: {
    do: [
      'Keep the headline short and about the action, 6 words or fewer',
      'Use two buttons at most, one primary and one secondary',
      'Use the eyebrow to set context before the headline',
    ],
    dont: [
      'Don\'t put more than one on a page',
      'Don\'t use it for information. Use an Alert or a Card',
      'Don\'t leave out the headline',
    ],
  },

  previewHtml: `<div style="width:100%">${previewMarkup}</div>`,

  tabs: [
    {
      label: 'Web Component',
      lang: 'html',
      code: `<script type="module" src="@arclux/arc-ui"></script>

${previewMarkup}`,
    },
    {
      label: 'React',
      lang: 'tsx',
      code: `import { Button, CtaBanner } from '@arclux/arc-ui-react';

export function PageCTA() {
  return (
    <CtaBanner eyebrow="Ready when you are" headline="Build something that glows.">
      <p>One package for plain HTML, a native one for each of seven frameworks. MIT licensed.</p>
      <Button slot="actions" href="/docs/getting-started" variant="primary" size="md">Get Started</Button>
      <Button slot="actions" href="/docs/components" variant="secondary" size="md">Explore Components</Button>
    </CtaBanner>
  );
}`,
    },
    {
      label: 'Vue',
      lang: 'html',
      code: `<script setup>
import { Button, CtaBanner } from '@arclux/arc-ui-vue';
</script>

<template>
  <CtaBanner eyebrow="Ready when you are" headline="Build something that glows.">
    <p>One package for plain HTML, a native one for each of seven frameworks. MIT licensed.</p>
    <Button slot="actions" href="/docs/getting-started" variant="primary" size="md">Get Started</Button>
    <Button slot="actions" href="/docs/components" variant="secondary" size="md">Explore Components</Button>
  </CtaBanner>
</template>`,
    },
    {
      label: 'Svelte',
      lang: 'html',
      code: `<script>
  import { Button, CtaBanner } from '@arclux/arc-ui-svelte';
</script>

<CtaBanner eyebrow="Ready when you are" headline="Build something that glows.">
  <p>One package for plain HTML, a native one for each of seven frameworks. MIT licensed.</p>
  <Button slot="actions" href="/docs/getting-started" variant="primary" size="md">Get Started</Button>
  <Button slot="actions" href="/docs/components" variant="secondary" size="md">Explore Components</Button>
</CtaBanner>`,
    },
    {
      label: 'Angular',
      lang: 'ts',
      code: `import { Component } from '@angular/core';
import { Button, CtaBanner } from '@arclux/arc-ui-angular';

@Component({
  imports: [Button, CtaBanner],
  template: \`
    <arc-cta-banner eyebrow="Ready when you are" headline="Build something that glows.">
      <p>One package for plain HTML, a native one for each of seven frameworks. MIT licensed.</p>
      <arc-button slot="actions" href="/docs/getting-started" variant="primary" size="md">Get Started</arc-button>
      <arc-button slot="actions" href="/docs/components" variant="secondary" size="md">Explore Components</arc-button>
    </arc-cta-banner>
  \`,
})
export class PageCTAComponent {}`,
    },
    {
      label: 'Solid',
      lang: 'tsx',
      code: `import { Button, CtaBanner } from '@arclux/arc-ui-solid';

export function PageCTA() {
  return (
    <CtaBanner eyebrow="Ready when you are" headline="Build something that glows.">
      <p>One package for plain HTML, a native one for each of seven frameworks. MIT licensed.</p>
      <Button slot="actions" href="/docs/getting-started" variant="primary" size="md">Get Started</Button>
      <Button slot="actions" href="/docs/components" variant="secondary" size="md">Explore Components</Button>
    </CtaBanner>
  );
}`,
    },
    {
      label: 'Preact',
      lang: 'tsx',
      code: `import { Button, CtaBanner } from '@arclux/arc-ui-preact';

export function PageCTA() {
  return (
    <CtaBanner eyebrow="Ready when you are" headline="Build something that glows.">
      <p>One package for plain HTML, a native one for each of seven frameworks. MIT licensed.</p>
      <Button slot="actions" href="/docs/getting-started" variant="primary" size="md">Get Started</Button>
      <Button slot="actions" href="/docs/components" variant="secondary" size="md">Explore Components</Button>
    </CtaBanner>
  );
}`,
    },
    {
      label: 'HTML',
      lang: 'html',
      code: previewMarkup,
    },

    {
      label: 'HTML (Inline)',
      lang: 'html',
      code: `<!-- Auto-generated by @arclux/prism — do not edit manually -->
<!-- arc-cta-banner — self-contained, no external CSS needed -->
<style>
  @media (max-width: 768px) {
    .arc-cta-banner .cta { padding: 40px var(--space-md); }
  }
  @media (max-width: 768px) {
    .arc-cta-banner .cta__actions { flex-direction: column; align-items: center; }
  }
</style>
<div class="arc-cta-banner" style="display: block; position: relative; overflow: hidden">
  <div class="cta" style="position: relative; padding: 96px 24px">
    <div style="position: absolute; inset: 0; background: radial-gradient(ellipse at 30% 50%, rgba(77, 126, 247, 0.1), transparent 60%),
            radial-gradient(ellipse at 70% 50%, rgba(139, 92, 246, 0.08), transparent 60%); pointer-events: none"></div>
    <div style="position: relative; max-width: 1120px; margin-inline: auto; display: flex; flex-direction: column; align-items: center; text-align: center; gap: 16px">
      Eyebrow
      Headline
      <div style="color: rgb(160, 165, 195); font-size: 15px; max-width: 480px; text-wrap: balance; line-height: 1.7">
        Cta Banner
      </div>
      <div class="cta__actions" style="display: flex; gap: var(--space-md); margin-top: 8px">

      </div>
    </div>
  </div>
</div>`,
    },
  ],

  seeAlso: ['alert', 'feature-card', 'button'],
};
