import type { ComponentDef } from './_types';

export const sortableList: ComponentDef = {
  name: 'Sortable List',
  slug: 'sortable-list',
  tag: 'arc-sortable-list',
  tier: 'input',
  interactivity: 'interactive',
  description:
    'A list people reorder by dragging a grip handle or with the keyboard, with a line marking where the item will land.',

  overview: `SortableList lets people reorder a short list by drag and drop or from the keyboard. Each child element becomes a bordered row with a six-dot grip on the left and the child's own markup on the right. While dragging, the source row fades to 50% opacity with a large shadow, and an accent line above or below the target row shows where it will land.

From the keyboard, Space selects the focused row (accent border), Enter picks it up (thicker accent ring), and the up and down arrows move it. Space or Enter drops it. A polite live region announces the selection, the pick-up, each arrow step ("Bravo, position 2 of 4.") and the drop with the new position ("Position 2 of 4"). Escape during a move puts every row back in the order it had at pick-up, announces "Move cancelled." and fires no \`arc-change\`.

After every drop, \`arc-change\` fires with \`detail.order\`: the original indices in their new order. Map that back onto your data instead of tracking each move.`,

  features: [
    'Native HTML5 drag and drop',
    'The list is a `listbox` and each row a focusable `option`, with `aria-roledescription` "sortable list" and "sortable item"',
    'Announcements use each row\'s text content, or "Item N" when it has none',
    'Disabled drops to 50% opacity and blocks pointer events',
  ],

  guidelines: {
    do: [
      'Keep lists under about 50 items',
      'Give every item distinct text, since that text is what screen readers announce',
      'Listen for `arc-change` and save the new order',
    ],
    dont: [
      'Don\'t put buttons or links inside items. Each row is already a focusable `option` and a drag source, so a control inside it is nested interactive content',
      'Don\'t use it for a long list people would rather search or filter',
      'Don\'t place two sortable lists side by side without clear separation between them',
    ],
  },

  previewHtml: `<arc-sortable-list>
  <div>Design tokens</div>
  <div>Components</div>
  <div>Patterns</div>
  <div>Utilities</div>
</arc-sortable-list>`,

  tabs: [
    {
      label: 'Web Component',
      lang: 'html',
      code: `<arc-sortable-list>
  <div>First item</div>
  <div>Second item</div>
  <div>Third item</div>
</arc-sortable-list>

<script>
  document.querySelector('arc-sortable-list')
    .addEventListener('arc-change', e => {
      console.log('New order:', e.detail.order);
    });
</script>`,
    },
    {
      label: 'React',
      lang: 'tsx',
      code: `import { SortableList } from '@arclux/arc-ui-react';

export default function Example() {
  return (
    <SortableList onArcChange={(e) => console.log(e.detail.order)}>
      <div>First item</div>
      <div>Second item</div>
      <div>Third item</div>
    </SortableList>
  );
}`,
    },
    {
      label: 'Vue',
      lang: 'html',
      code: `<script setup>
import { SortableList } from '@arclux/arc-ui-vue';

function onReorder(e) {
  console.log('New order:', e.detail.order);
}
</script>

<template>
  <SortableList @arc-change="onReorder">
    <div>First item</div>
    <div>Second item</div>
    <div>Third item</div>
  </SortableList>
</template>`,
    },
    {
      label: 'Svelte',
      lang: 'html',
      code: `<script>
  import { SortableList } from '@arclux/arc-ui-svelte';
</script>

<SortableList on:arc-change={(e) => console.log(e.detail.order)}>
  <div>First item</div>
  <div>Second item</div>
  <div>Third item</div>
</SortableList>`,
    },
    {
      label: 'Angular',
      lang: 'ts',
      code: `import { Component } from '@angular/core';
import { SortableList } from '@arclux/arc-ui-angular';

@Component({
  imports: [SortableList],
  template: \`
    <arc-sortable-list (arc-change)="onReorder($event)">
      <div>First item</div>
      <div>Second item</div>
      <div>Third item</div>
    </arc-sortable-list>
  \`,
})
export class MyComponent {
  onReorder(e: CustomEvent) {
    console.log('New order:', e.detail.order);
  }
}`,
    },
    {
      label: 'Solid',
      lang: 'tsx',
      code: `import { SortableList } from '@arclux/arc-ui-solid';

export default function Example() {
  return (
    <SortableList onArcChange={(e) => console.log(e.detail.order)}>
      <div>First item</div>
      <div>Second item</div>
      <div>Third item</div>
    </SortableList>
  );
}`,
    },
    {
      label: 'Preact',
      lang: 'tsx',
      code: `import { SortableList } from '@arclux/arc-ui-preact';

export default function Example() {
  return (
    <SortableList onArcChange={(e) => console.log(e.detail.order)}>
      <div>First item</div>
      <div>Second item</div>
      <div>Third item</div>
    </SortableList>
  );
}`,
    },
  ],

  seeAlso: ['data-grid', 'tree-view'],
};
