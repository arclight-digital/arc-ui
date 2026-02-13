import type { ComponentDef } from './_types';

export const alert: ComponentDef = {
    name: 'Alert',
    slug: 'alert',
    tag: 'arc-alert',
    tier: 'feedback',
    interactivity: 'hybrid',
    description: 'Contextual alert banner with four semantic variants and optional dismiss button for delivering timely, prominent feedback to users.',

    overview: `Alerts communicate important contextual messages to users without interrupting their workflow. They appear inline within the page content and draw attention through colour-coded variants that convey meaning at a glance — informational, success, warning, or error.

Use alerts when the user needs to be aware of a state change, a completed action, or a potential problem. Unlike toasts, alerts persist on the page until the user dismisses them or navigates away, making them ideal for messages that require acknowledgement or continued visibility.

Alerts support an optional heading for a scannable summary and a dismiss button so users can clear the message once they have read it. The body slot accepts any inline or block content, so you can include links, lists, or follow-up actions inside the alert.`,

    features: [
      'Four semantic variants — info, success, warning, and error — with distinct colour palettes',
      'Optional heading for a concise, scannable summary above the body text',
      'Dismissible mode adds a close button and fires an event on dismiss',
      'Accessible by default with appropriate ARIA role and live-region semantics',
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
      ],
      dont: [
        'Don\'t use alerts for passive, background information — use a callout or badge instead',
        'Don\'t stack more than two or three alerts at a time; consolidate or use a toast queue',
        'Don\'t use the error variant for warnings — reserve it for genuine failures',
        'Don\'t rely solely on colour to convey meaning; the heading and text should stand alone',
        'Don\'t make every alert dismissible — persistent alerts are appropriate for critical errors',
      ],
    },

    previewHtml: `<div style="display:flex;flex-direction:column;width:100%;gap:var(--space-md)">
  <arc-alert variant="success" heading="Deployment complete" dismissible>Your changes are now live on production.</arc-alert>
</div>`,

    props: [
      {
        name: 'variant',
        type: "'info' | 'success' | 'warning' | 'error'",
        default: "'info'",
        description: 'Controls the semantic colour palette and icon. Use "info" for neutral guidance, "success" for confirmations, "warning" for caution states, and "error" for failures or blocking issues.',
      },
      {
        name: 'dismissible',
        type: 'boolean',
        default: 'false',
        description: 'When true, renders a close button in the top-right corner. Clicking it removes the alert from the DOM and fires an "arc-dismiss" event that parent components can listen to.',
      },
      {
        name: 'heading',
        type: 'string',
        description: 'Optional bold heading rendered above the body slot. Use it for a scannable one-line summary so users can quickly gauge the alert\'s importance before reading the full message.',
      },
    ],
    events: [
      { name: 'arc-dismiss', description: 'Fired when a dismissible alert is closed' },
    ],

    tabs: [
      {
        label: 'Web Component',
        lang: 'html',
        code: `<arc-alert variant="success" heading="Deployment complete" dismissible>
  Your changes are now live on production.
</arc-alert>`,
      },
      {
        label: 'React',
        lang: 'tsx',
        code: `import { Alert } from '@arclux/arc-ui-react';

<Alert variant="success" heading="Deployment complete" dismissible>
  Your changes are now live on production.
</Alert>`,
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
    <Alert variant="success" heading="Deployment complete" dismissible>
      Your changes are now live on production.
    </Alert>
  \`,
})
export class MyComponent {}`,
      },
      {
        label: 'Solid',
        lang: 'tsx',
        code: `import { Alert } from '@arclux/arc-ui-solid';

<Alert variant="success" heading="Deployment complete" dismissible>
  Your changes are now live on production.
</Alert>`,
      },
      {
        label: 'Preact',
        lang: 'tsx',
        code: `import { Alert } from '@arclux/arc-ui-preact';

<Alert variant="success" heading="Deployment complete" dismissible>
  Your changes are now live on production.
</Alert>`,
      },
      {
        label: 'HTML',
        lang: 'html',
        code: `<arc-alert variant="success" heading="Deployment complete" dismissible>
  Your changes are now live on production.
</arc-alert>`,
      },
    ],
  };
