import type { ComponentDef } from './_types';

export const chip: ComponentDef = {
    name: 'Chip',
    slug: 'chip',
    tag: 'arc-chip',
    tier: 'input',
    interactivity: 'interactive',
    description: 'A toggleable pill-shaped element for filters, tags, or multi-select options, with a selected state highlighted in accent-primary.',

    overview: `Chip is a compact, pill-shaped interactive element that can be toggled between selected and unselected states. It is designed for scenarios where users need to pick one or more options from a visible set -- such as filter chips, tag selectors, or interest pickers. The default appearance uses a bordered pill with muted uppercase text, and toggling to the selected state transitions the chip to an accent-primary border, matching text colour, and a subtle blue-tinted background with a glow effect.

The component renders a single \`<span>\` with the \`option\` ARIA role and \`aria-selected\` attribute, making it compatible with listbox or grid accessibility patterns when grouped. Keyboard interaction is handled with Enter and Space keys for toggling, and the chip is focusable via the \`tabindex\` attribute (automatically set to -1 when disabled). The slot accepts any inline content, though plain text labels work best for the uppercase styling.

Chip fires an \`arc-change\` event on every toggle, including both the \`value\` and \`selected\` state in the event detail. This makes it straightforward to manage chip groups -- simply listen to \`arc-change\` on each chip and maintain a set of selected values in your application state. The \`value\` prop acts as a machine-readable identifier that is separate from the visible label text.`,

    features: [
      'Pill-shaped toggle with `border-radius: full` and uppercase accent-font label styling',
      'Selected state: accent-primary border, matching text colour, tinted background, and glow shadow',
      'Hover state brightens the border and elevates the background for unselected chips',
      'Combined focus-visible glow with selection glow for clear keyboard focus indication',
      'ARIA `option` role with `aria-selected` and `aria-disabled` for accessible group patterns',
      'Fires `arc-change` with `{ value, selected }` detail on every toggle interaction',
      'Keyboard toggle via Enter and Space with automatic tabindex management',
      'Disabled state at 40% opacity with pointer events blocked',
    ],

    guidelines: {
      do: [
        'Use Chip for multi-select filter sets where users can pick zero or more options',
        'Set a unique `value` on each chip for programmatic identification distinct from the label',
        'Group related chips together and listen to `arc-change` on each to maintain a selection set',
        'Keep chip labels short -- one or two words -- to preserve the compact pill appearance',
        'Combine with a clear/reset action when using chips as active filters',
      ],
      dont: [
        'Do not use Chip for mutually exclusive choices -- use Segmented Control or Radio Group instead',
        'Do not place long sentences inside a Chip -- it breaks the compact pill layout',
        'Do not use Chip as a navigation element -- it is an input control, not a link',
        'Do not nest interactive elements (buttons, links) inside the chip slot',
        'Avoid using chips without `value` props in a group -- the change event needs identifiers to be useful',
      ],
    },

    previewHtml: `<div style="display:flex; gap:8px; flex-wrap:wrap;">
  <arc-chip value="react" selected>React</arc-chip>
  <arc-chip value="vue">Vue</arc-chip>
  <arc-chip value="svelte">Svelte</arc-chip>
  <arc-chip value="angular">Angular</arc-chip>
</div>`,

    props: [
      { name: 'selected', type: 'boolean', default: 'false', description: 'Whether the chip is currently selected. Reflected as an attribute and toggled on click or keypress.' },
      { name: 'disabled', type: 'boolean', default: 'false', description: 'Disables interaction, reducing opacity to 40% and blocking pointer events.' },
      { name: 'value', type: 'string', default: "''", description: 'Machine-readable identifier for this chip, included in the `arc-change` event detail.' },
    ],
    events: [
      { name: 'arc-change', description: 'Fired when the chip selected state changes' },
    ],

    tabs: [
      {
        label: 'Web Component',
        lang: 'html',
        code: `<arc-chip value="react" selected>React</arc-chip>
<arc-chip value="vue">Vue</arc-chip>
<arc-chip value="svelte">Svelte</arc-chip>`,
      },
      {
        label: 'React',
        lang: 'tsx',
        code: `import { Chip } from '@arclux/arc-ui-react';

<Chip value="react" selected>React</Chip>
<Chip value="vue">Vue</Chip>
<Chip value="svelte">Svelte</Chip>`,
      },
      {
        label: 'Vue',
        lang: 'html',
        code: `<script setup>
import { Chip } from '@arclux/arc-ui-vue';
</script>

<template>
  <Chip value="react" selected>React</Chip>
  <Chip value="vue">Vue</Chip>
  <Chip value="svelte">Svelte</Chip>
</template>`,
      },
      {
        label: 'Svelte',
        lang: 'html',
        code: `<script>
  import { Chip } from '@arclux/arc-ui-svelte';
</script>

<Chip value="react" selected>React</Chip>
<Chip value="vue">Vue</Chip>
<Chip value="svelte">Svelte</Chip>`,
      },
      {
        label: 'Angular',
        lang: 'ts',
        code: `import { Component } from '@angular/core';
import { Chip } from '@arclux/arc-ui-angular';

@Component({
  imports: [Chip],
  template: \`
    <Chip value="react" [selected]="true">React</Chip>
    <Chip value="vue">Vue</Chip>
    <Chip value="svelte">Svelte</Chip>
  \`,
})
export class MyComponent {}`,
      },
      {
        label: 'Solid',
        lang: 'tsx',
        code: `import { Chip } from '@arclux/arc-ui-solid';

<Chip value="react" selected>React</Chip>
<Chip value="vue">Vue</Chip>
<Chip value="svelte">Svelte</Chip>`,
      },
      {
        label: 'Preact',
        lang: 'tsx',
        code: `import { Chip } from '@arclux/arc-ui-preact';

<Chip value="react" selected>React</Chip>
<Chip value="vue">Vue</Chip>
<Chip value="svelte">Svelte</Chip>`,
      },
      {
        label: 'HTML',
        lang: 'html',
        code: `<arc-chip value="react" selected>React</arc-chip>
<arc-chip value="vue">Vue</arc-chip>
<arc-chip value="svelte">Svelte</arc-chip>`,
      },
    ],
  };
