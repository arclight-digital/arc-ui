import type { ComponentDef } from './_types';

export const codeBlock: ComponentDef = {
    name: 'Code Block',
    slug: 'code-block',
    tag: 'arc-code-block',
    tier: 'typography',
    interactivity: 'hybrid',
    description: 'Syntax-highlighted code display with optional filename and copy button.',

    overview: `CodeBlock displays source code in a styled container with a header bar, optional filename, language badge, and a one-click copy button. The header renders the filename in monospace font on the left, the language identifier as an uppercase Tektur badge on the right, and a "Copy" button that writes the code content to the clipboard via the Clipboard API. After a successful copy, the button text and border color switch to a green "Copied" state for two seconds before reverting.

The code body renders inside a \`<pre>\` element with the monospace font stack (JetBrains Mono), a line-height of 1.8, and horizontal overflow scrolling for long lines. Code content can be provided via the \`code\` property or through the default slot, making it flexible for both static strings and dynamic content injection. The tab-size is set to 2 for compact indentation.

CodeBlock is marked as a hybrid component: the code display works without JavaScript (the layout and styling are pure CSS), but the copy-to-clipboard functionality requires JS and a secure context (HTTPS). The component gracefully handles copy failures with a silent try-catch, so it degrades without errors on HTTP or restricted environments.`,

    features: [
      'One-click copy-to-clipboard via the Clipboard API with a 2-second "Copied" confirmation',
      'Header bar with filename (monospace), language badge (uppercase Tektur), and copy button',
      'Horizontal scroll overflow for long code lines without wrapping',
      'Code content via the "code" prop or default slot for flexible content injection',
      'JetBrains Mono font stack with 1.8 line-height and tab-size of 2',
      'Graceful degradation: copy fails silently on insecure contexts without breaking the UI',
      'Six exposed CSS parts: code-block, header, filename, lang, copy, body, pre, code',
      'Surface and card background tokens for seamless integration with dark themes',
    ],

    guidelines: {
      do: [
        'Set the language prop to help users identify the code syntax at a glance',
        'Provide a filename when showing code from a specific file for context',
        'Use the code prop for static snippets and the slot for dynamically rendered content',
        'Place CodeBlock in documentation pages, API references, and tutorial content',
        'Test copy functionality on HTTPS — the Clipboard API requires a secure context',
      ],
      dont: [
        'Embed interactive elements inside the code slot — it renders inside a <pre><code> block',
        'Use CodeBlock for single-line inline code; use arc-text variant="code" instead',
        'Omit the language prop when the syntax is not obvious from context',
        'Override the font-family unless you are intentionally switching to a different monospace font',
        'Assume copy will always work — it requires HTTPS and a user gesture in modern browsers',
      ],
    },

    previewHtml: `<div style="display: flex; flex-direction: column; gap: 24px;">
  <div>
    <arc-text variant="label" style="margin-bottom: 8px; display: block;">Default</arc-text>
    <arc-code-block language="js" filename="app.js" code="import { Button, Card } from '@arclux/arc-ui';\n\nfunction init(config = {}) {\n  const app = document.querySelector('#app');\n  const { theme = 'dark', debug = false } = config;\n\n  if (debug) {\n    console.log('ARC UI loaded', { theme });\n  }\n\n  return app;\n}"></arc-code-block>
  </div>
  <div>
    <arc-text variant="label" style="margin-bottom: 8px; display: block;">Window</arc-text>
    <arc-code-block variant="window" language="js" filename="app.js" code="import { Button, Card } from '@arclux/arc-ui';\n\nfunction init(config = {}) {\n  const app = document.querySelector('#app');\n  const { theme = 'dark', debug = false } = config;\n\n  if (debug) {\n    console.log('ARC UI loaded', { theme });\n  }\n\n  return app;\n}"></arc-code-block>
  </div>
  <div>
    <arc-text variant="label" style="margin-bottom: 8px; display: block;">Basic</arc-text>
    <arc-code-block variant="basic" language="js" code="npm install @arclux/arc-ui"></arc-code-block>
  </div>
</div>`,

    props: [
      { name: 'variant', type: "'default' | 'window' | 'basic'", default: "'default'", description: 'Visual variant. `default` shows the standard layout with optional filename header and status bar. `window` adds a macOS-style title bar with colored orbs and centered filename. `basic` strips all chrome for a compact, minimal display.' },
      { name: 'language', type: 'string', default: "''", description: 'Programming language identifier (e.g. `js`, `css`, `html`). Displayed in uppercase in the header bar.' },
      { name: 'filename', type: 'string', default: "''", description: 'Optional filename displayed in the header in monospace font. When empty, the header shows only the language.' },
      { name: 'code', type: 'string', default: "''", description: 'Code content to display. Used as the `<pre><code>` content and copied to clipboard when the copy button is clicked.' },
    ],
    tabs: [
      {
        label: 'Web Component',
        lang: 'html',
        code: `<arc-code-block language="js" filename="example.js">
import { Button } from '@arclux/arc-ui';
</arc-code-block>`,
      },
      {
        label: 'React',
        lang: 'tsx',
        code: `import { CodeBlock } from '@arclux/arc-ui-react';

<CodeBlock language="js" filename="example.js">
import { Button } from '@arclux/arc-ui';
</CodeBlock>`,
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
    <CodeBlock language="js" filename="example.js">
    import { Button } from '@arclux/arc-ui';
    </CodeBlock>
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
</CodeBlock>`,
      },
      {
        label: 'Preact',
        lang: 'tsx',
        code: `import { CodeBlock } from '@arclux/arc-ui-preact';

<CodeBlock language="js" filename="example.js">
import { Button } from '@arclux/arc-ui';
</CodeBlock>`,
      },
      { label: 'HTML', lang: 'html', code: `<!-- Auto-generated by @arclux/prism — do not edit manually -->
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
</div>` },
      { label: 'HTML (Inline)', lang: 'html', code: `<!-- Auto-generated by @arclux/prism — do not edit manually -->
<!-- arc-code-block — self-contained, no external CSS needed -->
<style>
  .arc-code-block .code-block__copy:hover { color: rgb(232, 232, 236);
        border-color: rgb(51, 51, 64); }
</style>
<div class="arc-code-block" style="display: block">
  <div class="code-block" style="background: rgb(10, 10, 15); border: 1px solid rgb(34, 34, 41); border-radius: 14px; overflow: hidden">
   <div style="display: flex; align-items: center; justify-content: space-between; padding: 4px 16px; border-bottom: 1px solid rgb(24, 24, 30); background: rgb(13, 13, 18)">
   <span style="font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: 12px; color: rgb(124, 124, 137)">Filename</span>
   <span style="font-family: 'Tektur', system-ui, sans-serif; font-size: 10px; letter-spacing: 2px; text-transform: uppercase; color: rgb(107, 107, 128)">Language</span>
   <button
   class="code-block__copy" style="display: flex; align-items: center; gap: 4px; background: none; border: 1px solid rgb(34, 34, 41); border-radius: 4px; color: rgb(124, 124, 137); font-family: 'Tektur', system-ui, sans-serif; font-size: 10px; letter-spacing: 1px; text-transform: uppercase; padding: 4px 8px; cursor: pointer"

   aria-label="_copied"
   >_copied</button>
   </div>
   <div style="padding: 16px; overflow-x: auto">
   <pre style="margin: 0; font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: 13px; line-height: 1.8; color: rgb(232, 232, 236); white-space: pre; tab-size: 2"><code>Code</code></pre>
   </div>
   </div>
</div>` }
    ],
  
  seeAlso: ["copy-button","kbd","highlight"],
};
