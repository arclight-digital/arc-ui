import type { ComponentDef } from './_types';

export const colorPicker: ComponentDef = {
  name: 'Color Picker',
  slug: 'color-picker',
  tag: 'arc-color-picker',
  tier: 'input',
  interactivity: 'interactive',
  description:
    'Full-featured color picker with a saturation/lightness area, hue slider, hex input, and optional preset swatches.',

  overview: `ColorPicker provides a compact, self-contained interface for selecting any color through multiple input methods. The main interaction area is a rectangular saturation/lightness gradient where users click or drag a crosshair to set the color. Below it, a horizontal hue slider lets users rotate through the full 360-degree color wheel. A hex input with a live color preview swatch rounds out the control, allowing direct entry of known color values.

When preset colors are provided via the \`presets\` array prop, the component renders a row of clickable swatches beneath the hex input. The active preset is highlighted with a primary-colored border. This is ideal for brand color palettes or frequently used colors, giving users quick one-click access while still allowing full custom selection through the gradient area.

ColorPicker performs all HSL-to-hex conversion internally. It fires \`arc-input\` continuously as the color changes — every frame of a drag across the area or the hue track — which is the event to drive a live preview. \`arc-change\` fires once the color is committed: the pointer released after a drag, a preset clicked, or a valid hex entered — the event for anything expensive, like a save. Both carry the hex string in the event detail.`,

  features: [
    'Saturation/lightness gradient area with crosshair cursor and pointer-drag interaction',
    'Horizontal hue slider spanning the full 0-360 degree spectrum with a draggable thumb',
    'Live color preview swatch adjacent to an editable hex input field',
    'Preset color swatches rendered from an array prop with active-state border highlighting',
    'Internal HSL-to-hex and hex-to-HSL conversion — all values emitted as hex strings',
    'Hex input validates on blur; invalid values revert to the current color',
    'Touch-friendly pointer events with `setPointerCapture` for smooth mobile dragging',
    'Disabled state at 40% opacity with pointer events blocked',
  ],

  guidelines: {
    do: [
      'Provide a `label` to give the picker context, especially when multiple pickers appear on the same page',
      'Pass a `presets` array for brand palettes or commonly used colors to speed up selection',
      'Use the `value` prop to set an initial color in 6-digit hex format (e.g. `#4d7ef7`)',
      'Listen for `arc-input` to update a live preview while the user drags, and `arc-change` for the committed color on release',
      'Place the picker inside a popover or dropdown if horizontal space is constrained',
    ],
    dont: [
      'Do not pass 3-digit hex shorthand (e.g. `#f00`) — the component expects the full 6-digit format',
      'Do not use ColorPicker when the user only needs to choose from a fixed set of options — use a select or radio group instead',
      'Do not provide more than ~20 preset swatches — the row wraps and can become visually overwhelming',
      'Do not rely on color alone to convey meaning — pair with labels or icons for accessibility',
      'Avoid placing the picker in very narrow containers under 260px wide — the area and slider need room',
    ],
  },

  previewHtml: `<arc-color-picker
  label="Brand Color"
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
