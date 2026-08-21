import type { ComponentDef } from './_types';

export const alert: ComponentDef = {
  name: 'Alert',
  slug: 'alert',
  tag: 'arc-alert',
  tier: 'feedback',
  interactivity: 'hybrid',
  searchKeywords: ['callout', 'notice', 'tip', 'banner', 'aside'],
  description:
    'Contextual alert banner with five semantic variants and optional dismiss button for delivering timely, prominent feedback to users.',

  overview: `Alerts communicate important contextual messages to users without interrupting their workflow. They appear inline within the page content and draw attention through color-coded variants that convey meaning at a glance — \`info\`, \`tip\`, \`success\`, \`warning\`, or \`error\`.

Use alerts when the user needs to be aware of a state change, a completed action, or a potential problem. Unlike toasts, alerts persist on the page until the user dismisses them or navigates away, making them ideal for messages that require acknowledgement or continued visibility.

Alerts support an optional heading for a scannable summary and a dismiss button so users can clear the message once they have read it. The body slot accepts any inline or block content, so you can include links, lists, or follow-up actions inside the alert.

**Absorbed \`arc-callout\` in v4.** Callout was an emphasised aside, and the difference between it and an \`info\` alert was styling rather than meaning. It brought three things with it, and they are the reason this component covers both jobs: the \`tip\` variant for advice that is neither a status nor a problem; an \`icon\` slot that replaces the built-in status glyph with anything you like; and the \`live\` prop below. Callout's derived uppercase label has no equivalent — pass \`heading\` if you want one. See [the tombstone](/docs/components/callout) for the full translation.

**Severity is not urgency, and \`live\` is where they separate.** The role and announcement follow \`variant\` by default: \`error\` and \`warning\` are \`role="alert"\` and assertive, \`success\` is \`role="status"\` and polite, and \`info\` and \`tip\` are \`role="note"\` — announced not at all. That last one is deliberate and it is a change from v3, where \`info\` was a polite live region: \`info\` is the variant most likely to be static page furniture, and announcing every informational box on load is noise. So when severity and urgency disagree, say so — an \`info\` alert injected after a background save wants \`live="polite"\`; a \`warning\` rendered in the initial HTML probably wants \`live="off"\`. And \`density="compact"\` tightens the padding and type for alerts sitting inline in a form or a dense panel.`,

  features: [
    'Five semantic variants — `info`, `tip`, `success`, `warning`, and `error` — with distinct color palettes',
    'Optional heading for a concise, scannable summary above the body text',
    'Dismissible mode adds a close button and fires an event on dismiss',
    'ARIA role follows severity — `alert` for error and warning, `status` for success, `note` for info and tip',
    '`live` overrides the announcement independently of severity: `auto`, `off`, `polite`, or `assertive`',
    '`density="compact"` reduces padding and type size for inline or space-constrained usage',
    '`icon` slot replaces the built-in status glyph (absorbed from `arc-callout`)',
    'Slots for custom body content including links, lists, or action buttons',
    'Smooth enter/exit transitions when dismissed',
  ],

  guidelines: {
    do: [
      'Use the variant that matches the semantic meaning of the message (e.g. success for confirmations, error for failures)',
      'Keep alert text concise — lead with the outcome, then provide a brief explanation',
      'Include a heading when the alert body is longer than a single sentence',
      'Make alerts dismissible when the information is transient and does not need to persist',
      'Place alerts near the content they relate to, or at the top of the page for global messages',
      'Use `tip` for advice and asides — guidance that is neither a status report nor a problem',
      'Set `live` explicitly on an alert you insert after page load; the default derives announcement from severity, which cannot know the alert just appeared',
      'Use the `icon` slot when the glyph carries meaning the variant does not — a brand mark, a product icon, a specific action',
    ],
    dont: [
      'Do not use the `info` variant to get a live region — it is `role="note"` and is not announced; set `live="polite"` instead',
      'Do not stack more than two or three alerts at a time; consolidate or use a toast queue',
      'Do not use the error variant for warnings — reserve it for genuine failures',
      'Do not rely solely on color to convey meaning; the heading and text should stand alone',
      'Do not make every alert dismissible — persistent alerts are appropriate for critical errors',
    ],
  },

  previewHtml: `<div style="display:flex;flex-direction:column;width:100%;gap:var(--space-md)">
  <arc-alert variant="success" heading="Deployment complete" dismissible>Your changes are now live on production.</arc-alert>
  <arc-alert variant="tip" heading="Faster builds">Add a <code>.arcignore</code> to skip files the bundler never reads.</arc-alert>
  <arc-alert variant="info" density="compact">
    <arc-icon slot="icon" name="sparkle"></arc-icon>
    Compact density, with the status glyph replaced through the <code>icon</code> slot.
  </arc-alert>
</div>`,

  tabs: [
    {
      label: 'Web Component',
      lang: 'html',
      code: `<arc-alert variant="success" heading="Deployment complete" dismissible>
  Your changes are now live on production.
</arc-alert>

<!-- tip: advice, not a status. Absorbed from arc-callout. -->
<arc-alert variant="tip" heading="Faster builds">
  Add a <code>.arcignore</code> to skip files the bundler never reads.
</arc-alert>

<!-- info is role="note" and is not announced. Say so when it should be. -->
<arc-alert variant="info" live="polite" density="compact">
  <arc-icon slot="icon" name="sparkle"></arc-icon>
  Draft saved.
</arc-alert>`,
    },
    {
      label: 'React',
      lang: 'tsx',
      code: `import { Alert } from '@arclux/arc-ui-react';

export default function Example() {
  return (
    <Alert variant="success" heading="Deployment complete" dismissible>
      Your changes are now live on production.
    </Alert>
  );
}`,
    },
    {
      label: 'Vue',
      lang: 'html',
      code: `<script setup>
import { Alert } from '@arclux/arc-ui-vue';
</script>

<template>
  <Alert variant="success" heading="Deployment complete" dismissible>
    Your changes are now live on production.
  </Alert>
</template>`,
    },
    {
      label: 'Svelte',
      lang: 'html',
      code: `<script>
  import { Alert } from '@arclux/arc-ui-svelte';
</script>

<Alert variant="success" heading="Deployment complete" dismissible>
  Your changes are now live on production.
</Alert>`,
    },
    {
      label: 'Angular',
      lang: 'ts',
      code: `import { Component } from '@angular/core';
import { Alert } from '@arclux/arc-ui-angular';

@Component({
  imports: [Alert],
  template: \`
    <arc-alert variant="success" heading="Deployment complete" dismissible>
      Your changes are now live on production.
    </arc-alert>
  \`,
})
export class MyComponent {}`,
    },
    {
      label: 'Solid',
      lang: 'tsx',
      code: `import { Alert } from '@arclux/arc-ui-solid';

export default function Example() {
  return (
    <Alert variant="success" heading="Deployment complete" dismissible>
      Your changes are now live on production.
    </Alert>
  );
}`,
    },
    {
      label: 'Preact',
      lang: 'tsx',
      code: `import { Alert } from '@arclux/arc-ui-preact';

export default function Example() {
  return (
    <Alert variant="success" heading="Deployment complete" dismissible>
      Your changes are now live on production.
    </Alert>
  );
}`,
    },
    {
      label: 'HTML',
      lang: 'html',
      code: `<!-- arc-alert is interactive — requires JS -->
<arc-alert></arc-alert>`,
    },
    {
      label: 'HTML (Inline)',
      lang: 'html',
      code: `<!-- arc-alert is interactive — requires JS -->
<arc-alert></arc-alert>`,
    },
  ],

  seeAlso: ['toast', 'dialog'],
};
