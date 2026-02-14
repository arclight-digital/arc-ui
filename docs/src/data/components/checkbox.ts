import type { ComponentDef } from './_types';

export const checkbox: ComponentDef = {
    name: 'Checkbox',
    slug: 'checkbox',
    tag: 'arc-checkbox',
    tier: 'input',
    interactivity: 'hybrid',
    description: 'Multi-select form control supporting checked, indeterminate, and disabled states. Ideal for preferences, bulk-selection patterns, and consent forms where users need to toggle one or more independent options.',

    overview: `Checkbox is the standard multi-select form control in ARC UI. Unlike radio groups and toggles, which enforce a single active choice, checkboxes let users select any combination of options independently. This makes them the correct element for settings pages, filter panels, consent agreements, and any context where selections are non-exclusive.

The component ships with three visual states: unchecked, checked, and indeterminate. The indeterminate state is particularly useful for "select all" patterns where only some child items are checked, giving users a clear visual signal that the group is partially selected. Toggling an indeterminate checkbox resolves it to fully checked, which is the behavior users expect from file managers and data tables.

Every checkbox includes a built-in label, a form-compatible name/value pair, and full keyboard support. Pressing Space toggles the state, and focus-visible rings ensure keyboard users always know which control is active. The disabled state dims the checkbox and prevents interaction, which is useful for options that depend on a prerequisite being met first.`,

    features: [
      'Checked and unchecked toggle with a single click or Space press',
      'Indeterminate (mixed) state for partial "select all" patterns',
      'Built-in label with proper click-to-toggle association',
      'Disabled state that dims the control and blocks interaction',
      'Form-compatible name and value attributes for native submission',
      'Focus-visible ring for keyboard accessibility',
      'Fires arc-change event on every state transition',
      'Works standalone or as part of a checkbox group',
    ],

    guidelines: {
      do: [
        'Use checkboxes when users can select zero, one, or many options from a list',
        'Provide a clear, concise label for every checkbox — never leave them unlabelled',
        'Use the indeterminate state for "select all" controls that govern a partially-checked group',
        'Order checkbox lists logically — alphabetically, by frequency, or by importance',
        'Group related checkboxes together with a visible heading or fieldset legend',
        'Set a default checked state for recommended or common options when appropriate',
      ],
      dont: [
        'Use checkboxes for mutually exclusive choices — use a radio group instead',
        'Use a checkbox as an on/off switch for instant actions — use a toggle for that pattern',
        'Rely solely on color to communicate checked state; the checkmark icon is essential',
        'Disable checkboxes without a nearby explanation of why the option is unavailable',
        'Nest checkboxes more than one level deep; flat lists are easier to scan and interact with',
        'Use negative label phrasing like "Don\'t send emails" — prefer affirmative wording',
      ],
    },

    previewHtml: `<div style="display:flex;flex-direction:column;align-items:flex-start;gap:var(--space-sm)">
  <arc-checkbox label="Set up your profile" checked></arc-checkbox>
  <arc-checkbox label="Connect a repository" checked></arc-checkbox>
  <arc-checkbox label="Invite team members"></arc-checkbox>
  <arc-checkbox label="Configure CI/CD"></arc-checkbox>
</div>`,

    props: [
      {
        name: 'checked',
        type: 'boolean',
        default: 'false',
        description: 'Controls whether the checkbox is in its checked (selected) state. When true, a checkmark icon is rendered inside the box. Bind to this property for two-way state management in frameworks that support it.',
      },
      {
        name: 'indeterminate',
        type: 'boolean',
        default: 'false',
        description: 'When true, displays a horizontal dash instead of a checkmark, representing a mixed or partially-selected state. Commonly used on a parent "select all" checkbox when only some children are checked. Clicking an indeterminate checkbox resolves it to fully checked.',
      },
      {
        name: 'disabled',
        type: 'boolean',
        default: 'false',
        description: 'Prevents all pointer and keyboard interaction and applies a dimmed visual treatment. Use this for options that are unavailable due to unmet prerequisites. Pair with a tooltip or helper text to explain why the option is locked.',
      },
      {
        name: 'label',
        type: 'string',
        description: 'Visible text rendered beside the checkbox. Clicking the label toggles the checkbox, matching native HTML behaviour. Keep labels short, affirmative, and action-oriented for the best readability.',
      },
      {
        name: 'size',
        type: 'string',
        default: "'md'",
        description: "Controls the checkbox size. Options: 'sm', 'md', 'lg'.",
      },
      {
        name: 'name',
        type: 'string',
        description: 'The form field name submitted when the checkbox lives inside a <form>. Required for native form submission and useful for serializing checkbox group values on the server.',
      },
      {
        name: 'value',
        type: 'string',
        description: 'The value sent with the form when the checkbox is checked. Defaults to "on" if omitted, matching native checkbox behaviour. Set explicit values when multiple checkboxes share the same name to distinguish them in the submitted data.',
      },
    ],
    events: [
      { name: 'arc-change', description: 'Fired when the checked state changes' },
    ],

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
      <Checkbox label="Set up your profile" checked></Checkbox>
      <Checkbox label="Connect a repository" checked></Checkbox>
      <Checkbox label="Invite team members"></Checkbox>
      <Checkbox label="Configure CI/CD"></Checkbox>
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
    ],
  
  seeAlso: ["toggle","radio-group","form"],
};
