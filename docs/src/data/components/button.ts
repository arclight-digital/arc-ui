import type { ComponentDef } from './_types';

export const button: ComponentDef = {
    name: 'Button',
    slug: 'button',
    tag: 'arc-button',
    tier: 'input',
    interactivity: 'hybrid',
    description: 'Primary call-to-action element with three visual variants that map to action hierarchy. Renders as an anchor when given an href, making it ideal for navigation-driven actions across landing pages, toolbars, and forms.',

    overview: `Button is the primary CTA element in ARC UI. Its three variants — primary, secondary, and ghost — map directly to a clear action hierarchy: primary draws the eye to the single most important action, secondary offers a visible but lower-emphasis alternative, and ghost provides a minimal, unobtrusive option for tertiary actions.

Because Button renders as an \`<a>\` element when an \`href\` is provided, it is inherently accessible for navigation. This makes it the right choice for landing-page hero rows, pricing CTAs, documentation links, and any context where the action takes the user somewhere rather than triggering in-page logic. When no href is set, it behaves as a standard button element for form submissions and interactive triggers.

Three size presets — sm, md, and lg — let you scale buttons to their context. Use lg for hero sections and high-impact CTAs, md for general UI, and sm for compact toolbars or inline actions. All sizes maintain consistent padding ratios and touch targets.`,

    features: [
      'Three variants (primary, secondary, ghost) for clear action hierarchy',
      'Three size presets (sm, md, lg) scaled for context',
      'Renders as <a> with href for accessible navigation',
      'Neon glow hover effect on primary variant',
      'Focus-visible ring for keyboard accessibility',
      'Subtle scale-down on active press for tactile feedback',
      'Disabled state that prevents interaction and dims the element',
      'Uppercase Tektur type treatment for strong visual presence',
    ],

    guidelines: {
      do: [
        'Use primary for the single most important action on the page',
        'Pair primary with secondary or ghost to create a clear visual hierarchy',
        'Use the lg size for hero sections and above-the-fold CTAs',
        'Provide an href when the button navigates to another page or section',
        'Keep button labels short and action-oriented (e.g. "Get Started", "View Docs")',
      ],
      dont: [
        'Place multiple primary buttons side by side — one primary per action group',
        'Use ghost variant for the most important action; it is too subtle for primary CTAs',
        'Omit href when the action is navigation — this hurts accessibility and SEO',
        'Use long sentences as button labels; aim for two to three words maximum',
        'Disable buttons without explaining why the action is unavailable',
      ],
    },

    previewHtml: `<div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap;">
  <arc-button variant="primary" size="lg">Get Started</arc-button>
  <arc-button variant="secondary">View Docs</arc-button>
  <arc-button variant="ghost">Learn More</arc-button>
</div>`,

    props: [
      {
        name: 'variant',
        type: "'primary' | 'secondary' | 'ghost'",
        default: "'primary'",
        description: 'Controls the visual weight and emphasis. Primary is a filled button with a neon glow hover suited for the top-level CTA. Secondary uses a bordered outline for supporting actions. Ghost renders with no border or background, ideal for low-priority or tertiary actions.',
      },
      {
        name: 'size',
        type: "'sm' | 'md' | 'lg'",
        default: "'md'",
        description: 'Sets the button size. Large (lg) is intended for hero sections and high-impact areas. Medium (md) is the default for general UI. Small (sm) fits compact toolbars, table rows, and inline contexts.',
      },
      {
        name: 'href',
        type: 'string',
        description: 'When provided, the button renders as an <a> element instead of a <button>, making it a navigational link. This is the recommended approach for any action that takes the user to a new page or section.',
      },
      {
        name: 'disabled',
        type: 'boolean',
        default: 'false',
        description: 'When true, dims the button and prevents all pointer and keyboard interaction. Applies reduced opacity and removes hover/focus effects. Consider pairing with a tooltip that explains why the action is unavailable.',
      },
    ],

    tabs: [
      {
        label: 'Web Component',
        lang: 'html',
        code: `<script type="module" src="@arclux/arc-ui"></script>

<div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap;">
  <arc-button variant="primary" size="lg" href="/docs/getting-started">Get Started</arc-button>
  <arc-button variant="secondary" href="/docs/components">View Docs</arc-button>
  <arc-button variant="ghost" href="/docs/tokens">Learn More</arc-button>
</div>`,
      },
      {
        label: 'React',
        lang: 'tsx',
        code: `import { Button } from '@arclux/arc-ui-react';

export function HeroActions() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
      <Button variant="primary" size="lg" href="/docs/getting-started">Get Started</Button>
      <Button variant="secondary" href="/docs/components">View Docs</Button>
      <Button variant="ghost" href="/docs/tokens">Learn More</Button>
    </div>
  );
}`,
      },
      {
        label: 'Vue',
        lang: 'html',
        code: `<script setup>
import { Button } from '@arclux/arc-ui-vue';
</script>

<template>
  <div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap;">
    <Button variant="primary" size="lg" href="/docs/getting-started">Get Started</Button>
    <Button variant="secondary" href="/docs/components">View Docs</Button>
    <Button variant="ghost" href="/docs/tokens">Learn More</Button>
  </div>
</template>`,
      },
      {
        label: 'Svelte',
        lang: 'html',
        code: `<script>
  import { Button } from '@arclux/arc-ui-svelte';
</script>

<div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap;">
  <Button variant="primary" size="lg" href="/docs/getting-started">Get Started</Button>
  <Button variant="secondary" href="/docs/components">View Docs</Button>
  <Button variant="ghost" href="/docs/tokens">Learn More</Button>
</div>`,
      },
      {
        label: 'Angular',
        lang: 'ts',
        code: `import { Component } from '@angular/core';
import { Button } from '@arclux/arc-ui-angular';

@Component({
  imports: [Button],
  template: \`
    <div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap;">
      <Button variant="primary" size="lg" href="/docs/getting-started">Get Started</Button>
      <Button variant="secondary" href="/docs/components">View Docs</Button>
      <Button variant="ghost" href="/docs/tokens">Learn More</Button>
    </div>
  \`,
})
export class HeroActionsComponent {}`,
      },
      {
        label: 'Solid',
        lang: 'tsx',
        code: `import { Button } from '@arclux/arc-ui-solid';

export function HeroActions() {
  return (
    <div style={{ display: 'flex', 'align-items': 'center', gap: '12px', 'flex-wrap': 'wrap' }}>
      <Button variant="primary" size="lg" href="/docs/getting-started">Get Started</Button>
      <Button variant="secondary" href="/docs/components">View Docs</Button>
      <Button variant="ghost" href="/docs/tokens">Learn More</Button>
    </div>
  );
}`,
      },
      {
        label: 'Preact',
        lang: 'tsx',
        code: `import { Button } from '@arclux/arc-ui-preact';

export function HeroActions() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
      <Button variant="primary" size="lg" href="/docs/getting-started">Get Started</Button>
      <Button variant="secondary" href="/docs/components">View Docs</Button>
      <Button variant="ghost" href="/docs/tokens">Learn More</Button>
    </div>
  );
}`,
      },
      {
        label: 'HTML',
        lang: 'html',
        code: `<!-- Auto-generated by @arclux/prism — do not edit manually -->
<!-- arc-button — requires button.css + tokens.css (or arc-ui.css) -->
<span class="arc-button">
  <a class="btn" href="#">Button</a>
</span>`,
      },
      {
        label: 'HTML (Inline)',
        lang: 'html',
        code: `<!-- Auto-generated by @arclux/prism — do not edit manually -->
<!-- arc-button — self-contained, no external CSS needed -->
<style>
  .arc-button:not([data-variant]) .btn:hover,
      .arc-button[data-variant="primary"] .btn:hover { box-shadow: 0 0 8px rgba(77,126,247,0.9), 0 0 20px rgba(77,126,247,0.5), 0 0 44px rgba(77,126,247,0.25), 0 0 80px rgba(77,126,247,0.1); }
  .arc-button:not([data-variant]) .btn:active,
      .arc-button[data-variant="primary"] .btn:active { transform: scale(0.97); box-shadow: 0 0 8px rgba(77, 126, 247,0.5); }
  .arc-button[data-variant="secondary"] .btn:hover { border-color: rgb(77, 126, 247);
        color: rgb(77, 126, 247);
        box-shadow: 0 0 20px rgba(77, 126, 247, 0.15); }
  .arc-button[data-variant="secondary"] .btn:active { transform: scale(0.97);
        background: rgba(77, 126, 247,0.05); }
  .arc-button[data-variant="ghost"] .btn:hover { color: rgb(232, 232, 236);
        background: rgba(255, 255, 255,0.03); }
  .arc-button[data-variant="ghost"] .btn:active { transform: scale(0.97);
        background: rgba(255, 255, 255,0.06); }
  .arc-button .btn:focus-visible { outline: none; box-shadow: 0 0 0 2px rgb(3, 3, 7), 0 0 0 4px rgb(77, 126, 247), 0 0 16px rgba(77,126,247,0.3); }
</style>
<span class="arc-button" style="display: inline-flex">
  <a class="btn" style="display: inline-flex; align-items: center; justify-content: center; gap: 8px; font-family: 'Tektur', system-ui, sans-serif; font-weight: 600; text-transform: uppercase; letter-spacing: 2px; border: 1px solid transparent; border-radius: 10px; cursor: pointer; text-decoration: none; white-space: nowrap; box-sizing: border-box" href="#">Button</a>
</span>`,
      },
    ],
  };
