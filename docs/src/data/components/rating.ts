import type { ComponentDef } from './_types';

export const rating: ComponentDef = {
    name: 'Rating',
    slug: 'rating',
    tag: 'arc-rating',
    tier: 'input',
    interactivity: 'interactive',
    description: 'A star-based rating input with hover preview, keyboard navigation, filled/unfilled SVG stars, and configurable max value.',

    overview: `Rating renders a row of interactive SVG stars that let users select a numeric score from 1 to a configurable maximum. Filled stars display in accent-primary with a subtle drop-shadow glow, while unfilled stars appear as outlined shapes in the default border colour. As the user hovers over stars, a preview highlight scales up the hovered star and fills all stars up to that position, giving immediate visual feedback before committing a selection.

The component implements a \`slider\` ARIA role with \`aria-valuenow\`, \`aria-valuemin\`, and \`aria-valuemax\` attributes, making it fully navigable with arrow keys, Home, and End. Arrow right/up increments the value, arrow left/down decrements it, and Home/End jump to the minimum (1) and maximum values respectively. The entire star group is a single tab stop, keeping keyboard navigation efficient within forms.

Rating supports both \`disabled\` and \`readonly\` modes. Disabled reduces opacity to 40% and blocks all interaction, while readonly blocks interaction but maintains full visual fidelity -- useful for displaying existing ratings without allowing changes. The component fires \`arc-change\` with the selected value whenever the user clicks a star or navigates with the keyboard.`,

    features: [
      'Filled stars in accent-primary with `drop-shadow` glow; unfilled stars rendered as outlined SVG paths',
      'Hover preview: stars scale up to 1.15x and fill with accent colour up to the hovered position',
      'Configurable `max` prop to support rating scales beyond the default 5 stars',
      'ARIA `slider` role with `aria-valuenow`, `aria-valuemin`, and `aria-valuemax` for screen readers',
      'Full keyboard navigation: Arrow keys step the value, Home/End jump to min/max',
      'Separate `disabled` (dimmed, no interaction) and `readonly` (full appearance, no interaction) modes',
      'Single tab stop for the entire star group, with internal arrow-key navigation',
      'Fires `arc-change` on click or keyboard selection with `{ value }` in the event detail',
    ],

    guidelines: {
      do: [
        'Use Rating for collecting subjective scores like product reviews, satisfaction, or difficulty levels',
        'Set `readonly` when displaying an existing rating that the user should not change',
        'Pair Rating with a numeric label or text description (e.g. "4 out of 5") for added clarity',
        'Use the default `max="5"` for most use cases -- it is the most universally understood scale',
        'Listen to `arc-change` to update your form state or submit the rating value',
      ],
      dont: [
        'Do not use Rating for binary choices -- use Toggle or Checkbox instead',
        'Do not set `max` higher than 10 -- too many stars become hard to distinguish at a glance',
        'Do not use Rating for precise numeric input -- use Slider or Number Input for exact values',
        'Do not rely on colour alone to distinguish filled and unfilled states -- the SVG fill style also differs',
        'Avoid placing Rating components too close together without labels -- users may confuse which rating applies to which item',
      ],
    },

    previewHtml: `<arc-rating value="3" max="5"></arc-rating>`,

    props: [
      { name: 'value', type: 'number', default: '0', description: 'Current rating value. Reflected as an attribute and updated on user interaction.' },
      { name: 'max', type: 'number', default: '5', description: 'Maximum number of stars to render. Determines the upper bound of the rating scale.' },
      { name: 'disabled', type: 'boolean', default: 'false', description: 'Disables interaction, reducing opacity to 40% and blocking pointer events.' },
      { name: 'readonly', type: 'boolean', default: 'false', description: 'Prevents interaction while maintaining full visual appearance. Useful for displaying existing ratings.' },
    ],
    events: [
      { name: 'arc-change', description: 'Fired when the rating value changes' },
    ],

    tabs: [
      {
        label: 'Web Component',
        lang: 'html',
        code: `<arc-rating value="3" max="5"></arc-rating>`,
      },
      {
        label: 'React',
        lang: 'tsx',
        code: `import { Rating } from '@arclux/arc-ui-react';

<Rating value={3} max={5} />`,
      },
      {
        label: 'Vue',
        lang: 'html',
        code: `<script setup>
import { Rating } from '@arclux/arc-ui-vue';
</script>

<template>
  <Rating :value="3" :max="5" />
</template>`,
      },
      {
        label: 'Svelte',
        lang: 'html',
        code: `<script>
  import { Rating } from '@arclux/arc-ui-svelte';
</script>

<Rating value={3} max={5} />`,
      },
      {
        label: 'Angular',
        lang: 'ts',
        code: `import { Component } from '@angular/core';
import { Rating } from '@arclux/arc-ui-angular';

@Component({
  imports: [Rating],
  template: \`
    <Rating [value]="3" [max]="5"></Rating>
  \`,
})
export class MyComponent {}`,
      },
      {
        label: 'Solid',
        lang: 'tsx',
        code: `import { Rating } from '@arclux/arc-ui-solid';

<Rating value={3} max={5} />`,
      },
      {
        label: 'Preact',
        lang: 'tsx',
        code: `import { Rating } from '@arclux/arc-ui-preact';

<Rating value={3} max={5} />`,
      },
      {
        label: 'HTML',
        lang: 'html',
        code: `<arc-rating value="3" max="5"></arc-rating>`,
      },
    ],
  
  seeAlso: ["slider","icon"],
};
