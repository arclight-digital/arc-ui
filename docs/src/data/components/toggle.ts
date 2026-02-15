import type { ComponentDef } from './_types';

export const toggle: ComponentDef = {
    name: 'Toggle',
    slug: 'toggle',
    tag: 'arc-toggle',
    tier: 'input',
    interactivity: 'hybrid',
    description: 'On/off switch with smooth animation, glow effect, and ARIA switch role.',

    overview: `The Toggle component provides a binary on/off control that mirrors the behavior of a physical switch. It is the preferred choice whenever you need a setting that takes immediate effect — toggling a feature on or off, enabling a preference, or activating a mode. Unlike a checkbox, which typically submits with a form, a toggle communicates instant state change to the user.

Internally, Toggle renders with \`role="switch"\` and manages \`aria-checked\` automatically, giving assistive technology a clear picture of the current state. The thumb slides between positions with a spring-timed CSS transition, and the active state lights up with a subtle glow drawn from the current theme's accent color. Both the track and the thumb inherit design tokens so the component stays consistent across light, dark, and high-contrast modes.

Toggle works equally well as an uncontrolled element (set \`checked\` once and let the component manage its own state) or as a fully controlled input driven by framework reactivity. It also participates in native form submission when given a \`name\`, emitting a boolean value alongside other form fields.`,

    features: [
      'Binary on/off state with animated thumb slide and glow transition',
      'Built-in `role="switch"` and automatic `aria-checked` management',
      'Keyboard accessible — Space and Enter keys toggle state',
      'Paired label rendered inline, with click-to-toggle support',
      'Disabled state with reduced opacity and blocked pointer events',
      'Participates in native `<form>` submission when `name` is set',
      'Theme-aware glow color derived from accent design tokens',
      'Works as controlled or uncontrolled input across all frameworks',
    ],

    guidelines: {
      do: [
        'Use a toggle for settings that take effect immediately (e.g., enable notifications).',
        'Provide a clear, concise label describing what the toggle controls.',
        'Place toggles in a vertical list when presenting multiple related settings.',
        'Use the `checked` attribute to set a sensible default for each option.',
        'Pair with descriptive helper text when the label alone may be ambiguous.',
      ],
      dont: [
        'Do not use a toggle when the change requires an explicit "Save" action — use a checkbox instead.',
        'Avoid wrapping a toggle inside a clickable card or button — the double-action confuses users.',
        'Do not disable a toggle without explaining why the option is unavailable.',
        'Avoid placing more than 8-10 toggles in a single group — consider grouping into sections.',
        'Do not use a toggle for mutually exclusive options — use a radio group instead.',
      ],
    },

    previewHtml: `<div style="display:flex;flex-direction:column;align-items:flex-start;gap:var(--space-md)">
  <arc-toggle label="Email notifications" checked></arc-toggle>
  <arc-toggle label="Push notifications"></arc-toggle>
  <arc-toggle label="Marketing emails"></arc-toggle>
</div>`,

    props: [
      { name: 'checked', type: 'boolean', default: 'false', description: 'Whether the toggle is in the on position. When set, the thumb slides to the active side and the track displays the accent glow.' },
      { name: 'disabled', type: 'boolean', default: 'false', description: 'Prevents user interaction. The toggle appears at reduced opacity and ignores pointer and keyboard events.' },
      { name: 'label', type: 'string', description: 'Visible text rendered beside the toggle. Clicking the label also toggles the switch, matching native `<label>` behavior.' },
      { name: 'size', type: 'string', default: "'md'", description: "Controls the toggle size. Options: 'sm', 'md', 'lg'." },
      { name: 'name', type: 'string', description: 'Form field name submitted with the toggle value. When set, the component participates in native `<form>` submission.' },
    ],
    events: [
      { name: 'arc-change', description: 'Fired when the toggle state changes' },
    ],

    tabs: [
      {
        label: 'Web Component',
        lang: 'html',
        code: `<arc-toggle label="Email notifications" checked></arc-toggle>
<arc-toggle label="Push notifications"></arc-toggle>
<arc-toggle label="Marketing emails"></arc-toggle>`,
      },
      {
        label: 'React',
        lang: 'tsx',
        code: `import { Toggle } from '@arclux/arc-ui-react';

<Toggle label="Email notifications" checked />
<Toggle label="Push notifications" />
<Toggle label="Marketing emails" />`,
      },
      {
        label: 'Vue',
        lang: 'html',
        code: `<script setup>
import { Toggle } from '@arclux/arc-ui-vue';
</script>

<template>
  <Toggle label="Email notifications" checked></Toggle>
  <Toggle label="Push notifications"></Toggle>
  <Toggle label="Marketing emails"></Toggle>
</template>`,
      },
      {
        label: 'Svelte',
        lang: 'html',
        code: `<script>
  import { Toggle } from '@arclux/arc-ui-svelte';
</script>

<Toggle label="Email notifications" checked></Toggle>
<Toggle label="Push notifications"></Toggle>
<Toggle label="Marketing emails"></Toggle>`,
      },
      {
        label: 'Angular',
        lang: 'ts',
        code: `import { Component } from '@angular/core';
import { Toggle } from '@arclux/arc-ui-angular';

@Component({
  imports: [Toggle],
  template: \`
    <Toggle label="Email notifications" checked></Toggle>
    <Toggle label="Push notifications"></Toggle>
    <Toggle label="Marketing emails"></Toggle>
  \`,
})
export class SettingsPanel {}`,
      },
      {
        label: 'Solid',
        lang: 'tsx',
        code: `import { Toggle } from '@arclux/arc-ui-solid';

<Toggle label="Email notifications" checked></Toggle>
<Toggle label="Push notifications"></Toggle>
<Toggle label="Marketing emails"></Toggle>`,
      },
      {
        label: 'Preact',
        lang: 'tsx',
        code: `import { Toggle } from '@arclux/arc-ui-preact';

<Toggle label="Email notifications" checked></Toggle>
<Toggle label="Push notifications"></Toggle>
<Toggle label="Marketing emails"></Toggle>`,
      },
      {
        label: 'HTML',
        lang: 'html',
        code: `<arc-toggle label="Email notifications" checked></arc-toggle>
<arc-toggle label="Push notifications"></arc-toggle>
<arc-toggle label="Marketing emails"></arc-toggle>`,
      },
    
    {
      label: 'HTML (Inline)',
      lang: 'html',
      code: `<!-- Auto-generated by @arclux/prism — do not edit manually -->
<!-- arc-toggle — self-contained, no external CSS needed -->
<div class="arc-toggle">

</div>`,
    },
  ],
  
  seeAlso: ["checkbox","radio-group"],
};
