import type { ComponentDef } from './_types';

export const label: ComponentDef = {
  name: 'Label',
  slug: 'label',
  tag: 'arc-label',
  tier: 'input',
  interactivity: 'static',
  description:
    'Form label with a required indicator, description text and a tooltip slot. Clicking it focuses the control whose id is in `for`.',

  overview: `Label puts a styled label above a form control. Set \`for\` to the control's \`id\` and clicking the label focuses that control.

The \`<label>\` element is inside Label's shadow root, so it can't reach an input outside it. It doesn't give the input its accessible name. Use the input's own label for that, such as the \`label\` prop on \`<arc-input>\`.

\`required\` adds a red asterisk after the text. The asterisk is hidden from screen readers, so set \`required\` on the input as well. The \`description\` slot puts smaller muted text under the label, and the \`tooltip\` slot puts an info icon or tooltip trigger beside it.`,

  features: [
    'Three sizes: sm, md, lg',
    '`disabled` halves the opacity and blocks pointer events, to match a disabled input below it',
  ],

  guidelines: {
    do: [
      "Give every control an accessible name of its own. Label doesn't supply one",
      'Use the description slot for format hints like "MM/DD/YYYY" or character limits',
      'Mark mandatory fields with `required`, on both the label and the input',
    ],
    dont: [
      "Don't use Label as standalone text. Use a heading or paragraph",
      "Don't put interactive elements in the label text. Use the tooltip slot",
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

export default function Example() {
  return (
    <>
      <Label for="username" required>Username</Label>
      <Input id="username" placeholder="Enter username" />

      <Label for="bio">
        Bio
        <span slot="description">Keep it under 160 characters.</span>
      </Label>
      <Textarea id="bio" />
    </>
  );
}`,
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
    <arc-label for="username" required>Username</arc-label>
    <arc-input id="username" placeholder="Enter username" />
  \`,
})
export class FormComponent {}`,
    },
    {
      label: 'Solid',
      lang: 'tsx',
      code: `import { Label, Input } from '@arclux/arc-ui-solid';

export default function Example() {
  return (
    <>
      <Label for="username" required>Username</Label>
      <Input id="username" placeholder="Enter username" />
    </>
  );
}`,
    },
    {
      label: 'Preact',
      lang: 'tsx',
      code: `import { Label, Input } from '@arclux/arc-ui-preact';

export default function Example() {
  return (
    <>
      <Label for="username" required>Username</Label>
      <Input id="username" placeholder="Enter username" />
    </>
  );
}`,
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
