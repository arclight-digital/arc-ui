import type { ComponentDef } from './_types';

export const accordion: ComponentDef = {
  name: 'Accordion',
  slug: 'accordion',
  tag: 'arc-accordion',
  tier: 'content',
  interactivity: 'hybrid',
  status: 'stable',
  description:
    'Expandable content sections with smooth height animations. Ideal for FAQs, settings panels, and any UI that benefits from progressive disclosure.',

  overview: `The Accordion component organises related content into collapsible sections, letting users focus on one topic at a time without leaving the page. Each section header acts as a toggle that smoothly reveals or hides its body content using a CSS grid animation — no JavaScript-driven height calculations required.

Use Accordion when you have multiple blocks of content that are individually useful but would overwhelm the user if shown all at once. Common scenarios include FAQ pages, product feature breakdowns, configuration panels, and documentation side-notes. Because each item is a lightweight \`<arc-accordion-item>\` element, content is authored declaratively in markup rather than passed as a data array.

The component is fully accessible out of the box: trigger buttons carry \`aria-expanded\` state, keyboard navigation works via standard focus management, and the chevron indicator rotates to reinforce visual state. Animations respect \`prefers-reduced-motion\` when set at the OS level.`,

  features: [
    'Smooth CSS grid-based expand/collapse animation (no JS height calc)',
    'Multi-open by default — users can expand several items simultaneously',
    'Declarative content via <arc-accordion-item> children with a question attribute',
    'Slotted answer content supports rich HTML, not just plain text',
    'Accessible: aria-expanded on triggers, keyboard-focusable, visible focus ring',
    'Animated chevron rotates 180 degrees to indicate open/closed state',
    'Respects design tokens for colors, spacing, radii, and transitions',
    'Rounded container with subtle 1px gap separating items',
  ],

  guidelines: {
    do: [
      'Use short, scannable headings so users can locate the right section quickly',
      'Keep answer content concise — link out to full docs for lengthy topics',
      'Place the most frequently asked question first to reduce scrolling',
      'Wrap the accordion in a max-width container for comfortable line lengths',
      'Use Accordion for content that benefits from progressive disclosure, such as FAQs or settings',
    ],
    dont: [
      'Do not nest an Accordion inside another Accordion — it harms scannability',
      'Do not use Accordion as a replacement for Tabs when users need to compare sections side-by-side',
      'Do not hide critical information (e.g. pricing, legal disclaimers) inside collapsed items — it may go unseen',
      'Do not set every item to open by default — this defeats the purpose of progressive disclosure',
      'Do not use Accordion for a single item — use a Disclosure or collapsible card instead',
    ],
  },

  previewHtml: `<div style="width:100%">
  <arc-accordion>
    <arc-accordion-item question="What is ARC UI and which frameworks does it support?">
      ARC UI is a framework-agnostic component library built on Lit web components.
      It ships first-class wrappers for React, Vue, Svelte, Angular, Solid, and Preact,
      so you can use the same design system regardless of your framework choice.
    </arc-accordion-item>
    <arc-accordion-item question="How do I theme ARC UI components?">
      Every component reads from a shared set of CSS custom properties defined in the
      ARC UI token system. Override the tokens at any scope — :root for global changes,
      or a wrapper element for localised theming — and all components update automatically.
    </arc-accordion-item>
    <arc-accordion-item question="Can I use individual components without importing the whole library?">
      Yes. Each component is published as a standalone module. Import only what you need —
      for example, import '@arclux/arc-ui/reactive/accordion.js' — and your bundler
      will tree-shake everything else away.
    </arc-accordion-item>
  </arc-accordion>
</div>`,

  props: [
    {
      name: 'multiple',
      type: 'boolean',
      default: 'false',
      description: 'When true, allows multiple accordion panels to be open simultaneously. When false (default), opening one panel closes any other open panel.',
    },
  ],

  subComponents: [
    {
      name: 'AccordionItem',
      tag: 'arc-accordion-item',
      description:
        'An individual collapsible section inside an Accordion. The question attribute supplies the clickable header text, and slotted children become the expandable body content.',
      props: [
        {
          name: 'question',
          type: 'string',
          description:
            'The heading text displayed on the trigger button. Should be a concise, scannable label or question.',
        },
        {
          name: 'open',
          type: 'boolean',
          default: 'false',
          description:
            'Controls whether this item is expanded. When true the body content is visible and the chevron points downward.',
        },
      ],
    },
  ],

  tabs: [
    {
      label: 'Web Component',
      lang: 'html',
      code: `<arc-accordion>
  <arc-accordion-item question="What is ARC UI?">
    A framework-agnostic component library built with Lit web components,
    with first-class wrappers for React, Vue, Svelte, Angular, Solid, and Preact.
  </arc-accordion-item>
  <arc-accordion-item question="How do I theme components?">
    Override the CSS custom-property tokens at any scope and every
    component updates automatically.
  </arc-accordion-item>
  <arc-accordion-item question="Can I tree-shake unused components?">
    Yes — import only the modules you need and your bundler will
    eliminate everything else.
  </arc-accordion-item>
</arc-accordion>`,
    },
    {
      label: 'React',
      lang: 'tsx',
      code: `import { Accordion, AccordionItem } from '@arclux/arc-ui-react';

export default function FAQ() {
  return (
    <Accordion>
      <AccordionItem question="What is ARC UI?">
        A framework-agnostic component library built with Lit web components,
        with first-class wrappers for React, Vue, Svelte, Angular, Solid, and Preact.
      </AccordionItem>
      <AccordionItem question="How do I theme components?">
        Override the CSS custom-property tokens at any scope and every
        component updates automatically.
      </AccordionItem>
      <AccordionItem question="Can I tree-shake unused components?">
        Yes — import only the modules you need and your bundler will
        eliminate everything else.
      </AccordionItem>
    </Accordion>
  );
}`,
    },
    {
      label: 'Vue',
      lang: 'html',
      code: `<script setup>
import { Accordion, AccordionItem } from '@arclux/arc-ui-vue';
</script>

<template>
  <Accordion>
    <AccordionItem question="What is ARC UI?">
      A framework-agnostic component library built with Lit web components,
      with first-class wrappers for React, Vue, Svelte, Angular, Solid, and Preact.
    </AccordionItem>
    <AccordionItem question="How do I theme components?">
      Override the CSS custom-property tokens at any scope and every
      component updates automatically.
    </AccordionItem>
    <AccordionItem question="Can I tree-shake unused components?">
      Yes — import only the modules you need and your bundler will
      eliminate everything else.
    </AccordionItem>
  </Accordion>
</template>`,
    },
    {
      label: 'Svelte',
      lang: 'html',
      code: `<script>
  import { Accordion, AccordionItem } from '@arclux/arc-ui-svelte';
</script>

<Accordion>
  <AccordionItem question="What is ARC UI?">
    A framework-agnostic component library built with Lit web components,
    with first-class wrappers for React, Vue, Svelte, Angular, Solid, and Preact.
  </AccordionItem>
  <AccordionItem question="How do I theme components?">
    Override the CSS custom-property tokens at any scope and every
    component updates automatically.
  </AccordionItem>
  <AccordionItem question="Can I tree-shake unused components?">
    Yes — import only the modules you need and your bundler will
    eliminate everything else.
  </AccordionItem>
</Accordion>`,
    },
    {
      label: 'Angular',
      lang: 'ts',
      code: `import { Component } from '@angular/core';
import { Accordion, AccordionItem } from '@arclux/arc-ui-angular';

@Component({
  imports: [Accordion, AccordionItem],
  template: \`
    <arc-accordion>
      <arc-accordion-item question="What is ARC UI?">
        A framework-agnostic component library built with Lit web components,
        with first-class wrappers for React, Vue, Svelte, Angular, Solid, and Preact.
      </arc-accordion-item>
      <arc-accordion-item question="How do I theme components?">
        Override the CSS custom-property tokens at any scope and every
        component updates automatically.
      </arc-accordion-item>
      <arc-accordion-item question="Can I tree-shake unused components?">
        Yes — import only the modules you need and your bundler will
        eliminate everything else.
      </arc-accordion-item>
    </arc-accordion>
  \`,
})
export class FaqComponent {}`,
    },
    {
      label: 'Solid',
      lang: 'tsx',
      code: `import { Accordion, AccordionItem } from '@arclux/arc-ui-solid';

export default function FAQ() {
  return (
    <Accordion>
      <AccordionItem question="What is ARC UI?">
        A framework-agnostic component library built with Lit web components,
        with first-class wrappers for React, Vue, Svelte, Angular, Solid, and Preact.
      </AccordionItem>
      <AccordionItem question="How do I theme components?">
        Override the CSS custom-property tokens at any scope and every
        component updates automatically.
      </AccordionItem>
      <AccordionItem question="Can I tree-shake unused components?">
        Yes — import only the modules you need and your bundler will
        eliminate everything else.
      </AccordionItem>
    </Accordion>
  );
}`,
    },
    {
      label: 'Preact',
      lang: 'tsx',
      code: `import { Accordion, AccordionItem } from '@arclux/arc-ui-preact';

export default function FAQ() {
  return (
    <Accordion>
      <AccordionItem question="What is ARC UI?">
        A framework-agnostic component library built with Lit web components,
        with first-class wrappers for React, Vue, Svelte, Angular, Solid, and Preact.
      </AccordionItem>
      <AccordionItem question="How do I theme components?">
        Override the CSS custom-property tokens at any scope and every
        component updates automatically.
      </AccordionItem>
      <AccordionItem question="Can I tree-shake unused components?">
        Yes — import only the modules you need and your bundler will
        eliminate everything else.
      </AccordionItem>
    </Accordion>
  );
}`,
    },
    {
      label: 'HTML',
      lang: 'html',
      code: `<arc-accordion>
  <arc-accordion-item question="What is ARC UI?">
    A framework-agnostic component library built with Lit web components,
    with first-class wrappers for React, Vue, Svelte, Angular, Solid, and Preact.
  </arc-accordion-item>
  <arc-accordion-item question="How do I theme components?">
    Override the CSS custom-property tokens at any scope and every
    component updates automatically.
  </arc-accordion-item>
  <arc-accordion-item question="Can I tree-shake unused components?">
    Yes — import only the modules you need and your bundler will
    eliminate everything else.
  </arc-accordion-item>
</arc-accordion>`,
    },
  ],

  seeAlso: ["collapsible","tabs"],
};
