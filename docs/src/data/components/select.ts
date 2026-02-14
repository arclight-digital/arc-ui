import type { ComponentDef } from './_types';

export const select: ComponentDef = {
    name: 'Select',
    slug: 'select',
    tag: 'arc-select',
    tier: 'input',
    interactivity: 'interactive',
    description: 'Dropdown select with searchable options, keyboard navigation, and full ARIA listbox semantics for accessible form inputs.',

    overview: `The Select component replaces the native \`<select>\` element with a fully styled, accessible dropdown that integrates seamlessly with ARC UI's design tokens. It provides built-in type-ahead search filtering, allowing users to quickly locate options in long lists without scrolling.

Select implements the ARIA listbox pattern, ensuring screen readers announce the current selection, available options, and navigation cues. Keyboard users can open the dropdown with Enter or Space, navigate with arrow keys, filter by typing, and confirm a choice with Enter — all without reaching for a mouse.

Use Select any time you need a single-choice dropdown in a form: assigning a team member, choosing a category, picking a status, or selecting a locale. For multi-choice scenarios, reach for MultiSelect instead. For short lists of three or fewer visible options, consider RadioGroup for faster scanning.`,

    features: [
      'Type-ahead search filtering narrows options as the user types',
      'Full keyboard navigation: Arrow keys, Home, End, Enter, Escape',
      'ARIA listbox role with active-descendant tracking for screen readers',
      'Supports placeholder text for empty-state guidance',
      'Controlled and uncontrolled value modes',
      'Disabled state prevents interaction and conveys unavailability visually',
      'Automatic scroll-into-view for the highlighted option in long lists',
      'Works with dynamic option lists — update the options array at any time',
      'Consistent styling across browsers via Shadow DOM encapsulation',
    ],

    guidelines: {
      do: [
        'Always provide a visible label so users understand what they are selecting',
        'Use a meaningful placeholder like "Choose a team member..." rather than generic "Select..."',
        'Keep option labels concise — ideally under 40 characters',
        'Order options logically (alphabetical, by frequency, or by workflow step)',
        'Pre-select a sensible default when one exists to reduce interaction cost',
        'Use the disabled state to indicate temporarily unavailable choices (e.g., permissions)',
      ],
      dont: [
        'Don\'t use Select for fewer than 3 options — use RadioGroup for better scannability',
        'Don\'t nest selects inside other selects — flatten the hierarchy or use a staged flow',
        'Don\'t rely solely on placeholder text as a label — placeholders disappear once a value is chosen',
        'Don\'t use Select for navigation — use NavigationMenu or tabs for moving between views',
        'Don\'t disable the component without explaining why — pair disabled state with a tooltip or helper text',
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

    props: [
      { name: 'value', type: 'string', description: 'The currently selected value. Must match one of the child `arc-option` value attributes. Setting this programmatically updates the displayed label and internal selection state.' },
      { name: 'placeholder', type: 'string', default: "'Select...'", description: 'Hint text displayed inside the trigger button when no option is selected. Use it to communicate what kind of choice the user should make, such as "Choose a team member..." or "Pick a status". The placeholder disappears once a value is chosen.' },
      { name: 'label', type: 'string', description: 'Visible label rendered above the select trigger. Also serves as the accessible name for assistive technologies. Always provide a label for accessibility compliance.' },
      { name: 'size', type: 'string', default: "'md'", description: "Controls the select trigger size. Options: 'sm', 'md', 'lg'." },
      { name: 'name', type: 'string', description: 'Form field name submitted with the selected value. Required for native form integration via ElementInternals.' },
      { name: 'disabled', type: 'boolean', default: 'false', description: 'When true, the select trigger becomes non-interactive: it cannot be opened, focused via keyboard, or clicked. The component renders with reduced opacity to visually convey the unavailable state.' },
      { name: 'error', type: 'string', default: "''", description: 'Error message displayed below the select. When set, the trigger border turns red.' },
      { name: 'open', type: 'boolean', default: 'false', description: 'Controls whether the dropdown is visible. Set programmatically to open or close the dropdown. Automatically set to `false` when an option is selected or the user clicks outside.' },
    ],
    events: [
      { name: 'arc-change', description: 'Fired when the selected option changes' },
    ],

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
    <Select label="Assign to team member" placeholder="Choose a person..."
      [value]="assignee" (arc-change)="assignee = $event.detail.value">
      <Option value="alice-chen">Alice Chen</Option>
      <Option value="bob-martinez">Bob Martinez</Option>
      <Option value="carol-nguyen">Carol Nguyen</Option>
      <Option value="david-okafor">David Okafor</Option>
      <Option value="eva-johansson">Eva Johansson</Option>
    </Select>
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
        description: 'Individual option rendered inside a Select or MultiSelect. Each Option provides a value for form submission and displays its text content as the label in the dropdown.',
        props: [
          { name: 'value', type: 'string', description: 'The value submitted when this option is selected. Must be unique within the parent Select.' },
          { name: 'disabled', type: 'boolean', default: 'false', description: 'When true, dims this option and prevents it from being selected.' },
        ],
      },
    ],
  
  seeAlso: ["combobox","multi-select","radio-group"],
};
