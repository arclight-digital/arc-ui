import type { ComponentDef } from './_types';

export const blockquote: ComponentDef = {
    name: 'Blockquote',
    slug: 'blockquote',
    tag: 'arc-blockquote',
    tier: 'typography',
    interactivity: 'static',
    description: 'Styled pull-quote with optional citation for editorial emphasis.',

    overview: `Blockquote is a typographic component for presenting quotations, testimonials, and editorial callouts with visual distinction. It renders a semantic \`<blockquote>\` element wrapped in a dark-themed container with a subtle gradient accent line across the top edge and a large decorative opening-quote glyph.

The default variant displays quote text in the primary text colour with an italic style, while the \`accent\` variant renders the quote text with a gradient fill derived from the accent token system. Both variants include an optional citation footer that appears beneath the quote in small, uppercase, accented type prefixed with an em dash.

The component uses CSS parts (\`blockquote\`, \`quote\`, \`cite\`) for fine-grained external style overrides. The top gradient line and decorative quote mark are rendered with pseudo-elements, keeping the DOM minimal and the markup semantic.`,

    features: [
        'Semantic <blockquote> element with optional <footer> citation',
        'Top gradient accent line via ::before pseudo-element (no left-border pattern)',
        'Decorative opening-quote glyph rendered with ::after pseudo-element',
        'Two variants: default (standard text) and accent (gradient text fill)',
        'Optional cite prop for attribution with em dash prefix and uppercase styling',
        'CSS parts (blockquote, quote, cite) for external style overrides',
        'Subtle rgba background tint derived from accent-primary token',
        'prefers-reduced-motion support disables transitions and animations',
    ],

    guidelines: {
        do: [
            'Use for editorial pull-quotes, testimonials, and highlighted excerpts',
            'Provide a cite attribute when the source or author is known',
            'Use the accent variant sparingly to highlight a single key quote on a page',
            'Keep quote content concise - one to three sentences works best',
            'Pair with Text and Card components for rich editorial layouts',
        ],
        dont: [
            'Use Blockquote for generic content boxes - use Callout or Card instead',
            'Stack multiple accent-variant blockquotes on the same page',
            'Use overly long quotations that would be better served by inline text',
            'Remove the cite attribute if the quote has a known author',
            'Nest blockquotes inside other blockquotes',
        ],
    },

    previewHtml: `<arc-blockquote cite="Grace Hopper" variant="accent">The most dangerous phrase in the language is: we have always done it this way.</arc-blockquote>`,

    props: [
        { name: 'cite', type: 'string', default: "''", description: 'Citation or attribution text displayed beneath the quote with an em dash prefix' },
        { name: 'variant', type: "'default' | 'accent'", default: "'default'", description: 'Visual variant. Accent applies a gradient text fill to the quote content.' },
    ],

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

<Blockquote cite="Grace Hopper">
  The most dangerous phrase in the language is:
  we have always done it this way.
</Blockquote>

<Blockquote variant="accent" cite="Alan Kay">
  The best way to predict the future is to invent it.
</Blockquote>`,
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
    <Blockquote cite="Grace Hopper">
      The most dangerous phrase in the language is:
      we have always done it this way.
    </Blockquote>

    <Blockquote variant="accent" cite="Alan Kay">
      The best way to predict the future is to invent it.
    </Blockquote>
  \`,
})
export class MyComponent {}`,
        },
        {
            label: 'Solid',
            lang: 'tsx',
            code: `import { Blockquote } from '@arclux/arc-ui-solid';

<Blockquote cite="Grace Hopper">
  The most dangerous phrase in the language is:
  we have always done it this way.
</Blockquote>

<Blockquote variant="accent" cite="Alan Kay">
  The best way to predict the future is to invent it.
</Blockquote>`,
        },
        {
            label: 'Preact',
            lang: 'tsx',
            code: `import { Blockquote } from '@arclux/arc-ui-preact';

<Blockquote cite="Grace Hopper">
  The most dangerous phrase in the language is:
  we have always done it this way.
</Blockquote>

<Blockquote variant="accent" cite="Alan Kay">
  The best way to predict the future is to invent it.
</Blockquote>`,
        },
    ],

    seeAlso: ['text', 'callout', 'card'],
};
