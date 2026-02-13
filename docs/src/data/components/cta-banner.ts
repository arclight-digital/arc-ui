import type { ComponentDef } from './_types';

const previewMarkup = `<arc-cta-banner eyebrow="Ready to build?" headline="Start shipping with ARC UI.">
  <p>Install in seconds. Build in minutes. Ship production-ready interfaces that look incredible out of the box.</p>
  <arc-button slot="actions" href="/docs/getting-started" variant="primary" size="md">Get Started</arc-button>
  <arc-button slot="actions" href="/docs/components" variant="secondary" size="md">Explore Components</arc-button>
</arc-cta-banner>`;

export const ctaBanner: ComponentDef = {
    name: 'CTA Banner',
    slug: 'cta-banner',
    tag: 'arc-cta-banner',
    tier: 'content',
    interactivity: 'static',
    description: 'Full-width call-to-action banner with gradient background, eyebrow text, headline, body copy, and action buttons. Ideal for landing page CTAs, marketing sections, and page closers.',

    overview: `CtaBanner is a full-width promotional block designed for conversion-critical moments — page closers, hero-adjacent CTAs, and marketing sections. It combines an eyebrow label, a gradient-text headline, body copy, and an actions slot into a centered, vertically-stacked layout with a subtle radial gradient background.

The gradient background uses the same accent tokens as the rest of ARC UI, so it adapts automatically to custom themes. Set the \`nogradient\` attribute to disable the background effect for quieter contexts. Both the eyebrow and headline accept slot overrides for rich content beyond simple strings.

The component is fully responsive: on viewports below 768px, padding compresses and action buttons stack vertically. CSS parts are exposed on every semantic region so consumers can override styles without breaking encapsulation.`,

    features: [
      'Radial gradient background using accent-primary and accent-secondary tokens',
      'Gradient-text headline with responsive clamped font size (28–40px)',
      'Eyebrow label with accent gradient text treatment',
      'Actions slot for buttons with responsive stacking below 768px',
      'nogradient attribute to disable the background effect',
      'Slot overrides for eyebrow and headline for rich custom content',
      'CSS parts on every region: container, background, inner, eyebrow, headline, body, actions',
      'Automatic theme adaptation via design token system',
    ],

    guidelines: {
      do: [
        'Use at the bottom of landing pages as a page-closing CTA',
        'Keep the headline short and action-oriented — 6 words or fewer',
        'Provide at most two action buttons: one primary, one secondary',
        'Use the eyebrow to set context before the headline',
      ],
      dont: [
        'Stack multiple CTA banners on the same page — one is enough',
        'Use for informational content — use Callout or Card instead',
        'Omit both headline and eyebrow — the banner needs at least a headline',
        'Add more than two action buttons — too many choices reduces conversion',
      ],
    },

    previewHtml: `<div style="width:100%">${previewMarkup}</div>`,

    props: [
      { name: 'eyebrow', type: 'string', default: "''", description: 'Small label text displayed above the headline. Typically a short phrase like "Ready to build?" that sets context.' },
      { name: 'headline', type: 'string', default: "''", description: 'Main headline text rendered with gradient display styling. Keep it concise and action-oriented.' },
      { name: 'nogradient', type: 'boolean', default: 'false', description: 'When true, disables the radial gradient background effect for quieter contexts.' },
    ],
    events: [],

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
    <CtaBanner eyebrow="Ready to build?" headline="Start shipping with ARC UI.">
      <p>Install in seconds. Build in minutes. Ship production-ready interfaces.</p>
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
  <CtaBanner eyebrow="Ready to build?" headline="Start shipping with ARC UI.">
    <p>Install in seconds. Build in minutes. Ship production-ready interfaces.</p>
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

<CtaBanner eyebrow="Ready to build?" headline="Start shipping with ARC UI.">
  <p>Install in seconds. Build in minutes. Ship production-ready interfaces.</p>
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
    <CtaBanner eyebrow="Ready to build?" headline="Start shipping with ARC UI.">
      <p>Install in seconds. Build in minutes. Ship production-ready interfaces.</p>
      <Button slot="actions" href="/docs/getting-started" variant="primary" size="md">Get Started</Button>
      <Button slot="actions" href="/docs/components" variant="secondary" size="md">Explore Components</Button>
    </CtaBanner>
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
    <CtaBanner eyebrow="Ready to build?" headline="Start shipping with ARC UI.">
      <p>Install in seconds. Build in minutes. Ship production-ready interfaces.</p>
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
    <CtaBanner eyebrow="Ready to build?" headline="Start shipping with ARC UI.">
      <p>Install in seconds. Build in minutes. Ship production-ready interfaces.</p>
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
    ],
  };
