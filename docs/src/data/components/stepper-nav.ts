import type { ComponentDef } from './_types';

export const stepperNav: ComponentDef = {
  name: 'Stepper Nav',
  slug: 'stepper-nav',
  tag: 'arc-stepper-nav',
  tier: 'navigation',
  interactivity: 'interactive',
  description:
    'Wizard navigation with numbered step indicators and Back, Next and Skip buttons.',

  overview: `StepperNav runs a multi-step flow. It draws a numbered indicator for each step, puts your step content in its default slot, and adds Back, Next and Skip buttons below. On the last step, Next reads "Complete". Use Stepper when you only need to show progress.

\`active\` is the zero-based index of the current step. Completed steps turn \`--color-success\` with a check, the active step fills with \`--interactive\` and a glow, and the lines leading up to the active step fill with the accent gradient. Clicking an indicator jumps to that step.

\`linear\` disables the indicators for steps ahead of the current one and removes Skip, so the reader can only move forward with Next. StepperNav doesn't validate step content, and Next always moves on. \`arc-change\` fires on every step change with the new index in \`detail.step\`, and \`arc-complete\` fires when the reader presses Complete.`,

  features: [
    'Labels from `steps` become each indicator\'s accessible name, such as "Step 2: Profile". They aren\'t drawn on screen',
    'Skip appears only when `linear` is off and the reader isn\'t on the last step',
  ],

  guidelines: {
    do: [
      'Use `linear` for checkout, onboarding or any flow where step order matters',
      'Keep step labels to two or three words',
      'Listen for `arc-complete` to redirect or show a confirmation screen',
      'Keep a flow to three to six steps, and group a longer one into stages',
    ],
    dont: [
      'Don\'t use it for display-only progress. Use Stepper',
      'Don\'t use StepperNav and Tabs for the same content',
    ],
  },

  previewHtml: `<div style="width:100%;max-width:520px;padding:var(--space-lg);background:var(--bg-surface);border:1px solid var(--border-subtle);border-radius:var(--radius-md)">
  <arc-stepper-nav steps='["Account", "Profile", "Confirm"]' active="1"></arc-stepper-nav>
</div>`,

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
    <arc-stepper-nav
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
