import type { ComponentDef } from './_types';

export const inlineMessage: ComponentDef = {
    name: 'Inline Message',
    slug: 'inline-message',
    tag: 'arc-inline-message',
    tier: 'feedback',
    interactivity: 'static',
    description: 'Contextual feedback that sits inline in a form or content area. Same semantic color variants as alert but compact — icon + text only, no background fill.',

    overview: `Inline Message provides lightweight, contextual feedback directly within forms and content areas. It uses the same four semantic colour variants as alert — info, success, warning, and error — but with a much more compact presentation: just an icon and text, with no background fill, border, or padding.

This minimal treatment makes inline-message ideal for form field validation hints, helper text with semantic meaning, and contextual notes that should not dominate the visual hierarchy. The icon provides at-a-glance severity recognition while the text delivers the specific guidance.

Unlike alert, inline-message is not dismissible and has no interactive behavior — it is a pure display component that appears and disappears based on the state of the surrounding content. Place it directly below a form field to show validation feedback, or inline within a paragraph to add a contextual note.`,

    features: [
      'Four semantic variants (info, success, warning, error) with matching icons and text colours',
      'Compact icon + text layout with no background fill or border',
      'Inline display for seamless integration within forms and content',
      'Automatic icon selection based on variant',
      'Accessible — uses role="status" for dynamic messages',
      'Lightweight — no padding, background, or border to minimize visual footprint',
      'Inherits font size from parent for consistent typography',
    ],

    guidelines: {
      do: [
        'Use inline-message for form field validation feedback directly below the input',
        'Use the error variant for validation failures and success for confirmed valid fields',
        'Keep messages short — one sentence that tells the user how to fix the issue',
        'Place inline-message immediately after the related element for clear association',
        'Use the info variant for neutral helper text with a hint icon',
      ],
      dont: [
        'Use inline-message for global or page-level notifications — use alert or banner instead',
        'Stack multiple inline-messages below a single field — consolidate into one message',
        'Use inline-message as a replacement for required-field indicators',
        'Rely solely on colour to convey meaning — the icon and text must be self-explanatory',
        'Use inline-message for success confirmations after form submission — use toast instead',
      ],
    },

    previewHtml: `<div style="display:flex;flex-direction:column;width:100%;gap:var(--space-sm)">
  <arc-inline-message variant="info">This field accepts email addresses only.</arc-inline-message>
  <arc-inline-message variant="success">Email address is valid.</arc-inline-message>
  <arc-inline-message variant="warning">This email is already associated with another account.</arc-inline-message>
  <arc-inline-message variant="error">Please enter a valid email address.</arc-inline-message>
</div>`,

    props: [
      {
        name: 'variant',
        type: "'info' | 'success' | 'warning' | 'error'",
        default: "'info'",
        description: 'Controls the icon and text colour. Use "info" for neutral hints, "success" for valid state feedback, "warning" for caution notes, and "error" for validation failures.',
      },
    ],
    events: [],

    tabs: [
      {
        label: 'Web Component',
        lang: 'html',
        code: `<arc-inline-message variant="info">
  This field accepts email addresses only.
</arc-inline-message>

<arc-inline-message variant="error">
  Please enter a valid email address.
</arc-inline-message>`,
      },
      {
        label: 'React',
        lang: 'tsx',
        code: `import { InlineMessage } from '@arclux/arc-ui-react';

<InlineMessage variant="info">
  This field accepts email addresses only.
</InlineMessage>

<InlineMessage variant="error">
  Please enter a valid email address.
</InlineMessage>`,
      },
      {
        label: 'Vue',
        lang: 'html',
        code: `<script setup>
import { InlineMessage } from '@arclux/arc-ui-vue';
</script>

<template>
  <InlineMessage variant="info">
    This field accepts email addresses only.
  </InlineMessage>
  <InlineMessage variant="error">
    Please enter a valid email address.
  </InlineMessage>
</template>`,
      },
      {
        label: 'Svelte',
        lang: 'html',
        code: `<script>
  import { InlineMessage } from '@arclux/arc-ui-svelte';
</script>

<InlineMessage variant="info">
  This field accepts email addresses only.
</InlineMessage>

<InlineMessage variant="error">
  Please enter a valid email address.
</InlineMessage>`,
      },
      {
        label: 'Angular',
        lang: 'ts',
        code: `import { Component } from '@angular/core';
import { InlineMessage } from '@arclux/arc-ui-angular';

@Component({
  imports: [InlineMessage],
  template: \`
    <InlineMessage variant="info">
      This field accepts email addresses only.
    </InlineMessage>
    <InlineMessage variant="error">
      Please enter a valid email address.
    </InlineMessage>
  \`,
})
export class MyComponent {}`,
      },
      {
        label: 'Solid',
        lang: 'tsx',
        code: `import { InlineMessage } from '@arclux/arc-ui-solid';

<InlineMessage variant="info">
  This field accepts email addresses only.
</InlineMessage>

<InlineMessage variant="error">
  Please enter a valid email address.
</InlineMessage>`,
      },
      {
        label: 'Preact',
        lang: 'tsx',
        code: `import { InlineMessage } from '@arclux/arc-ui-preact';

<InlineMessage variant="info">
  This field accepts email addresses only.
</InlineMessage>

<InlineMessage variant="error">
  Please enter a valid email address.
</InlineMessage>`,
      },
      {
        label: 'HTML',
        lang: 'html',
        code: `<!-- See HTML tab after running pnpm generate -->
<div class="arc-inline-message" data-variant="info">...</div>`,
      },
      {
        label: 'HTML (Inline)',
        lang: 'html',
        code: `<!-- See HTML (Inline) tab after running pnpm generate -->
<div class="arc-inline-message" style="...">...</div>`,
      },
    ],

    seeAlso: ['alert', 'banner', 'form'],
};
