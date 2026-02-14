import type { ComponentDef } from './_types';

export const link: ComponentDef = {
    name: 'Link',
    slug: 'link',
    tag: 'arc-link',
    tier: 'navigation',
    interactivity: 'static',
    description: 'Styled anchor with nav, muted, and default variants.',

    overview: `Link wraps a native \`<a>\` element with consistent styling across three variants. The default variant renders in the accent-primary color with an underline-on-hover behavior. The "muted" variant starts in the muted text color and transitions to primary on hover, useful for footer links or secondary navigation. The "nav" variant renders at 14px with an inline-flex layout and gap, designed for navigation menus where links sit alongside icons.

When the \`external\` property is set, Link automatically appends a small external-link SVG icon, sets \`target="_blank"\`, and applies \`rel="noopener noreferrer"\` for security. This eliminates the need to manually manage external link attributes across your application. The icon renders at 12px with 60% opacity to avoid visual clutter.

The \`active\` boolean property highlights the current link in accent-primary, useful for indicating the active page in navigation contexts. All variants include a focus-visible ring using the system's \`--focus-ring\` token, ensuring keyboard navigation is clearly visible without affecting mouse users.`,

    features: [
      'Three variants: default (accent blue), muted (subtle with hover reveal), and nav (compact navigation style)',
      'Automatic external link handling with target="_blank", rel="noopener noreferrer", and an external icon',
      'Active state via the "active" boolean property for current-page indication',
      'Focus-visible ring using the system focus-ring token for keyboard accessibility',
      'Smooth color transitions using --transition-fast for hover and focus states',
      'Inline external-link SVG icon at 12px with reduced opacity to avoid clutter',
      'Exposed "link" CSS part for external style customization',
    ],

    guidelines: {
      do: [
        'Use the default variant for inline content links within body text',
        'Use the nav variant for navigation menus, sidebars, and header link groups',
        'Set the external prop for any link that navigates away from your domain',
        'Use the active prop to indicate the current page in navigation link lists',
        'Provide meaningful link text that describes the destination, not "click here"',
      ],
      dont: [
        'Use Link as a button substitute — if the action does not navigate, use arc-button instead',
        'Apply the muted variant to primary navigation links; they are too subtle for main wayfinding',
        'Omit the external prop for cross-origin links — users expect the external icon and new-tab behavior',
        'Nest block-level elements inside Link; it renders as inline by default',
        'Override the focus-visible ring without providing an equivalent alternative for keyboard users',
      ],
    },

    previewHtml: `<div style="display: flex; align-items: center; gap: 24px; flex-wrap: wrap;">
  <arc-link href="#">Default link</arc-link>
  <arc-link href="#" variant="muted">Muted link</arc-link>
  <arc-link href="#" variant="nav">Nav link</arc-link>
  <arc-link href="#" variant="nav" active>Active nav</arc-link>
  <arc-link href="https://example.com" external>External link</arc-link>
</div>`,

    props: [
      { name: 'href', type: 'string', default: "''", description: 'URL destination for the link.' },
      { name: 'variant', type: "'default' | 'muted' | 'nav'", default: "'default'", description: 'Link style variant. `default` uses accent-primary color, `muted` uses muted text, `nav` uses secondary text with 14px size and flex layout.' },
      { name: 'active', type: 'boolean', default: 'false', description: 'Active state — applies accent-primary color for navigation highlighting.' },
      { name: 'external', type: 'boolean', default: 'false', description: 'When true, adds `target="_blank"` and `rel="noopener noreferrer"`, and renders an external link icon after the text.' },
      { name: 'underline', type: 'string', default: "'hover'", description: "Controls underline behavior. Options: 'hover' (default, underline on hover), 'always' (always visible), 'never' (never underlined)." },
    ],
    tabs: [
      {
        label: 'Web Component',
        lang: 'html',
        code: `<arc-link href="#">Default link</arc-link>
<arc-link href="#" variant="muted">Muted link</arc-link>
<arc-link href="#" variant="nav">Nav link</arc-link>`,
      },
      {
        label: 'React',
        lang: 'tsx',
        code: `import { Link } from '@arclux/arc-ui-react';

<Link href="#">Default link</Link>
<Link href="#" variant="muted">Muted link</Link>
<Link href="#" variant="nav">Nav link</Link>`,
      },
      {
        label: 'Vue',
        lang: 'html',
        code: `<script setup>
import { Link } from '@arclux/arc-ui-vue';
</script>

<template>
  <Link href="#">Default link</Link>
  <Link href="#" variant="muted">Muted link</Link>
  <Link href="#" variant="nav">Nav link</Link>
</template>`,
      },
      {
        label: 'Svelte',
        lang: 'html',
        code: `<script>
  import { Link } from '@arclux/arc-ui-svelte';
</script>

<Link href="#">Default link</Link>
<Link href="#" variant="muted">Muted link</Link>
<Link href="#" variant="nav">Nav link</Link>`,
      },
      {
        label: 'Angular',
        lang: 'ts',
        code: `import { Component } from '@angular/core';
import { Link } from '@arclux/arc-ui-angular';

@Component({
  imports: [Link],
  template: \`
    <Link href="#">Default link</Link>
    <Link href="#" variant="muted">Muted link</Link>
    <Link href="#" variant="nav">Nav link</Link>
  \`,
})
export class MyComponent {}`,
      },
      {
        label: 'Solid',
        lang: 'tsx',
        code: `import { Link } from '@arclux/arc-ui-solid';

<Link href="#">Default link</Link>
<Link href="#" variant="muted">Muted link</Link>
<Link href="#" variant="nav">Nav link</Link>`,
      },
      {
        label: 'Preact',
        lang: 'tsx',
        code: `import { Link } from '@arclux/arc-ui-preact';

<Link href="#">Default link</Link>
<Link href="#" variant="muted">Muted link</Link>
<Link href="#" variant="nav">Nav link</Link>`,
      },
      { label: 'HTML', lang: 'html', code: `<!-- Auto-generated by @arclux/prism — do not edit manually -->
<!-- arc-link — requires link.css + tokens.css (or arc-ui.css) -->
<span class="arc-link">
  <a
   class="link"
   href="#"
   target=""
   rel=""
   >
   Link
   External
   </a>
</span>` },
      { label: 'HTML (Inline)', lang: 'html', code: `<!-- Auto-generated by @arclux/prism — do not edit manually -->
<!-- arc-link — self-contained, no external CSS needed -->
<style>
  .arc-link .link:hover { text-decoration: underline;
        text-underline-offset: 3px; }
  .arc-link[data-variant="muted"] .link:hover { color: rgb(232, 232, 236); }
  .arc-link[data-variant="nav"] .link:hover { color: rgb(232, 232, 236);
        text-decoration: none; }
  .arc-link .link:focus-visible { outline: none;
        box-shadow: 0 0 0 2px rgb(3, 3, 7), 0 0 0 4px rgb(77, 126, 247);
        border-radius: 2px; }
</style>
<span class="arc-link" style="display: inline">
  <a
   class="link" style="font-family: 'Host Grotesk', system-ui, sans-serif; font-size: inherit; color: rgb(77, 126, 247); text-decoration: none; cursor: pointer; border: none; background: none; padding: 0"
   href="#"
   target=""
   rel=""
   >
   Link
   External
   </a>
</span>` }
    ],
  
  seeAlso: ["button","breadcrumb","navigation-menu"],
};
