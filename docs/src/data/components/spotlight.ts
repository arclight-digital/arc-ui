import type { ComponentDef } from './_types';

export const spotlight: ComponentDef = {
    name: 'Spotlight',
    slug: 'spotlight',
    tag: 'arc-spotlight',
    tier: 'feedback',
    interactivity: 'interactive',
    description: 'Dims the entire page except a targeted element, which gets an accent-primary glow ring and elevated z-index. For onboarding and feature discovery.',

    overview: `Spotlight creates a focus effect by dimming the entire page behind a semi-transparent overlay while leaving a single targeted element fully visible and highlighted. The targeted element receives an accent-primary glow ring and is elevated above the overlay, drawing the user's attention directly to it.

This pattern is essential for onboarding flows, feature discovery, and guided walkthroughs where you need to direct the user's attention to a specific UI element. Spotlight can be used standalone for one-off highlights or composed with guided-tour for multi-step onboarding sequences.

The overlay listens for clicks outside the highlighted element and fires an \`arc-dismiss\` event, allowing you to close the spotlight or advance to the next step. The padding prop controls the breathing room around the target element, and the component automatically repositions when the target moves or the viewport resizes.`,

    features: [
      'Full-page dimming overlay with configurable opacity',
      'Target element highlighted with accent-primary glow ring',
      'Automatic z-index elevation for the targeted element',
      'CSS selector-based targeting — highlight any element on the page',
      'Configurable padding around the highlighted element',
      'Click-outside-to-dismiss fires arc-dismiss event',
      'Automatic repositioning on scroll, resize, and DOM mutations',
      'Smooth fade-in/fade-out transitions for the overlay',
      'Respects prefers-reduced-motion — disables transitions when set',
      'Composable with guided-tour for multi-step onboarding',
    ],

    guidelines: {
      do: [
        'Use spotlight to introduce new features after a deployment or first login',
        'Keep the highlighted element fully visible and interactive',
        'Provide a way to dismiss the spotlight (click outside or an explicit close button)',
        'Use adequate padding so the glow ring does not overlap the target element',
        'Combine with a popover or tooltip to explain the highlighted element',
      ],
      dont: [
        'Use spotlight on every page load — it should be triggered intentionally',
        'Highlight elements that are not yet visible in the viewport',
        'Stack multiple spotlights — highlight one element at a time',
        'Block critical functionality behind the overlay without a dismiss option',
        'Use spotlight for error states — use alert or inline-message instead',
      ],
    },

    previewHtml: `<div style="width:100%;display:flex;flex-direction:column;gap:16px;align-items:flex-start"><arc-spotlight id="demo-spotlight" target="#demo-spotlight-target"></arc-spotlight><arc-button id="demo-spotlight-btn" variant="primary">Activate Spotlight</arc-button><div id="demo-spotlight-target" style="padding:16px;border:1px solid var(--border-default);border-radius:var(--radius-md);background:var(--surface-raised)">This element will be highlighted</div></div>`,

    previewSetup: `
      document.getElementById('demo-spotlight-btn')?.addEventListener('click', () => {
        const spotlight = document.getElementById('demo-spotlight');
        if (spotlight) spotlight.active = true;
      });
      document.getElementById('demo-spotlight')?.addEventListener('arc-dismiss', (e) => {
        e.target.active = false;
      });
    `,

    props: [
      {
        name: 'target',
        type: 'string',
        description: 'CSS selector for the element to highlight. The first matching element will be spotlighted with a glow ring and elevated z-index.',
      },
      {
        name: 'active',
        type: 'boolean',
        default: 'false',
        description: 'Controls whether the spotlight overlay is visible. Set to true to activate the dimming overlay and highlight the target element.',
      },
      {
        name: 'padding',
        type: 'number',
        default: '8',
        description: 'Padding in pixels around the target element cutout. Increase for larger glow rings or to give the target more breathing room.',
      },
    ],
    events: [
      { name: 'arc-dismiss', description: 'Fired when the user clicks outside the highlighted element to dismiss the spotlight' },
    ],

    tabs: [
      {
        label: 'Web Component',
        lang: 'html',
        code: `<script type="module" src="@arclux/arc-ui"></script>

<arc-spotlight id="spotlight" target="#my-feature" padding="12"></arc-spotlight>

<arc-button onclick="document.getElementById('spotlight').active = true">
  Highlight Feature
</arc-button>

<div id="my-feature">This element will be spotlighted</div>`,
      },
      {
        label: 'React',
        lang: 'tsx',
        code: `import { Spotlight, Button } from '@arclux/arc-ui-react';
import { useState } from 'react';

export function SpotlightDemo() {
  const [active, setActive] = useState(false);

  return (
    <>
      <Spotlight target="#my-feature" active={active} padding={12}
        onArcDismiss={() => setActive(false)} />
      <Button variant="primary" onClick={() => setActive(true)}>
        Highlight Feature
      </Button>
      <div id="my-feature">This element will be spotlighted</div>
    </>
  );
}`,
      },
      {
        label: 'Vue',
        lang: 'html',
        code: `<script setup>
import { ref } from 'vue';
import { Button, Spotlight } from '@arclux/arc-ui-vue';

const active = ref(false);
</script>

<template>
  <Spotlight target="#my-feature" :active="active" :padding="12"
    @arc-dismiss="active = false" />
  <Button variant="primary" @click="active = true">Highlight Feature</Button>
  <div id="my-feature">This element will be spotlighted</div>
</template>`,
      },
      {
        label: 'Svelte',
        lang: 'html',
        code: `<script>
  import { Button, Spotlight } from '@arclux/arc-ui-svelte';

  let active = false;
</script>

<Spotlight target="#my-feature" {active} padding={12}
  on:arc-dismiss={() => active = false} />
<Button variant="primary" on:click={() => active = true}>Highlight Feature</Button>
<div id="my-feature">This element will be spotlighted</div>`,
      },
      {
        label: 'Angular',
        lang: 'ts',
        code: `import { Component } from '@angular/core';
import { Button, Spotlight } from '@arclux/arc-ui-angular';

@Component({
  imports: [Button, Spotlight],
  template: \`
    <Spotlight target="#my-feature" [active]="active" [padding]="12"
      (arc-dismiss)="active = false"></Spotlight>
    <Button variant="primary" (click)="active = true">Highlight Feature</Button>
    <div id="my-feature">This element will be spotlighted</div>
  \`,
})
export class SpotlightDemoComponent {
  active = false;
}`,
      },
      {
        label: 'Solid',
        lang: 'tsx',
        code: `import { Button, Spotlight } from '@arclux/arc-ui-solid';
import { createSignal } from 'solid-js';

export function SpotlightDemo() {
  const [active, setActive] = createSignal(false);

  return (
    <>
      <Spotlight target="#my-feature" active={active()} padding={12}
        onArcDismiss={() => setActive(false)} />
      <Button variant="primary" onClick={() => setActive(true)}>
        Highlight Feature
      </Button>
      <div id="my-feature">This element will be spotlighted</div>
    </>
  );
}`,
      },
      {
        label: 'Preact',
        lang: 'tsx',
        code: `import { Button, Spotlight } from '@arclux/arc-ui-preact';
import { useState } from 'preact/hooks';

export function SpotlightDemo() {
  const [active, setActive] = useState(false);

  return (
    <>
      <Spotlight target="#my-feature" active={active} padding={12}
        onArcDismiss={() => setActive(false)} />
      <Button variant="primary" onClick={() => setActive(true)}>
        Highlight Feature
      </Button>
      <div id="my-feature">This element will be spotlighted</div>
    </>
  );
}`,
      },
    ],

    seeAlso: ['guided-tour', 'modal', 'popover'],
};
