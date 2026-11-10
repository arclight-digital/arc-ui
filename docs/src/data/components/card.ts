import type { ComponentDef } from './_types';

export const card: ComponentDef = {
  name: 'Card',
  slug: 'card',
  tag: 'arc-card',
  tier: 'content',
  interactivity: 'static',
  description:
    'Content container with a border and hover effects. When it links somewhere, the whole surface is the link and the border turns to a gradient on hover.',

  overview: `Card wraps its content in a rounded, bordered surface. It has no opinion about the layout inside: slot headings, paragraphs, badges, icons or images and style them yourself. The card handles the border, radius, background, padding and focus ring.

To make the whole card a link, set \`href\`, or wrap the content in a single \`<a>\`. The slotted anchor works before the script loads and with JavaScript off, so use it on public pages. Either way, on hover the border turns to a gradient from the accent-primary to the accent-secondary color and the inner surface lifts with a shadow. Linked cards suit navigation grids, project lists and dashboard tiles.`,

  features: [
    "A footer slot for actions, links or metadata. It stays outside a slotted anchor, so its buttons click on their own, and it's hidden when empty",
    'Padding tightens at 768 px and below',
    'The card fills its grid cell (`height: 100%`), so cards in a row come out the same height',
  ],

  guidelines: {
    do: [
      'Put cards in a CSS Grid or flex layout so they size consistently',
      'Keep the content short: a heading, a short description and optional metadata',
      'Use arc-badge or arc-tag inside a card to show status or category',
    ],
    dont: [
      "Don't put buttons or links in a card with href. The whole card, footer included, is one link. With a slotted anchor, put them in the footer slot",
      "Don't use a card for a single line of text. Use a list",
      "Don't fill a card until it needs scrolling. Split the content into sections",
      "Don't mix linked and plain cards in one grid unless they look different",
    ],
  },

  previewHtml: `<div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; min-width: 700px;">
  <arc-card href="/projects/atlas">
    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
      <h3 style="margin: 0; font-size: 1.1rem;">Project Atlas</h3>
      <arc-badge variant="info">Active</arc-badge>
    </div>
    <p style="margin: 0 0 16px; color: var(--text-muted); font-size: 0.875rem; line-height: 1.5;">Cloud migration toolkit for legacy enterprise systems. Automates dependency mapping and generates infrastructure-as-code templates.</p>
    <span style="font-size: 0.75rem; color: var(--text-subtle);">Updated 2 days ago</span>
  </arc-card>

  <arc-card href="/projects/meridian">
    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
      <h3 style="margin: 0; font-size: 1.1rem;">Meridian API</h3>
      <arc-badge variant="success">Shipped</arc-badge>
    </div>
    <p style="margin: 0 0 16px; color: var(--text-muted); font-size: 0.875rem; line-height: 1.5;">GraphQL gateway that puts three internal services behind a single schema.</p>
    <span style="font-size: 0.75rem; color: var(--text-subtle);">Updated 5 days ago</span>
  </arc-card>

  <arc-card href="/projects/nightfall">
    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
      <h3 style="margin: 0; font-size: 1.1rem;">Nightfall Theme</h3>
      <arc-badge variant="warning">Beta</arc-badge>
    </div>
    <p style="margin: 0 0 16px; color: var(--text-muted); font-size: 0.875rem; line-height: 1.5;">Dark-mode design tokens and component skins for the internal tools.</p>
    <span style="font-size: 0.75rem; color: var(--text-subtle);">Updated today</span>
  </arc-card>
</div>`,

  tabs: [
    {
      label: 'Web Component',
      lang: 'html',
      code: `<div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px;">
  <arc-card href="/projects/atlas">
    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
      <h3 style="margin: 0; font-size: 1.1rem;">Project Atlas</h3>
      <arc-badge variant="info">Active</arc-badge>
    </div>
    <p style="margin: 0 0 16px; color: var(--text-muted); font-size: 0.875rem;">Cloud migration toolkit for legacy enterprise systems. Automates dependency mapping and generates infrastructure-as-code templates.</p>
    <span style="font-size: 0.75rem; color: var(--text-subtle);">Updated 2 days ago</span>
  </arc-card>

  <arc-card href="/projects/meridian">
    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
      <h3 style="margin: 0; font-size: 1.1rem;">Meridian API</h3>
      <arc-badge variant="success">Shipped</arc-badge>
    </div>
    <p style="margin: 0 0 16px; color: var(--text-muted); font-size: 0.875rem;">GraphQL gateway that unifies three internal services behind a single schema. Handles 12k requests per second in production.</p>
    <span style="font-size: 0.75rem; color: var(--text-subtle);">Updated 5 days ago</span>
  </arc-card>

  <arc-card href="/projects/nightfall">
    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
      <h3 style="margin: 0; font-size: 1.1rem;">Nightfall Theme</h3>
      <arc-badge variant="warning">Beta</arc-badge>
    </div>
    <p style="margin: 0 0 16px; color: var(--text-muted); font-size: 0.875rem;">Dark-mode design system tokens and component skins. Provides WCAG AAA contrast ratios across all interactive states.</p>
    <span style="font-size: 0.75rem; color: var(--text-subtle);">Updated today</span>
  </arc-card>
</div>`,
    },
    {
      label: 'React',
      lang: 'tsx',
      code: `import { Card, Badge } from '@arclux/arc-ui-react';

export default function Example() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
      <Card href="/projects/atlas">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
          <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Project Atlas</h3>
          <Badge variant="info">Active</Badge>
        </div>
        <p style={{ margin: '0 0 16px', color: 'var(--text-muted)', fontSize: '0.875rem' }}>Cloud migration toolkit for legacy enterprise systems. Automates dependency mapping and generates infrastructure-as-code templates.</p>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>Updated 2 days ago</span>
      </Card>

      <Card href="/projects/meridian">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
          <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Meridian API</h3>
          <Badge variant="success">Shipped</Badge>
        </div>
        <p style={{ margin: '0 0 16px', color: 'var(--text-muted)', fontSize: '0.875rem' }}>GraphQL gateway that unifies three internal services behind a single schema. Handles 12k requests per second in production.</p>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>Updated 5 days ago</span>
      </Card>

      <Card href="/projects/nightfall">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
          <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Nightfall Theme</h3>
          <Badge variant="warning">Beta</Badge>
        </div>
        <p style={{ margin: '0 0 16px', color: 'var(--text-muted)', fontSize: '0.875rem' }}>Dark-mode design system tokens and component skins. Provides WCAG AAA contrast ratios across all interactive states.</p>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>Updated today</span>
      </Card>
    </div>
  );
}`,
    },
    {
      label: 'Vue',
      lang: 'html',
      code: `<script setup>
import { Card, Badge } from '@arclux/arc-ui-vue';
</script>

<template>
  <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px;">
    <Card href="/projects/atlas">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
        <h3 style="margin: 0; font-size: 1.1rem;">Project Atlas</h3>
        <Badge variant="info">Active</Badge>
      </div>
      <p style="margin: 0 0 16px; color: var(--text-muted); font-size: 0.875rem;">Cloud migration toolkit for legacy enterprise systems. Automates dependency mapping and generates infrastructure-as-code templates.</p>
      <span style="font-size: 0.75rem; color: var(--text-subtle);">Updated 2 days ago</span>
    </Card>

    <Card href="/projects/meridian">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
        <h3 style="margin: 0; font-size: 1.1rem;">Meridian API</h3>
        <Badge variant="success">Shipped</Badge>
      </div>
      <p style="margin: 0 0 16px; color: var(--text-muted); font-size: 0.875rem;">GraphQL gateway that unifies three internal services behind a single schema. Handles 12k requests per second in production.</p>
      <span style="font-size: 0.75rem; color: var(--text-subtle);">Updated 5 days ago</span>
    </Card>

    <Card href="/projects/nightfall">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
        <h3 style="margin: 0; font-size: 1.1rem;">Nightfall Theme</h3>
        <Badge variant="warning">Beta</Badge>
      </div>
      <p style="margin: 0 0 16px; color: var(--text-muted); font-size: 0.875rem;">Dark-mode design system tokens and component skins. Provides WCAG AAA contrast ratios across all interactive states.</p>
      <span style="font-size: 0.75rem; color: var(--text-subtle);">Updated today</span>
    </Card>
  </div>
</template>`,
    },
    {
      label: 'Svelte',
      lang: 'html',
      code: `<script>
  import { Card, Badge } from '@arclux/arc-ui-svelte';
</script>

<div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px;">
  <Card href="/projects/atlas">
    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
      <h3 style="margin: 0; font-size: 1.1rem;">Project Atlas</h3>
      <Badge variant="info">Active</Badge>
    </div>
    <p style="margin: 0 0 16px; color: var(--text-muted); font-size: 0.875rem;">Cloud migration toolkit for legacy enterprise systems. Automates dependency mapping and generates infrastructure-as-code templates.</p>
    <span style="font-size: 0.75rem; color: var(--text-subtle);">Updated 2 days ago</span>
  </Card>

  <Card href="/projects/meridian">
    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
      <h3 style="margin: 0; font-size: 1.1rem;">Meridian API</h3>
      <Badge variant="success">Shipped</Badge>
    </div>
    <p style="margin: 0 0 16px; color: var(--text-muted); font-size: 0.875rem;">GraphQL gateway that unifies three internal services behind a single schema. Handles 12k requests per second in production.</p>
    <span style="font-size: 0.75rem; color: var(--text-subtle);">Updated 5 days ago</span>
  </Card>

  <Card href="/projects/nightfall">
    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
      <h3 style="margin: 0; font-size: 1.1rem;">Nightfall Theme</h3>
      <Badge variant="warning">Beta</Badge>
    </div>
    <p style="margin: 0 0 16px; color: var(--text-muted); font-size: 0.875rem;">Dark-mode design system tokens and component skins. Provides WCAG AAA contrast ratios across all interactive states.</p>
    <span style="font-size: 0.75rem; color: var(--text-subtle);">Updated today</span>
  </Card>
</div>`,
    },
    {
      label: 'Angular',
      lang: 'ts',
      code: `import { Component } from '@angular/core';
import { Card, Badge } from '@arclux/arc-ui-angular';

@Component({
  imports: [Card, Badge],
  template: \`
    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px;">
      <arc-card href="/projects/atlas">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
          <h3 style="margin: 0; font-size: 1.1rem;">Project Atlas</h3>
          <arc-badge variant="info">Active</arc-badge>
        </div>
        <p style="margin: 0 0 16px; color: var(--text-muted); font-size: 0.875rem;">Cloud migration toolkit for legacy enterprise systems. Automates dependency mapping and generates infrastructure-as-code templates.</p>
        <span style="font-size: 0.75rem; color: var(--text-subtle);">Updated 2 days ago</span>
      </arc-card>

      <arc-card href="/projects/meridian">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
          <h3 style="margin: 0; font-size: 1.1rem;">Meridian API</h3>
          <arc-badge variant="success">Shipped</arc-badge>
        </div>
        <p style="margin: 0 0 16px; color: var(--text-muted); font-size: 0.875rem;">GraphQL gateway that unifies three internal services behind a single schema. Handles 12k requests per second in production.</p>
        <span style="font-size: 0.75rem; color: var(--text-subtle);">Updated 5 days ago</span>
      </arc-card>

      <arc-card href="/projects/nightfall">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
          <h3 style="margin: 0; font-size: 1.1rem;">Nightfall Theme</h3>
          <arc-badge variant="warning">Beta</arc-badge>
        </div>
        <p style="margin: 0 0 16px; color: var(--text-muted); font-size: 0.875rem;">Dark-mode design system tokens and component skins. Provides WCAG AAA contrast ratios across all interactive states.</p>
        <span style="font-size: 0.75rem; color: var(--text-subtle);">Updated today</span>
      </arc-card>
    </div>
  \`,
})
export class ProjectCardsComponent {}`,
    },
    {
      label: 'Solid',
      lang: 'tsx',
      code: `import { Card, Badge } from '@arclux/arc-ui-solid';

export default function Example() {
  return (
    <div style={{ display: 'grid', 'grid-template-columns': 'repeat(3, 1fr)', gap: '16px' }}>
      <Card href="/projects/atlas">
        <div style={{ display: 'flex', 'justify-content': 'space-between', 'align-items': 'flex-start', 'margin-bottom': '12px' }}>
          <h3 style={{ margin: 0, 'font-size': '1.1rem' }}>Project Atlas</h3>
          <Badge variant="info">Active</Badge>
        </div>
        <p style={{ margin: '0 0 16px', color: 'var(--text-muted)', 'font-size': '0.875rem' }}>Cloud migration toolkit for legacy enterprise systems. Automates dependency mapping and generates infrastructure-as-code templates.</p>
        <span style={{ 'font-size': '0.75rem', color: 'var(--text-subtle)' }}>Updated 2 days ago</span>
      </Card>

      <Card href="/projects/meridian">
        <div style={{ display: 'flex', 'justify-content': 'space-between', 'align-items': 'flex-start', 'margin-bottom': '12px' }}>
          <h3 style={{ margin: 0, 'font-size': '1.1rem' }}>Meridian API</h3>
          <Badge variant="success">Shipped</Badge>
        </div>
        <p style={{ margin: '0 0 16px', color: 'var(--text-muted)', 'font-size': '0.875rem' }}>GraphQL gateway that unifies three internal services behind a single schema. Handles 12k requests per second in production.</p>
        <span style={{ 'font-size': '0.75rem', color: 'var(--text-subtle)' }}>Updated 5 days ago</span>
      </Card>

      <Card href="/projects/nightfall">
        <div style={{ display: 'flex', 'justify-content': 'space-between', 'align-items': 'flex-start', 'margin-bottom': '12px' }}>
          <h3 style={{ margin: 0, 'font-size': '1.1rem' }}>Nightfall Theme</h3>
          <Badge variant="warning">Beta</Badge>
        </div>
        <p style={{ margin: '0 0 16px', color: 'var(--text-muted)', 'font-size': '0.875rem' }}>Dark-mode design system tokens and component skins. Provides WCAG AAA contrast ratios across all interactive states.</p>
        <span style={{ 'font-size': '0.75rem', color: 'var(--text-subtle)' }}>Updated today</span>
      </Card>
    </div>
  );
}`,
    },
    {
      label: 'Preact',
      lang: 'tsx',
      code: `import { Card, Badge } from '@arclux/arc-ui-preact';

export default function Example() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
      <Card href="/projects/atlas">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
          <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Project Atlas</h3>
          <Badge variant="info">Active</Badge>
        </div>
        <p style={{ margin: '0 0 16px', color: 'var(--text-muted)', fontSize: '0.875rem' }}>Cloud migration toolkit for legacy enterprise systems. Automates dependency mapping and generates infrastructure-as-code templates.</p>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>Updated 2 days ago</span>
      </Card>

      <Card href="/projects/meridian">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
          <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Meridian API</h3>
          <Badge variant="success">Shipped</Badge>
        </div>
        <p style={{ margin: '0 0 16px', color: 'var(--text-muted)', fontSize: '0.875rem' }}>GraphQL gateway that unifies three internal services behind a single schema. Handles 12k requests per second in production.</p>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>Updated 5 days ago</span>
      </Card>

      <Card href="/projects/nightfall">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
          <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Nightfall Theme</h3>
          <Badge variant="warning">Beta</Badge>
        </div>
        <p style={{ margin: '0 0 16px', color: 'var(--text-muted)', fontSize: '0.875rem' }}>Dark-mode design system tokens and component skins. Provides WCAG AAA contrast ratios across all interactive states.</p>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>Updated today</span>
      </Card>
    </div>
  );
}`,
    },
    {
      label: 'HTML',
      lang: 'html',
      code: `<!-- Auto-generated by @arclux/prism — do not edit manually -->
<!-- arc-card — requires card.css + base.css (or arc-ui.css) -->
<div class="arc-card">
  <a class="card" href="#"><div class="card__inner">Card</div></a>
</div>`,
    },
    {
      label: 'HTML (Inline)',
      lang: 'html',
      code: `<!-- Auto-generated by @arclux/prism — do not edit manually -->
<!-- arc-card — self-contained, no external CSS needed -->
<style>
  @media (max-width: 768px) {
    .arc-card .card__inner { padding: 24px 16px; }
  }
  .arc-card[href] .card:hover { background: linear-gradient(135deg, rgba(77, 126, 247,0.3), rgba(139, 92, 246,0.15), rgb(34, 34, 41)); }
  .arc-card .card:hover .card__inner { box-shadow: inset 0 1px 0 rgba(255, 255, 255,0.04), 0 4px 24px rgba(0,0,0,0.2); }
  .arc-card .card:focus-visible { outline: none; box-shadow: 0 0 0 2px rgb(3, 3, 7), 0 0 0 4px rgb(77, 126, 247), 0 0 16px rgba(77,126,247,0.3); border-radius: 14px; }
</style>
<div class="arc-card" style="display: block">
  <a class="card" style="position: relative; border-radius: 14px; padding: 1px; background: rgb(24, 24, 30); text-decoration: none; display: block; height: 100%" href="#"><div class="card__inner" style="position: relative; background: rgb(13, 13, 18); border-radius: calc(14px - 1px); padding: 40px 24px; height: 100%">Card</div></a>
</div>`,
    },
  ],

  seeAlso: ['feature-card', 'value-card', 'alert'],
};
