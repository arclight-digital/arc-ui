import type { ComponentDef } from './_types';

export const maskedInput: ComponentDef = {
  name: 'Masked Input',
  slug: 'masked-input',
  tag: 'arc-masked-input',
  tier: 'input',
  interactivity: 'interactive',
  searchKeywords: [
    'mask',
    'format',
    'pattern',
    'date input',
    'card number',
    'phone number',
    'license key',
  ],
  description:
    'Text field that types a mask\'s literals for you, for dates, card numbers, phone numbers and license keys. `value` holds only the raw characters.',

  overview: `Masked Input is a single-line text field for values with a fixed shape. The \`mask\` prop describes the shape with four slot characters: \`#\` for a digit, \`A\` for a letter (lowercase input is uppercased), \`a\` for any letter, and \`*\` for a letter or digit. Every other character is a literal the field types for you. With a mask of \`##/##/####\`, the user types eight digits, the slashes appear on their own, and the caret always lands on the next position that takes a character.

\`value\` holds only the raw characters. A completed date field reports \`12042026\`, and that's also what it submits with a form. The formatted \`12/04/2026\` is in the read-only \`formattedValue\` and in the \`formatted\` key of every event detail. Switching a card mask from spaces to dashes changes nothing downstream, and your backend never strips formatting.

Typing inserts at the caret and skips past literals. Backspace deletes the previous typed character, skipping literals backward. Pasting drops characters that don't fit and fills the remaining positions, so a card number pasted with dashes lands in a space-grouped mask. A character that doesn't fit its slot is rejected and the caret stays put. Before typing starts, the native placeholder shows the mask shape. After that, the unfilled rest shows in the field as a muted hint, such as \`12/__/____\`.

\`arc-input\` fires on each accepted edit. \`arc-change\` fires on blur or Enter when the value changed, and as soon as the last position fills, the same way Pin Input commits. A required empty field fails validation with \`valueMissing\`, and a partly filled one fails with an "Incomplete value" pattern error, so a half-typed card number can't pass a form's validation.`,

  features: [
    '`placeholder-char` sets the hint character, `_` by default',
    'A mask made only of `#` slots sets `inputmode="numeric"`, so phones show the number keyboard',
    'Prefix and suffix slots, label, sizes, and disabled and readonly states work as they do on Input',
  ],

  guidelines: {
    do: [
      'Use a mask when the value has one fixed shape: dates, card numbers, phone numbers in a single locale, license or serial keys',
      'Store `value` and use `formattedValue` only for display',
      'Listen for `arc-change` to validate or submit. It fires when the mask completes, so the user doesn\'t have to leave the field',
      'Set `autocomplete` to the matching token, such as `cc-number` on a card field, so browser autofill keeps working',
      'Always set a `label`. The mask shape in the placeholder is a hint, not a name for the field',
      'Use `A` over `a` for license and product keys, so the stored value is always uppercase',
    ],
    dont: [
      'Don\'t mask free-form values like names, email addresses or search queries. Use Input',
      'Don\'t use it for short verification codes. Pin Input gives each character its own box and advances on its own',
      'Don\'t mask international phone numbers with one pattern. Lengths vary by country, and a wrong mask stops people entering their own number',
      'Don\'t treat the mask as validation. `##/##/####` accepts 99/99/9999, so check that a date is real before accepting it',
    ],
  },

  previewHtml: `<div style="display:flex; flex-direction:column; width:100%; max-width:400px; gap:16px;">
  <arc-masked-input label="Expiry date" name="expiry" mask="##/##/####" autocomplete="cc-exp"></arc-masked-input>
  <arc-masked-input label="Card number" name="card" mask="#### #### #### ####" autocomplete="cc-number"></arc-masked-input>
  <arc-masked-input label="License key" name="license" mask="AAA-###-AAA" placeholder-char="•"></arc-masked-input>
</div>`,

  tabs: [
    {
      label: 'Web Component',
      lang: 'html',
      code: `<!-- Date, card, and license-key masks -->
<div style="display:flex; flex-direction:column; width:100%; max-width:400px; gap:16px;">
  <arc-masked-input label="Expiry date" name="expiry" mask="##/##/####" autocomplete="cc-exp"></arc-masked-input>
  <arc-masked-input label="Card number" name="card" mask="#### #### #### ####" autocomplete="cc-number"></arc-masked-input>
  <arc-masked-input label="License key" name="license" mask="AAA-###-AAA" placeholder-char="•"></arc-masked-input>
</div>

<script>
  const card = document.querySelector('[name="card"]');
  card.addEventListener('arc-change', (e) => {
    // e.detail.value is the raw digits; e.detail.formatted is presentation.
    console.log(e.detail.value, e.detail.formatted);
  });
</script>`,
    },
    {
      label: 'React',
      lang: 'tsx',
      code: `import { MaskedInput } from '@arclux/arc-ui-react';

export default function Example() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', maxWidth: 400, gap: 16 }}>
      <MaskedInput label="Expiry date" name="expiry" mask="##/##/####" autocomplete="cc-exp" />
      <MaskedInput
        label="Card number"
        name="card"
        mask="#### #### #### ####"
        autocomplete="cc-number"
        onArcChange={(e) => console.log(e.detail.value)}
      />
      <MaskedInput label="License key" name="license" mask="AAA-###-AAA" placeholder-char="•" />
    </div>
  );
}`,
    },
    {
      label: 'Vue',
      lang: 'html',
      code: `<script setup>
import { MaskedInput } from '@arclux/arc-ui-vue';
</script>

<template>
  <div style="display:flex; flex-direction:column; width:100%; max-width:400px; gap:16px;">
    <MaskedInput label="Expiry date" name="expiry" mask="##/##/####" autocomplete="cc-exp" />
    <MaskedInput label="Card number" name="card" mask="#### #### #### ####" autocomplete="cc-number" />
    <MaskedInput label="License key" name="license" mask="AAA-###-AAA" placeholder-char="•" />
  </div>
</template>`,
    },
    {
      label: 'Svelte',
      lang: 'html',
      code: `<script>
  import { MaskedInput } from '@arclux/arc-ui-svelte';
</script>

<div style="display:flex; flex-direction:column; width:100%; max-width:400px; gap:16px;">
  <MaskedInput label="Expiry date" name="expiry" mask="##/##/####" autocomplete="cc-exp" />
  <MaskedInput label="Card number" name="card" mask="#### #### #### ####" autocomplete="cc-number" />
  <MaskedInput label="License key" name="license" mask="AAA-###-AAA" placeholder-char="•" />
</div>`,
    },
    {
      label: 'Angular',
      lang: 'ts',
      code: `import { Component } from '@angular/core';
import { MaskedInput } from '@arclux/arc-ui-angular';

@Component({
  imports: [MaskedInput],
  template: \`
    <div style="display:flex; flex-direction:column; width:100%; max-width:400px; gap:16px;">
      <arc-masked-input label="Expiry date" name="expiry" mask="##/##/####" autocomplete="cc-exp"></arc-masked-input>
      <arc-masked-input label="Card number" name="card" mask="#### #### #### ####" autocomplete="cc-number"></arc-masked-input>
      <arc-masked-input label="License key" name="license" mask="AAA-###-AAA" placeholder-char="•"></arc-masked-input>
    </div>
  \`,
})
export class PaymentFormComponent {}`,
    },
    {
      label: 'Solid',
      lang: 'tsx',
      code: `import { MaskedInput } from '@arclux/arc-ui-solid';

export default function Example() {
  return (
    <div style={{ display: 'flex', 'flex-direction': 'column', width: '100%', 'max-width': '400px', gap: '16px' }}>
      <MaskedInput label="Expiry date" name="expiry" mask="##/##/####" autocomplete="cc-exp" />
      <MaskedInput label="Card number" name="card" mask="#### #### #### ####" autocomplete="cc-number" />
      <MaskedInput label="License key" name="license" mask="AAA-###-AAA" placeholder-char="•" />
    </div>
  );
}`,
    },
    {
      label: 'Preact',
      lang: 'tsx',
      code: `import { MaskedInput } from '@arclux/arc-ui-preact';

export default function Example() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', maxWidth: 400, gap: 16 }}>
      <MaskedInput label="Expiry date" name="expiry" mask="##/##/####" autocomplete="cc-exp" />
      <MaskedInput label="Card number" name="card" mask="#### #### #### ####" autocomplete="cc-number" />
      <MaskedInput label="License key" name="license" mask="AAA-###-AAA" placeholder-char="•" />
    </div>
  );
}`,
    },
  ],

  seeAlso: ['input', 'pin-input', 'number-input', 'form'],
};
