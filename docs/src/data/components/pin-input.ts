import type { ComponentDef } from './_types';

export const pinInput: ComponentDef = {
    name: 'Pin Input',
    slug: 'pin-input',
    tag: 'arc-pin-input',
    tier: 'input',
    interactivity: 'interactive',
    description: 'One-character-per-box input for PINs, OTPs, and verification codes with auto-advance, paste support, and optional masking.',

    overview: `Pin Input renders a row of individual input boxes -- one per character -- designed for entering PINs, one-time passwords, and verification codes. Each box accepts a single character and automatically advances focus to the next box on entry, creating a fast and fluid typing experience. The component supports backspace navigation (moving back to the previous box when the current one is empty), arrow key movement between boxes, and full clipboard paste that fills multiple boxes at once.

The \`type\` prop controls character validation: \`"number"\` restricts input to digits 0-9, \`"alphanumeric"\` allows letters and digits, and \`"text"\` accepts any single character. When \`mask\` is enabled, entered characters are obscured with dots (using CSS \`-webkit-text-security: disc\`) for sensitive codes. An optional \`separator\` prop inserts a visual dash between groups of boxes -- for example, setting \`separator="3"\` on a 6-digit code renders it as three boxes, a dash, and three more boxes.

Pin Input fires \`arc-change\` on every character entry or deletion, providing the current partial value. When all boxes are filled, it additionally fires \`arc-complete\` with the full value, making it easy to trigger form submission or validation at the right moment without polling or length-checking.`,

    features: [
      'Auto-advance focus to the next box after each valid character entry',
      'Backspace navigates to and clears the previous box when the current box is empty',
      'Arrow key navigation between boxes without modifying content',
      'Clipboard paste support that fills multiple boxes from the cursor position',
      'Configurable `type` validation: `"number"`, `"alphanumeric"`, or `"text"`',
      'Mask mode via `mask` prop for obscuring sensitive codes with dots',
      'Visual separator dashes between groups via the `separator` prop (e.g. every 3 boxes)',
      'Dual events: `arc-change` on every keystroke, `arc-complete` when all boxes are filled',
    ],

    guidelines: {
      do: [
        'Set `length` to match the expected code length -- 4 for PINs, 6 for OTPs, etc.',
        'Use `type="number"` for numeric-only codes and set `inputmode="numeric"` for mobile keyboards',
        'Enable `mask` for sensitive codes like passwords or security PINs',
        'Listen for `arc-complete` to auto-submit or validate once the full code is entered',
        'Provide a `label` so users understand what code they are entering',
      ],
      dont: [
        'Do not use Pin Input for general text entry -- it is designed exclusively for fixed-length codes',
        'Do not set `length` higher than ~8 -- long codes are better handled with a standard text input',
        'Do not omit the `label` prop when the pin input is used standalone without surrounding context',
        'Do not use `separator` values that produce uneven groups at the end (e.g. `separator="4"` on a 6-digit code)',
        'Avoid placing Pin Input in very narrow containers -- each box needs at least 42px width plus gaps',
      ],
    },

    previewHtml: `<arc-pin-input label="Verification Code" length="6" separator="3"></arc-pin-input>`,

    props: [
      { name: 'length', type: 'number', default: '4', description: 'Number of input boxes to render. Determines the expected code length.' },
      { name: 'value', type: 'string', default: "''", description: 'Current combined value across all boxes. Reflected as an attribute.' },
      { name: 'type', type: "'number' | 'alphanumeric' | 'text'", default: "'number'", description: 'Character validation mode. `number` allows digits only, `alphanumeric` allows letters and digits, `text` allows any character.' },
      { name: 'mask', type: 'boolean', default: 'false', description: 'When true, obscures entered characters with dots for sensitive codes.' },
      { name: 'separator', type: 'number', default: '0', description: 'Inserts a visual dash separator every N boxes. Set to 0 to disable separators.' },
      { name: 'label', type: 'string', default: "''", description: 'Label text displayed above the input boxes in uppercase accent font.' },
      { name: 'disabled', type: 'boolean', default: 'false', description: 'Disables all boxes, reducing opacity to 40% and blocking input.' },
    ],
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

<PinInput
  label="OTP Code"
  length={6}
  separator={3}
  onArcComplete={(e) => console.log('Code:', e.detail.value)}
/>`,
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
    <PinInput
      label="OTP Code"
      [length]="6"
      [separator]="3"
      (arc-complete)="onComplete($event)"
    ></PinInput>
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

<PinInput
  label="OTP Code"
  length={6}
  separator={3}
  onArcComplete={(e) => console.log('Code:', e.detail.value)}
/>`,
      },
      {
        label: 'Preact',
        lang: 'tsx',
        code: `import { PinInput } from '@arclux/arc-ui-preact';

<PinInput
  label="OTP Code"
  length={6}
  separator={3}
  onArcComplete={(e) => console.log('Code:', e.detail.value)}
/>`,
      },
    ],
  };
