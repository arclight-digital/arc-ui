import type { ComponentDef } from './_types';

export const guidedTour: ComponentDef = {
    name: 'Guided Tour',
    slug: 'guided-tour',
    tag: 'arc-guided-tour',
    tier: 'feedback',
    interactivity: 'interactive',
    description: 'Multi-step onboarding that composes spotlight with popover-styled tooltips at each step. Step counter uses accent-primary gradient text.',

    overview: `Guided Tour orchestrates a multi-step onboarding experience by composing spotlight overlays with popover-styled tooltip panels at each step. It manages the full state machine — advancing, going back, skipping, and completing — so you only need to declare the steps and let the component handle transitions, positioning, and overlay management.

Each step targets a DOM element by CSS selector, dims the rest of the page with a spotlight overlay, and positions a popover next to the highlighted element with a title, body content, and navigation controls (Back, Next, Skip). A step counter at the bottom of the popover uses accent-primary gradient text to show progress through the tour.

The component fires events at each transition — \`arc-change\` when the step changes, \`arc-complete\` when the user finishes the tour, and \`arc-dismiss\` when they skip or close early. These events let you track onboarding completion, persist progress to a backend, or conditionally skip steps based on user state.`,

    features: [
      'Declarative step definitions with target selector, title, and content',
      'Spotlight overlay dims the page while highlighting each target element',
      'Popover-styled tooltips auto-positioned next to the highlighted element',
      'Built-in navigation: Back, Next, Skip, and Finish buttons',
      'Step counter with accent-primary gradient text for progress indication',
      'Automatic scroll-into-view for off-screen target elements',
      'arc-change, arc-complete, and arc-dismiss events for state tracking',
      'Keyboard navigation — Arrow keys to advance/go back, Escape to dismiss',
      'Respects prefers-reduced-motion for overlay transitions',
      'Composable — uses spotlight and popover internally',
    ],

    guidelines: {
      do: [
        'Keep tours short — 3 to 5 steps is ideal for onboarding',
        'Write concise step titles and descriptions that explain why, not just what',
        'Always provide a Skip option so users are not trapped in the tour',
        'Persist tour completion state so returning users are not shown the tour again',
        'Target elements that are already rendered — avoid spotlighting lazy-loaded content',
      ],
      dont: [
        'Create tours with more than 7 steps — break them into multiple focused tours',
        'Use guided-tour for error messages or alerts — it is for onboarding and discovery',
        'Target elements inside scrollable containers without ensuring they are visible',
        'Trigger the tour automatically on every page load — use a first-visit or feature-flag check',
        'Rely on the tour as the only form of documentation — it supplements, not replaces, help content',
      ],
    },

    previewHtml: `<div style="width:100%"><arc-guided-tour id="demo-tour"></arc-guided-tour><arc-button id="demo-tour-btn" variant="primary">Start Tour</arc-button></div>`,

    previewSetup: `
      const tour = document.getElementById('demo-tour');
      if (tour) {
        tour.steps = [
          { target: '#demo-tour-btn', title: 'Welcome', content: 'This button starts the guided tour.' },
        ];
      }
      document.getElementById('demo-tour-btn')?.addEventListener('click', () => {
        if (tour) tour.open = true;
      });
    `,

    props: [
      {
        name: 'steps',
        type: 'Array<{ target: string; title: string; content: string }>',
        default: '[]',
        description: 'Array of step definitions. Each step specifies a CSS selector for the target element, a title for the popover heading, and content for the popover body.',
      },
      {
        name: 'active',
        type: 'number',
        description: 'Read-only property reflecting the zero-based index of the currently active step.',
      },
      {
        name: 'open',
        type: 'boolean',
        default: 'false',
        description: 'Controls whether the tour is active. Set to true to start the tour from the first step.',
      },
    ],
    events: [
      { name: 'arc-change', description: 'Fired when the tour advances or goes back to a different step. Detail contains { step } with the new step index.' },
      { name: 'arc-complete', description: 'Fired when the user finishes the last step of the tour' },
      { name: 'arc-dismiss', description: 'Fired when the user skips or closes the tour before completing all steps' },
    ],

    tabs: [
      {
        label: 'Web Component',
        lang: 'html',
        code: `<script type="module" src="@arclux/arc-ui"></script>

<arc-guided-tour id="tour"></arc-guided-tour>

<arc-button id="start-tour" variant="primary">Start Tour</arc-button>
<div id="step-1">Feature One</div>
<div id="step-2">Feature Two</div>

<script>
  const tour = document.getElementById('tour');
  tour.steps = [
    { target: '#step-1', title: 'Feature One', content: 'This is the first feature.' },
    { target: '#step-2', title: 'Feature Two', content: 'This is the second feature.' },
  ];
  document.getElementById('start-tour').addEventListener('click', () => {
    tour.open = true;
  });
</script>`,
      },
      {
        label: 'React',
        lang: 'tsx',
        code: `import { GuidedTour, Button } from '@arclux/arc-ui-react';
import { useRef, useState } from 'react';

const steps = [
  { target: '#step-1', title: 'Feature One', content: 'This is the first feature.' },
  { target: '#step-2', title: 'Feature Two', content: 'This is the second feature.' },
];

export function TourDemo() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <GuidedTour steps={steps} open={open}
        onArcComplete={() => setOpen(false)}
        onArcDismiss={() => setOpen(false)} />
      <Button variant="primary" onClick={() => setOpen(true)}>Start Tour</Button>
      <div id="step-1">Feature One</div>
      <div id="step-2">Feature Two</div>
    </>
  );
}`,
      },
      {
        label: 'Vue',
        lang: 'html',
        code: `<script setup>
import { ref } from 'vue';
import { Button, GuidedTour } from '@arclux/arc-ui-vue';

const open = ref(false);
const steps = [
  { target: '#step-1', title: 'Feature One', content: 'This is the first feature.' },
  { target: '#step-2', title: 'Feature Two', content: 'This is the second feature.' },
];
</script>

<template>
  <GuidedTour :steps="steps" :open="open"
    @arc-complete="open = false" @arc-dismiss="open = false" />
  <Button variant="primary" @click="open = true">Start Tour</Button>
  <div id="step-1">Feature One</div>
  <div id="step-2">Feature Two</div>
</template>`,
      },
      {
        label: 'Svelte',
        lang: 'html',
        code: `<script>
  import { Button, GuidedTour } from '@arclux/arc-ui-svelte';

  let open = false;
  const steps = [
    { target: '#step-1', title: 'Feature One', content: 'This is the first feature.' },
    { target: '#step-2', title: 'Feature Two', content: 'This is the second feature.' },
  ];
</script>

<GuidedTour {steps} {open}
  on:arc-complete={() => open = false}
  on:arc-dismiss={() => open = false} />
<Button variant="primary" on:click={() => open = true}>Start Tour</Button>
<div id="step-1">Feature One</div>
<div id="step-2">Feature Two</div>`,
      },
      {
        label: 'Angular',
        lang: 'ts',
        code: `import { Component } from '@angular/core';
import { Button, GuidedTour } from '@arclux/arc-ui-angular';

@Component({
  imports: [Button, GuidedTour],
  template: \`
    <GuidedTour [steps]="steps" [open]="open"
      (arc-complete)="open = false" (arc-dismiss)="open = false"></GuidedTour>
    <Button variant="primary" (click)="open = true">Start Tour</Button>
    <div id="step-1">Feature One</div>
    <div id="step-2">Feature Two</div>
  \`,
})
export class TourDemoComponent {
  open = false;
  steps = [
    { target: '#step-1', title: 'Feature One', content: 'This is the first feature.' },
    { target: '#step-2', title: 'Feature Two', content: 'This is the second feature.' },
  ];
}`,
      },
      {
        label: 'Solid',
        lang: 'tsx',
        code: `import { Button, GuidedTour } from '@arclux/arc-ui-solid';
import { createSignal } from 'solid-js';

const steps = [
  { target: '#step-1', title: 'Feature One', content: 'This is the first feature.' },
  { target: '#step-2', title: 'Feature Two', content: 'This is the second feature.' },
];

export function TourDemo() {
  const [open, setOpen] = createSignal(false);

  return (
    <>
      <GuidedTour steps={steps} open={open()}
        onArcComplete={() => setOpen(false)}
        onArcDismiss={() => setOpen(false)} />
      <Button variant="primary" onClick={() => setOpen(true)}>Start Tour</Button>
      <div id="step-1">Feature One</div>
      <div id="step-2">Feature Two</div>
    </>
  );
}`,
      },
      {
        label: 'Preact',
        lang: 'tsx',
        code: `import { Button, GuidedTour } from '@arclux/arc-ui-preact';
import { useState } from 'preact/hooks';

const steps = [
  { target: '#step-1', title: 'Feature One', content: 'This is the first feature.' },
  { target: '#step-2', title: 'Feature Two', content: 'This is the second feature.' },
];

export function TourDemo() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <GuidedTour steps={steps} open={open}
        onArcComplete={() => setOpen(false)}
        onArcDismiss={() => setOpen(false)} />
      <Button variant="primary" onClick={() => setOpen(true)}>Start Tour</Button>
      <div id="step-1">Feature One</div>
      <div id="step-2">Feature Two</div>
    </>
  );
}`,
      },
    ],

    seeAlso: ['spotlight', 'popover', 'stepper'],
};
