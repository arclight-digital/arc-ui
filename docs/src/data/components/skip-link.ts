import type { ComponentDef } from './_types';

export const skipLink: ComponentDef = {
  name: 'Skip Link',
  slug: 'skip-link',
  tag: 'arc-skip-link',
  tier: 'navigation',
  interactivity: 'interactive',
  description:
    'A "Skip to content" link that stays off screen until a keyboard user tabs to it, then slides in as an accent pill at the top of the page.',

  overview: `SkipLink lets keyboard and screen reader users jump past the navigation to the main content with one keystroke instead of many Tab presses. It stays off screen until it receives keyboard focus, then slides down into view at the top center of the page, above everything else, as an accent-filled pill with a glow ring. When focus moves on, it slides away again, so mouse users never see it.

\`target\` is the link's \`href\`, a fragment like \`#main\` (the default). Put SkipLink first in \`<body>\` or your AppShell so the first Tab reveals it. The default label is "Skip to content", and you can replace it with slotted text.

WCAG 2.1 Success Criterion 2.4.1 (Bypass Blocks, Level A) asks for a way to skip blocks that repeat on every page. A skip link is the usual way to meet it. Landmarks and headings count too.`,

  features: ['`position: fixed` at `--z-max`, the top of the z-index scale'],

  guidelines: {
    do: [
      'Point `target` at your main content landmark, such as `#main`',
      'Give the target `tabindex="-1"` so it can take focus',
      'Test it by pressing Tab right after the page loads',
      'Include it on every page',
    ],
    dont: [
      "Don't hide it with `display: none` or `visibility: hidden`. It has to stay focusable",
      "Don't put other focusable elements before it",
      "Don't point it at an `id` that isn't on the page",
      "Don't add more than one unless the page has separate content regions to skip to",
    ],
  },

  previewHtml: `<div style="width:100%;max-width:400px;padding:var(--space-lg);background:var(--bg-surface);border:1px solid var(--border-subtle);border-radius:var(--radius-md);text-align:center">
  <p style="color:var(--text-muted);font-size:var(--text-sm);margin:0">SkipLink is invisible by default. Press <kbd style="padding:2px 6px;background:var(--bg-inset);border:1px solid var(--border-default);border-radius:var(--radius-sm);font-size:var(--text-xs);font-family:var(--font-mono)">Tab</kbd> at the top of any page to reveal it.</p>
</div>`,

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
    <arc-skip-link target="#main">Skip to main content</arc-skip-link>
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
