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
    'Text field that enforces a character mask as you type — dates, card numbers, phone numbers, license keys. The mask’s literals are typed for the user; value holds only the raw characters, and the raw value is what forms receive, so the mask stays presentation.',

  overview: `MaskedInput is a single-line text field that formats fixed-shape values while the user types them. The \`mask\` prop describes the shape with four slot characters — \`#\` for a digit, \`A\` for an uppercase letter (lowercase input is uppercased), \`a\` for any letter, and \`*\` for a letter or digit — and every other character is a literal that the component types for the user. A date mask of \`##/##/####\` means the user types eight digits and the slashes appear on their own, with the caret always landing on the next position that can accept a character.

The decision that makes the component composable: \`value\` holds only the raw characters, never the mask's literals. A completed date field reports \`12042026\`, and that raw string is also what the field submits with a form. The formatted string — \`12/04/2026\` — is presentation, available read-only as \`formattedValue\` and in the \`formatted\` key of every event detail. This means switching a card mask from space-grouped to dash-grouped changes nothing downstream, and your backend never has to strip formatting it did not ask for.

Editing behaves the way users expect from a good mask. Typing inserts at the caret and skips literals forward; Backspace deletes the previous fillable character, skipping literals backward; pasting strips non-conforming characters and fills the remaining positions, so a card number pasted with dashes lands cleanly in a space-grouped mask. A character that does not fit its slot is silently rejected and the caret stays put. Before typing begins, the native placeholder shows the mask shape; once typing starts, the unfilled remainder renders in the field as a muted hint, such as \`12/__/____\`.

MaskedInput follows the v3 commit contract: \`arc-input\` fires on each accepted edit, and \`arc-change\` fires on blur or Enter when the value changed — and immediately when the last mask position fills, the same fixed-length commit that OTP Input established. Constraint validation is built in: a required empty field fails with \`valueMissing\`, and a partially filled mask fails with an "Incomplete value" pattern error, so a half-typed card number cannot pass a form's validation.`,

  features: [
    'Declarative mask pattern: `#` digit, `A` uppercase letter, `a` any letter, `*` alphanumeric, everything else a literal',
    'Raw `value` with no literals — the formatted string is exposed separately as read-only `formattedValue`',
    'Forms receive the raw value, so the presentation format never leaks into submitted data',
    'Literal skipping in both directions: typing jumps forward past literals, Backspace deletes through them',
    'Paste support that strips non-conforming characters and fills the remaining positions',
    'Muted in-field hint for unfilled positions once typing starts, configurable via `placeholder-char`',
    'Fires `arc-input` per accepted edit and `arc-change` on blur, Enter, or the moment the mask completes',
    'Built-in validation: required-empty is `valueMissing`, a partial fill is an "Incomplete value" pattern error',
    'Numeric masks automatically request the numeric keyboard on mobile',
    'Prefix and suffix slots, label, sizes, and disabled/readonly states matching Input',
  ],

  guidelines: {
    do: [
      'Use a mask when the value has one fixed, well-known shape: dates, card numbers, phone numbers in a single locale, license or serial keys',
      'Read `value` (or the form submission) for storage and `formattedValue` only for display — the raw value is the contract',
      'Listen for `arc-change` to validate or submit — it fires the moment the mask completes, so users need not leave the field first',
      'Set `autocomplete` to the matching token (for example `cc-number` on a card field) so browser autofill keeps working',
      'Always provide a `label`; the mask shape in the placeholder is a hint, not a name for the field',
      'Prefer `A` over `a` for license and product keys so the stored value is case-normalized without the user caring',
    ],
    dont: [
      'Do not mask free-form values like names, email addresses, or search queries — a mask that fights variable-length input is worse than no mask; use Input instead',
      'Do not use MaskedInput for short fixed-length verification codes — OTP Input and Pin Input give each character its own box and auto-advance',
      'Do not mask international phone numbers with a single pattern — number lengths vary by country, and a wrong mask locks users out of entering their own number',
      'Do not parse `formattedValue` on the server — submit and store the raw value, and format at the display edge',
      'Do not use the mask as a substitute for validation of meaning — `##/##/####` accepts 99/99/9999; check that a date is real before accepting it',
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
