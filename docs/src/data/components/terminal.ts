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

  overview: `Terminal draws a window frame (three orbs, an optional centered \`title\` and a monospace body) and plays a transcript in it. Commands get an accent-colored prompt glyph and type one character at a time. Output lines appear whole after a short pause, and comment lines are muted. A blinking block cursor with an accent glow follows the typing and settles on a fresh prompt at the end, when \`arc-complete\` fires.

\`lines\` is an array of \`{ type, text, delay? }\` objects, where \`type\` is \`command\`, \`output\` or \`comment\`. Set it from script, a framework binding or a JSON attribute. \`speed\` is milliseconds per typed character, as on Typewriter. The default pause before a line is 500ms for a command and 150ms for anything else, and a line's \`delay\` replaces it.

The server renders the complete transcript, so the content never depends on JavaScript. On the client it's blanked before first paint and plays when the element scrolls into view, so a terminal halfway down a page types when the reader gets there. Set the \`autoplay\` property to \`false\` to start it yourself with \`play()\`, and set \`loop\` to replay it with a 2-second pause between cycles. Under \`prefers-reduced-motion\` nothing animates. The finished transcript shows at once, the cursor holds steady, and \`arc-complete\` still fires.`,

  features: [
    '`reset()` blanks the transcript without starting playback, so you can replay it on demand',
  ],

  guidelines: {
    do: [
      'Use it for install-and-run sequences on landing and getting-started pages',
      'Put any command the reader needs in a CodeBlock as well. Terminal has no copy button or syntax highlighting',
      'Use Typewriter for a single line of prose, such as a headline',
      'Keep transcripts to five to eight lines. Thirty reads as a log file',
      'Set a line\'s `delay` to stand in for real latency, such as a build step that runs for a beat before its output appears',
    ],
    dont: [
      'Don\'t put critical instructions behind the animation. A reader scrolling fast shouldn\'t have to wait for the typing',
      'Don\'t animate several terminals in the same viewport',
      'Don\'t loop a long transcript. Clearing and replaying more than a few lines is distracting',
    ],
  },

  previewHtml: `<arc-terminal title="~/arc" style="width: 100%; max-width: 560px;"></arc-terminal>`,

  previewSetup: `{
  const t = el.querySelector('arc-terminal');
  if (!t) return;
  t.lines = [
    { type: 'comment', text: '# Install ARC UI' },
    { type: 'command', text: 'pnpm add @arclux/arc-ui' },
    { type: 'output', text: 'Packages: +1' },
    { type: 'output', text: '+ @arclux/arc-ui' },
    { type: 'command', text: 'pnpm dev' },
    { type: 'output', text: 'ready in 312ms at http://localhost:5173/' },
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
