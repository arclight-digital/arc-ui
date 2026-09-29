import type { ComponentDef } from './_types';

export const codeGroup: ComponentDef = {
  name: 'Code Group',
  slug: 'code-group',
  tag: 'arc-code-group',
  tier: 'typography',
  interactivity: 'interactive',
  searchKeywords: ['code tabs', 'package manager', 'install tabs'],
  description:
    'One code block with tabs for its variants, such as npm, pnpm and yarn. Groups with the same sync-key switch together and remember the choice.',

  overview: `Code Group puts several \`arc-code-block\` elements behind one set of tabs, so variants of the same thing (an install command for three package managers, or one command for two editions of a product) take the space of one block. Each child becomes a tab, named by its \`label\`, or its \`filename\` or \`language\` when it has no label. The group draws the frame, the tab strip and a single copy button that copies whichever block is showing; the blocks drop their own header.

Give related groups the same \`sync-key\` and they switch together: pick pnpm in one and every group on the page with that key shows pnpm, matched by tab name. The choice is saved in localStorage under the key, so the next page opens on it too. A group without the tab a reader picked keeps what it had.

The tabs follow the ARIA tabs pattern: one tab stop, the arrow keys move and select, Home and End jump to the ends. Picking a tab fires \`arc-change\` with the tab's name and index. Before the component upgrades, and without JavaScript, the blocks show one after another with their own headers, so nothing is hidden. A server render opens on the first tab and a remembered choice applies once the page is live.

Code Group is light: it does not import arc-code-block, so it sits in the main barrel. Import \`@arclux/arc-ui/code-block\` for the blocks themselves, and shiki if you want them colored.`,

  features: [
    'One block with a tab per `arc-code-block` child, named by label, filename or language',
    'A single icon-only copy button that copies the visible block',
    '`sync-key` switches every group with the same key, matched by tab name',
    'The choice persists in localStorage under the key',
    'ARIA tabs: one tab stop, arrow keys, Home and End',
    '`arc-change` with the tab name and index when a reader picks a tab',
    'Without JavaScript the blocks show in sequence with their own headers',
  ],

  guidelines: {
    do: [
      'Use it for real alternatives a reader picks one of: package managers, operating systems, editions',
      'Give every block a short `label`; the tab names are all a reader has to choose by',
      'Use the same `sync-key` and the same tab names across a page or a whole docs site',
      'Keep the blocks parallel, so switching tabs changes only what differs',
    ],
    dont: [
      'Do not use it for steps a reader runs in order; those belong in separate blocks, one after another',
      'Do not put anything but `arc-code-block` elements inside; other children are ignored',
      'Do not give tabs in synced groups different names for the same thing, or they will not follow each other',
    ],
  },

  previewHtml: `<div style="display: flex; flex-direction: column; gap: 16px; width: 100%;">
  <arc-code-group label="Package manager" sync-key="docs-demo-pm">
    <arc-code-block label="npm" language="bash" prompt code="npm install @arclux/arc-ui"></arc-code-block>
    <arc-code-block label="pnpm" language="bash" prompt code="pnpm add @arclux/arc-ui"></arc-code-block>
    <arc-code-block label="yarn" language="bash" prompt code="yarn add @arclux/arc-ui"></arc-code-block>
  </arc-code-group>
  <arc-code-group label="Package manager" sync-key="docs-demo-pm">
    <arc-code-block label="npm" language="bash" prompt code="npm install shiki @shikijs/langs"></arc-code-block>
    <arc-code-block label="pnpm" language="bash" prompt code="pnpm add shiki @shikijs/langs"></arc-code-block>
    <arc-code-block label="yarn" language="bash" prompt code="yarn add shiki @shikijs/langs"></arc-code-block>
  </arc-code-group>
</div>`,
  previewLayout: 'block',

  tabs: [
    {
      label: 'Web Component',
      lang: 'html',
      code: `<arc-code-group label="Package manager" sync-key="pm">
  <arc-code-block label="npm" language="bash" prompt code="npm install @arclux/arc-ui"></arc-code-block>
  <arc-code-block label="pnpm" language="bash" prompt code="pnpm add @arclux/arc-ui"></arc-code-block>
  <arc-code-block label="yarn" language="bash" prompt code="yarn add @arclux/arc-ui"></arc-code-block>
</arc-code-group>

<script type="module">
  import '@arclux/arc-ui/code-block';
  import '@arclux/arc-ui/code-group';
</script>`,
    },
    {
      label: 'React',
      lang: 'tsx',
      code: `import { CodeGroup } from '@arclux/arc-ui-react';
import { CodeBlock } from '@arclux/arc-ui-react/CodeBlock';

export function Install() {
  return (
    <CodeGroup label="Package manager" syncKey="pm">
      <CodeBlock label="npm" language="bash" prompt="" code="npm install @arclux/arc-ui" />
      <CodeBlock label="pnpm" language="bash" prompt="" code="pnpm add @arclux/arc-ui" />
    </CodeGroup>
  );
}`,
    },
    {
      label: 'Vue',
      lang: 'html',
      code: `<script setup>
import { CodeGroup } from '@arclux/arc-ui-vue';
import { CodeBlock } from '@arclux/arc-ui-vue/CodeBlock';
</script>

<template>
  <CodeGroup label="Package manager" sync-key="pm">
    <CodeBlock label="npm" language="bash" prompt="" code="npm install @arclux/arc-ui" />
    <CodeBlock label="pnpm" language="bash" prompt="" code="pnpm add @arclux/arc-ui" />
  </CodeGroup>
</template>`,
    },
  ],

  seeAlso: ['code-block', 'tabs', 'copy-button'],
};
