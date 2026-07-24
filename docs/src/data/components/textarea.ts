import type { ComponentDef } from './_types';

export const textarea: ComponentDef = {
    name: 'Textarea',
    slug: 'textarea',
    tag: 'arc-textarea',
    tier: 'input',
    interactivity: 'hybrid',
    searchKeywords: ['multiline'],
    description: 'Multi-line text input with integrated label, placeholder, resize control, and live character count that turns red at the limit.',

    overview: `Textarea is the dedicated multi-line text-entry component in ARC UI. It wraps a native \`<textarea>\` element with consistent styling, an integrated uppercase label, placeholder support, optional character counting, and validation feedback -- all exposed through a declarative attribute API that works identically across every framework.

Use Textarea whenever you need to collect more than a single line of freeform text: support ticket descriptions, comments, feedback forms, bio fields, or any content where the user benefits from seeing multiple lines at once. The \`rows\` prop controls the initial visible height, while the \`resize\` prop determines whether the user can drag the handle to expand the field vertically, horizontally, both, or not at all.

When a \`maxlength\` is set, a live character counter appears below the field and automatically switches to an error colour as the user approaches the limit. This gives immediate, accessible feedback without requiring any JavaScript on the consumer side. Pair Textarea with the Form component for coordinated validation, submission handling, and error summary across an entire form.`,

    features: [
      'Integrated uppercase label rendered above the field with automatic aria-labelledby association',
      'Live character counter that appears when `maxlength` is set and turns red at the limit',
      'Configurable resize behaviour via the `resize` prop: vertical, horizontal, both, or none',
      'Adjustable initial height through the `rows` prop (defaults to 4)',
      'Error state with a red border and an inline error message displayed below the field',
      'Readonly mode that allows selection and copying but prevents edits',
      'Disabled state that greys out the field and blocks all interaction',
      'Keyboard-accessible with a visible focus ring following design tokens',
      'Fires `arc-input` on every keystroke and `arc-change` on blur for flexible data binding',
      'CSS custom properties for theming via shared design tokens',
    ],

    guidelines: {
      do: [
        'Always provide a `label` so the field is accessible to screen readers',
        'Set `placeholder` to show an example value, not as a replacement for the label',
        'Use `maxlength` when there is a backend or UX limit so users get immediate feedback',
        'Choose an appropriate `rows` value that reflects the expected content length',
        'Use `resize="none"` when the textarea sits inside a fixed-height layout that cannot reflow',
        'Pair with the Form component for coordinated validation and submission',
        'Use the `error` prop to surface server-side validation messages after submission',
      ],
      dont: [
        'Do not use Textarea for single-line fields like names or emails -- use Input instead',
        'Do not use placeholder text as the only label -- it disappears on focus and fails accessibility',
        'Do not set both `disabled` and `error` at the same time -- the user cannot act on the error',
        'Do not set extremely low `maxlength` values (under ~20) -- use Input for short values instead',
        'Avoid overriding the built-in border and focus styles with custom CSS -- use design tokens instead',
        'Do not hide the character counter when a maxlength is enforced -- users need that feedback',
      ],
    },

    previewHtml: `<div style="width:100%;">
  <arc-textarea
    label="Describe your issue"
    placeholder="Please provide as much detail as possible so our support team can help you quickly..."
    rows="5"
    maxlength="500"
  ></arc-textarea>
</div>`,


    tabs: [
      {
        label: 'Web Component',
        lang: 'html',
        code: `<div style="width:100%;">
  <arc-textarea
    label="Describe your issue"
    placeholder="Please provide as much detail as possible..."
    rows="5"
    maxlength="500"
  ></arc-textarea>
</div>`,
      },
      {
        label: 'React',
        lang: 'tsx',
        code: `import { Textarea } from '@arclux/arc-ui-react';

<div style={{ width: '100%' }}>
  <Textarea
    label="Describe your issue"
    placeholder="Please provide as much detail as possible..."
    rows={5}
    maxlength={500}
  />
</div>`,
      },
      {
        label: 'Vue',
        lang: 'html',
        code: `<script setup>
import { Textarea } from '@arclux/arc-ui-vue';
</script>

<template>
  <div style="width:100%;">
    <Textarea
      label="Describe your issue"
      placeholder="Please provide as much detail as possible..."
      :rows="5"
      :maxlength="500"
    />
  </div>
</template>`,
      },
      {
        label: 'Svelte',
        lang: 'html',
        code: `<script>
  import { Textarea } from '@arclux/arc-ui-svelte';
</script>

<div style="width:100%;">
  <Textarea
    label="Describe your issue"
    placeholder="Please provide as much detail as possible..."
    rows={5}
    maxlength={500}
  />
</div>`,
      },
      {
        label: 'Angular',
        lang: 'ts',
        code: `import { Component } from '@angular/core';
import { Textarea } from '@arclux/arc-ui-angular';

@Component({
  imports: [Textarea],
  template: \`
    <div style="width:100%;">
      <Textarea
        label="Describe your issue"
        placeholder="Please provide as much detail as possible..."
        [rows]="5"
        [maxlength]="500"
      ></Textarea>
    </div>
  \`,
})
export class SupportFormComponent {}`,
      },
      {
        label: 'Solid',
        lang: 'tsx',
        code: `import { Textarea } from '@arclux/arc-ui-solid';

<div style={{ width: '100%' }}>
  <Textarea
    label="Describe your issue"
    placeholder="Please provide as much detail as possible..."
    rows={5}
    maxlength={500}
  />
</div>`,
      },
      {
        label: 'Preact',
        lang: 'tsx',
        code: `import { Textarea } from '@arclux/arc-ui-preact';

<div style={{ width: '100%' }}>
  <Textarea
    label="Describe your issue"
    placeholder="Please provide as much detail as possible..."
    rows={5}
    maxlength={500}
  />
</div>`,
      },
      {
        label: 'HTML',
        lang: 'html',
        code: `<div style="width:100%;">
  <arc-textarea
    label="Describe your issue"
    placeholder="Please provide as much detail as possible..."
    rows="5"
    maxlength="500"
  ></arc-textarea>
</div>`,
      },
    
    {
      label: 'HTML (Inline)',
      lang: 'html',
      code: `<!-- Auto-generated by @arclux/prism — do not edit manually -->
<!-- arc-textarea — self-contained, no external CSS needed -->
<div class="arc-textarea">

</div>`,
    },
  ],
  
  seeAlso: ["input","form"],
};
