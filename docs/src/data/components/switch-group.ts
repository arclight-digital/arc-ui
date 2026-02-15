import type { ComponentDef } from './_types';

export const switchGroup: ComponentDef = {
  name: 'Switch Group',
  slug: 'switch-group',
  tag: 'arc-switch-group',
  tier: 'input',
  interactivity: 'interactive',
  description: 'Groups multiple toggle switches under a shared label with consistent sizing and disabled state. Supports vertical and horizontal layouts.',

  overview: `Switch Group wraps multiple \`arc-toggle\` components inside a semantic \`<fieldset>\` with an optional legend label. It cascades the \`size\` and \`disabled\` props down to all child toggles, ensuring visual consistency without manually setting props on each one.

Two orientation modes control the layout: vertical (default) stacks toggles in a column with compact spacing, while horizontal arranges them in a wrapping row with wider gaps. The vertical layout works well in settings panels, while horizontal suits toolbar-style option rows.

The component renders a native \`<fieldset>\` for proper form semantics and sets \`role="group"\` with \`aria-label\` on the inner container, making the group relationship clear to assistive technology.`,

  features: [
    'Groups arc-toggle children under a shared label and fieldset',
    'Cascades `size` and `disabled` props to all child toggles',
    'Vertical and horizontal orientation modes',
    'Native `<fieldset>` with `role="group"` for accessible semantics',
    'Legend label rendered above the toggle group',
    'Exposed CSS parts: fieldset, legend, group'
  ],

  guidelines: {
    do: [
      'Use for groups of related on/off settings like notification preferences',
      'Provide a `label` to describe what the group of toggles controls',
      'Use vertical orientation for settings panels and forms',
      'Use horizontal orientation for compact toolbar-style layouts'
    ],
    dont: [
      'Mix toggle and non-toggle children — the component only cascades props to arc-toggle',
      'Use for mutually exclusive options — use a radio group instead',
      'Nest switch groups inside each other'
    ],
  },

  previewHtml: `<arc-switch-group label="Notifications">
  <arc-toggle label="Email" checked></arc-toggle>
  <arc-toggle label="Push"></arc-toggle>
  <arc-toggle label="SMS"></arc-toggle>
</arc-switch-group>`,

  props: [
    { name: 'label', type: 'string', default: "''", description: 'Group heading rendered as a `<legend>` element.' },
    { name: 'orientation', type: "'vertical' | 'horizontal'", default: "'vertical'", description: 'Layout direction. Vertical stacks toggles, horizontal arranges them in a row.' },
    { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Size cascaded to all child arc-toggle elements.' },
    { name: 'disabled', type: 'boolean', default: 'false', description: 'Disables all child toggles and dims the group.' }
  ],

  tabs: [
    {
      label: 'Web Component',
      lang: 'html',
      code: `<arc-switch-group label="Notifications">
  <arc-toggle label="Email" checked></arc-toggle>
  <arc-toggle label="Push"></arc-toggle>
  <arc-toggle label="SMS"></arc-toggle>
</arc-switch-group>

<!-- Horizontal layout -->
<arc-switch-group label="Features" orientation="horizontal">
  <arc-toggle label="Dark mode" checked></arc-toggle>
  <arc-toggle label="Compact view"></arc-toggle>
</arc-switch-group>`,
    },
    {
      label: 'React',
      lang: 'tsx',
      code: `import { SwitchGroup, Toggle } from '@arclux/arc-ui-react';

<SwitchGroup label="Notifications">
  <Toggle label="Email" checked />
  <Toggle label="Push" />
  <Toggle label="SMS" />
</SwitchGroup>`,
    },
    {
      label: 'Vue',
      lang: 'html',
      code: `<script setup>
import { SwitchGroup, Toggle } from '@arclux/arc-ui-vue';
</script>

<template>
  <SwitchGroup label="Notifications">
    <Toggle label="Email" checked />
    <Toggle label="Push" />
    <Toggle label="SMS" />
  </SwitchGroup>
</template>`,
    },
    {
      label: 'Svelte',
      lang: 'html',
      code: `<script>
  import { SwitchGroup, Toggle } from '@arclux/arc-ui-svelte';
</script>

<SwitchGroup label="Notifications">
  <Toggle label="Email" checked />
  <Toggle label="Push" />
  <Toggle label="SMS" />
</SwitchGroup>`,
    },
    {
      label: 'Angular',
      lang: 'ts',
      code: `import { Component } from '@angular/core';
import { SwitchGroup, Toggle } from '@arclux/arc-ui-angular';

@Component({
  imports: [SwitchGroup, Toggle],
  template: \`
    <SwitchGroup label="Notifications">
      <Toggle label="Email" checked />
      <Toggle label="Push" />
      <Toggle label="SMS" />
    </SwitchGroup>
  \`,
})
export class SettingsPanel {}`,
    },
    {
      label: 'Solid',
      lang: 'tsx',
      code: `import { SwitchGroup, Toggle } from '@arclux/arc-ui-solid';

<SwitchGroup label="Notifications">
  <Toggle label="Email" checked />
  <Toggle label="Push" />
  <Toggle label="SMS" />
</SwitchGroup>`,
    },
    {
      label: 'Preact',
      lang: 'tsx',
      code: `import { SwitchGroup, Toggle } from '@arclux/arc-ui-preact';

<SwitchGroup label="Notifications">
  <Toggle label="Email" checked />
  <Toggle label="Push" />
  <Toggle label="SMS" />
</SwitchGroup>`,
    },
  ],

  seeAlso: ['toggle', 'fieldset', 'checkbox', 'radio-group'],
};
