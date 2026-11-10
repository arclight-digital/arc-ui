import type { ComponentDef } from './_types';

export const textarea: ComponentDef = {
  name: 'Textarea',
  slug: 'textarea',
  tag: 'arc-textarea',
  tier: 'input',
  interactivity: 'hybrid',
  searchKeywords: ['multiline'],
  description:
    'A multi-line text field with a label, an optional character counter and an error message.',

  overview: `Textarea wraps a native \`<textarea>\` with an uppercase label, a placeholder, an optional character counter and an error message. Use it for anything longer than one line, such as a support request, a comment or a bio.

\`rows\` sets the starting height (4 by default). \`resize\` sets which way the reader can drag the field: \`vertical\` (the default), \`horizontal\`, \`both\` or \`none\`.

Set \`maxlength\` and a live counter appears below the field. It turns red when the text reaches the limit, and screen readers hear the count through a polite live region. Pair Textarea with Form for validation, submission and an error summary across the whole form.`,

  features: [
    'The label is linked to the field with `aria-labelledby`',
    '`error` turns the border red and shows the message below the field with `role="alert"`',
    '`readonly` allows selecting and copying but not editing, and `disabled` blocks all interaction',
    'Fires `arc-input` on every keystroke and `arc-change` on blur',
  ],

  guidelines: {
    do: [
      'Set a `label`. It\'s the field\'s accessible name',
      'Use `placeholder` for an example value, never in place of the label. It disappears once the reader types',
      'Set `maxlength` when the backend or the design has a limit, so the reader sees it as they type',
      'Choose `rows` to match the length you expect',
      'Use `resize="none"` when the field sits in a fixed-height layout',
      'Use the `error` prop to show server-side validation messages after submission',
    ],
    dont: [
      'Don\'t use Textarea for single-line values such as a name or an email. Use Input',
      'Don\'t set `disabled` and `error` together. The reader can\'t act on the error',
      'Don\'t restyle the border and focus ring with custom CSS. Change the design tokens',
    ],
  },

  previewHtml: `<div style="width:100%;">
  <arc-textarea
    label="Describe your issue"
    placeholder="The export button does nothing after I pick a date range."
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

export default function Example() {
  return (
    <div style={{ width: '100%' }}>
      <Textarea
        label="Describe your issue"
        placeholder="Please provide as much detail as possible..."
        rows={5}
        maxlength={500}
      />
    </div>
  );
}`,
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
      <arc-textarea
        label="Describe your issue"
        placeholder="Please provide as much detail as possible..."
        [rows]="5"
        [maxlength]="500"
      ></arc-textarea>
    </div>
  \`,
})
export class SupportFormComponent {}`,
    },
    {
      label: 'Solid',
      lang: 'tsx',
      code: `import { Textarea } from '@arclux/arc-ui-solid';

export default function Example() {
  return (
    <div style={{ width: '100%' }}>
      <Textarea
        label="Describe your issue"
        placeholder="Please provide as much detail as possible..."
        rows={5}
        maxlength={500}
      />
    </div>
  );
}`,
    },
    {
      label: 'Preact',
      lang: 'tsx',
      code: `import { Textarea } from '@arclux/arc-ui-preact';

export default function Example() {
  return (
    <div style={{ width: '100%' }}>
      <Textarea
        label="Describe your issue"
        placeholder="Please provide as much detail as possible..."
        rows={5}
        maxlength={500}
      />
    </div>
  );
}`,
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

  seeAlso: ['input', 'form'],
};
