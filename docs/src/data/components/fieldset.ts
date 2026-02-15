import type { ComponentDef } from './_types';

export const fieldset: ComponentDef = {
  name: 'Fieldset',
  slug: 'fieldset',
  tag: 'arc-fieldset',
  tier: 'input',
  interactivity: 'static',
  description: 'Grouped form section with legend, description, error message, and optional card variant. Wraps related inputs with native fieldset semantics.',

  overview: `Fieldset wraps a group of related form controls inside a native \`<fieldset>\` element with a styled legend, optional description text, and error messaging. It provides the semantic grouping that screen readers use to announce related fields as a unit.

Two variants control the visual treatment: the default variant renders a bordered container with rounded corners, while the card variant adds a surface background and subtle shadow for elevated form sections. The \`error\` prop renders a red alert message below the content area, useful for group-level validation like "At least one option must be selected."

An \`actions\` slot in the legend area lets you place buttons or links (like "Select all" or "Reset") inline with the group heading. The \`disabled\` prop cascades to all child controls via the native fieldset disabled behavior, dimming the entire group at once.`,

  features: [
    'Native `<fieldset>` and `<legend>` elements for proper form semantics',
    'Two variants: default (bordered) and card (elevated surface)',
    'Legend text via prop or slot for flexible heading content',
    'Description text for group-level helper context',
    'Error message with `role="alert"` for group validation feedback',
    'Actions slot for inline legend controls (Select all, Reset, etc.)',
    'Disabled state cascades to all child controls via native fieldset behavior',
    'Exposed CSS parts: fieldset, legend, description, content, error',
  ],

  guidelines: {
    do: [
      'Group related inputs that share a common label — e.g., "Shipping Address" fields',
      'Use the card variant for visually distinct form sections in settings pages',
      'Use the error prop for group-level validation like "Select at least one option"',
      'Provide a legend for every fieldset — it is the accessible group label',
    ],
    dont: [
      'Nest fieldsets more than one level deep — it creates confusing screen reader announcements',
      'Use Fieldset for visual-only grouping — use a `div` or `arc-card` instead',
      'Put field-level errors in the fieldset error slot — attach those to individual inputs',
    ],
  },

  previewHtml: `<arc-fieldset legend="Notification preferences" description="Choose how you'd like to be notified.">
  <arc-toggle label="Email notifications" checked></arc-toggle>
  <arc-toggle label="Push notifications"></arc-toggle>
  <arc-toggle label="SMS alerts"></arc-toggle>
</arc-fieldset>`,

  props: [
    { name: 'legend', type: 'string', default: "''", description: 'Text displayed in the `<legend>` element. Also available via the `legend` slot for rich content.' },
    { name: 'description', type: 'string', default: "''", description: 'Helper text displayed below the legend.' },
    { name: 'disabled', type: 'boolean', default: 'false', description: 'Disables all child controls and dims the fieldset.' },
    { name: 'error', type: 'string', default: "''", description: 'Error message displayed below the content with `role="alert"`.' },
    { name: 'variant', type: "'default' | 'card'", default: "'default'", description: 'Visual style. Card adds a surface background and shadow.' },
  ],

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

<Fieldset legend="Contact info" description="We'll use this to reach you.">
  <Label htmlFor="email" required>Email</Label>
  <Input id="email" type="email" placeholder="you@example.com" />
  <Label htmlFor="phone">Phone</Label>
  <Input id="phone" type="tel" placeholder="(555) 123-4567" />
</Fieldset>`,
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
    <Fieldset legend="Contact info" description="We'll use this to reach you.">
      <Label for="email" required>Email</Label>
      <Input id="email" type="email" placeholder="you@example.com" />
    </Fieldset>
  \`,
})
export class ContactForm {}`,
    },
    {
      label: 'Solid',
      lang: 'tsx',
      code: `import { Fieldset, Label, Input } from '@arclux/arc-ui-solid';

<Fieldset legend="Contact info" description="We'll use this to reach you.">
  <Label for="email" required>Email</Label>
  <Input id="email" type="email" placeholder="you@example.com" />
</Fieldset>`,
    },
    {
      label: 'Preact',
      lang: 'tsx',
      code: `import { Fieldset, Label, Input } from '@arclux/arc-ui-preact';

<Fieldset legend="Contact info" description="We'll use this to reach you.">
  <Label for="email" required>Email</Label>
  <Input id="email" type="email" placeholder="you@example.com" />
</Fieldset>`,
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
