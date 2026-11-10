import type { ComponentDef } from './_types';

export const checkbox: ComponentDef = {
  name: 'Checkbox',
  slug: 'checkbox',
  tag: 'arc-checkbox',
  tier: 'input',
  interactivity: 'hybrid',
  description:
    'Multi-select form control with checked, indeterminate, and disabled states. For preferences, bulk selection, and consent forms where users toggle one or more independent options.',

  overview: `Checkbox lets users pick any combination of options, where a radio group allows only one. It has a built-in label, a \`name\` and \`value\` for native form submission, and \`arc-change\` on every state change.

Besides checked and unchecked, it has an indeterminate state for a "select all" box whose group is only partly checked. Toggling an indeterminate checkbox makes it checked, as in file managers and data tables. Space toggles the focused checkbox, and clicking the label does too. \`disabled\` dims the box and blocks input.

There is no checkbox group component. Group related checkboxes yourself, for example in a Fieldset.`,

  features: [
    'Indeterminate shows a dash in place of the checkmark',
    'Unchecked boxes submit nothing, and checked ones submit `value` (default "on"), as native checkboxes do',
  ],

  guidelines: {
    do: [
      'Give every checkbox a short label',
      'Use the indeterminate state on a "select all" box that controls a partly checked group',
      'Order the options alphabetically, by frequency or by importance',
      'Put related checkboxes under a visible heading or fieldset legend',
      'Pre-check recommended or common options',
    ],
    dont: [
      'Don\'t use checkboxes for mutually exclusive choices. Use a radio group',
      'Don\'t use a checkbox as an on/off switch that acts at once. Use a toggle',
      'Don\'t rely on color alone to show the checked state. The checkmark carries it',
      'Don\'t disable a checkbox without saying nearby why the option is unavailable',
      'Don\'t nest checkboxes more than one level deep',
      'Don\'t write negative labels like "Don\'t send emails". Say what checking it does',
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
