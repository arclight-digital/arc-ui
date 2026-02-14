import type { ComponentDef } from './_types';

export const form: ComponentDef = {
    name: 'Form',
    slug: 'form',
    tag: 'arc-form',
    tier: 'input',
    interactivity: 'interactive',
    description: 'Form wrapper with built-in validation, error aggregation, and submit handling. Composes Input, Textarea, and Button into a cohesive data-entry workflow.',

    overview: `Form is the top-level container that turns a collection of ARC UI input components into a coordinated, validatable unit. It intercepts the native submit event, runs constraint validation across every child field, surfaces per-field error messages, and emits a structured \`arc-submit\` event only when all rules pass.

Use Form whenever you collect more than a single field from the user -- contact forms, login screens, settings panels, multi-step wizards. Wrapping fields in a Form gives you automatic required-field enforcement, pattern matching, and a consistent error-summary experience without writing imperative validation logic.

All ARC UI form controls (Input, Textarea, Select, Checkbox, Toggle, RadioGroup) implement the \`ElementInternals\` form-association API, so they participate in native \`FormData\` collection automatically. This means you can use them inside a plain \`<form action="/api/contact" method="POST">\` for zero-JS static site submissions, or wrap them in \`<arc-form>\` for the full JS validation + \`arc-submit\` experience. For completely framework-free sites, ARC UI ships a \`form.css\` stylesheet that applies the same design tokens to native HTML form elements.`,

    features: [
      'Intercepts native form submission and runs constraint validation on all associated fields',
      'Aggregates per-field errors and displays an optional error summary above the submit button',
      'Emits `arc-submit` with a serialised FormData payload only when validation passes',
      'Supports `novalidate` to bypass built-in checks for custom validation flows',
      'Coordinates `disabled` state -- disabling the form disables every child field',
      'Works with any form-associated element, including native inputs and ARC UI components',
      'Prevents double-submission by disabling the submit button while `loading` is true',
      'Reset support via `arc-reset` event and programmatic `.reset()` method',
      'Keyboard-accessible -- Enter key inside a single-line input triggers submission',
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
        'Do not nest one Form inside another -- HTML forbids nested forms and behaviour is undefined',
        'Do not handle validation manually when the built-in constraint API already covers your rules',
        'Do not rely solely on client-side validation -- always validate on the server as well',
        'Do not place the submit Button outside the Form; it will not trigger submission',
        'Avoid calling `event.preventDefault()` on `arc-submit` unless you need to cancel the submission',
        'Do not use `novalidate` as a permanent workaround for broken validation -- fix the constraints instead',
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

    props: [
      { name: 'novalidate', type: 'boolean', default: 'false', description: 'When true, skips built-in constraint validation on submit. Use this when you need to implement a fully custom validation flow while still leveraging Form for data serialisation.' },
      { name: 'loading', type: 'boolean', default: 'false', description: 'Indicates an asynchronous submission is in progress. Disables the submit button and shows a loading indicator to prevent duplicate requests.' },
      { name: 'disabled', type: 'boolean', default: 'false', description: 'Disables the entire form, propagating the disabled state to every child field. Useful for read-only previews or while awaiting permissions.' },
      { name: 'errorSummary', type: 'boolean', default: 'true', description: 'When true, renders an aggregated list of validation errors above the submit area after a failed submission attempt. Set to false to handle error display manually.' },
    ],
    events: [
      { name: 'arc-submit', description: 'Fired on valid form submission with serialized form data' },
      { name: 'arc-invalid', description: 'Fired when validation fails, with error details' },
      { name: 'arc-reset', description: 'Fired when the form is reset via the .reset() method' },
    ],

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
    <Form (arc-submit)="handleSubmit($event)">
      <div style="display:flex; flex-direction:column; gap:16px; width:100%; max-width:480px;">
        <Input label="Name" name="name" placeholder="Jane Doe" required></Input>
        <Input label="Email" name="email" type="email" placeholder="jane@example.com" required></Input>
        <Textarea label="Message" name="message" rows="4" placeholder="How can we help?" required></Textarea>
        <Button variant="primary" type="submit">Send message</Button>
      </div>
    </Form>
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
      {
        label: 'HTML',
        lang: 'html',
        code: `<!-- arc-form — requires form.css + base.css -->
<form class="arc-form" action="/api/contact" method="POST">
  <div class="arc-field">
    <label for="name">Name</label>
    <input type="text" id="name" name="name" placeholder="Jane Doe" required />
  </div>

  <div class="arc-field">
    <label for="email">Email</label>
    <input type="email" id="email" name="email" placeholder="jane@example.com" required />
  </div>

  <div class="arc-field">
    <label for="subject">Subject</label>
    <select id="subject" name="subject">
      <option value="">Select a topic...</option>
      <option value="general">General Inquiry</option>
      <option value="support">Technical Support</option>
    </select>
  </div>

  <div class="arc-field">
    <label for="message">Message</label>
    <textarea id="message" name="message" rows="4" placeholder="How can we help?"></textarea>
  </div>

  <div class="arc-check">
    <input type="checkbox" id="newsletter" name="newsletter" />
    <label for="newsletter">Subscribe to newsletter</label>
  </div>

  <div class="arc-form-actions">
    <button type="submit">Send Message</button>
    <button type="reset">Reset</button>
  </div>
</form>`,
      },
      {
        label: 'HTML (Inline)',
        lang: 'html',
        code: `<!-- arc-form — self-contained, no external CSS needed -->
<!-- Pseudo-state styles that can't be inlined -->
<style>
  .arc-i-input:hover:not(:focus) { border-color: rgb(51, 51, 64) !important; }
  .arc-i-input:focus { border-color: rgba(77,126,247,0.4) !important; box-shadow: 0 0 0 1px rgba(77,126,247,0.2), 0 0 6px rgba(77,126,247,0.35), 0 0 16px rgba(77,126,247,0.2), 0 0 40px rgba(139,92,246,0.12) !important; }
  .arc-i-input::placeholder { color: rgb(107, 107, 128); }
  .arc-i-cb:checked { background: rgb(77,126,247) !important; border-color: rgb(77,126,247) !important; box-shadow: 0 0 8px rgba(77,126,247,0.3); }
  .arc-i-cb:checked::after { content: ''; position: absolute; top: 2px; left: 5px; width: 5px; height: 9px; border: solid rgb(3,3,7); border-width: 0 2px 2px 0; transform: rotate(45deg); }
  .arc-i-submit:hover { box-shadow: 0 0 8px rgba(77,126,247,0.9), 0 0 20px rgba(77,126,247,0.5), 0 0 44px rgba(77,126,247,0.25); }
  .arc-i-submit:active { transform: scale(0.97); }
  .arc-i-reset:hover { border-color: rgb(77,126,247) !important; color: rgb(77,126,247) !important; }
  .arc-i-reset:active { transform: scale(0.97); }
</style>

<form style="display:flex; flex-direction:column; gap:16px; font-family:'Host Grotesk',system-ui,sans-serif" action="/api/contact" method="POST">
  <div style="display:flex; flex-direction:column; gap:6px">
    <label style="font-family:'Tektur',system-ui,sans-serif; font-weight:600; font-size:12px; letter-spacing:1px; text-transform:uppercase; color:rgb(124,124,137)">Name</label>
    <input class="arc-i-input" type="text" name="name" placeholder="Jane Doe" required style="font-family:'Host Grotesk',system-ui,sans-serif; font-size:14px; font-weight:300; color:rgb(232,232,236); background:rgb(10,10,15); border:1px solid rgb(34,34,41); border-radius:10px; padding:10px 16px; outline:none; width:100%; box-sizing:border-box; transition:border-color 150ms,box-shadow 150ms" />
  </div>

  <div style="display:flex; flex-direction:column; gap:6px">
    <label style="font-family:'Tektur',system-ui,sans-serif; font-weight:600; font-size:12px; letter-spacing:1px; text-transform:uppercase; color:rgb(124,124,137)">Email</label>
    <input class="arc-i-input" type="email" name="email" placeholder="jane@example.com" required style="font-family:'Host Grotesk',system-ui,sans-serif; font-size:14px; font-weight:300; color:rgb(232,232,236); background:rgb(10,10,15); border:1px solid rgb(34,34,41); border-radius:10px; padding:10px 16px; outline:none; width:100%; box-sizing:border-box; transition:border-color 150ms,box-shadow 150ms" />
  </div>

  <div style="display:flex; flex-direction:column; gap:6px">
    <label style="font-family:'Tektur',system-ui,sans-serif; font-weight:600; font-size:12px; letter-spacing:1px; text-transform:uppercase; color:rgb(124,124,137)">Message</label>
    <textarea class="arc-i-input" name="message" rows="4" placeholder="How can we help?" style="font-family:'Host Grotesk',system-ui,sans-serif; font-size:14px; font-weight:300; color:rgb(232,232,236); background:rgb(10,10,15); border:1px solid rgb(34,34,41); border-radius:10px; padding:10px 16px; outline:none; width:100%; box-sizing:border-box; resize:vertical; line-height:1.5; transition:border-color 150ms,box-shadow 150ms"></textarea>
  </div>

  <label style="display:inline-flex; align-items:center; gap:10px; cursor:pointer">
    <input class="arc-i-cb" type="checkbox" name="newsletter" style="appearance:none; width:18px; height:18px; border-radius:4px; border:1px solid rgb(51,51,64); background:rgb(10,10,15); cursor:pointer; position:relative; flex-shrink:0; transition:background 150ms,border-color 150ms,box-shadow 150ms" />
    <span style="font-family:'Host Grotesk',system-ui,sans-serif; font-size:14px; color:rgb(138,138,150); user-select:none">Subscribe to newsletter</span>
  </label>

  <div style="display:flex; align-items:center; gap:16px; padding-top:8px">
    <button class="arc-i-submit" type="submit" style="font-family:'Tektur',system-ui,sans-serif; font-weight:600; font-size:12px; text-transform:uppercase; letter-spacing:2px; background:rgb(77,126,247); color:rgb(3,3,7); border:1px solid rgb(77,126,247); border-radius:10px; padding:10px 24px; cursor:pointer; transition:box-shadow 200ms,transform 100ms">Send Message</button>
    <button class="arc-i-reset" type="reset" style="font-family:'Tektur',system-ui,sans-serif; font-weight:600; font-size:12px; text-transform:uppercase; letter-spacing:2px; background:transparent; color:rgb(124,124,137); border:1px solid rgb(34,34,41); border-radius:10px; padding:10px 24px; cursor:pointer; transition:border-color 150ms,color 150ms,transform 100ms">Reset</button>
  </div>
</form>`,
      },
    ],
  
  seeAlso: ["input","select","checkbox","toggle","textarea","button"],
};
