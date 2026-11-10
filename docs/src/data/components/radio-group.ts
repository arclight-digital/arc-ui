import type { ComponentDef } from './_types';

export const radioGroup: ComponentDef = {
  name: 'Radio Group',
  slug: 'radio-group',
  tag: 'arc-radio-group',
  tier: 'input',
  interactivity: 'hybrid',
  description:
    'A set of radio options, all visible at once, where exactly one can be chosen.',

  overview: `RadioGroup shows every option up front and lets the reader pick exactly one. Select hides the options in a dropdown. RadioGroup suits two to six options that people compare before choosing, like pricing tiers, shipping methods or account types.

Each option is an \`<arc-radio>\` with a \`value\`. The group reads each option's text content as its label and renders its own copy, so markup inside an \`<arc-radio>\` comes out as plain text.

The whole group is one Tab stop. Any arrow key moves to the next or previous option and selects it, wrapping at either end, and Space selects the focused option. Each selection fires \`arc-change\` with the new value.

Add \`disabled\` to one \`<arc-radio>\` to rule out that option and leave the rest live. Like a disabled native radio, it's dimmed and announced as disabled, the arrow keys skip it, and a click or Space doesn't select it.

\`orientation\` is \`vertical\` by default, which suits longer labels. \`horizontal\` puts short labels in a row, like sizes S, M, L and XL. With a \`name\`, the selected value submits with native forms.`,

  features: [
    '`radiogroup` role, with `role="radio"` and `aria-checked` on each option',
    '`disabled` on the group blocks clicks and keys and drops it to 50% opacity',
    '`disabled` on one `<arc-radio>` gives that option `aria-disabled="true"` and 50% opacity, and takes it out of selection and arrow-key order',
    'The group\'s `aria-label` is its `name` attribute',
  ],

  guidelines: {
    do: [
      'Select the most common or recommended option by default, unless the choice is optional',
      'Put a visible label or heading above the group so readers know what they\'re choosing',
      'Group related radio groups under one fieldset or section heading',
    ],
    dont: [
      'Don\'t use it for more than six or seven options. Use Select or Combobox',
      'Don\'t put radio groups and checkboxes in the same row. They select in different ways',
      'Don\'t use `horizontal` with long labels. They wrap badly on small screens',
    ],
  },

  previewHtml: `<arc-radio-group value="starter">
  <arc-radio value="starter">Starter (free for individuals)</arc-radio>
  <arc-radio value="pro">Pro ($12/mo for teams)</arc-radio>
  <arc-radio value="enterprise">Enterprise (custom pricing)</arc-radio>
</arc-radio-group>`,

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
    <arc-radio-group name="plan" [value]="plan" (arc-change)="plan = $event.detail.value">
      <arc-radio value="starter">Starter — Free for individuals</arc-radio>
      <arc-radio value="pro">Pro — $12/mo for teams</arc-radio>
      <arc-radio value="enterprise">Enterprise — Custom pricing</arc-radio>
    </arc-radio-group>
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
      description:
        'One option in a RadioGroup. Its `value` is what the group submits, and its text content is the label.',
    },
  ],

  seeAlso: ['select', 'segmented-control', 'checkbox'],
};
