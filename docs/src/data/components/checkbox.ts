import type { ComponentDef } from './_types';

export const checkbox: ComponentDef = {
  name: 'Checkbox',
  slug: 'checkbox',
  tag: 'arc-checkbox',
  tier: 'input',
  interactivity: 'hybrid',
  description:
    'Multi-select form control with checked, indeterminate, and disabled states. For preferences, bulk selection, and consent forms where users toggle one or more independent options.',

  overview: `Checkbox is the multi-select form control in ARC UI. Unlike radio groups, which allow only one active choice, checkboxes let users select any combination of options independently. Use them for settings pages, filter panels, consent agreements, and any context where selections are not exclusive.

The component has three visual states: unchecked, checked, and indeterminate. Indeterminate suits "select all" patterns where only some child items are checked, and shows that the group is partially selected. Toggling an indeterminate checkbox resolves it to checked, as in file managers and data tables.

Every checkbox includes a label, a form-compatible name/value pair, and keyboard support. Space toggles the state, and a focus-visible ring shows keyboard users which control is active. The disabled state dims the checkbox and prevents interaction, which suits options that depend on a prerequisite.`,

  features: [
    'Checked and unchecked toggle with a single click or Space press',
    'Indeterminate (mixed) state for partial "select all" patterns',
    'Built-in label with proper click-to-toggle association',
    'Disabled state that dims the control and blocks interaction',
    'Form-compatible name and value attributes for native submission',
    'Focus-visible ring for keyboard accessibility',
    'Fires `arc-change` event on every state transition',
    'Works standalone or as part of a checkbox group',
  ],

  guidelines: {
    do: [
      'Use checkboxes when users can select zero, one, or many options from a list',
      'Provide a clear, concise label for every checkbox, and never leave one unlabeled',
      'Use the indeterminate state for "select all" controls that govern a partially-checked group',
      'Order checkbox lists logically: alphabetically, by frequency, or by importance',
      'Group related checkboxes together with a visible heading or fieldset legend',
      'Set a default checked state for recommended or common options when appropriate',
    ],
    dont: [
      'Do not use checkboxes for mutually exclusive choices. Use a radio group instead',
      'Do not use a checkbox as an on/off switch for instant actions. Use a toggle for that pattern',
      'Do not rely solely on color to communicate checked state; the checkmark icon matters',
      'Do not disable checkboxes without a nearby explanation of why the option is unavailable',
      'Do not nest checkboxes more than one level deep; flat lists are easier to scan',
      'Do not use negative label phrasing like "Don\'t send emails"; prefer affirmative wording',
    ],
  },

  previewHtml: `<div style="display:flex;flex-direction:column;align-items:flex-start;gap:var(--space-sm)">
  <arc-checkbox label="Set up your profile" checked></arc-checkbox>
  <arc-checkbox label="Connect a repository" checked></arc-checkbox>
  <arc-checkbox label="Invite team members"></arc-checkbox>
  <arc-checkbox label="Configure CI/CD"></arc-checkbox>
</div>`,

  tabs: [
    {
      label: 'Web Component',
      lang: 'html',
      code: `<script type="module" src="@arclux/arc-ui"></script>

<div style="display: flex; flex-direction: column; align-items: flex-start; gap: var(--space-sm);">
  <arc-checkbox label="Set up your profile" checked></arc-checkbox>
  <arc-checkbox label="Connect a repository" checked></arc-checkbox>
  <arc-checkbox label="Invite team members"></arc-checkbox>
  <arc-checkbox label="Configure CI/CD"></arc-checkbox>
</div>`,
    },
    {
      label: 'React',
      lang: 'tsx',
      code: `import { Checkbox } from '@arclux/arc-ui-react';

export function OnboardingChecklist() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 'var(--space-sm)' }}>
      <Checkbox label="Set up your profile" checked />
      <Checkbox label="Connect a repository" checked />
      <Checkbox label="Invite team members" />
      <Checkbox label="Configure CI/CD" />
    </div>
  );
}`,
    },
    {
      label: 'Vue',
      lang: 'html',
      code: `<script setup>
import { Checkbox } from '@arclux/arc-ui-vue';
</script>

<template>
  <div style="display: flex; flex-direction: column; align-items: flex-start; gap: var(--space-sm);">
    <Checkbox label="Set up your profile" checked />
    <Checkbox label="Connect a repository" checked />
    <Checkbox label="Invite team members" />
    <Checkbox label="Configure CI/CD" />
  </div>
</template>`,
    },
    {
      label: 'Svelte',
      lang: 'html',
      code: `<script>
  import { Checkbox } from '@arclux/arc-ui-svelte';
</script>

<div style="display: flex; flex-direction: column; align-items: flex-start; gap: var(--space-sm);">
  <Checkbox label="Set up your profile" checked />
  <Checkbox label="Connect a repository" checked />
  <Checkbox label="Invite team members" />
  <Checkbox label="Configure CI/CD" />
</div>`,
    },
    {
      label: 'Angular',
      lang: 'ts',
      code: `import { Component } from '@angular/core';
import { Checkbox } from '@arclux/arc-ui-angular';

@Component({
  imports: [Checkbox],
  template: \`
    <div style="display: flex; flex-direction: column; align-items: flex-start; gap: var(--space-sm);">
      <arc-checkbox label="Set up your profile" checked></arc-checkbox>
      <arc-checkbox label="Connect a repository" checked></arc-checkbox>
      <arc-checkbox label="Invite team members"></arc-checkbox>
      <arc-checkbox label="Configure CI/CD"></arc-checkbox>
    </div>
  \`,
})
export class OnboardingChecklistComponent {}`,
    },
    {
      label: 'Solid',
      lang: 'tsx',
      code: `import { Checkbox } from '@arclux/arc-ui-solid';

export function OnboardingChecklist() {
  return (
    <div style={{ display: 'flex', 'flex-direction': 'column', 'align-items': 'flex-start', gap: 'var(--space-sm)' }}>
      <Checkbox label="Set up your profile" checked />
      <Checkbox label="Connect a repository" checked />
      <Checkbox label="Invite team members" />
      <Checkbox label="Configure CI/CD" />
    </div>
  );
}`,
    },
    {
      label: 'Preact',
      lang: 'tsx',
      code: `import { Checkbox } from '@arclux/arc-ui-preact';

export function OnboardingChecklist() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 'var(--space-sm)' }}>
      <Checkbox label="Set up your profile" checked />
      <Checkbox label="Connect a repository" checked />
      <Checkbox label="Invite team members" />
      <Checkbox label="Configure CI/CD" />
    </div>
  );
}`,
    },
    {
      label: 'HTML',
      lang: 'html',
      code: `<div style="display: flex; flex-direction: column; align-items: flex-start; gap: var(--space-sm);">
  <arc-checkbox label="Set up your profile" checked></arc-checkbox>
  <arc-checkbox label="Connect a repository" checked></arc-checkbox>
  <arc-checkbox label="Invite team members"></arc-checkbox>
  <arc-checkbox label="Configure CI/CD"></arc-checkbox>
</div>`,
    },

    {
      label: 'HTML (Inline)',
      lang: 'html',
      code: `<!-- Auto-generated by @arclux/prism — do not edit manually -->
<!-- arc-checkbox — self-contained, no external CSS needed -->
<div class="arc-checkbox">

</div>`,
    },
  ],

  seeAlso: ['toggle', 'radio-group', 'form'],
};
