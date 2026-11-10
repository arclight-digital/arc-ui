import type { ComponentDef } from './_types';

export const alert: ComponentDef = {
  name: 'Alert',
  slug: 'alert',
  tag: 'arc-alert',
  tier: 'feedback',
  interactivity: 'hybrid',
  searchKeywords: ['callout', 'notice', 'tip', 'banner', 'aside'],
  description: 'An inline message box colored by severity, with an optional close button.',

  overview: `Alert shows a message inline in the page. The variant sets the color and icon: \`info\`, \`tip\`, \`success\`, \`warning\` or \`error\`.

Unlike a toast, an alert stays on the page until the user dismisses it or leaves, so use it for messages the user has to acknowledge or keep seeing: a state change, a finished action, a problem. The body slot takes any inline or block content, including links, lists and buttons.

**Alert absorbed \`arc-callout\` in v4.** Callout was an emphasized aside that differed from an \`info\` alert only in styling. It brought three things with it: the \`tip\` variant for advice that is neither a status nor a problem, an \`icon\` slot that replaces the built-in status glyph, and the \`live\` prop below. Callout's derived uppercase label has no equivalent, so pass \`heading\` if you want one. See [the tombstone](/docs/components/callout) for the full translation.

The role and announcement follow \`variant\` by default. \`error\` and \`warning\` are \`role="alert"\` and assertive, \`success\` is \`role="status"\` and polite, and \`info\` and \`tip\` are \`role="note"\` and aren't announced. That last one changed from v3, where \`info\` was a polite live region. \`info\` is the variant most likely to be static content, and announcing every informational box on load is noise.

Severity and urgency don't always agree, and \`live\` sets the announcement on its own. An \`info\` alert inserted after a background save wants \`live="polite"\`, and a \`warning\` in the initial HTML probably wants \`live="off"\`.`,

  features: [
    '`dismissible` adds a close button. Clicking it fires a cancelable `arc-close` event, then hides the alert',
    '`density="compact"` reduces padding and type size for forms and dense panels',
  ],

  guidelines: {
    do: [
      'Keep the text short: lead with the outcome, then explain',
      'Add a heading when the body runs longer than one sentence',
      'Make an alert dismissible when the message is temporary',
      "Put an alert next to the content it's about, or at the top of the page for page-wide messages",
      'Use `tip` for advice that is neither a status report nor a problem',
      "Set `live` on an alert you insert after page load. The default goes by severity and can't know the alert just appeared",
      "Use the `icon` slot when the glyph should say something the variant doesn't, such as a product icon or a specific action",
    ],
    dont: [
      'Don\'t use `info` to get a live region. It is `role="note"` and isn\'t announced, so set `live="polite"`',
      "Don't stack more than two or three alerts. Combine them, or use toasts",
      "Don't use `error` for warnings. Keep it for failures",
      "Don't rely on color alone. The heading and text should make sense without it",
      "Don't make every alert dismissible. Leave critical errors on screen",
    ],
  },

  previewHtml: `<div style="display:flex;flex-direction:column;width:100%;gap:var(--space-md)">
  <arc-alert variant="success" heading="Deployment complete" dismissible>Your changes are now live on production.</arc-alert>
  <arc-alert variant="tip" heading="Faster builds">Cache <code>node_modules</code> between CI runs to skip the install step.</arc-alert>
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
