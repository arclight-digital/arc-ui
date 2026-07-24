import type { ComponentDef } from './_types';

export const passwordInput: ComponentDef = {
  name: 'Password Input',
  slug: 'password-input',
  tag: 'arc-password-input',
  tier: 'input',
  interactivity: 'interactive',
  status: 'beta',
  description: 'Password entry field with a built-in visibility toggle and an optional four-segment strength meter. Shares its styling and form behaviour with Input, so mixed forms stay visually uniform.',

  overview: `Password Input is the sibling of Input specialised for secret entry. It wraps a native \`<input type="password">\` with the same label, placeholder, validation, and size treatment as Input, and adds two password-specific affordances: an inline eye button that toggles the field between masked and plain text, and an optional strength meter driven by a self-contained heuristic.

The visibility toggle persists the user's choice -- revealing the password does not silently revert on blur, which matches platform conventions and avoids surprising users mid-edit. The toggle is a real button with \`aria-pressed\` state and an accessible name, so screen-reader users get the same control.

When \`show-strength\` is set, a four-segment meter and text label ("Weak" through "Strong") render under the field. The score considers length thresholds, character-class variety, and penalises repeated characters, sequential runs like "abcd" or "1234", and the most common leaked passwords. The heuristic runs entirely client-side with no network calls. The meter exposes \`role="meter"\` semantics and announces changes politely for assistive technology.

Password Input participates in native forms through ElementInternals just like Input: it submits its value under \`name\`, supports \`required\` constraint validation, and resets with \`form.reset()\`. Use \`autocomplete="new-password"\` on registration and change-password forms so password managers offer to generate a credential.`,

  features: [
    'Visibility toggle button with `aria-pressed` state and eye / eye-off iconography',
    'User choice persists -- the field does not re-mask on blur',
    'Optional four-segment strength meter with Weak / Fair / Good / Strong label',
    'Self-contained strength heuristic: length, character variety, common-password and pattern penalties',
    '`arc-strength-change` event exposes the 0-4 score for custom policy UI',
    'Native form participation via ElementInternals: submission, reset, and required validation',
    '`autocomplete` pass-through (defaults to `current-password`) for password-manager integration',
    'Identical field styling to Input -- labels, sizes, error state, and focus rings match',
    'Meter uses `role="meter"` with aria value semantics and polite live announcements',
  ],

  guidelines: {
    do: [
      'Always provide a `label` so the field is accessible to screen readers',
      'Set `autocomplete="new-password"` on sign-up and change-password forms so password managers can generate credentials',
      'Enable `show-strength` on password-creation flows to give users live feedback',
      'Listen to `arc-strength-change` if you gate submission on a minimum score',
      'Pair with Form for coordinated validation and an error summary',
      'Keep the `error` prop for server-side or policy failures (e.g. "Password was found in a breach")',
    ],
    dont: [
      'Do not show the strength meter on login forms -- it only makes sense when creating a password',
      'Do not treat the heuristic score as a security guarantee; enforce real policy on the server',
      'Do not force the field back to masked while the user is typing -- the toggle state is theirs',
      'Do not use placeholder text as the only label',
      'Do not block paste into the field -- pasting from a password manager is a best practice',
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
      label: 'HTML',
      lang: 'html',
      code: `<div style="display:flex; flex-direction:column; width:100%; max-width:400px; gap:16px;">
  <arc-password-input label="Password" name="password" required></arc-password-input>
  <arc-password-input label="New password" name="new-password" autocomplete="new-password" show-strength required></arc-password-input>
</div>`,
    },
  ],

  seeAlso: ['input', 'otp-input', 'pin-input', 'form', '/docs/frameworks'],
};
