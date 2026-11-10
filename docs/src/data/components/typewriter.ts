import type { ComponentDef } from './_types';

export const typewriter: ComponentDef = {
  name: 'Typewriter',
  slug: 'typewriter',
  tag: 'arc-typewriter',
  tier: 'typography',
  interactivity: 'interactive',
  replayable: true,
  description: 'Types out its text one character at a time, with a blinking cursor.',

  overview: `Typewriter reveals its \`text\` one character at a time. A \`setTimeout\` chain drives it.

\`speed\` is milliseconds per character (50 by default, about 20 characters a second), and \`delay\` holds the start so several typewriters can run in sequence. With \`loop\`, the text clears after \`pause-end\` (2 seconds by default) and types again, for rotating taglines.

\`replay()\` restarts the animation from the beginning. Use it for a "watch again" control, or to run a one-shot reveal again after the content around it changes. Called mid-type, it cancels the pending step first, so two sequences never run at once.

A blinking \`|\` cursor in \`--accent-primary\` is on by default, and \`no-cursor\` turns it off. Once typing finishes, the cursor fades out after about 3 seconds, or keeps blinking with \`loop\`. Under \`prefers-reduced-motion\` the full text shows at once.`,

  features: [
    'Fires `arc-complete` when typing finishes',
    'Inherits its font from the parent',
  ],

  guidelines: {
    do: [
      'Use it in hero sections and on landing pages',
      'Set `speed` between 30 and 80ms for typing that looks natural',
      'Use `delay` to run several typewriters one after another',
      'Put the important text in a static heading as well. A screen reader that reaches the typewriter mid-animation reads only what\'s typed so far',
    ],
    dont: [
      'Don\'t use it for text readers need to read right away. The animation holds it back',
      'Don\'t run more than two or three typewriters at once',
      'Don\'t set `speed` below 20ms. It reads as a flash, not typing',
      'Don\'t loop long paragraphs',
    ],
  },

  previewHtml: `<arc-typewriter text="This line types itself one character at a time." speed="60" cursor></arc-typewriter>`,

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
      <arc-typewriter
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
