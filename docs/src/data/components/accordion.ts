import type { ComponentDef } from './_types';

export const accordion: ComponentDef = {
  name: 'Accordion',
  slug: 'accordion',
  tag: 'arc-accordion',
  tier: 'content',
  interactivity: 'hybrid',
  description:
    'Collapsible question-and-answer sections. One stays open at a time unless you set multiple.',

  overview: `Accordion stacks \`<arc-accordion-item>\` elements. Each item's \`question\` attribute becomes a button, and the item's text becomes the panel under it. Opening one item closes the others unless you set \`multiple\`.

Answers are plain text. The item's \`textContent\` is rendered into a paragraph, so links, lists and other markup inside an item are lost. That suits FAQs and short notes. For a single block of rich content, use Collapsible.`,

  features: [
    'Panel height animates with a CSS grid transition, with no JavaScript measuring',
    'Each trigger is a `<button>` with `aria-expanded` and `aria-controls`, and each panel is a `region` labelled by its trigger',
    'The chevron turns 180 degrees when an item opens',
    'Items sit in one bordered, rounded container with a 1px divider between them',
  ],

  guidelines: {
    do: [
      'Keep questions short enough to scan',
      'Keep answers short. They render as plain text, so put long or linked content on its own page',
      'Put the most-asked question first',
      "Give the accordion a max width so answers don't run edge to edge",
    ],
    dont: [
      "Don't use it for sections readers compare side by side. Use Tabs",
      "Don't put pricing, legal terms or anything else readers must see inside a closed item",
      "Don't use it for a single item. Use Collapsible",
    ],
  },

  previewHtml: `<div style="width:100%">
  <arc-accordion>
    <arc-accordion-item question="Which frameworks does ARC UI support?">
      React, Vue, Svelte, Angular, Solid and Preact each get a generated package.
      Plain HTML uses the Web Components directly.
    </arc-accordion-item>
    <arc-accordion-item question="How do I theme ARC UI components?">
      Override the tokens on :root to change the whole page, or on a wrapper
      element to change one part of it.
    </arc-accordion-item>
    <arc-accordion-item question="Can I import one component on its own?">
      Yes. Each component has its own entry point, for example
      @arclux/arc-ui/accordion.
    </arc-accordion-item>
  </arc-accordion>
</div>`,

  subComponents: [
    {
      name: 'AccordionItem',
      tag: 'arc-accordion-item',
      description:
        "One section of an Accordion. The question attribute is the button text, and the item's text content is the answer.",
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
    {
      label: 'HTML (Inline)',
      lang: 'html',
      code: `<!-- arc-accordion is hybrid — CSS handles layout, JS handles expand/collapse -->
<arc-accordion>
  <arc-accordion-item question="What is ARC UI?">
    A framework-agnostic component library.
  </arc-accordion-item>
  <arc-accordion-item question="How do I theme components?">
    Override the CSS custom-property tokens.
  </arc-accordion-item>
</arc-accordion>`,
    },
  ],

  seeAlso: ['collapsible', 'tabs'],
};
