import type { ComponentDef } from './_types';

export const stepperNav: ComponentDef = {
  name: 'Stepper Nav',
  slug: 'stepper-nav',
  tag: 'arc-stepper-nav',
  tier: 'navigation',
  interactivity: 'interactive',
  description: 'Wizard navigation with back/next/skip controls and step validation gates. Steps connected by gradient lines with interactive routing.',

  overview: `StepperNav is a full wizard controller that pairs step indicators with built-in navigation buttons — Back, Next, and optional Skip. Unlike the display-only Stepper component, which simply visualises progress, StepperNav owns the routing logic: it tracks the active step, enforces linear or free-form progression, and dispatches events when the user advances, retreats, or completes the flow.

Each step is connected by gradient lines that fill as the user progresses, providing a clear visual trail of completed, active, and upcoming stages. The active step pulses with an accent-primary glow, while completed steps show a filled check indicator. When the \`linear\` prop is set, users cannot jump ahead without completing the current step — ideal for checkout flows or onboarding wizards where order matters.

The component dispatches \`arc-change\` on every step transition and \`arc-complete\` when the final step is confirmed, so your application can validate inputs, persist state, or redirect the user. StepperNav handles the navigation chrome while leaving step content entirely to your application — render whatever forms, media, or confirmation screens you need for each stage.`,

  features: [
    'Built-in Back, Next, and Skip navigation buttons',
    'Linear mode enforces sequential step completion',
    'Gradient connector lines fill as steps are completed',
    'Active step with accent-primary glow indicator',
    'Completed steps show filled check marks',
    'arc-change event on every step transition',
    'arc-complete event when the wizard finishes',
    'Keyboard accessible navigation controls',
    'Configurable step labels via the steps array',
    'Token-driven theming via CSS custom properties',
  ],

  guidelines: {
    do: [
      'Use linear mode for checkout, onboarding, or any flow where step order matters',
      'Provide clear, concise labels for each step — two to three words maximum',
      'Validate the current step before allowing Next to proceed',
      'Listen for arc-complete to redirect or show a confirmation screen',
      'Keep the total number of steps between three and six for best usability',
    ],
    dont: [
      'Use StepperNav for display-only progress — use Stepper instead',
      'Add more than seven steps — break long flows into grouped stages',
      'Skip validation in linear mode — users expect gated progression',
      'Mix StepperNav and Tabs for the same content — pick one navigation paradigm',
      'Nest StepperNav inside another StepperNav',
    ],
  },

  previewHtml: `<div style="width:100%;max-width:520px;padding:var(--space-lg);background:var(--bg-surface);border:1px solid var(--border-subtle);border-radius:var(--radius-md)">
  <arc-stepper-nav steps='["Account", "Profile", "Confirm"]' active="1"></arc-stepper-nav>
</div>`,

  props: [
    { name: 'steps', type: 'Array<string>', default: '[]', description: 'Array of step labels displayed along the progress track.' },
    { name: 'active', type: 'number', default: '0', description: 'Zero-based index of the currently active step.' },
    { name: 'linear', type: 'boolean', default: 'false', description: 'When true, prevents jumping to future steps — the user must complete each step sequentially.' },
  ],
  events: [
    { name: 'arc-change', description: 'Fired when the active step changes with detail: { step }.' },
    { name: 'arc-complete', description: 'Fired when the user confirms the final step.' },
  ],

  tabs: [
    {
      label: 'Web Component',
      lang: 'html',
      code: `<script type="module" src="@arclux/arc-ui"></script>

<arc-stepper-nav
  steps='["Account", "Profile", "Confirm"]'
  active="0"
  linear
  id="wizard"
></arc-stepper-nav>

<script>
  const wizard = document.querySelector('#wizard');
  wizard.addEventListener('arc-change', (e) => {
    console.log('step:', e.detail.step);
  });
  wizard.addEventListener('arc-complete', () => {
    console.log('wizard complete');
  });
</script>`,
    },
    {
      label: 'React',
      lang: 'tsx',
      code: `import { StepperNav } from '@arclux/arc-ui-react';

export function OnboardingWizard() {
  return (
    <StepperNav
      steps={['Account', 'Profile', 'Confirm']}
      active={0}
      linear
      onArcChange={(e) => console.log('step:', e.detail.step)}
      onArcComplete={() => console.log('wizard complete')}
    />
  );
}`,
    },
    {
      label: 'Vue',
      lang: 'html',
      code: `<script setup>
import { StepperNav } from '@arclux/arc-ui-vue';

const steps = ['Account', 'Profile', 'Confirm'];

function onChange(e) {
  console.log('step:', e.detail.step);
}
function onComplete() {
  console.log('wizard complete');
}
</script>

<template>
  <StepperNav
    :steps="steps"
    :active="0"
    linear
    @arc-change="onChange"
    @arc-complete="onComplete"
  />
</template>`,
    },
    {
      label: 'Svelte',
      lang: 'html',
      code: `<script>
  import { StepperNav } from '@arclux/arc-ui-svelte';

  const steps = ['Account', 'Profile', 'Confirm'];
</script>

<StepperNav
  {steps}
  active={0}
  linear
  on:arc-change={(e) => console.log('step:', e.detail.step)}
  on:arc-complete={() => console.log('wizard complete')}
/>`,
    },
    {
      label: 'Angular',
      lang: 'ts',
      code: `import { Component } from '@angular/core';
import { StepperNav } from '@arclux/arc-ui-angular';

@Component({
  imports: [StepperNav],
  template: \`
    <StepperNav
      [steps]="steps"
      [active]="0"
      linear
      (arc-change)="onChange($event)"
      (arc-complete)="onComplete()"
    />
  \`,
})
export class OnboardingWizardComponent {
  steps = ['Account', 'Profile', 'Confirm'];

  onChange(e: CustomEvent) {
    console.log('step:', e.detail.step);
  }
  onComplete() {
    console.log('wizard complete');
  }
}`,
    },
    {
      label: 'Solid',
      lang: 'tsx',
      code: `import { StepperNav } from '@arclux/arc-ui-solid';

export function OnboardingWizard() {
  return (
    <StepperNav
      steps={['Account', 'Profile', 'Confirm']}
      active={0}
      linear
      onArcChange={(e) => console.log('step:', e.detail.step)}
      onArcComplete={() => console.log('wizard complete')}
    />
  );
}`,
    },
    {
      label: 'Preact',
      lang: 'tsx',
      code: `import { StepperNav } from '@arclux/arc-ui-preact';

export function OnboardingWizard() {
  return (
    <StepperNav
      steps={['Account', 'Profile', 'Confirm']}
      active={0}
      linear
      onArcChange={(e) => console.log('step:', e.detail.step)}
      onArcComplete={() => console.log('wizard complete')}
    />
  );
}`,
    },
  ],

  seeAlso: ['stepper', 'tabs', 'form'],
};
