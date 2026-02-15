import type { ComponentDef } from './_types';

export const label: ComponentDef = {
  name: 'Label',
  slug: 'label',
  tag: 'arc-label',
  tier: 'input',
  interactivity: 'static',
  description: 'Form label with required indicator, optional description text, and tooltip slot. Pairs with any input component via the `for` attribute.',

  overview: `Label provides a styled, accessible label for form controls. It renders a \`<label>\` element that can target any input via the \`for\` prop, clicking the label to focus the associated control just like native HTML.

The \`required\` prop appends a red asterisk next to the label text, signaling to users that the field is mandatory. A \`description\` slot renders smaller muted helper text below the label, useful for explaining expected formats or constraints without cluttering the label itself. A \`tooltip\` slot lets you place an info icon or tooltip trigger inline with the label.

Three sizes (sm, md, lg) control the font size, and the disabled state reduces opacity and blocks pointer events, visually syncing with a disabled input below it.`,

  features: [
    'Native `<label>` element with `for` attribute for accessible input association',
    'Required indicator (red asterisk) via the `required` prop',
    'Description slot for helper text below the label',
    'Tooltip slot for inline info icons or tooltip triggers',
    'Three size presets: sm, md, lg',
    'Disabled state with reduced opacity',
    'Click-to-focus behavior matching native label semantics',
    'Exposed CSS parts: label, description',
  ],

  guidelines: {
    do: [
      'Always pair a label with its input — every form control needs an accessible label',
      'Set the `for` prop to match the target input\'s `id` attribute',
      'Use the description slot for format hints like "MM/DD/YYYY" or character limits',
      'Use the required indicator to clearly mark mandatory fields',
    ],
    dont: [
      'Use Label as standalone text — it is a form element, not a heading or paragraph',
      'Hide labels visually while keeping them only for screen readers — visible labels help all users',
      'Put interactive elements inside the label text — use the tooltip slot instead',
    ],
  },

  previewHtml: `<div style="display: flex; flex-direction: column; gap: 16px; max-width: 320px;">
  <div>
    <arc-label for="name-input" required>Full name</arc-label>
    <arc-input id="name-input" placeholder="Jane Smith"></arc-input>
  </div>
  <div>
    <arc-label for="email-input">
      Email address
      <span slot="description">We'll never share your email.</span>
    </arc-label>
    <arc-input id="email-input" type="email" placeholder="jane@example.com"></arc-input>
  </div>
</div>`,

  props: [
    { name: 'for', type: 'string', default: "''", description: 'ID of the target input element. Clicking the label focuses the associated control.' },
    { name: 'required', type: 'boolean', default: 'false', description: 'Shows a red asterisk (*) after the label text.' },
    { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Controls the label font size.' },
    { name: 'disabled', type: 'boolean', default: 'false', description: 'Reduces opacity and blocks pointer events.' },
  ],

  tabs: [
    {
      label: 'Web Component',
      lang: 'html',
      code: `<arc-label for="username" required>Username</arc-label>
<arc-input id="username" placeholder="Enter username"></arc-input>

<arc-label for="bio">
  Bio
  <span slot="description">Keep it under 160 characters.</span>
</arc-label>
<arc-textarea id="bio"></arc-textarea>`,
    },
    {
      label: 'React',
      lang: 'tsx',
      code: `import { Label, Input, Textarea } from '@arclux/arc-ui-react';

<Label for="username" required>Username</Label>
<Input id="username" placeholder="Enter username" />

<Label for="bio">
  Bio
  <span slot="description">Keep it under 160 characters.</span>
</Label>
<Textarea id="bio" />`,
    },
    {
      label: 'Vue',
      lang: 'html',
      code: `<script setup>
import { Label, Input, Textarea } from '@arclux/arc-ui-vue';
</script>

<template>
  <Label for="username" required>Username</Label>
  <Input id="username" placeholder="Enter username" />

  <Label for="bio">
    Bio
    <template #description>Keep it under 160 characters.</template>
  </Label>
  <Textarea id="bio" />
</template>`,
    },
    {
      label: 'Svelte',
      lang: 'html',
      code: `<script>
  import { Label, Input, Textarea } from '@arclux/arc-ui-svelte';
</script>

<Label for="username" required>Username</Label>
<Input id="username" placeholder="Enter username" />

<Label for="bio">
  Bio
  <span slot="description">Keep it under 160 characters.</span>
</Label>
<Textarea id="bio" />`,
    },
    {
      label: 'Angular',
      lang: 'ts',
      code: `import { Component } from '@angular/core';
import { Label, Input, Textarea } from '@arclux/arc-ui-angular';

@Component({
  imports: [Label, Input, Textarea],
  template: \`
    <Label for="username" required>Username</Label>
    <Input id="username" placeholder="Enter username" />
  \`,
})
export class FormComponent {}`,
    },
    {
      label: 'Solid',
      lang: 'tsx',
      code: `import { Label, Input } from '@arclux/arc-ui-solid';

<Label for="username" required>Username</Label>
<Input id="username" placeholder="Enter username" />`,
    },
    {
      label: 'Preact',
      lang: 'tsx',
      code: `import { Label, Input } from '@arclux/arc-ui-preact';

<Label for="username" required>Username</Label>
<Input id="username" placeholder="Enter username" />`,
    },
    {
      label: 'HTML',
      lang: 'html',
      code: `<!-- Use native <label> with matching for/id attributes -->
<label class="arc-label" for="username">
  Username <span style="color: #ef4444; font-weight: 700;">*</span>
</label>
<input id="username" placeholder="Enter username" />`,
    },
    {
      label: 'HTML (Inline)',
      lang: 'html',
      code: `<!-- Use native <label> with inline styles -->
<label for="username" style="display: block; font-size: 14px; font-weight: 600; color: rgb(160, 160, 176); margin-bottom: 4px;">
  Username <span style="color: #ef4444; font-weight: 700;">*</span>
</label>
<input id="username" placeholder="Enter username" />`,
    },
  ],

  seeAlso: ['input', 'fieldset', 'form'],
};
