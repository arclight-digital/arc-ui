import type { ComponentDef } from './_types';

export const input: ComponentDef = {
  name: 'Input',
  slug: 'input',
  tag: 'arc-input',
  tier: 'input',
  interactivity: 'hybrid',
  searchKeywords: ['textfield', 'text field'],
  description:
    'Text field with a built-in label, placeholder and validation states. Set `multiline` for a textarea.',

  overview: `Input wraps a native \`<input>\` or \`<textarea>\` with a label, placeholder and validation feedback. Use it for freeform text: names, emails, passwords, search queries or longer messages.

The \`multiline\` prop swaps the \`<input>\` for a \`<textarea>\` and keeps every other prop the same. The \`prefix\` and \`suffix\` slots put icons, unit labels or a clear button inside the field's border.

Inside a Form, each Input's \`name\` and value are collected on submit, and \`required\` fields are checked before the form submits.`,

  features: [
    'The `label` renders above the field and is tied to it with a generated `for`/`id` pair',
    'Types: text, email, tel, url and password',
    'The multiline textarea resizes vertically',
    'An empty `required` field is invalid, with the message "Please fill out this field."',
    'A disabled field can\'t be edited and its value isn\'t submitted',
  ],

  guidelines: {
    do: [
      'Give every field a `label` so screen readers announce it',
      'Use the most specific `type`, such as `email` for email addresses, so phones show the right keyboard',
      'Use `placeholder` for an example value, not as the label',
      'Use `multiline` for any field that may need more than one line',
      'Use the `prefix` slot for a search icon or currency symbol',
      'Use the `suffix` slot for a unit, a clear button or a status icon',
      'Mark required fields with `required`',
    ],
    dont: [
      'Don\'t use the placeholder as the only label. It disappears once someone types',
      'Don\'t set `type` on a multiline input. A textarea ignores it, so `type="password"` would show the text',
      'Don\'t disable a field without telling the user why',
      'Don\'t restyle the error state with custom CSS. Change the design tokens',
      'Don\'t use Input for dates or a fixed set of choices. Use DatePicker or Select',
    ],
  },

  previewHtml: `<div style="display:flex; flex-direction:column; width:100%; max-width:400px; gap:16px;">
  <arc-input label="Search" name="search" placeholder="Search components...">
    <svg slot="prefix" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="20" height="20"><path fill-rule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clip-rule="evenodd"/></svg>
  </arc-input>
  <arc-input label="Email" name="email" type="email" placeholder="jane@example.com" required></arc-input>
  <arc-input label="Message" name="message" multiline placeholder="How can we help?" required></arc-input>
</div>`,

  tabs: [
    {
      label: 'Web Component',
      lang: 'html',
      code: `<!-- Basic form fields -->
<div style="display:flex; flex-direction:column; width:100%; max-width:400px; gap:16px;">
  <arc-input label="Name" name="name" placeholder="Jane Doe" required></arc-input>
  <arc-input label="Email" name="email" type="email" placeholder="jane@example.com" required></arc-input>
  <arc-input label="Message" name="message" multiline placeholder="How can we help?" required></arc-input>
</div>

<!-- With prefix icon (search) -->
<arc-input label="Search" placeholder="Search...">
  <svg slot="prefix" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="20" height="20"><path fill-rule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clip-rule="evenodd"/></svg>
</arc-input>`,
    },
    {
      label: 'React',
      lang: 'tsx',
      code: `import { Input } from '@arclux/arc-ui-react';

export default function Example() {
  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', width: '100%', maxWidth: 400, gap: 16 }}>
        <Input label="Name" name="name" placeholder="Jane Doe" required />
        <Input label="Email" name="email" type="email" placeholder="jane@example.com" required />
        <Input label="Message" name="message" multiline placeholder="How can we help?" required />
      </div>

      {/* With prefix icon */}
      <Input label="Search" placeholder="Search...">
        <svg slot="prefix" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="20" height="20"><path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd"/></svg>
      </Input>
    </>
  );
}`,
    },
    {
      label: 'Vue',
      lang: 'html',
      code: `<script setup>
import { Input } from '@arclux/arc-ui-vue';
</script>

<template>
  <div style="display:flex; flex-direction:column; width:100%; max-width:400px; gap:16px;">
    <Input label="Name" name="name" placeholder="Jane Doe" required />
    <Input label="Email" name="email" type="email" placeholder="jane@example.com" required />
    <Input label="Message" name="message" multiline placeholder="How can we help?" required />
  </div>
</template>`,
    },
    {
      label: 'Svelte',
      lang: 'html',
      code: `<script>
  import { Input } from '@arclux/arc-ui-svelte';
</script>

<div style="display:flex; flex-direction:column; width:100%; max-width:400px; gap:16px;">
  <Input label="Name" name="name" placeholder="Jane Doe" required />
  <Input label="Email" name="email" type="email" placeholder="jane@example.com" required />
  <Input label="Message" name="message" multiline placeholder="How can we help?" required />
</div>`,
    },
    {
      label: 'Angular',
      lang: 'ts',
      code: `import { Component } from '@angular/core';
import { Input } from '@arclux/arc-ui-angular';

@Component({
  imports: [Input],
  template: \`
    <div style="display:flex; flex-direction:column; width:100%; max-width:400px; gap:16px;">
      <arc-input label="Name" name="name" placeholder="Jane Doe" required></arc-input>
      <arc-input label="Email" name="email" type="email" placeholder="jane@example.com" required></arc-input>
      <arc-input label="Message" name="message" multiline placeholder="How can we help?" required></arc-input>
    </div>
  \`,
})
export class ContactFormComponent {}`,
    },
    {
      label: 'Solid',
      lang: 'tsx',
      code: `import { Input } from '@arclux/arc-ui-solid';

export default function Example() {
  return (
    <div style={{ display: 'flex', 'flex-direction': 'column', width: '100%', 'max-width': '400px', gap: '16px' }}>
      <Input label="Name" name="name" placeholder="Jane Doe" required />
      <Input label="Email" name="email" type="email" placeholder="jane@example.com" required />
      <Input label="Message" name="message" multiline placeholder="How can we help?" required />
    </div>
  );
}`,
    },
    {
      label: 'Preact',
      lang: 'tsx',
      code: `import { Input } from '@arclux/arc-ui-preact';

export default function Example() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', maxWidth: 400, gap: 16 }}>
      <Input label="Name" name="name" placeholder="Jane Doe" required />
      <Input label="Email" name="email" type="email" placeholder="jane@example.com" required />
      <Input label="Message" name="message" multiline placeholder="How can we help?" required />
    </div>
  );
}`,
    },
    {
      label: 'HTML',
      lang: 'html',
      code: `<div style="display:flex; flex-direction:column; width:100%; max-width:400px; gap:16px;">
  <arc-input label="Name" name="name" placeholder="Jane Doe" required></arc-input>
  <arc-input label="Email" name="email" type="email" placeholder="jane@example.com" required></arc-input>
  <arc-input label="Message" name="message" multiline placeholder="How can we help?" required></arc-input>
</div>`,
    },

    {
      label: 'HTML (Inline)',
      lang: 'html',
      code: `<!-- Auto-generated by @arclux/prism — do not edit manually -->
<!-- arc-input — self-contained, no external CSS needed -->
<div class="arc-input">

</div>`,
    },
  ],

  seeAlso: ['textarea', 'select', 'combobox', 'number-input', 'form', '/docs/frameworks'],
};
