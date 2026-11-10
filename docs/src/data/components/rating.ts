import type { ComponentDef } from './_types';

export const rating: ComponentDef = {
  name: 'Rating',
  slug: 'rating',
  tag: 'arc-rating',
  tier: 'input',
  interactivity: 'interactive',
  description:
    'A row of SVG stars for picking a score from 1 to max, with a hover preview and keyboard control.',

  overview: `Rating renders \`max\` stars (5 by default) for scores like a product review or a satisfaction survey. Filled stars use the accent color with a glow, and empty stars are outlines. Hovering fills every star up to the one under the pointer, so you see the score before you click.

A value of 0 means unrated. It's the starting value, it submits nothing, and screen readers hear "No rating". Clicking the star that's already selected clears the rating back to 0.

The star group is one tab stop with the \`slider\` role. Arrow right or up adds a star, arrow left or down removes one, Home clears to 0, and End jumps to \`max\`. Every change from a click or a key fires \`arc-change\` with \`{ value }\`.

\`disabled\` dims the stars to 50% and blocks input. \`readonly\` blocks input but leaves the stars at full strength, for showing a rating someone already gave.`,

  features: [
    '`aria-valuetext` reads "3 of 5", or "No rating" at 0',
    '`label` sets the accessible name, which defaults to "Rating"',
  ],

  guidelines: {
    do: [
      'Set `readonly` to show an existing rating',
      'Show the score as text next to the stars, for example "4 out of 5"',
      'Give each rating its own `label` when a page has more than one',
    ],
    dont: [
      'Don\'t use it for yes-or-no choices. Use Toggle or Checkbox',
      'Don\'t set `max` above 10. Past that, people can\'t count the stars without reading them one by one',
      'Don\'t use it for exact numbers. Use Slider or NumberInput',
    ],
  },

  previewHtml: `<arc-rating value="3" max="5"></arc-rating>`,

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

export default function Example() {
  return (
    <Rating value={3} max={5} />
  );
}`,
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
    <arc-rating [value]="3" [max]="5"></arc-rating>
  \`,
})
export class MyComponent {}`,
    },
    {
      label: 'Solid',
      lang: 'tsx',
      code: `import { Rating } from '@arclux/arc-ui-solid';

export default function Example() {
  return (
    <Rating value={3} max={5} />
  );
}`,
    },
    {
      label: 'Preact',
      lang: 'tsx',
      code: `import { Rating } from '@arclux/arc-ui-preact';

export default function Example() {
  return (
    <Rating value={3} max={5} />
  );
}`,
    },
  ],

  seeAlso: ['slider', 'icon'],
};
