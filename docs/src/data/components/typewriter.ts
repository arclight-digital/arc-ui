import type { ComponentDef } from './_types';

export const typewriter: ComponentDef = {
    name: 'Typewriter',
    slug: 'typewriter',
    tag: 'arc-typewriter',
    tier: 'typography',
    interactivity: 'interactive',
    replayable: true,
    description: 'Character-by-character text reveal animation with blinking cursor.',

    overview: `Typewriter reveals text one character at a time, recreating the classic typewriter effect used in hero headlines, onboarding sequences, and conversational UI. The animation is driven by a simple \`setTimeout\` chain — no frame-sync overhead — making it lightweight and easy to reason about.

The \`speed\` prop controls milliseconds per character (default 50ms, roughly 20 characters per second), and an optional \`delay\` defers the start for staggered or sequenced reveals. When \`loop\` is enabled, the text clears after a configurable \`pause-end\` duration (default 2s) and replays indefinitely, useful for rotating taglines or feature highlights.

A blinking cursor (the classic \`|\` caret) appears by default and automatically fades out once typing completes. The cursor color follows \`--accent-primary\`, so it adapts to any theme. When \`prefers-reduced-motion\` is active, the full text is shown immediately with no animation — the content is never hidden from users who need reduced motion.`,

    features: [
      'Character-by-character text reveal with configurable speed',
      'Optional initial delay for sequenced or staggered animations',
      'Blinking cursor that fades out on completion',
      'Loop mode with configurable pause between cycles',
      'Respects prefers-reduced-motion — shows full text immediately',
      'Public replay() method for manual restart',
      'Dispatches arc-complete event when typing finishes',
      'Inherits font from parent — works with any typography',
    ],

    guidelines: {
      do: [
        'Use in hero sections and landing pages for dramatic text reveals',
        'Set speed between 30-80ms for natural-feeling typing',
        'Use delay to stagger multiple typewriters in sequence',
        'Enable loop for rotating taglines or feature highlights',
        'Pair with a static heading — typewriter text should be supplementary, not the only content',
      ],
      dont: [
        'Use for critical content that users need to read immediately — the delay hides information',
        'Run more than 2-3 typewriters simultaneously — it becomes chaotic',
        'Set speed below 20ms — it looks like a flash, not typing',
        'Use loop on long paragraphs — the constant reset is distracting',
        'Rely on the typewriter for the only instance of important text — screen readers see it all at once',
      ],
    },

    previewHtml: `<arc-typewriter text="Welcome to the future of UI." speed="60" cursor></arc-typewriter>`,

    props: [
      { name: 'text', type: 'string', default: "''", description: 'The text to type out character by character' },
      { name: 'speed', type: 'number', default: '50', description: 'Milliseconds per character' },
      { name: 'delay', type: 'number', default: '0', description: 'Initial delay in milliseconds before typing starts' },
      { name: 'cursor', type: 'boolean', default: 'true', description: 'Show a blinking cursor during and after typing' },
      { name: 'loop', type: 'boolean', default: 'false', description: 'Loop the animation indefinitely' },
      { name: 'pause-end', type: 'number', default: '2000', description: 'Milliseconds to pause at the end before looping' },
    ],

    events: [
      { name: 'arc-complete', description: 'Fired when the typing animation finishes revealing all characters' },
    ],

    tabs: [
      {
        label: 'Web Component',
        lang: 'html',
        code: `<!-- Simple typewriter -->
<arc-typewriter text="Welcome to the future of UI." speed="60" cursor></arc-typewriter>

<!-- With delay and loop -->
<arc-typewriter
  text="Build faster. Ship sooner."
  speed="40"
  delay="500"
  loop
  pause-end="3000"
></arc-typewriter>

<!-- No cursor -->
<arc-typewriter text="Clean and simple." cursor="false"></arc-typewriter>`,
      },
      {
        label: 'React',
        lang: 'tsx',
        code: `import { Typewriter } from '@arclux/arc-ui-react';

function Hero() {
  return (
    <div>
      <h1>
        <Typewriter
          text="Welcome to the future of UI."
          speed={60}
          cursor
          onArcComplete={() => console.log('done')}
        />
      </h1>
      <Typewriter
        text="Build faster. Ship sooner."
        speed={40}
        delay={1800}
        loop
        pauseEnd={3000}
      />
    </div>
  );
}`,
      },
      {
        label: 'Vue',
        lang: 'html',
        code: `<script setup>
import { Typewriter } from '@arclux/arc-ui-vue';

function onComplete() {
  console.log('Typing finished');
}
</script>

<template>
  <h1>
    <Typewriter
      text="Welcome to the future of UI."
      :speed="60"
      cursor
      @arc-complete="onComplete"
    />
  </h1>
</template>`,
      },
      {
        label: 'Svelte',
        lang: 'html',
        code: `<script>
  import { Typewriter } from '@arclux/arc-ui-svelte';
</script>

<h1>
  <Typewriter
    text="Welcome to the future of UI."
    speed={60}
    cursor
    on:arc-complete={() => console.log('done')}
  />
</h1>`,
      },
      {
        label: 'Angular',
        lang: 'ts',
        code: `import { Component } from '@angular/core';
import { Typewriter } from '@arclux/arc-ui-angular';

@Component({
  imports: [Typewriter],
  template: \`
    <h1>
      <Typewriter
        text="Welcome to the future of UI."
        [speed]="60"
        cursor
        (arcComplete)="onComplete()"
      />
    </h1>
  \`,
})
export class HeroComponent {
  onComplete() {
    console.log('Typing finished');
  }
}`,
      },
      {
        label: 'Solid',
        lang: 'tsx',
        code: `import { Typewriter } from '@arclux/arc-ui-solid';

function Hero() {
  return (
    <h1>
      <Typewriter
        text="Welcome to the future of UI."
        speed={60}
        cursor
      />
    </h1>
  );
}`,
      },
      {
        label: 'Preact',
        lang: 'tsx',
        code: `import { Typewriter } from '@arclux/arc-ui-preact';

function Hero() {
  return (
    <h1>
      <Typewriter
        text="Welcome to the future of UI."
        speed={60}
        cursor
      />
    </h1>
  );
}`,
      },
    ],

    seeAlso: ['text', 'animated-number', 'marquee'],
};
