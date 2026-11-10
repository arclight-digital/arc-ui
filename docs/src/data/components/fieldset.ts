import type { ComponentDef } from './_types';

export const fieldset: ComponentDef = {
  name: 'Fieldset',
  slug: 'fieldset',
  tag: 'arc-fieldset',
  tier: 'input',
  interactivity: 'static',
  description:
    'Grouped form section with legend, description, error message, and optional card variant. Wraps related inputs with native fieldset semantics.',

  overview: `Fieldset groups related form controls inside a native \`<fieldset>\` with a \`<legend>\`, so screen readers announce them as one named group. Set the legend with the \`legend\` prop, or with the \`legend\` slot for markup. \`description\` adds helper text under the legend.

The default variant is a bordered box with rounded corners, and \`variant="card"\` adds a surface background and a small shadow. \`error\` shows a message below the controls with \`role="alert"\`, for group-level problems such as "Select at least one option". The \`actions\` slot puts buttons or links, such as "Select all" or "Reset", on the legend's line.

\`disabled\` dims the group to 50% opacity and sets \`disabled\` on the inner \`<fieldset>\`. Your controls are slotted, not inside that element, so disable them as well.`,

  features: [
    'CSS parts: `fieldset`, `legend`, `description`, `content`, `error`',
  ],

  guidelines: {
    do: [
      'Group inputs that share one label, such as the fields of a shipping address',
      'Use the card variant to set sections apart on a settings page',
      'Give every fieldset a legend. It\'s the group\'s accessible name',
    ],
    dont: [
      'Don\'t use it only for looks. Use a `div` or `arc-card`',
      'Don\'t put a single field\'s error in the fieldset\'s `error`. Attach it to that input',
    ],
  },

  previewHtml: `<arc-fieldset legend="Notification preferences" description="Choose how you'd like to be notified.">
  <arc-toggle label="Email notifications" checked></arc-toggle>
  <arc-toggle label="Push notifications"></arc-toggle>
  <arc-toggle label="SMS alerts"></arc-toggle>
</arc-fieldset>`,

  tabs: [
    {
      label: 'Web Component',
      lang: 'html',
      code: `<arc-fieldset legend="Contact info" description="We'll use this to reach you.">
  <arc-label for="email" required>Email</arc-label>
  <arc-input id="email" type="email" placeholder="you@example.com"></arc-input>

  <arc-label for="phone">Phone</arc-label>
  <arc-input id="phone" type="tel" placeholder="(555) 123-4567"></arc-input>
</arc-fieldset>

<!-- Card variant with error -->
<arc-fieldset legend="Preferences" variant="card" error="Please select at least one option.">
  <arc-checkbox label="Option A"></arc-checkbox>
  <arc-checkbox label="Option B"></arc-checkbox>
</arc-fieldset>`,
    },
    {
      label: 'React',
      lang: 'tsx',
      code: `import { Fieldset, Label, Input, Checkbox } from '@arclux/arc-ui-react';

export default function Example() {
  return (
    <Fieldset legend="Contact info" description="We'll use this to reach you.">
      <Label htmlFor="email" required>Email</Label>
      <Input id="email" type="email" placeholder="you@example.com" />
      <Label htmlFor="phone">Phone</Label>
      <Input id="phone" type="tel" placeholder="(555) 123-4567" />
    </Fieldset>
  );
}`,
    },
    {
      label: 'Vue',
      lang: 'html',
      code: `<script setup>
import { Fieldset, Label, Input } from '@arclux/arc-ui-vue';
</script>

<template>
  <Fieldset legend="Contact info" description="We'll use this to reach you.">
    <Label for="email" required>Email</Label>
    <Input id="email" type="email" placeholder="you@example.com" />
  </Fieldset>
</template>`,
    },
    {
      label: 'Svelte',
      lang: 'html',
      code: `<script>
  import { Fieldset, Label, Input } from '@arclux/arc-ui-svelte';
</script>

<Fieldset legend="Contact info" description="We'll use this to reach you.">
  <Label for="email" required>Email</Label>
  <Input id="email" type="email" placeholder="you@example.com" />
</Fieldset>`,
    },
    {
      label: 'Angular',
      lang: 'ts',
      code: `import { Component } from '@angular/core';
import { Fieldset, Label, Input } from '@arclux/arc-ui-angular';

@Component({
  imports: [Fieldset, Label, Input],
  template: \`
    <arc-fieldset legend="Contact info" description="We'll use this to reach you.">
      <arc-label for="email" required>Email</arc-label>
      <arc-input id="email" type="email" placeholder="you@example.com" />
    </arc-fieldset>
  \`,
})
export class ContactForm {}`,
    },
    {
      label: 'Solid',
      lang: 'tsx',
      code: `import { Fieldset, Label, Input } from '@arclux/arc-ui-solid';

export default function Example() {
  return (
    <Fieldset legend="Contact info" description="We'll use this to reach you.">
      <Label for="email" required>Email</Label>
      <Input id="email" type="email" placeholder="you@example.com" />
    </Fieldset>
  );
}`,
    },
    {
      label: 'Preact',
      lang: 'tsx',
      code: `import { Fieldset, Label, Input } from '@arclux/arc-ui-preact';

export default function Example() {
  return (
    <Fieldset legend="Contact info" description="We'll use this to reach you.">
      <Label for="email" required>Email</Label>
      <Input id="email" type="email" placeholder="you@example.com" />
    </Fieldset>
  );
}`,
    },
    {
      label: 'HTML',
      lang: 'html',
      code: `<!-- Use native <fieldset> and <legend> -->
<fieldset class="arc-fieldset" style="border: 1px solid var(--border-default); border-radius: var(--radius-md); padding: 16px 24px 24px;">
  <legend style="font-weight: 600; color: var(--text-primary); padding: 0 4px;">Contact info</legend>
  <p style="font-size: 14px; color: var(--text-muted);">We'll use this to reach you.</p>
  <!-- inputs here -->
</fieldset>`,
    },
    {
      label: 'HTML (Inline)',
      lang: 'html',
      code: `<fieldset style="border: 1px solid rgb(42, 42, 52); border-radius: 10px; padding: 16px 24px 24px; margin: 0;">
  <legend style="font-weight: 600; color: rgb(224, 224, 232); padding: 0 4px;">Contact info</legend>
  <!-- inputs here -->
</fieldset>`,
    },
  ],

  seeAlso: ['label', 'form', 'switch-group'],
};
