import type { ComponentDef } from './_types';

export const button: ComponentDef = {
  name: 'Button',
  slug: 'button',
  tag: 'arc-button',
  tier: 'input',
  interactivity: 'hybrid',
  description:
    'Action button with three variants for action hierarchy and prefix and suffix slots for icons. For links, slot a real anchor, which works before JavaScript loads.',

  overview: `Button has three variants for an action hierarchy: \`primary\` for the one most important action, \`secondary\` for a visible alternative with less emphasis, and \`ghost\` for tertiary actions. The \`prefix\` and \`suffix\` slots hold icons or other inline elements beside the label, such as a search icon or an arrow.

For links, slot a real \`<a>\` as the button's only child. The anchor is ordinary HTML in the initial markup, so the link works with JavaScript disabled and before the element upgrades. On a slow connection your landing-page button is clickable straight away, not after hydration. Button adopts the anchor on upgrade and styles it as the control, so there is only ever one link in the accessibility tree.

The \`href\` attribute still works and renders an \`<a>\` in the shadow root. Use it inside app shells behind a login, where JavaScript is a given and the extra markup is noise. On public, indexed or first-load-critical pages, slot the anchor instead: with the destination on the custom element, the link can't exist without JavaScript. With no \`href\` and no slotted anchor, Button behaves as a normal button for form submission and other actions.

The sizes (sm, md, lg) change the padding. The font size and the minimum touch target are the same in all three. Use lg for hero sections, md for general UI and sm for compact toolbars and inline actions.`,

  features: [
    'Labels are uppercase in the label font',
    'Primary glows on hover, and every variant shrinks slightly while pressed',
    'Disabled buttons are dimmed and ignore pointer and keyboard input',
  ],

  guidelines: {
    do: [
      'Pair primary with secondary or ghost so the most important action stands out',
      'Use the prefix slot for leading icons and suffix for trailing arrows or indicators',
      'Write labels that say what happens, in two or three words: "Create project", "Read the API docs"',
    ],
    dont: [
      'Don\'t put two primary buttons side by side. Use one primary per group of actions',
      'Don\'t use ghost for the most important action. It is too faint',
      'Don\'t make a navigation link a plain button. Screen readers and search engines need a real link',
      'Don\'t put a second link inside a slotted anchor. The adopted anchor is already the control',
      'Don\'t disable a button without saying why the action is unavailable',
    ],
  },

  previewHtml: `<div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap;">
  <arc-button variant="primary" size="lg">Create project</arc-button>
  <arc-button variant="secondary">
    <svg slot="prefix" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="16" height="16"><path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z"/></svg>
    Bookmark
  </arc-button>
  <arc-button variant="ghost">Read the docs</arc-button>
</div>`,

  tabs: [
    {
      label: 'Web Component',
      lang: 'html',
      code: `<script type="module" src="@arclux/arc-ui"></script>

<!-- Slot a real <a>: the link works without JS and before hydration -->
<div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap;">
  <arc-button variant="primary" size="lg"><a href="/docs/getting-started">Get Started</a></arc-button>
  <arc-button variant="secondary"><a href="/docs/components">View Docs</a></arc-button>
  <arc-button variant="ghost"><a href="/docs/tokens">Learn More</a></arc-button>
</div>

<!-- href still works — best inside app shells where JS is guaranteed -->
<arc-button variant="primary" href="/dashboard">Dashboard</arc-button>

<!-- With prefix icon (icons go inside the anchor in the slotted form) -->
<arc-button variant="secondary">
  <svg slot="prefix" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="16" height="16"><path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z"/></svg>
  Bookmark
</arc-button>`,
    },
    {
      label: 'React',
      lang: 'tsx',
      code: `import { Button } from '@arclux/arc-ui-react';

export function HeroActions() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
      <Button variant="primary" size="lg"><a href="/docs/getting-started">Get Started</a></Button>
      <Button variant="secondary"><a href="/docs/components">View Docs</a></Button>
      <Button variant="ghost"><a href="/docs/tokens">Learn More</a></Button>
    </div>
  );
}

{/* With prefix icon */}
<Button variant="secondary">
  <svg slot="prefix" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="16" height="16"><path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z"/></svg>
  Bookmark
</Button>`,
    },
    {
      label: 'Vue',
      lang: 'html',
      code: `<script setup>
import { Button } from '@arclux/arc-ui-vue';
</script>

<template>
  <div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap;">
    <Button variant="primary" size="lg"><a href="/docs/getting-started">Get Started</a></Button>
    <Button variant="secondary"><a href="/docs/components">View Docs</a></Button>
    <Button variant="ghost"><a href="/docs/tokens">Learn More</a></Button>
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
  <Button variant="primary" size="lg"><a href="/docs/getting-started">Get Started</a></Button>
  <Button variant="secondary"><a href="/docs/components">View Docs</a></Button>
  <Button variant="ghost"><a href="/docs/tokens">Learn More</a></Button>
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
      <arc-button variant="primary" size="lg"><a href="/docs/getting-started">Get Started</a></arc-button>
      <arc-button variant="secondary"><a href="/docs/components">View Docs</a></arc-button>
      <arc-button variant="ghost"><a href="/docs/tokens">Learn More</a></arc-button>
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
      <Button variant="primary" size="lg"><a href="/docs/getting-started">Get Started</a></Button>
      <Button variant="secondary"><a href="/docs/components">View Docs</a></Button>
      <Button variant="ghost"><a href="/docs/tokens">Learn More</a></Button>
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
      <Button variant="primary" size="lg"><a href="/docs/getting-started">Get Started</a></Button>
      <Button variant="secondary"><a href="/docs/components">View Docs</a></Button>
      <Button variant="ghost"><a href="/docs/tokens">Learn More</a></Button>
    </div>
  );
}`,
    },
    {
      label: 'HTML',
      lang: 'html',
      code: `<!-- Auto-generated by @arclux/prism — do not edit manually -->
<!-- arc-button — requires button.css + base.css (or arc-ui.css) -->
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
  <a class="btn" style="display: inline-flex; align-items: center; justify-content: center; gap: 8px; font-family: 'Tomorrow', system-ui, sans-serif; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; border: 1px solid transparent; border-radius: 10px; cursor: pointer; text-decoration: none; white-space: nowrap; box-sizing: border-box" href="#">Button</a>
</span>`,
    },
  ],

  seeAlso: ['icon-button', 'chip', 'link'],
};
