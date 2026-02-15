import type { ComponentDef } from './_types';

export const buttonGroup: ComponentDef = {
  name: 'Button Group',
  slug: 'button-group',
  tag: 'arc-button-group',
  tier: 'input',
  interactivity: 'hybrid',
  description: 'Connects multiple buttons into a single visual unit with shared borders and collapsed radii. Supports horizontal and vertical orientations.',

  overview: `Button Group joins adjacent buttons into a connected strip where inner border radii are removed and outer buttons retain rounded corners. This creates a unified control that reads as a single element while each button remains independently clickable.

The component automatically overrides the border-radius CSS custom properties on slotted children, giving the first and last child outer radii while removing inner radii. Margins between items are collapsed by -1px to prevent double borders. Both horizontal (default) and vertical orientations are supported.

The \`size\` and \`variant\` props cascade to all child buttons, ensuring consistent sizing and style across the group without setting them individually. This makes it easy to swap the entire group between ghost, outline, and solid styles by changing a single prop.`,

  features: [
    'Automatic border radius management — outer corners rounded, inner corners flat',
    'Collapsed -1px margins to prevent double borders between items',
    'Horizontal and vertical orientations',
    'Cascades `size` and `variant` props to all child buttons',
    'Semantic `role="group"` container',
    'Works with arc-button, arc-icon-button, or any slotted children',
    'Exposed CSS part: group',
  ],

  guidelines: {
    do: [
      'Use for related actions that belong together — e.g., text alignment (Left, Center, Right)',
      'Keep button groups to 2-5 items for readability',
      'Use the vertical orientation for stacked toolbar controls',
      'Set variant on the group instead of individual buttons for consistency',
    ],
    dont: [
      'Mix different button sizes inside a group — use the group `size` prop',
      'Use button groups for navigation — use tabs or segmented control instead',
      'Put destructive actions in the same group as constructive ones without clear visual separation',
    ],
  },

  previewHtml: `<div style="display: flex; flex-direction: column; gap: 16px; align-items: flex-start;">
  <arc-button-group>
    <arc-button variant="ghost">Left</arc-button>
    <arc-button variant="ghost">Center</arc-button>
    <arc-button variant="ghost">Right</arc-button>
  </arc-button-group>
  <arc-button-group orientation="vertical">
    <arc-button variant="ghost">Top</arc-button>
    <arc-button variant="ghost">Middle</arc-button>
    <arc-button variant="ghost">Bottom</arc-button>
  </arc-button-group>
</div>`,

  props: [
    { name: 'orientation', type: "'horizontal' | 'vertical'", default: "'horizontal'", description: 'Layout direction. Vertical stacks buttons top-to-bottom.' },
    { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Size cascaded to all child buttons.' },
    { name: 'variant', type: 'string', default: "''", description: 'Button variant cascaded to all children (e.g., "ghost", "outline").' },
  ],

  tabs: [
    {
      label: 'Web Component',
      lang: 'html',
      code: `<arc-button-group>
  <arc-button variant="ghost">Left</arc-button>
  <arc-button variant="ghost">Center</arc-button>
  <arc-button variant="ghost">Right</arc-button>
</arc-button-group>

<!-- Vertical -->
<arc-button-group orientation="vertical" size="sm">
  <arc-button variant="ghost">Top</arc-button>
  <arc-button variant="ghost">Bottom</arc-button>
</arc-button-group>`,
    },
    {
      label: 'React',
      lang: 'tsx',
      code: `import { ButtonGroup, Button } from '@arclux/arc-ui-react';

<ButtonGroup>
  <Button variant="ghost">Left</Button>
  <Button variant="ghost">Center</Button>
  <Button variant="ghost">Right</Button>
</ButtonGroup>`,
    },
    {
      label: 'Vue',
      lang: 'html',
      code: `<script setup>
import { ButtonGroup, Button } from '@arclux/arc-ui-vue';
</script>

<template>
  <ButtonGroup>
    <Button variant="ghost">Left</Button>
    <Button variant="ghost">Center</Button>
    <Button variant="ghost">Right</Button>
  </ButtonGroup>
</template>`,
    },
    {
      label: 'Svelte',
      lang: 'html',
      code: `<script>
  import { ButtonGroup, Button } from '@arclux/arc-ui-svelte';
</script>

<ButtonGroup>
  <Button variant="ghost">Left</Button>
  <Button variant="ghost">Center</Button>
  <Button variant="ghost">Right</Button>
</ButtonGroup>`,
    },
    {
      label: 'Angular',
      lang: 'ts',
      code: `import { Component } from '@angular/core';
import { ButtonGroup, Button } from '@arclux/arc-ui-angular';

@Component({
  imports: [ButtonGroup, Button],
  template: \`
    <ButtonGroup>
      <Button variant="ghost">Left</Button>
      <Button variant="ghost">Center</Button>
      <Button variant="ghost">Right</Button>
    </ButtonGroup>
  \`,
})
export class ToolbarComponent {}`,
    },
    {
      label: 'Solid',
      lang: 'tsx',
      code: `import { ButtonGroup, Button } from '@arclux/arc-ui-solid';

<ButtonGroup>
  <Button variant="ghost">Left</Button>
  <Button variant="ghost">Center</Button>
  <Button variant="ghost">Right</Button>
</ButtonGroup>`,
    },
    {
      label: 'Preact',
      lang: 'tsx',
      code: `import { ButtonGroup, Button } from '@arclux/arc-ui-preact';

<ButtonGroup>
  <Button variant="ghost">Left</Button>
  <Button variant="ghost">Center</Button>
  <Button variant="ghost">Right</Button>
</ButtonGroup>`,
    },
    {
      label: 'HTML',
      lang: 'html',
      code: `<!-- Auto-generated by @arclux/prism — do not edit manually -->
<!-- arc-button-group — requires button-group.css + base.css (or arc-ui.css) -->
<div class="arc-button-group">
  <div class="button-group" role="group">
    <!-- buttons here -->
  </div>
</div>`,
    },
    {
      label: 'HTML (Inline)',
      lang: 'html',
      code: `<!-- Auto-generated by @arclux/prism — do not edit manually -->
<div style="display: inline-flex">
  <div style="display: inline-flex; border-radius: 10px; overflow: hidden;" role="group">
    <!-- buttons here -->
  </div>
</div>`,
    },
  ],

  seeAlso: ['button', 'icon-button', 'toolbar', 'segmented-control'],
};
