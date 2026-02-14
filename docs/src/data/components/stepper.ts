import type { ComponentDef } from './_types';

export const stepper: ComponentDef = {
    name: 'Stepper',
    slug: 'stepper',
    tag: 'arc-stepper',
    tier: 'content',
    interactivity: 'static',
    description: 'Step indicator for multi-step workflows.',

    overview: `Stepper is a horizontal progress indicator for multi-step workflows like onboarding flows, checkout processes, and setup wizards. It renders numbered circles connected by horizontal lines, with each step in one of three visual states: completed (filled blue with a checkmark), active (blue outlined ring with glow), or upcoming (muted grey). The \`active\` property (zero-indexed) controls which step is current, and all steps before it are automatically marked as completed.

The component uses a declarative child-element API: nest \`<arc-step>\` elements inside the stepper, each with a \`label\` property. The stepper collects these children via slotchange events and renders the visual step indicators. This pattern keeps the markup readable and makes it easy to add or remove steps without managing array data. Each step circle is 32px with the label centered below.

Connecting lines between steps change colour based on completion state — blue lines indicate completed transitions, while default-coloured lines indicate upcoming transitions. The active step circle has a \`box-shadow\` glow effect using \`--accent-primary-rgb\` to draw the user's eye. The component uses \`role="list"\` with \`role="listitem"\` on each step and \`aria-current="step"\` on the active step for accessibility.`,

    features: [
      'Three visual step states: completed (checkmark), active (glowing ring), upcoming (muted)',
      'Declarative <arc-step> child elements with label property for readable markup',
      'Zero-indexed active property — all steps before active are auto-completed',
      'Horizontal connecting lines that change colour based on completion state',
      'Active step glow effect using box-shadow with --accent-primary-rgb',
      'Accessible role="list" and aria-current="step" attributes',
      'CSS parts (stepper, step, circle, line, label) for style customization',
      'Checkmark icon replaces step number for completed steps',
    ],

    guidelines: {
      do: [
        'Use 3-5 steps for a clear, manageable workflow — more than 6 gets cramped',
        'Keep step labels to 1-2 words so they fit under the 32px circles',
        'Update the active property as the user progresses through the workflow',
        'Place the stepper at the top of a form or wizard for persistent progress context',
        'Use alongside form validation — only advance active when the current step is valid',
      ],
      dont: [
        'Use stepper for navigation menus — it is a progress indicator, not a nav component',
        'Allow users to skip ahead by clicking steps — enforce linear progression',
        'Use more than 7 steps — if the workflow is that long, group steps into phases',
        'Change step labels mid-flow — it confuses users about where they are',
        'Use stepper for a single step — it needs at least 2 steps to be meaningful',
      ],
    },

    previewHtml: `<arc-stepper active="1" style="max-width: 480px;">
  <arc-step label="Account"></arc-step>
  <arc-step label="Profile"></arc-step>
  <arc-step label="Review"></arc-step>
  <arc-step label="Complete"></arc-step>
</arc-stepper>`,

    props: [
      { name: 'active', type: 'number', default: '0', description: 'Zero-indexed active step — steps before this index show as completed' },
    ],
    tabs: [
      {
        label: 'Web Component',
        lang: 'html',
        code: `<arc-stepper current="1">
  <arc-step label="Account"></arc-step>
  <arc-step label="Profile"></arc-step>
  <arc-step label="Review"></arc-step>
</arc-stepper>`,
      },
      {
        label: 'React',
        lang: 'tsx',
        code: `import { Step, Stepper } from '@arclux/arc-ui-react';

<Stepper current="1">
  <Step label="Account"></Step>
  <Step label="Profile"></Step>
  <Step label="Review"></Step>
</Stepper>`,
      },
      {
        label: 'Vue',
        lang: 'html',
        code: `<script setup>
import { Step, Stepper } from '@arclux/arc-ui-vue';
</script>

<template>
  <Stepper current="1">
    <Step label="Account"></Step>
    <Step label="Profile"></Step>
    <Step label="Review"></Step>
  </Stepper>
</template>`,
      },
      {
        label: 'Svelte',
        lang: 'html',
        code: `<script>
  import { Step, Stepper } from '@arclux/arc-ui-svelte';
</script>

<Stepper current="1">
  <Step label="Account"></Step>
  <Step label="Profile"></Step>
  <Step label="Review"></Step>
</Stepper>`,
      },
      {
        label: 'Angular',
        lang: 'ts',
        code: `import { Component } from '@angular/core';
import { Step, Stepper } from '@arclux/arc-ui-angular';

@Component({
  imports: [Step, Stepper],
  template: \`
    <Stepper current="1">
      <Step label="Account"></Step>
      <Step label="Profile"></Step>
      <Step label="Review"></Step>
    </Stepper>
  \`,
})
export class MyComponent {}`,
      },
      {
        label: 'Solid',
        lang: 'tsx',
        code: `import { Step, Stepper } from '@arclux/arc-ui-solid';

<Stepper current="1">
  <Step label="Account"></Step>
  <Step label="Profile"></Step>
  <Step label="Review"></Step>
</Stepper>`,
      },
      {
        label: 'Preact',
        lang: 'tsx',
        code: `import { Step, Stepper } from '@arclux/arc-ui-preact';

<Stepper current="1">
  <Step label="Account"></Step>
  <Step label="Profile"></Step>
  <Step label="Review"></Step>
</Stepper>`,
      },
      { label: 'HTML', lang: 'html', code: `<!-- Auto-generated by @arclux/prism — do not edit manually -->
<!-- arc-stepper — requires stepper.css + base.css (or arc-ui.css) -->
<div class="arc-stepper">
  <div
   class="step step--"
   role="listitem"
   aria-current=""
   >
   <div class="step__header">

   <span class="step__circle">

   </span>

   </div>
   <span class="step__label"></span>
   </div>
</div>` },
      { label: 'HTML (Inline)', lang: 'html', code: `<!-- Auto-generated by @arclux/prism — do not edit manually -->
<!-- arc-stepper — self-contained, no external CSS needed -->
<div class="arc-stepper" style="display: block">
  <div

   role="listitem"
   aria-current=""
   >
   <div style="display: flex; align-items: center; width: 100%; position: relative">

   <span style="width: 32px; height: 32px; border-radius: 9999px; display: flex; align-items: center; justify-content: center; font-family: 'Tektur', system-ui, sans-serif; font-size: 13px; font-weight: 600; flex-shrink: 0; position: relative; z-index: 1; margin: 0 auto; box-sizing: border-box; background: rgb(77, 126, 247); color: rgb(232, 232, 236); border: 2px solid rgb(77, 126, 247); box-shadow: 0 0 12px rgba(77, 126, 247, 0.25)">

   </span>

   </div>
   <span style="margin-top: 8px; font-family: 'Host Grotesk', system-ui, sans-serif; font-size: 13px; color: rgb(138, 138, 150); text-align: center; font-weight: 600"></span>
   </div>
</div>` }
    ],
    subComponents: [
      {
        name: 'Step',
        tag: 'arc-step',
        description: 'Individual step within a Stepper.',
        props: [
          { name: 'label', type: 'string', description: 'Step label text' },
          { name: 'description', type: 'string', description: 'Optional description below the label' },
        ],
      },
    ],
  
  seeAlso: ["progress","timeline","form"],
};
