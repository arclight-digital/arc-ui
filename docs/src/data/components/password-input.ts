import type { ComponentDef } from './_types';

export const passwordInput: ComponentDef = {
  name: 'Password Input',
  slug: 'password-input',
  tag: 'arc-password-input',
  tier: 'input',
  interactivity: 'interactive',
  description:
    'A password field with a show/hide button and an optional strength meter, styled and form-wired like Input.',

  overview: `PasswordInput wraps a native \`<input type="password">\` with the same label, placeholder, validation and sizes as Input. An eye button switches the field between masked and plain text, and \`show-strength\` adds a strength meter.

A revealed password stays revealed until the button is pressed again. Blur doesn't re-mask it. The button is a real \`<button>\` with \`aria-pressed\` and an accessible name.

The meter is a four-segment bar under the field with a label from "Weak" to "Strong". The score rewards length and a mix of character classes, and penalizes repeated characters, runs like "abcd" or "1234", and a built-in list of 20 common passwords. It runs in the browser with no network calls. The meter has \`role="meter"\` and announces changes politely.

PasswordInput joins native forms through ElementInternals, like Input: it submits its value under \`name\`, supports \`required\`, and resets with \`form.reset()\`. Use \`autocomplete="new-password"\` on sign-up and change-password forms so password managers offer to generate one.`,

  features: [
    '`arc-strength-change` fires with the 0-4 score, for your own policy UI',
    '`autocomplete` passes through to the native field and defaults to `current-password`',
    'Labels, sizes, error state and focus rings match Input',
  ],

  guidelines: {
    do: [
      "Give it a `label`. Placeholder text alone isn't one",
      'Turn on `show-strength` where people create a password, and leave it off on login forms',
      'Listen to `arc-strength-change` if you block submission below a minimum score',
      'Pair it with Form for coordinated validation and an error summary',
      'Use the `error` prop for server or policy failures, for example "Password was found in a breach"',
    ],
    dont: [
      "Don't treat the score as a security check. Enforce your real policy on the server",
      "Don't re-mask the field while someone is typing. The toggle state is theirs",
      "Don't block paste. People paste from password managers",
    ],
  },

  previewHtml: `<div style="display:flex; flex-direction:column; width:100%; max-width:400px; gap:16px;">
  <arc-password-input label="Password" name="password" placeholder="Enter your password" required></arc-password-input>
  <arc-password-input label="New password" name="new-password" autocomplete="new-password" show-strength placeholder="Create a strong password"></arc-password-input>
</div>`,

  tabs: [
    {
      label: 'Web Component',
      lang: 'html',
      code: `<!-- Login: masked field with visibility toggle -->
<arc-password-input label="Password" name="password" required></arc-password-input>

<!-- Sign-up: strength meter + password-manager generation -->
<arc-password-input
  label="New password"
  name="new-password"
  autocomplete="new-password"
  show-strength
  required
></arc-password-input>

<script>
  document.querySelector('[show-strength]').addEventListener('arc-strength-change', (e) => {
    console.log('strength score:', e.detail.score); // 0-4
  });
</script>`,
    },
    {
      label: 'React',
      lang: 'tsx',
      code: `import { PasswordInput } from '@arclux/arc-ui-react';

{/* Login */}
<PasswordInput label="Password" name="password" required />

{/* Sign-up with strength meter */}
<PasswordInput
  label="New password"
  name="new-password"
  autocomplete="new-password"
  showStrength
  required
  onArcStrengthChange={(e) => setScore(e.detail.score)}
/>`,
    },
    {
      label: 'Vue',
      lang: 'html',
      code: `<script setup>
import { PasswordInput } from '@arclux/arc-ui-vue';
</script>

<template>
  <!-- Login -->
  <PasswordInput label="Password" name="password" required />

  <!-- Sign-up with strength meter -->
  <PasswordInput
    label="New password"
    name="new-password"
    autocomplete="new-password"
    show-strength
    required
    @arc-strength-change="(e) => console.log('strength score:', e.detail.score)"
  />
</template>`,
    },
    {
      label: 'Svelte',
      lang: 'html',
      code: `<script>
  import { PasswordInput } from '@arclux/arc-ui-svelte';
</script>

<!-- Login -->
<PasswordInput label="Password" name="password" required />

<!-- Sign-up with strength meter -->
<PasswordInput
  label="New password"
  name="new-password"
  autocomplete="new-password"
  showStrength
  required
  on:arc-strength-change={(e) => console.log('strength score:', e.detail.score)}
/>`,
    },
    {
      label: 'Angular',
      lang: 'ts',
      code: `import { Component } from '@angular/core';
import { PasswordInput } from '@arclux/arc-ui-angular';

@Component({
  imports: [PasswordInput],
  template: \`
    <!-- Login -->
    <arc-password-input label="Password" name="password" required></arc-password-input>

    <!-- Sign-up with strength meter -->
    <arc-password-input
      label="New password"
      name="new-password"
      autocomplete="new-password"
      showStrength
      required
      (arcStrengthChange)="onStrength($event)"
    ></arc-password-input>
  \`,
})
export class PasswordFormComponent {
  onStrength(e: CustomEvent) {
    console.log('strength score:', e.detail.score);
  }
}`,
    },
    {
      label: 'HTML',
      lang: 'html',
      code: `<div style="display:flex; flex-direction:column; width:100%; max-width:400px; gap:16px;">
  <arc-password-input label="Password" name="password" required></arc-password-input>
  <arc-password-input label="New password" name="new-password" autocomplete="new-password" show-strength required></arc-password-input>
</div>`,
    },
  ],

  seeAlso: ['input', 'pin-input', 'form', '/docs/frameworks'],
};
