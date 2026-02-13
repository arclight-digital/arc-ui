import type { ComponentDef } from './_types';

export const input: ComponentDef = {
    name: 'Input',
    slug: 'input',
    tag: 'arc-input',
    tier: 'input',
    interactivity: 'hybrid',
    description: 'Versatile form control supporting single-line text, email, password, and multiline textarea modes with built-in label, placeholder, and validation states. Pairs with Form for complete data-entry workflows.',

    overview: `Input is the foundational text-entry component in ARC UI. It wraps a native \`<input>\` or \`<textarea>\` element with consistent styling, an integrated label, placeholder support, and validation feedback -- all managed through a single declarative API.

Use Input whenever you need to collect freeform text from a user: names, emails, passwords, search queries, or longer messages. The \`multiline\` prop switches the underlying element to a \`<textarea>\` for multi-row content without changing the component interface, so forms stay uniform whether a field needs one line or twenty.

Input supports \`prefix\` and \`suffix\` slots for placing icons, labels, or other inline elements inside the field box. This is useful for search icons, unit labels, clear buttons, or any adornment that should appear visually attached to the input.

Input is designed to work seamlessly with the Form component. Wrap a set of Inputs inside a Form to get coordinated validation, submission handling, and error summary. Each Input exposes \`name\`, \`required\`, and \`type\` props that Form reads automatically, so you rarely need extra wiring.`,

    features: [
      'Integrated label rendered above the field with automatic `for`/`id` association',
      'Multiple input types: text, email, tel, url, and password',
      'Multiline mode converts to a resizable textarea with a single boolean prop',
      'Prefix and suffix slots for icons or inline adornments inside the field box',
      'Placeholder text with accessible contrast ratios',
      'Required-field indicator with built-in validation message',
      'Disabled state that greys out the field and blocks interaction',
      'Keyboard-accessible with visible focus ring following design tokens',
      'Pairs with Form for coordinated validation and submission',
    ],

    guidelines: {
      do: [
        'Always provide a `label` so the field is accessible to screen readers',
        'Use the most specific `type` available (e.g. `email` for email addresses) to trigger the correct mobile keyboard',
        'Set `placeholder` to show an example value, not as a replacement for the label',
        'Use `multiline` for any field that may need more than one line of text',
        'Use the `prefix` slot for search icons or currency symbols that contextualise the input',
        'Use the `suffix` slot for unit labels, clear buttons, or status indicators',
        'Group related Inputs inside a Form component for coordinated validation',
        'Mark required fields with the `required` prop so validation is handled automatically',
      ],
      dont: [
        'Do not use placeholder text as the only label -- it disappears on focus and fails accessibility',
        'Do not set `type="password"` on a multiline input -- passwords are always single-line',
        'Do not disable inputs without explaining to the user why the field is unavailable',
        'Avoid overriding the built-in validation styling with custom CSS -- use design tokens instead',
        'Do not use Input for structured data like dates or selects -- use DatePicker or Select instead',
      ],
    },

    previewHtml: `<div style="display:flex; flex-direction:column; width:100%; max-width:400px; gap:16px;">
  <arc-input label="Search" name="search" placeholder="Search components...">
    <svg slot="prefix" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="20" height="20"><path fill-rule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clip-rule="evenodd"/></svg>
  </arc-input>
  <arc-input label="Email" name="email" type="email" placeholder="jane@example.com" required></arc-input>
  <arc-input label="Message" name="message" multiline placeholder="How can we help?" required></arc-input>
</div>`,

    props: [
      { name: 'label', type: 'string', description: 'Visible label rendered above the input. Automatically associated with the field via a generated id, ensuring screen readers announce it correctly.' },
      { name: 'name', type: 'string', description: 'The `name` attribute sent with form data on submission. Also used by the Form component to track field state and validation.' },
      { name: 'type', type: "'text' | 'email' | 'tel' | 'url' | 'password'", default: "'text'", description: 'The HTML input type. Controls browser validation behaviour and which virtual keyboard appears on mobile devices. Ignored when `multiline` is true.' },
      { name: 'placeholder', type: 'string', description: 'Hint text displayed inside the field when it is empty. Use it to show an example value -- never as a substitute for the label.' },
      { name: 'multiline', type: 'boolean', default: 'false', description: 'When true, renders a `<textarea>` instead of an `<input>`, allowing multi-row text entry. The textarea is vertically resizable by default.' },
      { name: 'disabled', type: 'boolean', default: 'false', description: 'Prevents user interaction and applies a muted visual treatment. The field value is excluded from form submission when disabled.' },
      { name: 'required', type: 'boolean', default: 'false', description: 'Marks the field as required. Displays a required indicator next to the label and triggers native constraint validation on form submission.' },
    ],
    events: [
      { name: 'arc-input', description: 'Fired on each keystroke with { value } detail' },
      { name: 'arc-change', description: 'Fired on blur when value has changed' },
    ],

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

<div style={{ display: 'flex', flexDirection: 'column', width: '100%', maxWidth: 400, gap: 16 }}>
  <Input label="Name" name="name" placeholder="Jane Doe" required />
  <Input label="Email" name="email" type="email" placeholder="jane@example.com" required />
  <Input label="Message" name="message" multiline placeholder="How can we help?" required />
</div>

{/* With prefix icon */}
<Input label="Search" placeholder="Search...">
  <svg slot="prefix" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="20" height="20"><path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd"/></svg>
</Input>`,
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
      <Input label="Name" name="name" placeholder="Jane Doe" required></Input>
      <Input label="Email" name="email" type="email" placeholder="jane@example.com" required></Input>
      <Input label="Message" name="message" multiline placeholder="How can we help?" required></Input>
    </div>
  \`,
})
export class ContactFormComponent {}`,
      },
      {
        label: 'Solid',
        lang: 'tsx',
        code: `import { Input } from '@arclux/arc-ui-solid';

<div style={{ display: 'flex', 'flex-direction': 'column', width: '100%', 'max-width': '400px', gap: '16px' }}>
  <Input label="Name" name="name" placeholder="Jane Doe" required />
  <Input label="Email" name="email" type="email" placeholder="jane@example.com" required />
  <Input label="Message" name="message" multiline placeholder="How can we help?" required />
</div>`,
      },
      {
        label: 'Preact',
        lang: 'tsx',
        code: `import { Input } from '@arclux/arc-ui-preact';

<div style={{ display: 'flex', flexDirection: 'column', width: '100%', maxWidth: 400, gap: 16 }}>
  <Input label="Name" name="name" placeholder="Jane Doe" required />
  <Input label="Email" name="email" type="email" placeholder="jane@example.com" required />
  <Input label="Message" name="message" multiline placeholder="How can we help?" required />
</div>`,
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
    ],
  };
