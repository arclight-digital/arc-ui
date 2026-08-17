import type { ComponentDef } from './_types';

export const virtualList: ComponentDef = {
  name: 'Virtual List',
  slug: 'virtual-list',
  tag: 'arc-virtual-list',
  tier: 'content',
  interactivity: 'interactive',
  description:
    'Windowed list that renders only visible items for efficient scrolling through thousands of rows. Fixed item height with configurable overscan.',

  overview: `VirtualList renders only the rows that are on screen. A spacer div stands in for the full list height (\`items.length × itemHeight\`), so the scrollbar behaves as if every row existed, while the DOM holds a screenful plus a configurable overscan buffer. Scroll handling is throttled with \`requestAnimationFrame\`. DOM node count stays constant whether the array holds a hundred rows or a million.

**Rows come from one of two places**, because "render a row" means something different inside a framework than outside one.

In plain JS, HTML or Lit, give it a \`renderItem\` callback. It is called only for rows currently on screen, and can return anything Lit can render — a template, a DOM node, a string:

\`\`\`js
list.items = data;
list.renderItem = (item, index) => \`\${index + 1}. \${item.name}\`;
\`\`\`

In a framework, use the wrapper's own idiom — a \`renderItem\` prop in React, Preact and Solid, a \`row\` scoped slot in Vue, a \`row\` snippet in Svelte, a \`rowTemplate\` in Angular. These wrappers are not thin pass-throughs like the rest of the library: each listens for \`arc-range-change\`, tracks the visible range itself, and renders exactly those rows. The element owns the scroll geometry; your framework owns the rows, so a React row is a real React element.

Working directly with the element, you can also drive it yourself: it renders an \`item-N\` slot for each index in the visible range and fires \`arc-range-change\` (with \`{ start, end }\`, \`end\` exclusive) whenever that range moves — once per row crossed, not once per frame. \`visibleRange\` reads the same values on demand, and \`scrollToIndex(n)\` jumps to a row.`,

  features: [
    'Windowed rendering — a row does not exist until it is on screen',
    'Handles hundreds of thousands of items with constant DOM node count',
    '`renderItem` callback for plain JS, HTML and Lit',
    'Framework wrappers render rows natively — real React elements, real Svelte markup',
    '`arc-range-change` fires once per row crossed, not once per frame',
    'rAF-throttled scroll handler for smooth 60fps performance',
    'Configurable overscan buffer to prevent flicker during fast scrolling',
    'Fixed item height for predictable layout calculations',
    '`visibleRange` getter and `scrollToIndex()` for driving it yourself',
    'Exposed CSS parts: spacer, item',
  ],

  guidelines: {
    do: [
      'Use for lists with 100+ items where full DOM rendering would cause jank',
      'Set `item-height` to match the actual rendered height of each item',
      'Use overscan of 3-10 items — higher values reduce flicker but increase DOM nodes',
      'Combine with arc-list-item for consistent styling within the virtual container',
      'Set `items` as a property, not an attribute — an array stringifies as an attribute',
    ],
    dont: [
      'Do not use for short lists under 50 items — the overhead is not worth it',
      'Do not mix different item heights — virtual-list requires fixed row height',
      'Do not nest scrollable containers inside virtual-list items',
      'Do not forget to set a fixed height on the virtual-list host element',
      'Do not put all N items in the light DOM and let the component hide them — that is what this component exists to avoid',
    ],
  },

  previewHtml: `<arc-virtual-list item-height="40" style="height: 200px; width: 100%; border: 1px solid var(--border-default); border-radius: var(--radius-md);" id="vl-demo"></arc-virtual-list>`,

  previewSetup: `{
  const vl = document.getElementById('vl-demo');
  if (!vl) return;

  const rowStyle = 'display:flex;align-items:center;padding:0 16px;height:100%;font-family:var(--font-body);font-size:var(--text-sm);color:var(--text-secondary);border-bottom:1px solid var(--border-subtle);';

  vl.renderItem = (item) => {
    const div = document.createElement('div');
    div.style.cssText = rowStyle;
    div.textContent = item.label;
    return div;
  };

  // Wait for the element to have layout before setting items
  const ro = new ResizeObserver((entries) => {
    if (entries[0].contentRect.height > 0) {
      ro.disconnect();
      vl.items = Array.from({ length: 1000 }, (_, i) => ({ label: 'Item ' + (i + 1) }));
    }
  });
  ro.observe(vl);
}`,

  tabs: [
    {
      label: 'Web Component',
      lang: 'html',
      code: `<arc-virtual-list
  id="my-list"
  item-height="48"
  overscan="5"
  style="height: 400px;"
></arc-virtual-list>

<script type="module">
  const vl = document.getElementById('my-list');

  // Both are properties, not attributes: an array and a function
  // cannot survive being stringified into markup.
  vl.items = Array.from({ length: 10000 }, (_, i) => \`Row \${i + 1}\`);
  vl.renderItem = (item, index) => {
    const div = document.createElement('div');
    div.textContent = \`\${index + 1}. \${item}\`;
    return div;
  };
</script>`,
    },
    {
      label: 'React',
      lang: 'tsx',
      code: `import { VirtualList } from '@arclux/arc-ui-react';

const data = Array.from({ length: 10000 }, (_, i) => ({ name: \`Row \${i + 1}\` }));

function MyVirtualList() {
  return (
    <VirtualList
      items={data}
      itemHeight={48}
      overscan={5}
      style={{ height: '400px' }}
      renderItem={(item, index) => (
        <div className="row">{index + 1}. {item.name}</div>
      )}
    />
  );
}

// renderItem is called only for rows on screen. The wrapper tracks the
// visible range itself, so these are real React elements — hooks, context
// and event handlers all work as they would anywhere else.`,
    },
    {
      label: 'Vue',
      lang: 'html',
      code: `<script setup>
import { VirtualList } from '@arclux/arc-ui-vue';

const items = Array.from({ length: 10000 }, (_, i) => ({
  id: i,
  name: \`Row \${i + 1}\`,
}));
</script>

<template>
  <!-- Rows come from the \`row\` scoped slot, instantiated only when visible -->
  <VirtualList :items="items" :item-height="48" :overscan="5" style="height: 400px">
    <template #row="{ item, index }">
      <div class="row">{{ index + 1 }}. {{ item.name }}</div>
    </template>
  </VirtualList>
</template>`,
    },
    {
      label: 'Svelte',
      lang: 'html',
      code: `<script>
  import { VirtualList } from '@arclux/arc-ui-svelte';

  const items = Array.from({ length: 10000 }, (_, i) => ({
    id: i,
    name: \`Row \${i + 1}\`,
  }));
</script>

<!-- Rows come from the \`row\` snippet, rendered only when visible -->
<VirtualList {items} itemHeight={48} overscan={5} style="height: 400px">
  {#snippet row(item, index)}
    <div class="row">{index + 1}. {item.name}</div>
  {/snippet}
</VirtualList>`,
    },
    {
      label: 'Angular',
      lang: 'ts',
      code: `import { Component } from '@angular/core';
import { VirtualList } from '@arclux/arc-ui-angular';

@Component({
  imports: [VirtualList],
  template: \`
    <arc-virtual-list
      [items]="items"
      [itemHeight]="48"
      [overscan]="5"
      [rowTemplate]="row"
      style="height: 400px"
    >
      <!-- Instantiated only for rows on screen -->
      <ng-template #row let-item let-i="index">
        <div class="row">{{ i + 1 }}. {{ item.name }}</div>
      </ng-template>
    </arc-virtual-list>
  \`,
})
export class LargeListComponent {
  items = Array.from({ length: 10000 }, (_, i) => ({
    id: i,
    name: \`Row \${i + 1}\`,
  }));
}`,
    },
    {
      label: 'Solid',
      lang: 'tsx',
      code: `import { VirtualList } from '@arclux/arc-ui-solid';

const items = Array.from({ length: 10000 }, (_, i) => ({
  id: i,
  name: \`Row \${i + 1}\`,
}));

<VirtualList
  items={items}
  itemHeight={48}
  overscan={5}
  style={{ height: '400px' }}
  renderItem={(item, index) => <div class="row">{index + 1}. {item.name}</div>}
/>`,
    },
    {
      label: 'Preact',
      lang: 'tsx',
      code: `import { VirtualList } from '@arclux/arc-ui-preact';

const items = Array.from({ length: 10000 }, (_, i) => ({
  id: i,
  name: \`Row \${i + 1}\`,
}));

<VirtualList
  items={items}
  itemHeight={48}
  overscan={5}
  style={{ height: '400px' }}
  renderItem={(item, index) => <div class="row">{index + 1}. {item.name}</div>}
/>`,
    },
  ],

  seeAlso: ['list', 'data-grid', 'infinite-scroll'],
};
