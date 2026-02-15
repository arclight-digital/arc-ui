import type { ComponentDef } from './_types';

export const skipLink: ComponentDef = {
  name: 'Skip Link',
  slug: 'skip-link',
  tag: 'arc-skip-link',
  tier: 'navigation',
  interactivity: 'interactive',
  description: 'Accessible skip-to-content link, invisible until focused. On focus shows as accent-primary filled pill with glow ring above the page.',

  overview: `SkipLink is an accessibility-first navigation aid that remains invisible during normal browsing but reveals itself the moment a keyboard user presses Tab at the top of the page. When focused, it appears as an accent-primary filled pill with a glow ring, positioned above all other content so the user can immediately jump past repetitive navigation and land on the main content area.

This pattern is a WCAG 2.1 Level A requirement (Success Criterion 2.4.1) and benefits keyboard users, screen-reader users, and anyone navigating with assistive technology. By providing a single keystroke shortcut to the primary content landmark, SkipLink dramatically reduces the number of Tab presses needed to reach the page's meaningful content.

The component accepts a \`target\` prop — typically an ID selector like \`#main\` — that controls where focus moves when the link is activated. Place SkipLink as the very first focusable element inside your \`<body>\` or AppShell so it is the first thing a Tab keypress reveals. It automatically hides itself once focus moves away, keeping the visual interface clean for mouse users.`,

  features: [
    'Invisible by default, revealed only on keyboard focus',
    'Accent-primary filled pill with glow ring when visible',
    'Positioned above all content with fixed/absolute placement',
    'Configurable target selector for the skip destination',
    'Meets WCAG 2.1 Level A Success Criterion 2.4.1',
    'Automatically hides when focus moves away',
    'Works with any ID-based content landmark',
    'Token-driven theming via CSS custom properties',
  ],

  guidelines: {
    do: [
      'Place SkipLink as the very first focusable element in the page',
      'Point the target at your main content landmark (e.g. #main)',
      'Ensure the target element has tabindex="-1" so it can receive focus',
      'Test by pressing Tab immediately after page load',
      'Include SkipLink on every page for consistent keyboard navigation',
    ],
    dont: [
      'Hide SkipLink with display:none or visibility:hidden — it must remain focusable',
      'Place SkipLink after other interactive elements — it must be first',
      'Use a target that does not exist on the page',
      'Add multiple SkipLinks unless the page has distinct content regions',
      'Remove SkipLink to "simplify" the UI — it is a WCAG requirement',
    ],
  },

  previewHtml: `<div style="width:100%;max-width:400px;padding:var(--space-lg);background:var(--bg-surface);border:1px solid var(--border-subtle);border-radius:var(--radius-md);text-align:center">
  <p style="color:var(--text-muted);font-size:var(--text-sm);margin:0">SkipLink is invisible by default. Press <kbd style="padding:2px 6px;background:var(--bg-inset);border:1px solid var(--border-default);border-radius:var(--radius-sm);font-size:var(--text-xs);font-family:var(--font-mono)">Tab</kbd> at the top of any page to reveal it.</p>
</div>`,

  props: [
    { name: 'target', type: 'string', default: "'#main'", description: 'CSS selector for the element that should receive focus when the skip link is activated. Typically an ID like #main.' },
  ],
  events: [],

  tabs: [
    {
      label: 'Web Component',
      lang: 'html',
      code: `<script type="module" src="@arclux/arc-ui"></script>

<!-- Place as the very first element inside <body> -->
<arc-skip-link target="#main">Skip to main content</arc-skip-link>

<!-- ...header, nav, etc... -->

<main id="main" tabindex="-1">
  <!-- Page content -->
</main>`,
    },
    {
      label: 'React',
      lang: 'tsx',
      code: `import { SkipLink } from '@arclux/arc-ui-react';

export function App() {
  return (
    <>
      <SkipLink target="#main">Skip to main content</SkipLink>
      {/* ...header, nav, etc... */}
      <main id="main" tabIndex={-1}>
        {/* Page content */}
      </main>
    </>
  );
}`,
    },
    {
      label: 'Vue',
      lang: 'html',
      code: `<script setup>
import { SkipLink } from '@arclux/arc-ui-vue';
</script>

<template>
  <SkipLink target="#main">Skip to main content</SkipLink>
  <!-- ...header, nav, etc... -->
  <main id="main" tabindex="-1">
    <!-- Page content -->
  </main>
</template>`,
    },
    {
      label: 'Svelte',
      lang: 'html',
      code: `<script>
  import { SkipLink } from '@arclux/arc-ui-svelte';
</script>

<SkipLink target="#main">Skip to main content</SkipLink>
<!-- ...header, nav, etc... -->
<main id="main" tabindex="-1">
  <!-- Page content -->
</main>`,
    },
    {
      label: 'Angular',
      lang: 'ts',
      code: `import { Component } from '@angular/core';
import { SkipLink } from '@arclux/arc-ui-angular';

@Component({
  imports: [SkipLink],
  template: \`
    <SkipLink target="#main">Skip to main content</SkipLink>
    <!-- ...header, nav, etc... -->
    <main id="main" tabindex="-1">
      <!-- Page content -->
    </main>
  \`,
})
export class AppComponent {}`,
    },
    {
      label: 'Solid',
      lang: 'tsx',
      code: `import { SkipLink } from '@arclux/arc-ui-solid';

export function App() {
  return (
    <>
      <SkipLink target="#main">Skip to main content</SkipLink>
      {/* ...header, nav, etc... */}
      <main id="main" tabIndex={-1}>
        {/* Page content */}
      </main>
    </>
  );
}`,
    },
    {
      label: 'Preact',
      lang: 'tsx',
      code: `import { SkipLink } from '@arclux/arc-ui-preact';

export function App() {
  return (
    <>
      <SkipLink target="#main">Skip to main content</SkipLink>
      {/* ...header, nav, etc... */}
      <main id="main" tabIndex={-1}>
        {/* Page content */}
      </main>
    </>
  );
}`,
    },
  ],

  seeAlso: ['link', 'anchor-nav'],
};
