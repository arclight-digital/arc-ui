import type { ComponentDef } from './_types';

export const collapsible: ComponentDef = {
  name: 'Collapsible',
  slug: 'collapsible',
  tag: 'arc-collapsible',
  tier: 'content',
  interactivity: 'interactive',
  description: 'A heading that shows and hides the content under it when clicked.',

  overview: `Collapsible is one section that opens and closes when you click its heading. Accordion manages several panels and closes the others. Collapsible stands alone, for optional details, advanced settings or extra information the user may not need straight away. Unlike Accordion, its body is a real slot, so it takes any markup.

The heading is a \`<button>\` with \`aria-expanded\`, so Enter and Space toggle it. The body is a \`region\` labeled with the heading text. \`open\` is reflected, so you can set it in HTML or change it from code. \`arc-toggle\` fires with \`{ open }\` when the user toggles the section, not when code sets \`open\`.`,

  features: [
    'Height animates with a `grid-template-rows` transition from `0fr` to `1fr`, with no JavaScript measuring',
    'The chevron at the right of the heading turns 90 degrees when the section opens',
    'The heading row takes the `--surface-overlay` background on hover and gets an inset focus ring when focused from the keyboard',
  ],

  guidelines: {
    do: [
      "Write a heading that says what's inside",
      'Set open in the HTML when the content should show on first render',
      'Stack several Collapsibles for FAQ sections where more than one can be open',
      'Listen to arc-toggle if you want to remember the state between visits',
    ],
    dont: [
      "Don't hide content users must see",
      "Don't use it when only one section should be open at a time. Use Accordion",
      "Don't put very tall content inside without a scrolling wrapper. Opening it pushes the page around",
    ],
  },

  previewHtml: `<arc-collapsible heading="Advanced options" open>
  <p>These settings control fine-grained behavior that most users will not need to change.</p>
</arc-collapsible>`,

  tabs: [
    {
      label: 'Web Component',
      lang: 'html',
      code: `<arc-collapsible heading="More Details">
  <p>Hidden content revealed on click.</p>
</arc-collapsible>`,
    },
    {
      label: 'React',
      lang: 'tsx',
      code: `import { Collapsible } from '@arclux/arc-ui-react';

export default function Example() {
  return (
    <Collapsible heading="More Details">
      <p>Hidden content revealed on click.</p>
    </Collapsible>
  );
}`,
    },
    {
      label: 'Vue',
      lang: 'html',
      code: `<script setup>
import { Collapsible } from '@arclux/arc-ui-vue';
</script>

<template>
  <Collapsible heading="More Details">
    <p>Hidden content revealed on click.</p>
  </Collapsible>
</template>`,
    },
    {
      label: 'Svelte',
      lang: 'html',
      code: `<script>
  import { Collapsible } from '@arclux/arc-ui-svelte';
</script>

<Collapsible heading="More Details">
  <p>Hidden content revealed on click.</p>
</Collapsible>`,
    },
    {
      label: 'Angular',
      lang: 'ts',
      code: `import { Component } from '@angular/core';
import { Collapsible } from '@arclux/arc-ui-angular';

@Component({
  imports: [Collapsible],
  template: \`
    <arc-collapsible heading="More Details">
      <p>Hidden content revealed on click.</p>
    </arc-collapsible>
  \`,
})
export class MyComponent {}`,
    },
    {
      label: 'Solid',
      lang: 'tsx',
      code: `import { Collapsible } from '@arclux/arc-ui-solid';

export default function Example() {
  return (
    <Collapsible heading="More Details">
      <p>Hidden content revealed on click.</p>
    </Collapsible>
  );
}`,
    },
    {
      label: 'Preact',
      lang: 'tsx',
      code: `import { Collapsible } from '@arclux/arc-ui-preact';

export default function Example() {
  return (
    <Collapsible heading="More Details">
      <p>Hidden content revealed on click.</p>
    </Collapsible>
  );
}`,
    },
  ],

  seeAlso: ['accordion', 'tree-view'],
};
