import type { ComponentDef } from './_types';

export const colorPicker: ComponentDef = {
  name: 'Color Picker',
  slug: 'color-picker',
  tag: 'arc-color-picker',
  tier: 'input',
  interactivity: 'interactive',
  description:
    'Picks any color from a drag area or a typed hex value.',

  overview: `ColorPicker has a saturation/lightness area where users click or drag a crosshair, a hue slider across the full 360 degrees under it, and a hex input with a preview swatch for typing a known color. Pass a \`presets\` array and a row of swatches appears under the hex input, with the active one outlined in the primary text color. Use presets for a brand palette or frequent colors. The area still allows any color.

\`arc-input\` fires on every frame of a drag across the area or the hue slider, so use it for a live preview. \`arc-change\` fires once the color is committed (pointer released, preset clicked, or a valid hex entered), so use it for anything expensive, like a save. Both carry the hex string.`,

  features: [
    'Values go in and come out as 6-digit hex strings. The HSL conversion happens inside',
    'The hex input checks its value on blur or Enter. An invalid value reverts to the current color',
    'Dragging uses `setPointerCapture`, so a drag keeps working when the pointer leaves the area',
    'Disabled pickers drop to 50% opacity and ignore the pointer',
  ],

  guidelines: {
    do: [
      'Set a `label`, especially when there\'s more than one picker on the page',
      'Set the initial color with `value` in 6-digit hex (for example `#4d7ef7`)',
      'Put the picker in a popover or dropdown when horizontal space is tight',
    ],
    dont: [
      'Don\'t pass 3-digit hex shorthand (`#f00`). The component expects all six digits',
      'Don\'t use it when users choose from a fixed set. Use a select or a radio group',
      'Don\'t give it more than about 20 presets. The row wraps and gets crowded',
      'Don\'t put it in a container narrower than 260px. The area and the slider need the room',
    ],
  },

  previewHtml: `<arc-color-picker
  label="Brand color"
  value="#4d7ef7"
></arc-color-picker>`,

  previewSetup: `document.querySelector('arc-color-picker').presets = ['#4d7ef7', '#22c55e', '#ef4444', '#eab308', '#a855f7', '#06b6d4'];`,

  tabs: [
    {
      label: 'Web Component',
      lang: 'html',
      code: `<arc-color-picker
  label="Theme Color"
  value="#4d7ef7"
></arc-color-picker>

<script>
  const picker = document.querySelector('arc-color-picker');
  picker.presets = ['#4d7ef7', '#22c55e', '#ef4444', '#eab308'];
  // Live preview — fires on every drag frame
  picker.addEventListener('arc-input', e => {
    document.documentElement.style.setProperty('--accent-primary', e.detail.value);
  });
  // Committed color — fires once on release
  picker.addEventListener('arc-change', e => {
    console.log('Committed:', e.detail.value);
  });
</script>`,
    },
    {
      label: 'React',
      lang: 'tsx',
      code: `import { ColorPicker } from '@arclux/arc-ui-react';

export default function Example() {
  return (
    <ColorPicker
      label="Theme Color"
      value="#4d7ef7"
      presets={['#4d7ef7', '#22c55e', '#ef4444', '#eab308']}
      onArcInput={(e) => console.log('Live:', e.detail.value)}
      onArcChange={(e) => console.log('Committed:', e.detail.value)}
    />
  );
}`,
    },
    {
      label: 'Vue',
      lang: 'html',
      code: `<script setup>
import { ColorPicker } from '@arclux/arc-ui-vue';

const presets = ['#4d7ef7', '#22c55e', '#ef4444', '#eab308'];
</script>

<template>
  <ColorPicker
    label="Theme Color"
    value="#4d7ef7"
    :presets="presets"
    @arc-input="(e) => console.log('Live:', e.detail.value)"
    @arc-change="(e) => console.log('Committed:', e.detail.value)"
  />
</template>`,
    },
    {
      label: 'Svelte',
      lang: 'html',
      code: `<script>
  import { ColorPicker } from '@arclux/arc-ui-svelte';

  const presets = ['#4d7ef7', '#22c55e', '#ef4444', '#eab308'];
</script>

<ColorPicker
  label="Theme Color"
  value="#4d7ef7"
  {presets}
  on:arc-input={(e) => console.log('Live:', e.detail.value)}
  on:arc-change={(e) => console.log('Committed:', e.detail.value)}
/>`,
    },
    {
      label: 'Angular',
      lang: 'ts',
      code: `import { Component } from '@angular/core';
import { ColorPicker } from '@arclux/arc-ui-angular';

@Component({
  imports: [ColorPicker],
  template: \`
    <arc-color-picker
      label="Theme Color"
      value="#4d7ef7"
      [presets]="presets"
      (arc-input)="onPreview($event)"
      (arc-change)="onPick($event)"
    ></arc-color-picker>
  \`,
})
export class MyComponent {
  presets = ['#4d7ef7', '#22c55e', '#ef4444', '#eab308'];

  onPreview(e: CustomEvent) {
    console.log('Live:', e.detail.value);
  }

  onPick(e: CustomEvent) {
    console.log('Committed:', e.detail.value);
  }
}`,
    },
    {
      label: 'Solid',
      lang: 'tsx',
      code: `import { ColorPicker } from '@arclux/arc-ui-solid';

export default function Example() {
  return (
    <ColorPicker
      label="Theme Color"
      value="#4d7ef7"
      presets={['#4d7ef7', '#22c55e', '#ef4444', '#eab308']}
      onArcInput={(e) => console.log('Live:', e.detail.value)}
      onArcChange={(e) => console.log('Committed:', e.detail.value)}
    />
  );
}`,
    },
    {
      label: 'Preact',
      lang: 'tsx',
      code: `import { ColorPicker } from '@arclux/arc-ui-preact';

export default function Example() {
  return (
    <ColorPicker
      label="Theme Color"
      value="#4d7ef7"
      presets={['#4d7ef7', '#22c55e', '#ef4444', '#eab308']}
      onArcInput={(e) => console.log('Live:', e.detail.value)}
      onArcChange={(e) => console.log('Committed:', e.detail.value)}
    />
  );
}`,
    },
  ],

  seeAlso: ['color-swatch', 'input'],
};
