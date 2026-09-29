import type { ComponentDef } from './_types';

export const codeBlock: ComponentDef = {
  name: 'Code Block',
  slug: 'code-block',
  tag: 'arc-code-block',
  tier: 'typography',
  interactivity: 'hybrid',
  description:
    'Syntax-highlighted code with a title, a copy button, line numbers, line emphasis, diff tints, a shell prompt and a collapsed height.',

  overview: `CodeBlock shows source code in a framed block. A slim header carries a title (\`label\`, in the body font), an optional \`filename\` in monospace, the \`language\` as a quiet tag, and an icon-only copy button that writes the code to the clipboard and turns into a green check for a moment. Code goes in through the \`code\` property; there is no default slot.

Code renders line by line whether or not it is highlighted, so every reading aid works without the highlighter: \`line-numbers\` adds a gutter, \`highlight="2,4-6"\` emphasizes lines, \`diff\` (or \`language="diff"\`) tints added and removed lines, \`wrap\` soft-wraps long lines instead of scrolling them, and \`max-lines\` collapses a tall block behind a "Show all" button. None of this reaches the clipboard: the copy button copies \`code\` exactly as given.

**Shell blocks.** Set \`prompt\` to put a \`$\` (or your own prompt, such as \`#\`) before each command. Continuation lines after a trailing backslash and blank lines get none, and the prompt can't be selected or copied. Shell highlighting separates the parts of a command: a wrapper like \`sudo\` is muted, the command is bold, its subcommand takes the accent, and paths, URLs and image references read as values. For variants of the same command (npm, pnpm and yarn, or two editions of a product), put the blocks in an [arc-code-group](/docs/components/code-group) for one block with tabs.

**Highlighting is opt-in.** CodeBlock is the one component in ARC UI with a heavy dependency: shiki and its grammars are around 13.6 MB, which no other component touches. So shiki is an *optional peer dependency*, and CodeBlock is the one component the main barrel does not re-export. A bundler resolves the dynamic imports of everything it can reach, so being in the barrel would have made shiki everyone's install. Import it by its own subpath and install shiki alongside:

\`\`\`
npm install shiki @shikijs/langs
\`\`\`

\`\`\`js
import '@arclux/arc-ui/code-block';
\`\`\`

Without shiki, CodeBlock still renders: the header, the copy button, the reading aids and the code itself all work. The code is not colored, and the console says so once. With shiki, the colors fade in when the grammar loads and no line moves. \`@arclux/arc-ui/register\` does not register CodeBlock for the same reason; import the subpath.

CodeBlock is a hybrid component: the code display works without JavaScript, but copying needs JS and a secure context (HTTPS). Copy failures are caught, so it degrades without errors on HTTP or in restricted environments.`,

  features: [
    'Slim header: a `label` title in the body font, an optional `filename` in mono, the language as a quiet tag, and an icon-only copy',
    'Copies `code` exactly: prompts and line numbers are never selected or copied',
    'Shell prompt with `prompt`, skipping continuation and blank lines',
    'Shell colors that separate the wrapper, command, subcommand, flags, variables, operators and values',
    '`line-numbers`, `highlight="2,4-6"` line emphasis, and `diff` tints for added and removed lines',
    '`wrap` for soft-wrapped lines, aligned after the gutter and prompt',
    '`max-lines` collapses a tall block with a fade and a "Show all N lines" button',
    'Syntax highlighting via shiki, an optional peer dependency imported only by this component; colors fade in without moving a line',
    'Every reading aid works without shiki installed',
    'Window variant with a title bar and a line count; basic variant with no chrome',
  ],

  guidelines: {
    do: [
      'Give a block a `label` when it is one of several on a page, so a reader can tell them apart',
      'Use `prompt` for commands a reader will paste into a terminal, and leave it off for scripts and output',
      'Use arc-code-group for variants of the same command instead of stacking near-identical blocks',
      'Use `highlight` to point at the lines the surrounding text talks about',
      'Set `max-lines` on long samples in running text, so the page keeps its shape',
      'Install shiki and @shikijs/langs when you want highlighting; the component works without them, uncolored',
      'Import `@arclux/arc-ui/code-block` directly; the main barrel and `/register` exclude it',
    ],
    dont: [
      'Do not pass content between the tags. There is no default slot; use the `code` prop',
      "Do not type a `$` into the code itself. It ends up in the reader's clipboard; use `prompt`",
      'Do not use `wrap` for code where indentation matters to the reader, such as Python or YAML, unless the lines are short',
      'Do not use CodeBlock for single-line inline code; use arc-text variant="code" instead',
      'Do not assume copy will always work; it requires HTTPS and a user gesture in modern browsers',
    ],
  },

  previewHtml: `<div style="display: flex; flex-direction: column; gap: 24px;">
  <div>
    <arc-text variant="label" style="margin-bottom: 8px; display: block;">Shell, with a prompt</arc-text>
    <arc-code-block language="bash" label="Pulsar" prompt code="sudo bootc switch \\\n  ghcr.io/arclight-digital/pulsar:latest"></arc-code-block>
  </div>
  <div>
    <arc-text variant="label" style="margin-bottom: 8px; display: block;">Line numbers and emphasis</arc-text>
    <arc-code-block language="js" filename="app.js" line-numbers highlight="4-6" code="import { Button, Card } from '@arclux/arc-ui';\n\nfunction init(config = {}) {\n  const app = document.querySelector('#app');\n  const { theme = 'dark', debug = false } = config;\n  if (debug) console.log('ARC UI loaded', { theme });\n  return app;\n}"></arc-code-block>
  </div>
  <div>
    <arc-text variant="label" style="margin-bottom: 8px; display: block;">Diff, collapsed to five lines</arc-text>
    <arc-code-block language="diff" label="theme.css" max-lines="5" code="--- a/theme.css\n+++ b/theme.css\n :root {\n-  --accent-primary: #4d7ef7;\n+  --accent-primary: #7c5cff;\n   --radius-md: 8px;\n-  --radius-lg: 12px;\n+  --radius-lg: 14px;\n }"></arc-code-block>
  </div>
  <div>
    <arc-text variant="label" style="margin-bottom: 8px; display: block;">Window</arc-text>
    <arc-code-block variant="window" language="js" filename="app.js" code="import { Button, Card } from '@arclux/arc-ui';\n\nexport const app = document.querySelector('#app');"></arc-code-block>
  </div>
  <div>
    <arc-text variant="label" style="margin-bottom: 8px; display: block;">Basic</arc-text>
    <arc-code-block variant="basic" language="bash" prompt code="npm install @arclux/arc-ui"></arc-code-block>
  </div>
</div>`,

  tabs: [
    {
      label: 'Web Component',
      lang: 'html',
      code: `<arc-code-block language="bash" label="Install" prompt></arc-code-block>
<arc-code-block language="js" filename="app.js" line-numbers highlight="2"></arc-code-block>

<script type="module">
  import '@arclux/arc-ui/code-block';
  const [install, app] = document.querySelectorAll('arc-code-block');
  install.code = 'npm install @arclux/arc-ui';
  app.code = "import '@arclux/arc-ui/register';\\ndocument.body.classList.add('ready');";
</script>`,
    },
    {
      label: 'React',
      lang: 'tsx',
      code: `import { CodeBlock } from '@arclux/arc-ui-react';

<CodeBlock language="js" filename="example.js">
import { Button } from '@arclux/arc-ui';

export default function Example() {
  return (
    </CodeBlock>
  );
}`,
    },
    {
      label: 'Vue',
      lang: 'html',
      code: `<script setup>
import { CodeBlock } from '@arclux/arc-ui-vue';
</script>

<template>
  <CodeBlock language="js" filename="example.js">
  import { Button } from '@arclux/arc-ui';
  </CodeBlock>
</template>`,
    },
    {
      label: 'Svelte',
      lang: 'html',
      code: `<script>
  import { CodeBlock } from '@arclux/arc-ui-svelte';
</script>

<CodeBlock language="js" filename="example.js">
import { Button } from '@arclux/arc-ui';
</CodeBlock>`,
    },
    {
      label: 'Angular',
      lang: 'ts',
      code: `import { Component } from '@angular/core';
import { CodeBlock } from '@arclux/arc-ui-angular';

@Component({
  imports: [CodeBlock],
  template: \`
    <arc-code-block language="js" filename="example.js">
    import { Button } from '@arclux/arc-ui';
    </arc-code-block>
  \`,
})
export class MyComponent {}`,
    },
    {
      label: 'Solid',
      lang: 'tsx',
      code: `import { CodeBlock } from '@arclux/arc-ui-solid';

<CodeBlock language="js" filename="example.js">
import { Button } from '@arclux/arc-ui';

export default function Example() {
  return (
    </CodeBlock>
  );
}`,
    },
    {
      label: 'Preact',
      lang: 'tsx',
      code: `import { CodeBlock } from '@arclux/arc-ui-preact';

<CodeBlock language="js" filename="example.js">
import { Button } from '@arclux/arc-ui';

export default function Example() {
  return (
    </CodeBlock>
  );
}`,
    },
    {
      label: 'HTML',
      lang: 'html',
      code: `<!-- Auto-generated by @arclux/prism — do not edit manually -->
<!-- arc-code-block — requires code-block.css + base.css (or arc-ui.css) -->
<div class="arc-code-block">
  <div class="code-block">
   <div class="code-block__header">
   <span class="code-block__filename">Filename</span>
   <span class="code-block__lang">Language</span>
   <button
   class="code-block__copy"

   aria-label="_copied"
   >_copied</button>
   </div>
   <div class="code-block__body">
   <pre class="code-block__pre"><code>Code</code></pre>
   </div>
   </div>
</div>`,
    },
    {
      label: 'HTML (Inline)',
      lang: 'html',
      code: `<!-- Auto-generated by @arclux/prism — do not edit manually -->
<!-- arc-code-block — self-contained, no external CSS needed -->
<style>
  .arc-code-block .code-block__copy:hover { color: rgb(232, 232, 236);
        border-color: rgb(51, 51, 64); }
</style>
<div class="arc-code-block" style="display: block">
  <div class="code-block" style="background: rgb(10, 10, 15); border: 1px solid rgb(34, 34, 41); border-radius: 14px; overflow: hidden">
   <div style="display: flex; align-items: center; justify-content: space-between; padding: 4px 16px; border-bottom: 1px solid rgb(24, 24, 30); background: rgb(13, 13, 18)">
   <span style="font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: 12px; color: rgb(124, 124, 137)">Filename</span>
   <span style="font-family: 'Tomorrow', system-ui, sans-serif; font-size: 10px; letter-spacing: 1px; text-transform: uppercase; color: rgb(107, 107, 128)">Language</span>
   <button
   class="code-block__copy" style="display: flex; align-items: center; gap: 4px; background: none; border: 1px solid rgb(34, 34, 41); border-radius: 4px; color: rgb(124, 124, 137); font-family: 'Tomorrow', system-ui, sans-serif; font-size: 10px; letter-spacing: 1px; text-transform: uppercase; padding: 4px 8px; cursor: pointer"

   aria-label="_copied"
   >_copied</button>
   </div>
   <div style="padding: 16px; overflow-x: auto">
   <pre style="margin: 0; font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: 13px; line-height: 1.8; color: rgb(232, 232, 236); white-space: pre; tab-size: 2"><code>Code</code></pre>
   </div>
   </div>
</div>`,
    },
  ],

  seeAlso: ['code-group', 'copy-button', 'kbd', 'highlight'],
};
