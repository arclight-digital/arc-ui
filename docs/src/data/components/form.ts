import type { ComponentDef } from './_types';

export const form: ComponentDef = {
  name: 'Form',
  slug: 'form',
  tag: 'arc-form',
  tier: 'input',
  interactivity: 'interactive',
  description:
    'Wraps ARC UI inputs in a form that validates them on submit and fires arc-submit with their values.',

  overview: `Form wraps ARC UI inputs in a real \`<form>\`. On submit it checks every field, puts each failing field's message on that field, and fires \`arc-invalid\` with the list of errors. When everything passes it fires \`arc-submit\` with \`{ values, formData, valid }\`. Use it whenever you collect more than one field, so \`required\`, patterns and an error summary work without validation code of your own.

**Validation comes from the controls.** Form doesn't decide whether a field is filled. It calls each control's \`checkValidity()\` and reads its \`validationMessage\`. A control that knows its own empty state, such as a multi-select with an empty array or a date range with one end set, is judged on its own terms. Only form-associated elements whose tag starts with \`arc-\` take part, so a control you wrote yourself under another tag name isn't validated, serialized or disabled with the form. Form only clears error text it wrote, so an error you set from a server response survives the next submit.

**Fields can be anywhere inside the form.** A control inside a Fieldset, a Card or any layout component is still found, validated, serialized and disabled with the form.

**\`submit()\` is for a submit control outside the form.** A button outside \`<arc-form>\` doesn't submit it: a wizard's Next button in a parent toolbar, a Save button in the app header, a keyboard shortcut. \`submit()\` goes through the real \`<form>\`, so validation runs and \`arc-submit\` fires as if a submit button inside had been pressed.

**\`action\` submits natively.** With \`action\` (and \`method\`) set, a valid submit fires \`arc-submit\` and then lets the browser submit the form and navigate. The request carries the same entries as \`arc-submit\`'s \`formData\`, including fields nested in a Fieldset or a layout component.

**\`reset()\` restores starting values.** Each control goes back to the state it had when it first connected, as reset does in HTML. \`arc-reset\` fires after.

Input, Textarea, Select, Checkbox, Toggle and RadioGroup are form-associated through \`ElementInternals\`, so they also submit with a plain \`<form action="/api/contact" method="POST">\` once the components are loaded.`,

  features: [
    'An error summary at the top of the form, above the fields, lists what failed. Set `no-error-summary` to show errors your own way',
    'With `novalidate`, failing fields still get their error messages, but the submit goes ahead and `arc-submit` reports `valid: false`',
    '`disabled` disables every field in the form',
    '`loading` dims the form to 70% opacity, blocks pointer input and ignores submits until it\'s cleared. Each `arc-button` with `type="submit"` inside it shows its spinner and is disabled meanwhile',
    'Enter in a single-line input submits the form',
  ],

  guidelines: {
    do: [
      'Put all related fields in one Form, so they validate and submit together',
      'Give every field a unique `name`. Without one, its key falls back to its label',
      'Set `required` on mandatory fields and let Form show the messages',
      'End the form with a Button that has `type="submit"`',
      'Set `loading` while an async submit runs, to prevent duplicate requests',
      'Listen for `arc-submit`, not the native `submit`, to get the validated values',
      'Give every field a label, so the error summary reads well',
    ],
    dont: [
      "Don't put one Form inside another. HTML doesn't allow nested forms",
      "Don't write validation by hand for rules the constraint API already covers",
      "Don't rely on client-side validation alone. Validate on the server too",
      "Don't expect a button outside the Form to submit it. Call `submit()` from that button",
      "Don't use `novalidate` to get around broken validation. Fix the constraints",
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
