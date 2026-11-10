import type { ComponentDef } from './_types';

export const treeView: ComponentDef = {
  name: 'Tree View',
  slug: 'tree-view',
  tag: 'arc-tree-view',
  tier: 'navigation',
  interactivity: 'interactive',
  description:
    'Shows nested items as a tree whose branches open and close, with one selected item at a time.',

  overview: `TreeView shows nested data as a tree whose branches open and close, such as a file browser, a navigation menu or a documentation outline. Each node is an \`<arc-tree-item>\`, nested to any depth, with a \`label\`, an optional \`icon\` (rendered as text) and an \`expanded\` attribute for its starting state.

Clicking a branch selects it and opens or closes it. Clicking a leaf selects it. The selected row is tinted and drawn in \`--interactive\`, a vertical guide line runs beside each nested group, and the chevron turns as a branch opens or closes.

ArrowDown and ArrowUp move between visible rows, ArrowRight opens a branch, ArrowLeft closes it, and Enter or Space selects. Home, End and typeahead from the WAI-ARIA tree pattern aren't supported, and ArrowRight and ArrowLeft don't move to a child or back to the parent. \`arc-select\` fires with the item and its \`path\`, the chain of labels from the root, and \`arc-toggle\` fires when a branch opens or closes.`,

  features: [
    'Roles `tree`, `treeitem` and `group`, with `aria-expanded` on branches',
    'Guide lines are drawn in `--divider`',
    'Long labels truncate with an ellipsis',
  ],

  guidelines: {
    do: [
      'Give every node a descriptive `label`',
      'Set `expanded` on the top-level branches readers should see first',
      'Add an `icon` when readers scan by type, such as folder and file glyphs in a file browser',
      'Listen to `arc-select` to update the main content when a node is picked',
      'Keep the tree to three or four levels. Deeper trees are hard to scan',
    ],
    dont: [
      "Don't use it for flat lists. Use List or NavigationMenu",
      "Don't load hundreds of top-level nodes at once. Load them in pages or on demand",
      "Don't use it to select several items. It tracks one selection",
      "Don't rely on icons alone. Every item needs a text label",
      "Don't use very long labels. They truncate and can't be read in full",
    ],
  },

  previewHtml: `<arc-tree-view>
  <arc-tree-item label="src" icon="&#128193;" expanded>
    <arc-tree-item label="components" icon="&#128193;" expanded>
      <arc-tree-item label="Button.ts" icon="&#128196;"></arc-tree-item>
      <arc-tree-item label="Modal.ts" icon="&#128196;"></arc-tree-item>
    </arc-tree-item>
    <arc-tree-item label="index.ts" icon="&#128196;"></arc-tree-item>
  </arc-tree-item>
  <arc-tree-item label="tests" icon="&#128193;">
    <arc-tree-item label="Button.test.ts" icon="&#128196;"></arc-tree-item>
  </arc-tree-item>
  <arc-tree-item label="package.json" icon="&#128196;"></arc-tree-item>
</arc-tree-view>`,

  tabs: [
    {
      label: 'Web Component',
      lang: 'html',
      code: `<arc-tree-view>
  <arc-tree-item label="src" icon="📁" expanded>
    <arc-tree-item label="index.ts" icon="📄"></arc-tree-item>
  </arc-tree-item>
  <arc-tree-item label="package.json" icon="📄"></arc-tree-item>
</arc-tree-view>`,
    },
    {
      label: 'React',
      lang: 'tsx',
      code: `import { TreeItem, TreeView } from '@arclux/arc-ui-react';

export default function Example() {
  return (
    <TreeView>
      <TreeItem label="src" icon="📁" expanded>
        <TreeItem label="index.ts" icon="📄" />
      </TreeItem>
      <TreeItem label="package.json" icon="📄" />
    </TreeView>
  );
}`,
    },
    {
      label: 'Vue',
      lang: 'html',
      code: `<script setup>
import { TreeItem, TreeView } from '@arclux/arc-ui-vue';
</script>

<template>
  <TreeView>
    <TreeItem label="src" icon="📁" expanded>
      <TreeItem label="index.ts" icon="📄" />
    </TreeItem>
    <TreeItem label="package.json" icon="📄" />
  </TreeView>
</template>`,
    },
    {
      label: 'Svelte',
      lang: 'html',
      code: `<script>
  import { TreeItem, TreeView } from '@arclux/arc-ui-svelte';
</script>

<TreeView>
  <TreeItem label="src" icon="📁" expanded>
    <TreeItem label="index.ts" icon="📄" />
  </TreeItem>
  <TreeItem label="package.json" icon="📄" />
</TreeView>`,
    },
    {
      label: 'Angular',
      lang: 'ts',
      code: `import { Component } from '@angular/core';
import { TreeItem, TreeView } from '@arclux/arc-ui-angular';

@Component({
  imports: [TreeItem, TreeView],
  template: \`
    <arc-tree-view>
      <arc-tree-item label="src" icon="📁" expanded>
        <arc-tree-item label="index.ts" icon="📄"></arc-tree-item>
      </arc-tree-item>
      <arc-tree-item label="package.json" icon="📄"></arc-tree-item>
    </arc-tree-view>
  \`,
})
export class MyComponent {}`,
    },
    {
      label: 'Solid',
      lang: 'tsx',
      code: `import { TreeItem, TreeView } from '@arclux/arc-ui-solid';

export default function Example() {
  return (
    <TreeView>
      <TreeItem label="src" icon="📁" expanded>
        <TreeItem label="index.ts" icon="📄" />
      </TreeItem>
      <TreeItem label="package.json" icon="📄" />
    </TreeView>
  );
}`,
    },
    {
      label: 'Preact',
      lang: 'tsx',
      code: `import { TreeItem, TreeView } from '@arclux/arc-ui-preact';

export default function Example() {
  return (
    <TreeView>
      <TreeItem label="src" icon="📁" expanded>
        <TreeItem label="index.ts" icon="📄" />
      </TreeItem>
      <TreeItem label="package.json" icon="📄" />
    </TreeView>
  );
}`,
    },
  ],
  subComponents: [
    {
      name: 'TreeItem',
      tag: 'arc-tree-item',
      description: 'Node within a TreeView. Can nest for sub-trees.',
    },
  ],

  seeAlso: ['accordion', 'sidebar', 'collapsible'],
};
