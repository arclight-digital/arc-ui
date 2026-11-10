import type { ComponentDef } from './_types';

export const switchGroup: ComponentDef = {
  name: 'Switch Group',
  slug: 'switch-group',
  tag: 'arc-switch-group',
  tier: 'input',
  interactivity: 'interactive',
  description:
    'Groups toggle switches under a shared label and gives them one size and disabled state. Lays them out vertically or horizontally.',

  overview: `SwitchGroup puts a set of \`arc-toggle\` elements in a native \`<fieldset>\`, with \`label\` as its \`<legend>\`. It copies its \`size\` and \`disabled\` to each toggle, so you set them once.

\`orientation="vertical"\` (the default) stacks the toggles in a column, for settings panels and forms. \`horizontal\` puts them in a wrapping row with wider gaps, for a compact row of options.`,

  features: [
    'The toggles sit in a `role="group"` labelled by `label`',
    'A disabled group is dimmed to 50% opacity',
  ],

  guidelines: {
    do: [
      'Use it for related on/off settings, such as notification preferences',
      'Set `label` to say what the toggles control',
    ],
    dont: [
      'Don\'t mix in children other than `arc-toggle`. Only toggles get the shared size and disabled state',
      'Don\'t use it for mutually exclusive options. Use RadioGroup',
    ],
  },

  previewHtml: `<arc-switch-group label="Notifications">
  <arc-toggle label="Email" checked></arc-toggle>
  <arc-toggle label="Push"></arc-toggle>
  <arc-toggle label="SMS"></arc-toggle>
</arc-switch-group>`,

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

export default function Example() {
  return (
    <SwitchGroup label="Notifications">
      <Toggle label="Email" checked />
      <Toggle label="Push" />
      <Toggle label="SMS" />
    </SwitchGroup>
  );
}`,
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
    <arc-switch-group label="Notifications">
      <arc-toggle label="Email" checked />
      <arc-toggle label="Push" />
      <arc-toggle label="SMS" />
    </arc-switch-group>
  \`,
})
export class SettingsPanel {}`,
    },
    {
      label: 'Solid',
      lang: 'tsx',
      code: `import { SwitchGroup, Toggle } from '@arclux/arc-ui-solid';

export default function Example() {
  return (
    <SwitchGroup label="Notifications">
      <Toggle label="Email" checked />
      <Toggle label="Push" />
      <Toggle label="SMS" />
    </SwitchGroup>
  );
}`,
    },
    {
      label: 'Preact',
      lang: 'tsx',
      code: `import { SwitchGroup, Toggle } from '@arclux/arc-ui-preact';

export default function Example() {
  return (
    <SwitchGroup label="Notifications">
      <Toggle label="Email" checked />
      <Toggle label="Push" />
      <Toggle label="SMS" />
    </SwitchGroup>
  );
}`,
    },
  ],

  seeAlso: ['toggle', 'fieldset', 'checkbox', 'radio-group'],
};
