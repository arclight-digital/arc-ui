import type { ComponentDef } from './_types';

export const form: ComponentDef = {
  name: 'Form',
  slug: 'form',
  tag: 'arc-form',
  tier: 'input',
  interactivity: 'interactive',
  description:
    'Form wrapper with built-in validation, error aggregation, and submit handling. Composes Input, Textarea, and Button into a cohesive data-entry workflow.',

  overview: `Form is the top-level container that turns a collection of ARC UI input components into a coordinated, validatable unit. It intercepts the native submit event, runs constraint validation across every child field, surfaces per-field error messages, and emits a structured \`arc-submit\` event only when all rules pass.

Use Form whenever you collect more than a single field from the user — contact forms, login screens, settings panels, multi-step wizards. Wrapping fields in a Form gives you automatic required-field enforcement, pattern matching, and a consistent error-summary experience without writing imperative validation logic.

**Validation comes from the controls.** Form does not re-derive whether a field is filled; it calls each control's \`checkValidity()\` and reads its \`validationMessage\`. So a control that understands its own emptiness — a multi-select with an empty array, a date range with one end set — is judged on its own terms, and a control you have written yourself participates as long as it is form-associated. Form only clears error text it wrote, so an error you set from a server response survives a later submit attempt.

**Fields can sit anywhere inside the form.** Nesting a control inside Fieldset, Card, or any layout component makes no difference to whether it is found, validated, serialised, or disabled along with the form.

**\`reset()\` restores, it does not empty.** Each control returns to the state it had when it first connected, which is what reset means in HTML — a field that shipped with a default value gets that value back, rather than being blanked.

All ARC UI form controls (Input, Textarea, Select, Checkbox, Toggle, RadioGroup) implement the \`ElementInternals\` form-association API, so they participate in native \`FormData\` collection automatically. This means you can use them inside a plain \`<form action="/api/contact" method="POST">\` for zero-JS static site submissions, or wrap them in \`<arc-form>\` for the full JS validation + \`arc-submit\` experience. For completely framework-free sites, ARC UI ships a \`form.css\` stylesheet that applies the same design tokens to native HTML form elements.`,

  features: [
    'Intercepts native form submission and runs constraint validation on all associated fields',
    'Aggregates per-field errors and displays an optional error summary above the submit button',
    'Fires `arc-submit` with a serialised FormData payload only when validation passes',
    'Supports `novalidate` to bypass built-in checks for custom validation flows',
    'Coordinates `disabled` state — disabling the form disables every child field',
    'Works with any form-associated element, including native inputs and ARC UI components',
    'Prevents double-submission by disabling the submit button while `loading` is true',
    'Reset support via `arc-reset` event and programmatic `.reset()` method — restores initial values rather than blanking fields',
    'Finds controls at any depth, including inside Fieldset and layout components',
    'Delegates validity to each control, so custom form-associated elements participate',
    'Keyboard-accessible — Enter key inside a single-line input triggers submission',
    'Pairs with Input, Textarea, Select, Checkbox, and RadioGroup without extra wiring',
  ],

  guidelines: {
    do: [
      'Wrap all related fields inside a single Form so validation and submission are coordinated',
      'Give every field a unique `name` so FormData serialisation produces the correct key-value pairs',
      'Set `required` on mandatory fields and let Form handle the validation messaging',
      'Provide a clear submit Button with `type="submit"` as the last child of the Form',
      'Use the `loading` prop to indicate an async submission in progress and prevent duplicate requests',
      'Listen for `arc-submit` instead of native `submit` to receive validated, serialised data',
      'Include meaningful labels on every field so the error summary is readable',
    ],
    dont: [
      'Do not nest one Form inside another — HTML forbids nested forms and behavior is undefined',
      'Do not handle validation manually when the built-in constraint API already covers your rules',
      'Do not rely solely on client-side validation — always validate on the server as well',
      'Do not place the submit Button outside the Form; it will not trigger submission',
      'Avoid calling `event.preventDefault()` on `arc-submit` unless you need to cancel the submission',
      'Do not use `novalidate` as a permanent workaround for broken validation — fix the constraints instead',
    ],
  },

  previewHtml: `<arc-form style="width:100%">
  <div style="display:flex; flex-direction:column; gap:16px; width:100%; max-width:480px;">
    <arc-input label="Name" name="name" placeholder="Jane Doe" required></arc-input>
    <arc-input label="Email" name="email" type="email" placeholder="jane@example.com" required></arc-input>
    <arc-textarea label="Message" name="message" rows="4" placeholder="How can we help?" required></arc-textarea>
    <arc-button variant="primary" type="submit">Send message</arc-button>
  </div>
</arc-form>`,

  tabs: [
    {
      label: 'Web Component',
      lang: 'html',
      code: `<arc-form>
  <div style="display:flex; flex-direction:column; gap:16px; width:100%; max-width:480px;">
    <arc-input label="Name" name="name" placeholder="Jane Doe" required></arc-input>
    <arc-input label="Email" name="email" type="email" placeholder="jane@example.com" required></arc-input>
    <arc-textarea label="Message" name="message" rows="4" placeholder="How can we help?" required></arc-textarea>
    <arc-button variant="primary" type="submit">Send message</arc-button>
  </div>
</arc-form>

<script>
  document.querySelector('arc-form')
    .addEventListener('arc-submit', (e) => {
      console.log('Form data:', Object.fromEntries(e.detail.formData));
    });
</script>`,
    },
    {
      label: 'React',
      lang: 'tsx',
      code: `import { Button, Form, Input, Textarea } from '@arclux/arc-ui-react';

function ContactForm() {
  const handleSubmit = (e: CustomEvent) => {
    const data = Object.fromEntries(e.detail.formData);
    console.log('Form data:', data);
  };

  return (
    <Form onArcSubmit={handleSubmit}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, width: '100%', maxWidth: 480 }}>
        <Input label="Name" name="name" placeholder="Jane Doe" required />
        <Input label="Email" name="email" type="email" placeholder="jane@example.com" required />
        <Textarea label="Message" name="message" rows={4} placeholder="How can we help?" required />
        <Button variant="primary" type="submit">Send message</Button>
      </div>
    </Form>
  );
}`,
    },
    {
      label: 'Vue',
      lang: 'html',
      code: `<script setup>
import { Button, Form, Input, Textarea } from '@arclux/arc-ui-vue';

function handleSubmit(e) {
  const data = Object.fromEntries(e.detail.formData);
  console.log('Form data:', data);
}
</script>

<template>
  <Form @arc-submit="handleSubmit">
    <div style="display:flex; flex-direction:column; gap:16px; width:100%; max-width:480px;">
      <Input label="Name" name="name" placeholder="Jane Doe" required />
      <Input label="Email" name="email" type="email" placeholder="jane@example.com" required />
      <Textarea label="Message" name="message" rows="4" placeholder="How can we help?" required />
      <Button variant="primary" type="submit">Send message</Button>
    </div>
  </Form>
</template>`,
    },
    {
      label: 'Svelte',
      lang: 'html',
      code: `<script>
  import { Button, Form, Input, Textarea } from '@arclux/arc-ui-svelte';

  function handleSubmit(e) {
    const data = Object.fromEntries(e.detail.formData);
    console.log('Form data:', data);
  }
</script>

<Form on:arc-submit={handleSubmit}>
  <div style="display:flex; flex-direction:column; gap:16px; width:100%; max-width:480px;">
    <Input label="Name" name="name" placeholder="Jane Doe" required />
    <Input label="Email" name="email" type="email" placeholder="jane@example.com" required />
    <Textarea label="Message" name="message" rows="4" placeholder="How can we help?" required />
    <Button variant="primary" type="submit">Send message</Button>
  </div>
</Form>`,
    },
    {
      label: 'Angular',
      lang: 'ts',
      code: `import { Component } from '@angular/core';
import { Button, Form, Input, Textarea } from '@arclux/arc-ui-angular';

@Component({
  imports: [Button, Form, Input, Textarea],
  template: \`
    <arc-form (arc-submit)="handleSubmit($event)">
      <div style="display:flex; flex-direction:column; gap:16px; width:100%; max-width:480px;">
        <arc-input label="Name" name="name" placeholder="Jane Doe" required></arc-input>
        <arc-input label="Email" name="email" type="email" placeholder="jane@example.com" required></arc-input>
        <arc-textarea label="Message" name="message" rows="4" placeholder="How can we help?" required></arc-textarea>
        <arc-button variant="primary" type="submit">Send message</arc-button>
      </div>
    </arc-form>
  \`,
})
export class ContactFormComponent {
  handleSubmit(e: CustomEvent) {
    const data = Object.fromEntries(e.detail.formData);
    console.log('Form data:', data);
  }
}`,
    },
    {
      label: 'Solid',
      lang: 'tsx',
      code: `import { Button, Form, Input, Textarea } from '@arclux/arc-ui-solid';

function ContactForm() {
  const handleSubmit = (e: CustomEvent) => {
    const data = Object.fromEntries(e.detail.formData);
    console.log('Form data:', data);
  };

  return (
    <Form onArcSubmit={handleSubmit}>
      <div style={{ display: 'flex', 'flex-direction': 'column', gap: '16px', width: '100%', 'max-width': '480px' }}>
        <Input label="Name" name="name" placeholder="Jane Doe" required />
        <Input label="Email" name="email" type="email" placeholder="jane@example.com" required />
        <Textarea label="Message" name="message" rows={4} placeholder="How can we help?" required />
        <Button variant="primary" type="submit">Send message</Button>
      </div>
    </Form>
  );
}`,
    },
    {
      label: 'Preact',
      lang: 'tsx',
      code: `import { Button, Form, Input, Textarea } from '@arclux/arc-ui-preact';

function ContactForm() {
  const handleSubmit = (e: CustomEvent) => {
    const data = Object.fromEntries(e.detail.formData);
    console.log('Form data:', data);
  };

  return (
    <Form onArcSubmit={handleSubmit}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, width: '100%', maxWidth: 480 }}>
        <Input label="Name" name="name" placeholder="Jane Doe" required />
        <Input label="Email" name="email" type="email" placeholder="jane@example.com" required />
        <Textarea label="Message" name="message" rows={4} placeholder="How can we help?" required />
        <Button variant="primary" type="submit">Send message</Button>
      </div>
    </Form>
  );
}`,
    },
  ],

  seeAlso: ['input', 'select', 'checkbox', 'toggle', 'textarea', 'button'],
};
