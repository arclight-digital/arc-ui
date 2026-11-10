import type { ComponentDef } from './_types';

export const blockquote: ComponentDef = {
  name: 'Blockquote',
  slug: 'blockquote',
  tag: 'arc-blockquote',
  tier: 'typography',
  interactivity: 'static',
  description: 'Styled pull-quote with optional citation for editorial emphasis.',

  overview: `Blockquote is a pull-quote: a semantic \`<blockquote>\` with a gradient line across the top, a large opening-quote glyph and a faint accent tint behind it. Use it for quotations and testimonials.

The quote text is italic. The default variant sets it in the primary text color, and the \`accent\` variant fills it with the accent gradient. Set \`cite\` and the attribution appears underneath in a \`<footer>\`, in small uppercase muted type after an em dash.`,

  features: [
    'The top line and the quote glyph are `::before` and `::after` pseudo-elements, so the markup is just the blockquote, the quote and the citation',
  ],

  guidelines: {
    do: [
      'Set cite whenever you know who said it',
      'Use the accent variant for one key quote on a page',
      'Keep quotes to one to three sentences',
      'Combine with Text and Card in editorial layouts',
    ],
    dont: [
      'Don\'t use it as a general content box. Use Alert (`variant="tip"`) or Card',
      'Don\'t put several accent-variant quotes on one page',
    ],
  },

  previewHtml: `<arc-blockquote cite="Grace Hopper" variant="accent">The most dangerous phrase in the language is: we have always done it this way.</arc-blockquote>`,

  tabs: [
    {
      label: 'Web Component',
      lang: 'html',
      code: `<arc-blockquote cite="Grace Hopper">
  The most dangerous phrase in the language is:
  we have always done it this way.
</arc-blockquote>

<arc-blockquote variant="accent" cite="Alan Kay">
  The best way to predict the future is to invent it.
</arc-blockquote>`,
    },
    {
      label: 'React',
      lang: 'tsx',
      code: `import { Blockquote } from '@arclux/arc-ui-react';

export default function Example() {
  return (
    <>
      <Blockquote cite="Grace Hopper">
        The most dangerous phrase in the language is:
        we have always done it this way.
      </Blockquote>

      <Blockquote variant="accent" cite="Alan Kay">
        The best way to predict the future is to invent it.
      </Blockquote>
    </>
  );
}`,
    },
    {
      label: 'Vue',
      lang: 'html',
      code: `<script setup>
import { Blockquote } from '@arclux/arc-ui-vue';
</script>

<template>
  <Blockquote cite="Grace Hopper">
    The most dangerous phrase in the language is:
    we have always done it this way.
  </Blockquote>

  <Blockquote variant="accent" cite="Alan Kay">
    The best way to predict the future is to invent it.
  </Blockquote>
</template>`,
    },
    {
      label: 'Svelte',
      lang: 'html',
      code: `<script>
  import { Blockquote } from '@arclux/arc-ui-svelte';
</script>

<Blockquote cite="Grace Hopper">
  The most dangerous phrase in the language is:
  we have always done it this way.
</Blockquote>

<Blockquote variant="accent" cite="Alan Kay">
  The best way to predict the future is to invent it.
</Blockquote>`,
    },
    {
      label: 'Angular',
      lang: 'ts',
      code: `import { Component } from '@angular/core';
import { Blockquote } from '@arclux/arc-ui-angular';

@Component({
  imports: [Blockquote],
  template: \`
    <arc-blockquote cite="Grace Hopper">
      The most dangerous phrase in the language is:
      we have always done it this way.
    </arc-blockquote>

    <arc-blockquote variant="accent" cite="Alan Kay">
      The best way to predict the future is to invent it.
    </arc-blockquote>
  \`,
})
export class MyComponent {}`,
    },
    {
      label: 'Solid',
      lang: 'tsx',
      code: `import { Blockquote } from '@arclux/arc-ui-solid';

export default function Example() {
  return (
    <>
      <Blockquote cite="Grace Hopper">
        The most dangerous phrase in the language is:
        we have always done it this way.
      </Blockquote>

      <Blockquote variant="accent" cite="Alan Kay">
        The best way to predict the future is to invent it.
      </Blockquote>
    </>
  );
}`,
    },
    {
      label: 'Preact',
      lang: 'tsx',
      code: `import { Blockquote } from '@arclux/arc-ui-preact';

export default function Example() {
  return (
    <>
      <Blockquote cite="Grace Hopper">
        The most dangerous phrase in the language is:
        we have always done it this way.
      </Blockquote>

      <Blockquote variant="accent" cite="Alan Kay">
        The best way to predict the future is to invent it.
      </Blockquote>
    </>
  );
}`,
    },
  ],

  seeAlso: ['text', 'alert', 'card'],
};
