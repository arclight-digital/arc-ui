import type { ComponentDef } from './_types';

export const diff: ComponentDef = {
    name: 'Diff',
    slug: 'diff',
    tag: 'arc-diff',
    tier: 'data',
    interactivity: 'static',
    description: 'Line-based text diff viewer with inline and side-by-side display modes.',

    overview: `Diff compares two blocks of text line by line and renders a color-coded visualization of the changes. Added lines appear with a green-tinted background and a \`+\` prefix, removed lines appear with a red-tinted background, strikethrough text, and a \`-\` prefix, and unchanged lines display in a muted secondary color with a blank prefix.

The component uses a longest-common-subsequence algorithm to compute the minimal diff between the \`before\` and \`after\` text props. No external diff libraries are required — the algorithm runs entirely inside the component.

Two display modes are available via the \`mode\` prop. The default \`inline\` mode renders all changes in a single scrollable column, interleaving additions and removals in reading order. The \`side-by-side\` mode splits the view into a CSS grid with two equal-width panes separated by a subtle border — the left pane shows the original text (with removals highlighted) and the right pane shows the modified text (with additions highlighted).

Line numbers are displayed in a fixed-width gutter column. The entire viewer uses the monospace font stack and code-sized typography tokens for a terminal-like reading experience. The container supports horizontal scrolling for long lines with thin styled scrollbars.

Diff is designed for code review panels, changelog overlays, configuration comparisons, and anywhere a developer-facing UI needs to show what changed between two versions of text content.`,

    features: [
      'LCS-based line diff algorithm with no external dependencies',
      'Inline mode interleaves additions and removals in a single column',
      'Side-by-side mode renders two panes in a CSS grid with a subtle divider',
      'Color-coded lines: green for added, red with strikethrough for removed, muted for unchanged',
      'Line number gutter with non-selectable numbers for clean copy-paste',
      'Prefix markers (+, -, space) in a fixed-width column for scanning',
      'Monospace font stack with code-size typography tokens',
      'Horizontal scroll with thin styled scrollbars for long lines',
      'Exposed CSS parts (container, line, line-number, prefix) for external style overrides',
      'Respects prefers-reduced-motion for transitions',
    ],

    guidelines: {
      do: [
        'Use short, focused text snippets — diffs work best with fewer than 100 lines',
        'Set mode="side-by-side" when horizontal space allows for easier comparison',
        'Pair with a heading or label to describe what is being compared',
        'Use for code snippets, configuration files, or any line-oriented text',
        'Wrap in a container with a max-height and overflow-y: auto for very long diffs',
      ],
      dont: [
        'Pass binary or non-text content as before/after values',
        'Use Diff for single-character or word-level highlighting — it operates on whole lines',
        'Embed interactive elements inside the before or after strings',
        'Use side-by-side mode in narrow containers where columns would be too cramped',
      ],
    },

    previewHtml: `<arc-diff
  before="const name = 'World';\\nconsole.log('Hello');\\nreturn name;"
  after="const name = 'ARC UI';\\nconsole.log('Hello');\\nconsole.log('Welcome');\\nreturn name;">
</arc-diff>`,

    props: [
      { name: 'before', type: 'string', default: "''", description: 'The original text to compare (split by newlines).' },
      { name: 'after', type: 'string', default: "''", description: 'The modified text to compare (split by newlines).' },
      { name: 'mode', type: 'string', default: "'inline'", description: "Display mode: 'inline' renders changes in a single column, 'side-by-side' renders two panes in a grid." },
    ],

    tabs: [
      {
        label: 'Web Component',
        lang: 'html',
        code: `<arc-diff
  before="const name = 'World';
console.log('Hello');
return name;"
  after="const name = 'ARC UI';
console.log('Hello');
console.log('Welcome');
return name;">
</arc-diff>

<!-- Side-by-side mode -->
<arc-diff mode="side-by-side"
  before="line one
line two
line three"
  after="line one
line 2
line three
line four">
</arc-diff>`,
      },
      {
        label: 'React',
        lang: 'tsx',
        code: `import { Diff } from '@arclux/arc-ui-react';

<Diff
  before={\`const name = 'World';
console.log('Hello');
return name;\`}
  after={\`const name = 'ARC UI';
console.log('Hello');
console.log('Welcome');
return name;\`}
/>

{/* Side-by-side mode */}
<Diff mode="side-by-side"
  before="line one\\nline two\\nline three"
  after="line one\\nline 2\\nline three\\nline four"
/>`,
      },
      {
        label: 'Vue',
        lang: 'html',
        code: `<script setup>
import { Diff } from '@arclux/arc-ui-vue';

const original = \`const name = 'World';
console.log('Hello');
return name;\`;

const modified = \`const name = 'ARC UI';
console.log('Hello');
console.log('Welcome');
return name;\`;
</script>

<template>
  <Diff :before="original" :after="modified" />
  <Diff mode="side-by-side" :before="original" :after="modified" />
</template>`,
      },
      {
        label: 'Svelte',
        lang: 'html',
        code: `<script>
  import { Diff } from '@arclux/arc-ui-svelte';

  const original = \`const name = 'World';
console.log('Hello');
return name;\`;

  const modified = \`const name = 'ARC UI';
console.log('Hello');
console.log('Welcome');
return name;\`;
</script>

<Diff before={original} after={modified} />
<Diff mode="side-by-side" before={original} after={modified} />`,
      },
      {
        label: 'Angular',
        lang: 'ts',
        code: `import { Component } from '@angular/core';
import { Diff } from '@arclux/arc-ui-angular';

@Component({
  imports: [Diff],
  template: \`
    <Diff
      [before]="original"
      [after]="modified">
    </Diff>
    <Diff mode="side-by-side"
      [before]="original"
      [after]="modified">
    </Diff>
  \`,
})
export class MyComponent {
  original = \`const name = 'World';
console.log('Hello');
return name;\`;

  modified = \`const name = 'ARC UI';
console.log('Hello');
console.log('Welcome');
return name;\`;
}`,
      },
      {
        label: 'Solid',
        lang: 'tsx',
        code: `import { Diff } from '@arclux/arc-ui-solid';

const original = \`const name = 'World';
console.log('Hello');
return name;\`;

const modified = \`const name = 'ARC UI';
console.log('Hello');
console.log('Welcome');
return name;\`;

<Diff before={original} after={modified} />
<Diff mode="side-by-side" before={original} after={modified} />`,
      },
      {
        label: 'Preact',
        lang: 'tsx',
        code: `import { Diff } from '@arclux/arc-ui-preact';

const original = \`const name = 'World';
console.log('Hello');
return name;\`;

const modified = \`const name = 'ARC UI';
console.log('Hello');
console.log('Welcome');
return name;\`;

<Diff before={original} after={modified} />
<Diff mode="side-by-side" before={original} after={modified} />`,
      },
    ],

    seeAlso: ["code-block", "highlight"],
};
