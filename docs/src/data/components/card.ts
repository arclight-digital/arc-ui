import type { ComponentDef } from './_types';

export const card: ComponentDef = {
    name: 'Card',
    slug: 'card',
    tag: 'arc-card',
    tier: 'content',
    interactivity: 'static',
    description: 'Content container with subtle border styling and hover effects. Links the entire card surface when an href is provided, creating a seamless clickable area with an animated gradient border.',

    overview: `Card is the foundational content container in ARC UI. It wraps any slotted content inside a rounded, bordered surface that sits on top of the page background, giving visual separation and hierarchy to grouped information.

When you provide an \`href\` attribute, the card transforms into a full-surface link. On hover, a gradient border animates from blue to violet, and the inner surface gains a subtle lift shadow. This makes linked cards ideal for navigation grids, project listings, and dashboard tiles where the entire card should be clickable.

Cards are intentionally unopinionated about their inner layout. Slot any combination of headings, paragraphs, badges, icons, or images inside and style them with your own markup. The card handles the outer chrome — border, radius, background, padding, focus ring, and responsive adjustments — so you can focus on content.`,

    features: [
      'Gradient border hover animation on linked cards (blue to violet)',
      'Full-surface link behavior when href is set — no nested anchor tags needed',
      'Accessible focus ring with glow effect for keyboard navigation',
      'Responsive padding that tightens on small viewports',
      'Footer slot for actions, links, or metadata — no visual chrome, hidden when empty',
      'CSS parts (card, body, footer, inner) for deep style customization',
      'Equal-height support via height: 100% for grid layouts',
      'Dark-mode-native design with subtle inset highlight on hover',
    ],

    guidelines: {
      do: [
        'Use cards to group related content that belongs together visually',
        'Provide an href when the entire card should navigate somewhere',
        'Place cards in CSS Grid or Flexbox layouts for consistent sizing',
        'Keep card content concise — a heading, short description, and optional metadata',
        'Use arc-badge or arc-tag inside cards to surface status or category information',
      ],
      dont: [
        'Nest interactive elements (buttons, links) inside a linked card — it creates conflicting click targets',
        'Use cards for single lines of text — prefer inline elements or a list instead',
        'Overload a card with too much content — if it needs scrolling, break it into sections',
        'Mix linked and non-linked cards in the same grid without visual distinction',
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
    <p style="margin: 0 0 16px; color: var(--text-muted); font-size: 0.875rem; line-height: 1.5;">GraphQL gateway that unifies three internal services behind a single schema. Handles 12k requests per second in production.</p>
    <span style="font-size: 0.75rem; color: var(--text-subtle);">Updated 5 days ago</span>
  </arc-card>

  <arc-card href="/projects/nightfall">
    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
      <h3 style="margin: 0; font-size: 1.1rem;">Nightfall Theme</h3>
      <arc-badge variant="warning">Beta</arc-badge>
    </div>
    <p style="margin: 0 0 16px; color: var(--text-muted); font-size: 0.875rem; line-height: 1.5;">Dark-mode design system tokens and component skins. Provides WCAG AAA contrast ratios across all interactive states.</p>
    <span style="font-size: 0.75rem; color: var(--text-subtle);">Updated today</span>
  </arc-card>
</div>`,

    props: [
      { name: 'href', type: 'string', description: 'When set, renders the card as an anchor element, making the entire card surface a clickable link. On hover, the border transitions to a blue-to-violet gradient and the inner surface gains a lift shadow.' },
      { name: 'padding', type: "'none' | 'sm' | 'md' | 'lg'", default: "'md'", description: "Controls internal spacing. Options: 'none', 'sm', 'md', 'lg'." },
      { name: 'interactive', type: 'boolean', default: 'false', description: 'Enables hover effects for clickable cards that trigger JS instead of navigating via href.' },
    ],

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
</div>`,
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
  \`,
})
export class ProjectCardsComponent {}`,
      },
      {
        label: 'Solid',
        lang: 'tsx',
        code: `import { Card, Badge } from '@arclux/arc-ui-solid';

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
</div>`,
      },
      {
        label: 'Preact',
        lang: 'tsx',
        code: `import { Card, Badge } from '@arclux/arc-ui-preact';

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
</div>`,
      },
      {
        label: 'HTML',
        lang: 'html',
        code: `<!-- Auto-generated by @arclux/prism — do not edit manually -->
<!-- arc-card — requires card.css + tokens.css (or arc-ui.css) -->
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
  
  seeAlso: ["feature-card","value-card","callout"],
};
