import type { ComponentDef } from './_types';

export const diff: ComponentDef = {
  name: 'Diff',
  slug: 'diff',
  tag: 'arc-diff',
  tier: 'data',
  interactivity: 'static',
  description:
    'Shows the lines added and removed between two strings, in one column or side by side.',

  overview: `Diff compares the \`original\` and \`revised\` strings line by line and shows what changed. Added lines get a green tint and a \`+\` prefix, removed lines a red tint, strikethrough and a \`-\` prefix, and unchanged lines are muted with a blank prefix. The diff is a longest-common-subsequence computation inside the component, with no diff library.

\`mode\` picks the layout. \`inline\`, the default, puts additions and removals in one column in reading order. \`side-by-side\` splits it into two equal panes: the original with its removals on the left, the revision with its additions on the right.

It compares whole lines, so a one-character change shows as a removed line and an added one. Use it for code, config files and other line-based text.`,

  features: [
    "Line numbers are in a gutter and can't be selected, so copied text doesn't include them",
    'Uses the mono font and code text size, and scrolls sideways for long lines',
    'CSS parts: `container`, `line`, `line-number`, `prefix`',
  ],

  guidelines: {
    do: [
      'Set `mode="side-by-side"` when there\'s room for two panes',
      "Add a heading or label that says what's being compared",
      'Put long diffs in a container with a `max-height` and `overflow-y: auto`',
    ],
    dont: [
      "Don't pass binary or other non-text content as `original` or `revised`",
      "Don't use it for word-level or character-level highlighting",
      "Don't use side-by-side mode in narrow containers",
    ],
  },

  previewHtml: `<arc-diff
  original="const name = 'World';\\nconsole.log('Hello');\\nreturn name;"
  revised="const name = 'ARC UI';\\nconsole.log('Hello');\\nconsole.log('Welcome');\\nreturn name;">
</arc-diff>`,

  tabs: [
    {
      label: 'Web Component',
      lang: 'html',
      code: `<arc-diff
  original="const name = 'World';
console.log('Hello');
return name;"
  revised="const name = 'ARC UI';
console.log('Hello');
console.log('Welcome');
return name;">
</arc-diff>

<!-- Side-by-side mode -->
<arc-diff mode="side-by-side"
  original="line one
line two
line three"
  revised="line one
line 2
line three
line four">
</arc-diff>`,
    },
    {
      label: 'React',
      lang: 'tsx',
      code: `import { Diff } from '@arclux/arc-ui-react';

export default function Example() {
  return (
    <>
      <Diff
        original={\`const name = 'World';
      console.log('Hello');
      return name;\`}
        revised={\`const name = 'ARC UI';
      console.log('Hello');
      console.log('Welcome');
      return name;\`}
      />

      {/* Side-by-side mode */}
      <Diff mode="side-by-side"
        original="line one\\nline two\\nline three"
        revised="line one\\nline 2\\nline three\\nline four"
      />
    </>
  );
}`,
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
  <Diff :original="original" :revised="modified" />
  <Diff mode="side-by-side" :original="original" :revised="modified" />
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

<Diff original={original} revised={modified} />
<Diff mode="side-by-side" original={original} revised={modified} />`,
    },
    {
      label: 'Angular',
      lang: 'ts',
      code: `import { Component } from '@angular/core';
import { Diff } from '@arclux/arc-ui-angular';

@Component({
  imports: [Diff],
  template: \`
    <arc-diff
      [before]="original"
      [after]="modified">
    </arc-diff>
    <arc-diff mode="side-by-side"
      [before]="original"
      [after]="modified">
    </arc-diff>
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

<Diff original={original} revised={modified} />
<Diff mode="side-by-side" original={original} revised={modified} />`,
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

<Diff original={original} revised={modified} />
<Diff mode="side-by-side" original={original} revised={modified} />`,
    },
  ],

  seeAlso: ['code-block', 'highlight'],
};
