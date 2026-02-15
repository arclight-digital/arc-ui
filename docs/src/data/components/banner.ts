import type { ComponentDef } from './_types';

export const banner: ComponentDef = {
    name: 'Banner',
    slug: 'banner',
    tag: 'arc-banner',
    tier: 'feedback',
    interactivity: 'hybrid',
    description: 'Full-width persistent strip pinned to viewport or section top. Uses semantic variants like alert but edge-to-edge with no border-radius and a subtle gradient wash.',

    overview: `Banner delivers high-visibility, full-width messages that span the entire width of their container — typically the viewport or a major content section. Unlike alert (which sits inline with border-radius and constrained width), banner is edge-to-edge with no rounding, giving it the feel of a system-level notification bar.

Use banner for messages that apply globally rather than to a specific piece of content: maintenance windows, version updates, cookie consent, or account-level warnings. The sticky option pins the banner to the top of the viewport so it remains visible as the user scrolls, while the dismissible option lets users close it once they have acknowledged the message.

Four semantic variants — info, success, warning, and error — apply a subtle gradient wash and matching icon, following the same colour language as alert and toast so users can parse severity at a glance. The component renders as a landmark with \`role="banner"\` when used at the page level, and includes \`aria-live="polite"\` for dynamically injected banners.`,

    features: [
      'Full-width edge-to-edge layout with no border-radius',
      'Four semantic variants (info, success, warning, error) with gradient wash backgrounds',
      'Sticky mode pins the banner to the top of the viewport on scroll',
      'Dismissible mode adds a close button and fires arc-dismiss on close',
      'Subtle gradient wash background for each variant',
      'Accessible role="banner" and aria-live="polite" for dynamic content',
      'Smooth slide-down enter and collapse exit transitions',
      'Slot for custom content including links, buttons, or inline actions',
    ],

    guidelines: {
      do: [
        'Use banner for global, page-level messages that apply to the entire application',
        'Enable sticky for critical messages that must remain visible as the user scrolls',
        'Use the warning variant for maintenance windows or upcoming breaking changes',
        'Keep banner text concise — one line with an optional action link',
        'Place the banner at the very top of the layout, above the top bar if possible',
      ],
      dont: [
        'Use banner for inline, content-specific feedback — use alert or inline-message instead',
        'Stack multiple banners — consolidate messages or queue them sequentially',
        'Make every banner dismissible — some system messages should persist',
        'Use the error variant for warnings — reserve it for genuine outages or failures',
        'Place banners in the middle of page content — they belong at the top edge',
      ],
    },

    previewHtml: `<div style="display:flex;flex-direction:column;width:100%;gap:var(--space-md)">
  <arc-banner variant="info" dismissible>Scheduled maintenance tonight from 11 PM to 1 AM UTC.</arc-banner>
</div>`,

    props: [
      {
        name: 'variant',
        type: "'info' | 'success' | 'warning' | 'error'",
        default: "'info'",
        description: 'Controls the semantic colour palette and icon. Use "info" for neutral announcements, "success" for positive confirmations, "warning" for caution states, and "error" for outages or critical failures.',
      },
      {
        name: 'dismissible',
        type: 'boolean',
        default: 'false',
        description: 'When true, renders a close button on the right side. Clicking it collapses the banner and fires an "arc-dismiss" event.',
      },
      {
        name: 'sticky',
        type: 'boolean',
        default: 'false',
        description: 'When true, pins the banner to the top of the viewport with position: sticky so it remains visible as the user scrolls.',
      },
    ],
    events: [
      { name: 'arc-dismiss', description: 'Fired when a dismissible banner is closed by the user' },
    ],

    tabs: [
      {
        label: 'Web Component',
        lang: 'html',
        code: `<arc-banner variant="info" dismissible>
  Scheduled maintenance tonight from 11 PM to 1 AM UTC.
</arc-banner>

<arc-banner variant="warning" sticky>
  Your subscription expires in 3 days.
  <a href="/billing" slot="action">Renew now</a>
</arc-banner>`,
      },
      {
        label: 'React',
        lang: 'tsx',
        code: `import { Banner } from '@arclux/arc-ui-react';

<Banner variant="info" dismissible>
  Scheduled maintenance tonight from 11 PM to 1 AM UTC.
</Banner>

<Banner variant="warning" sticky>
  Your subscription expires in 3 days.
</Banner>`,
      },
      {
        label: 'Vue',
        lang: 'html',
        code: `<script setup>
import { Banner } from '@arclux/arc-ui-vue';
</script>

<template>
  <Banner variant="info" dismissible>
    Scheduled maintenance tonight from 11 PM to 1 AM UTC.
  </Banner>
</template>`,
      },
      {
        label: 'Svelte',
        lang: 'html',
        code: `<script>
  import { Banner } from '@arclux/arc-ui-svelte';
</script>

<Banner variant="info" dismissible>
  Scheduled maintenance tonight from 11 PM to 1 AM UTC.
</Banner>`,
      },
      {
        label: 'Angular',
        lang: 'ts',
        code: `import { Component } from '@angular/core';
import { Banner } from '@arclux/arc-ui-angular';

@Component({
  imports: [Banner],
  template: \`
    <Banner variant="info" dismissible>
      Scheduled maintenance tonight from 11 PM to 1 AM UTC.
    </Banner>
  \`,
})
export class MyComponent {}`,
      },
      {
        label: 'Solid',
        lang: 'tsx',
        code: `import { Banner } from '@arclux/arc-ui-solid';

<Banner variant="info" dismissible>
  Scheduled maintenance tonight from 11 PM to 1 AM UTC.
</Banner>`,
      },
      {
        label: 'Preact',
        lang: 'tsx',
        code: `import { Banner } from '@arclux/arc-ui-preact';

<Banner variant="info" dismissible>
  Scheduled maintenance tonight from 11 PM to 1 AM UTC.
</Banner>`,
      },
      {
        label: 'HTML',
        lang: 'html',
        code: `<!-- See HTML tab after running pnpm generate -->
<div class="arc-banner" data-variant="info">...</div>`,
      },
      {
        label: 'HTML (Inline)',
        lang: 'html',
        code: `<!-- See HTML (Inline) tab after running pnpm generate -->
<div class="arc-banner" style="...">...</div>`,
      },
    ],

    seeAlso: ['alert', 'snackbar', 'connection-status'],
};
