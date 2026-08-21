import type { ComponentDef } from './_types';

export const terminal: ComponentDef = {
  name: 'Terminal',
  slug: 'terminal',
  tag: 'arc-terminal',
  tier: 'typography',
  interactivity: 'interactive',
  replayable: true,
  description: 'Animated terminal window that types commands and prints their output line by line.',
  searchKeywords: ['console', 'shell', 'cli', 'command line', 'prompt'],

  overview: `Terminal renders a chrome'd window — orbs, an optional centered title, a monospace body — and plays a transcript through it. Command lines get an accent-colored prompt glyph and type character-by-character; output lines appear whole after a short beat, like a process answering; comment lines render muted. A blinking block cursor follows the typing and settles on a fresh prompt when the sequence ends, at which point the component fires \`arc-complete\`.

The transcript is supplied through the \`lines\` property as an array of \`{ type, text, delay? }\` objects, where \`type\` is \`command\`, \`output\`, or \`comment\`. Arrays do not survive an attribute, so \`lines\` is property-only — set it from JavaScript or pass it through a framework wrapper. The \`speed\` prop is milliseconds per typed character (the same cadence prop Typewriter exposes), and each line's optional \`delay\` overrides the default pause before it starts: 500ms before a command, 150ms before output.

By default the animation starts when the element scrolls into view, so a terminal halfway down a landing page types on arrival rather than replaying scrolls nobody saw. Set the \`autoplay\` property to \`false\` to take manual control with \`play()\` and \`reset()\`, and set \`loop\` to replay the transcript indefinitely. Before playback starts — including during server rendering — the full completed transcript is shown, so the content never depends on JavaScript running. Under \`prefers-reduced-motion\` nothing animates: the finished transcript renders immediately, the cursor holds steady instead of blinking, and \`arc-complete\` still fires.`,

  features: [
    'Commands type character-by-character behind an accent-colored prompt glyph',
    'Output lines appear whole after a short, per-line configurable delay',
    'Comment lines render muted for annotation inside the transcript',
    'Window chrome with the house three-orb title bar and optional centered title',
    'Starts when scrolled into view via IntersectionObserver, or manually with `play()` when `autoplay` is off',
    '`reset()` returns to the blank pre-animation state without starting playback, so a transcript can be replayed on demand',
    'Loop mode replays the transcript with a pause between cycles',
    'Server rendering and `prefers-reduced-motion` both show the completed transcript instantly',
    'Blinking block cursor with an accent glow that settles on an idle prompt when done',
    'Fires `arc-complete` when the sequence finishes printing',
  ],

  guidelines: {
    do: [
      'Use Terminal for install-and-run sequences on landing and getting-started pages, where the payoff is watching the tool work',
      'Use arc-code-block when the reader needs to copy the commands — Terminal animates, CodeBlock has the copy button and syntax highlighting',
      'Use arc-typewriter for a single line of prose, like a headline — Terminal is for multi-line command-and-response transcripts',
      'Keep transcripts short: five to eight lines reads as a demo, thirty reads as a log file',
      'Tune per-line delay to fake realistic latency — a build step that "runs" for a beat before its output lands sells the effect',
    ],
    dont: [
      'Do not make Terminal the only place a required command appears — pair it with a copyable code block in documentation',
      'Do not put critical instructions behind the animation on autoplay pages; readers scrolling fast should not have to wait for typing',
      'Do not run several terminals animating in the same viewport — one window typing is a demo, three is noise',
      'Do not use loop on long transcripts — the clear-and-replay is distracting past a few lines',
      'Do not pass the transcript as an attribute — `lines` is a property, and an attribute string will not parse into an array',
    ],
  },

  previewHtml: `<arc-terminal title="arc — zsh" style="width: 100%; max-width: 560px;"></arc-terminal>`,

  previewSetup: `{
  const t = el.querySelector('arc-terminal');
  if (!t) return;
  t.lines = [
    { type: 'comment', text: '# Install ARC UI' },
    { type: 'command', text: 'pnpm add @arclux/arc-ui' },
    { type: 'output', text: 'Packages: +1' },
    { type: 'output', text: '+ @arclux/arc-ui 3.0.0' },
    { type: 'command', text: 'pnpm dev' },
    { type: 'output', text: 'ready in 312ms — http://localhost:5173/' },
  ];
}`,

  tabs: [
    {
      label: 'Web Component',
      lang: 'html',
      code: `<arc-terminal id="demo" title="arc — zsh"></arc-terminal>

<script type="module">
  import '@arclux/arc-ui';

  const demo = document.getElementById('demo');
  demo.lines = [
    { type: 'comment', text: '# Install ARC UI' },
    { type: 'command', text: 'pnpm add @arclux/arc-ui' },
    { type: 'output', text: '+ @arclux/arc-ui 3.0.0' },
    { type: 'command', text: 'pnpm dev' },
    { type: 'output', text: 'ready — http://localhost:5173/' },
  ];
  demo.addEventListener('arc-complete', () => console.log('done'));
</script>`,
    },
    {
      label: 'React',
      lang: 'tsx',
      code: `import { Terminal } from '@arclux/arc-ui-react';

const lines = [
  { type: 'comment', text: '# Install ARC UI' },
  { type: 'command', text: 'pnpm add @arclux/arc-ui' },
  { type: 'output', text: '+ @arclux/arc-ui 3.0.0' },
  { type: 'command', text: 'pnpm dev' },
  { type: 'output', text: 'ready — http://localhost:5173/' },
];

function Hero() {
  return (
    <Terminal
      title="arc — zsh"
      lines={lines}
      speed={40}
      onArcComplete={() => console.log('done')}
    />
  );
}`,
    },
    {
      label: 'Vue',
      lang: 'html',
      code: `<script setup>
import { Terminal } from '@arclux/arc-ui-vue';

const lines = [
  { type: 'comment', text: '# Install ARC UI' },
  { type: 'command', text: 'pnpm add @arclux/arc-ui' },
  { type: 'output', text: '+ @arclux/arc-ui 3.0.0' },
  { type: 'command', text: 'pnpm dev' },
  { type: 'output', text: 'ready — http://localhost:5173/' },
];
</script>

<template>
  <Terminal
    title="arc — zsh"
    :lines="lines"
    @arc-complete="() => console.log('done')"
  />
</template>`,
    },
    {
      label: 'Svelte',
      lang: 'html',
      code: `<script>
  import { Terminal } from '@arclux/arc-ui-svelte';

  const lines = [
    { type: 'comment', text: '# Install ARC UI' },
    { type: 'command', text: 'pnpm add @arclux/arc-ui' },
    { type: 'output', text: '+ @arclux/arc-ui 3.0.0' },
    { type: 'command', text: 'pnpm dev' },
    { type: 'output', text: 'ready — http://localhost:5173/' },
  ];
</script>

<Terminal title="arc — zsh" {lines} on:arc-complete={() => console.log('done')} />`,
    },
    {
      label: 'Angular',
      lang: 'ts',
      code: `import { Component } from '@angular/core';
import { Terminal } from '@arclux/arc-ui-angular';

@Component({
  imports: [Terminal],
  template: \`
    <arc-terminal
      title="arc — zsh"
      [lines]="lines"
      (arcComplete)="onComplete()"
    />
  \`,
})
export class HeroComponent {
  lines = [
    { type: 'comment', text: '# Install ARC UI' },
    { type: 'command', text: 'pnpm add @arclux/arc-ui' },
    { type: 'output', text: '+ @arclux/arc-ui 3.0.0' },
    { type: 'command', text: 'pnpm dev' },
    { type: 'output', text: 'ready — http://localhost:5173/' },
  ];

  onComplete() {
    console.log('done');
  }
}`,
    },
    {
      label: 'Solid',
      lang: 'tsx',
      code: `import { Terminal } from '@arclux/arc-ui-solid';

const lines = [
  { type: 'comment', text: '# Install ARC UI' },
  { type: 'command', text: 'pnpm add @arclux/arc-ui' },
  { type: 'output', text: '+ @arclux/arc-ui 3.0.0' },
  { type: 'command', text: 'pnpm dev' },
  { type: 'output', text: 'ready — http://localhost:5173/' },
];

function Hero() {
  return <Terminal title="arc — zsh" lines={lines} />;
}`,
    },
    {
      label: 'Preact',
      lang: 'tsx',
      code: `import { Terminal } from '@arclux/arc-ui-preact';

const lines = [
  { type: 'comment', text: '# Install ARC UI' },
  { type: 'command', text: 'pnpm add @arclux/arc-ui' },
  { type: 'output', text: '+ @arclux/arc-ui 3.0.0' },
  { type: 'command', text: 'pnpm dev' },
  { type: 'output', text: 'ready — http://localhost:5173/' },
];

function Hero() {
  return <Terminal title="arc — zsh" lines={lines} />;
}`,
    },
  ],

  seeAlso: ['code-block', 'typewriter', 'kbd'],
};
