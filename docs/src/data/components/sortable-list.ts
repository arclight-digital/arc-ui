import type { ComponentDef } from './_types';

export const sortableList: ComponentDef = {
    name: 'Sortable List',
    slug: 'sortable-list',
    tag: 'arc-sortable-list',
    tier: 'input',
    interactivity: 'interactive',
    description: 'Drag-and-drop reorderable list with grip handles, keyboard reordering support, and visual insertion indicators.',

    overview: `Sortable List enables users to reorder a set of items through intuitive drag-and-drop or keyboard interaction. Each item renders with a six-dot grip handle on the left and the item content on the right, wrapped in a card-like container with subtle borders. When dragging, the source item fades to 50% opacity with an elevated shadow, while a blue insertion line appears above or below the target position to indicate where the item will land.

Beyond mouse-based reordering, Sortable List provides a complete keyboard workflow. Users can press Space to select an item (highlighted with a blue border), then Enter to enter move mode (elevated with a stronger blue glow), and finally Arrow Up/Down to shift the item through the list. Pressing Space or Enter again confirms the placement, while Escape cancels the operation. This two-phase keyboard model ensures that screen reader users and keyboard-only users have full control over item ordering.

The component fires a single \`arc-change\` event after every reorder, providing the new order as an array of original indices in the event detail. This makes it straightforward to sync the visual order back to your data model without tracking individual move operations.`,

    features: [
      'Drag-and-drop reordering with HTML5 Drag and Drop API and visual insertion indicators',
      'Six-dot grip handle icon rendered for each item as a drag affordance',
      'Full keyboard reordering: Space to select, Enter to move, Arrow keys to shift, Escape to cancel',
      'Blue border highlight for keyboard-selected items and elevated glow for items being moved',
      'Dragged items fade to 50% opacity with an elevated box shadow for clear visual feedback',
      'Fires `arc-change` with `detail.order` containing the new index mapping after every reorder',
      'ARIA attributes including `role="listbox"`, `role="option"`, and `aria-grabbed` for accessibility',
      'Disabled state at 40% opacity with pointer events blocked',
    ],

    guidelines: {
      do: [
        'Wrap plain elements (e.g. `<div>`) as direct children -- the component reads their `textContent` for display',
        'Listen for `arc-change` to persist the new order back to your data store',
        'Use Sortable List for short to medium lists (under ~50 items) where manual ordering matters',
        'Provide clear, distinguishable text content for each item so users can identify what they are reordering',
        'Test keyboard reordering to ensure your application handles the order array correctly',
      ],
      dont: [
        'Do not nest interactive elements (buttons, links) inside list items -- they conflict with drag handles and keyboard interaction',
        'Do not use Sortable List for very long lists where search or filtering would be more efficient than manual reordering',
        'Do not rely solely on the visual grip dots to communicate draggability -- ensure items have descriptive labels for screen readers',
        'Do not place multiple Sortable Lists adjacent without clear visual separation between them',
        'Avoid using Sortable List for single-item lists -- there is nothing to reorder',
      ],
    },

    previewHtml: `<arc-sortable-list>
  <div>Design tokens</div>
  <div>Components</div>
  <div>Patterns</div>
  <div>Utilities</div>
</arc-sortable-list>`,

    props: [
      { name: 'disabled', type: 'boolean', default: 'false', description: 'Disables all interaction, reducing opacity to 40% and blocking pointer events.' },
    ],
    events: [
      { name: 'arc-change', description: 'Fired when items are reordered, with updated order in detail' },
    ],
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

<SortableList onArcChange={(e) => console.log(e.detail.order)}>
  <div>First item</div>
  <div>Second item</div>
  <div>Third item</div>
</SortableList>`,
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
    <SortableList (arc-change)="onReorder($event)">
      <div>First item</div>
      <div>Second item</div>
      <div>Third item</div>
    </SortableList>
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

<SortableList onArcChange={(e) => console.log(e.detail.order)}>
  <div>First item</div>
  <div>Second item</div>
  <div>Third item</div>
</SortableList>`,
      },
      {
        label: 'Preact',
        lang: 'tsx',
        code: `import { SortableList } from '@arclux/arc-ui-preact';

<SortableList onArcChange={(e) => console.log(e.detail.order)}>
  <div>First item</div>
  <div>Second item</div>
  <div>Third item</div>
</SortableList>`,
      },
    ],
  
  seeAlso: ["data-table","tree-view"],
};
