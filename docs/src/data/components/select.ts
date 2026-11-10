import type { ComponentDef } from './_types';

export const select: ComponentDef = {
  name: 'Select',
  slug: 'select',
  tag: 'arc-select',
  tier: 'input',
  interactivity: 'interactive',
  searchKeywords: ['dropdown', 'picker'],
  description:
    'A dropdown for choosing one option from a list in a form.',

  overview: `Select replaces the native \`<select>\` with a dropdown styled by ARC UI's tokens. Its options are \`<arc-option>\` children. Use it for one choice from a list in a form: a person to assign, a category, a status, a locale. For several choices use MultiSelect. For three or fewer options, RadioGroup shows them all at once. To filter a long list as you type, use Combobox.

Enter, Space or an arrow key opens the list. The arrows move through it and wrap at the ends, Home and End jump to the first and last option, Enter picks, and Escape closes. Typing letters jumps to the first option that starts with them, and pressing the same letter again cycles through the matches, as in a native select.`,

  features: [
    'Focus stays on the trigger while `aria-activedescendant` tracks the highlighted option, so screen readers announce it',
    'The highlighted option scrolls into view in a long list',
    'An `<arc-option>` with `disabled` stays visible but is skipped by the keyboard and can\'t be picked',
    'Disabled drops the control to 50% opacity and blocks pointer events',
  ],

  guidelines: {
    do: [
      'Give it a visible `label`. The placeholder disappears once a value is chosen',
      'Write a placeholder that names the choice, like "Choose a team member...", not "Select..."',
      'Keep option labels short, ideally under 40 characters',
      'Order options alphabetically, by frequency, or by workflow step',
      'Pre-select a default when there is a sensible one',
    ],
    dont: [
      'Don\'t use it to move between views. Use NavigationMenu or Tabs',
      'Don\'t disable it without saying why in helper text or a tooltip',
    ],
  },

  previewHtml: `<div style="width:100%;max-width:300px">
  <arc-select label="Assign to team member" placeholder="Choose a person...">
    <arc-option value="alice-chen">Alice Chen</arc-option>
    <arc-option value="bob-martinez">Bob Martinez</arc-option>
    <arc-option value="carol-nguyen">Carol Nguyen</arc-option>
    <arc-option value="david-okafor">David Okafor</arc-option>
    <arc-option value="eva-johansson">Eva Johansson</arc-option>
  </arc-select>
</div>`,

  tabs: [
    {
      label: 'Web Component',
      lang: 'html',
      code: `<script type="module" src="@arclux/arc-ui"></script>

<!-- Basic select -->
<arc-select label="Assign to team member" placeholder="Choose a person...">
  <arc-option value="alice-chen">Alice Chen</arc-option>
  <arc-option value="bob-martinez">Bob Martinez</arc-option>
  <arc-option value="carol-nguyen">Carol Nguyen</arc-option>
  <arc-option value="david-okafor">David Okafor</arc-option>
  <arc-option value="eva-johansson">Eva Johansson</arc-option>
</arc-select>

<!-- Pre-selected value -->
<arc-select label="Status" value="in-progress">
  <arc-option value="open">Open</arc-option>
  <arc-option value="in-progress">In Progress</arc-option>
  <arc-option value="review">In Review</arc-option>
  <arc-option value="done">Done</arc-option>
</arc-select>

<!-- In a native form -->
<form action="/api/assign" method="post">
  <arc-select name="assignee" label="Assignee" placeholder="Pick someone...">
    <arc-option value="alice">Alice</arc-option>
    <arc-option value="bob">Bob</arc-option>
  </arc-select>
  <button type="submit">Save</button>
</form>

<script>
  document.querySelector('arc-select')
    .addEventListener('arc-change', (e) => {
      console.log('Selected:', e.detail.value, e.detail.label);
    });
</script>`,
    },
    {
      label: 'React',
      lang: 'tsx',
      code: `import { Select, Option } from '@arclux/arc-ui-react';
import { useState } from 'react';

function TeamAssigner() {
  const [assignee, setAssignee] = useState('');

  return (
    <Select
      label="Assign to team member"
      placeholder="Choose a person..."
      value={assignee}
      onArcChange={(e) => setAssignee(e.detail.value)}
    >
      <Option value="alice-chen">Alice Chen</Option>
      <Option value="bob-martinez">Bob Martinez</Option>
      <Option value="carol-nguyen">Carol Nguyen</Option>
      <Option value="david-okafor">David Okafor</Option>
      <Option value="eva-johansson">Eva Johansson</Option>
    </Select>
  );
}

function StatusPicker() {
  return (
    <Select label="Status" value="in-progress">
      <Option value="open">Open</Option>
      <Option value="in-progress">In Progress</Option>
      <Option value="review">In Review</Option>
      <Option value="done">Done</Option>
    </Select>
  );
}`,
    },
    {
      label: 'Vue',
      lang: 'html',
      code: `<script setup>
import { Select, Option } from '@arclux/arc-ui-vue';
import { ref } from 'vue';

const assignee = ref('');
</script>

<template>
  <Select
    label="Assign to team member"
    placeholder="Choose a person..."
    :value="assignee"
    @arc-change="assignee = $event.detail.value"
  >
    <Option value="alice-chen">Alice Chen</Option>
    <Option value="bob-martinez">Bob Martinez</Option>
    <Option value="carol-nguyen">Carol Nguyen</Option>
    <Option value="david-okafor">David Okafor</Option>
    <Option value="eva-johansson">Eva Johansson</Option>
  </Select>
</template>`,
    },
    {
      label: 'Svelte',
      lang: 'html',
      code: `<script>
  import { Select, Option } from '@arclux/arc-ui-svelte';

  let status = 'open';
</script>

<Select label="Task status" value={status}
  on:arc-change={(e) => status = e.detail.value}>
  <Option value="open">Open</Option>
  <Option value="in-progress">In Progress</Option>
  <Option value="review">In Review</Option>
  <Option value="done">Done</Option>
  <Option value="closed">Closed</Option>
</Select>`,
    },
    {
      label: 'Angular',
      lang: 'ts',
      code: `import { Component } from '@angular/core';
import { Select, Option } from '@arclux/arc-ui-angular';

@Component({
  imports: [Select, Option],
  template: \`
    <arc-select label="Assign to team member" placeholder="Choose a person..."
      [value]="assignee" (arc-change)="assignee = $event.detail.value">
      <arc-option value="alice-chen">Alice Chen</arc-option>
      <arc-option value="bob-martinez">Bob Martinez</arc-option>
      <arc-option value="carol-nguyen">Carol Nguyen</arc-option>
      <arc-option value="david-okafor">David Okafor</arc-option>
      <arc-option value="eva-johansson">Eva Johansson</arc-option>
    </arc-select>
  \`,
})
export class AssignmentComponent {
  assignee = '';
}`,
    },
    {
      label: 'Solid',
      lang: 'tsx',
      code: `import { Select, Option } from '@arclux/arc-ui-solid';
import { createSignal } from 'solid-js';

function CategoryPicker() {
  const [category, setCategory] = createSignal('');

  return (
    <Select label="Category" placeholder="Choose a category..."
      value={category()} onArcChange={(e) => setCategory(e.detail.value)}>
      <Option value="bug">Bug Report</Option>
      <Option value="feature">Feature Request</Option>
      <Option value="docs">Documentation</Option>
      <Option value="question">Question</Option>
    </Select>
  );
}`,
    },
    {
      label: 'Preact',
      lang: 'tsx',
      code: `import { Select, Option } from '@arclux/arc-ui-preact';
import { useState } from 'preact/hooks';

function LocalePicker() {
  const [locale, setLocale] = useState('en');

  return (
    <Select label="Language" value={locale}
      onArcChange={(e) => setLocale(e.detail.value)}>
      <Option value="en">English</Option>
      <Option value="es">Espa\u00f1ol</Option>
      <Option value="fr">Fran\u00e7ais</Option>
      <Option value="de">Deutsch</Option>
      <Option value="ja">\u65e5\u672c\u8a9e</Option>
    </Select>
  );
}`,
    },
  ],
  subComponents: [
    {
      name: 'Option',
      tag: 'arc-option',
      description:
        'One choice in a Select or MultiSelect. Its `value` is what the form submits and its text content is the label.',
    },
  ],

  seeAlso: ['combobox', 'multi-select', 'radio-group'],
};
