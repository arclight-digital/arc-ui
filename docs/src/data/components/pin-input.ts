import type { ComponentDef } from './_types';

export const pinInput: ComponentDef = {
  name: 'Pin Input',
  slug: 'pin-input',
  tag: 'arc-pin-input',
  tier: 'input',
  interactivity: 'interactive',
  description: 'A row of one-character boxes for entering a PIN or a one-time code.',

  overview: `PinInput renders a row of single-character boxes. Typing a character moves focus to the next box. Backspace in an empty box moves back and clears the previous one, the left and right arrow keys move between boxes without changing them, and pasting fills the boxes from the focused one onward, skipping characters that \`type\` doesn't allow.

\`type\` sets what each box accepts: \`"number"\` takes digits 0-9, \`"alphanumeric"\` takes letters and digits, and \`"text"\` takes any character. \`type="number"\` also sets \`inputmode="numeric"\`, so phones show a number pad. \`mask\` hides entered characters as dots with \`-webkit-text-security: disc\`. \`separator\` draws a dash every N boxes, so \`separator="3"\` on a 6-digit code shows three boxes, a dash and three more.

\`arc-input\` fires on every entry or deletion with the partial value. When every box is filled, \`arc-change\` fires and then \`arc-complete\`, both with the full value. Listen to either to submit or validate.`,

  features: ['Each box is 42px wide at the default size, 34px at `sm` and 50px at `lg`'],

  guidelines: {
    do: [
      'Set `length` to the code length, for example 4 for a PIN or 6 for a one-time code',
      'Use `type="number"` for codes that are digits only',
      'Turn on `mask` for security PINs',
      'Give it a `label` that names the code, unless the surrounding text already does',
    ],
    dont: [
      "Don't use it for free text. It's for fixed-length codes",
      "Don't set `length` above about 8. Use a normal text input for longer codes",
      'Don\'t pick a `separator` that leaves a short last group, like `separator="4"` on a 6-digit code',
      "Don't put it in a container too narrow for its boxes and the gaps between them",
    ],
  },

  previewHtml: `<arc-pin-input label="Verification code" length="6" separator="3"></arc-pin-input>`,

  tabs: [
    {
      label: 'Web Component',
      lang: 'html',
      code: `<arc-pin-input label="OTP Code" length="6" separator="3"></arc-pin-input>

<script>
  document.querySelector('arc-pin-input')
    .addEventListener('arc-complete', e => {
      console.log('Code entered:', e.detail.value);
    });
</script>`,
    },
    {
      label: 'React',
      lang: 'tsx',
      code: `import { PinInput } from '@arclux/arc-ui-react';

export default function Example() {
  return (
    <PinInput
      label="OTP Code"
      length={6}
      separator={3}
      onArcComplete={(e) => console.log('Code:', e.detail.value)}
    />
  );
}`,
    },
    {
      label: 'Vue',
      lang: 'html',
      code: `<script setup>
import { PinInput } from '@arclux/arc-ui-vue';
</script>

<template>
  <PinInput
    label="OTP Code"
    :length="6"
    :separator="3"
    @arc-complete="(e) => console.log('Code:', e.detail.value)"
  />
</template>`,
    },
    {
      label: 'Svelte',
      lang: 'html',
      code: `<script>
  import { PinInput } from '@arclux/arc-ui-svelte';
</script>

<PinInput
  label="OTP Code"
  length={6}
  separator={3}
  on:arc-complete={(e) => console.log('Code:', e.detail.value)}
/>`,
    },
    {
      label: 'Angular',
      lang: 'ts',
      code: `import { Component } from '@angular/core';
import { PinInput } from '@arclux/arc-ui-angular';

@Component({
  imports: [PinInput],
  template: \`
    <arc-pin-input
      label="OTP Code"
      [length]="6"
      [separator]="3"
      (arc-complete)="onComplete($event)"
    ></arc-pin-input>
  \`,
})
export class MyComponent {
  onComplete(e: CustomEvent) {
    console.log('Code:', e.detail.value);
  }
}`,
    },
    {
      label: 'Solid',
      lang: 'tsx',
      code: `import { PinInput } from '@arclux/arc-ui-solid';

export default function Example() {
  return (
    <PinInput
      label="OTP Code"
      length={6}
      separator={3}
      onArcComplete={(e) => console.log('Code:', e.detail.value)}
    />
  );
}`,
    },
    {
      label: 'Preact',
      lang: 'tsx',
      code: `import { PinInput } from '@arclux/arc-ui-preact';

export default function Example() {
  return (
    <PinInput
      label="OTP Code"
      length={6}
      separator={3}
      onArcComplete={(e) => console.log('Code:', e.detail.value)}
    />
  );
}`,
    },
  ],

  seeAlso: ['input'],
};
