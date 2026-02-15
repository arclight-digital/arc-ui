import type { ComponentDef } from './_types';

export const radioGroup: ComponentDef = {
    name: 'Radio Group',
    slug: 'radio-group',
    tag: 'arc-radio-group',
    tier: 'input',
    interactivity: 'hybrid',
    description: 'Single-select option group with arrow-key navigation and ARIA radiogroup semantics. Ideal for pricing tiers, settings panels, and any context where exactly one choice must be made from a visible set of options.',

    overview: `RadioGroup lets users pick exactly one option from a visible set. Unlike Select, which hides choices behind a dropdown, RadioGroup displays every option up front so users can compare them at a glance. This makes it the right choice when the number of options is small (typically two to six) and the decision benefits from side-by-side visibility — pricing tiers, shipping methods, account types, or preference toggles.

Under the hood, the component manages focus with arrow-key navigation following the WAI-ARIA radiogroup pattern. Pressing Arrow Down or Arrow Right moves focus to the next option and selects it; Arrow Up or Arrow Left moves backward. This roving-tabindex approach means the entire group occupies a single Tab stop, keeping keyboard navigation fast and predictable.

RadioGroup supports both vertical and horizontal orientations. Vertical is the default and works best for options with longer labels or descriptions. Horizontal layout suits compact rows of short labels — for example, a row of size options (S, M, L, XL) or a light/dark theme toggle with more than two states. The component also integrates seamlessly with native form submission through its \`name\` and \`value\` properties.`,

    features: [
      'Single-select from a visible set of options — one choice at a time',
      'Arrow-key navigation with roving tabindex (single Tab stop)',
      'ARIA radiogroup role with automatic aria-checked management',
      'Vertical and horizontal orientation modes',
      'Disabled state for the entire group or individual options',
      'Native form integration via name and value properties',
      'Fires arc-change event on selection with the new value',
      'Supports rich option objects with label and value fields',
    ],

    guidelines: {
      do: [
        'Use RadioGroup when users must choose exactly one option from two to six visible choices',
        'Default-select the most common or recommended option to reduce decision friction',
        'Use vertical orientation when option labels are longer than a few words',
        'Pair with a visible label or heading so users understand what they are choosing',
        'Group related radio groups under a shared fieldset or section heading',
      ],
      dont: [
        'Use RadioGroup for more than six or seven options — switch to Select or Combobox instead',
        'Leave the group without a default selection unless the choice is truly optional',
        'Mix RadioGroup with checkboxes in the same visual row — they imply different selection models',
        'Use horizontal orientation with long labels — text will wrap awkwardly on small screens',
        'Disable individual options without explaining why they are unavailable',
      ],
    },

    previewHtml: `<arc-radio-group value="starter">
  <arc-radio value="starter">Starter — Free for individuals</arc-radio>
  <arc-radio value="pro">Pro — $12/mo for teams</arc-radio>
  <arc-radio value="enterprise">Enterprise — Custom pricing</arc-radio>
</arc-radio-group>`,

    props: [
      {
        name: 'value',
        type: 'string',
        description: 'The currently selected value. Must match one of the child arc-radio value attributes. Setting this property programmatically updates the visual selection and the internal aria-checked state.',
      },
      {
        name: 'name',
        type: 'string',
        description: 'The form field name submitted with the selected value. Required for native form integration — without it, the selection will not appear in FormData.',
      },
      {
        name: 'disabled',
        type: 'boolean',
        default: 'false',
        description: 'When true, disables all options in the group. The component becomes non-interactive: arrow-key navigation is suppressed, click events are ignored, and the group is excluded from the Tab order.',
      },
      {
        name: 'orientation',
        type: "'vertical' | 'horizontal'",
        default: "'vertical'",
        description: 'Controls the layout direction of the radio options. Vertical stacks options top-to-bottom and maps Arrow Up/Down to navigation. Horizontal places options in a row and maps Arrow Left/Right.',
      },
      {
        name: 'size',
        type: 'string',
        default: "'md'",
        description: "Controls the radio button and label size. Options: 'sm', 'md', 'lg'.",
      },
    ],
    events: [
      { name: 'arc-change', description: 'Fired when the selected radio value changes' },
    ],

    tabs: [
      {
        label: 'Web Component',
        lang: 'html',
        code: `<script type="module" src="@arclux/arc-ui"></script>

<!-- Vertical (default) -->
<arc-radio-group name="plan" value="starter">
  <arc-radio value="starter">Starter — Free for individuals</arc-radio>
  <arc-radio value="pro">Pro — $12/mo for teams</arc-radio>
  <arc-radio value="enterprise">Enterprise — Custom pricing</arc-radio>
</arc-radio-group>

<!-- Horizontal layout -->
<arc-radio-group name="size" value="md" orientation="horizontal">
  <arc-radio value="sm">Small</arc-radio>
  <arc-radio value="md">Medium</arc-radio>
  <arc-radio value="lg">Large</arc-radio>
  <arc-radio value="xl">X-Large</arc-radio>
</arc-radio-group>

<script>
  document.querySelector('arc-radio-group')
    .addEventListener('arc-change', (e) => {
      console.log('Selected:', e.detail.value);
    });
</script>`,
      },
      {
        label: 'React',
        lang: 'tsx',
        code: `import { RadioGroup, Radio } from '@arclux/arc-ui-react';
import { useState } from 'react';

function PricingPlan() {
  const [plan, setPlan] = useState('starter');

  return (
    <RadioGroup
      name="plan"
      value={plan}
      onArcChange={(e) => setPlan(e.detail.value)}
    >
      <Radio value="starter">Starter — Free for individuals</Radio>
      <Radio value="pro">Pro — $12/mo for teams</Radio>
      <Radio value="enterprise">Enterprise — Custom pricing</Radio>
    </RadioGroup>
  );
}

function SizeSelector() {
  return (
    <RadioGroup name="size" value="md" orientation="horizontal">
      <Radio value="sm">Small</Radio>
      <Radio value="md">Medium</Radio>
      <Radio value="lg">Large</Radio>
      <Radio value="xl">X-Large</Radio>
    </RadioGroup>
  );
}`,
      },
      {
        label: 'Vue',
        lang: 'html',
        code: `<script setup>
import { RadioGroup, Radio } from '@arclux/arc-ui-vue';
import { ref } from 'vue';

const plan = ref('starter');
</script>

<template>
  <RadioGroup name="plan" :value="plan" @arc-change="plan = $event.detail.value">
    <Radio value="starter">Starter — Free for individuals</Radio>
    <Radio value="pro">Pro — $12/mo for teams</Radio>
    <Radio value="enterprise">Enterprise — Custom pricing</Radio>
  </RadioGroup>
</template>`,
      },
      {
        label: 'Svelte',
        lang: 'html',
        code: `<script>
  import { RadioGroup, Radio } from '@arclux/arc-ui-svelte';

  let theme = 'dark';
</script>

<RadioGroup name="theme" value={theme} orientation="horizontal"
  on:arc-change={(e) => theme = e.detail.value}>
  <Radio value="light">Light</Radio>
  <Radio value="dark">Dark</Radio>
  <Radio value="auto">System</Radio>
</RadioGroup>`,
      },
      {
        label: 'Angular',
        lang: 'ts',
        code: `import { Component } from '@angular/core';
import { RadioGroup, Radio } from '@arclux/arc-ui-angular';

@Component({
  imports: [RadioGroup, Radio],
  template: \`
    <RadioGroup name="plan" [value]="plan" (arc-change)="plan = $event.detail.value">
      <Radio value="starter">Starter — Free for individuals</Radio>
      <Radio value="pro">Pro — $12/mo for teams</Radio>
      <Radio value="enterprise">Enterprise — Custom pricing</Radio>
    </RadioGroup>
  \`,
})
export class PricingComponent {
  plan = 'starter';
}`,
      },
      {
        label: 'Solid',
        lang: 'tsx',
        code: `import { RadioGroup, Radio } from '@arclux/arc-ui-solid';
import { createSignal } from 'solid-js';

function ShippingMethod() {
  const [method, setMethod] = createSignal('standard');

  return (
    <RadioGroup name="shipping" value={method()}
      onArcChange={(e) => setMethod(e.detail.value)}>
      <Radio value="standard">Standard — 5-7 business days</Radio>
      <Radio value="express">Express — 2-3 business days</Radio>
      <Radio value="overnight">Overnight — Next business day</Radio>
    </RadioGroup>
  );
}`,
      },
      {
        label: 'Preact',
        lang: 'tsx',
        code: `import { RadioGroup, Radio } from '@arclux/arc-ui-preact';
import { useState } from 'preact/hooks';

function NotificationPreference() {
  const [pref, setPref] = useState('email');

  return (
    <RadioGroup name="notify" value={pref}
      onArcChange={(e) => setPref(e.detail.value)}>
      <Radio value="email">Email notifications</Radio>
      <Radio value="sms">SMS notifications</Radio>
      <Radio value="push">Push notifications</Radio>
      <Radio value="none">No notifications</Radio>
    </RadioGroup>
  );
}`,
      },
      {
        label: 'HTML',
        lang: 'html',
        code: `<!-- arc-radio-group is interactive — requires JS -->
<arc-radio-group></arc-radio-group>`,
      },
      {
        label: 'HTML (Inline)',
        lang: 'html',
        code: `<!-- arc-radio-group is interactive — requires JS -->
<arc-radio-group></arc-radio-group>`,
      },
    ],
    subComponents: [
      {
        name: 'Radio',
        tag: 'arc-radio',
        description: 'Individual radio option rendered inside a RadioGroup. Each Radio represents a single selectable choice with its own label and value. Can be independently disabled while the rest of the group remains interactive.',
        props: [
          { name: 'value', type: 'string', description: 'The value submitted when this option is selected. Must be unique within the parent RadioGroup.' },
          { name: 'disabled', type: 'boolean', default: 'false', description: 'When true, dims this individual option and removes it from keyboard navigation. The option cannot be selected by click or arrow keys.' },
        ],
      },
    ],
  
  seeAlso: ["select","segmented-control","checkbox"],
};
