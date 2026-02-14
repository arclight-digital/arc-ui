import type { ComponentDef } from './_types';

export const treeView: ComponentDef = {
    name: 'Tree View',
    slug: 'tree-view',
    tag: 'arc-tree-view',
    tier: 'navigation',
    interactivity: 'interactive',
    description: 'Hierarchical tree structure with expandable/collapsible nodes, selection tracking, keyboard navigation, and indentation guide lines.',

    overview: `TreeView renders a nested, collapsible tree structure ideal for file browsers, navigation menus, documentation outlines, and any hierarchical data. Nodes are defined declaratively using \`<arc-tree-item>\` child elements, which can be nested to arbitrary depth. Each item can have a label, an optional icon (emoji or text), and an \`expanded\` attribute to control its initial open state.

Clicking a parent node both selects it and toggles its expanded state, revealing or hiding its children. Leaf nodes (those without children) are simply selected on click. The currently selected node receives an accent-primary highlight, and vertical guide lines appear alongside nested groups to visually communicate the tree's depth structure. Chevron indicators rotate smoothly when branches expand or collapse.

TreeView supports full keyboard navigation following the WAI-ARIA tree pattern. ArrowDown/ArrowUp move focus between visible rows, ArrowRight expands a collapsed branch, ArrowLeft collapses an expanded one, and Enter or Space selects the focused node. The component fires \`arc-select\` with the item details and its full path array, and \`arc-toggle\` when a branch is expanded or collapsed.`,

    features: [
      'Declarative tree structure using nested `<arc-tree-item>` elements with label, icon, and expanded props',
      'Selection tracking with accent-primary highlight and `arc-select` event including the full item path',
      'Animated chevron rotation when branches expand or collapse',
      'Vertical indentation guide lines using `--border-subtle` for clear depth visualisation',
      'Full keyboard navigation: ArrowDown/Up to traverse, ArrowRight/Left to expand/collapse, Enter/Space to select',
      'Proper WAI-ARIA tree roles: `role="tree"`, `role="treeitem"`, `role="group"`, and `aria-expanded`',
      'Branch toggle event (`arc-toggle`) with item details and expanded state for external state management',
      'CSS parts for `tree`, `group`, `item`, and `row` enabling external style customisation',
    ],

    guidelines: {
      do: [
        'Use `<arc-tree-item>` elements with descriptive `label` attributes for each node',
        'Set `expanded` on top-level branches that should be visible by default for discoverability',
        'Provide meaningful icons to help users scan the tree -- e.g. folder/file emojis for file browsers',
        'Listen to `arc-select` to update the main content area when a tree node is chosen',
        'Keep tree depth to 3-4 levels maximum for usability -- deeper nesting becomes hard to scan',
      ],
      dont: [
        'Do not use TreeView for flat lists -- use a simple list or navigation menu instead',
        'Do not populate the tree with hundreds of top-level nodes without virtualisation or lazy loading',
        'Do not use TreeView for selection of multiple items simultaneously -- it tracks a single selection',
        'Do not rely solely on icons for meaning -- always include a text label on each tree item',
        'Avoid extremely long label text -- it truncates with text-overflow ellipsis but is then unreadable',
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

    props: [

    ],
    events: [
      { name: 'arc-toggle', description: 'Fired when a tree node is expanded or collapsed' },
      { name: 'arc-select', description: 'Fired when a tree item is selected' },
    ],
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

<TreeView>
  <TreeItem label="src" icon="📁" expanded>
    <TreeItem label="index.ts" icon="📄"></TreeItem>
  </TreeItem>
  <TreeItem label="package.json" icon="📄"></TreeItem>
</TreeView>`,
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
      <TreeItem label="index.ts" icon="📄"></TreeItem>
    </TreeItem>
    <TreeItem label="package.json" icon="📄"></TreeItem>
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
    <TreeItem label="index.ts" icon="📄"></TreeItem>
  </TreeItem>
  <TreeItem label="package.json" icon="📄"></TreeItem>
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
    <TreeView>
      <TreeItem label="src" icon="📁" expanded>
        <TreeItem label="index.ts" icon="📄"></TreeItem>
      </TreeItem>
      <TreeItem label="package.json" icon="📄"></TreeItem>
    </TreeView>
  \`,
})
export class MyComponent {}`,
      },
      {
        label: 'Solid',
        lang: 'tsx',
        code: `import { TreeItem, TreeView } from '@arclux/arc-ui-solid';

<TreeView>
  <TreeItem label="src" icon="📁" expanded>
    <TreeItem label="index.ts" icon="📄"></TreeItem>
  </TreeItem>
  <TreeItem label="package.json" icon="📄"></TreeItem>
</TreeView>`,
      },
      {
        label: 'Preact',
        lang: 'tsx',
        code: `import { TreeItem, TreeView } from '@arclux/arc-ui-preact';

<TreeView>
  <TreeItem label="src" icon="📁" expanded>
    <TreeItem label="index.ts" icon="📄"></TreeItem>
  </TreeItem>
  <TreeItem label="package.json" icon="📄"></TreeItem>
</TreeView>`,
      },
    ],
    subComponents: [
      {
        name: 'TreeItem',
        tag: 'arc-tree-item',
        description: 'Node within a TreeView. Can nest for sub-trees.',
        props: [
          { name: 'label', type: 'string', description: 'Item label text' },
          { name: 'icon', type: 'string', description: 'Icon or emoji' },
          { name: 'expanded', type: 'boolean', default: 'false', description: 'Expand child items' },
        ],
      },
    ],
  
  seeAlso: ["accordion","sidebar","collapsible"],
};
