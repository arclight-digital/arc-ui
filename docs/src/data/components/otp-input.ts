import type { ComponentDef } from './_types';

export const otpInput: ComponentDef = {
    name: 'OTP Input',
    slug: 'otp-input',
    tag: 'arc-otp-input',
    tier: 'input',
    interactivity: 'interactive',
    description: 'A one-time password input that renders a row of individual character boxes with auto-advance, paste support, and configurable length and input type.',

    overview: `OTP Input provides a specialised multi-box code entry field commonly used for verification codes, two-factor authentication, and PIN inputs. It renders a configurable number of individual input boxes (defaulting to 6) in a horizontal row, each accepting a single character. As the user types, focus automatically advances to the next box, and pressing Backspace on an empty box moves focus backward and clears the previous character -- creating a smooth, uninterrupted typing flow.

The component supports two input modes via the \`type\` prop. The default \`number\` mode filters out non-digit characters and sets \`inputmode="numeric"\` for mobile keyboard optimisation. Setting \`type="text"\` allows any character, suitable for alphanumeric verification codes. Each box uses a monospace font at 20px for clear character visibility, with an accent-primary caret and focus ring to highlight the active input position.

Paste handling is built in -- pasting a code into any box distributes the characters across subsequent boxes and advances focus to the end of the pasted content. The component fires \`arc-change\` on every character addition or removal, with the full concatenated value in the event detail. Arrow keys, Home, and End provide horizontal navigation across boxes, and the \`autocomplete="one-time-code"\` attribute enables browser autofill from SMS or authenticator apps.`,

    features: [
      'Row of individual character boxes with configurable `length` (default 6)',
      'Auto-advance: focus moves to the next box on character entry',
      'Backspace moves focus backward and clears the previous box when the current box is empty',
      'Paste support: distributes pasted characters across boxes and advances focus',
      'Two input modes: `number` (digits only with numeric keyboard) and `text` (any character)',
      'Arrow key, Home, and End navigation across individual boxes',
      'Browser autofill support via `autocomplete="one-time-code"` on each input',
      'Fires `arc-change` with the full concatenated value on every character change',
    ],

    guidelines: {
      do: [
        'Set `length` to match the expected code length from your authentication backend',
        'Use `type="number"` for numeric-only codes to get the mobile numeric keyboard',
        'Listen to `arc-change` and auto-submit when the value reaches the expected length',
        'Place OTP Input in a focused, distraction-free context like a verification step',
        'Provide a clear label or heading above the input explaining what code to enter',
      ],
      dont: [
        'Do not use OTP Input for general text entry -- it is designed specifically for short codes',
        'Do not set `length` higher than 8 -- very long code inputs become unwieldy on mobile screens',
        'Do not use `type="text"` when the code is purely numeric -- the wrong keyboard will appear on mobile',
        'Do not place multiple OTP Inputs on the same page -- it creates confusion about which code to enter',
        'Avoid removing the component from the DOM before the user has finished entering the code',
      ],
    },

    previewHtml: `<arc-otp-input length="6" type="number"></arc-otp-input>`,

    props: [
      { name: 'length', type: 'number', default: '6', description: 'Number of individual character boxes to render. Reflected as an attribute.' },
      { name: 'value', type: 'string', default: "''", description: 'The concatenated value of all boxes. Reflected as an attribute and updated on every input.' },
      { name: 'disabled', type: 'boolean', default: 'false', description: 'Disables all input boxes, reducing opacity to 40% and blocking pointer events.' },
      { name: 'type', type: "'number' | 'text'", default: "'number'", description: 'Input mode. `number` filters non-digits and uses the numeric keyboard; `text` allows any character.' },
    ],
    events: [
      { name: 'arc-change', description: 'Fired when any digit changes' },
    ],

    tabs: [
      {
        label: 'Web Component',
        lang: 'html',
        code: `<arc-otp-input length="6" type="number"></arc-otp-input>`,
      },
      {
        label: 'React',
        lang: 'tsx',
        code: `import { OtpInput } from '@arclux/arc-ui-react';

<OtpInput length={6} type="number" />`,
      },
      {
        label: 'Vue',
        lang: 'html',
        code: `<script setup>
import { OtpInput } from '@arclux/arc-ui-vue';
</script>

<template>
  <OtpInput :length="6" type="number" />
</template>`,
      },
      {
        label: 'Svelte',
        lang: 'html',
        code: `<script>
  import { OtpInput } from '@arclux/arc-ui-svelte';
</script>

<OtpInput length={6} type="number" />`,
      },
      {
        label: 'Angular',
        lang: 'ts',
        code: `import { Component } from '@angular/core';
import { OtpInput } from '@arclux/arc-ui-angular';

@Component({
  imports: [OtpInput],
  template: \`
    <OtpInput [length]="6" type="number"></OtpInput>
  \`,
})
export class MyComponent {}`,
      },
      {
        label: 'Solid',
        lang: 'tsx',
        code: `import { OtpInput } from '@arclux/arc-ui-solid';

<OtpInput length={6} type="number" />`,
      },
      {
        label: 'Preact',
        lang: 'tsx',
        code: `import { OtpInput } from '@arclux/arc-ui-preact';

<OtpInput length={6} type="number" />`,
      },
      {
        label: 'HTML',
        lang: 'html',
        code: `<arc-otp-input length="6" type="number"></arc-otp-input>`,
      },
    ],
  
  seeAlso: ["pin-input","input"],
};
